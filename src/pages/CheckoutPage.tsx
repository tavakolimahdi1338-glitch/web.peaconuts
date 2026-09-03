import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { formatPrice, toPersianDigits } from '../lib/formatters';
import type { DeliveryMethod, Order, Product } from '../types';
import {
  User,
  Phone,
  Truck,
  Building,
  Tag,
  CreditCard,
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  FileText,
  FileCheck,
  ShoppingBag,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';

export const CheckoutPage: React.FC = () => {
  const {
    cart,
    clearCart,
    settings,
    setCurrentView,
    showToast,
    getCartSubtotal,
  } = useStore();

  // Form State
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>('post');
  const [address, setAddress] = useState('');
  const [details, setDetails] = useState('');

  // Coupon State
  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string;
    discount_amount: number;
    message: string;
  } | null>(null);
  const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);
  const [couponError, setCouponError] = useState<string | null>(null);

  // Upload State
  const [receiptFile, setReceiptFile] = useState<{
    base64: string;
    filename: string;
    mimeType: string;
    previewUrl?: string;
  } | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedReceiptUrl, setUploadedReceiptUrl] = useState<string | null>(null);

  // Submission State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdOrder, setCreatedOrder] = useState<Order | null>(null);
  const [copiedCard, setCopiedCard] = useState(false);

  const subtotal = getCartSubtotal();

  // Calculate Product-level discounts for savings
  const productSavings = cart.reduce((sum, item) => {
    const basePrice = item.product[`price_${item.weight}` as keyof Product] as number;
    const disc = (item.product[`discount_${item.weight}` as keyof Product] as number) || 0;
    const unitPrice = Math.round(basePrice * (1 - disc / 100));
    return sum + (basePrice - unitPrice) * item.quantity;
  }, 0);

  const shippingCost = deliveryMethod === 'post' ? (settings?.shipping_cost || 0) : 0;
  const couponDiscount = appliedCoupon ? appliedCoupon.discount_amount : 0;
  const totalPayable = Math.max(0, subtotal - couponDiscount + shippingCost);
  const totalCustomerSavings = productSavings + couponDiscount;

  // Copy card number to clipboard
  const handleCopyCard = () => {
    if (!settings?.card_number) return;
    navigator.clipboard.writeText(settings.card_number.replace(/-/g, '').trim());
    setCopiedCard(true);
    showToast('شماره کارت با موفقیت کپی شد.', 'success');
    setTimeout(() => setCopiedCard(false), 2500);
  };

  // Validate coupon handler
  const handleApplyCoupon = async () => {
    if (!couponInput.trim()) {
      setCouponError('لطفاً کد تخفیف را وارد کنید.');
      return;
    }

    setIsValidatingCoupon(true);
    setCouponError(null);

    try {
      const res = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: couponInput.trim(),
          phone: phone.trim(),
          subtotal,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setCouponError(data.error || 'کد تخفیف نامعتبر است.');
        setAppliedCoupon(null);
      } else {
        setAppliedCoupon({
          code: data.code,
          discount_amount: data.discount_amount,
          message: data.message,
        });
        showToast(data.message, 'success');
      }
    } catch {
      setCouponError('خطا در برقراری ارتباط با سرور.');
    } finally {
      setIsValidatingCoupon(false);
    }
  };

  // File upload handler (Max 5MB, JPG/PNG/WebP/PDF)
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedMimes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
    if (!allowedMimes.includes(file.type)) {
      showToast('فرمت فایل مجاز نیست. فقط تصویر (JPG, PNG, WebP) یا PDF بارگذاری کنید.', 'error');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showToast('حجم فایل نباید بیش از ۵ مگابایت باشد.', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      setReceiptFile({
        base64,
        filename: file.name,
        mimeType: file.type,
        previewUrl: file.type.startsWith('image/') ? base64 : undefined,
      });
      // Clear previous uploaded URL so we re-upload
      setUploadedReceiptUrl(null);
    };
    reader.readAsDataURL(file);
  };

  // Submit Order
  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!customerName.trim()) {
      showToast('لطفاً نام و نام خانوادگی خود را وارد کنید.', 'error');
      return;
    }
    if (!phone.trim() || phone.trim().length < 10) {
      showToast('لطفاً شماره تماس معتبر (حداقل ۱۰ رقم) وارد کنید.', 'error');
      return;
    }
    if (deliveryMethod === 'post' && !address.trim()) {
      showToast('برای ارسال پستی، درج آدرس دقیق الزامی است.', 'error');
      return;
    }
    if (!receiptFile && !uploadedReceiptUrl) {
      showToast('لطفاً تصویر یا فایل فیش واریزی را بارگذاری کنید.', 'error');
      return;
    }

    setIsSubmitting(true);

    try {
      // Step 1: Upload receipt file to server if not already uploaded
      let finalReceiptUrl = uploadedReceiptUrl;
      if (!finalReceiptUrl && receiptFile) {
        setIsUploading(true);
        const uploadRes = await fetch('/api/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            base64: receiptFile.base64,
            filename: receiptFile.filename,
            mimeType: receiptFile.mimeType,
          }),
        });

        const uploadData = await uploadRes.json();
        if (!uploadRes.ok) {
          throw new Error(uploadData.error || 'خطا در بارگذاری رسید بانکی');
        }
        finalReceiptUrl = uploadData.url;
        setUploadedReceiptUrl(finalReceiptUrl);
        setIsUploading(false);
      }

      // Step 2: Submit order to backend
      const rawItems = cart.map((c) => ({
        product_id: c.product.id,
        weight: c.weight,
        quantity: c.quantity,
      }));

      const orderRes = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_name: customerName.trim(),
          phone: phone.trim(),
          delivery_method: deliveryMethod,
          address: deliveryMethod === 'post' ? address.trim() : '',
          details: details.trim(),
          raw_items: rawItems,
          coupon_code: appliedCoupon ? appliedCoupon.code : undefined,
          receipt_url: finalReceiptUrl,
        }),
      });

      const orderData = await orderRes.json();
      if (!orderRes.ok) {
        throw new Error(orderData.error || 'خطا در ثبت نهایی سفارش');
      }

      setCreatedOrder(orderData.order);
      clearCart();
      showToast('سفارش شما با موفقیت ثبت شد!', 'success');
    } catch (err: any) {
      showToast(err.message || 'خطایی در ثبت سفارش رخ داد.', 'error');
    } finally {
      setIsSubmitting(false);
      setIsUploading(false);
    }
  };

  // If order was created successfully, show celebratory success screen
  if (createdOrder) {
    return (
      <div className="max-w-2xl mx-auto py-10 px-4">
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-emerald-200 shadow-xl text-center space-y-6">
          <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full">
              سفارش با موفقیت ثبت شد
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-[#451a03]">
              از خرید و اعتماد شما سپاسگزاریم!
            </h1>
            <p className="text-sm text-[#78716c] max-w-md mx-auto leading-relaxed">
              رسید بانکی شما دریافت شد و پس از تأیید در پنل مدیریت، سفارش شما به سرعت آماده‌سازی و ارسال می‌گردد.
            </p>
          </div>

          {/* Order Code Box */}
          <div className="bg-[#fbf9f5] border border-[#ebdccb] rounded-2xl p-5 space-y-2 max-w-sm mx-auto">
            <span className="text-xs text-[#78716c]">کد پیگیری اختصاصی سفارش شما:</span>
            <div className="font-mono text-2xl font-black text-[#78350f] tracking-widest selection:bg-amber-200">
              {createdOrder.order_code}
            </div>
            <p className="text-[11px] text-[#a8a29e]">
              این کد را یادداشت کنید یا از صفحه پیگیری سفارش برای مشاهده وضعیت استفاده نمایید.
            </p>
          </div>

          {/* Quick Details */}
          <div className="bg-[#faf7f2] p-4 rounded-2xl text-xs space-y-2 text-right border border-[#ebdccb]">
            <div className="flex justify-between">
              <span className="text-[#78716c]">نام مشتری:</span>
              <span className="font-bold text-[#451a03]">{createdOrder.customer_name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#78716c]">روش تحویل:</span>
              <span className="font-bold text-[#451a03]">
                {createdOrder.delivery_method === 'pickup' ? 'تحویل حضوری در کارگاه' : 'ارسال پستی پیشتاز'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#78716c]">مبلغ نهایی پرداختی:</span>
              <span className="font-black text-[#78350f]">
                {formatPrice(createdOrder.total)} تومان
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              onClick={() => setCurrentView('track')}
              className="w-full sm:w-auto bg-[#78350f] hover:bg-[#b45309] text-white px-6 py-3 rounded-xl font-bold text-sm shadow-md transition-all cursor-pointer"
            >
              پیگیری این سفارش
            </button>
            <button
              onClick={() => setCurrentView('home')}
              className="w-full sm:w-auto bg-[#faf7f2] hover:bg-[#ebdccb] text-[#451a03] border border-[#d6cbbf] px-6 py-3 rounded-xl font-bold text-sm transition-all cursor-pointer"
            >
              بازگشت به صفحه اصلی
            </button>
          </div>
        </div>
      </div>
    );
  }

  // If cart is empty
  if (cart.length === 0) {
    return (
      <div className="max-w-md mx-auto py-16 px-4 text-center space-y-4">
        <div className="w-20 h-20 rounded-3xl bg-[#ebdccb]/50 text-4xl flex items-center justify-center mx-auto">
          🛒
        </div>
        <h2 className="text-xl font-black text-[#451a03]">سبد خرید شما در حال حاضر خالی است</h2>
        <p className="text-xs text-[#78716c]">
          برای ثبت سفارش، ابتدا محصولات مورد نظر خود را به سبد خرید اضافه کنید.
        </p>
        <button
          onClick={() => setCurrentView('shop')}
          className="bg-[#78350f] hover:bg-[#b45309] text-white px-6 py-2.5 rounded-xl font-bold text-sm shadow-md cursor-pointer"
        >
          رفتن به فروشگاه
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      {/* Page Title */}
      <div className="border-b border-[#e8dfd5] pb-4 flex items-center justify-between">
        <div>
          <span className="text-xs font-bold text-[#b45309]">تسویه حساب</span>
          <h1 className="text-2xl sm:text-3xl font-black text-[#451a03]">
            تکمیل اطلاعات و ثبت سفارش
          </h1>
        </div>
        <button
          onClick={() => setCurrentView('shop')}
          className="text-xs font-bold text-[#78716c] hover:text-[#451a03] flex items-center gap-1 cursor-pointer"
        >
          <span>بازگشت به فروشگاه</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      <form onSubmit={handleSubmitOrder} className="space-y-8">
        {/* Step 1: Customer Info & Delivery Method */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#e8dfd5] shadow-xs space-y-6">
          <div className="flex items-center gap-2.5 text-[#78350f] font-black text-lg border-b border-[#ebdccb] pb-3">
            <User className="w-5 h-5 text-[#d97706]" />
            <span>گام اول: مشخصات تحویل‌گیرنده و روش ارسال</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#451a03] mb-1.5">
                نام و نام خانوادگی <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="مثال: مهدی تهرانی"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm bg-[#faf7f2] border border-[#d6cbbf] rounded-xl focus:outline-none focus:border-[#78350f]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#451a03] mb-1.5">
                شماره تماس (جهت هماهنگی و پیگیری) <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                required
                placeholder="۰۹۱۲۳۴۵۶۷۸۹"
                dir="ltr"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm bg-[#faf7f2] border border-[#d6cbbf] rounded-xl focus:outline-none focus:border-[#78350f] text-right"
              />
            </div>
          </div>

          {/* Delivery Method Selection */}
          <div className="space-y-2 pt-2">
            <label className="block text-xs font-bold text-[#451a03]">
              روش تحویل سفارش <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setDeliveryMethod('post')}
                className={`p-4 rounded-2xl border text-right transition-all flex items-center justify-between cursor-pointer ${
                  deliveryMethod === 'post'
                    ? 'border-[#78350f] bg-[#fbf5ed] shadow-xs'
                    : 'border-[#e2d5c3] bg-white hover:border-[#b45309]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                      deliveryMethod === 'post' ? 'border-[#78350f] bg-[#78350f]' : 'border-[#a8a29e]'
                    }`}
                  >
                    {deliveryMethod === 'post' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                  </div>
                  <div>
                    <span className="font-bold text-sm text-[#451a03] block">ارسال با پست پیشتاز</span>
                    <span className="text-xs text-[#78716c]">تحویل درب منزل در سراسر کشور</span>
                  </div>
                </div>
                <span className="text-xs font-bold text-[#78350f]">
                  {formatPrice(settings?.shipping_cost || 45000)} تومان
                </span>
              </button>

              <button
                type="button"
                onClick={() => setDeliveryMethod('pickup')}
                className={`p-4 rounded-2xl border text-right transition-all flex items-center justify-between cursor-pointer ${
                  deliveryMethod === 'pickup'
                    ? 'border-[#78350f] bg-[#fbf5ed] shadow-xs'
                    : 'border-[#e2d5c3] bg-white hover:border-[#b45309]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                      deliveryMethod === 'pickup' ? 'border-[#78350f] bg-[#78350f]' : 'border-[#a8a29e]'
                    }`}
                  >
                    {deliveryMethod === 'pickup' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                  </div>
                  <div>
                    <span className="font-bold text-sm text-[#451a03] block">تحویل حضوری در کارگاه</span>
                    <span className="text-xs text-[#78716c]">مراجعه به آدرس کارگاه با هماهنگی</span>
                  </div>
                </div>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">
                  رایگان
                </span>
              </button>
            </div>
          </div>

          {/* Postal Address (Mandatory for post) */}
          {deliveryMethod === 'post' && (
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-[#451a03]">
                آدرس کامل پستی (شامل شهر، خیابان، پلاک و کدپستی) <span className="text-red-500">*</span>
              </label>
              <textarea
                required
                rows={2}
                placeholder="مثال: تهران، تجریش، خیابان فناخسرو، کوچه نگار، پلاک ۱۰، واحد ۲"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm bg-[#faf7f2] border border-[#d6cbbf] rounded-xl focus:outline-none focus:border-[#78350f]"
              />
            </div>
          )}

          {/* Optional Notes */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-[#78716c]">
              توضیحات اختیاری (نکات بسته‌بندی یا زمان تحویل)
            </label>
            <input
              type="text"
              placeholder="مثال: لطفاً بعد از ظهر تحویل شود"
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              className="w-full px-3.5 py-2 text-sm bg-[#faf7f2] border border-[#d6cbbf] rounded-xl focus:outline-none focus:border-[#78350f]"
            />
          </div>
        </div>

        {/* Step 2: Discount Coupon */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#e8dfd5] shadow-xs space-y-4">
          <div className="flex items-center gap-2.5 text-[#78350f] font-black text-lg border-b border-[#ebdccb] pb-3">
            <Tag className="w-5 h-5 text-[#d97706]" />
            <span>گام دوم: کد تخفیف</span>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <input
                type="text"
                placeholder="کد تخفیف را وارد کنید (مثال: WELCOME10)"
                value={couponInput}
                onChange={(e) => {
                  setCouponInput(e.target.value);
                  setCouponError(null);
                }}
                className="w-full px-3.5 py-2.5 text-sm bg-[#faf7f2] border border-[#d6cbbf] rounded-xl focus:outline-none focus:border-[#78350f] uppercase"
              />
            </div>
            <button
              type="button"
              onClick={handleApplyCoupon}
              disabled={isValidatingCoupon || !couponInput.trim()}
              className="bg-[#78350f] hover:bg-[#b45309] text-white px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm disabled:opacity-40 transition-colors cursor-pointer"
            >
              {isValidatingCoupon ? 'در حال بررسی...' : 'اعمال کد تخفیف'}
            </button>
          </div>

          {couponError && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{couponError}</span>
            </div>
          )}

          {appliedCoupon && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="font-bold">
                  کد «{appliedCoupon.code}» با موفقیت اعمال شد. تخفیف: {formatPrice(appliedCoupon.discount_amount)} تومان
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setAppliedCoupon(null);
                  setCouponInput('');
                }}
                className="text-red-600 hover:text-red-700 text-xs underline cursor-pointer"
              >
                حذف کد
              </button>
            </div>
          )}
        </div>

        {/* Step 3: Final Invoice & Bank Card Details */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#e8dfd5] shadow-xs space-y-6">
          <div className="flex items-center gap-2.5 text-[#78350f] font-black text-lg border-b border-[#ebdccb] pb-3">
            <CreditCard className="w-5 h-5 text-[#d97706]" />
            <span>گام سوم: فاکتور نهایی و اطلاعات پرداخت کارت به کارت</span>
          </div>

          {/* Items Summary Breakdown */}
          <div className="space-y-2 border border-[#ebdccb] rounded-2xl p-4 bg-[#faf7f2]">
            <h3 className="text-xs font-bold text-[#78716c] pb-1 border-b border-[#ebdccb]">
              اقلام انتخابی:
            </h3>
            {cart.map((item) => {
              const basePrice = item.product[`price_${item.weight}` as keyof Product] as number;
              const disc = (item.product[`discount_${item.weight}` as keyof Product] as number) || 0;
              const unitPrice = Math.round(basePrice * (1 - disc / 100));

              return (
                <div
                  key={`${item.product.id}-${item.weight}`}
                  className="flex items-center justify-between text-xs py-1"
                >
                  <span className="text-[#451a03]">
                    {item.product.name} ({toPersianDigits(item.weight)} گرم) × {toPersianDigits(item.quantity)}
                  </span>
                  <span className="font-bold text-[#78350f]">
                    {formatPrice(unitPrice * item.quantity)} تومان
                  </span>
                </div>
              );
            })}
          </div>

          {/* Invoice Calculation Table */}
          <div className="bg-[#f2ece2] p-4 sm:p-5 rounded-2xl border border-[#e2d5c3] space-y-2.5 text-sm">
            <div className="flex justify-between text-[#57534e]">
              <span>مجموع قیمت محصولات:</span>
              <span className="font-bold">{formatPrice(subtotal)} تومان</span>
            </div>

            {appliedCoupon && (
              <div className="flex justify-between text-emerald-700">
                <span>تخفیف کد ({appliedCoupon.code}):</span>
                <span className="font-bold">- {formatPrice(appliedCoupon.discount_amount)} تومان</span>
              </div>
            )}

            <div className="flex justify-between text-[#57534e]">
              <span>هزینه ارسال:</span>
              <span className="font-bold">
                {deliveryMethod === 'pickup'
                  ? 'تحویل حضوری در کارگاه (رایگان)'
                  : `${formatPrice(shippingCost)} تومان`}
              </span>
            </div>

            <div className="pt-2 border-t border-[#dfd2c0] flex justify-between items-center text-base">
              <span className="font-black text-[#451a03]">مبلغ نهایی قابل واریز:</span>
              <span className="font-black text-xl text-[#78350f]">
                {formatPrice(totalPayable)} تومان
              </span>
            </div>

            {totalCustomerSavings > 0 && (
              <div className="pt-1 text-xs text-emerald-700 font-bold bg-emerald-50/70 p-2 rounded-xl flex items-center gap-1.5 border border-emerald-200">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>
                  سود شما از این خرید: {formatPrice(totalCustomerSavings)} تومان (تخفیف محصولات + تخفیف کد)
                </span>
              </div>
            )}
          </div>

          {/* Official Bank Card Box */}
          <div className="bg-gradient-to-r from-[#451a03] to-[#78350f] text-white p-5 sm:p-6 rounded-2xl shadow-lg space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-amber-300" />
                <span className="text-xs text-amber-200 font-bold">شماره کارت رسمی جهت واریز وجه</span>
              </div>
              <span className="text-[11px] bg-white/20 px-2 py-0.5 rounded text-amber-100">
                بانک ملی / شتاب
              </span>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-black/20 p-3.5 rounded-xl border border-white/10">
              <div className="font-mono text-xl sm:text-2xl font-black text-amber-200 tracking-wider text-left sm:text-right" dir="ltr">
                {settings?.card_number || '۶۰۳۷-۹۹۷۵-۱۲۳۴-۵۶۷۸'}
              </div>

              <button
                type="button"
                onClick={handleCopyCard}
                className="bg-amber-500 hover:bg-amber-400 text-[#451a03] font-bold px-3.5 py-1.5 rounded-lg text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                {copiedCard ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{copiedCard ? 'کپی شد!' : 'کپی شماره کارت'}</span>
              </button>
            </div>

            <div className="flex items-center justify-between text-xs text-[#e7dfd5] pt-1">
              <span>نام صاحب حساب:</span>
              <span className="font-black text-white text-sm">{settings?.card_holder || 'مدیر فروشگاه'}</span>
            </div>
          </div>
        </div>

        {/* Step 4: Receipt Upload */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#e8dfd5] shadow-xs space-y-4">
          <div className="flex items-center gap-2.5 text-[#78350f] font-black text-lg border-b border-[#ebdccb] pb-3">
            <UploadCloud className="w-5 h-5 text-[#d97706]" />
            <span>گام چهارم: بارگذاری رسید یا فیش واریزی</span>
          </div>

          <p className="text-xs text-[#78716c] leading-relaxed">
            لطفاً پس از واریز به شماره کارت بالا، اسکرین‌شات یا عکس فیش خود را در کادر زیر انتخاب نمایید.
            (فرمت‌های مجاز: JPG, PNG, WebP یا PDF — حداکثر حجم ۵ مگابایت)
          </p>

          <div className="border-2 border-dashed border-[#d6cbbf] hover:border-[#78350f] rounded-2xl p-6 text-center bg-[#faf7f2] transition-colors relative cursor-pointer">
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,application/pdf"
              onChange={handleFileChange}
              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
            />

            {receiptFile ? (
              <div className="flex flex-col items-center space-y-3">
                {receiptFile.previewUrl ? (
                  <div className="w-32 h-32 rounded-xl overflow-hidden border border-[#ebdccb] shadow-sm">
                    <img
                      src={receiptFile.previewUrl}
                      alt="رسید واریزی"
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <FileText className="w-12 h-12 text-[#78350f]" />
                )}

                <div className="text-xs font-bold text-[#451a03] flex items-center gap-1.5">
                  <FileCheck className="w-4 h-4 text-emerald-600" />
                  <span>فایل انتخاب شده: {receiptFile.filename}</span>
                </div>
                <span className="text-[11px] text-[#78716c]">برای تغییر فایل، کلیک کنید</span>
              </div>
            ) : (
              <div className="flex flex-col items-center space-y-2">
                <UploadCloud className="w-10 h-10 text-[#a8a29e]" />
                <span className="text-sm font-bold text-[#451a03]">
                  کلیک کنید یا فایل رسید را اینجا رها کنید
                </span>
                <span className="text-xs text-[#a8a29e]">
                  پشتیبانی از عکس فیش یا فایل PDF بانکی
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Step 5: Submit Order Button */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={isSubmitting || isUploading}
            className="w-full bg-[#d97706] hover:bg-[#b45309] text-white py-4 rounded-2xl font-black text-base shadow-xl shadow-amber-600/30 transition-all transform active:scale-98 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
          >
            {isSubmitting || isUploading ? (
              <span>در حال بارگذاری رسید و ثبت سفارش...</span>
            ) : (
              <>
                <ShieldCheck className="w-5 h-5" />
                <span>ثبت نهایی سفارش و ارسال رسید بانکی</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
