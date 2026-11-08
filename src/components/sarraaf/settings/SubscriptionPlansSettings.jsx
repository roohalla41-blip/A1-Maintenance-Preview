import React from 'react';
import { Check, LockKeyhole, Crown, Sparkles, ShieldCheck } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { EXCHANGE_TIERS, getTierForUser } from '@/lib/exchangeTiers';
import SettingsSection from '@/components/sarraaf/settings/SettingsSection';

const ORDER = ['basic', 'standard', 'enterprise'];
const STATUS = {
  basic: 'رایگان',
  standard: 'اشتراک متوسط',
  enterprise: 'اشتراک سازمانی',
};

export default function SubscriptionPlansSettings() {
  const { user } = useAuth();
  const currentTier = getTierForUser(user);
  return (
    <div className="space-y-4" dir="rtl">
      <SettingsSection
        icon={Crown}
        title="اشتراک و امکانات"
        description="امکانات هر بسته را بررسی کنید. در این نسخه آزمایشی، نمایش بسته‌ها و وضعیت قفل‌ها صرفاً پیش‌نمایش است و خرید یا پرداختی انجام نمی‌شود."
      >
        <div className="grid gap-3 md:grid-cols-3">
          {ORDER.map((id, index) => {
            const tier = EXCHANGE_TIERS[id];
            const active = currentTier === id;
            const locked = !active && ORDER.indexOf(id) > ORDER.indexOf(currentTier);
            const Icon = index === 0 ? ShieldCheck : index === 1 ? Sparkles : Crown;
            return (
              <article key={id} className={`rounded-2xl border p-4 ${active ? 'border-primary bg-primary/5' : 'border-border bg-card'}`}>
                <div className="flex items-center justify-between gap-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted">
                    <Icon className="h-5 w-5" />
                  </div>
                  {active ? (
                    <span className="rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-semibold text-primary">اشتراک فعلی</span>
                  ) : locked ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1 text-[11px] text-muted-foreground"><LockKeyhole className="h-3 w-3" /> قفل</span>
                  ) : (
                    <span className="rounded-full bg-muted px-2.5 py-1 text-[11px]">قابل انتخاب در پیش‌نمایش</span>
                  )}
                </div>
                <h3 className="mt-3 text-base font-bold">{tier.label}</h3>
                <p className="text-xs text-muted-foreground">{tier.englishLabel} · {STATUS[id]}</p>
                <p className="mt-2 min-h-10 text-xs leading-6 text-muted-foreground">{tier.description}</p>
                <p className="mt-3 text-[11px] font-semibold">امکانات این سطح</p>
                <ul className="mt-2 space-y-2">
                  {tier.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs leading-5">
                      <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                {active && <p className="mt-4 rounded-lg bg-primary/10 p-2 text-center text-xs font-semibold text-primary">این بسته برای حساب فعلی شما فعال است</p>}
                {locked && <p className="mt-4 rounded-lg bg-muted p-2 text-center text-xs text-muted-foreground">برای ارتقا، با مدیر سیستم هماهنگ کنید</p>}
              </article>
            );
          })}
        </div>
        <div className="mt-4 rounded-xl border border-border p-3 text-xs leading-6 text-muted-foreground">
          توجه: این صفحه فقط پیش‌نمایش بسته‌های اشتراک است. پرداخت، تمدید، فعال‌سازی واقعی اشتراک و کنترل دسترسی سمت سرور هنوز پیاده‌سازی نشده‌اند. امکاناتی که هنوز تکمیل نشده‌اند، تا زمان آماده‌شدن نباید عملیاتی تلقی شوند.
        </div>
      </SettingsSection>
    </div>
  );
}
