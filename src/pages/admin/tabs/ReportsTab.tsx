import React, { useEffect, useState } from 'react';
import { useStore } from '../../../context/StoreContext';
import { formatPrice, toPersianDigits } from '../../../lib/formatters';
import {
  TrendingUp,
  DollarSign,
  Calendar,
  Award,
  Package,
  Clock,
  Truck,
  Percent,
  RefreshCw,
} from 'lucide-react';

export const ReportsTab: React.FC = () => {
  const { adminToken } = useStore();
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchReports = async () => {
    if (!adminToken) return;
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/reports/sales', {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [adminToken]);

  if (isLoading) {
    return (
      <div className="py-20 text-center text-[#78716c]">
        در حال محاسبه گزارش‌های تحلیلی فروش...
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-[#ebdccb] shadow-xs">
        <div>
          <h2 className="font-black text-lg text-[#451a03]">گزارشات و تحلیل مالی فروش</h2>
          <p className="text-xs text-[#78716c]">
            محاسبه دقیق درآمدهای حاصل از سفارش‌های قطعی (پرداخت تأییدشده، ارسال‌شده و تحویل‌شده)
          </p>
        </div>

        <button
          onClick={fetchReports}
          className="self-start sm:self-auto bg-[#faf7f2] hover:bg-[#ebdccb] text-[#451a03] px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer border border-[#d6cbbf]"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>محاسبه مجدد آمار</span>
        </button>
      </div>

      {/* Period Cards: Today, 7 Days, 30 Days */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {/* Today */}
        <div className="bg-white border border-[#ebdccb] p-5 rounded-2xl shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs text-[#78716c]">
            <span className="font-bold">فروش امروز</span>
            <Calendar className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-900">
            {formatPrice(stats?.sales_today?.total_revenue || 0)}
            <span className="text-xs font-normal text-[#78716c] mr-1">تومان</span>
          </div>
          <span className="text-xs text-[#78716c] block">
            تعداد سفارش قطعی: {toPersianDigits(stats?.sales_today?.order_count || 0)} عدد
          </span>
        </div>

        {/* 7 Days */}
        <div className="bg-white border border-[#ebdccb] p-5 rounded-2xl shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs text-[#78716c]">
            <span className="font-bold">فروش ۷ روز گذشته</span>
            <TrendingUp className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-black text-blue-900">
            {formatPrice(stats?.sales_7_days?.total_revenue || 0)}
            <span className="text-xs font-normal text-[#78716c] mr-1">تومان</span>
          </div>
          <span className="text-xs text-[#78716c] block">
            تعداد سفارش قطعی: {toPersianDigits(stats?.sales_7_days?.order_count || 0)} عدد
          </span>
        </div>

        {/* 30 Days */}
        <div className="bg-white border border-[#ebdccb] p-5 rounded-2xl shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs text-[#78716c]">
            <span className="font-bold">فروش ۳۰ روز گذشته</span>
            <DollarSign className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl font-black text-purple-900">
            {formatPrice(stats?.sales_30_days?.total_revenue || 0)}
            <span className="text-xs font-normal text-[#78716c] mr-1">تومان</span>
          </div>
          <span className="text-xs text-[#78716c] block">
            تعداد سفارش قطعی: {toPersianDigits(stats?.sales_30_days?.order_count || 0)} عدد
          </span>
        </div>
      </div>

      {/* Aggregate Totals & Discounts Breakdown */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#faf7f2] border border-[#ebdccb] p-4 rounded-2xl">
          <span className="text-xs text-[#78716c] block">مجموع کل درآمد تاریخ فروشگاه:</span>
          <span className="text-lg font-black text-[#78350f] block mt-1">
            {formatPrice(stats?.aggregate?.total_revenue || 0)} تومان
          </span>
        </div>

        <div className="bg-[#faf7f2] border border-[#ebdccb] p-4 rounded-2xl">
          <span className="text-xs text-[#78716c] block">تعداد کل سفارش‌های قطعی:</span>
          <span className="text-lg font-black text-[#451a03] block mt-1">
            {toPersianDigits(stats?.aggregate?.total_orders || 0)} سفارش
          </span>
        </div>

        <div className="bg-[#faf7f2] border border-[#ebdccb] p-4 rounded-2xl">
          <span className="text-xs text-[#78716c] block">مجموع تخفیف‌های داده‌شده:</span>
          <span className="text-lg font-black text-red-700 block mt-1">
            {formatPrice(stats?.aggregate?.total_discounts || 0)} تومان
          </span>
        </div>

        <div className="bg-[#faf7f2] border border-[#ebdccb] p-4 rounded-2xl">
          <span className="text-xs text-[#78716c] block">وضعیت سفارش‌های در جریان:</span>
          <span className="text-xs font-bold text-[#57534e] block mt-1">
            {toPersianDigits(stats?.pending_orders_count || 0)} معلق | {toPersianDigits(stats?.shipping_orders_count || 0)} در حال ارسال
          </span>
        </div>
      </div>

      {/* Top 5 Best Selling Products */}
      <div className="bg-white rounded-2xl border border-[#ebdccb] p-6 space-y-4 shadow-xs">
        <div className="flex items-center gap-2 text-[#78350f] font-black text-base border-b border-[#ebdccb] pb-3">
          <Award className="w-5 h-5 text-amber-600" />
          <span>لیست ۵ محصول پرفروش فروشگاه (بر اساس تعداد و ارزش فروش)</span>
        </div>

        {stats?.top_products?.length === 0 ? (
          <p className="text-xs text-[#78716c] text-center py-6">
            هنوز محصولی در سفارش‌های قطعی ثبت نشده است.
          </p>
        ) : (
          <div className="space-y-3">
            {stats?.top_products?.map((item: any, idx: number) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3.5 bg-[#faf7f2] rounded-xl border border-[#ebdccb] text-xs"
              >
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-[#78350f] text-white flex items-center justify-center font-bold text-xs shrink-0">
                    {toPersianDigits(idx + 1)}
                  </span>
                  <div>
                    <span className="font-bold text-sm text-[#451a03] block">{item.name}</span>
                    <span className="text-[#78716c]">
                      تعداد فروش موفق: {toPersianDigits(item.quantity)} بسته
                    </span>
                  </div>
                </div>

                <div className="text-left">
                  <span className="text-[11px] text-[#78716c] block">ارزش فروش:</span>
                  <span className="text-sm font-black text-[#78350f]">
                    {formatPrice(item.revenue)} تومان
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
