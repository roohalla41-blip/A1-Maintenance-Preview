import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeftRight, Coins, Users, Send, Vault, BookOpen,
  ChartNoAxesCombined, Building2, ShoppingBag, Settings2, ChevronDown
} from 'lucide-react';
import DesktopDashboardLinks from '@/components/sarraaf/DesktopDashboardLinks';

// One tile per work area. Existing routes remain available as compact text links.
const GROUPS = [
  { id: 'operations', label: 'عملیات صرافی', icon: ArrowLeftRight, paths: ['/trade', '/dadogereft', '/convert'] },
  { id: 'rates', label: 'ارز و نرخ‌ها', icon: Coins, paths: ['/currencies', '/sarraaf-market'] },
  { id: 'customers', label: 'مشتریان و مطالبات', icon: Users, paths: ['/customers', '/debtors'] },
  { id: 'transfers', label: 'حواله و تسویه', icon: Send, paths: ['/transfer-book'] },
  { id: 'treasury', label: 'صندوق و خزانه‌داری', icon: Vault, paths: ['/cash', '/bank', '/receipt'] },
  { id: 'accounting', label: 'حسابداری و دفاتر', icon: BookOpen, paths: ['/journal', '/general-ledger', '/balance-sheet', '/reconciliation'] },
  { id: 'reports', label: 'گزارش و تحلیل', icon: ChartNoAxesCombined, paths: ['/reports', '/profit-loss'] },
  { id: 'organization', label: 'شعب و نمایندگی‌ها', icon: Building2, paths: ['/agents', '/agency-network'] },
  { id: 'digital', label: 'خدمات دیجیتال', icon: ShoppingBag, paths: ['/online-products'] },
  { id: 'system', label: 'ارتباطات و تنظیمات', icon: Settings2, paths: ['/sarraaf-chat', '/settings'] },
];

export default function DashboardLinks({ allLinks, renderLink }) {
  const [openGroup, setOpenGroup] = useState(null);
  const linkMap = useMemo(() => new Map(allLinks.map(link => [link.path, link])), [allLinks]);
  const groups = useMemo(() => GROUPS.map(group => ({
    ...group,
    links: group.paths.map(path => linkMap.get(path)).filter(Boolean),
  })).filter(group => group.links.length), [linkMap]);

  return (
    <>
      <DesktopDashboardLinks allLinks={allLinks} renderLink={renderLink} />
      <section className="md:hidden mb-4" aria-label="مرکزهای اصلی برنامه">
        <div className="flex items-center justify-between mb-2 px-1">
          <h2 className="text-sm font-bold text-foreground">مرکزهای اصلی</h2>
          <span className="text-[11px] text-muted-foreground">امکانات درون هر بخش</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {groups.map(group => {
            const Icon = group.icon;
            const expanded = openGroup === group.id;
            return (
              <section key={group.id} className={`min-w-0 rounded-xl border bg-card overflow-hidden transition-colors ${expanded ? 'border-primary/50 ring-1 ring-primary/10' : 'border-border'}`}>
                <button
                  type="button"
                  aria-expanded={expanded}
                  aria-controls={`group-links-${group.id}`}
                  onClick={() => setOpenGroup(expanded ? null : group.id)}
                  className="w-full min-h-[76px] flex items-center gap-3 p-3 text-right hover:bg-muted/50 transition-colors"
                >
                  <span className="w-10 h-10 shrink-0 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                    <Icon className="w-5 h-5" strokeWidth={1.9} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-xs font-semibold text-foreground leading-5">{group.label}</span>
                    <span className="block text-[10px] text-muted-foreground">{group.links.length.toLocaleString('fa-IR')} قابلیت</span>
                  </span>
                  <ChevronDown className={`w-4 h-4 shrink-0 text-muted-foreground transition-transform ${expanded ? 'rotate-180' : ''}`} />
                </button>
                {expanded && (
                  <div id={`group-links-${group.id}`} className="border-t border-border bg-muted/20 px-3 py-2 space-y-1">
                    {group.links.map(link => (
                      <Link
                        key={link.path}
                        to={link.path}
                        className="flex items-center min-h-9 rounded-md px-2 text-xs text-foreground hover:bg-primary/10 hover:text-primary transition-colors"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-primary/60 ml-2 shrink-0" />
                        <span className="truncate">{link.label}</span>
                      </Link>
                    ))}
                  </div>
                )}
              </section>
            );
          })}
        </div>
      </section>
    </>
  );
}
