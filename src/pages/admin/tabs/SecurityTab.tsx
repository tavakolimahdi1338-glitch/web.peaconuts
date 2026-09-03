import React, { useState } from 'react';
import { useStore } from '../../../context/StoreContext';
import { ShieldCheck, KeyRound, Mail, Lock, CheckCircle2, AlertCircle } from 'lucide-react';

export const SecurityTab: React.FC = () => {
  const { adminToken, showToast } = useStore();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword) {
      setError('لطفاً رمز عبور فعلی را وارد کنید.');
      return;
    }

    if (newPassword && newPassword.length < 6) {
      setError('رمز عبور جدید باید حداقل ۶ کاراکتر باشد.');
      return;
    }

    if (newPassword && newPassword !== confirmPassword) {
      setError('تکرار رمز عبور جدید مطابقت ندارد.');
      return;
    }

    if (!newEmail && !newPassword) {
      setError('حداقل یکی از موارد ایمیل جدید یا رمز جدید را تکمیل کنید.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch('/api/admin/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({
          currentPassword,
          newEmail: newEmail.trim() || undefined,
          newPassword: newPassword || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'خطا در تغییر اطلاعات ورود.');
      } else {
        showToast('اطلاعات امنیتی و ورود مدیر با موفقیت به‌روزرسانی شد.', 'success');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setNewEmail('');
      }
    } catch {
      setError('خطا در برقراری ارتباط با سرور.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-xl space-y-6">
      <div className="bg-white p-5 rounded-2xl border border-[#ebdccb] shadow-xs">
        <h2 className="font-black text-lg text-[#451a03]">امنیت و تغییر اطلاعات ورود مدیر</h2>
        <p className="text-xs text-[#78716c]">
          تغییر ایمیل و رمز عبور پنل مدیریت فروشگاه
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-[#ebdccb] p-6 space-y-5 shadow-xs">
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-[#451a03] mb-1.5">
              رمز عبور فعلی <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <KeyRound className="w-4 h-4 text-[#a8a29e] absolute right-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                placeholder="برای تأیید هویت، رمز فعلی را وارد نمایید"
                dir="ltr"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full pr-10 pl-3 py-2 text-sm bg-[#faf7f2] border border-[#d6cbbf] rounded-xl focus:outline-none focus:border-[#78350f] text-right"
              />
            </div>
          </div>

          <div className="pt-2 border-t border-[#faf7f2]">
            <label className="block font-bold text-[#451a03] mb-1.5">
              ایمیل جدید مدیر (اختیاری)
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#a8a29e] absolute right-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                placeholder="مثال: myadmin@store.com"
                dir="ltr"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                className="w-full pr-10 pl-3 py-2 text-sm bg-[#faf7f2] border border-[#d6cbbf] rounded-xl focus:outline-none focus:border-[#78350f] text-right"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-[#451a03] mb-1.5">
              رمز عبور جدید (حداقل ۶ کاراکتر)
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#a8a29e] absolute right-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                placeholder="رمز عبور جدید قوی"
                dir="ltr"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full pr-10 pl-3 py-2 text-sm bg-[#faf7f2] border border-[#d6cbbf] rounded-xl focus:outline-none focus:border-[#78350f] text-right"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-[#451a03] mb-1.5">
              تکرار رمز عبور جدید
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#a8a29e] absolute right-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                placeholder="تکرار رمز عبور جدید"
                dir="ltr"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full pr-10 pl-3 py-2 text-sm bg-[#faf7f2] border border-[#d6cbbf] rounded-xl focus:outline-none focus:border-[#78350f] text-right"
              />
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-[#78350f] hover:bg-[#b45309] text-white px-6 py-2.5 rounded-xl font-bold text-xs shadow-md transition-all cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? 'در حال ذخیره...' : 'به‌روزرسانی اطلاعات امنیتی'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
