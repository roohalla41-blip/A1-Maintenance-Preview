// ledgerApi.js — Direct Supabase financial operations (no Base44 backend function)
//
// تمام عملیات مالی مستقیماً از طریق کلاینت Supabase انجام می‌شوند.
// tenant isolation از طریق RLS policies (x-app-token header) تأمین می‌شود.
// عملیات اتمیک از طریق توابع RPC موجود در Supabase انجام می‌شوند.

import { supabase } from './supabaseClient';
import { getExchangeCode, listTransactions } from './supabaseApi';

// ─ـ Helper: get current user from session ──
function getSessionUser() {
  try {
    const userStr = localStorage.getItem('auth_user');
    if (userStr) return JSON.parse(userStr);
  } catch { /* ignore */ }
  return null;
}

function isPreviewOnly() {
  return typeof window !== 'undefined' && window.__SUPABASE_CONFIG__?.previewOnly === true;
}

function getPreviewTenant() {
  try {
    const user = JSON.parse(localStorage.getItem('auth_user') || 'null');
    if (!user || !String(localStorage.getItem('auth_token') || '').startsWith('preview_demo_')) return null;
    return { user, code: user.exchange_code || 'PREVIEW-EX-001' };
  } catch { return null; }
}

function readPreviewRows(entity) {
  const tenant = getPreviewTenant();
  if (!tenant) return [];
  try {
    return JSON.parse(localStorage.getItem(`cache_v2_${entity}_${tenant.code}`) || '[]');
  } catch { return []; }
}

function writePreviewRows(entity, rows) {
  const tenant = getPreviewTenant();
  if (!tenant) throw new Error('ورود آزمایشی صراف معتبر نیست');
  localStorage.setItem(`cache_v2_${entity}_${tenant.code}`, JSON.stringify(rows));
}

