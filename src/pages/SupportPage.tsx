import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { formatDate } from '../lib/formatters';
import type { SupportTicket } from '../types';
import {
  Send,
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
  Clock,
  CheckCheck,
  Search,
  FileCheck,
  FileText,
} from 'lucide-react';

export const SupportPage: React.FC = () => {
  const { showToast } = useStore();

  // New ticket state
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [attachedFile, setAttachedFile] = useState<{
    base64: string;
    filename: string;
    mimeType: string;
  } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);

  // My tickets lookup state
  const [lookupPhone, setLookupPhone] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [myTickets, setMyTickets] = useState<SupportTicket[] | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      showToast('حجم فایل ضمیمه نباید بیش از ۵ مگابایت باشد.', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setAttachedFile({
        base64: reader.result as string,
        filename: file.name,
        mimeType: file.type,
      });
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || !phone.trim() || !message.trim()) {
      showToast('لطفاً نام، شماره تماس و متن پیام را کامل وارد کنید.', 'error');
      return;
    }

    setIsSubmitting(true);

    try {
      let fileUrl: string | undefined = undefined;
      if (attachedFile) {
        const upRes = await fetch('/api/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            base64: attachedFile.base64,
            filename: attachedFile.filename,
            mimeType: attachedFile.mimeType,
          }),
        });
        const upData = await upRes.json();
        if (upRes.ok) {
          fileUrl = upData.url;
        }
      }

      const res = await fetch('/api/support', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_name: customerName.trim(),
          phone: phone.trim(),
          email: email.trim(),
          message: message.trim(),
          file_url: fileUrl,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        showToast(data.error || 'خطا در ثبت پیام.', 'error');
      } else {
        setSubmittedSuccess(true);
        setCustomerName('');
        setMessage('');
        setEmail('');
        setAttachedFile(null);
        showToast('پیام شما با موفقیت ارسال شد.', 'success');
      }
    } catch {
      showToast('خطا در برقراری ارتباط با سرور.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLookupMyTickets = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lookupPhone.trim()) return;

    setIsSearching(true);
    try {
      const res = await fetch(`/api/support/my?phone=${encodeURIComponent(lookupPhone.trim())}`);
      const data = await res.json();
      if (res.ok) {
        setMyTickets(data);
      } else {
        showToast(data.error || 'خطا در استعلام پیام‌ها', 'error');
      }
    } catch {
      showToast('خطا در برقراری ارتباط با سرور.', 'error');
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-10 pb-16">
      <div className="text-center space-y-2">
        <span className="text-xs font-bold text-[#b45309]">ارتباط با مشتریان</span>
        <h1 className="text-2xl sm:text-3xl font-black text-[#451a03]">
          پشتیبانی و ثبت پیام
        </h1>
        <p className="text-xs sm:text-sm text-[#78716c] max-w-md mx-auto">
          سؤال، انتقاد یا پیشنهادی در رابطه با محصولات یا سفارش خود دارید؟ پیام خود را برای ما ارسال نمایید.
        </p>
      </div>

      {/* Ticket Submission Form */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#e8dfd5] shadow-xs space-y-6">
        <div className="flex items-center gap-2 text-[#78350f] font-bold text-base border-b border-[#ebdccb] pb-3">
          <MessageSquare className="w-5 h-5 text-[#d97706]" />
          <span>ارسال پیام جدید به کارشناسان فروشگاه</span>
        </div>

        {submittedSuccess && (
          <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-2xl text-emerald-900 text-xs sm:text-sm flex items-center justify-between">
            <div className="flex items-center gap-2 font-bold">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>پیام شما با موفقیت ثبت شد و در اسرع وقت پاسخ داده خواهد شد.</span>
            </div>
            <button
              onClick={() => setSubmittedSuccess(false)}
              className="text-xs text-emerald-700 underline"
            >
              ارسال پیام دیگر
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#451a03] mb-1.5">
                نام و نام خانوادگی <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="مثال: سارا محمدی"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm bg-[#faf7f2] border border-[#d6cbbf] rounded-xl focus:outline-none focus:border-[#78350f]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#451a03] mb-1.5">
                شماره تماس <span className="text-red-500">*</span>
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

          <div>
            <label className="block text-xs font-bold text-[#78716c] mb-1.5">
              ایمیل (اختیاری)
            </label>
            <input
              type="email"
              placeholder="example@mail.com"
              dir="ltr"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm bg-[#faf7f2] border border-[#d6cbbf] rounded-xl focus:outline-none focus:border-[#78350f] text-right"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#451a03] mb-1.5">
              متن پیام یا سؤال شما <span className="text-red-500">*</span>
            </label>
            <textarea
              required
              rows={4}
              placeholder="پیام یا سؤال خود را به صورت دقیق بنویسید..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm bg-[#faf7f2] border border-[#d6cbbf] rounded-xl focus:outline-none focus:border-[#78350f]"
            />
          </div>

          {/* Attachment */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-[#78716c]">
              پیوست فایل یا تصویر (اختیاری)
            </label>
            <div className="flex items-center gap-3">
              <label className="bg-[#faf7f2] hover:bg-[#ebdccb] border border-[#d6cbbf] px-4 py-2 rounded-xl text-xs font-bold text-[#451a03] cursor-pointer flex items-center gap-2 transition-colors">
                <UploadCloud className="w-4 h-4 text-[#78350f]" />
                <span>انتخاب فایل</span>
                <input
                  type="file"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>

              {attachedFile && (
                <div className="text-xs text-emerald-700 flex items-center gap-1 font-bold">
                  <FileCheck className="w-4 h-4" />
                  <span>{attachedFile.filename}</span>
                </div>
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-[#78350f] hover:bg-[#b45309] text-white py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
            <span>{isSubmitting ? 'در حال ارسال...' : 'ارسال پیام به پشتیبانی'}</span>
          </button>
        </form>
      </div>

      {/* Lookup My Past Messages */}
      <div className="bg-[#fbf9f5] rounded-3xl p-6 sm:p-8 border border-[#ebdccb] space-y-6">
        <div className="space-y-1">
          <h3 className="font-bold text-base text-[#451a03] flex items-center gap-2">
            <Search className="w-4 h-4 text-[#d97706]" />
            پیگیری پیام‌ها و پاسخ‌های قبلی
          </h3>
          <p className="text-xs text-[#78716c]">
            با وارد کردن شماره تماس خود، پاسخ‌های ارسالی مدیر را مشاهده فرمایید.
          </p>
        </div>

        <form onSubmit={handleLookupMyTickets} className="flex gap-2">
          <input
            type="tel"
            placeholder="شماره تماس خود را وارد کنید..."
            dir="ltr"
            value={lookupPhone}
            onChange={(e) => setLookupPhone(e.target.value)}
            className="flex-1 px-3.5 py-2.5 text-sm bg-white border border-[#d6cbbf] rounded-xl focus:outline-none focus:border-[#78350f] text-right"
          />
          <button
            type="submit"
            disabled={isSearching}
            className="bg-[#d97706] hover:bg-[#b45309] text-white px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm cursor-pointer"
          >
            {isSearching ? 'در حال استعلام...' : 'مشاهده پیام‌ها'}
          </button>
        </form>

        {myTickets && (
          <div className="space-y-3 pt-2">
            {myTickets.length === 0 ? (
              <p className="text-xs text-[#78716c] text-center py-4">
                پیامی با این شماره تماس یافت نشد.
              </p>
            ) : (
              myTickets.map((tic) => (
                <div
                  key={tic.id}
                  className="bg-white p-4 rounded-2xl border border-[#ebdccb] space-y-3 text-xs"
                >
                  <div className="flex items-center justify-between border-b border-[#faf7f2] pb-2">
                    <span className="text-[#78716c]">{formatDate(tic.created_at)}</span>
                    <span
                      className={`px-2 py-0.5 rounded-md font-bold text-[11px] ${
                        tic.status === 'answered'
                          ? 'bg-emerald-100 text-emerald-800'
                          : tic.status === 'closed'
                          ? 'bg-stone-200 text-stone-600'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {tic.status === 'answered'
                        ? 'پاسخ داده شده'
                        : tic.status === 'closed'
                        ? 'بسته شده'
                        : 'در انتظار پاسخ'}
                    </span>
                  </div>

                  <p className="text-[#451a03] font-medium leading-relaxed bg-[#faf7f2] p-3 rounded-xl">
                    <strong className="block text-[#78716c] text-[11px] mb-1">پیام شما:</strong>
                    {tic.message}
                  </p>

                  {tic.admin_reply ? (
                    <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-xl text-emerald-950 space-y-1">
                      <strong className="block text-emerald-800 font-bold text-[11px]">
                        پاسخ مدیر فروشگاه:
                      </strong>
                      <p className="leading-relaxed">{tic.admin_reply}</p>
                    </div>
                  ) : (
                    <div className="text-[#a8a29e] italic flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      <span>پیام شما هنوز توسط کارشناسان بررسی نشده است.</span>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};
