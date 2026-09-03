import React, { useState, useEffect } from 'react';
import { useStore } from '../../../context/StoreContext';
import { formatDate } from '../../../lib/formatters';
import type { SupportTicket } from '../../../types';
import {
  MessageSquare,
  FileText,
  ExternalLink,
  Reply,
  CheckCircle,
  Clock,
  Archive,
  X,
  Phone,
  Mail,
  User,
} from 'lucide-react';

export const SupportTab: React.FC = () => {
  const { adminToken, showToast } = useStore();

  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [replyText, setReplyText] = useState('');
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);

  const fetchTickets = async () => {
    if (!adminToken) return;
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/support', {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      if (res.ok) {
        const data = await res.json();
        setTickets(data);
      }
    } catch {
      showToast('خطا در دریافت لیست پیام‌های پشتیبانی', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, [adminToken]);

  const openReplyModal = (t: SupportTicket) => {
    setSelectedTicket(t);
    setReplyText(t.admin_reply || '');
  };

  const handleSendReply = async (newStatus: 'answered' | 'closed') => {
    if (!selectedTicket || !adminToken) return;
    if (!replyText.trim() && newStatus === 'answered') {
      showToast('لطفاً متن پاسخ را وارد کنید.', 'error');
      return;
    }

    setIsSubmittingReply(true);
    try {
      const res = await fetch(`/api/admin/support/${selectedTicket.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({
          admin_reply: replyText.trim(),
          status: newStatus,
        }),
      });

      if (res.ok) {
        showToast('پاسخ با موفقیت ذخیره گردید.', 'success');
        setSelectedTicket(null);
        await fetchTickets();
      } else {
        showToast('خطا در ذخیره پاسخ', 'error');
      }
    } catch {
      showToast('خطا در برقراری ارتباط با سرور', 'error');
    } finally {
      setIsSubmittingReply(false);
    }
  };

  const filteredTickets = tickets.filter((t) => {
    if (filterStatus !== 'all' && t.status !== filterStatus) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-[#ebdccb] shadow-xs">
        <div>
          <h2 className="font-black text-lg text-[#451a03]">پیام‌ها و تیکت‌های پشتیبانی</h2>
          <p className="text-xs text-[#78716c]">
            رسیدگی به پیام‌های مشتریان، مشاهده فایل‌های ارسالی و ثبت پاسخ رسمی مدیریت
          </p>
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {[
            { key: 'all', label: 'همه پیام‌ها' },
            { key: 'pending', label: 'در انتظار پاسخ' },
            { key: 'answered', label: 'پاسخ داده شده' },
            { key: 'closed', label: 'بسته شده' },
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

      {/* Tickets Table */}
      <div className="bg-white rounded-2xl border border-[#ebdccb] overflow-hidden shadow-xs">
        {filteredTickets.length === 0 ? (
          <div className="py-16 text-center text-xs text-[#78716c] space-y-2">
            <MessageSquare className="w-8 h-8 text-[#a8a29e] mx-auto" />
            <p>پیامی با این مشخصات یافت نشد.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-right">
              <thead>
                <tr className="bg-[#faf7f2] border-b border-[#ebdccb] text-[#78716c]">
                  <th className="py-3 px-4 font-bold">نام مشتری و تماس</th>
                  <th className="py-3 px-4 font-bold">خلاصه پیام</th>
                  <th className="py-3 px-4 font-bold">پیوست</th>
                  <th className="py-3 px-4 font-bold">وضعیت</th>
                  <th className="py-3 px-4 font-bold">تاریخ ارسال</th>
                  <th className="py-3 px-4 font-bold text-left">اقدام</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#faf7f2]">
                {filteredTickets.map((t) => (
                  <tr key={t.id} className="hover:bg-[#fcfaf7]">
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-[#451a03] block">{t.customer_name}</span>
                      <span className="text-[11px] text-[#78716c] dir-ltr block text-right font-mono">
                        {t.phone}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <p className="text-xs text-[#57534e] line-clamp-1 max-w-sm">{t.message}</p>
                      {t.admin_reply && (
                        <span className="text-[10px] text-emerald-700 font-bold block mt-0.5">
                          پاسخ ثبت شده است
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      {t.file_url ? (
                        <a
                          href={t.file_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[#78350f] hover:underline font-bold"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span>مشاهده فایل</span>
                        </a>
                      ) : (
                        <span className="text-[#a8a29e]">ندارد</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          t.status === 'answered'
                            ? 'bg-emerald-100 text-emerald-800'
                            : t.status === 'closed'
                            ? 'bg-stone-100 text-stone-600'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {t.status === 'answered'
                          ? 'پاسخ داده شده'
                          : t.status === 'closed'
                          ? 'بسته شده'
                          : 'در انتظار پاسخ'}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-[#78716c]">{formatDate(t.created_at)}</td>

                    <td className="py-3.5 px-4 text-left">
                      <button
                        onClick={() => openReplyModal(t)}
                        className="bg-[#78350f] hover:bg-[#b45309] text-white px-3 py-1.5 rounded-lg font-bold text-[11px] flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        <Reply className="w-3 h-3" />
                        <span>پاسخ‌دهی</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Reply Modal */}
      {selectedTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div
            className="bg-white rounded-3xl max-w-lg w-full max-h-[92vh] overflow-y-auto border border-[#ebdccb] shadow-2xl p-6 sm:p-8 space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-[#ebdccb] pb-3">
              <h3 className="font-black text-lg text-[#451a03]">پاسخ به پیام مشتری</h3>
              <button
                onClick={() => setSelectedTicket(null)}
                className="p-1.5 rounded-lg hover:bg-[#ebdccb] text-[#57534e]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Ticket detail */}
            <div className="bg-[#faf7f2] p-4 rounded-2xl border border-[#ebdccb] space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-[#78716c]">نام فرستنده:</span>
                <strong className="text-[#451a03]">{selectedTicket.customer_name}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-[#78716c]">شماره تماس:</span>
                <strong className="text-[#451a03]" dir="ltr">{selectedTicket.phone}</strong>
              </div>
              {selectedTicket.email && (
                <div className="flex justify-between">
                  <span className="text-[#78716c]">ایمیل:</span>
                  <span className="text-[#451a03]" dir="ltr">{selectedTicket.email}</span>
                </div>
              )}
              <div className="pt-2 border-t border-[#ebdccb]">
                <span className="text-[#78716c] block mb-1 font-bold">متن پیام مشتری:</span>
                <p className="text-[#451a03] leading-relaxed bg-white p-3 rounded-xl border border-[#ebdccb]">
                  {selectedTicket.message}
                </p>
              </div>

              {selectedTicket.file_url && (
                <div className="pt-1">
                  <a
                    href={selectedTicket.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-700 hover:underline inline-flex items-center gap-1 font-bold"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>مشاهده فایل ضمیمه مشتری در تب جدید</span>
                  </a>
                </div>
              )}
            </div>

            {/* Admin reply textarea */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-[#451a03]">
                متن پاسخ مدیر به مشتری:
              </label>
              <textarea
                rows={4}
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="پاسخ محترمانه خود را اینجا بنویسید (مشتری می‌تواند این پاسخ را در صفحه پشتیبانی سایت با شماره خود مشاهده کند)..."
                className="w-full px-3.5 py-2.5 text-xs bg-[#faf7f2] border border-[#d6cbbf] rounded-xl focus:outline-none focus:border-[#78350f]"
              />
            </div>

            {/* Action buttons */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#ebdccb]">
              <button
                type="button"
                onClick={() => setSelectedTicket(null)}
                className="px-4 py-2 text-xs font-bold text-[#78716c] hover:bg-[#faf7f2] rounded-xl"
              >
                انصراف
              </button>

              <button
                type="button"
                disabled={isSubmittingReply}
                onClick={() => handleSendReply('closed')}
                className="bg-stone-600 hover:bg-stone-700 text-white px-3.5 py-2 rounded-xl text-xs font-bold"
              >
                بستن تیکت
              </button>

              <button
                type="button"
                disabled={isSubmittingReply}
                onClick={() => handleSendReply('answered')}
                className="bg-[#78350f] hover:bg-[#b45309] text-white px-4 py-2 rounded-xl text-xs font-bold"
              >
                {isSubmittingReply ? 'در حال ثبت...' : 'ارسال و ثبت پاسخ'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