function previewId(prefix = 'preview') {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function nextPreviewNumber(entity, field, prefix, width) {
  const rows = readPreviewRows(entity);
  let max = 0;
  rows.forEach(row => {
    const match = String(row[field] || '').match(/(\\d+)$/);
    if (match) max = Math.max(max, Number(match[1]));
  });
  return `${prefix}-${String(max + 1).padStart(width, '0')}`;
}

function getSessionUserId() {
  try {
    const token = localStorage.getItem('auth_token');
    if (!token) return null;
    const parts = token.split('.');
    if (parts.length < 2) return null;
    let b64 = parts[0].replace(/-/g, '+').replace(/_/g, '/');
    while (b64.length % 4) b64 += '=';
    const payload = JSON.parse(atob(b64));
    return payload.uid ? String(payload.uid) : null;
  } catch { return null; }
}

// ── Post Document (document + ledger lines) — atomic Supabase RPC ──
export async function postDocument({ doc_type, currency, amount, fee, related_type, related_id, related_name, description, lines, transfer_id, client_operation_id, exchange_code }) {
  const ec = exchange_code || getExchangeCode();
  if (!ec) throw new Error('کد صرافی معتبر نیست؛ لطفاً دوباره وارد شوید');
  if (!Array.isArray(lines) || lines.length === 0) {
    throw new Error('برای ثبت سند، ردیف‌های دفترکل الزامی است');
  }

  const numericAmount = Number(amount);
  const numericFee = Number(fee) || 0;
  if (!Number.isFinite(numericAmount) || !Number.isFinite(numericFee)) {
    throw new Error('مبلغ یا کارمزد معتبر نیست');
  }

  const userIdRaw = getSessionUserId();
  const userId = userIdRaw && Number.isFinite(Number(userIdRaw)) ? Number(userIdRaw) : null;
  const user = getSessionUser();
  const userName = user?.full_name || user?.name || '';

  // Keep idempotency keys tenant-scoped because the database key is globally unique.
  const localOperationId = client_operation_id ||
    (globalThis.crypto?.randomUUID?.() || `op-${Date.now()}-${Math.random().toString(36).slice(2)}`);
  const operationId = `${ec}:${localOperationId}`;

  if (isPreviewOnly()) {
    const tenant = getPreviewTenant();
    if (!tenant) throw new Error('نشست آزمایشی معتبر نیست');
    const now = new Date().toISOString();
    const docNo = nextPreviewNumber('Transaction', 'document_no', 'DV', 5);
    const doc = {
      id: previewId('preview-doc'), exchange_code: tenant.code, doc_number: docNo, document_no: docNo,
      doc_type: doc_type || 'manual', type: doc_type || 'manual', amount: numericAmount,
      currency: currency || 'AFN', fee: numericFee, related_type: related_type || 'none',
      related_id: related_id || null, customer_id: related_id ? String(related_id) : null,
      related_name: related_name || '', customer_name: related_name || '',
      description: description || '', registered_by: tenant.user.full_name || 'صراف آزمایشی',
      transfer_id: transfer_id || null, created_at: now, created_date: now, date: now.slice(0, 10),
      updated_at: now, deleted: false, preview_only: true,
    };
    const docs = readPreviewRows('Transaction');
    docs.unshift(doc);
    writePreviewRows('Transaction', docs);
    const entries = readPreviewRows('LedgerEntry');
    rpcLines.forEach((line, index) => entries.unshift({
      id: previewId('preview-ledger'), exchange_code: tenant.code, document_id: doc.id,
      document_no: docNo, line_no: index + 1, ...line, created_date: now, deleted: false,
    }));
    writePreviewRows('LedgerEntry', entries);
    return { id: doc.id, doc_number: docNo, document_no: docNo, idempotent: false, preview_only: true };
  }

  const rpcLines = lines.map((line, index) => ({
    account_type: line.account_type || 'cash',
    account_id: line.account_id === undefined || line.account_id === null ? '' : String(line.account_id),
    account_name: line.account_name || '',
    currency: line.currency || currency,
    debit: Number(line.debit) || 0,
    credit: Number(line.credit) || 0,
    rate: line.rate === undefined || line.rate === null ? null : Number(line.rate),
    pair_entry_id: line.pair_entry_id || null,
    description: line.description || '',
    line_no: Number(line.line_no ?? line.doc_line_no ?? index + 1),
  }));

  const { data, error } = await supabase.rpc('post_document_transaction', {
    p_exchange_code: ec,
    p_doc_type: doc_type,
    p_currency: currency,
    p_amount: numericAmount,
    p_fee: numericFee,
    p_related_type: related_type || 'none',
    p_related_id: related_id ? Number(related_id) : null,
    p_related_name: related_name || null,
    p_description: description || '',
    p_registered_by: userName,
    p_lines: rpcLines,
    p_transfer_id: transfer_id ? Number(transfer_id) : null,
    p_user_id: userId,
    p_client_operation_id: operationId,
  });

  if (error) throw new Error(error.message || 'postDocument_failed');
  if (!data) throw new Error('postDocument_no_result');
  return {
    id: data.document_id,
    doc_number: data.doc_number || null,
    idempotent: !!data.idempotent,
  };
}

// ── Post Transfer (atomic Supabase RPC) ──
export async function postTransfer({ direction, sender_name, sender_phone, receiver_name, receiver_phone, destination, origin, amount, currency, rate, fee, fee_currency, description, client_operation_id, exchange_code, customer_id, agent_id }) {
  const ec = exchange_code || getExchangeCode();
  if (!ec) throw new Error('کد صرافی معتبر نیست؛ لطفاً دوباره وارد شوید');

  const numericAmount = Number(amount);
  const numericFee = Number(fee) || 0;
  if (!Number.isFinite(numericAmount) || !Number.isFinite(numericFee)) {
    throw new Error('مبلغ یا کارمزد معتبر نیست');
  }

  if (isPreviewOnly()) {
    const tenant = getPreviewTenant();
    if (!tenant) throw new Error('نشست آزمایشی معتبر نیست');
    const now = new Date().toISOString();
    const transferNo = nextPreviewNumber('Transfer', 'transfer_no', direction === 'send' ? 'S' : 'R', 4);
    const item = {
      id: previewId('preview-transfer'), exchange_code: tenant.code, transfer_no: transferNo,
      direction, sender_name: sender_name || '', sender_phone: sender_phone || '',
      receiver_name: receiver_name || '', receiver_phone: receiver_phone || '',
      destination: destination || '', origin: origin || '', amount: numericAmount,
      currency: currency || 'AFN', rate: rate ? Number(rate) : null, fee: numericFee,
      fee_currency: fee_currency || currency || 'AFN', description: description || '',
      customer_id: customer_id || null, agent_id: agent_id || null, status: 'registered',
      created_date: now, updated_date: now, preview_only: true,
    };
    const rows = readPreviewRows('Transfer');
    rows.unshift(item);
    writePreviewRows('Transfer', rows);
    return { ...item, success: true, preview_only: true };
  }

  const userIdRaw = getSessionUserId();
  const userId = userIdRaw && Number.isFinite(Number(userIdRaw)) ? Number(userIdRaw) : null;
  const user = getSessionUser();
  const userName = user?.full_name || user?.name || '';
  const localOperationId = client_operation_id ||
    (globalThis.crypto?.randomUUID?.() || `op-${Date.now()}-${Math.random().toString(36).slice(2)}`);

  const { data, error } = await supabase.rpc('post_transfer_transaction_v2', {
    p_exchange_code: ec,
    p_direction: direction,
    p_sender_name: sender_name || '',
    p_sender_phone: sender_phone || '',
    p_receiver_name: receiver_name || '',
    p_receiver_phone: receiver_phone || '',
    p_destination: destination || '',
    p_origin: origin || '',
    p_amount: numericAmount,
    p_currency: currency || 'AFN',
    p_rate: rate ? Number(rate) : null,
    p_fee: numericFee,
    p_fee_currency: fee_currency || null,
    p_description: description || '',
    p_registered_by: userName,
    p_doc_type: 'transfer',
    p_user_id: userId,
    p_client_operation_id: `${ec}:${localOperationId}`,
    p_customer_id: customer_id ? Number(customer_id) : null,
    p_agent_id: agent_id ? Number(agent_id) : null,
  });

  if (error) throw new Error(error.message || 'postTransfer_failed');
  if (!data) throw new Error('postTransfer_no_result');
  return data;
}

// ── Reverse Document (via Supabase RPC) ──
export async function reverseDocument(document_id, reason, exchange_code) {
  if (isPreviewOnly()) {
    const docs = readPreviewRows('Transaction');
    const index = docs.findIndex(row => String(row.id) === String(document_id));
    if (index < 0) throw new Error('سند در داده‌های آزمایشی پیدا نشد');
    docs[index] = { ...docs[index], deleted: true, deleted_date: new Date().toISOString(), delete_reason: reason || '' };
    writePreviewRows('Transaction', docs);
    const entries = readPreviewRows('LedgerEntry').map(row =>
      String(row.document_id) === String(document_id) ? { ...row, deleted: true } : row
    );
    writePreviewRows('LedgerEntry', entries);
    return { success: true, preview_only: true };
  }
  try {
    const { data, error } = await supabase.rpc('reverse_document_transaction', {
      p_document_id: document_id,
      p_reason: reason || '',
      p_exchange_code: exchange_code || getExchangeCode(),
    });

    if (error) {
      // Fallback: soft-delete document directly
      if (error.message?.includes('Could not find the function') || error.code === '42883') {
        const { error: updateError } = await supabase
          .from('documents')
          .update({ deleted: true, deleted_date: new Date().toISOString() })
          .eq('id', document_id);
        if (updateError) throw new Error(updateError.message || 'reverseDocument_failed');
        return { success: true };
      }
      throw new Error(error.message || 'reverseDocument_failed');
    }

    return data || { success: true };
  } catch (err) {
    throw new Error(err.message || 'reverseDocument_failed');
  }
}

// ── Edit Document (via Supabase RPC) ──
export async function editDocument({ document_id, description, amount, currency, edit_note, new_lines, exchange_code }) {
  if (isPreviewOnly()) {
    const docs = readPreviewRows('Transaction');
    const index = docs.findIndex(row => String(row.id) === String(document_id));
    if (index < 0) throw new Error('سند در داده‌های آزمایشی پیدا نشد');
    const now = new Date().toISOString();
    docs[index] = {
      ...docs[index],
      ...(description !== undefined ? { description } : {}),
      ...(amount !== undefined ? { amount: Number(amount) } : {}),
      ...(currency !== undefined ? { currency } : {}),
      edited: true, edited_date: now, edit_note: edit_note || '', updated_date: now,
    };
    writePreviewRows('Transaction', docs);
    if (Array.isArray(new_lines)) {
      const retained = readPreviewRows('LedgerEntry').filter(row => String(row.document_id) !== String(document_id));
      new_lines.forEach((line, i) => retained.unshift({
        id: previewId('preview-ledger'), document_id, document_no: docs[index].document_no,
        line_no: i + 1, ...line, created_date: now, deleted: false,
      }));
      writePreviewRows('LedgerEntry', retained);
    }
    return { success: true, preview_only: true };
  }
  try {
    const { data, error } = await supabase.rpc('edit_document_transaction', {
      p_document_id: document_id,
      p_description: description || '',
      p_amount: amount ? Number(amount) : null,
      p_currency: currency || null,
      p_edit_note: edit_note || '',
      p_new_lines: new_lines || [],
      p_exchange_code: exchange_code || getExchangeCode(),
    });

    if (error) {
      // Fallback: direct update
      if (error.message?.includes('Could not find the function') || error.code === '42883') {
        const updates = {};
        if (description !== undefined) updates.description = description;
        if (amount !== undefined) updates.amount = Number(amount);
        if (currency !== undefined) updates.currency = currency;
        updates.edited = true;
        updates.edited_date = new Date().toISOString();
        updates.edit_note = edit_note || '';

        const { error: updateError } = await supabase
          .from('documents')
          .update(updates)
          .eq('id', document_id);
        if (updateError) throw new Error(updateError.message || 'editDocument_failed');
        return { success: true };
      }
      throw new Error(error.message || 'editDocument_failed');
    }

    return data || { success: true };
  } catch (err) {
    throw new Error(err.message || 'editDocument_failed');
  }
}

// ── Get Balances (from SQL views, direct query) ──
const VIEW_MAP = {
  treasury: 'v_treasury_balances',
  bank: 'v_bank_balances',
  customer: 'v_customer_balances',
  wallet: 'v_wallet_balances',
  agent: 'v_agent_balances',
  profit_loss: 'v_profit_loss',
  currency: 'v_currency_balances',
  exchange_summary: 'v_exchange_summary',
};

export async function getBalances(balance_type, params = {}) {
  if (isPreviewOnly()) {
    const entries = readPreviewRows('LedgerEntry').filter(row => !row.deleted);
    const typeMap = { treasury: ['cash', 'safe', 'treasury'], bank: ['bank'], customer: ['customer'], wallet: ['wallet'], agent: ['agent'], profit_loss: ['fee', 'income', 'expense'], currency: ['cash', 'bank', 'customer'], exchange_summary: ['cash', 'bank', 'customer'] };
    const allowed = typeMap[balance_type];
    if (!allowed) throw new Error('invalid_balance_type');
    const totals = new Map();
    entries.filter(row => allowed.includes(row.account_type)).forEach(row => {
      if (Object.entries(params || {}).some(([k, v]) => v !== undefined && v !== null && v !== '' && String(row[k]) !== String(v))) return;
      const key = `${row.account_type}::${row.account_id || ''}::${row.currency || 'AFN'}`;
      const current = totals.get(key) || { account_type: row.account_type, account_id: row.account_id, account_name: row.account_name, currency: row.currency || 'AFN', debit: 0, credit: 0, balance: 0 };
      current.debit += Number(row.debit) || 0;
      current.credit += Number(row.credit) || 0;
      current.balance = current.debit - current.credit;
      totals.set(key, current);
    });
    return [...totals.values()];
  }
  try {
    const view = VIEW_MAP[balance_type];
    if (!view) throw new Error('invalid_balance_type');

    const ec = getExchangeCode();
    let query = supabase.from(view).select('*');

    // Filter by exchange_code if the view has it
    if (ec) {
      query = query.eq('exchange_code', ec);
    }

    // Apply additional filters
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null && value !== '') {
        query = query.eq(key, value);
      }
    }

    const { data, error } = await query.limit(500);
    if (error) throw new Error(error.message || 'getBalances_failed');
    return data || [];
  } catch (err) {
    throw new Error(err.message || 'getBalances_failed');
  }
}

