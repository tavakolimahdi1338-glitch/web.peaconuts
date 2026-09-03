import React from 'react';
import { useStore } from '../context/StoreContext';
import { Phone, MapPin, Send, Instagram, ShieldCheck, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  const { settings, setCurrentView } = useStore();

  const telegramHandle = settings?.telegram_id?.replace('@', '').trim();
  const instagramHandle = settings?.instagram_id?.replace('@', '').trim();

  return (
    <footer className="bg-[#291e17] text-[#e7dfd5] border-t border-[#45362c] mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand & About Preview */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white border border-[#45362c] overflow-hidden flex items-center justify-center p-0.5 shrink-0">
                <img
                  src={settings?.logo_url || '/uploads/peaconuts_icon.jpg'}
                  alt={settings?.store_name || 'پیکوناتس'}
                  className="w-full h-full object-contain rounded-lg"
                  referrerPolicy="no-referrer"
                />
              </div>
              <span className="font-black text-xl text-[#fef3c7]">
                {settings?.store_name || 'فروشگاه کره مغزها'}
              </span>
            </div>
            <p className="text-sm leading-relaxed text-[#c4b5a5] max-w-lg">
              {settings?.about_text ||
                'تولید و عرضه مستقیم انواع کره‌های آجیلی طبیعی، تهیه شده از بهترین مغزهای تازه ایرانی، بدون هیچ افزودنی شیمیایی و شکر افزوده.'}
            </p>
            <div className="flex items-center gap-4 pt-2">
              {telegramHandle && (
                <a
                  href={`https://t.me/${telegramHandle}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 bg-[#229ed9]/15 text-[#229ed9] hover:bg-[#229ed9]/25 px-3 py-1.5 rounded-xl text-xs font-bold transition-colors"
                >
                  <Send className="w-4 h-4" />
                  <span>کانال تلگرام: @{telegramHandle}</span>
                </a>
              )}
              {instagramHandle && (
                <a
                  href={`https://instagram.com/${instagramHandle}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 bg-[#e1306c]/15 text-[#e1306c] hover:bg-[#e1306c]/25 px-3 py-1.5 rounded-xl text-xs font-bold transition-colors"
                >
                  <Instagram className="w-4 h-4" />
                  <span>اینستاگرام: @{instagramHandle}</span>
                </a>
              )}
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-[#fef3c7] tracking-wide">
              دسترسی سریع
            </h3>
            <ul className="space-y-2 text-sm text-[#c4b5a5]">
              <li>
                <button
                  onClick={() => setCurrentView('home')}
                  className="hover:text-amber-400 transition-colors"
                >
                  صفحه اصلی
                </button>
              </li>
              <li>
                <button
                  onClick={() => setCurrentView('shop')}
                  className="hover:text-amber-400 transition-colors"
                >
                  لیست محصولات و خرید
                </button>
              </li>
              <li>
                <button
                  onClick={() => setCurrentView('track')}
                  className="hover:text-amber-400 transition-colors"
                >
                  پیگیری وضعیت سفارش با کد
                </button>
              </li>
              <li>
                <button
                  onClick={() => setCurrentView('support')}
                  className="hover:text-amber-400 transition-colors"
                >
                  ارسال پیام به پشتیبانی
                </button>
              </li>
              <li>
                <button
                  onClick={() => setCurrentView('about')}
                  className="hover:text-amber-400 transition-colors"
                >
                  درباره ما و اطلاعات تماس
                </button>
              </li>
            </ul>
          </div>

          {/* Contact & Workshop */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-[#fef3c7] tracking-wide">
              اطلاعات کارگاه و تماس
            </h3>
            <ul className="space-y-3 text-sm text-[#c4b5a5]">
              {settings?.phone && (
                <li className="flex items-center gap-2.5">
                  <Phone className="w-4 h-4 text-amber-400 shrink-0" />
                  <span dir="ltr" className="font-semibold text-right">
                    {settings.phone}
                  </span>
                </li>
              )}
              {settings?.address && (
                <li className="flex items-start gap-2.5">
                  <MapPin className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{settings.address}</span>
                </li>
              )}
              <li className="flex items-center gap-2.5 text-xs text-emerald-400 bg-emerald-950/40 p-2.5 rounded-xl border border-emerald-800/40">
                <ShieldCheck className="w-4 h-4 shrink-0" />
                <span>پرداخت امن کارت به کارت با تأیید آنی رسید توسط کارشناسان</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright & Admin Link */}
        <div className="border-t border-[#45362c] mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#a89988]">
          <p className="flex items-center gap-1">
            تمام حقوق برای {settings?.store_name || 'فروشگاه کره مغزها'} محفوظ است. تهیه شده با عشق و سلامت
            <Heart className="w-3.5 h-3.5 text-red-400 fill-red-400 inline" />
          </p>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setCurrentView('admin-login')}
              className="text-[#a89988] hover:text-amber-300 transition-colors underline"
            >
              ورود همکاران / مدیر فروشگاه
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
