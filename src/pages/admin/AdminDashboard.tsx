import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  Tag,
  BarChart3,
  Megaphone,
  MessageSquare,
  Settings,
  ShieldCheck,
  LogOut,
  ExternalLink,
  Store,
  Menu,
  X,
} from 'lucide-react';

import { OverviewTab } from './tabs/OverviewTab';
import { OrdersTab } from './tabs/OrdersTab';
import { ProductsTab } from './tabs/ProductsTab';
import { CouponsTab } from './tabs/CouponsTab';
import { ReportsTab } from './tabs/ReportsTab';
import { AnnouncementsTab } from './tabs/AnnouncementsTab';
import { SupportTab } from './tabs/SupportTab';
import { SettingsTab } from './tabs/SettingsTab';
import { SecurityTab } from './tabs/SecurityTab';

export const AdminDashboard: React.FC = () => {
  const { setAdminToken, setCurrentView, settings } = useStore();

  const [activeTab, setActiveTab] = useState<string>('overview');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    setAdminToken(null);
    setCurrentView('home');
  };

  const navItems = [
    { id: 'overview', label: 'داشبورد و وضعیت', icon: LayoutDashboard },
    { id: 'orders', label: 'سفارش‌ها و پرداخت‌ها', icon: ShoppingBag },
    { id: 'products', label: 'مدیریت محصولات', icon: Package },
    { id: 'coupons', label: 'کدهای تخفیف', icon: Tag },
    { id: 'reports', label: 'گزارشات فروش', icon: BarChart3 },
    { id: 'announcements', label: 'اطلاعیه بالای سایت', icon: Megaphone },
    { id: 'support', label: 'پیام‌های پشتیبانی', icon: MessageSquare },
    { id: 'settings', label: 'تنظیمات فروشگاه', icon: Settings },
    { id: 'security', label: 'امنیت و ورود', icon: ShieldCheck },
  ];

  return (
    <div className="min-h-screen bg-[#faf7f2] flex flex-col">
      {/* Admin Topbar */}
      <header className="bg-[#291e17] text-white border-b border-[#45362c] sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl hover:bg-white/10 text-amber-200"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-white border border-[#45362c] overflow-hidden flex items-center justify-center p-0.5 shrink-0">
                <img
                  src={settings?.logo_url || '/uploads/peaconuts_icon.jpg'}
                  alt={settings?.store_name || 'پیکوناتس'}
                  className="w-full h-full object-contain rounded-md"
                  referrerPolicy="no-referrer"
                />
              </div>
              <span className="font-black text-base text-[#fef3c7] hidden sm:inline">
                پنل مدیریت {settings?.store_name || 'فروشگاه'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setCurrentView('home')}
              className="flex items-center gap-1.5 text-xs text-amber-200 hover:text-white bg-white/10 hover:bg-white/15 px-3 py-1.5 rounded-xl transition-colors cursor-pointer"
            >
              <Store className="w-3.5 h-3.5" />
              <span>مشاهده سایت</span>
            </button>

            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 text-xs text-red-300 hover:text-red-200 bg-red-950/40 hover:bg-red-950/70 border border-red-800/40 px-3 py-1.5 rounded-xl transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>خروج</span>
            </button>
          </div>
        </div>
      </header>

      {/* Admin Body */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col lg:flex-row gap-6">
        {/* Sidebar Nav */}
        <aside
          className={`lg:w-64 shrink-0 space-y-1 bg-white p-3 rounded-2xl border border-[#ebdccb] shadow-xs lg:block ${
            mobileMenuOpen ? 'block mb-4' : 'hidden'
          }`}
        >
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all text-right cursor-pointer ${
                  isActive
                    ? 'bg-[#78350f] text-white shadow-xs'
                    : 'text-[#57534e] hover:bg-[#faf7f2] hover:text-[#451a03]'
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-amber-300' : 'text-[#8c7e72]'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 min-w-0">
          {activeTab === 'overview' && <OverviewTab onNavigateTab={(t) => setActiveTab(t)} />}
          {activeTab === 'orders' && <OrdersTab />}
          {activeTab === 'products' && <ProductsTab />}
          {activeTab === 'coupons' && <CouponsTab />}
          {activeTab === 'reports' && <ReportsTab />}
          {activeTab === 'announcements' && <AnnouncementsTab />}
          {activeTab === 'support' && <SupportTab />}
          {activeTab === 'settings' && <SettingsTab />}
          {activeTab === 'security' && <SecurityTab />}
        </main>
      </div>
    </div>
  );
};