// ── List Documents (with ledger lines) ──
export async function listDocuments(filters = {}, sort, limit) {
  return listTransactions(filters, sort, limit);
}

// ── Balance helpers ──
export function fetchTreasuryBalances() { return getBalances('treasury'); }
export function fetchBankBalances() { return getBalances('bank'); }
export function fetchCustomerBalances() { return getBalances('customer'); }
export function fetchWalletBalances() { return getBalances('wallet'); }
export function fetchAgentBalances() { return getBalances('agent'); }
export function fetchProfitLoss() { return getBalances('profit_loss'); }
export function fetchCurrencyBalances() { return getBalances('currency'); }
export function fetchExchangeSummary() { return getBalances('exchange_summary'); }

// ── Line builders (construct ledger lines for common operations) ──

export function buildBuyLines({ customer_id, customer_name, currency, amount, paid_amount, paid_currency, fee, fee_currency }) {
  const lines = [
    { account_type: 'cash', account_id: paid_currency, account_name: 'صندوق', currency: paid_currency, debit: Number(paid_amount), credit: 0, description: `دریافت ${paid_currency} از صندوق`, line_no: 1 },
    { account_type: 'customer', account_id: String(customer_id), account_name: customer_name, currency: paid_currency, debit: 0, credit: Number(paid_amount), description: `بستانکاری ${customer_name}`, line_no: 2 },
    { account_type: 'cash', account_id: currency, account_name: 'صندوق', currency, debit: Number(amount), credit: 0, description: `دریافت ${currency} در صندوق`, line_no: 3 },
    { account_type: 'customer', account_id: String(customer_id), account_name: customer_name, currency, debit: 0, credit: Number(amount), description: `بدهکاری ${customer_name}`, line_no: 4 },
  ];
  if (fee && Number(fee) > 0) {
    lines.push(
      { account_type: 'fee', account_id: String(customer_id), account_name: 'کارمزد', currency: fee_currency || paid_currency, debit: Number(fee), credit: 0, description: 'کارمزد خرید', line_no: 5 },
      { account_type: 'customer', account_id: String(customer_id), account_name: customer_name, currency: fee_currency || paid_currency, debit: 0, credit: Number(fee), description: 'کارمزد از مشتری', line_no: 6 },
    );
  }
  return lines;
}

