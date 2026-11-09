import React, { useMemo, useState } from 'react';
import { useCustomers, useSafes, useCurrencies, usePostDocument, useTreasuryBalances } from '@/lib/useSarraaf';
import { buildDadogereftLines } from '@/lib/ledgerApi';
import { Field, AmountInput, CurrencySelect } from '@/components/sarraaf/Fields';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/components/ui/use-toast';
import { ArrowDownToLine, ArrowUpFromLine, Loader2, ShieldCheck } from 'lucide-react';

export default function CashMovementWorkspace({ section }) {
  const isReceipt = section === 'receipts';
  const title = isReceipt ? 'دریافت وجه به صندوق' : 'پرداخت وجه از صندوق';
  const { data: customers = [] } = useCustomers();
  const { data: safes = [] } = useSafes();
  const { data: currencies = [] } = useCurrencies();
  const { data: balances = [] } = useTreasuryBalances();
  const postMutation = usePostDocument();

  const [customerId, setCustomerId] = useState('');
  const [safeId, setSafeId] = useState('');
  const [currency, setCurrency] = useState('AFN');
  const [amount, setAmount] = useState(0);
  const [description, setDescription] = useState('');

  const selectedCustomer = useMemo(
    () => customers.find(item => String(item.id) === String(customerId)),
    [customers, customerId],
  );
  const selectedSafe = useMemo(
    () => safes.find(item => String(item.id) === String(safeId)),
    [safes, safeId],
  );
  const availableBalance = useMemo(() => {
    const row = balances.find(item =>
      item.account_type === 'cash'
      && String(item.account_id) === String(safeId)
      && String(item.currency || 'AFN').toUpperCase() === String(currency).toUpperCase()
    );
    return Number(row?.balance) || 0;
  }, [balances, safeId, currency]);

  const handleSubmit = async event => {
    event.preventDefault();
    const numericAmount = Number(amount);
    if (!selectedCustomer || !selectedSafe) {
      toast({ title: 'اطلاعات ناقص است', description: 'مشتری و صندوق را انتخاب کنید.', variant: 'destructive' });
      return;
    }
    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      toast({ title: 'مبلغ نامعتبر است', description: 'مبلغ باید بیشتر از صفر باشد.', variant: 'destructive' });
      return;
    }
    if (!isReceipt && numericAmount > availableBalance + 0.000001) {
      toast({
        title: 'موجودی کافی نیست',
        description: `مانده قابل‌استفاده این صندوق ${availableBalance.toLocaleString()} ${currency} است.`,
        variant: 'destructive',
      });
      return;
    }

    const lines = buildDadogereftLines({
      customer_id: selectedCustomer.id,
      customer_name: selectedCustomer.name || selectedCustomer.full_name || 'مشتری',
      direction: isReceipt ? 'in' : 'out',
      currency,
      amount: numericAmount,
      counter_type: 'cash',
      counter_id: selectedSafe.id,
    });

    try {
      const result = await postMutation.mutateAsync({
        doc_type: isReceipt ? 'cash_receipt' : 'cash_payment',
        currency,
        amount: numericAmount,
        related_type: 'customer',
        related_id: selectedCustomer.id,
        related_name: selectedCustomer.name || selectedCustomer.full_name || 'مشتری',
        description: description.trim() || (isReceipt ? 'دریافت وجه از مشتری' : 'پرداخت وجه به مشتری'),
        client_operation_id: `cash-${section}-${selectedCustomer.id}-${selectedSafe.id}-${Date.now()}`,
        lines,
      });
      toast({
        title: isReceipt ? 'دریافت ثبت شد' : 'پرداخت ثبت شد',
        description: `شماره سند: ${result.document_no || result.doc_number || 'ثبت محلی'}`,
      });
      setAmount(0);
      setDescription('');
    } catch (error) {
      toast({ title: 'ثبت عملیات ناموفق بود', description: error.message, variant: 'destructive' });
    }
  };

  const Icon = isReceipt ? ArrowDownToLine : ArrowUpFromLine;
  return (
    <section className="space-y-4 rounded-2xl border bg-card p-4" dir="rtl">
      <header className="flex items-start gap-3">
        <div className="rounded-xl bg-primary/10 p-3 text-primary"><Icon className="h-6 w-6" /></div>
        <div className="min-w-0 flex-1">
          <h2 className="font-bold">{title}</h2>
          <p className="mt-1 text-xs leading-6 text-muted-foreground">
            عملیات به‌صورت محلی ثبت می‌شود و هم‌زمان سند دوطرفه در دفترکل آزمایشی ایجاد می‌کند.
          </p>
        </div>
      </header>

      <form onSubmit={handleSubmit} className="max-w-2xl space-y-4">
        <Field label="مشتری" required>
          <Select value={customerId} onValueChange={setCustomerId}>
            <SelectTrigger><SelectValue placeholder="انتخاب مشتری" /></SelectTrigger>
            <SelectContent>
              {customers.map(customer => (
                <SelectItem key={customer.id} value={String(customer.id)}>
                  {customer.name || customer.full_name || customer.phone || String(customer.id)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>

        <Field label="صندوق" required>
          <Select value={safeId} onValueChange={setSafeId}>
            <SelectTrigger><SelectValue placeholder="انتخاب صندوق" /></SelectTrigger>
            <SelectContent>
              {safes.filter(safe => safe.active !== false).map(safe => (
                <SelectItem key={safe.id} value={String(safe.id)}>
                  {safe.name} — {safe.currency || 'AFN'}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>

        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="ارز" required>
            <CurrencySelect value={currency} onChange={setCurrency} currencies={currencies} />
          </Field>
          <Field label="مبلغ" required>
            <AmountInput value={amount} onChange={setAmount} />
          </Field>
        </div>

        {!isReceipt && (
          <div className="rounded-lg border bg-muted/40 p-3 text-sm">
            مانده قابل‌استفاده صندوق: <b>{availableBalance.toLocaleString()} {currency}</b>
          </div>
        )}

        <Field label="شرح عملیات">
          <Input value={description} onChange={event => setDescription(event.target.value)} placeholder="توضیحات اختیاری" />
        </Field>

        {safes.length === 0 && (
          <p className="rounded-lg border border-amber-300 bg-amber-50 p-3 text-xs leading-6 text-amber-900">
            ابتدا از بخش «صندوق‌ها» یک صندوق بسازید و در صورت نیاز موجودی افتتاحیه ثبت کنید.
          </p>
        )}

        <Button type="submit" className="w-full" disabled={postMutation.isPending || !customerId || !safeId || Number(amount) <= 0 || (!isReceipt && Number(amount) > availableBalance + 0.000001)}>
          {postMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Icon className="h-4 w-4" />}
          {isReceipt ? 'ثبت دریافت و صدور سند' : 'ثبت پرداخت و صدور سند'}
        </Button>
      </form>

      <div className="flex items-start gap-2 rounded-xl border bg-muted/30 p-3 text-xs leading-6 text-muted-foreground">
        <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" />
        <p>ثبت موفق فقط زمانی اعلام می‌شود که سند و ردیف‌های بدهکار و بستانکار با هم در حافظه محلی ذخیره شوند. این محیط آزمایشی است و به هیچ پایگاه داده‌ای متصل نیست.</p>
      </div>
    </section>
  );
}
