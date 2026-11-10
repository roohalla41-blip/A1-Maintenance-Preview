import React, { useMemo, useState } from 'react';
import { useCustomers, useBankAccounts, useAgents, useSafes, useCurrencies, usePostDocument } from '@/lib/useSarraaf';
import { PageHeader } from '@/components/sarraaf/Pieces';
import { AmountInput, CurrencySelect } from '@/components/sarraaf/Fields';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/components/ui/use-toast';
import { BookCopy, Plus, Trash2, Loader2 } from 'lucide-react';

const blankLine = (side = 'debit') => ({
  account_type: 'cash', account_id: '', currency: 'AFN', amount: 0, side, description: '',
});

export default function JournalEntry() {
  const { data: customers = [] } = useCustomers();
  const { data: bankAccounts = [] } = useBankAccounts();
  const { data: agents = [] } = useAgents();
  const { data: safes = [] } = useSafes();
  const { data: currencies = [] } = useCurrencies();
  const postMut = usePostDocument();

  const [description, setDescription] = useState('');
  const [lines, setLines] = useState([blankLine('debit'), blankLine('credit')]);

  const updateLine = (index, field, value) => {
    setLines(current => current.map((line, i) => i === index
      ? { ...line, [field]: value, ...(field === 'account_type' ? { account_id: '' } : {}) }
      : line));
  };

  const addLine = () => setLines(current => [...current, blankLine()]);
  const removeLine = index => setLines(current => current.filter((_, i) => i !== index));

  const balances = useMemo(() => {
    const result = {};
    lines.forEach(line => {
      const code = String(line.currency || 'AFN').toUpperCase();
      if (!result[code]) result[code] = { debit: 0, credit: 0 };
      const value = Number(line.amount) || 0;
      result[code][line.side] += value;
    });
    return result;
  }, [lines]);

  const isBalanced = Object.values(balances).length > 0
    && Object.values(balances).every(balance => Math.abs(balance.debit - balance.credit) <= 0.01);

  const accountOptions = line => {
    if (line.account_type === 'cash') return safes.filter(item => item.active !== false).map(item => ({ id: item.id, name: item.name, currency: item.currency }));
    if (line.account_type === 'bank') return bankAccounts.map(item => ({ id: item.id, name: item.bank_name || item.name || 'حساب بانکی', currency: item.currency }));
    if (line.account_type === 'agent') return agents.map(item => ({ id: item.id, name: item.name || item.full_name || item.phone || String(item.id) }));
    return customers.map(item => ({ id: item.id, name: item.name || item.full_name || item.phone || String(item.id) }));
  };

  const handleSubmit = async event => {
    event.preventDefault();
    if (lines.length < 2) {
      toast({ title: 'سند ناقص است', description: 'حداقل دو ردیف لازم است.', variant: 'destructive' });
      return;
    }
    const invalidIndex = lines.findIndex(line =>
      !line.account_id || !Number.isFinite(Number(line.amount)) || Number(line.amount) <= 0
    );
    if (invalidIndex >= 0) {
      toast({ title: 'اطلاعات ردیف ناقص است', description: `حساب و مبلغ معتبر را در ردیف ${invalidIndex + 1} انتخاب کنید.`, variant: 'destructive' });
      return;
    }
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const selected = accountOptions(line).find(item => String(item.id) === String(line.account_id));
      if (!selected) {
        toast({ title: 'حساب انتخاب‌شده معتبر نیست', description: `حساب ردیف ${i + 1} را دوباره انتخاب کنید.`, variant: 'destructive' });
        return;
      }
      if (selected.currency && String(selected.currency).toUpperCase() !== String(line.currency).toUpperCase()) {
        toast({ title: 'ارز حساب مطابقت ندارد', description: `ارز حساب ردیف ${i + 1} برابر ${selected.currency} است.`, variant: 'destructive' });
        return;
      }
    }
    if (!isBalanced) {
      toast({ title: 'سند تراز نیست', description: 'جمع بدهکار و بستانکار باید برای هر ارز جداگانه برابر باشد.', variant: 'destructive' });
      return;
    }

    const ledgerLines = lines.map((line, index) => {
      const selected = accountOptions(line).find(item => String(item.id) === String(line.account_id));
      return {
        account_type: line.account_type,
        account_id: String(line.account_id),
        account_name: selected?.name || '',
        currency: String(line.currency || 'AFN').toUpperCase(),
        debit: line.side === 'debit' ? Number(line.amount) : 0,
        credit: line.side === 'credit' ? Number(line.amount) : 0,
        description: line.description.trim() || description.trim() || 'سند دستی',
        line_no: index + 1,
      };
    });

    try {
      const headerCurrency = ledgerLines[0].currency;
      const headerAmount = ledgerLines
        .filter(line => line.currency === headerCurrency)
        .reduce((sum, line) => sum + line.debit, 0);
      const result = await postMut.mutateAsync({
        doc_type: 'manual_journal',
        currency: headerCurrency,
        amount: headerAmount,
        description: description.trim() || 'سند دستی',
        lines: ledgerLines,
        client_operation_id: globalThis.crypto?.randomUUID?.() || `manual-${Date.now()}`,
      });
      toast({ title: 'سند دستی ثبت شد', description: `شماره سند: ${result.document_no || result.doc_number || 'ثبت محلی'}` });
      setDescription('');
      setLines([blankLine('debit'), blankLine('credit')]);
    } catch (error) {
      toast({ title: 'ثبت سند ناموفق بود', description: error.message, variant: 'destructive' });
    }
  };

  return (
    <>
      <PageHeader title="سند دستی" icon={BookCopy} />
      <form onSubmit={handleSubmit} className="space-y-3" dir="rtl">
        <Input value={description} onChange={event => setDescription(event.target.value)} placeholder="شرح کلی سند" />
        {lines.map((line, index) => {
          const options = accountOptions(line);
          return (
            <div key={index} className="space-y-2 rounded-xl border p-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium">ردیف {index + 1}</span>
                {lines.length > 2 && (
                  <Button type="button" size="icon" variant="ghost" onClick={() => removeLine(index)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                )}
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Select value={line.account_type} onValueChange={value => updateLine(index, 'account_type', value)}>
                  <SelectTrigger><SelectValue placeholder="نوع حساب" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">صندوق</SelectItem>
                    <SelectItem value="bank">بانک</SelectItem>
                    <SelectItem value="agent">نماینده</SelectItem>
                    <SelectItem value="customer">مشتری</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={String(line.account_id || '')} onValueChange={value => {
                  const selected = options.find(item => String(item.id) === String(value));
                  setLines(current => current.map((item, i) => i === index ? {
                    ...item, account_id: value,
                    ...(selected?.currency ? { currency: String(selected.currency).toUpperCase() } : {}),
                  } : item));
                }}>
                  <SelectTrigger><SelectValue placeholder="انتخاب حساب" /></SelectTrigger>
                  <SelectContent>
                    {options.map(option => (
                      <SelectItem key={option.id} value={String(option.id)}>
                        {option.name}{option.currency ? ` — ${option.currency}` : ''}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Select value={line.side} onValueChange={value => updateLine(index, 'side', value)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="debit">بدهکار</SelectItem>
                    <SelectItem value="credit">بستانکار</SelectItem>
                  </SelectContent>
                </Select>
                <CurrencySelect
                  value={line.currency}
                  onChange={value => updateLine(index, 'currency', value)}
                  currencies={currencies}
                  disabled={['cash', 'bank'].includes(line.account_type) && !!options.find(item => String(item.id) === String(line.account_id))?.currency}
                />
              </div>
              <AmountInput value={line.amount} onChange={value => updateLine(index, 'amount', value)} />
              <Input value={line.description} onChange={event => updateLine(index, 'description', event.target.value)} placeholder="شرح ردیف" />
            </div>
          );
        })}
        <Button type="button" variant="outline" className="w-full" onClick={addLine}>
          <Plus className="h-4 w-4" /> افزودن ردیف
        </Button>
        <div className={`rounded-lg border p-3 text-sm ${isBalanced ? 'text-success' : 'text-destructive'}`}>
          {Object.entries(balances).map(([code, balance]) => (
            <p key={code}>{code}: بدهکار {balance.debit.toLocaleString()} | بستانکار {balance.credit.toLocaleString()} — {Math.abs(balance.debit - balance.credit) <= 0.01 ? 'متوازن' : 'نامتوازن'}</p>
          ))}
        </div>
        <Button type="submit" className="w-full" disabled={postMut.isPending || !isBalanced}>
          {postMut.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'ثبت سند و دفترکل'}
        </Button>
      </form>
    </>
  );
}
