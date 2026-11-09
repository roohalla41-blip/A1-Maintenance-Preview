import React, { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Crown, LogOut, Send, ShieldCheck, UserRound } from 'lucide-react';
import { readPreviewState, writePreviewState, clearPreviewSession, hasPreviewSession } from '@/lib/previewDemo';

const plans = [
  { id: 'basic', name: 'Basic', title: 'معمولی' },
  { id: 'professional', name: 'Professional', title: 'حرفه‌ای' },
  { id: 'enterprise', name: 'Enterprise', title: 'سازمانی' },
];

export default function PreviewRoleDashboard({ role = 'sarraaf' }) {
  const navigate = useNavigate();
  const [state, setState] = useState(() => readPreviewState());
  const allowed = hasPreviewSession(role);
  const [requestedTier, setRequestedTier] = useState('professional');
  const [note, setNote] = useState('');
  const isCustomer = role === 'customer';
  const grant = state.grant;
  const today = new Date().toISOString().slice(0, 10);
  const activeGrant = useMemo(() => grant && grant.startDate <= today && grant.endDate >= today, [grant, today]);
  const tier = activeGrant ? grant.tier : 'basic';
  const tierName = plans.find(p => p.id === tier)?.name || 'Basic';

  const submitRequest = () => {
    const next = writePreviewState({
      ...state,
      request: { id: 'REQ-DEMO-001', tier: requestedTier, status: 'pending', createdAt: new Date().toISOString(), note },
      audit: [...state.audit, { action: 'درخواست ارتقا ثبت شد', at: new Date().toISOString() }],
    });
    setState(next);
  };
  const logout = () => {
    clearPreviewSession();
    navigate('/', { replace: true });
  };

  if (!allowed) return <main dir="rtl" className="min-h-screen bg-slate-950 p-8 text-slate-100"><div className="mx-auto max-w-xl rounded-xl border border-slate-800 bg-slate-900 p-6"><h1 className="text-xl font-bold">ورود آزمایشی</h1><p className="mt-3 text-sm text-slate-400">برای ورود، نقش موردنظر را از صفحه آغازین انتخاب کنید.</p><Link to="/" className="mt-5 inline-flex text-amber-300">بازگشت به صفحه آغازین</Link></div></main>;

  return (
    <main dir="rtl" className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-8">
      <div className="mx-auto max-w-5xl">
        <header className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-400/10 px-3 py-1 text-xs text-amber-200"><ShieldCheck className="h-4 w-4"/> محیط آزمایشی مستقل</span>
            <h1 className="mt-3 text-2xl font-bold">{isCustomer ? 'پنل مشتری آزمایشی' : 'پنل صراف آزمایشی'}</h1>
            <p className="mt-1 text-sm text-slate-400">این حساب و تمام اطلاعات این صفحه ساختگی و فقط در مرورگر شما ذخیره می‌شود.</p>
          </div>
          <button onClick={logout} className="inline-flex items-center gap-2 rounded-lg border border-slate-700 px-4 py-2 text-sm hover:bg-slate-800"><LogOut className="h-4 w-4"/> خروج آزمایشی</button>
        </header>

        {isCustomer ? (
          <section className="grid gap-4 sm:grid-cols-2">
            <article className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
              <UserRound className="mb-3 h-8 w-8 text-amber-300"/>
              <h2 className="text-lg font-semibold">حساب مشتری</h2>
              <p className="mt-2 text-sm leading-7 text-slate-400">نمای کلی حساب، کیف پول، سفارش‌ها، پیام‌ها و خدمات مشتری در این بخش قرار می‌گیرد.</p>
              <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
                {['کیف پول','سفارش‌ها','حسابداری شخصی','پشتیبانی'].map(x=><div key={x} className="rounded-lg bg-slate-800 p-3">{x}</div>)}
              </div>
            </article>
            <article className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
              <h2 className="font-semibold">وضعیت دسترسی</h2>
              <p className="mt-2 text-sm text-slate-400">حساب مشتری به انتخاب سطح Basic، Professional یا Enterprise نیاز ندارد.</p>
              <span className="mt-4 inline-block rounded-md bg-emerald-400/10 px-3 py-2 text-sm text-emerald-300">مشتری آزمایشی فعال</span>
            </article>
          </section>
        ) : (
          <>
            <section className="mb-5 grid gap-3 sm:grid-cols-3">
              <article className="rounded-xl border border-slate-800 bg-slate-900 p-5"><p className="text-sm text-slate-400">سطح فعلی حساب</p><p className="mt-2 text-2xl font-bold text-amber-300">{tierName}</p><p className="text-xs text-slate-500">ثبت‌نام صراف با Basic آغاز می‌شود</p></article>
              <article className="rounded-xl border border-slate-800 bg-slate-900 p-5"><p className="text-sm text-slate-400">وضعیت ارتقا</p><p className="mt-2 text-xl font-bold">{activeGrant ? 'ارتقا فعال' : grant && grant.endDate < today ? 'منقضی شده — Basic فعال است' : state.request?.status === 'pending' ? 'در انتظار بررسی سازنده' : 'بدون درخواست فعال'}</p></article>
              <article className="rounded-xl border border-slate-800 bg-slate-900 p-5"><p className="text-sm text-slate-400">اعتبار سطح بالاتر</p><p className="mt-2 text-xl font-bold">{activeGrant ? `${grant.startDate} تا ${grant.endDate}` : '—'}</p></article>
            </section>
            <section className="grid gap-4 lg:grid-cols-2">
              <article className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
                <h2 className="mb-4 flex items-center gap-2 font-semibold"><Crown className="h-5 w-5 text-amber-300"/> درخواست ارتقای اشتراک</h2>
                <label className="mb-2 block text-sm text-slate-300">سطح درخواستی</label>
                <select value={requestedTier} onChange={e=>setRequestedTier(e.target.value)} className="w-full rounded-lg border border-slate-700 bg-slate-950 p-3 text-slate-100">
                  {plans.filter(p=>p.id!=='basic').map(p=><option key={p.id} value={p.id}>{p.name} — {p.title}</option>)}
                </select>
                <label className="mb-2 mt-4 block text-sm text-slate-300">توضیحات (اختیاری)</label>
                <textarea value={note} onChange={e=>setNote(e.target.value)} rows={3} className="w-full rounded-lg border border-slate-700 bg-slate-950 p-3 text-slate-100" placeholder="نیازهای صرافی خود را بنویسید"/>
                <button disabled={state.request?.status==='pending'} onClick={submitRequest} className="mt-4 inline-flex items-center gap-2 rounded-lg bg-amber-400 px-4 py-3 font-semibold text-slate-950 disabled:opacity-40"><Send className="h-4 w-4"/> ثبت درخواست آزمایشی</button>
                {state.request && <p className="mt-3 text-sm text-amber-200">درخواست {state.request.tier} — وضعیت: {state.request.status==='pending'?'در انتظار بررسی':state.request.status==='approved'?'تأییدشده':'ردشده'}</p>}
              </article>
              <article className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
                <h2 className="mb-3 font-semibold">ساختار محیط صراف</h2>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {['داشبورد مالی','مشتریان','ثبت معاملات','صندوق و خزانه‌داری','حواله و انتقال','دفتر روزنامه','دفتر کل','گزارش‌ها'].map(x=><div key={x} className="rounded-lg border border-slate-800 bg-slate-950 p-3">{x}</div>)}
                </div>
                <p className="mt-4 text-xs leading-6 text-slate-500">این موارد نقشه ساختار هستند؛ اتصال عملیاتی و ذخیره‌سازی سمت سرور هنوز راه‌اندازی نشده است.</p>
              </article>
            </section>
          </>
        )}
        <div className="mt-6"><Link to="/" className="inline-flex items-center gap-2 text-sm text-amber-300"><ArrowRight className="h-4 w-4"/> بازگشت به صفحه ورودی</Link></div>
      </div>
    </main>
  );
}
