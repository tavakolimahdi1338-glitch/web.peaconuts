import React from 'react';
import { useStore } from '../context/StoreContext';
import {
  Info,
  Phone,
  MapPin,
  Send,
  Instagram,
  ShieldCheck,
  Leaf,
  HeartHandshake,
  Award,
} from 'lucide-react';

export const AboutPage: React.FC = () => {
  const { settings } = useStore();

  const telegramHandle = settings?.telegram_id?.replace('@', '').trim();
  const instagramHandle = settings?.instagram_id?.replace('@', '').trim();

  return (
    <div className="max-w-4xl mx-auto space-y-12 pb-16">
      {/* Header */}
      <div className="text-center space-y-3">
        <span className="text-xs font-bold text-[#b45309] bg-[#fef3c7] px-3.5 py-1 rounded-full inline-block">
          داستان و ارزش‌های ما
        </span>
        <h1 className="text-3xl sm:text-4xl font-black text-[#451a03]">
          درباره {settings?.store_name || 'فروشگاه کره مغزها'}
        </h1>
        <p className="text-sm text-[#78716c] max-w-xl mx-auto">
          ما بر این باوریم که غذای واقعی باید سالم، مقوی، عاری از هرگونه سموم صنعتی و به همان شکلی باشد که مادر طبیعت آفریده است.
        </p>
      </div>

      {/* Main Dynamic About Content */}
      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-[#e8dfd5] shadow-xs space-y-6">
        <div className="flex items-center gap-3 text-[#78350f] font-black text-xl border-b border-[#ebdccb] pb-4">
          <Info className="w-6 h-6 text-[#d97706]" />
          <span>تعهد ما به کیفیت و سلامت شما</span>
        </div>

        {settings?.about_text ? (
          <p className="text-[#451a03] text-sm sm:text-base leading-relaxed whitespace-pre-line">
            {settings.about_text}
          </p>
        ) : (
          <p className="text-[#78716c] text-sm leading-relaxed">
            اطلاعات درباره ما هنوز در پنل تنظیمات ثبت نشده است.
          </p>
        )}

        {/* Highlight Values */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-[#ebdccb]">
          <div className="p-4 rounded-2xl bg-[#faf7f2] border border-[#ebdccb] space-y-1.5">
            <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center">
              <Leaf className="w-4 h-4" />
            </div>
            <h4 className="font-bold text-sm text-[#451a03]">خلوص صددرصدی</h4>
            <p className="text-xs text-[#78716c]">فقط مغز خالص درجه یک، بدون شکر و بدون روغن پالم</p>
          </div>

          <div className="p-4 rounded-2xl bg-[#faf7f2] border border-[#ebdccb] space-y-1.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
            <h4 className="font-bold text-sm text-[#451a03]">فرآوری روزانه</h4>
            <p className="text-xs text-[#78716c]">آسیاب تازه به سفارش مشتری در کارگاه اختصاصی</p>
          </div>

          <div className="p-4 rounded-2xl bg-[#faf7f2] border border-[#ebdccb] space-y-1.5">
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-800 flex items-center justify-center">
              <HeartHandshake className="w-4 h-4" />
            </div>
            <h4 className="font-bold text-sm text-[#451a03]">پاسخگویی مستقیم</h4>
            <p className="text-xs text-[#78716c]">پشتیبانی صمیمانه و تضمین بازگشت وجه در صورت نارضایتی</p>
          </div>
        </div>
      </div>

      {/* Contact & Social Links (Condition: اگر هر کدام خالی بود نمایش داده نشود) */}
      <div className="bg-[#f0e8dc] rounded-3xl p-6 sm:p-8 border border-[#dfd2c0] space-y-6">
        <h3 className="text-lg font-black text-[#451a03]">اطلاعات تماس و شبکه‌های اجتماعی</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Phone */}
          {settings?.phone && (
            <div className="bg-white p-4 rounded-2xl border border-[#ebdccb] flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
                <Phone className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs text-[#78716c] block">شماره تماس ثابت و کارگاه:</span>
                <a
                  href={`tel:${settings.phone}`}
                  dir="ltr"
                  className="font-bold text-sm text-[#451a03] hover:text-[#78350f] transition-colors"
                >
                  {settings.phone}
                </a>
              </div>
            </div>
          )}

          {/* Address */}
          {settings?.address && (
            <div className="bg-white p-4 rounded-2xl border border-[#ebdccb] flex items-start gap-3 md:col-span-2">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 mt-0.5">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs text-[#78716c] block">آدرس کارگاه و محل تحویل حضوری:</span>
                <span className="font-bold text-sm text-[#451a03] leading-relaxed block mt-0.5">
                  {settings.address}
                </span>
              </div>
            </div>
          )}

          {/* Telegram */}
          {telegramHandle && (
            <a
              href={`https://t.me/${telegramHandle}`}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white hover:bg-sky-50 p-4 rounded-2xl border border-[#ebdccb] hover:border-sky-300 flex items-center justify-between transition-all group cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-600 flex items-center justify-center shrink-0">
                  <Send className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs text-[#78716c] block">کانال تلگرام:</span>
                  <span className="font-bold text-sm text-sky-700 dir-ltr block">
                    @{telegramHandle}
                  </span>
                </div>
              </div>
              <span className="text-xs text-sky-600 font-bold group-hover:translate-x-1 transition-transform">
                عضویت ←
              </span>
            </a>
          )}

          {/* Instagram */}
          {instagramHandle && (
            <a
              href={`https://instagram.com/${instagramHandle}`}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white hover:bg-pink-50 p-4 rounded-2xl border border-[#ebdccb] hover:border-pink-300 flex items-center justify-between transition-all group cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-pink-100 text-pink-600 flex items-center justify-center shrink-0">
                  <Instagram className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs text-[#78716c] block">صفحه اینستاگرام:</span>
                  <span className="font-bold text-sm text-pink-700 dir-ltr block">
                    @{instagramHandle}
                  </span>
                </div>
              </div>
              <span className="text-xs text-pink-600 font-bold group-hover:translate-x-1 transition-transform">
                دنبال کردن ←
              </span>
            </a>
          )}
        </div>
      </div>
    </div>
  );
};
