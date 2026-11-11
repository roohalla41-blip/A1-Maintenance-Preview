import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { useFeatures, useToggleFeature } from '@/lib/useSarraaf';
import { FEATURE_CATALOG, CRITICAL_FEATURES } from '@/lib/features';
import { PageHeader } from '@/components/sarraaf/Pieces';
import { Card, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Shield, Layers3, Users, CreditCard, Lock, Bell, MessageSquare,
  Server, Wallet, Crown, Upload, LogOut, Download, AlertTriangle, UserCog, Clock, Eye, Mail, Smartphone, Gamepad2, Zap, Globe, Store, FlaskConical, Database, Bot
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ChatManagement from '@/components/sarraaf/ChatManagement';
import UserManagement from '@/components/sarraaf/UserManagement';
import NotificationManager from '@/components/sarraaf/NotificationManager';
import PlanFeatureManager from '@/components/sarraaf/PlanFeatureManager';
import PaidSystemToggle from '@/components/sarraaf/PaidSystemToggle';
import PlanPricingManager from '@/components/sarraaf/PlanPricingManager';
import PermissionManager from '@/components/sarraaf/PermissionManager';
import PaymentMethodsManager from '@/components/sarraaf/PaymentMethodsManager';
import SystemOverview from '@/components/sarraaf/SystemOverview';
import WorkspaceArchitecturePanel from '@/components/sarraaf/WorkspaceArchitecturePanel';
import OrphanCustomerManager from '@/components/sarraaf/OrphanCustomerManager';
import VersionManager from '@/components/sarraaf/VersionManager';
import ContactSettingsManager from '@/components/sarraaf/ContactSettingsManager';
import AppIconDownloader from '@/components/sarraaf/AppIconDownloader';
import EmergencyBackup from '@/components/sarraaf/EmergencyBackup';
import EmergencyBackupV2 from '@/components/sarraaf/EmergencyBackupV2';
import TripleBackup from '@/components/sarraaf/TripleBackup';
import KeepaliveStatus from '@/components/sarraaf/KeepaliveStatus';
import WithdrawalManagement from '@/components/sarraaf/WithdrawalManagement';
import CoCreatorManager from '@/components/sarraaf/CoCreatorManager';
import ManualVerificationManager from '@/components/sarraaf/ManualVerificationManager';
import AccountRecoveryManager from '@/components/sarraaf/AccountRecoveryManager';
import TrialManager from '@/components/sarraaf/TrialManager';
import MobileLayoutPreview from '@/components/sarraaf/MobileLayoutPreview';
import CreatorPreviewLab from '@/components/sarraaf/CreatorPreviewLab';
import UCManager from '@/components/sarraaf/UCManager';
import RechargeManager from '@/components/sarraaf/RechargeManager';
import Afghan5Manager from '@/components/sarraaf/Afghan5Manager';
import SellerManager from '@/components/sarraaf/SellerManager';
import SandboxPanel from '@/components/sandbox/SandboxPanel';
import SupabaseAuditManager from '@/components/sarraaf/SupabaseAuditManager';
import { SandboxProvider } from '@/components/sandbox/SandboxProvider';
import { checkBuilderAccess, startBuilderSession } from '@/lib/builderAccess';
import { useToast } from '@/components/ui/use-toast';

const STATUS_LABELS = {
  active: 'فعال',
  updating: 'در حال به‌روزرسانی',
  disabled: 'غیرفعال',
};

const STATUS_COLORS = {
  active: 'bg-green-100 text-green-700',
  updating: 'bg-amber-100 text-amber-700',
  disabled: 'bg-red-100 text-red-700',
};

// گروه‌بندی تب‌ها بر اساس نقش
const TAB_GROUPS = [
  {
    label: 'مرکز کنترل',
    icon: Server,
    value: 'system',
    description: 'وضعیت کل پلتفرم و مدیریت مرکزی',
  },
  {
    label: 'معماری سامانه',
    icon: Layers3,
    value: 'architecture',
    description: 'نقشه پنل‌ها و دامنه‌های سامانه',
  },
  {
    label: 'ماژول‌ها',
    icon: Shield,
    value: 'features',
    description: 'مدیریت فعال‌سازی بخش‌ها',
  },
  {
    label: 'کاربران',
    icon: Users,
    value: 'users',
    description: 'مدیریت کاربران و دسترسی‌ها',
  },
  {
    label: 'مجوزها',
    icon: Lock,
    value: 'perms',
    description: 'مجوزهای نقش‌ها',
  },
  {
    label: 'اشتراک و قیمت',
    icon: Crown,
    value: 'plans',
    description: 'سطوح، امکانات و قیمت‌گذاری',
  },

  {
    label: 'ارتباطات',
    icon: Bell,
    value: 'notif',
    description: 'اعلان‌ها و گفت‌وگوی کاربران',
  },

  {
    label: 'پرداخت و برداشت',
    icon: Wallet,
    value: 'payments',
    description: 'روش‌های پرداخت و درخواست برداشت',
  },

  {
    label: 'نسخه و انتشار',
    icon: Upload,
    value: 'version',
    description: 'مدیریت نسخه برنامه',
  },
  {
    label: 'پشتیبان و بازیابی',
    icon: Download,
    value: 'backup',
    description: 'پشتیبان اضطراری پروژه',
  },

  {
    label: 'مدیران همکار',
    icon: UserCog,
    value: 'co_creators',
    description: 'مدیریت دسترسی کمک‌سازنده‌ها',
  },
  {
    label: 'تأیید و دوره آزمایشی',
    icon: Mail,
    value: 'verification',
    description: 'تأیید هویت و دوره آزمایشی صرافان',
  },
  {
    label: 'پیش‌نمایش موبایل',
    icon: Smartphone,
    value: 'layout_preview',
    description: 'پیش‌نمایش چیدمان موبایل',
  },
  {
    label: 'آزمایشگاه نسخه',
    icon: FlaskConical,
    value: 'creator_preview',
    description: 'محیط امن برای مقایسه و آزمایش نسخه پیشنهادی',
  },
  {
    label: 'خدمات و فروشندگان',
    icon: Store,
    value: 'services',
    description: 'مدیریت خدمات دیجیتال، شارژ و شبکه فروشندگان',
  },
  {
    label: 'آزمایشگاه نقش و فروش',
    icon: FlaskConical,
    value: 'sandbox',
    description: 'آزمون محلی مشتری، صراف، فروشنده و سفارش‌ها',
  },
  {
    label: 'امنیت و حسابرسی',
    icon: Database,
    value: 'audit',
    description: 'گزارش امن ساختار پایگاه داده و سیاست‌های دسترسی',
  },

];

export default function BuilderPanel() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { data: features, refetch } = useFeatures();
  const toggleMut = useToggleFeature();
  const [autoLogoutWarning, setAutoLogoutWarning] = useState(false);
  const { toast } = useToast();

  // ── Determine builder access level ──
  const accessInfo = useMemo(() => checkBuilderAccess(user), [user]);
  const isFullCreator = user?.role === 'creator' || user?.role === 'admin';
  const allowedTabs = accessInfo?.allowed_tabs === 'all' ? null : (accessInfo?.allowed_tabs || []);

  // ── Auto-logout after 30 min inactivity ──
  useEffect(() => {
    const cleanup = startBuilderSession(() => {
      setAutoLogoutWarning(true);
      setTimeout(() => logout(true), 2000);
    });
    return cleanup;
  }, [logout]);

  const handleToggle = async (f) => {
    if (CRITICAL_FEATURES.includes(f.feature_key)) return;
    const current = features?.find(fx => fx.feature_key === f.feature_key);
    if (!current) {
      // Record doesn't exist yet — create it
      try {
        const { createSupabaseEntity } = await import('@/lib/supabaseApi');
        const sbFeatures = createSupabaseEntity('FeatureSetting');
        await sbFeatures.create({
          feature_key: f.feature_key,
          name: f.name,
          icon: f.icon,
          location: f.location,
          display_order: f.display_order,
          enabled: true,
          status: f.default_status || 'active',
        });
        if (refetch) refetch();
        toast({ title: 'بخش فعال شد', description: f.name });
      } catch (err) {
        toast({ title: 'خطا', description: err.message || 'عملیات ناموفق بود', variant: 'destructive' });
      }
      return;
    }
    toggleMut.mutate({ id: current.id, enabled: !current.enabled });
  };

  const handleStatusChange = async (featureKey, newStatus) => {
    const current = features?.find(fx => fx.feature_key === featureKey);
    if (CRITICAL_FEATURES.includes(featureKey)) return;
    try {
      const { createSupabaseEntity } = await import('@/lib/supabaseApi');
      const sbFeatures = createSupabaseEntity('FeatureSetting');
      if (!current) {
        // Record doesn't exist yet — create it with the new status
        const f = FEATURE_CATALOG.find(fx => fx.feature_key === featureKey);
        await sbFeatures.create({
          feature_key: featureKey,
          name: f?.name || featureKey,
          icon: f?.icon,
          location: f?.location,
          display_order: f?.display_order,
          enabled: newStatus !== 'disabled',
          status: newStatus,
        });
      } else {
        await sbFeatures.update(current.id, {
          status: newStatus,
          enabled: newStatus !== 'disabled',
        });
      }
      if (refetch) refetch();
      toast({ title: 'وضعیت بخش به‌روزرسانی شد', description: `${featureKey}: ${STATUS_LABELS[newStatus]}` });
    } catch (err) {
      toast({ title: 'خطا', description: err.message || 'عملیات ناموفق بود', variant: 'destructive' });
    }
  };

  if (autoLogoutWarning) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background gap-3 p-6">
        <Clock className="w-12 h-12 text-amber-500 animate-pulse" />
        <h2 className="text-lg font-bold">خروج خودکار</h2>
        <p className="text-sm text-muted-foreground text-center">
          به دلیل ۳۰ دقیقه بی‌فعالیتی در پنل سازنده، نشست شما به‌صورت خودکار پایان می‌یابد.
        </p>
      </div>
    );
  }

  return (
    <>
      <PageHeader
        title="مرکز کنترل سازنده حساب صراف"
        subtitle={isFullCreator ? user?.full_name : `کمک‌سازنده: ${accessInfo?.name || user?.full_name || ''}`}
        icon={Shield}
        actions={
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/dashboard')}
            className="gap-1.5"
          >
            <Eye className="w-4 h-4" />
            پیش‌نمایش برنامه
          </Button>
        }
      />

      <Tabs defaultValue="system">
        <TabsList className="flex overflow-x-auto scrollbar-thin w-full gap-0.5 justify-start sm:justify-around">
          {TAB_GROUPS.filter(group => {
            if (group.value === 'creator_preview') return isFullCreator;
            if (isFullCreator) return true;
            if (group.value === 'co_creators') return false; // co-creators can't manage other co-creators
            if (!allowedTabs) return true;
            return allowedTabs.includes(group.value);
          }).map(group => {
            const Icon = group.icon;
            return (
              <TabsTrigger key={group.value} value={group.value} className="flex flex-col items-center gap-0.5 py-2 shrink-0 min-w-[64px]">
                <Icon className="w-4 h-4" />
                <span className="text-[9px]">{group.label}</span>
              </TabsTrigger>
            );
          })}
        </TabsList>

        {/* سیستم — نمای کلی، اتصال، آمار */}
        <TabsContent value="system">
          <div className="space-y-4">
            <SystemOverview />
            <KeepaliveStatus />
            <AccountRecoveryManager />
            <OrphanCustomerManager />
            <p className="text-xs text-muted-foreground">ابزارهای مهاجرت و اجرای SQL از مرکز کنترل روزمره برداشته شده‌اند تا تغییرات حساس داده فقط از مسیر نگهداریِ کنترل‌شده انجام شود.</p>
          </div>
        </TabsContent>

        <TabsContent value="architecture"><WorkspaceArchitecturePanel /></TabsContent>

        {/* بخش‌ها */}
        <TabsContent value="features">
          <Card><CardContent className="p-4">
            <h3 className="text-sm font-semibold mb-1">مدیریت بخش‌ها</h3>
            <p className="text-xs text-muted-foreground mb-4">هر بخش را می‌توانید فعال، در حال به‌روزرسانی یا غیرفعال کنید.</p>
            <div className="space-y-2">
              {FEATURE_CATALOG.map(f => {
                const dbFeature = features?.find(fx => fx.feature_key === f.feature_key);
                const enabled = dbFeature ? dbFeature.enabled !== false : true;
                const status = dbFeature?.status || (f.default_status || 'active');
                const isCritical = CRITICAL_FEATURES.includes(f.feature_key);
                return (
                  <div key={f.feature_key} className="flex items-center justify-between p-2.5 rounded-lg border">
                    <div className="flex-1">
                      <span className="text-sm font-medium">{f.name}</span>
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full mr-2 ${STATUS_COLORS[status]}`}>
                        {STATUS_LABELS[status]}
                      </span>
                      {isCritical && <span className="text-[10px] text-muted-foreground mr-2">(حیاتی)</span>}
                    </div>
                    <div className="flex items-center gap-2">
                      {!isCritical && (
                        <Select value={status} onValueChange={(v) => handleStatusChange(f.feature_key, v)}>
                          <SelectTrigger className="text-xs h-7 w-28"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="active">فعال</SelectItem>
                            <SelectItem value="updating">به‌روزرسانی</SelectItem>
                            <SelectItem value="disabled">غیرفعال</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                      <Switch
                        checked={enabled}
                        disabled={isCritical}
                        onCheckedChange={() => handleToggle(f)}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent></Card>
        </TabsContent>

        {/* کاربران */}
        <TabsContent value="users"><UserManagement /></TabsContent>

        {/* مجوزها */}
        <TabsContent value="perms"><PermissionManager /></TabsContent>

        {/* پلن‌ها */}
        <TabsContent value="plans">
          <div className="space-y-4">
            <PaidSystemToggle />
            <PlanFeatureManager />
            <PlanPricingManager />
          </div>
        </TabsContent>

        {/* قیمت‌گذاری */}
        

        {/* اعلان‌ها */}
        <TabsContent value="notif">
          <div className="space-y-4"><NotificationManager /><ChatManagement /></div>
        </TabsContent>

        {/* چت */}
        

        {/* پرداخت */}
        <TabsContent value="payments">
          <div className="space-y-4"><PaymentMethodsManager /><WithdrawalManagement /></div>
        </TabsContent>

        {/* برداشت‌ها */}
        

        {/* نسخه */}
        <TabsContent value="version">
          <div className="space-y-4">
            <AppIconDownloader />
            <VersionManager />
            <ContactSettingsManager />
          </div>
        </TabsContent>

        {/* پشتیبان اضطراری */}
        <TabsContent value="backup">
          <div className="space-y-4">
            <Card><CardContent className="p-3"><h3 className="font-semibold text-sm">مرکز پشتیبان‌گیری و بازیابی</h3><p className="mt-1 text-xs text-muted-foreground">ابزارهای پشتیبان در یک محل جمع شده‌اند؛ پیش از هر بازیابی، نسخه و مقصد باید بررسی شود.</p></CardContent></Card>
            <EmergencyBackup />
            <EmergencyBackupV2 />
            <TripleBackup />
          </div>
        </TabsContent>

        {/* کمک‌سازنده‌ها — فقط سازنده اصلی */}
        {isFullCreator && (
          <TabsContent value="co_creators">
            <CoCreatorManager />
          </TabsContent>
        )}

        {/* تأیید دستی ایمیل */}
        <TabsContent value="verification">
          <div className="space-y-4"><ManualVerificationManager /><TrialManager /></div>
        </TabsContent>

        {/* پیش‌نمایش چیدمان موبایل */}
        <TabsContent value="layout_preview">
          <MobileLayoutPreview />
        </TabsContent>

        {/* آزمایشگاه توسعه — فقط پنل سازنده اصلی و کاملاً جدا از دیتابیس زنده */}
        {isFullCreator && (
          <TabsContent value="creator_preview">
            <CreatorPreviewLab />
          </TabsContent>
        )}

        {/* هوش مثنوی — دستیار هوشمند آزمایشی */}
        

        {/* مدیریت یکپارچه خدمات و فروشندگان */}
        <TabsContent value="services">
          <div className="space-y-4">
            <SellerManager />
            <RechargeManager />
            <Afghan5Manager />
            <UCManager />
          </div>
        </TabsContent>

        {/* محیط آزمایشی فروش شارژ و خدمات دیجیتال — فقط سازندهٔ اصلی */}
        {isFullCreator && (
          <TabsContent value="sandbox">
            <SandboxProvider>
              <SandboxPanel />
            </SandboxProvider>
          </TabsContent>
        )}

        {/* بررسی امن سوپابیس — فقط سازنده/مدیر */}
        {isFullCreator && (
          <TabsContent value="audit">
            <SupabaseAuditManager />
          </TabsContent>
        )}

      </Tabs>
    </>
  );
}