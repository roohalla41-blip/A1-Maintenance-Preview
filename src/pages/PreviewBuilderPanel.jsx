import React, { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Check, Clock3, Crown, Layers3, LogOut, ShieldCheck, Users, X } from 'lucide-react';
import { clearPreviewSession, readPreviewState, writePreviewState } from '@/lib/previewDemo';

const plans = [
  { id:'basic', name:'Basic', fa:'معمولی', detail:'هسته مالی، مشتریان، معاملات، صندوق، دفتر روزنامه و گزارش‌های پایه' },
  { id:'professional', name:'Professional', fa:'حرفه‌ای', detail:'تمام امکانات Basic به‌علاوه مدیریت پیشرفته شعب، خزانه‌داری و گزارش تحلیلی' },
  { id:'enterprise', name:'Enterprise', fa:'سازمانی', detail:'تمام امکانات Professional به‌علاوه چندشرکتی، تلفیق و کنترل‌های سازمانی' },
];
const modules = [
  ['هسته حسابداری','ثبت دوطرفه، دفتر کل، معین و تفصیلی','پایه'],
  ['صندوق و خزانه‌داری','صندوق‌ها، انتقالات و مغایرت‌گیری','پایه'],
  ['مدیریت مشتریان','پرونده، مانده و گردش حساب','پایه'],
  ['معاملات و حواله','خریدوفروش ارز و انتقالات','پایه'],
  ['مدیریت شعب','شعب، کاربران و مجوزها','حرفه‌ای'],
  ['گزارش‌های تحلیلی','سود، زیان و عملکرد','حرفه‌ای'],
  ['چندشرکتی و تلفیق','گروه شرکت‌ها و گزارش تلفیقی','سازمانی'],
  ['کنترل داخلی و ممیزی','ردیابی تغییرات و سیاست‌های کنترلی','سازمانی'],
];
const tabs=[['requests','درخواست‌های ارتقا'],['users','مدیریت کاربران'],['plans','سطوح اشتراک'],['modules','ماژول‌ها'],['architecture','نقشه ساختار'],['settings','تنظیمات']];

