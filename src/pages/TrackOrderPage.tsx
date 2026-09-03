import React, { useState } from 'react';
import type { Order, OrderStatus } from '../types';
import { formatPrice, toPersianDigits, formatDate } from '../lib/formatters';
import {
  Search,
  CheckCircle2,
  Clock,
  Truck,
  PackageCheck,
  XCircle,
  FileText,
  Phone,
  MapPin,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';

export const TrackOrderPage: React.FC = () => {
  const [orderCode, setOrderCode] = useState('');
  const [phone, setPhone] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [order, setOrder] = useState<Order | null>(null);

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderCode.trim() || !phone.trim()) {
      setError('لطفاً کد پیگیری سفارش و شماره تماس را وارد کنید.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setOrder(null);

    try {
      const res = await fetch(
        `/api/orders/track?code=${encodeURIComponent(orderCode.trim())}&phone=${encodeURIComponent(phone.trim())}`
      );
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'سفارشی با این مشخصات یافت نشد.');
      } else {
        setOrder(data);
      }
    } catch {
      setError('خطا در برقراری ارتباط با سرور.');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'pending':
        return {
          label: 'در انتظار بررسی پرداخت',
          color: 'bg-amber-100 text-amber-800 border-amber-300',
          icon: Clock,
          desc: 'رسید واریزی شما دریافت شده و همکاران ما در حال بررسی صحت فیش بانکی هستند.',
        };
      case 'confirmed':
        return {
          label: 'پرداخت تأیید شد',
          color: 'bg-blue-100 text-blue-800 border-blue-300',
          icon: CheckCircle2,
          desc: 'پرداخت شما تأیید گردید و فرآیند آماده‌سازی و بسته‌بندی آغاز شده است.',
        };
      case 'shipped':
        return {
          label: 'ارسال شده با پست',
          color: 'bg-purple-100 text-purple-800 border-purple-300',
          icon: Truck,
          desc: 'مرسوله شما تحویل شرکت پست داده شده است و کد رهگیری پستی به شماره شما پیامک می‌شود.',
        };
      case 'completed':
        return {
          label: 'تکمیل شده',
          color: 'bg-emerald-100 text-emerald-800 border-emerald-300',
          icon: PackageCheck,
          desc: 'سفارش با موفقیت به مشتری تحویل گردید.',
        };
      case 'rejected':
        return {
          label: 'رسید پرداخت رد شد',
          color: 'bg-red-100 text-red-800 border-red-300',
          icon: XCircle,
          desc: 'متأسفانه رسید ارسالی مورد تأیید قرار نگرفت. لطفاً با پشتیبانی تماس بگیرید.',
        };
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-16">
      {/* Header */}
      <div className="text-center space-y-2">
        <span className="text-xs font-bold text-[#b45309]">سامانه پیگیری</span>
        <h1 className="text-2xl sm:text-3xl font-black text-[#451a03]">
          پیگیری وضعیت سفارش
        </h1>
        <p className="text-xs sm:text-sm text-[#78716c] max-w-md mx-auto">
          برای مشاهده آخرین وضعیت سفارش خود، کد پیگیری و شماره تلفنی که با آن ثبت سفارش کرده‌اید را وارد کنید.
        </p>
      </div>

      {/* Lookup Form */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#e8dfd5] shadow-xs">
        <form onSubmit={handleTrack} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#451a03] mb-1.5">
                کد پیگیری سفارش (مثال: O2609031234)
              </label>
              <input
                type="text"
                required
                placeholder="O..."
                value={orderCode}
                onChange={(e) => setOrderCode(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm bg-[#faf7f2] border border-[#d6cbbf] rounded-xl focus:outline-none focus:border-[#78350f] uppercase"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#451a03] mb-1.5">
                شماره تماس ثبت‌شده
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

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#78350f] hover:bg-[#b45309] text-white py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer disabled:opacity-50"
          >
            <Search className="w-4 h-4" />
            <span>{isLoading ? 'در حال جستجو...' : 'استعلام وضعیت سفارش'}</span>
          </button>
        </form>

        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* Order Results */}
      {order && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#e8dfd5] shadow-lg space-y-6 animate-in fade-in duration-300">
          {/* Status Header */}
          {(() => {
            const statusInfo = getStatusBadge(order.status);
            const StatusIcon = statusInfo.icon;
            return (
              <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#ebdccb] pb-4">
                  <div>
                    <span className="text-xs text-[#78716c] block">کد سفارش:</span>
                    <span className="font-mono text-xl font-black text-[#78350f]">
                      {order.order_code}
                    </span>
                  </div>

                  <div
                    className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border text-xs font-black ${statusInfo.color}`}
                  >
                    <StatusIcon className="w-4 h-4" />
                    <span>{statusInfo.label}</span>
                  </div>
                </div>

                <div className="p-4 bg-[#faf7f2] rounded-2xl border border-[#ebdccb] text-xs text-[#57534e] space-y-1">
                  <span className="font-bold text-[#451a03] block">توضیح وضعیت سفارش:</span>
                  <p>{statusInfo.desc}</p>
                </div>

                {/* SPECIAL PROMPT RULE: If pickup and confirmed */}
                {order.delivery_method === 'pickup' && order.status === 'confirmed' && (
                  <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-2xl text-xs sm:text-sm text-emerald-900 font-bold flex items-center gap-3">
                    <Phone className="w-5 h-5 text-emerald-600 shrink-0" />
                    <span>
                      پرداخت شما تأیید شده است. مدیر فروشگاه در اسرع وقت با شماره شما تماس گرفته و هماهنگی‌های لازم جهت تحویل حضوری در محل کارگاه انجام خواهد شد.
                    </span>
                  </div>
                )}
              </div>
            );
          })()}

          {/* Customer & Delivery Information */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs bg-[#fbf9f5] p-4 rounded-2xl border border-[#ebdccb]">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-[#78716c]">نام خریدار:</span>
                <span className="font-bold text-[#451a03]">{order.customer_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#78716c]">شماره تماس:</span>
                <span className="font-bold text-[#451a03]" dir="ltr">{order.phone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#78716c]">تاریخ ثبت:</span>
                <span className="font-bold text-[#451a03]">{formatDate(order.created_at)}</span>
              </div>
            </div>

            <div className="space-y-2 border-t sm:border-t-0 sm:border-r border-[#ebdccb] pt-2 sm:pt-0 sm:pr-4">
              <div className="flex justify-between">
                <span className="text-[#78716c]">روش تحویل:</span>
                <span className="font-bold text-[#451a03]">
                  {order.delivery_method === 'pickup' ? 'تحویل حضوری در کارگاه' : 'ارسال با پست پیشتاز'}
                </span>
              </div>
              <div>
                <span className="text-[#78716c] block">آدرس تحویل:</span>
                <span className="font-bold text-[#451a03] leading-relaxed block mt-0.5">
                  {order.address}
                </span>
              </div>
            </div>
          </div>

          {/* Items Table */}
          <div className="space-y-3">
            <h3 className="font-bold text-xs text-[#78716c]">اقلام سفارش:</h3>
            <div className="space-y-2">
              {order.items.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 rounded-xl bg-[#faf7f2] border border-[#ebdccb] text-xs"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={item.image_url}
                      alt={item.product_name}
                      className="w-12 h-12 rounded-lg object-cover bg-white"
                    />
                    <div>
                      <span className="font-bold text-[#451a03] block">
                        {item.product_name}
                      </span>
                      <span className="text-[#78716c]">
                        بسته {toPersianDigits(item.weight)} گرمی × {toPersianDigits(item.quantity)} عدد
                      </span>
                    </div>
                  </div>

                  <span className="font-black text-[#78350f]">
                    {formatPrice(item.row_total)} تومان
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Financial Breakdown */}
          <div className="bg-[#f2ece2] p-4 rounded-2xl border border-[#e2d5c3] text-xs space-y-2">
            <div className="flex justify-between text-[#57534e]">
              <span>مبلغ اقلام:</span>
              <span className="font-bold">{formatPrice(order.subtotal)} تومان</span>
            </div>

            {order.coupon_discount > 0 && (
              <div className="flex justify-between text-emerald-700 font-bold">
                <span>تخفیف کد ({order.coupon_code}):</span>
                <span>- {formatPrice(order.coupon_discount)} تومان</span>
              </div>
            )}

            <div className="flex justify-between text-[#57534e]">
              <span>هزینه ارسال:</span>
              <span className="font-bold">
                {order.shipping === 0 ? 'رایگان (حضوری)' : `${formatPrice(order.shipping)} تومان`}
              </span>
            </div>

            <div className="pt-2 border-t border-[#dfd2c0] flex justify-between items-center text-sm font-black text-[#451a03]">
              <span>مبلغ کل پرداخت شده:</span>
              <span className="text-base text-[#78350f]">{formatPrice(order.total)} تومان</span>
            </div>
          </div>

          {/* Uploaded Receipt Viewer (Prompt rule: مشتری بتواند رسید را دوباره ببیند) */}
          {order.receipt_url && (
            <div className="p-4 bg-[#fbf9f5] rounded-2xl border border-[#ebdccb] space-y-3">
              <span className="text-xs font-bold text-[#451a03] flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-[#d97706]" />
                تصویر رسید بانکی بارگذاری‌شده توسط شما:
              </span>

              <div className="flex items-center gap-3">
                <a
                  href={order.receipt_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 bg-white border border-[#d6cbbf] hover:border-[#78350f] text-[#451a03] px-3.5 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-[#d97706]" />
                  <span>مشاهده و باز کردن رسید در تب جدید</span>
                </a>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
