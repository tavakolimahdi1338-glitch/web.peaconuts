import React, { useState } from 'react';
import { useStore } from '../../../context/StoreContext';
import { formatDate } from '../../../lib/formatters';
import type { Announcement } from '../../../types';
import {
  Megaphone,
  Plus,
  Trash2,
  CheckCircle,
  Eye,
  EyeOff,
  AlertCircle,
  X,
} from 'lucide-react';

export const AnnouncementsTab: React.FC = () => {
  const { announcements, adminToken, fetchAnnouncements, showToast } = useStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [active, setActive] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) {
      showToast('متن پیام اطلاعیه را وارد کنید.', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/admin/announcements', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({
          title: title.trim() || 'اطلاعیه مهم',
          content: content.trim(),
          active,
        }),
      });

      if (res.ok) {
        showToast('اطلاعیه با موفقیت ایجاد شد.', 'success');
        setIsModalOpen(false);
        setTitle('');
        setContent('');
        await fetchAnnouncements();
      } else {
        showToast('خطا در ایجاد اطلاعیه', 'error');
      }
    } catch {
      showToast('خطا در برقراری ارتباط با سرور', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleActive = async (ann: Announcement) => {
    try {
      const res = await fetch(`/api/admin/announcements/${ann.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({ active: !ann.active }),
      });

      if (res.ok) {
        showToast(
          !ann.active ? 'اطلاعیه فعال شد و در بالای سایت قرار گرفت.' : 'اطلاعیه غیرفعال شد.',
          'success'
        );
        await fetchAnnouncements();
      }
    } catch {
      showToast('خطا در تغییر وضعیت اطلاعیه', 'error');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('آیا از حذف این اطلاعیه اطمینان دارید؟')) return;

    try {
      const res = await fetch(`/api/admin/announcements/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${adminToken}` },
      });

      if (res.ok) {
        showToast('اطلاعیه حذف شد.', 'success');
        await fetchAnnouncements();
      }
    } catch {
      showToast('خطا در حذف اطلاعیه', 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-[#ebdccb] shadow-xs">
        <div>
          <h2 className="font-black text-lg text-[#451a03]">مدیریت نوار اطلاعیه بالای سایت</h2>
          <p className="text-xs text-[#78716c]">
            اعلان تخفیف‌های ویژه، زمان‌بندی ارسال یا پیام‌های مهم در کادر بالای تمامی صفحات
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-[#78350f] hover:bg-[#b45309] text-white px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 shadow-sm transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>ایجاد اطلاعیه جدید</span>
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-[#ebdccb] overflow-hidden shadow-xs">
        {announcements.length === 0 ? (
          <div className="py-16 text-center text-xs text-[#78716c] space-y-2">
            <Megaphone className="w-8 h-8 text-[#a8a29e] mx-auto" />
            <p>هنوز اطلاعیه‌ای ثبت نشده است.</p>
          </div>
        ) : (
          <div className="divide-y divide-[#faf7f2]">
            {announcements.map((ann) => (
              <div
                key={ann.id}
                className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-[#fcfaf7]"
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-[#451a03]">{ann.title}</span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        ann.active
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-stone-100 text-stone-600'
                      }`}
                    >
                      {ann.active ? 'در حال نمایش در سایت' : 'غیرفعال'}
                    </span>
                  </div>
                  <p className="text-xs text-[#57534e] leading-relaxed">{ann.content}</p>
                  <span className="text-[11px] text-[#a8a29e] block">
                    تاریخ ایجاد: {formatDate(ann.created_at)}
                  </span>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  <button
                    onClick={() => handleToggleActive(ann)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
                      ann.active
                        ? 'bg-amber-100 text-amber-900 hover:bg-amber-200'
                        : 'bg-emerald-100 text-emerald-900 hover:bg-emerald-200'
                    }`}
                  >
                    {ann.active ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    <span>{ann.active ? 'عدم نمایش' : 'فعال‌سازی در سایت'}</span>
                  </button>

                  <button
                    onClick={() => handleDelete(ann.id)}
                    className="p-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 transition-colors cursor-pointer"
                    title="حذف اطلاعیه"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div
            className="bg-white rounded-3xl max-w-md w-full border border-[#ebdccb] shadow-2xl p-6 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-[#ebdccb] pb-3">
              <h3 className="font-black text-lg text-[#451a03]">ایجاد اطلاعیه جدید</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg hover:bg-[#ebdccb] text-[#57534e]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-[#451a03] mb-1">
                  عنوان مختصر (اختیاری)
                </label>
                <input
                  type="text"
                  placeholder="مثال: تخفیف ویژه بهاره"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-[#faf7f2] border border-[#d6cbbf] rounded-xl focus:outline-none focus:border-[#78350f]"
                />
              </div>

              <div>
                <label className="block font-bold text-[#451a03] mb-1">
                  متن پیام اطلاعیه <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="مثال: ارسال رایگان برای سفارش‌های بالای ۵۰۰ هزار تومان تا پایان این هفته..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-[#faf7f2] border border-[#d6cbbf] rounded-xl focus:outline-none focus:border-[#78350f]"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="ann-active"
                  checked={active}
                  onChange={(e) => setActive(e.target.checked)}
                  className="w-4 h-4 rounded text-[#78350f] accent-[#78350f]"
                />
                <label htmlFor="ann-active" className="font-bold text-[#451a03]">
                  بلافاصله در نوار بالای سایت فعال و نمایش داده شود
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#ebdccb]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 font-bold text-[#78716c] hover:bg-[#faf7f2] rounded-xl"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-[#78350f] hover:bg-[#b45309] text-white px-5 py-2 rounded-xl font-bold"
                >
                  {isSubmitting ? 'در حال ثبت...' : 'انتشار اطلاعیه'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
