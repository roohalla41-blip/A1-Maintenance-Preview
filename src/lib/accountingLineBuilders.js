/**
 * Pure journal-line builder for cross-currency movements.
 * Each currency balances independently through a currency-specific clearing
 * account; no exchange-rate conversion is treated as if unlike currencies
 * were numerically interchangeable.
 */
export function buildFxExchangeLines({
  from_type = 'cash',
  from_id,
  to_type = 'cash',
  to_id,
  from_currency,
  from_amount,
  to_currency,
  to_amount,
  rate,
  description = 'تبدیل ارز',
}) {
  const sourceAmount = Number(from_amount);
  const targetAmount = Number(to_amount);
  const sourceCurrency = String(from_currency || '').trim().toUpperCase();
  const targetCurrency = String(to_currency || '').trim().toUpperCase();

  if (!sourceCurrency || !targetCurrency || sourceCurrency === targetCurrency) {
    throw new Error('برای تبدیل ارز، دو ارز متفاوت و معتبر انتخاب کنید.');
  }
  if (!Number.isFinite(sourceAmount) || sourceAmount <= 0
    || !Number.isFinite(targetAmount) || targetAmount <= 0) {
    throw new Error('مبلغ مبدأ و مقصد تبدیل باید بیشتر از صفر و معتبر باشد.');
  }

  const pair = `${sourceCurrency}/${targetCurrency}`;
  return [
    {
      account_type: 'fx_clearing', account_id: sourceCurrency,
      account_name: `حساب واسط تبدیل ${sourceCurrency}`, currency: sourceCurrency,
      debit: sourceAmount, credit: 0, rate: rate || null,
      description: `${description} — بدهکار حساب واسط ${sourceCurrency}`, line_no: 1,
    },
    {
      account_type: from_type, account_id: String(from_id),
      account_name: from_type === 'bank' ? 'بانک' : 'صندوق', currency: sourceCurrency,
      debit: 0, credit: sourceAmount, rate: rate || null,
      description: `خروج ${sourceCurrency} از ${from_type} (${pair})`, line_no: 2,
    },
    {
      account_type: to_type, account_id: String(to_id),
      account_name: to_type === 'bank' ? 'بانک' : 'صندوق', currency: targetCurrency,
      debit: targetAmount, credit: 0, rate: rate || null,
      description: `ورود ${targetCurrency} به ${to_type} (${pair})`, line_no: 3,
    },
    {
      account_type: 'fx_clearing', account_id: targetCurrency,
      account_name: `حساب واسط تبدیل ${targetCurrency}`, currency: targetCurrency,
      debit: 0, credit: targetAmount, rate: rate || null,
      description: `${description} — بستانکار حساب واسط ${targetCurrency}`, line_no: 4,
    },
  ];
}
