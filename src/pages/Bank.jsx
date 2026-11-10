import React, { useState } from 'react';
import { useBankAccounts, useCreateBankAccount, useCurrencies, useBankBalances, useTransactions, usePostDocument } from '@/lib/useSarraaf';
import { PageHeader, BalanceCard, TransactionRow, LoadingState } from '@/components/sarraaf/Pieces';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { AmountInput, CurrencySelect } from '@/components/sarraaf/Fields';
import { TX_TYPE_LABELS } from '@/lib/sarraaf';
import { Landmark, Plus, Loader2 } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

const emptyForm = () => ({
  bank_name: '', holder: '', card_number: '', account_number: '',
  currency: 'AFN', branch: '', opening_balance: 0,
});

export default function Bank() {
  const { data: txs, isLoading } = useTransactions();
  const { data: bankAccounts } = useBankAccounts();
  const { data: currencies } = useCurrencies();
  const { data: bankBalancesData } = useBankBalances();
  const createMut = useCreateBankAccount();
  const postMut = usePostDocument();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const handleSubmit = async event => {
    event.preventDefault();
    const openingBalance = Number(form.opening_balance || 0);
    if (!form.bank_name.trim() || !form.currency) {
      toast({ title: 'اطلاعات ناقص است', description: 'نام بانک و ارز حساب را وارد کنید.', variant: 'destructive' });
      return;
    }
    if (!Number.isFinite(openingBalance) || openingBalance < 0) {
      toast({ title: 'موجودی افتتاحیه نامعتبر است', description: 'مبلغ باید صفر یا بیشتر باشد.', variant: 'destructive' });
      return;
    }

    try {
      const payload = {
        bank_name: form.bank_name.trim(),
        holder: form.holder.trim(),
        card_number: form.card_number.trim(),
        account_number: form.account_number.trim(),
        currency: form.currency,
        branch: form.branch.trim(),
      };
      const created = await createMut.mutateAsync(payload);
      setDialogOpen(false);
      setForm(emptyForm());

      if (openingBalance > 0) {
        const lines = [
          {
            account_type: 'bank', account_id: String(created.id),
            account_name: payload.bank_name, currency: payload.currency,
            debit: openingBalance, credit: 0,
            description: 'موجودی افتتاحیه حساب بانکی', line_no: 1,
          },
          {
            account_type: 'suspense', account_id: '',
            account_name: 'حساب افتتاحیه', currency: payload.currency,
            debit: 0, credit: openingBalance,
            description: 'طرف مقابل موجودی افتتاحیه بانک', line_no: 2,
          },
        ];
        try {
          const result = await postMut.mutateAsync({
            doc_type: 'bank_opening_balance',
            currency: payload.currency,
            amount: openingBalance,
            related_type: 'bank',
            related_id: created.id,
            related_name: payload.bank_name,
            description: `موجودی افتتاحیه حساب بانکی ${payload.bank_name}`,
            client_operation_id: `bank-opening-${created.id}`,
            lines,
          });
          toast({
            title: 'حساب بانکی و موجودی افتتاحیه ثبت شد',
            description: `شماره سند: ${result.document_no || result.doc_number || 'ثبت محلی'}`,
          });
          return;
        } catch (openingError) {
          toast({
            title: 'حساب بانکی ایجاد شد؛ ثبت موجودی افتتاحیه ناموفق بود',
            description: openingError.message,
            variant: 'destructive',
          });
          return;
        }
      }
      toast({ title: 'حساب بانکی ایجاد شد' });
    } catch (error) {
      toast({ title: 'خطا در ایجاد حساب بانکی', description: error.message, variant: 'destructive' });
    }
  };

  const getBankBalance = bankId => {
    const rows = (bankBalancesData || []).filter(row => String(row.account_id) === String(bankId));
    return rows.reduce((amounts, row) => {
      const code = String(row.currency || 'AFN').toUpperCase();
      amounts[code] = (amounts[code] || 0) + (Number(row.balance) || 0);
      return amounts;
    }, {});
  };

  return (
    <>
      <PageHeader title="بانک" icon={Landmark}
        actions={<Button size="sm" onClick={() => setDialogOpen(true)}><Plus className="h-4 w-4" /> حساب جدید</Button>}
      />
      <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {(bankAccounts || []).length === 0 ? (
          <BalanceCard label="حساب بانکی" amounts={{ AFN: 0 }} />
        ) : (
          bankAccounts.map(account => (
            <BalanceCard key={account.id} label={`${account.bank_name} - ${account.currency}`} amounts={getBankBalance(account.id)} />
          ))
        )}
      </div>
      {isLoading ? <LoadingState /> : (
        <div className="grid grid-cols-1 gap-1 lg:grid-cols-2 lg:gap-2">
          {(txs || []).filter(transaction => transaction.counter_type === 'bank').slice(0, 20).map(transaction => (
            <TransactionRow key={transaction.id} tx={transaction} labels={TX_TYPE_LABELS} />
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>حساب بانکی جدید</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div><Label>نام بانک</Label><Input value={form.bank_name} onChange={event => setForm(current => ({ ...current, bank_name: event.target.value }))} required /></div>
            <div><Label>دارنده حساب</Label><Input value={form.holder} onChange={event => setForm(current => ({ ...current, holder: event.target.value }))} /></div>
            <div className="grid grid-cols-2 gap-2">
              <div><Label>شماره کارت</Label><Input value={form.card_number} onChange={event => setForm(current => ({ ...current, card_number: event.target.value }))} inputMode="numeric" /></div>
              <div><Label>شماره حساب</Label><Input value={form.account_number} onChange={event => setForm(current => ({ ...current, account_number: event.target.value }))} /></div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label>ارز</Label>
                <CurrencySelect value={form.currency} onChange={value => setForm(current => ({ ...current, currency: value }))} currencies={currencies} />
              </div>
              <div><Label>شعبه</Label><Input value={form.branch} onChange={event => setForm(current => ({ ...current, branch: event.target.value }))} /></div>
            </div>
            <div>
              <Label>موجودی افتتاحیه (اختیاری)</Label>
              <AmountInput value={form.opening_balance} onChange={value => setForm(current => ({ ...current, opening_balance: value }))} />
              <p className="mt-1 text-xs text-muted-foreground">در صورت واردکردن مبلغ، سند دوطرفه افتتاحیه در دفترکل ثبت می‌شود.</p>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>انصراف</Button>
              <Button type="submit" disabled={createMut.isPending || postMut.isPending}>
                {createMut.isPending || postMut.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'ایجاد حساب و ثبت'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
