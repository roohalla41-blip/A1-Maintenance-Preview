import React, { useMemo } from 'react';
import { useBankAccounts, useAgents, useCustomers, useCurrencies, useRateSettings, useTreasuryBalances, useBankBalances, useAgentBalances, useCustomerBalances } from '@/lib/useSarraaf';
import { PageHeader, LoadingState } from '@/components/sarraaf/Pieces';
import { formatNumber } from '@/lib/sarraaf';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Scale, Printer, CheckCircle2, AlertCircle, FileSpreadsheet } from 'lucide-react';

// Convert multi-currency balances to AFN using daily rates
function toAfnTotal(balances, rateSettings, currencies) {
  let total = 0;
  for (const [cur, val] of Object.entries(balances)) {
    if (cur === 'AFN') total += val || 0;
    else if (cur === 'USD') total += (val || 0) * parseFloat(rateSettings?.usd_afn || '0');
    else if (cur === 'IRT') {
      const afnToman = parseFloat(rateSettings?.afn_toman || '0');
      total += afnToman > 0 ? (val || 0) / afnToman : 0;
    } else {
      const c = currencies?.find(x => x.code === cur);
      total += (val || 0) * (c?.daily_rate || c?.sell_rate || 0);
    }
  }
  return total;
}

const exportExcel = (label, amounts) => {
  const rows = Object.entries(amounts).map(([cur, val]) => ({ 'ارز': cur, 'مبلغ': val }));
  if (rows.length === 0) return;
  const csv = '\uFEFF' + Object.keys(rows[0]).join(',') + '\n' + rows.map(r => Object.values(r).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url; a.download = `balance-${label}.csv`; a.click();
  URL.revokeObjectURL(url);
};

export default function BalanceSheet() {
  const { data: treasuryData, isLoading } = useTreasuryBalances();
  const { data: bankBalancesData } = useBankBalances();
  const { data: agentBalancesData } = useAgentBalances();
  const { data: customerBalancesData } = useCustomerBalances();
  const { data: bankAccounts } = useBankAccounts();
  const { data: agents } = useAgents();
  const { data: currencies } = useCurrencies();
  const { data: rateSettings } = useRateSettings();
  const rs = rateSettings || {};
  const curs = currencies || [];

  const cash = {};
  for (const row of (treasuryData || [])) {
    const code = String(row.currency || 'AFN').toUpperCase();
    cash[code] = (cash[code] || 0) + (Number(row.balance) || 0);
  }
  const totalCash = toAfnTotal(cash, rs, curs);

  const bankTotalsByAccount = new Map();
  for (const row of (bankBalancesData || [])) {
    const accountId = String(row.account_id ?? row.bank_id ?? '');
    const code = String(row.currency || 'AFN').toUpperCase();
    const account = bankTotalsByAccount.get(accountId) || {};
    account[code] = (account[code] || 0) + (Number(row.balance ?? row.current_balance) || 0);
    bankTotalsByAccount.set(accountId, account);
  }
  const totalBanks = [...bankTotalsByAccount.values()]
    .reduce((sum, amounts) => sum + toAfnTotal(amounts, rs, curs), 0);

  const agentTotalsByAccount = new Map();
  for (const row of (agentBalancesData || [])) {
    const accountId = String(row.account_id ?? row.agent_id ?? '');
    const code = String(row.currency || 'AFN').toUpperCase();
    const account = agentTotalsByAccount.get(accountId) || {};
    account[code] = (account[code] || 0) + (Number(row.balance) || 0);
    agentTotalsByAccount.set(accountId, account);
  }
  const totalAgents = [...agentTotalsByAccount.values()]
    .reduce((sum, amounts) => sum + toAfnTotal(amounts, rs, curs), 0);

  // getBalances() in isolated preview returns debit-credit; legacy server views
  // expose net_balance with the opposite sign convention (credit-debit).
  const normalizedCustomerRows = (customerBalancesData || []).map(row => ({
    currency: String(row.balance_currency || row.currency || 'AFN').toUpperCase(),
    netBalance: row.net_balance !== undefined && row.net_balance !== null
      ? Number(row.net_balance) || 0
      : -(Number(row.balance) || 0),
  }));

  // Positive net balance is a liability (credit owed to the customer).
  const customerLiabilities = useMemo(() => {
    const byCurrency = {};
    for (const row of normalizedCustomerRows) {
      if (row.netBalance > 0) byCurrency[row.currency] = (byCurrency[row.currency] || 0) + row.netBalance;
    }
    return toAfnTotal(byCurrency, rs, curs);
  }, [customerBalancesData, rs, curs]);

  // Negative net balance is a receivable (debit owed by the customer).
  const customerReceivables = useMemo(() => {
    const byCurrency = {};
    for (const row of normalizedCustomerRows) {
      if (row.netBalance < 0) byCurrency[row.currency] = (byCurrency[row.currency] || 0) + Math.abs(row.netBalance);
    }
    return toAfnTotal(byCurrency, rs, curs);
  }, [customerBalancesData, rs, curs]);

  const totalAssets = totalCash + totalBanks + totalAgents + customerReceivables;
  const totalLiabilities = customerLiabilities;
  // Until equity/capital accounts are implemented in the chart of accounts,
  // this is a derived balancing figure, not a verified retained-earnings balance.
  const equity = totalAssets - totalLiabilities;

  const getBankTotal = bankId => bankTotalsByAccount.get(String(bankId)) || {};
  const getAgentTotal = agentId => agentTotalsByAccount.get(String(agentId)) || {};

  return (
    <>
      <PageHeader title="ترازنامه" icon={Scale}
        actions={
          <div className="flex gap-1">
            <Button size="sm" variant="outline" onClick={() => exportExcel('sheet', cash)}><FileSpreadsheet className="w-4 h-4" /></Button>
            <Button size="sm" variant="outline" onClick={() => window.print()}><Printer className="w-4 h-4" /></Button>
          </div>
        }
      />
      {isLoading ? <LoadingState /> : (
        <div className="space-y-4">
          <div className="flex items-center gap-2 rounded-lg border border-warning/40 bg-warning/10 p-3 text-sm">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <span>این گزارش فعلاً نمای اولیهٔ دارایی‌ها و بدهی‌های مشتریان است؛ تا تکمیل حساب‌های سرمایه، درآمد، هزینه و سود انباشته، ترازنامهٔ رسمی و تأییدشده محسوب نمی‌شود.</span>
          </div>

          <Card>
            <CardContent className="p-4">
              <h3 className="text-sm font-semibold mb-2 text-primary">دارایی‌ها</h3>
              <div className="space-y-1">
                <div className="flex justify-between text-sm"><span>صندوق</span><span className="font-mono">{formatNumber(totalCash)}</span></div>
                {(bankAccounts || []).map(b => {
                  const total = toAfnTotal(getBankTotal(b.id), rs, curs);
                  return <div key={b.id} className="flex justify-between text-sm"><span>{b.bank_name}</span><span className="font-mono">{formatNumber(total)} AFN</span></div>;
                })}
                {(agents || []).map(a => {
                  const total = toAfnTotal(getAgentTotal(a.id), rs, curs);
                  return <div key={a.id} className="flex justify-between text-sm"><span>{a.name}</span><span className="font-mono">{formatNumber(total)} AFN</span></div>;
                })}
                <div className="flex justify-between text-sm"><span>طلب از مشتریان</span><span className="font-mono">{formatNumber(customerReceivables)} AFN</span></div>
                <div className="flex justify-between text-sm font-bold border-t pt-1 mt-1"><span>جمع دارایی‌ها</span><span className="font-mono">{formatNumber(totalAssets)}</span></div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <h3 className="text-sm font-semibold mb-2 text-destructive">بدهی‌ها</h3>
              <div className="space-y-1">
                <div className="flex justify-between text-sm"><span>بدهی به مشتریان</span><span className="font-mono">{formatNumber(customerLiabilities)}</span></div>
                <div className="flex justify-between text-sm font-bold border-t pt-1 mt-1"><span>جمع بدهی‌ها</span><span className="font-mono">{formatNumber(totalLiabilities)}</span></div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <h3 className="text-sm font-semibold mb-2 text-success">سرمایه و سود/زیان</h3>
              <div className="space-y-1">
                <div className="flex justify-between text-sm"><span>سرمایه و ماندهٔ محاسباتی (موقت)</span><span className="font-mono">{formatNumber(equity)} AFN</span></div>
                <p className="text-xs text-muted-foreground">این رقم تا زمان تکمیل حساب‌های سرمایه، درآمد، هزینه و سود انباشته، ماندهٔ محاسباتی است و نباید به‌عنوان سرمایهٔ تأییدشده تلقی شود.</p>
                <div className="flex justify-between text-sm font-bold border-t pt-1 mt-1"><span>جمع سرمایهٔ محاسباتی</span><span className="font-mono">{formatNumber(equity)} AFN</span></div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex justify-between text-sm font-bold">
                <span>جمع بدهی‌ها + سرمایهٔ محاسباتی</span>
                <span className="font-mono">{formatNumber(totalLiabilities + equity)} AFN</span>
              </div>
              <div className="flex justify-between text-sm font-bold mt-1">
                <span>جمع دارایی‌ها</span>
                <span className="font-mono">{formatNumber(totalAssets)}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
}