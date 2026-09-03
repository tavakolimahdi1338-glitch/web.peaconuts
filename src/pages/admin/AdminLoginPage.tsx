import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { Lock, Mail, ShieldAlert, ArrowLeft, KeyRound, Sparkles } from 'lucide-react';

export const AdminLoginPage: React.FC = () => {
  const { setAdminToken, setCurrentView, showToast } = useStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password: password.trim() }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'ایمیل یا رمز عبور اشتباه است.');
      } else {
        setAdminToken(data.token);
        showToast('ورود با موفقیت انجام شد. خوش آمدید مدیر گرامی.', 'success');
        setCurrentView('admin');
      }
    } catch {
      setError('خطا در برقراری ارتباط با سرور.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAutofillDefault = () => {
    setEmail('admin@store.local');
    setPassword('Admin1234!');
    setError(null);
  };

  return (
    <div className="max-w-md mx-auto py-12 px-4 space-y-6">
      <div className="text-center space-y-2">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#78350f] to-[#451a03] text-white flex items-center justify-center mx-auto shadow-md">
          <Lock className="w-7 h-7 text-amber-300" />
        </div>
        <h1 className="text-2xl font-black text-[#451a03]">ورود به پنل مدیریت فروشگاه</h1>
        <p className="text-xs text-[#78716c]">
          کنترل سفارش‌ها، پرداخت‌ها، محصولات، کوپن‌ها و تنظیمات
        </p>
      </div>

      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#e8dfd5] shadow-lg space-y-6">
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#451a03] mb-1.5">
              ایمیل مدیر
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#a8a29e] absolute right-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                placeholder="admin@store.local"
                dir="ltr"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pr-10 pl-3 py-2.5 text-sm bg-[#faf7f2] border border-[#d6cbbf] rounded-xl focus:outline-none focus:border-[#78350f] text-right"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#451a03] mb-1.5">
              رمز عبور
            </label>
            <div className="relative">
              <KeyRound className="w-4 h-4 text-[#a8a29e] absolute right-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                placeholder="••••••••"
                dir="ltr"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pr-10 pl-3 py-2.5 text-sm bg-[#faf7f2] border border-[#d6cbbf] rounded-xl focus:outline-none focus:border-[#78350f] text-right"
              />
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#78350f] hover:bg-[#b45309] text-white py-3 rounded-xl font-bold text-sm shadow-md transition-all cursor-pointer disabled:opacity-50"
          >
            {isLoading ? 'در حال ورود...' : 'ورود به پنل مدیریت'}
          </button>
        </form>

        {/* Demo Credentials Box */}
        <div className="bg-[#fcfaf7] border border-[#ebdccb] rounded-2xl p-4 text-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-bold text-[#78350f] flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              اطلاعات حساب مدیر اولیه:
            </span>
            <button
              type="button"
              onClick={handleAutofillDefault}
              className="text-xs bg-[#ebdccb] hover:bg-[#dfd2c0] text-[#451a03] font-bold px-2 py-0.5 rounded cursor-pointer"
            >
              جایگذاری خودکار
            </button>
          </div>
          <div className="text-[11px] text-[#57534e] space-y-1 font-mono" dir="ltr">
            <div>ایمیل: admin@store.local</div>
            <div>رمز عبور: Admin1234!</div>
          </div>
          <p className="text-[10px] text-[#a8a29e] pt-1">
            (پس از ورود می‌توانید در بخش امنیت، رمز و ایمیل را تغییر دهید)
          </p>
        </div>

        <div className="pt-2 text-center">
          <button
            onClick={() => setCurrentView('home')}
            className="text-xs font-bold text-[#78716c] hover:text-[#451a03] inline-flex items-center gap-1 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>بازگشت به سایت فروشگاه</span>
          </button>
        </div>
      </div>
    </div>
  );
};
