import React from 'react';
import { Check, Building2, Store, Crown, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EXCHANGE_TIERS } from '@/lib/exchangeTiers';

const ICONS = { basic: Store, standard: Building2, enterprise: Crown };

export default function ExchangeTierSelector({ open, value, onChange, onConfirm, onClose, busy = false }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/75 p-3 sm:p-6" role="dialog" aria-modal="true" aria-labelledby="exchange-tier-title">
      <div className="relative max-h-[92vh] w-full max-w-5xl overflow-y-auto rounded-2xl border border-border bg-background p-4 shadow-2xl sm:p-6">
        <button type="button" onClick={onClose} disabled={busy} aria-label="بستن پنجره" className="absolute left-4 top-4 rounded-full p-2 text-muted-foreground hover:bg-muted">
          <X className="h-5 w-5" />
        </button>
        <div className="mx-auto mb-6 max-w-2xl text-center">
          <p className="mb-2 text-xs font-semibold tracking-wide text-primary">انتخاب سطح خدمات صرافی</p>
          <h2 id="exchange-tier-title" className="text-xl font-extrabold sm:text-2xl">کدام سطح برای صرافی شما مناسب است؟</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">هر سطح، مجموعه مشخصی از امکانات و منوها را در اختیار شما می‌گذارد. اطلاعات مالی با انتخاب سطح حذف نمی‌شود.</p>
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          {Object.values(EXCHANGE_TIERS).map((tier) => {
            const Icon = ICONS[tier.id];
            const selected = value === tier.id;
            return (
              <button
                key={tier.id}
                type="button"
                onClick={() => onChange(tier.id)}
                aria-pressed={selected}
                className={`relative flex h-full flex-col rounded-xl border p-4 text-right transition-all ${selected ? 'border-primary bg-primary/5 ring-2 ring-primary/30' : 'border-border bg-card hover:border-primary/50'}`}
              >
                {selected && <span className="absolute left-3 top-3 rounded-full bg-primary px-2 py-1 text-[10px] font-bold text-primary-foreground">انتخاب‌شده</span>}
                <span className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary"><Icon className="h-5 w-5" /></span>
                <span className="text-lg font-bold">{tier.label}</span>
                <span className="text-xs text-muted-foreground">{tier.englishLabel}</span>
                <span className="mt-2 text-sm font-semibold">{tier.tagline}</span>
                <span className="mt-2 min-h-16 text-xs leading-5 text-muted-foreground">{tier.description}</span>
                <span className="mt-3 text-xs font-semibold">مناسب برای: {tier.recommendedFor}</span>
                <ul className="mt-3 space-y-2 border-t border-border pt-3 text-xs leading-5">
                  {tier.features.map((feature) => <li key={feature} className="flex items-start gap-2"><Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" /><span>{feature}</span></li>)}
                </ul>
              </button>
            );
          })}
        </div>

        <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-center">
          <Button type="button" variant="outline" onClick={onClose} disabled={busy}>بازگشت</Button>
          <Button type="button" onClick={onConfirm} disabled={!value || busy} className="sm:min-w-52">
            {busy ? 'در حال ثبت‌نام...' : 'تأیید سطح و ادامه ثبت‌نام'}
          </Button>
        </div>
        <p className="mt-3 text-center text-[11px] leading-5 text-muted-foreground">در این پیش‌نمایش، انتخاب سطح برای بررسی رابط کاربری روی همین دستگاه نگهداری می‌شود؛ اتصال دائمی آن به حساب سرور در مرحله جداگانه و پس از طراحی امن پایگاه داده انجام خواهد شد.</p>
      </div>
    </div>
  );
}
