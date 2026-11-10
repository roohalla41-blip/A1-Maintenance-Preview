import React, { useState } from 'react';
import { useBankAccounts, useCreateBankAccount, useCurrencies, useBankBalances, useTransactions, usePostDocument, useCustomers } from '@/lib/useSarraaf';
import { PageHeader, BalanceCard, TransactionRow, LoadingState } from '@/components/sarraaf/Pieces';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { AmountInput, CurrencySelect, Field } from '@/components/sarraaf/Fields';
import { TX_TYPE_LABELS } from '@/lib/sarraaf';
import { buildDadogereftLines } from '@/lib/ledgerApi';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
  const [activeSection, setActiveSection] = useState('overview');
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
      amounts[code] = (amounts[code] || 0) + (Number(row.balance ?? row.current_balance) || 0);
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
      <div className="mb-4 flex flex-wrap gap-2">
        <Button size="sm" variant={activeSection === 'overview' ? 'default' : 'outline'} onClick={() => setActiveSection('overview')}>نمای کلی</Button>
        <Button size="sm" variant={activeSection === 'receipts' ? 'default' : 'outline'} onClick={() => setActiveSection('receipts')}>واریز از مشتری</Button>
        <Button size="sm" variant={activeSection === 'payments' ? 'default' : 'outline'} onClick={() => setActiveSection('payments')}>پرداخت به مشتری</Button>
      </div>
      {activeSection !== 'overview' && <BankMovementWorkspace section={activeSection} />}
      {isLoading ? <LoadingState /> : (
        <div className="grid grid-cols-1 gap-1 lg:grid-cols-2 lg:gap-2">
          {(txs || []).filter(transaction => transaction.counter_type === 'bank' || (transaction.lines || []).some(line => line.account_type === 'bank')).slice(0, 20).map(transaction => (
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
function BankMovementWorkspace({ section }) {
  const isReceipt = section === 'receipts';
  const { data: accounts = [] } = useBankAccounts();
  const { data: customers = [] } = useCustomers();
  const { data: currencies = [] } = useCurrencies();
  const { data: balances = [] } = useBankBalances();
  const postMutation = usePostDocument();
  const [accountId, setAccountId] = useState('');
  const [customerId, setCustomerId] = useState('');
  const [currency, setCurrency] = useState('AFN');
  const [amount, setAmount] = useState(0);
  const [description, setDescription] = useState('');

  const selectedAccount = accounts.find(account => String(account.id) === String(accountId));
  const selectedCustomer = customers.find(customer => String(customer.id) === String(customerId));
  const availableBalanceRow = (balances || []).find(row =>
    String(row.account_id ?? row.bank_id) === String(accountId)
    && String(row.currency || 'AFN').toUpperCase() === String(currency).toUpperCase()
  );
  const availableBalance = Number(availableBalanceRow?.balance ?? availableBalanceRow?.current_balance) || 0;

  const handleSubmit = async event => {
    event.preventDefault();
    const numericAmount = Number(amount);
    if (!selectedAccount || !selectedCustomer) {
      toast({ title: 'اطلاعات ناقص است', description: 'حساب بانکی و مشتری را انتخاب کنید.', variant: 'destructive' });
      return;
    }
    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      toast({ title: 'مبلغ نامعتبر است', description: 'مبلغ باید بیشتر از صفر باشد.', variant: 'destructive' });
      return;
    }
    if (String(selectedAccount.currency || 'AFN').toUpperCase() !== String(currency).toUpperCase()) {
      toast({ title: 'ارز حساب مطابقت ندارد', description: `ارز حساب بانکی ${selectedAccount.currency || 'AFN'} است.`, variant: 'destructive' });
      return;
    }
    if (!isReceipt && numericAmount > availableBalance + 0.000001) {
      toast({ title: 'موجودی کافی نیست', description: `مانده حساب بانکی ${availableBalance.toLocaleString()} ${currency} است.`, variant: 'destructive' });
      return;
    }

    const lines = buildDadogereftLines({
      customer_id: selectedCustomer.id,
      customer_name: selectedCustomer.name || selectedCustomer.full_name || 'مشتری',
      direction: isReceipt ? 'in' : 'out',
      currency,
      amount: numericAmount,
      counter_type: 'bank',
      counter_id: selectedAccount.id,
    });
    try {
      const result = await postMutation.mutateAsync({
        doc_type: isReceipt ? 'bank_receipt' : 'bank_payment',
        currency,
        amount: numericAmount,
        related_type: 'customer',
        related_id: selectedCustomer.id,
        related_name: selectedCustomer.name || selectedCustomer.full_name || 'مشتری',
        description: description.trim() || (isReceipt ? 'واریز مشتری به حساب بانکی' : 'پرداخت بانکی به مشتری'),
        client_operation_id: `bank-${section}-${selectedCustomer.id}-${selectedAccount.id}-${Date.now()}`,
        lines,
      });
      toast({ title: isReceipt ? 'واریز ثبت شد' : 'پرداخت بانکی ثبت شد', description: `شماره سند: ${result.document_no || result.doc_number || 'ثبت محلی'}` });
      setAmount(0);
      setDescription('');
    } catch (error) {
      toast({ title: 'ثبت عملیات ناموفق بود', description: error.message, variant: 'destructive' });
    }
  };

  return (
    <section className="mb-4 rounded-2xl border bg-card p-4" dir="rtl">
      <h2 className="mb-3 font-bold">{isReceipt ? 'واریز مشتری به بانک' : 'پرداخت بانکی به مشتری'}</h2>
      <form onSubmit={handleSubmit} className="max-w-2xl space-y-3">
        <Field label="حساب بانکی" required>
          <Select value={accountId} onValueChange={value => {
            setAccountId(value);
            const account = accounts.find(item => String(item.id) === String(value));
            setCurrency(String(account?.currency || 'AFN').toUpperCase());
          }}>
            <SelectTrigger><SelectValue placeholder="انتخاب حساب بانکی" /></SelectTrigger>
            <SelectContent>
              {accounts.map(account => <SelectItem key={account.id} value={String(account.id)}>{account.bank_name} — {account.currency}</SelectItem>)}
            </SelectContent>
          </Select>
        </Field>
        <Field label="مشتری" required>
          <Select value={customerId} onValueChange={setCustomerId}>
            <SelectTrigger><SelectValue placeholder="انتخاب مشتری" /></SelectTrigger>
            <SelectContent>
              {customers.map(customer => <SelectItem key={customer.id} value={String(customer.id)}>{customer.name || customer.full_name || customer.phone || String(customer.id)}</SelectItem>)}
            </SelectContent>
          </Select>
        </Field>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="ارز">
            <CurrencySelect value={currency} onChange={setCurrency} currencies={currencies} disabled={!!selectedAccount} />
          </Field>
          <Field label="مبلغ" required>
            <AmountInput value={amount} onChange={setAmount} />
          </Field>
        </div>
        {!isReceipt && <p className="rounded-lg border bg-muted/40 p-3 text-sm">مانده قابل‌استفاده: <b>{availableBalance.toLocaleString()} {currency}</b></p>}
        <Field label="شرح عملیات">
          <Input value={description} onChange={event => setDescription(event.target.value)} placeholder="توضیحات اختیاری" />
        </Field>
        <Button type="submit" className="w-full" disabled={postMutation.isPending || !accountId || !customerId || Number(amount) <= 0 || (!isReceipt && Number(amount) > availableBalance + 0.000001)}>
          {postMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : isReceipt ? 'ثبت واریز و صدور سند' : 'ثبت پرداخت و صدور سند'}
        </Button>
      </form>
    </section>
  );
}

