import React from 'react';
import { useTransactions } from '@/lib/useSarraaf';
import { PageHeader, LoadingState, EmptyState } from '@/components/sarraaf/Pieces';
import { documentBaseBalances } from '@/lib/ledger';
import { formatDate, formatNumber, TX_TYPE_LABELS } from '@/lib/sarraaf';
import { Card, CardContent } from '@/components/ui/card';
import { BookCopy, Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Journal() {
  const { data: documents, isLoading } = useTransactions();

  const groupEntries = (documents || []).map(document => {
    const documentNo = document.document_no || document.doc_number || String(document.id);
    const sourceLines = Array.isArray(document.lines) && document.lines.length
      ? document.lines
      : [document];
    const lines = sourceLines.map(line => ({
      ...line,
      document_no: documentNo,
      date: line.date || document.date || document.created_date,
      type: document.doc_type || document.type || line.type,
      amount: line.amount !== undefined
        ? Number(line.amount) || 0
        : (Number(line.debit) || Number(line.credit) || 0),
      currency: line.currency || document.currency || 'AFN',
      description: line.description || document.description || '',
    }));
    return [documentNo, lines, document];
  }).sort((a, b) => String(b[2]?.date || b[2]?.created_date || '').localeCompare(String(a[2]?.date || a[2]?.created_date || '')));

  return (
    <>
      <PageHeader title="دفتر روزنامه" icon={BookCopy}
        actions={<Button size="sm" variant="outline" onClick={() => window.print()}><Printer className="w-4 h-4" /> چاپ</Button>}
      />
      {isLoading ? <LoadingState /> : groupEntries.length === 0 ? <EmptyState icon={BookCopy} title="سندی وجود ندارد" /> : (
        <div className="space-y-3">
          {groupEntries.map(([docNo, lines, document]) => {
            const balances = documentBaseBalances(lines);
            const isBalanced = lines.length >= 2 && Object.values(balances).every(balance => Math.abs(balance.debit - balance.credit) <= 0.01);
            return (
              <Card key={docNo}>
                <CardContent className="p-3">
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <div>
                      <span className="text-sm font-bold">{docNo}</span>
                      <p className="text-xs text-muted-foreground">{document.description || TX_TYPE_LABELS[document.doc_type || document.type] || document.doc_type || document.type || 'سند حسابداری'}</p>
                    </div>
                    <span className="text-xs text-muted-foreground">{formatDate(document.date || document.created_date)}</span>
                  </div>
                  <div className="space-y-1">
                    {lines.map((line, index) => (
                      <div key={line.id || index} className="grid grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-2 border-b py-2 text-xs last:border-0">
                        <div className="min-w-0">
                          <p className="truncate font-medium">{line.account_name || line.account_type || 'حساب'}</p>
                          <p className="truncate text-muted-foreground">{line.description || '—'}</p>
                        </div>
                        <div className="text-left">
                          <p className="text-muted-foreground">بدهکار</p>
                          <p className="font-mono">{Number(line.debit) > 0 ? `${formatNumber(line.debit, 2)} ${line.currency}` : '—'}</p>
                        </div>
                        <div className="text-left">
                          <p className="text-muted-foreground">بستانکار</p>
                          <p className="font-mono">{Number(line.credit) > 0 ? `${formatNumber(line.credit, 2)} ${line.currency}` : '—'}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className={`mt-2 text-xs font-medium ${isBalanced ? 'text-success' : 'text-destructive'}`}>
                    {isBalanced ? '✓ سند متوازن' : '✗ سند ناقص یا نامتوازن — نیازمند بررسی'}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </>
  );
}
