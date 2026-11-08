import React, { useMemo, useState } from 'react';
import { Eye, EyeOff, RotateCcw, ShieldCheck, Layers3 } from 'lucide-react';
import { FEATURE_CATALOG } from '@/lib/features';
import { EXCHANGE_TIERS } from '@/lib/exchangeTiers';
import useTierFeatureVisibility, { isTierFeatureVisible } from '@/lib/tierFeatureVisibility';
import SettingsSection from '@/components/sarraaf/settings/SettingsSection';

const TIER_ORDER = ['basic', 'standard', 'enterprise'];

export default function TierFeatureVisibilitySettings() {
  const [selectedTier, setSelectedTier] = useState('basic');
  const { visibilityByTier, setFeatureVisibility, resetTierVisibility } = useTierFeatureVisibility();
  const tier = EXCHANGE_TIERS[selectedTier];

  const features = useMemo(() => FEATURE_CATALOG
    .filter(item => item.location === 'nav' && !['dashboard', 'settings', 'main_settings', 'transfers'].includes(item.feature_key))
    .sort((a, b) => a.display_order - b.display_order), []);

  return (
    <SettingsSection
      icon={Layers3}
      title="مدیریت آیکون‌ها بر اساس سطح کاربری"
      description="سازنده سیستم می‌تواند مشخص کند هر آیکون در کدام سطح نمایش داده شود. روشن‌کردن یک آیکون، آن قابلیت را به منوی همان سطح اضافه می‌کند؛ خاموش‌کردن فقط نمایش آن را پنهان می‌کند."
    >
      <div className="space-y-4" dir="rtl">
        <div className="grid grid-cols-3 gap-2">
          {TIER_ORDER.map(tierId => {
            const item = EXCHANGE_TIERS[tierId];
            return (
              <button
                key={tierId}
                type="button"
                onClick={() => setSelectedTier(tierId)}
                aria-pressed={selectedTier === tierId}
                className={`rounded-xl border px-2 py-3 text-center transition-colors ${selectedTier === tierId ? 'border-primary bg-primary/10 text-primary' : 'border-border hover:bg-muted'}`}
              >
                <span className="block text-xs font-bold">{item.label}</span>
                <span className="mt-1 block text-[10px] opacity-70">{item.englishLabel}</span>
              </button>
            );
          })}
        </div>

        <div className="flex items-center justify-between gap-3 rounded-xl bg-muted/60 p-3">
          <div className="min-w-0">
            <p className="text-sm font-semibold">سطح {tier.label}</p>
            <p className="mt-1 text-[11px] text-muted-foreground">{tier.tagline}</p>
          </div>
          <button
            type="button"
            onClick={() => resetTierVisibility(selectedTier)}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-2 text-xs hover:bg-muted"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            بازگشت به پیش‌فرض
          </button>
        </div>

        <div className="space-y-2">
          {features.map(feature => {
            const enabled = isTierFeatureVisible(selectedTier, feature.feature_key, visibilityByTier);
            const isDefault = tier.navKeys.includes(feature.feature_key);
            return (
              <div key={feature.feature_key} className="flex items-center gap-3 rounded-xl border border-border p-3">
                <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${enabled ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                  {enabled ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold">{feature.name}</p>
                  <p className="mt-0.5 text-[10px] text-muted-foreground">
                    {enabled ? 'در منوی این سطح نمایش داده می‌شود' : 'در منوی این سطح پنهان است'}
                    {!isDefault && enabled ? ' · با تنظیم سازنده اضافه شده' : ''}
                  </p>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={enabled}
                  aria-label={`${feature.name} برای سطح ${tier.label}`}
                  onClick={() => setFeatureVisibility(selectedTier, feature.feature_key, !enabled)}
                  className={`relative h-7 w-12 shrink-0 rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${enabled ? 'bg-primary' : 'bg-muted-foreground/35'}`}
                >
                  <span className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-all ${enabled ? 'right-1' : 'right-6'}`} />
                </button>
              </div>
            );
          })}
        </div>

        <div className="flex gap-2 rounded-xl border border-border p-3 text-[11px] leading-6 text-muted-foreground">
          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
          <p>داشبورد و تنظیمات همیشه در دسترس می‌مانند. این تنظیمات در نسخه آزمایشی فقط در مرورگر ذخیره می‌شوند و هنوز به سرور یا دستگاه‌های دیگر همگام نیستند. این کنترل، نمایش منو و دسترسی مسیر در پیش‌نمایش را هماهنگ می‌کند؛ مجوزهای عملیاتی و امنیتی در فاز بعد جداگانه تکمیل می‌شوند.</p>
        </div>
      </div>
    </SettingsSection>
  );
}
