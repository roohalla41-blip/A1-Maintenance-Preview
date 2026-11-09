/**
 * حالت تست محلی (Local Test Mode)
 *
 * وقتی فعال باشد:
 * - تمام عملیات داده فقط در localStorage ذخیره می‌شوند
 * - هیچ داده‌ای به Supabase ارسال/ویرایش/حذف نمی‌شود
 * - همگام‌سازی با سرور غیرفعال می‌شود
 * - ورود فقط با کاربران محلی انجام می‌شود
 *
 * برای غیرفعال کردن (بازگشت به Supabase):
 *   localStorage.setItem('local_test_mode', 'false')
 *   سپس صفحه را بازخوانی کنید
 *
 * ساختار اصلی Supabase و دیتابیس دست‌نخورده باقی می‌ماند.
 */

import { isIsolatedPreview } from './previewIsolation';

const FLAG_KEY = 'local_test_mode';

export function isLocalTestMode() {
  // Preview mode is immutable: never allow a browser setting to re-enable server sync.
  try {
    if (isIsolatedPreview()) return true;
    const v = localStorage.getItem(FLAG_KEY);
    if (v === 'true') return true;
    // Outside the isolated preview, retain the original production default.
    if (v === null) localStorage.setItem(FLAG_KEY, 'false');
    return false;
  } catch {
    // Fail closed: storage errors must not enable server access in the preview.
    return isIsolatedPreview();
  }
}

export function enableLocalTestMode() {
  try {
    localStorage.setItem(FLAG_KEY, 'true');
  } catch {
    // ignore
  }
}

export function disableLocalTestMode() {
  try {
    localStorage.setItem(FLAG_KEY, 'false');
  } catch {
    // ignore
  }
}