export function buildSellLines({ customer_id, customer_name, currency, amount, received_amount, received_currency, fee, fee_currency }) {
  const lines = [
    { account_type: 'customer', account_id: String(customer_id), account_name: customer_name, currency: received_currency, debit: Number(received_amount), credit: 0, description: `بدهکاری ${customer_name}`, line_no: 1 },
    { account_type: 'cash', account_id: received_currency, account_name: 'صندوق', currency: received_currency, debit: 0, credit: Number(received_amount), description: `پرداخت ${received_currency} از صندوق`, line_no: 2 },
    { account_type: 'customer', account_id: String(customer_id), account_name: customer_name, currency, debit: 0, credit: Number(amount), description: `بستانکاری ${customer_name}`, line_no: 3 },
    { account_type: 'cash', account_id: currency, account_name: 'صندوق', currency, debit: 0, credit: Number(amount), description: `تحویل ${currency} از صندوق`, line_no: 4 },
  ];
  if (fee && Number(fee) > 0) {
    lines.push(
      { account_type: 'customer', account_id: String(customer_id), account_name: customer_name, currency: fee_currency || received_currency, debit: Number(fee), credit: 0, description: 'کارمزد به عهده مشتری', line_no: 5 },
      { account_type: 'fee', account_id: String(customer_id), account_name: 'کارمزد', currency: fee_currency || received_currency, debit: 0, credit: Number(fee), description: 'سود کارمزد صراف', line_no: 6 },
    );
  }
  return lines;
}

