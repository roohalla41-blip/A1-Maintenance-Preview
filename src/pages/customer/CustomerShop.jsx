import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ShoppingCart, Phone, CheckCircle, Clock, Package, Loader2, ArrowRight, Store, Handshake, ShieldCheck, WalletCards } from 'lucide-react';
import { SAMPLE_PRODUCTS, createSellerOrder, loadCustomerOrders, loadPricingSettings } from '@/lib/sellerApi';

const ORDER_STATUS_LABELS = {
  pending: 'در انتظار فروشنده',
  assigned: 'تخصیص‌یافته',
  in_progress: 'در حال انجام',
  completed: 'انجام‌شده',
  failed: 'ناموفق',
  disputed: 'در بررسی',
};

const fmtNum = (n) => Number(n || 0).toLocaleString('fa-IR');

export default function CustomerShop() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [orders, setOrders] = useState([]);
  const [pricing, setPricing] = useState(null);
  const [loading, setLoading] = useState(true);\n  const [activeTab, setActiveTab] = useState('catalog');

  const loadData = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const [o, p] = await Promise.all([
        loadCustomerOrders(user.id),
        loadPricingSettings(),
      ]);
      setOrders(o || []);
      setPricing(p);
    } catch (err) {
      toast({ title: 'خطا', description: err.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  useEffect(() => { loadData(); }, [loadData]);

  const getDisplayPrice = (product) => {
    if (!pricing) return product.base_price;
    const markup = (pricing.amount || 0) + Math.round(product.base_price * (pricing.percent || 0) / 100);
    return product.base_price + markup;
  };

  const handleSubmit = async () => {
    if (!selectedProduct) { toast({ title: 'خطا', description: 'یک محصول انتخاب کنید', variant: 'destructive' }); return; }
    if (!phoneNumber || phoneNumber.length < 8) { toast({ title: 'خطا', description: 'شماره موبایل مقصد را درست وارد کنید', variant: 'destructive' }); return; }
    setSubmitting(true);
    try {
      const salePrice = getDisplayPrice(selectedProduct);
      const markupAmount = salePrice - selectedProduct.base_price;
      const sellerShare = Math.round(markupAmount * (pricing?.seller_share_percent || 50) / 100);
      const creatorShare = markupAmount - sellerShare;

      await createSellerOrder({
        customer_id: user.id,
        customer_name: user.full_name || user.name || '',
        phone_number: phoneNumber,
        product_key: selectedProduct.key,
        product_name: selectedProduct.name,
        operator_key: selectedProduct.operator_key,
        operator_name: selectedProduct.operator_name,
        package_type: selectedProduct.package_type,
        base_price: selectedProduct.base_price,
        currency: selectedProduct.currency,
        markup: pricing,
        commission_rate: pricing?.seller_share_percent || 50,
      });
      toast({ title: 'سفارش ثبت شد', description: 'سفارش شما در انتظار قبول توسط فروشنده است' });
      setSelectedProduct(null);
      setPhoneNumber('');
      loadData();
    } catch (err) {
      toast({ title: 'خطا', description: err.message, variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-[60vh]"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-4 p-4 max-w-4xl mx-auto" dir="rtl">
      {/* بنر آزمایشی */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-center gap-2">
        <Badge variant="outline" className="text-amber-600 border-amber-300 bg-amber-100 shrink-0">آزمایشی</Badge>
        <p className="text-xs text-amber-700">قیمت‌ها نمونه‌اند و قیمت واقعی نیستند. اتصال API افغان۵ هنوز برقرار نشده است.</p>
      </div>

      <div className="flex items-center gap-2">
        <ShoppingCart className="w-6 h-6 text-primary" />
        <h1 className="text-lg font-bold">خرید شارژ و بسته اینترنت</h1>
      </div>

      <div className="grid grid-cols-3 gap-2" role="tablist" aria-label="بخش‌های بازار خدمات">
        {[
          ['catalog','فروشگاه',ShoppingCart],
          ['orders','سفارش‌های من',Package],
          ['seller','همکاری فروش',Store],
        ].map(([key,label,Icon]) => (
          <button key={key} type="button" role="tab" aria-selected={activeTab===key}
            onClick={() => { setActiveTab(key); setSelectedProduct(null); }}
            className={`flex min-h-12 items-center justify-center gap-1.5 rounded-xl border px-2 py-2 text-xs font-semibold ${activeTab===key?'border-primary bg-primary/10 text-primary':'bg-card text-muted-foreground'}`}>
            <Icon className="h-4 w-4"/>{label}
          </button>
        ))}
      </div>

      {activeTab === 'seller' && (
        <div className="space-y-3">
          <Card><CardContent className="space-y-3 p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-primary/10 p-3 text-primary"><Handshake className="h-6 w-6"/></div>
              <div><h2 className="font-bold">درخواست همکاری به‌عنوان فروشنده</h2><p className="text-xs text-muted-foreground">فروشنده یک نقش/مجوز اضافه روی همین حساب مشتری است؛ پنل جداگانه‌ای ساخته نمی‌شود.</p></div>
            </div>
            <div className="rounded-lg border bg-muted/30 p-3 text-xs leading-6">
              <p className="font-semibold">نحوه کار فروشندگی در حساب صراف</p>
              <ol className="mt-2 list-decimal space-y-1 pr-4 text-muted-foreground">
                <li>مشتری از همین حساب درخواست همکاری می‌دهد.</li>
                <li>سازنده یا مدیر مجاز، درخواست را بررسی و فروشندگی را تأیید یا رد می‌کند.</li>
                <li>سازنده کاتالوگ، قیمت پایه، قیمت فروش و سهم کمیسیون را تعیین می‌کند.</li>
                <li>فروشنده فقط محصولات و قیمت‌های تأییدشده را می‌بیند و سفارش‌های تخصیص‌یافته را انجام می‌دهد.</li>
                <li>گزارش فروش، سفارش‌ها، کمیسیون و تسویه در همین فضای مشتری نمایش داده می‌شود.</li>
              </ol>
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              <div className="rounded-lg border p-3"><p className="flex items-center gap-2 text-xs font-semibold"><ShieldCheck className="h-4 w-4 text-primary"/>کنترل قیمت</p><p className="mt-1 text-xs leading-5 text-muted-foreground">فروشنده اجازه تغییر قیمت مصوب سازنده را ندارد.</p></div>
              <div className="rounded-lg border p-3"><p className="flex items-center gap-2 text-xs font-semibold"><WalletCards className="h-4 w-4 text-primary"/>حساب و تسویه</p><p className="mt-1 text-xs leading-5 text-muted-foreground">درآمد، کمیسیون، مانده قابل تسویه و سوابق پرداخت جداگانه قابل مشاهده خواهد بود.</p></div>
            </div>
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs leading-5 text-amber-900">
              <strong>وضعیت این بخش: اسکلت طراحی</strong>
              <p>فرم ثبت درخواست، بررسی مدارک، تأیید سازنده، تخصیص محصولات و میزکار سفارش‌های فروشنده در مرحله اتصال آزمایشی تکمیل می‌شود. در این نسخه هیچ درخواست واقعی ارسال نمی‌شود.</p>
            </div>
            <Button className="w-full" variant="outline" disabled>درخواست همکاری فروشنده · در حال تکمیل</Button>
          </CardContent></Card>
        </div>
      )}

      {activeTab === 'catalog' && (
      <>
      {/* فهرست محصولات */}
      {!selectedProduct ? (
        <>
          <h2 className="text-sm font-semibold text-muted-foreground">محصولات را انتخاب کنید</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {SAMPLE_PRODUCTS.map(p => {
              const price = getDisplayPrice(p);
              return (
                <Card key={p.key} className="cursor-pointer hover:border-primary hover:shadow-card-hover transition-all" onClick={() => setSelectedProduct(p)}>
                  <CardContent className="p-3 text-center">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-2">
                      {p.package_type === 'internet' ? <Package className="w-5 h-5 text-primary" /> : <Phone className="w-5 h-5 text-primary" />}
                    </div>
                    <p className="text-xs font-bold leading-tight mb-1">{p.name}</p>
                    <p className="text-[10px] text-muted-foreground mb-1">{p.operator_name}</p>
                    <p className="text-sm font-bold text-primary">{fmtNum(price)} <span className="text-[10px]">{p.currency}</span></p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </>
      ) : (
        /* فرم سفارش */
        <Card>
          <CardContent className="p-4 space-y-3">
            <button onClick={() => setSelectedProduct(null)} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
              <ArrowRight className="w-3 h-3" />بازگشت به محصولات
            </button>
            <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                {selectedProduct.package_type === 'internet' ? <Package className="w-6 h-6 text-primary" /> : <Phone className="w-6 h-6 text-primary" />}
              </div>
              <div className="flex-1">
                <p className="font-bold text-sm">{selectedProduct.name}</p>
                <p className="text-xs text-muted-foreground">{selectedProduct.operator_name}</p>
              </div>
              <p className="font-bold text-primary">{fmtNum(getDisplayPrice(selectedProduct))} {selectedProduct.currency}</p>
            </div>
            <div>
              <Label className="text-xs">شماره موبایل مقصد</Label>
              <Input
                value={phoneNumber}
                onChange={e => setPhoneNumber(e.target.value.replace(/[^0-9+]/g, ''))}
                placeholder="07xxxxxxxxx"
                className="text-base"
                inputMode="tel"
              />
            </div>
            <div className="bg-muted/30 rounded-lg p-2 text-[10px] text-muted-foreground space-y-0.5">
              <div className="flex justify-between"><span>قیمت پایه:</span><span>{fmtNum(selectedProduct.base_price)} {selectedProduct.currency}</span></div>
              <div className="flex justify-between"><span>قیمت فروش:</span><span>{fmtNum(getDisplayPrice(selectedProduct))} {selectedProduct.currency}</span></div>
              <div className="flex justify-between"><span>افزایش:</span><span>{fmtNum(getDisplayPrice(selectedProduct) - selectedProduct.base_price)}</span></div>
            </div>
            <Button className="w-full" onClick={handleSubmit} disabled={submitting}>
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'ثبت سفارش'}
            </Button>
          </CardContent>
        </Card>
      )}

      </>
      )}

      {activeTab === 'orders' && (
      <>
      {/* سفارش‌های من */}
      {orders.length > 0 && (
        <div className="space-y-2">
          <h2 className="text-sm font-semibold flex items-center gap-1">
            <Clock className="w-4 h-4" />سفارش‌های من
          </h2>
          {orders.slice(0, 10).map(o => (
            <Card key={o.id}>
              <CardContent className="p-3 flex items-center justify-between">
                <div className="min-w-0">
                  <p className="font-mono text-[10px] text-muted-foreground">{o.order_code}</p>
                  <p className="font-bold text-sm truncate">{o.product_name}</p>
                  <p className="text-xs text-muted-foreground">شماره: {o.phone_number}</p>
                </div>
                <div className="text-left shrink-0">
                  <p className="font-bold text-sm">{fmtNum(o.sale_price)}</p>
                  <Badge variant="outline" className="text-[10px] mt-1">{ORDER_STATUS_LABELS[o.status] || o.status}</Badge>
                  {o.seller_name && <p className="text-[10px] text-muted-foreground mt-0.5">{o.seller_name}</p>}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      </>
      )}
    </div>
  );
}