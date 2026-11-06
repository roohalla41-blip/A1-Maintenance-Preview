import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AlertTriangle, ArrowRight, Home, RefreshCw } from 'lucide-react';

export default function PageNotFound() {
  const location = useLocation();

  return (
    <main dir="rtl" className="min-h-[100dvh] flex items-center justify-center bg-background px-4 py-10">
      <section className="w-full max-w-lg rounded-2xl border border-border bg-card p-6 text-center shadow-lg sm:p-9">
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-600">
          <AlertTriangle className="h-8 w-8" aria-hidden="true" />
        </div>
        <p className="mb-2 text-xs font-bold tracking-widest text-muted-foreground">خطای مسیر</p>
        <h1 className="text-2xl font-extrabold text-foreground">این صفحه در دسترس نیست</h1>
        <p className="mt-3 text-sm leading-7 text-muted-foreground">
          نشانی درخواستی پیدا نشد یا ممکن است جابه‌جا شده باشد. از صفحهٔ اصلی وارد بخش موردنظر شوید.
        </p>
        <div className="mt-5 rounded-lg bg-muted/60 px-3 py-2 text-xs text-muted-foreground" dir="ltr">
          {location.pathname}
        </div>
        <div className="mt-7 flex flex-col justify-center gap-2 sm:flex-row">
          <Link to="/" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition hover:opacity-90">
            <Home className="h-4 w-4" />
            بازگشت به صفحهٔ اصلی
            <ArrowRight className="h-4 w-4" />
          </Link>
          <button type="button" onClick={() => window.location.reload()} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-border px-5 py-2.5 text-sm font-semibold text-foreground transition hover:bg-muted">
            <RefreshCw className="h-4 w-4" />
            تلاش دوباره
          </button>
        </div>
        <p className="mt-6 text-[11px] text-muted-foreground">حساب صراف · راهنمای بازیابی مسیر</p>
      </section>
    </main>
  );
}