export function buildDadogereftLines({ customer_id, customer_name, direction, currency, amount, counter_type, counter_id }) {
  const isIn = direction === 'in' || direction === 'receive';
  const cashAccount = counter_type === 'bank' ? 'bank' : 'cash';
  const lines = isIn ? [
    { account_type: cashAccount, account_id: counter_id ? String(counter_id) : currency, account_name: counter_type === 'bank' ? 'بانک' : 'صندوق', currency, debit: Number(amount), credit: 0, description: `دریافت از ${customer_name}`, line_no: 1 },
    { account_type: 'customer', account_id: String(customer_id), account_name: customer_name, currency, debit: 0, credit: Number(amount), description: `بستانکاری ${customer_name}`, line_no: 2 },
  ] : [
    { account_type: 'customer', account_id: String(customer_id), account_name: customer_name, currency, debit: Number(amount), credit: 0, description: `بدهکاری ${customer_name}`, line_no: 1 },
    { account_type: cashAccount, account_id: counter_id ? String(counter_id) : currency, account_name: counter_type === 'bank' ? 'بانک' : 'صندوق', currency, debit: 0, credit: Number(amount), description: `پرداخت به ${customer_name}`, line_no: 2 },
  ];
  return lines;
}

export function buildTransferLines({ from_type, from_id, to_type, to_id, currency, amount, rate, pair_currency, pair_amount }) {
  const lines = [];
  if (pair_currency && pair_amount && pair_currency !== currency) {
    lines.push(
      { account_type: from_type, account_id: String(from_id), account_name: from_type === 'bank' ? 'بانک' : 'صندوق', currency, debit: 0, credit: Number(amount), description: `خروج ${currency} از ${from_type}`, line_no: 1, rate: rate || null },
      { account_type: to_type, account_id: String(to_id), account_name: to_type === 'bank' ? 'بانک' : 'صندوق', currency: pair_currency, debit: Number(pair_amount), credit: 0, description: `ورود ${pair_currency} به ${to_type}`, line_no: 2, rate: rate || null },
    );
  } else {
    lines.push(
      { account_type: from_type, account_id: String(from_id), account_name: from_type === 'bank' ? 'بانک' : 'صندوق', currency, debit: 0, credit: Number(amount), description: `خروج از ${from_type}`, line_no: 1 },
      { account_type: to_type, account_id: String(to_id), account_name: to_type === 'bank' ? 'بانک' : 'صندوق', currency, debit: Number(amount), credit: 0, description: `ورود به ${to_type}`, line_no: 2 },
    );
  }
  return lines;
}

