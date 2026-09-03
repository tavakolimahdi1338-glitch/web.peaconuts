import React, { useState, useEffect } from 'react';
import { useStore } from '../../../context/StoreContext';
import { formatPrice, toPersianDigits, formatDate } from '../../../lib/formatters';
import type { Order, OrderStatus } from '../../../types';
import {
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  Truck,
  PackageCheck,
  FileText,
  ExternalLink,
  Phone,
  MapPin,
  AlertCircle,
  RefreshCw,
  Eye,
  X,
} from 'lucide-react';

export const OrdersTab: React.FC = () => {
  const { adminToken, showToast, fetchProducts } = useStore();

  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Order Details Modal
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  const fetchOrders = async () => {
    if (!adminToken) return;
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/orders', {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      if (res.ok) {
        const data = await res.json();
        setOrders(data);
      }
    } catch (err) {
      console.error(err);
      showToast('خطا در دریافت لیست سفارش‌ها', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [adminToken]);

  const handleUpdateStatus = async (orderId: string, newStatus: OrderStatus) => {
    if (!adminToken) return;
    setIsUpdatingStatus(true);

    try {
      const res = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await res.json();
      if (!res.ok) {
        showToast(data.error || 'خطا در تغییر وضعیت سفارش', 'error');
      } else {
        showToast('وضعیت سفارش با موفقیت به‌روزرسانی شد.', 'success');
        if (selectedOrder && selectedOrder.id === orderId) {
          setSelectedOrder(data);
        }
        await fetchOrders();
        // If rejected or cancelled, inventory is restored so refresh products
        await fetchProducts();
      }
    } catch {
      showToast('خطا در برقراری ارتباط با سرور', 'error');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  // Filtered orders
  const filteredOrders = orders.filter((o) => {
    if (filterStatus !== 'all' && o.status !== filterStatus) return false;
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      const matchCode = o.order_code.toLowerCase().includes(query);
      const matchName = o.customer_name.toLowerCase().includes(query);
      const matchPhone = o.phone.includes(query);
      if (!matchCode && !matchName && !matchPhone) return false;
    }
    return true;
  });

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'pending':
        return { label: 'در انتظار بررسی فیش', color: 'bg-amber-100 text-amber-800' };
      case 'confirmed':
        return { label: 'پرداخت تأیید شد', color: 'bg-blue-100 text-blue-800' };
      case 'shipped':
        return { label: 'ارسال شده با پست', color: 'bg-purple-100 text-purple-800' };
      case 'completed':
        return { label: 'تکمیل و تحویل شده', color: 'bg-emerald-100 text-emerald-800' };
      case 'rejected':
        return { label: 'رسید رد شد', color: 'bg-red-100 text-red-800' };
    }
  };

  return (
    <div className="space-y-6">
      {/* Top action & Filter bar */}
      <div className="bg-white p-5 rounded-2xl border border-[#ebdccb] space-y-4 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="font-black text-lg text-[#451a03]">مدیریت سفارش‌ها و پرداخت‌ها</h2>
            <p className="text-xs text-[#78716c]">
              بررسی رسیدهای کارت به کارت، تأیید یا رد فیش، و به‌روزرسانی وضعیت ارسال
            </p>
          </div>

          <button
            onClick={fetchOrders}
            className="self-start sm:self-auto bg-[#faf7f2] hover:bg-[#ebdccb] text-[#451a03] px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer border border-[#d6cbbf]"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>تازه‌سازی لیست</span>
          </button>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-[#faf7f2]">
          {/* Search */}
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-[#a8a29e] absolute right-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="جستجو با کد سفارش، نام یا شماره تماس..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pr-9 pl-3 py-1.5 text-xs bg-[#faf7f2] border border-[#d6cbbf] rounded-xl focus:outline-none focus:border-[#78350f]"
            />
          </div>

          {/* Status Tabs */}
          <div className="flex items-center gap-1 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
            {[
              { key: 'all', label: 'همه سفارش‌ها' },
              { key: 'pending', label: 'در انتظار بررسی' },
              { key: 'confirmed', label: 'تأییدشده' },
              { key: 'shipped', label: 'ارسال با پست' },
              { key: 'completed', label: 'تکمیل‌شده' },
              { key: 'rejected', label: 'ردشده' },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setFilterStatus(tab.key)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer shrink-0 ${
                  filterStatus === tab.key
                    ? 'bg-[#78350f] text-white'
                    : 'bg-[#faf7f2] text-[#57534e] hover:bg-[#ebdccb]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-2xl border border-[#ebdccb] overflow-hidden shadow-xs">
        {filteredOrders.length === 0 ? (
          <div className="py-16 text-center text-xs text-[#78716c] space-y-2">
            <AlertCircle className="w-8 h-8 text-[#a8a29e] mx-auto" />
            <p>سفارشی مطابق با این فیلتر یا عبارت جستجو یافت نشد.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-right">
              <thead>
                <tr className="bg-[#faf7f2] border-b border-[#ebdccb] text-[#78716c]">
                  <th className="py-3 px-4 font-bold">کد سفارش</th>
                  <th className="py-3 px-4 font-bold">مشتری و تماس</th>
                  <th className="py-3 px-4 font-bold">روش ارسال</th>
                  <th className="py-3 px-4 font-bold">مبلغ نهایی</th>
                  <th className="py-3 px-4 font-bold">رسید پرداخت</th>
                  <th className="py-3 px-4 font-bold">وضعیت فعلی</th>
                  <th className="py-3 px-4 font-bold">تاریخ ثبت</th>
                  <th className="py-3 px-4 font-bold text-left">اقدام</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#faf7f2]">
                {filteredOrders.map((ord) => {
                  const badge = getStatusBadge(ord.status);
                  return (
                    <tr key={ord.id} className="hover:bg-[#fcfaf7]">
                      <td className="py-3.5 px-4 font-mono font-black text-[#78350f]">
                        {ord.order_code}
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="font-bold text-[#451a03] block">{ord.customer_name}</span>
                        <span className="text-[11px] text-[#78716c] dir-ltr block text-right font-mono">
                          {ord.phone}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-[#57534e]">
                        {ord.delivery_method === 'pickup' ? (
                          <span className="text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded font-semibold">
                            تحویل حضوری
                          </span>
                        ) : (
                          <span className="text-blue-800 bg-blue-50 px-2 py-0.5 rounded font-semibold">
                            پست پیشتاز
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 font-black text-[#451a03]">
                        {formatPrice(ord.total)} تومان
                      </td>

                      {/* Receipt preview button */}
                      <td className="py-3.5 px-4">
                        {ord.receipt_url ? (
                          <a
                            href={ord.receipt_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[#78350f] hover:underline font-bold"
                          >
                            <FileText className="w-3.5 h-3.5" />
                            <span>مشاهده فیش</span>
                          </a>
                        ) : (
                          <span className="text-[#a8a29e]">بدون فیش</span>
                        )}
                      </td>

                      {/* Status badge */}
                      <td className="py-3.5 px-4">
                        <span className={`px-2 py-1 rounded-lg font-bold text-[11px] ${badge.color}`}>
                          {badge.label}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-[#78716c]">{formatDate(ord.created_at)}</td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-left">
                        <button
                          onClick={() => setSelectedOrder(ord)}
                          className="bg-[#78350f] hover:bg-[#b45309] text-white px-3 py-1.5 rounded-lg font-bold text-[11px] transition-colors cursor-pointer"
                        >
                          بررسی کامل
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

      {/* Order Review & Actions Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div
            className="bg-white rounded-3xl max-w-2xl w-full max-h-[92vh] overflow-y-auto border border-[#ebdccb] shadow-2xl p-6 sm:p-8 space-y-6"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[#ebdccb] pb-3">
              <div>
                <span className="text-xs text-[#78716c]">جزئیات سفارش:</span>
                <h3 className="font-black text-lg text-[#78350f] font-mono">
                  {selectedOrder.order_code}
                </h3>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-1.5 rounded-lg hover:bg-[#ebdccb] text-[#57534e]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Summary Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs bg-[#faf7f2] p-4 rounded-2xl border border-[#ebdccb]">
              <div className="space-y-1.5">
                <div>
                  <span className="text-[#78716c]">نام خریدار:</span>{' '}
                  <strong className="text-[#451a03]">{selectedOrder.customer_name}</strong>
                </div>
                <div>
                  <span className="text-[#78716c]">شماره تماس:</span>{' '}
                  <strong className="text-[#451a03]" dir="ltr">{selectedOrder.phone}</strong>
                </div>
                <div>
                  <span className="text-[#78716c]">تاریخ ثبت:</span>{' '}
                  <strong className="text-[#451a03]">{formatDate(selectedOrder.created_at)}</strong>
                </div>
              </div>

              <div className="space-y-1.5">
                <div>
                  <span className="text-[#78716c]">روش تحویل:</span>{' '}
                  <strong className="text-[#451a03]">
                    {selectedOrder.delivery_method === 'pickup' ? 'تحویل حضوری در کارگاه' : 'پست پیشتاز'}
                  </strong>
                </div>
                {selectedOrder.address && (
                  <div>
                    <span className="text-[#78716c]">آدرس:</span>{' '}
                    <strong className="text-[#451a03] leading-relaxed block">
                      {selectedOrder.address}
                    </strong>
                  </div>
                )}
                {selectedOrder.details && (
                  <div>
                    <span className="text-[#78716c]">توضیحات:</span>{' '}
                    <span className="text-[#57534e]">{selectedOrder.details}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Items */}
            <div className="space-y-2">
              <h4 className="font-bold text-xs text-[#78716c]">اقلام خریداری شده:</h4>
              <div className="space-y-1.5">
                {selectedOrder.items.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2.5 bg-[#fcfaf7] rounded-xl border border-[#ebdccb] text-xs"
                  >
                    <div className="flex items-center gap-2.5">
                      <img
                        src={item.image_url}
                        alt={item.product_name}
                        className="w-9 h-9 rounded-lg object-cover"
                      />
                      <div>
                        <span className="font-bold text-[#451a03]">{item.product_name}</span>
                        <span className="text-[11px] text-[#78716c] mr-2">
                          (بسته {toPersianDigits(item.weight)} گرمی) × {toPersianDigits(item.quantity)}
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

            {/* Financials */}
            <div className="bg-[#f2ece2] p-4 rounded-xl border border-[#dfd2c0] text-xs space-y-1.5">
              <div className="flex justify-between">
                <span>جمع کل اقلام:</span>
                <span>{formatPrice(selectedOrder.subtotal)} تومان</span>
              </div>
              {selectedOrder.coupon_discount > 0 && (
                <div className="flex justify-between text-emerald-700 font-bold">
                  <span>تخفیف کد ({selectedOrder.coupon_code}):</span>
                  <span>- {formatPrice(selectedOrder.coupon_discount)} تومان</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>هزینه ارسال:</span>
                <span>{formatPrice(selectedOrder.shipping)} تومان</span>
              </div>
              <div className="pt-2 border-t border-[#dfd2c0] flex justify-between font-black text-sm text-[#451a03]">
                <span>مبلغ نهایی فاکتور:</span>
                <span className="text-[#78350f] text-base">{formatPrice(selectedOrder.total)} تومان</span>
              </div>
            </div>

            {/* Receipt Preview */}
            {selectedOrder.receipt_url && (
              <div className="p-4 bg-[#faf7f2] rounded-2xl border border-[#ebdccb] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#451a03] flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-[#d97706]" />
                    رسید واریزی بارگذاری‌شده توسط مشتری:
                  </span>
                  <a
                    href={selectedOrder.receipt_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-blue-700 hover:underline flex items-center gap-1 font-bold"
                  >
                    <span>باز کردن فایل کامل</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

                <div className="max-h-56 overflow-hidden rounded-xl border border-[#ebdccb] bg-white flex items-center justify-center">
                  <img
                    src={selectedOrder.receipt_url}
                    alt="رسید بانکی"
                    className="max-h-56 object-contain"
                  />
                </div>
              </div>
            )}

            {/* Action Buttons based on status */}
            <div className="space-y-3 pt-2 border-t border-[#ebdccb]">
              <span className="text-xs font-bold text-[#78716c] block">
                تغییر وضعیت این سفارش توسط مدیر:
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {/* Approve Payment */}
                <button
                  onClick={() => handleUpdateStatus(selectedOrder.id, 'confirmed')}
                  disabled={isUpdatingStatus || selectedOrder.status === 'confirmed'}
                  className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 disabled:opacity-40 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>تأیید پرداخت (Confirmed)</span>
                </button>

                {/* Reject Payment (restores inventory) */}
                <button
                  onClick={() => handleUpdateStatus(selectedOrder.id, 'rejected')}
                  disabled={isUpdatingStatus || selectedOrder.status === 'rejected'}
                  className="bg-red-600 hover:bg-red-700 text-white p-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 disabled:opacity-40 cursor-pointer"
                >
                  <XCircle className="w-4 h-4" />
                  <span>رد رسید بانکی (بازگشت موجودی به انبار)</span>
                </button>

                {/* Mark as Shipped with Post */}
                <button
                  onClick={() => handleUpdateStatus(selectedOrder.id, 'shipped')}
                  disabled={isUpdatingStatus || selectedOrder.status === 'shipped'}
                  className="bg-purple-600 hover:bg-purple-700 text-white p-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 disabled:opacity-40 cursor-pointer"
                >
                  <Truck className="w-4 h-4" />
                  <span>تحویل به اداره پست (Shipped)</span>
                </button>

                {/* Mark as Completed */}
                <button
                  onClick={() => handleUpdateStatus(selectedOrder.id, 'completed')}
                  disabled={isUpdatingStatus || selectedOrder.status === 'completed'}
                  className="bg-emerald-700 hover:bg-emerald-800 text-white p-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 disabled:opacity-40 cursor-pointer"
                >
                  <PackageCheck className="w-4 h-4" />
                  <span>تکمیل و تحویل نهایی (Completed)</span>
                </button>
              </div>

              {selectedOrder.delivery_method === 'pickup' && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-center gap-2">
                  <Phone className="w-4 h-4 text-amber-700 shrink-0" />
                  <span>
                    یادآوری: این سفارش تحویل حضوری است. لطفاً با شماره <strong>{selectedOrder.phone}</strong> جهت زمان تحویل هماهنگ فرمایید.
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