export default function PreviewBuilderPanel() {
  const navigate=useNavigate();
  const [state,setState]=useState(()=>readPreviewState());
  const [startDate,setStartDate]=useState(new Date().toISOString().slice(0,10));
  const [duration,setDuration]=useState('1');
  const [tier,setTier]=useState('professional');
  const [tab,setTab]=useState('requests');
  const [notice,setNotice]=useState('');
  const request=state.request;
  const endDate=useMemo(()=>{
    if(!startDate)return '';
    const d=new Date(startDate+'T12:00:00');
    d.setFullYear(d.getFullYear()+Number(duration));
    d.setDate(d.getDate()-1);
    return d.toISOString().slice(0,10);
  },[startDate,duration]);
  const decide=(approved)=>{
    if(!request)return;
    const grant=approved?{tier,startDate,endDate,durationYears:Number(duration),status:'active'}:null;
    const next=writePreviewState({...state,request:{...request,status:approved?'approved':'rejected',decidedAt:new Date().toISOString(),decidedTier:tier},grant,audit:[...state.audit,{action:approved?'درخواست ارتقا تأیید شد':'درخواست ارتقا رد شد',at:new Date().toISOString()}]});
    setState(next);setNotice(approved?'درخواست آزمایشی تأیید شد و اعتبار آن ثبت شد.':'درخواست آزمایشی رد شد.');
  };
  const logout=()=>{clearPreviewSession();navigate('/',{replace:true});};
  return <main dir="rtl" className="min-h-screen bg-slate-950 p-4 text-slate-100 sm:p-8"><div className="mx-auto max-w-7xl">
    <header className="mb-6 flex flex-wrap items-center justify-between gap-3"><div><span className="inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-400/10 px-3 py-1 text-xs text-amber-200"><ShieldCheck className="h-4 w-4"/> سازنده — محیط آزمایشی</span><h1 className="mt-3 text-2xl font-bold sm:text-3xl">مرکز مدیریت و کنترل سامانه</h1><p className="mt-1 text-sm text-slate-400">مدیریت ساختار، کاربران، سطوح و درخواست‌ها؛ همه تغییرات فقط محلی و آزمایشی‌اند.</p></div><button onClick={logout} className="inline-flex items-center gap-2 rounded-lg border border-slate-700 px-4 py-2 text-sm"><LogOut className="h-4 w-4"/> خروج آزمایشی</button></header>
    <section className="mb-5 grid gap-3 sm:grid-cols-3">{[['۳ مسیر آزمایشی','نقش‌ها'],['Basic / Professional / Enterprise','سطوح اشتراک'],['قطع — مستقل','پایگاه داده']].map(([v,l])=><article key={l} className="rounded-xl border border-slate-800 bg-slate-900 p-4"><p className="text-sm text-slate-400">{l}</p><p className="mt-2 text-xl font-bold text-amber-300">{v}</p></article>)}</section>
    <nav className="mb-5 flex gap-2 overflow-x-auto pb-2">{tabs.map(([id,label])=><button key={id} onClick={()=>setTab(id)} className={`shrink-0 rounded-lg px-4 py-3 text-sm ${tab===id?'bg-amber-400 font-semibold text-slate-950':'border border-slate-700 bg-slate-900 text-slate-300'}`}>{label}</button>)}</nav>
    {tab==='requests'&&<section className="grid gap-4 lg:grid-cols-[1.1fr_.9fr]"><article className="rounded-2xl border border-slate-800 bg-slate-900 p-5"><h2 className="mb-4 flex items-center gap-2 text-lg font-semibold"><Clock3 className="h-5 w-5 text-amber-300"/> صف بررسی درخواست‌ها</h2>{!request?<div className="rounded-xl border border-dashed border-slate-700 p-8 text-center text-slate-400">درخواستی ثبت نشده است. از ورودی «صراف آزمایشی» درخواست ارتقا ثبت کنید.</div>:<><div className="rounded-xl border border-slate-700 bg-slate-950 p-4"><div className="flex justify-between gap-2"><strong>صراف آزمایشی</strong><span className="text-xs text-amber-200">{request.status==='pending'?'در انتظار بررسی':request.status==='approved'?'تأییدشده':'ردشده'}</span></div><p className="mt-3 text-sm text-slate-400">درخواست: {request.tier} · شناسه: {request.id}</p>{request.note&&<p className="mt-2 text-sm">{request.note}</p>}</div>{request.status==='pending'&&<div className="mt-4 space-y-3"><label className="block text-sm">سطح تعیین‌شده توسط سازنده<select value={tier} onChange={e=>setTier(e.target.value)} className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950 p-3">{plans.filter(p=>p.id!=='basic').map(p=><option key={p.id} value={p.id}>{p.name} — {p.fa}</option>)}</select></label><div className="grid gap-3 sm:grid-cols-2"><label className="text-sm">تاریخ شروع<input type="date" value={startDate} onChange={e=>setStartDate(e.target.value)} className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950 p-3"/></label><label className="text-sm">مدت اعتبار<select value={duration} onChange={e=>setDuration(e.target.value)} className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950 p-3"><option value="1">یک سال</option><option value="2">دو سال</option></select></label></div><p className="text-sm text-slate-400">تاریخ پایان محاسبه‌شده: <b className="text-amber-200">{endDate||'—'}</b></p><div className="flex flex-wrap gap-2"><button onClick={()=>decide(true)} className="inline-flex items-center gap-2 rounded-lg bg-emerald-500 px-4 py-3 font-semibold text-slate-950"><Check className="h-4 w-4"/> تأیید و فعال‌سازی</button><button onClick={()=>decide(false)} className="inline-flex items-center gap-2 rounded-lg border border-rose-400/40 px-4 py-3 text-rose-300"><X className="h-4 w-4"/> رد درخواست</button></div></div>}{notice&&<p className="mt-3 text-sm text-emerald-300">{notice}</p>}{request.status!=='pending'&&<p className="mt-3 text-sm text-slate-400">این درخواست بررسی شده؛ برای آزمایش مجدد از حساب صراف درخواست تازه ثبت کنید.</p>}</>}</article><article className="rounded-2xl border border-slate-800 bg-slate-900 p-5"><h2 className="mb-3 font-semibold">چرخه ارتقا و انقضا</h2><ol className="space-y-3 text-sm text-slate-300">{['ثبت‌نام صراف با Basic','ثبت درخواست Professional یا Enterprise','تعیین سطح، تاریخ شروع و مدت اعتبار','فعال‌شدن سطح تا تاریخ پایان','پس از انقضا، بازگشت به Basic'].map((x,i)=><li key={x} className="flex gap-3"><span className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-800 text-amber-300">{i+1}</span>{x}</li>)}</ol><p className="mt-4 text-xs leading-6 text-slate-500">انقضا در این نسخه بر اساس تاریخ مرورگر محاسبه می‌شود؛ نسخه نهایی باید در سمت سرور کنترل شود.</p></article></section>}
    {tab==='users'&&<section className="rounded-2xl border border-slate-800 bg-slate-900 p-5"><h2 className="mb-4 flex items-center gap-2 text-lg font-semibold"><Users className="h-5 w-5 text-amber-300"/> کاربران آزمایشی</h2><div className="overflow-x-auto"><table className="w-full text-right text-sm"><thead className="text-slate-400"><tr><th className="p-3">کاربر</th><th className="p-3">نقش</th><th className="p-3">سطح</th><th className="p-3">وضعیت</th></tr></thead><tbody>{[['مشتری آزمایشی','مشتری','—','فعال'],['صراف آزمایشی','صراف',state.grant?.tier||'Basic','فعال'],['سازنده آزمایشی','سازنده','مدیریت کل','فعال']].map(row=><tr key={row[0]} className="border-t border-slate-800">{row.map(cell=><td key={cell} className="p-3">{cell}</td>)}</tr>)}</tbody></table></div></section>}
    {tab==='plans'&&<section className="grid gap-3 md:grid-cols-3">{plans.map(p=><article key={p.id} className="rounded-2xl border border-slate-800 bg-slate-900 p-5"><Crown className="mb-3 h-6 w-6 text-amber-300"/><h2 className="text-xl font-bold">{p.name}</h2><p className="text-sm text-slate-400">{p.fa}</p><p className="mt-4 text-sm leading-7">{p.detail}</p><span className="mt-4 inline-block rounded-md bg-slate-800 px-3 py-1 text-xs text-slate-400">بدون قیمت‌گذاری</span></article>)}</section>}
    {tab==='modules'&&<section className="rounded-2xl border border-slate-800 bg-slate-900 p-5"><h2 className="mb-4 flex items-center gap-2 text-lg font-semibold"><Layers3 className="h-5 w-5 text-amber-300"/> کاتالوگ ماژول‌ها</h2><div className="grid gap-3 md:grid-cols-2">{modules.map(([name,desc,level])=><article key={name} className="rounded-xl border border-slate-800 bg-slate-950 p-4"><div className="flex justify-between gap-2"><b>{name}</b><span className="text-xs text-amber-300">{level}</span></div><p className="mt-2 text-sm text-slate-400">{desc}</p></article>)}</div></section>}
    {tab==='architecture'&&<section className="grid gap-3 md:grid-cols-2">{[['هسته مالی','دفتر کل، معین، تفصیلی، اسناد و تراز آزمایشی'],['عملیات صرافی','مشتریان، ارزها، معاملات، حواله و انتقال'],['نقدینگی','صندوق، بانک، خزانه‌داری و مغایرت‌گیری'],['مدیریت سازمان','شعب، کاربران، نقش‌ها و مجوزها'],['کنترل و گزارش','گزارش‌ها، ممیزی، تأییدها و کنترل داخلی'],['خدمات مشتری','کیف پول، سفارش‌ها، خدمات و پشتیبانی']].map(([a,b])=><article key={a} className="rounded-xl border border-slate-800 bg-slate-900 p-5"><h3 className="font-semibold">{a}</h3><p className="mt-2 text-sm leading-6 text-slate-400">{b}</p></article>)}</section>}
    {tab==='settings'&&<section className="rounded-2xl border border-slate-800 bg-slate-900 p-5"><h2 className="mb-4 font-semibold">تنظیمات و کنترل‌های سازنده</h2><div className="grid gap-3 sm:grid-cols-2">{['مدیریت سطوح و قابلیت‌ها','مدیریت نقش‌ها و مجوزها','سیاست ارتقا و مدت اعتبار','نسخه‌ها و وضعیت تکمیل ماژول‌ها','تنظیمات عمومی سامانه','گزارش رویدادهای مدیریتی'].map(x=><div key={x} className="rounded-lg bg-slate-950 p-4 text-sm">{x}<span className="mr-2 text-xs text-slate-500">ساختار نمایشی</span></div>)}</div><p className="mt-4 text-xs text-slate-500">پرداخت، پایگاه داده و کاربران واقعی عمداً غیرفعال‌اند.</p></section>}
    <footer className="mt-7 flex flex-wrap justify-between gap-3 border-t border-slate-800 pt-5 text-sm text-slate-400"><span>تمام داده‌ها فقط در مرورگر ذخیره می‌شوند.</span><Link to="/" className="inline-flex items-center gap-2 text-amber-300"><ArrowRight className="h-4 w-4"/> صفحه ورودی‌ها</Link></footer>
  </div></main>;
}
