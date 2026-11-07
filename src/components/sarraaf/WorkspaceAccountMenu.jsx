import React from 'react';
import { Link } from 'react-router-dom';
import { Settings, Shield, Crown, X, ChevronDown, Copy } from 'lucide-react';
import { getRoleLabel, isManagementRole } from '@/lib/rbac';
import { getExchangeTier, getTierForUser } from '@/lib/exchangeTiers';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';

export default function WorkspaceAccountMenu({ user, profile, settingsItem, paidSystemEnabled, openUpgrade, onLogout }) {
  const name = user?.full_name || user?.name || user?.email || 'کاربر';
  const currentTier = getExchangeTier(getTierForUser(user, profile));
  return (
    <DropdownMenu dir="rtl">
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-muted text-sm" aria-label="منوی حساب کاربری">
          <span className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-semibold shrink-0">{name.charAt(0)}</span>
          <span className="hidden lg:block max-w-36 truncate">{name}</span><ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel className="space-y-1"><p className="truncate">{name}</p><p className="text-xs font-normal text-muted-foreground">{getRoleLabel(user?.role)}</p>{user?.role !== 'customer' && <p className="inline-flex items-center rounded-full bg-primary/10 px-2 py-1 text-xs font-semibold text-primary">سطح فضای کاری: {currentTier.label} · {currentTier.englishLabel}</p>}{profile?.code && <p className="text-xs font-normal text-muted-foreground" dir="ltr">{profile.code}</p>}</DropdownMenuLabel>
        {(profile?.code || profile?.exchange_code) && <DropdownMenuItem onSelect={() => navigator.clipboard?.writeText(profile.code || profile.exchange_code)}><Copy />کپی کد صرافی</DropdownMenuItem>}
        <DropdownMenuSeparator />
        {settingsItem && <DropdownMenuItem asChild><Link to={settingsItem.path}><Settings />تنظیمات و اطلاعات حساب</Link></DropdownMenuItem>}
        {paidSystemEnabled !== false && <DropdownMenuItem onSelect={() => openUpgrade()}><Crown />وضعیت اشتراک و ارتقا</DropdownMenuItem>}
        {isManagementRole(user?.role) && <DropdownMenuItem asChild><Link to={user.role === 'creator' ? '/builder' : '/dashboard'}><Shield />پنل مدیریت</Link></DropdownMenuItem>}
        {user?.role === 'creator' && <DropdownMenuItem asChild><Link to="/main-settings"><Settings />تنظیمات اصلی</Link></DropdownMenuItem>}
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={onLogout} className="text-destructive focus:text-destructive"><X />خروج از حساب</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}