export function buildConversionLines({ from_currency, from_amount, to_currency, to_amount, rate }) {
  return [
    { account_type: 'cash', account_id: from_currency, account_name: 'صندوق', currency: from_currency, debit: 0, credit: Number(from_amount), description: `خروج ${from_currency} از صندوق`, line_no: 1, rate: rate || null },
    { account_type: 'cash', account_id: to_currency, account_name: 'صندوق', currency: to_currency, debit: Number(to_amount), credit: 0, description: `ورود ${to_currency} به صندوق`, line_no: 2, rate: rate || null },
  ];
}

export function buildWalletTopupLines({ wallet_id, wallet_owner, currency, amount }) {
  return [
    { account_type: 'cash', account_id: currency, account_name: 'صندوق', currency, debit: 0, credit: Number(amount), description: 'کاهش صندوق — شارژ کیف پول', line_no: 1 },
    { account_type: 'wallet', account_id: String(wallet_id), account_name: wallet_owner === 'exchange' ? 'کیف پول صراف' : 'کیف پول مشتری', currency, debit: Number(amount), credit: 0, description: 'افزایش موجودی کیف پول', line_no: 2 },
  ];
}

export function buildWalletWithdrawLines({ wallet_id, wallet_owner, currency, amount }) {
  return [
    { account_type: 'wallet', account_id: String(wallet_id), account_name: wallet_owner === 'exchange' ? 'کیف پول صراف' : 'کیف پول مشتری', currency, debit: 0, credit: Number(amount), description: 'کاهش موجودی کیف پول', line_no: 1 },
    { account_type: 'cash', account_id: currency, account_name: 'صندوق', currency, debit: Number(amount), credit: 0, description: 'افزایش صندوق — برداشت از کیف پول', line_no: 2 },
  ];
}

