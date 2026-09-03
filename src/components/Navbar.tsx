import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import {
  ShoppingBag,
  Menu,
  X,
  Megaphone,
  Store,
  Search,
  HelpCircle,
  Info,
  ShieldCheck,
  UserCheck,
} from 'lucide-react';
import { toPersianDigits } from '../lib/formatters';

interface NavbarProps {
  onOpenCart: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenCart }) => {
  const {
    settings,
    announcement,
    currentView,
    setCurrentView,
    getCartTotalCount,
    adminToken,
  } = useStore();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dismissBanner, setDismissBanner] = useState(false);

  const cartCount = getCartTotalCount();

  const navLinks = [
    { id: 'home', label: 'صفحه اصلی', icon: Store },
    { id: 'shop', label: 'محصولات فروشگاه', icon: Search },
    { id: 'track', label: 'پیگیری سفارش', icon: ShieldCheck },
    { id: 'support', label: 'پشتیبانی و تماس', icon: HelpCircle },
    { id: 'about', label: 'درباره ما', icon: Info },
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#faf7f2]/95 backdrop-blur-md border-b border-[#e7e1d7]">
      {/* Top Announcement Banner */}
      {announcement && announcement.active && !dismissBanner && (
        <div className="bg-[#78350f] text-[#fef3c7] px-4 py-2 text-xs md:text-sm font-medium transition-all">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 overflow-hidden text-ellipsis whitespace-nowrap">
              <Megaphone className="w-4 h-4 shrink-0 text-[#f59e0b] animate-pulse" />
              <span className="font-bold">{announcement.title}:</span>
              <span className="opacity-95">{announcement.body}</span>
            </div>
            <button
              onClick={() => setDismissBanner(true)}
              className="text-[#fef3c7]/80 hover:text-white shrink-0 p-1"
              title="بستن اعلان"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18">
          {/* Logo & Store Name */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setCurrentView('home');
                setMobileMenuOpen(false);
              }}
              className="flex items-center gap-3 text-right group cursor-pointer"
            >
              <div className="w-11 h-11 rounded-2xl bg-white border border-[#e7e1d7] overflow-hidden flex items-center justify-center shadow-md shadow-amber-900/10 group-hover:scale-105 transition-transform p-0.5">
                <img
                  src={settings?.logo_url || '/uploads/peaconuts_icon.jpg'}
                  alt={settings?.store_name || 'پیکوناتس'}
                  className="w-full h-full object-contain rounded-xl"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="flex flex-col">
                <span className="font-black text-lg md:text-xl text-[#451a03] tracking-tight group-hover:text-[#b45309] transition-colors">
                  {settings?.store_name || 'فروشگاه کره مغزها'}
                </span>
                <span className="text-[11px] text-[#78716c] font-medium hidden sm:inline">
                  کره‌های ۱۰۰٪ طبیعی، تازه و بدون مواد نگهدارنده
                </span>
              </div>
            </button>
          </div>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            {navLinks.map((link) => {
              const isActive = currentView === link.id;
              return (
                <button
                  key={link.id}
                  onClick={() => setCurrentView(link.id)}
                  className={`px-3.5 py-2 rounded-xl text-sm font-semibold transition-colors flex items-center gap-1.5 cursor-pointer ${
                    isActive
                      ? 'bg-[#78350f] text-white shadow-sm'
                      : 'text-[#57534e] hover:text-[#451a03] hover:bg-[#ebdccb]/50'
                  }`}
                >
                  <link.icon className={`w-4 h-4 ${isActive ? 'text-amber-300' : 'text-[#a8a29e]'}`} />
                  {link.label}
                </button>
              );
            })}
          </nav>

          {/* Action Buttons: Cart & Admin */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Admin link */}
            <button
              onClick={() => setCurrentView(adminToken ? 'admin' : 'admin-login')}
              className="text-xs px-2.5 py-1.5 rounded-lg border border-[#d6cbbf] text-[#78716c] hover:text-[#451a03] hover:bg-[#ede3d7] transition-colors flex items-center gap-1.5 font-medium cursor-pointer"
              title="پنل مدیریت فروشگاه"
            >
              <UserCheck className="w-3.5 h-3.5 text-[#d97706]" />
              <span className="hidden sm:inline">{adminToken ? 'پنل مدیریت' : 'ورود مدیر'}</span>
            </button>

            {/* Cart Button */}
            <button
              onClick={onOpenCart}
              className="relative flex items-center gap-2 bg-[#d97706] hover:bg-[#b45309] text-white px-3.5 py-2 rounded-xl font-bold text-sm shadow-md shadow-amber-600/20 transition-all transform active:scale-95 cursor-pointer"
              aria-label="سبد خرید"
            >
              <ShoppingBag className="w-4 h-4" />
              <span className="hidden sm:inline">سبد خرید</span>
              {cartCount > 0 && (
                <span className="bg-[#451a03] text-white text-xs font-black px-2 py-0.5 rounded-full shadow-sm">
                  {toPersianDigits(cartCount)}
                </span>
              )}
            </button>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl text-[#451a03] hover:bg-[#ebdccb] transition-colors"
              aria-label="منوی سایت"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#faf7f2] border-b border-[#e7e1d7] px-4 pt-2 pb-4 space-y-1.5">
          {navLinks.map((link) => {
            const isActive = currentView === link.id;
            return (
              <button
                key={link.id}
                onClick={() => {
                  setCurrentView(link.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-right text-sm font-semibold transition-colors ${
                  isActive
                    ? 'bg-[#78350f] text-white'
                    : 'text-[#57534e] hover:bg-[#ebdccb]/60 hover:text-[#451a03]'
                }`}
              >
                <link.icon className={`w-4 h-4 ${isActive ? 'text-amber-300' : 'text-[#a8a29e]'}`} />
                {link.label}
              </button>
            );
          })}
          <div className="pt-2 border-t border-[#e7e1d7]">
            <button
              onClick={() => {
                setCurrentView(adminToken ? 'admin' : 'admin-login');
                setMobileMenuOpen(false);
              }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-right text-sm font-semibold text-[#78716c] hover:bg-[#ebdccb]/60"
            >
              <UserCheck className="w-4 h-4 text-[#d97706]" />
              {adminToken ? 'پنل مدیریت فروشگاه' : 'ورود مدیر به پنل'}
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
