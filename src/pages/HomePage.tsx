import React from 'react';
import { useStore } from '../context/StoreContext';
import { ProductCard } from '../components/ProductCard';
import type { Product } from '../types';
import {
  Sparkles,
  ShieldCheck,
  Truck,
  Leaf,
  Award,
  ArrowLeft,
  Send,
  Instagram,
  PhoneCall,
  Clock,
} from 'lucide-react';

interface HomePageProps {
  onSelectProduct: (product: Product) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onSelectProduct }) => {
  const { settings, products, setCurrentView } = useStore();

  const activeProducts = products.filter((p) => p.active);
  const telegramHandle = settings?.telegram_id?.replace('@', '').trim();
  const instagramHandle = settings?.instagram_id?.replace('@', '').trim();

  return (
    <div className="space-y-16 pb-12">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-bl from-[#78350f] via-[#5c2707] to-[#3a1803] text-white p-6 sm:p-12 md:p-16 shadow-xl shadow-amber-950/20">
        {/* Subtle decorative circles */}
        <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-6">
          <div className="inline-flex items-center gap-2 bg-amber-400/20 text-amber-200 border border-amber-300/30 px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-bold backdrop-blur-sm">
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>{settings?.welcome_text || 'طعم ناب و خالص طبیعت در هر قاشق'}</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black leading-tight tracking-tight text-[#fef3c7]">
            {settings?.hero_title || 'کره‌های طبیعی و خالص مغزها، تازه به تازه'}
          </h1>

          <p className="text-sm sm:text-base md:text-lg text-[#e7dfd5] leading-relaxed max-w-2xl font-normal">
            {settings?.hero_subtitle ||
              'سرشار از پروتئین، بدون روغن افزوده و بدون مواد نگه‌دارنده، آسیاب‌شده از مغزهای دست‌چین درجه یک'}
          </p>

          <div className="pt-4 flex flex-wrap items-center gap-4">
            <button
              onClick={() => setCurrentView('shop')}
              className="bg-[#d97706] hover:bg-[#f59e0b] text-white px-7 py-3.5 rounded-2xl font-black text-sm sm:text-base shadow-lg shadow-amber-700/40 hover:shadow-amber-600/50 transition-all transform active:scale-95 flex items-center gap-2 cursor-pointer"
            >
              <span>مشاهده محصولات و ثبت سفارش</span>
              <ArrowLeft className="w-5 h-5" />
            </button>

            <button
              onClick={() => setCurrentView('about')}
              className="bg-white/10 hover:bg-white/20 text-white border border-white/20 px-6 py-3.5 rounded-2xl font-bold text-sm transition-colors cursor-pointer"
            >
              درباره کارگاه ما
            </button>
          </div>

          {/* Social Channels Preview */}
          {(telegramHandle || instagramHandle) && (
            <div className="pt-2 flex flex-wrap items-center gap-3 text-xs">
              <span className="text-amber-200/80 font-medium">همراه ما در شبکه‌های اجتماعی:</span>
              {telegramHandle && (
                <a
                  href={`https://t.me/${telegramHandle}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-white/10 hover:bg-white/20 text-sky-200 px-3 py-1 rounded-lg transition-colors flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>تلگرام: @{telegramHandle}</span>
                </a>
              )}
              {instagramHandle && (
                <a
                  href={`https://instagram.com/${instagramHandle}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-white/10 hover:bg-white/20 text-pink-200 px-3 py-1 rounded-lg transition-colors flex items-center gap-1.5"
                >
                  <Instagram className="w-3.5 h-3.5" />
                  <span>اینستاگرام: @{instagramHandle}</span>
                </a>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Trust & Quality Features */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-[#fcfaf7] p-5 rounded-2xl border border-[#ebdccb] shadow-xs flex flex-col items-center text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center">
            <Leaf className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-sm text-[#451a03]">۱۰۰٪ خالص و ارگانیک</h3>
          <p className="text-xs text-[#78716c]">بدون قطره‌ای روغن صنعتی، پالم یا شکر افزوده</p>
        </div>

        <div className="bg-[#fcfaf7] p-5 rounded-2xl border border-[#ebdccb] shadow-xs flex flex-col items-center text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
            <Clock className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-sm text-[#451a03]">فرآوری و آسیاب روزانه</h3>
          <p className="text-xs text-[#78716c]">تولید تازه به تازه پس از ثبت سفارش شما</p>
        </div>

        <div className="bg-[#fcfaf7] p-5 rounded-2xl border border-[#ebdccb] shadow-xs flex flex-col items-center text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-800 flex items-center justify-center">
            <Truck className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-sm text-[#451a03]">ارسال پستی یا تحویل حضوری</h3>
          <p className="text-xs text-[#78716c]">بسته‌بندی ایمن شیشه‌ای یا تحویل درب کارگاه</p>
        </div>

        <div className="bg-[#fcfaf7] p-5 rounded-2xl border border-[#ebdccb] shadow-xs flex flex-col items-center text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-stone-100 text-stone-800 flex items-center justify-center">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-sm text-[#451a03]">ضمانت اصالت و سلامت</h3>
          <p className="text-xs text-[#78716c]">تضمین ۱۰۰ درصدی کیفیت و عطر و طعم</p>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 border-b border-[#e8dfd5] pb-4">
          <div>
            <span className="text-xs font-bold text-[#b45309] block">ویترین فروشگاه</span>
            <h2 className="text-2xl sm:text-3xl font-black text-[#451a03]">
              محبوب‌ترین کره‌های آجیلی و مغزها
            </h2>
          </div>
          <button
            onClick={() => setCurrentView('shop')}
            className="text-sm font-bold text-[#78350f] hover:text-[#b45309] flex items-center gap-1 cursor-pointer"
          >
            <span>مشاهده همه محصولات</span>
            <ArrowLeft className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {activeProducts.slice(0, 4).map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onSelect={onSelectProduct}
            />
          ))}
        </div>
      </section>

      {/* Card to Card Payment Banner */}
      <section className="bg-[#f0e8dc] border border-[#dfd2c0] rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 text-right">
          <div className="flex items-center gap-2 text-[#78350f] font-bold text-sm">
            <Award className="w-5 h-5 text-[#d97706]" />
            <span>خرید مستقیم و بدون واسطه از کارگاه</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-[#451a03]">
            پرداخت آسان کارت به کارت با بررسی سریع فیش
          </h3>
          <p className="text-xs sm:text-sm text-[#78716c] max-w-xl leading-relaxed">
            مشتریان گرامی پس از انتخاب وزن و بسته‌بندی، مبلغ فاکتور را به شماره کارت رسمی فروشگاه واریز کرده و عکس رسید را در سایت بارگذاری می‌کنند. سفارش شما سریعاً آماده‌سازی می‌شود.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => setCurrentView('shop')}
            className="bg-[#78350f] hover:bg-[#b45309] text-white px-6 py-3 rounded-xl font-bold text-sm transition-colors cursor-pointer"
          >
            ورود به فروشگاه
          </button>
          <button
            onClick={() => setCurrentView('track')}
            className="bg-white hover:bg-[#faf7f2] text-[#451a03] border border-[#d6cbbf] px-5 py-3 rounded-xl font-bold text-sm transition-colors cursor-pointer"
          >
            پیگیری سفارش با کد
          </button>
        </div>
      </section>
    </div>
  );
};