export function buildWalletTransferLines({ from_wallet_id, to_wallet_id, currency, amount }) {
  return [
    { account_type: 'wallet', account_id: String(from_wallet_id), account_name: 'کیف پول مبدأ', currency, debit: 0, credit: Number(amount), description: 'کاهش کیف پول مبدأ', line_no: 1 },
    { account_type: 'wallet', account_id: String(to_wallet_id), account_name: 'کیف پول مقصد', currency, debit: Number(amount), credit: 0, description: 'افزایش کیف پول مقصد', line_no: 2 },
  ];
}

export function buildOpeningBalanceLines({ safe_id, customer_id, customer_name, currency, amount }) {
  // شناسه واقعی صندوق به دفترکل متصل می‌شود؛ مانده‌ها همچنان بر اساس ارز قابل تجمیع‌اند.
  const safeId = safe_id ?? customer_id;
  if (safeId === undefined || safeId === null || String(safeId).trim() === '') {
    throw new Error('شناسه صندوق برای ثبت موجودی افتتاحیه الزامی است');
  }
  const numericAmount = Number(amount);
  if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
    throw new Error('مبلغ موجودی افتتاحیه باید بیشتر از صفر باشد');
  }
  return [
    { account_type: 'cash', account_id: String(safeId), account_name: customer_name || 'صندوق', currency, debit: numericAmount, credit: 0, description: 'موجودی افتتاحیه صندوق', line_no: 1 },
    { account_type: 'suspense', account_id: '', account_name: 'موجودی افتتاحیه', currency, debit: 0, credit: numericAmount, description: 'بستانکاری موقت افتتاحیه', line_no: 2 },
  ];
}

export default {
  postDocument, postTransfer, reverseDocument, editDocument,
  getBalances, listDocuments,
  fetchTreasuryBalances, fetchBankBalances, fetchCustomerBalances,
  fetchWalletBalances, fetchAgentBalances, fetchProfitLoss,
  fetchCurrencyBalances, fetchExchangeSummary,
  buildBuyLines, buildSellLines, buildDadogereftLines,
  buildTransferLines, buildConversionLines,
  buildWalletTopupLines, buildWalletWithdrawLines, buildWalletTransferLines,
  buildOpeningBalanceLines,
};