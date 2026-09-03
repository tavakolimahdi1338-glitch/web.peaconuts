import React, { useState, useEffect } from 'react';
import { useStore } from '../../../context/StoreContext';
import { formatPrice, toPersianDigits, formatDate } from '../../../lib/formatters';
import type { Coupon } from '../../../types';
import {
  Plus,
  Trash2,
  Tag,
  Percent,
  DollarSign,
  Calendar,
  Users,
  CheckCircle,
  XCircle,
  AlertCircle,
  X,
} from 'lucide-react';

export const CouponsTab: React.FC = () => {
  const { adminToken, showToast } = useStore();

  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State (Step-by-step or unified clean wizard)
  const [code, setCode] = useState('');
  const [type, setType] = useState<'percent' | 'fixed'>('percent');
  const [value, setValue] = useState<number>(10);
  const [expiryDays, setExpiryDays] = useState<number>(30);
  const [maxUses, setMaxUses] = useState<number>(100);
  const [minOrder, setMinOrder] = useState<number>(0);
  const [active, setActive] = useState(true);

  const fetchCoupons = async () => {
    if (!adminToken) return;
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/coupons', {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      if (res.ok) {
        const data = await res.json();
        setCoupons(data);
      }
    } catch {
      showToast('خطا در دریافت لیست کدهای تخفیف', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, [adminToken]);

  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) {
      showToast('کد تخفیف را مشخص کنید.', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/admin/coupons', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({
          code: code.trim().toUpperCase(),
          type,
          value: Number(value),
          expiry_days: Number(expiryDays),
          max_uses: Number(maxUses),
          min_order_amount: Number(minOrder),
          active,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        showToast(data.error || 'خطا در ایجاد کد تخفیف', 'error');
      } else {
        showToast('کد تخفیف با موفقیت ایجاد گردید.', 'success');
        setIsModalOpen(false);
        // Reset form
        setCode('');
        setValue(10);
        setExpiryDays(30);
        setMaxUses(100);
        setMinOrder(0);
        await fetchCoupons();
      }
    } catch {
      showToast('خطا در برقراری ارتباط با سرور', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleActive = async (coupon: Coupon) => {
    try {
      const res = await fetch(`/api/admin/coupons/${coupon.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({ active: !coupon.active }),
      });

      if (res.ok) {
        showToast(
          coupon.active ? 'کد تخفیف غیرفعال شد.' : 'کد تخفیف فعال شد.',
          'success'
        );
        await fetchCoupons();
      }
    } catch {
      showToast('خطا در به‌روزرسانی وضعیت کد', 'error');
    }
  };

  const handleDelete = async (id: string, couponCode: string) => {
    if (!window.confirm(`آیا از حذف کد تخفیف «${couponCode}» اطمینان دارید؟`)) return;

    try {
      const res = await fetch(`/api/admin/coupons/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${adminToken}` },
      });

      if (res.ok) {
        showToast('کد تخفیف حذف شد.', 'success');
        await fetchCoupons();
      }
    } catch {
      showToast('خطا در حذف کد تخفیف', 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-[#ebdccb] shadow-xs">
        <div>
          <h2 className="font-black text-lg text-[#451a03]">مدیریت کدهای تخفیف و جشنواره‌ها</h2>
          <p className="text-xs text-[#78716c]">
            تعریف کوپن‌های درصدی یا ثابت، سقف مصرف، تاریخ انقضا و جلوگیری از مصرف تکراری با هر شماره تماس
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-[#78350f] hover:bg-[#b45309] text-white px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 shadow-sm transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>ساخت کد تخفیف جدید</span>
        </button>
      </div>

      {/* Coupons Table */}
      <div className="bg-white rounded-2xl border border-[#ebdccb] overflow-hidden shadow-xs">
        {coupons.length === 0 ? (
          <div className="py-16 text-center text-xs text-[#78716c] space-y-2">
            <Tag className="w-8 h-8 text-[#a8a29e] mx-auto" />
            <p>هنوز کد تخفیفی ساخته نشده است.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-right">
              <thead>
                <tr className="bg-[#faf7f2] border-b border-[#ebdccb] text-[#78716c]">
                  <th className="py-3 px-4 font-bold">کد تخفیف</th>
                  <th className="py-3 px-4 font-bold">نوع و مقدار</th>
                  <th className="py-3 px-4 font-bold">حداقل خرید</th>
                  <th className="py-3 px-4 font-bold">مصرف / ظرفیت</th>
                  <th className="py-3 px-4 font-bold">تاریخ انقضا</th>
                  <th className="py-3 px-4 font-bold">وضعیت</th>
                  <th className="py-3 px-4 font-bold text-left">عملیات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#faf7f2]">
                {coupons.map((c) => {
                  const isExpired = new Date(c.expires_at).getTime() < Date.now();
                  const isExhausted = c.used_count >= c.max_uses;

                  return (
                    <tr key={c.id} className="hover:bg-[#fcfaf7]">
                      <td className="py-3.5 px-4 font-mono font-black text-sm text-[#78350f]">
                        {c.code}
                      </td>

                      <td className="py-3.5 px-4 font-bold text-[#451a03]">
                        {c.type === 'percent' ? (
                          <span className="text-emerald-700">٪{toPersianDigits(c.value)} تخفیف</span>
                        ) : (
                          <span className="text-blue-700">{formatPrice(c.value)} تومان ثابت</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-[#57534e]">
                        {c.min_order_amount > 0
                          ? `${formatPrice(c.min_order_amount)} ت`
                          : 'بدون حداقل'}
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="font-mono font-bold text-[#451a03]">
                          {toPersianDigits(c.used_count)} / {toPersianDigits(c.max_uses)} بار
                        </span>
                        {isExhausted && (
                          <span className="text-[10px] text-red-600 block">تکمیل ظرفیت</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        <span className={isExpired ? 'text-red-600 line-through' : 'text-[#57534e]'}>
                          {formatDate(c.expires_at)}
                        </span>
                        {isExpired && <span className="text-[10px] text-red-600 block">منقضی شده</span>}
                      </td>

                      <td className="py-3.5 px-4">
                        <button
                          onClick={() => handleToggleActive(c)}
                          className={`px-2.5 py-1 rounded-full text-[11px] font-bold cursor-pointer transition-colors ${
                            c.active && !isExpired && !isExhausted
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-stone-100 text-stone-600'
                          }`}
                        >
                          {c.active && !isExpired && !isExhausted ? 'فعال' : 'غیرفعال'}
                        </button>
                      </td>

                      <td className="py-3.5 px-4 text-left">
                        <button
                          onClick={() => handleDelete(c.id, c.code)}
                          className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 transition-colors cursor-pointer"
                          title="حذف کد"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Coupon Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div
            className="bg-white rounded-3xl max-w-lg w-full max-h-[92vh] overflow-y-auto border border-[#ebdccb] shadow-2xl p-6 sm:p-8 space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-[#ebdccb] pb-3">
              <h3 className="font-black text-lg text-[#451a03]">ساخت کد تخفیف جدید</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg hover:bg-[#ebdccb] text-[#57534e]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCoupon} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#451a03] mb-1">
                  کد کوپن (حروف انگلیسی یا عدد) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="مثال: NOROOZ1403"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  className="w-full px-3 py-2 text-sm bg-[#faf7f2] border border-[#d6cbbf] rounded-xl focus:outline-none focus:border-[#78350f] uppercase"
                />
              </div>

              {/* Type selector */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-[#451a03]">
                  نوع محاسبه تخفیف
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setType('percent')}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      type === 'percent'
                        ? 'bg-[#78350f] text-white border-[#78350f]'
                        : 'bg-[#faf7f2] text-[#57534e] border-[#d6cbbf]'
                    }`}
                  >
                    <Percent className="w-3.5 h-3.5" />
                    <span>درصدی (٪)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setType('fixed')}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      type === 'fixed'
                        ? 'bg-[#78350f] text-white border-[#78350f]'
                        : 'bg-[#faf7f2] text-[#57534e] border-[#d6cbbf]'
                    }`}
                  >
                    <DollarSign className="w-3.5 h-3.5" />
                    <span>مبلغ ثابت (تومان)</span>
                  </button>
                </div>
              </div>

              {/* Value */}
              <div>
                <label className="block text-xs font-bold text-[#451a03] mb-1">
                  مقدار تخفیف {type === 'percent' ? '(درصد)' : '(تومان)'} <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  max={type === 'percent' ? 100 : 5000000}
                  required
                  value={value}
                  onChange={(e) => setValue(Number(e.target.value))}
                  className="w-full px-3 py-2 text-sm bg-[#faf7f2] border border-[#d6cbbf] rounded-xl focus:outline-none focus:border-[#78350f]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#451a03] mb-1">
                    مدت اعتبار (تعداد روز)
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={expiryDays}
                    onChange={(e) => setExpiryDays(Number(e.target.value))}
                    className="w-full px-3 py-2 text-sm bg-[#faf7f2] border border-[#d6cbbf] rounded-xl focus:outline-none focus:border-[#78350f]"
                  />
                  <span className="text-[10px] text-[#78716c]">پیش‌فرض: ۳۰ روز</span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#451a03] mb-1">
                    حداکثر دفعات مجاز استفاده
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={maxUses}
                    onChange={(e) => setMaxUses(Number(e.target.value))}
                    className="w-full px-3 py-2 text-sm bg-[#faf7f2] border border-[#d6cbbf] rounded-xl focus:outline-none focus:border-[#78350f]"
                  />
                  <span className="text-[10px] text-[#78716c]">پیش‌فرض: ۱۰۰ بار</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#451a03] mb-1">
                  حداقل مبلغ سفارش برای اعمال (تومان)
                </label>
                <input
                  type="number"
                  min="0"
                  step="1000"
                  value={minOrder}
                  onChange={(e) => setMinOrder(Number(e.target.value))}
                  className="w-full px-3 py-2 text-sm bg-[#faf7f2] border border-[#d6cbbf] rounded-xl focus:outline-none focus:border-[#78350f]"
                />
                <span className="text-[10px] text-[#78716c]">اگر ۰ باشد محدودیتی ندارد</span>
              </div>

              {/* Active Toggle */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="coupon-active"
                  checked={active}
                  onChange={(e) => setActive(e.target.checked)}
                  className="w-4 h-4 rounded text-[#78350f] accent-[#78350f]"
                />
                <label htmlFor="coupon-active" className="text-xs font-bold text-[#451a03]">
                  کد بلافاصله پس از ایجاد فعال باشد
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#ebdccb]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-[#78716c] hover:bg-[#faf7f2] rounded-xl cursor-pointer"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-[#78350f] hover:bg-[#b45309] text-white px-5 py-2.5 rounded-xl font-bold text-xs shadow-md transition-all cursor-pointer"
                >
                  {isSubmitting ? 'در حال ایجاد...' : 'ثبت و انتشار کد'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
