import React, { useState } from 'react';
import CashControlWorkspace from '@/components/sarraaf/CashControlWorkspace';
import CashBlueprintWorkspace from '@/components/sarraaf/CashBlueprintWorkspace';
import { useTransactions, useBankAccounts, useSafes, useCreateSafe, useUpdateSafe, useCurrencies, usePostDocument } from '@/lib/useSarraaf';
import { PageHeader, BalanceCard, TransactionRow, EmptyState, LoadingState } from '@/components/sarraaf/Pieces';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CurrencySelect, AmountInput } from '@/components/sarraaf/Fields';
import { TX_TYPE_LABELS } from '@/lib/sarraaf';
import { buildTransferLines, buildOpeningBalanceLines } from '@/lib/ledgerApi';
import { useTreasuryBalances } from '@/lib/useSarraaf';
import { toast } from '@/components/ui/use-toast';
import { Banknote, ArrowRightLeft, Plus, Pencil, Loader2, WalletCards, ArrowDownUp, Users, Scale, FileBarChart, Settings2, ShieldCheck, History, Vault, ArrowDownToLine, ArrowUpFromLine, Landmark, BookOpen, FileCheck2, ClipboardCheck } from 'lucide-react';

export default function Cash() {
  const { data: txs, isLoading } = useTransactions();
  const { data: bankAccounts } = useBankAccounts();
  const { data: safes, error: safesError } = useSafes();
  const { data: currencies } = useCurrencies();
  const postMut = usePostDocument();
  const createSafeMut = useCreateSafe();
  const updateSafeMut = useUpdateSafe();

  const [activeSection, setActiveSection] = useState('overview');
  const [transferOpen, setTransferOpen] = useState(false);
  const [fromType, setFromType] = useState('cash');
  const [toType, setToType] = useState('bank');
  const [fromBankId, setFromBankId] = useState('');
  const [toBankId, setToBankId] = useState('');
  const [fromSafeId, setFromSafeId] = useState('');
  const [toSafeId, setToSafeId] = useState('');
  const [currency, setCurrency] = useState('AFN');
  const [amount, setAmount] = useState(0);
  const [description, setDescription] = useState('');

  const [safeDialogOpen, setSafeDialogOpen] = useState(false);
  const [editingSafe, setEditingSafe] = useState(null);
  const [safeForm, setSafeForm] = useState({ name: '', currency: 'AFN', opening_balance: 0 });

  const { data: treasuryBalances } = useTreasuryBalances();
  const balances = {};
  for (const b of (treasuryBalances || [])) {
    balances[b.currency] = b.balance;
  }
  const cashTxs = (txs || []).filter(t => t.counter_type === 'cash').slice(0, 20);
  const safeList = safes || [];

  const openSafeDialog = (safe = null) => {
    if (safe) {
      setEditingSafe(safe);
      setSafeForm({ name: safe.name, currency: safe.currency, opening_balance: safe.opening_balance || 0 });
    } else {
      setEditingSafe(null);
      setSafeForm({ name: '', currency: 'AFN', opening_balance: 0 });
    }
    setSafeDialogOpen(true);
  };

  const handleSaveSafe = async (e) => {
    e.preventDefault();
    if (!safeForm.name || !safeForm.currency) return;

    // چند صندوق با ارز یکسان مجاز است؛ هر صندوق شناسه مستقل دارد.

    try {
      if (editingSafe) {
        await updateSafeMut.mutateAsync({ id: editingSafe.id, data: safeForm });
        toast({ title: 'صندوق ویرایش شد' });
      } else {
        const order = safeList.length;
        const created = await createSafeMut.mutateAsync({ ...safeForm, display_order: order, active: true });
        // صندوق ذخیره شده است؛ دیالوگ را می‌بندیم تا تلاش مجدد باعث ایجاد صندوق تکراری نشود.
        setSafeDialogOpen(false);

        if (safeForm.opening_balance && Number(safeForm.opening_balance) > 0) {
          const lines = buildOpeningBalanceLines({
            safe_id: created.id,
            customer_name: safeForm.name,
            currency: safeForm.currency,
            amount: safeForm.opening_balance,
          });
          try {
            await postMut.mutateAsync({
              doc_type: 'open_balance',
              currency: safeForm.currency,
              amount: safeForm.opening_balance,
              related_type: 'safe',
              related_id: created.id,
              related_name: safeForm.name,
              description: `افتتاح صندوق ${safeForm.name}`,
              lines,
            });
          } catch (openingError) {
            toast({
              title: 'صندوق ایجاد شد؛ ثبت موجودی افتتاحیه ناموفق بود',
              description: openingError.message,
              variant: 'destructive',
            });
            return;
          }
        }
        toast({ title: 'صندوق ایجاد شد' });
      }
      setSafeDialogOpen(false);
    } catch (err) {
      toast({ title: 'خطا', description: err.message, variant: 'destructive' });
    }
  };

  const handleTransfer = async (e) => {
    e.preventDefault();
    if (!amount || amount <= 0) return;
    if (fromType === 'bank' && !fromBankId) {
      toast({ title: 'خطا', description: 'حساب بانکی مبدأ را انتخاب کنید', variant: 'destructive' });
      return;
    }
    if (toType === 'bank' && !toBankId) {
      toast({ title: 'خطا', description: 'حساب بانکی مقصد را انتخاب کنید', variant: 'destructive' });
      return;
    }
    if (fromType === 'cash' && !fromSafeId) {
      toast({ title: 'خطا', description: 'صندوق مبدأ را انتخاب کنید', variant: 'destructive' });
      return;
    }
    if (toType === 'cash' && !toSafeId) {
      toast({ title: 'خطا', description: 'صندوق مقصد را انتخاب کنید', variant: 'destructive' });
      return;
    }
    if (fromType === 'cash' && toType === 'cash' && fromSafeId === toSafeId) {
      toast({ title: 'خطا', description: 'صندوق مبدأ و مقصد نمی‌توانند یکسان باشند', variant: 'destructive' });
      return;
    }
    if (fromType === 'bank' && toType === 'bank' && fromBankId === toBankId) {
      toast({ title: 'خطا', description: 'حساب مبدأ و مقصد نمی‌توانند یکسان باشند', variant: 'destructive' });
      return;
    }
    const lines = buildTransferLines({
      from_type: fromType, from_id: fromType === 'bank' ? fromBankId : fromSafeId,
      to_type: toType, to_id: toType === 'bank' ? toBankId : toSafeId,
      currency, amount,
    });
    try {
      await postMut.mutateAsync({
        doc_type: 'internal_transfer',
        currency,
        amount,
        description: description || 'انتقال داخلی',
        lines,
      });
      toast({ title: 'ثبت شد' });
      setTransferOpen(false);
      setAmount(0);
    } catch (err) {
      toast({ title: 'خطا', description: err.message, variant: 'destructive' });
    }
  };

  return (
    <>
      <PageHeader title="صندوق" icon={Banknote}
        actions={
          <>
            <Button size="sm" variant="outline" onClick={() => openSafeDialog(null)}><Plus className="w-4 h-4" /> صندوق جدید</Button>
            <Button size="sm" onClick={() => setTransferOpen(true)}><ArrowRightLeft className="w-4 h-4" /> ثبت جدید</Button>
          </>
        }
      />

      <section className="mb-5 rounded-2xl border bg-card p-3 shadow-sm" aria-label="بخش‌های تخصصی صندوق">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <div>
            <p className="text-sm font-bold">مرکز مدیریت صندوق و وجوه نقد</p>
            <p className="mt-1 text-xs text-muted-foreground">زیرسیستم عملیاتی صندوق، گردش وجوه و کنترل‌های مالی</p>
          </div>
          <span className="rounded-full bg-blue-50 px-2.5 py-1 text-[10px] font-semibold text-blue-700">چندارزی · چندصندوقی</span>
        </div>
        <div className="space-y-3">
          {[
            { title: 'عملیات روزانه', items: [
              ['overview','نمای کلی',WalletCards], ['cashboxes','صندوق‌ها',Vault], ['opening','ثبت اولیه',FileCheck2],
              ['receipts','دریافت به صندوق',ArrowDownToLine], ['payments','پرداخت از صندوق',ArrowUpFromLine], ['movements','گردش وجوه',ArrowDownUp],
            ]},
            { title: 'انتقالات و تطبیق', items: [
              ['transfers','انتقال داخلی',ArrowRightLeft], ['bank','صندوق و بانک',Landmark], ['reconciliation','مغایرت‌گیری',Scale],
            ]},
            { title: 'مدیریت و نظارت', items: [
              ['cashiers','صندوقداران',Users], ['ledger','دفتر و اسناد',BookOpen], ['reports','گزارش‌ها',FileBarChart],
              ['audit','ممیزی',ClipboardCheck], ['controls','کنترل‌ها و تنظیمات',Settings2],
            ]},
          ].map(group => (
            <div key={group.title}>
              <p className="mb-2 text-[11px] font-bold text-muted-foreground">{group.title}</p>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-6">
                {group.items.map(([key,label,Icon]) => (
                  <button key={key} type="button" onClick={() => setActiveSection(key)}
                    aria-pressed={activeSection === key}
                    className={`flex min-h-11 items-center justify-center gap-2 rounded-xl border px-2 py-2 text-xs font-semibold transition-colors ${activeSection === key ? 'border-primary bg-primary text-primary-foreground shadow-sm' : 'border-border bg-background text-muted-foreground hover:bg-muted'}`}>
                    <Icon className="h-4 w-4 shrink-0" /><span>{label}</span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {safesError && (
        <div className="mb-4 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
          خطا در بارگذاری صندوق‌ها: {safesError.message}
        </div>
      )}
      {(activeSection === 'overview' || activeSection === 'cashboxes') && <>
      {/* کارت‌های صندوق */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
        {safeList.length === 0 ? (
          Object.keys(balances).length === 0 ? (
            <BalanceCard label="صندوق" amounts={{ AFN: 0 }} />
          ) : (
            Object.entries(balances).map(([cur, val]) => (
              <BalanceCard key={cur} label={`صندوق ${cur}`} amounts={{ [cur]: val }} />
            ))
          )
        ) : (
          safeList.map(safe => {
            const bal = balances[safe.currency] ?? safe.opening_balance ?? 0;
            return (
              <div key={safe.id} className="relative group">
                <BalanceCard label={safe.name} amounts={{ [safe.currency]: bal }} />
                <button
                  onClick={() => openSafeDialog(safe)}
                  className="absolute top-2 left-2 p-1 rounded-md bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Pencil className="w-3 h-3" />
                </button>
              </div>
            );
          })
        )}
      </div>

      </>}

      {(activeSection === 'overview' || activeSection === 'movements') && <section className="mb-5">
        <div className="mb-2 flex items-center justify-between gap-2"><h3 className="text-sm font-semibold">گردش صندوق و سوابق وجوه</h3><span className="text-[11px] text-muted-foreground">آخرین ۲۰ رویداد نقدی</span></div>
        {isLoading ? <LoadingState /> : cashTxs.length === 0 ? <EmptyState title="تراکنشی نیست" /> : (
          <div className="space-y-1">{cashTxs.map(tx => <TransactionRow key={tx.id} tx={tx} labels={TX_TYPE_LABELS} />)}</div>
        )}
      </section>}

      {['opening','receipts','payments','bank','ledger','audit'].includes(activeSection) && <CashBlueprintWorkspace section={activeSection} />}

      {activeSection === 'transfers' && (
        <section className="mb-5 rounded-2xl border bg-card p-4">
          <h3 className="font-bold">انتقال بین محل‌های نگهداری وجه</h3>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">انتقال کنترل‌شده میان صندوق و حساب بانکی، با ارز یکسان، کنترل مبدأ و مقصد و ثبت سند حسابداری.</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl bg-muted/50 p-3"><p className="text-xs font-semibold">کنترل‌های قبل از ثبت</p><ul className="mt-2 list-disc space-y-1 pr-4 text-xs leading-5 text-muted-foreground"><li>بررسی موجودی قابل‌استفاده مبدأ</li><li>یکسان‌بودن ارز انتقال</li><li>ممنوعیت انتخاب مبدأ و مقصد یکسان</li><li>ثبت شناسه سند و عامل عملیات</li></ul></div>
            <div className="rounded-xl bg-muted/50 p-3"><p className="text-xs font-semibold">گردش ثبت</p><ol className="mt-2 list-decimal space-y-1 pr-4 text-xs leading-5 text-muted-foreground"><li>انتخاب مبدأ و مقصد</li><li>تعیین ارز و مبلغ</li><li>بازبینی اطلاعات</li><li>ثبت سند دوطرفه و به‌روزرسانی مانده‌ها</li></ol></div>
          </div>
          <Button className="mt-4" onClick={() => setTransferOpen(true)}><ArrowRightLeft className="ml-2 h-4 w-4"/> ثبت انتقال داخلی</Button>
        </section>
      )}

      {['cashiers','reconciliation','reports','controls'].includes(activeSection) && (
        <CashControlWorkspace section={activeSection} />
      )}

      {/* دیالوگ انتقال داخلی */}
      <Dialog open={transferOpen} onOpenChange={setTransferOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>انتقال داخلی</DialogTitle></DialogHeader>
          <form onSubmit={handleTransfer} className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label>مبدأ</Label>
                <Select value={fromType} onValueChange={setFromType}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="cash">صندوق</SelectItem><SelectItem value="bank">بانک</SelectItem></SelectContent>
                </Select>
              </div>
              <div>
                <Label>مقصد</Label>
                <Select value={toType} onValueChange={setToType}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="cash">صندوق</SelectItem><SelectItem value="bank">بانک</SelectItem></SelectContent>
                </Select>
              </div>
            </div>
            {fromType === 'cash' && (
              <div>
                <Label>صندوق مبدأ</Label>
                <Select value={fromSafeId} onValueChange={setFromSafeId}>
                  <SelectTrigger><SelectValue placeholder="انتخاب صندوق مبدأ" /></SelectTrigger>
                  <SelectContent>{safeList.filter(s => s.currency === currency && s.active !== false).map(s => <SelectItem key={s.id} value={String(s.id)}>{s.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            )}
            {toType === 'cash' && (
              <div>
                <Label>صندوق مقصد</Label>
                <Select value={toSafeId} onValueChange={setToSafeId}>
                  <SelectTrigger><SelectValue placeholder="انتخاب صندوق مقصد" /></SelectTrigger>
                  <SelectContent>{safeList.filter(s => s.currency === currency && s.active !== false).map(s => <SelectItem key={s.id} value={String(s.id)}>{s.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            )}
            {fromType === 'bank' && (
              <div>
                <Label>حساب بانکی مبدأ</Label>
                <Select value={fromBankId} onValueChange={setFromBankId}>
                  <SelectTrigger><SelectValue placeholder="انتخاب حساب مبدأ" /></SelectTrigger>
                  <SelectContent>
                    {(bankAccounts || []).filter(b => b.currency === currency).map(b => <SelectItem key={b.id} value={String(b.id)}>{b.bank_name} - {b.account_number}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            )}
            {toType === 'bank' && (
              <div>
                <Label>حساب بانکی مقصد</Label>
                <Select value={toBankId} onValueChange={setToBankId}>
                  <SelectTrigger><SelectValue placeholder="انتخاب حساب مقصد" /></SelectTrigger>
                  <SelectContent>
                    {(bankAccounts || []).filter(b => b.currency === currency).map(b => <SelectItem key={b.id} value={String(b.id)}>{b.bank_name} - {b.account_number}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label>ارز</Label>
                <CurrencySelect
                  value={currency}
                  onChange={value => {
                    setCurrency(value);
                    setFromBankId('');
                    setToBankId('');
                    setFromSafeId('');
                    setToSafeId('');
                  }}
                  currencies={currencies}
                />
              </div>
              <div><Label>مبلغ</Label><AmountInput value={amount} onChange={setAmount} /></div>
            </div>
            <div><Label>توضیحات</Label><Input value={description} onChange={e => setDescription(e.target.value)} /></div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setTransferOpen(false)}>پایان</Button>
              <Button type="submit" disabled={postMut.isPending}>{postMut.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'ثبت'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* دیالوگ افزودن/ویرایش صندوق */}
      <Dialog open={safeDialogOpen} onOpenChange={setSafeDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editingSafe ? 'ویرایش صندوق' : 'صندوق جدید'}</DialogTitle></DialogHeader>
          <form onSubmit={handleSaveSafe} className="space-y-3">
            <div><Label>نام صندوق</Label><Input value={safeForm.name} onChange={e => setSafeForm({ ...safeForm, name: e.target.value })} placeholder="صندوق اصلی" required /></div>
            <div>
              <Label>ارز</Label>
              <CurrencySelect
                value={safeForm.currency}
                onChange={v => setSafeForm({ ...safeForm, currency: v })}
                currencies={currencies}
                disabled={!!editingSafe}
              />
              {editingSafe && <p className="text-xs text-muted-foreground mt-1">ارز صندوق پس از ایجاد قابل تغییر نیست</p>}
            </div>
            <div>
              <Label>مبلغ افتتاح صندوق</Label>
              <AmountInput value={safeForm.opening_balance} onChange={v => setSafeForm({ ...safeForm, opening_balance: v })} disabled={!!editingSafe} />
              {editingSafe && <p className="text-xs text-muted-foreground mt-1">مبلغ افتتاح ثابت است و قابل تغییر نیست</p>}
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setSafeDialogOpen(false)}>انصراف</Button>
              <Button type="submit" disabled={createSafeMut.isPending || updateSafeMut.isPending}>
                {(createSafeMut.isPending || updateSafeMut.isPending) ? <Loader2 className="w-4 h-4 animate-spin" /> : 'ذخیره'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}