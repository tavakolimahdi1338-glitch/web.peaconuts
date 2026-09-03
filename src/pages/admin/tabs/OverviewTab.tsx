import React, { useEffect, useState } from 'react';
import { useStore } from '../../../context/StoreContext';
import { formatPrice, toPersianDigits, formatDate } from '../../../lib/formatters';
import type { Order } from '../../../types';
import {
  DollarSign,
  ShoppingBag,
  Clock,
  AlertTriangle,
  MessageSquare,
  ArrowUpRight,
  Package,
  TrendingUp,
  Truck,
  CheckCircle2,
} from 'lucide-react';

interface OverviewTabProps {
  onNavigateTab: (tab: string) => void;
}

export const OverviewTab: React.FC<OverviewTabProps> = ({ onNavigateTab }) => {
  const { adminToken } = useStore();
  const [stats, setStats] = useState<any>(null);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!adminToken) return;
      try {
        const [statsRes, ordersRes] = await Promise.all([
          fetch('/api/admin/reports/sales', {
            headers: { Authorization: `Bearer ${adminToken}` },
          }),
          fetch('/api/admin/orders', {
            headers: { Authorization: `Bearer ${adminToken}` },
          }),
        ]);

        if (statsRes.ok) {
          const statsData = await statsRes.json();
          setStats(statsData);
        }

        if (ordersRes.ok) {
          const ordersData = await ordersRes.json();
          setRecentOrders(ordersData.slice(0, 5));
        }
      } catch (err) {
        console.error('Error fetching admin dashboard data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [adminToken]);

  if (isLoading) {
    return (
      <div className="py-20 text-center text-[#78716c]">
        در حال بارگذاری آمار داشبورد...
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome & Quick Action Bar */}
      <div className="bg-gradient-to-r from-[#78350f] to-[#451a03] text-white p-6 sm:p-8 rounded-3xl shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs text-amber-300 font-bold block">پنل مدیریت یکپارچه</span>
          <h2 className="text-xl sm:text-2xl font-black mt-1 text-[#fef3c7]">
            گزارش عملکرد و وضعیت روزانه فروشگاه
          </h2>
          <p className="text-xs text-[#e7dfd5] mt-1">
            بررسی سریع سفارش‌های معلق، فروش تاییدشده و موجودی انبار کارگاه
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => onNavigateTab('orders')}
            className="bg-amber-500 hover:bg-amber-400 text-[#451a03] font-bold px-4 py-2.5 rounded-xl text-xs transition-colors shadow-sm cursor-pointer"
          >
            بررسی فیش‌های واریزی
          </button>
          <button
            onClick={() => onNavigateTab('products')}
            className="bg-white/10 hover:bg-white/20 text-white font-bold px-4 py-2.5 rounded-xl text-xs transition-colors border border-white/20 cursor-pointer"
          >
            مدیریت محصولات
          </button>
        </div>
      </div>

      {/* Main KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Pending Payments Alert */}
        <div
          onClick={() => onNavigateTab('orders')}
          className="bg-amber-50/70 border border-amber-200 hover:border-amber-400 p-5 rounded-2xl cursor-pointer transition-all shadow-xs group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-800">سفارش‌های در انتظار بررسی</span>
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-amber-950 mt-3">
            {toPersianDigits(stats?.pending_orders_count || 0)}
            <span className="text-xs font-normal text-amber-800 mr-1.5">سفارش فیش‌دار</span>
          </div>
          <span className="text-[11px] text-amber-700 font-medium block mt-1 group-hover:underline">
            مشاهده و تأیید/رد رسیدها ←
          </span>
        </div>

        {/* Confirmed Sales Today */}
        <div className="bg-white border border-[#e8dfd5] p-5 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#78716c]">فروش تأییدشده امروز</span>
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="text-xl font-black text-emerald-900 mt-3">
            {formatPrice(stats?.sales_today?.total_revenue || 0)}
            <span className="text-xs font-normal text-[#78716c] mr-1.5">تومان</span>
          </div>
          <span className="text-[11px] text-[#78716c] block mt-1">
            تعداد سفارش تأییدشده: {toPersianDigits(stats?.sales_today?.order_count || 0)}
          </span>
        </div>

        {/* Confirmed Sales Last 7 Days */}
        <div className="bg-white border border-[#e8dfd5] p-5 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#78716c]">فروش تأییدشده ۷ روز اخیر</span>
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="text-xl font-black text-blue-950 mt-3">
            {formatPrice(stats?.sales_7_days?.total_revenue || 0)}
            <span className="text-xs font-normal text-[#78716c] mr-1.5">تومان</span>
          </div>
          <span className="text-[11px] text-[#78716c] block mt-1">
            تعداد سفارش: {toPersianDigits(stats?.sales_7_days?.order_count || 0)}
          </span>
        </div>

        {/* Confirmed Sales Last 30 Days */}
        <div className="bg-white border border-[#e8dfd5] p-5 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#78716c]">فروش تأییدشده ۳۰ روز اخیر</span>
            <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
              <ShoppingBag className="w-5 h-5" />
            </div>
          </div>
          <div className="text-xl font-black text-purple-950 mt-3">
            {formatPrice(stats?.sales_30_days?.total_revenue || 0)}
            <span className="text-xs font-normal text-[#78716c] mr-1.5">تومان</span>
          </div>
          <span className="text-[11px] text-[#78716c] block mt-1">
            تعداد سفارش: {toPersianDigits(stats?.sales_30_days?.order_count || 0)}
          </span>
        </div>
      </div>

      {/* Secondary Row: Low stock & Support Alert */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Low Stock Warning */}
        <div className="bg-white border border-[#e8dfd5] rounded-2xl p-5 space-y-3">
          <div className="flex items-center justify-between border-b border-[#ebdccb] pb-3">
            <div className="flex items-center gap-2 text-red-700 font-bold text-sm">
              <AlertTriangle className="w-4 h-4" />
              <span>هشدارهای موجودی انبار (کمتر از ۵ بسته)</span>
            </div>
            <button
              onClick={() => onNavigateTab('products')}
              className="text-xs text-[#78350f] hover:underline cursor-pointer"
            >
              مدیریت انبار
            </button>
          </div>

          {stats?.low_stock_products?.length === 0 ? (
            <p className="text-xs text-emerald-700 font-medium py-3">
              خوشبختانه تمامی محصولات موجودی کافی دارند.
            </p>
          ) : (
            <div className="space-y-2">
              {stats?.low_stock_products?.map((prod: any) => (
                <div
                  key={prod.id}
                  className="flex items-center justify-between p-2.5 bg-red-50/50 border border-red-200 rounded-xl text-xs"
                >
                  <span className="font-bold text-[#451a03]">{prod.name}</span>
                  <span className="bg-red-100 text-red-800 font-black px-2 py-0.5 rounded">
                    تنها {toPersianDigits(prod.stock)} عدد باقی‌مانده
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Shipping in Progress */}
        <div className="bg-white border border-[#e8dfd5] rounded-2xl p-5 space-y-3">
          <div className="flex items-center justify-between border-b border-[#ebdccb] pb-3">
            <div className="flex items-center gap-2 text-[#78350f] font-bold text-sm">
              <Truck className="w-4 h-4 text-[#d97706]" />
              <span>مرسوله‌های پستی در حال ارسال</span>
            </div>
            <button
              onClick={() => onNavigateTab('orders')}
              className="text-xs text-[#78350f] hover:underline cursor-pointer"
            >
              مشاهده مرسوله‌ها
            </button>
          </div>

          <div className="flex items-center justify-between p-4 bg-[#faf7f2] rounded-xl border border-[#ebdccb]">
            <span className="text-xs text-[#57534e]">تعداد سفارش‌های تحویل‌شده به پست:</span>
            <span className="text-lg font-black text-[#78350f]">
              {toPersianDigits(stats?.shipping_orders_count || 0)} بسته پستی
            </span>
          </div>
          <p className="text-[11px] text-[#78716c]">
            پس از تحویل بسته به مشتری، وضعیت آن را به «تکمیل شده» تغییر دهید.
          </p>
        </div>
      </div>

      {/* Recent Orders Table */}
      <div className="bg-white border border-[#e8dfd5] rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-[#ebdccb] pb-3">
          <h3 className="font-black text-sm text-[#451a03]">آخرین سفارش‌های ثبت شده</h3>
          <button
            onClick={() => onNavigateTab('orders')}
            className="text-xs text-[#78350f] font-bold hover:underline cursor-pointer"
          >
            مشاهده همه سفارش‌ها ({toPersianDigits(recentOrders.length)})
          </button>
        </div>

        {recentOrders.length === 0 ? (
          <p className="text-xs text-[#78716c] text-center py-4">هنوز سفارشی ثبت نشده است.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-right">
              <thead>
                <tr className="border-b border-[#ebdccb] text-[#78716c]">
                  <th className="py-2.5 font-bold">کد سفارش</th>
                  <th className="py-2.5 font-bold">مشتری</th>
                  <th className="py-2.5 font-bold">روش تحویل</th>
                  <th className="py-2.5 font-bold">مبلغ نهایی</th>
                  <th className="py-2.5 font-bold">وضعیت پرداخت</th>
                  <th className="py-2.5 font-bold">تاریخ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#faf7f2]">
                {recentOrders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-[#faf7f2]">
                    <td className="py-3 font-mono font-bold text-[#78350f]">{ord.order_code}</td>
                    <td className="py-3 font-bold text-[#451a03]">{ord.customer_name}</td>
                    <td className="py-3 text-[#57534e]">
                      {ord.delivery_method === 'pickup' ? 'حضوری' : 'پست پیشتاز'}
                    </td>
                    <td className="py-3 font-black text-[#451a03]">{formatPrice(ord.total)} ت</td>
                    <td className="py-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          ord.status === 'pending'
                            ? 'bg-amber-100 text-amber-800'
                            : ord.status === 'confirmed'
                            ? 'bg-blue-100 text-blue-800'
                            : ord.status === 'shipped'
                            ? 'bg-purple-100 text-purple-800'
                            : ord.status === 'completed'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {ord.status === 'pending'
                          ? 'در انتظار بررسی'
                          : ord.status === 'confirmed'
                          ? 'تأیید شده'
                          : ord.status === 'shipped'
                          ? 'ارسال شده'
                          : ord.status === 'completed'
                          ? 'تکمیل شده'
                          : 'رد شده'}
                      </span>
                    </td>
                    <td className="py-3 text-[#78716c]">{formatDate(ord.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
