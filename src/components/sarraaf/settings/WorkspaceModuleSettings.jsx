import React from 'react';
import { Check, Eye, EyeOff, LayoutGrid } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import useWorkspaceModules, { WORKSPACE_MODULES } from '@/lib/useWorkspaceModules';
import SettingsSection from '@/components/sarraaf/settings/SettingsSection';

export default function WorkspaceModuleSettings() {
  const { user } = useAuth();
  const { enabledModules, setModuleEnabled } = useWorkspaceModules(user?.id);

  return (
    <SettingsSection
      icon={LayoutGrid}
      title="مدیریت آیکون‌های صفحه اصلی"
      description="هر مرکز را جداگانه فعال یا غیرفعال کنید. بخش غیرفعال از داشبورد و منوهای کاری پنهان می‌شود؛ اطلاعات و سوابق آن حذف نمی‌شوند."
    >
      <div className="space-y-2">
        {WORKSPACE_MODULES.map(module => {
          const enabled = enabledModules[module.id] !== false;
          return (
            <div key={module.id} className="flex items-center gap-3 rounded-xl border border-border p-3">
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${enabled ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                {enabled ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold">{module.label}</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">{module.description}</p>
                <p className={`text-[10px] mt-1 ${enabled ? 'text-emerald-600' : 'text-muted-foreground'}`}>
                  {enabled ? 'در صفحه و منوها نمایش داده می‌شود' : 'از صفحه و منوهای کاری پنهان است'}
                </p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={enabled}
                aria-label={`${module.label} ${enabled ? 'فعال' : 'غیرفعال'}`
                }
                onClick={() => setModuleEnabled(module.id, !enabled)}
                className={`relative w-12 h-7 rounded-full transition-colors shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${enabled ? 'bg-primary' : 'bg-muted-foreground/35'}`}
              >
                <span className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow transition-transform ${enabled ? 'right-1' : 'right-6'}`}>
                  {enabled && <Check className="w-3 h-3 text-primary m-1" />}
                </span>
              </button>
            </div>
          );
        })}
      </div>
      <p className="text-[11px] text-muted-foreground mt-3">
        خاموش‌کردن فقط نمایش و دسترسی از منو را تغییر می‌دهد؛ هیچ مشتری، سند، تراکنش یا مانده‌ای پاک یا تغییر داده نمی‌شود. آیکون تنظیمات همیشه برای فعال‌سازی دوباره در دسترس می‌ماند.
      </p>
    </SettingsSection>
  );
}
