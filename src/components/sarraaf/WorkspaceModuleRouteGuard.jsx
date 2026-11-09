import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { useFeatures, useSarraafProfile } from '@/lib/useSarraaf';
import { isFeatureEnabled, getFeatureStatus, getFeatureMessage } from '@/lib/features';
import { isWorkspaceFeatureEnabled } from '@/lib/useWorkspaceModules';
import useWorkspaceModules from '@/lib/useWorkspaceModules';
import { canTierAccessNavKey, getExchangeTier, getTierForUser } from '@/lib/exchangeTiers';
import UpdatingNotice from '@/components/sarraaf/UpdatingNotice';

const ROUTE_FEATURES = [
  ['/customers', 'customers'],
  ['/dadogereft', 'dadogereft'],
  ['/trade', 'trade'],
  ['/transfers/send', 'transfer_send'],
  ['/transfers/receive', 'transfer_receive'],
  ['/transfers', 'transfer_send'],
  ['/cash', 'cash'],
  ['/bank', 'bank'],
  ['/currencies', 'currencies'],
  ['/reports', 'reports'],
  ['/profit-loss', 'profit_loss'],
  ['/transfer-book', 'transfer_book'],
  ['/journal-entry', 'journal_entry'],
  ['/journal', 'journal'],
  ['/general-ledger', 'general_ledger'],
  ['/balance-sheet', 'balance_sheet'],
  ['/reconciliation', 'reconciliation'],
  ['/receipt', 'receipt'],
  ['/convert', 'convert'],
  ['/online-products', 'online_products'],
  ['/payment-gateway', 'payment_gateway'],
  ['/agents', 'agents'],
  ['/agency-network', 'agency_network'],
  ['/chat', 'chat_groups'],
  ['/sarraaf-market', 'sarraaf_market'],
  ['/sarraaf-chat', 'sarraaf_chat'],
  ['/backup', 'backup'],
  ['/support', 'support'],
  ['/assistant', 'assistant'],
  ['/debtors', 'debtors'],
  ['/notifications', 'notifications'],
  ['/settings', 'settings'],
  ['/agency', 'agency_network'],
];

function featureForPath(pathname) {
  if (pathname.startsWith('/enterprise/')) {
    return pathname.split('/')[2]?.replace(/-/g, '_');
  }
  return ROUTE_FEATURES.find(([prefix]) => pathname === prefix || pathname.startsWith(prefix + '/'))?.[1] || null;
}

function ModuleAccessNotice() {
  return (
    <main dir="rtl" className="mx-auto flex min-h-[55vh] w-full max-w-2xl items-center justify-center px-4 py-10">
      <section className="w-full rounded-2xl border border-border bg-card p-6 text-center shadow-sm">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-muted text-muted-foreground" aria-hidden="true">⊘</div>
        <h1 className="text-lg font-bold">این بخش در فضای کاری غیرفعال است</h1>
        <p className="mt-2 text-sm leading-7 text-muted-foreground">برای استفاده دوباره، از تنظیمات فضای کاری این بخش را فعال کنید. غیرفعال‌سازی هیچ سابقه یا اطلاعات مالی را حذف نمی‌کند.</p>
        <Link to="/settings" className="mt-5 inline-flex min-h-10 items-center justify-center rounded-lg bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground">رفتن به تنظیمات</Link>
      </section>
    </main>
  );
}

function TierAccessNotice({ tier }) {
  return (
    <main dir="rtl" className="mx-auto flex min-h-[55vh] w-full max-w-2xl items-center justify-center px-4 py-10">
      <section className="w-full rounded-2xl border border-border bg-card p-6 text-center shadow-sm">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary" aria-hidden="true">🔒</div>
        <h1 className="text-lg font-bold">این امکان در سطح فعلی شما نیست</h1>
        <p className="mt-2 text-sm leading-7 text-muted-foreground">
          سطح فعلی فضای کاری شما «{tier.label}» است. این صفحه در سطح بالاتری ارائه می‌شود.
          برای آزمایش، با یک حساب صرافی جداگانه در سطح موردنظر ثبت‌نام کنید.
        </p>
        <Link to="/dashboard" className="mt-5 inline-flex min-h-10 items-center justify-center rounded-lg bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground">بازگشت به داشبورد</Link>
      </section>
    </main>
  );
}

export default function WorkspaceModuleRouteGuard({ children }) {
  const { pathname } = useLocation();
  const { user } = useAuth();
  const { data: features } = useFeatures();
  const { data: profile } = useSarraafProfile(user?.id);
  const { enabledModules } = useWorkspaceModules(user?.id);
  const featureKey = featureForPath(pathname);

  if (!featureKey) return children;

  // Enforce the selected product tier at the route boundary as well as in navigation.
  // This prevents direct URL entry from exposing pages excluded from the account's tier.
  const tier = getExchangeTier(getTierForUser(user, profile));
  if (!canTierAccessNavKey(tier.id, featureKey)) return <TierAccessNotice tier={tier} />;

  if (!isWorkspaceFeatureEnabled(featureKey, enabledModules)) return <ModuleAccessNotice />;

  const status = getFeatureStatus(features || [], featureKey);
  if (!isFeatureEnabled(features || [], featureKey) || status === 'disabled') return <ModuleAccessNotice />;
  // Enterprise module routes are intentionally navigable blueprints. Their page
  // explains the incomplete operational state; a generic notice would hide the
  // actual module structure from the user. Other updating features stay blocked.
  const isBlueprintRoute = pathname.startsWith('/enterprise/');
  if (status === 'updating' && !isBlueprintRoute) {
    return <UpdatingNotice message={getFeatureMessage(features || [], featureKey)} />;
  }

  return children;
}
