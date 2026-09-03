import React, { useState, useEffect } from 'react';
import { useStore } from '../../../context/StoreContext';
import {
  Save,
  Store,
  CreditCard,
  Truck,
  Phone,
  MapPin,
  Send,
  Instagram,
  Sparkles,
  Info,
} from 'lucide-react';

export const SettingsTab: React.FC = () => {
  const { settings, adminToken, fetchSettings, showToast } = useStore();

  const [formData, setFormData] = useState<any>({
    store_name: '',
    hero_title: '',
    hero_subtitle: '',
    welcome_text: '',
    about_text: '',
    telegram_id: '',
    instagram_id: '',
    phone: '',
    address: '',
    card_number: '',
    card_holder: '',
    shipping_cost: 45000,
    currency: 'تومان',
  });

  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (settings) {
      setFormData({
        store_name: settings.store_name || '',
        hero_title: settings.hero_title || '',
        hero_subtitle: settings.hero_subtitle || '',
        welcome_text: settings.welcome_text || '',
        about_text: settings.about_text || '',
        telegram_id: settings.telegram_id || '',
        instagram_id: settings.instagram_id || '',
        phone: settings.phone || '',
        address: settings.address || '',
        card_number: settings.card_number || '',
        card_holder: settings.card_holder || '',
        shipping_cost: settings.shipping_cost ?? 45000,
        currency: settings.currency || 'تومان',
      });
    }
  }, [settings]);

  const handleChange = (field: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminToken) return;

    setIsSaving(true);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({
          ...formData,
          shipping_cost: Number(formData.shipping_cost) || 0,
        }),
      });

      if (res.ok) {
        showToast('تنظیمات فروشگاه با موفقیت ذخیره شد و به صورت آنی اعمال گردید.', 'success');
        await fetchSettings();
      } else {
        showToast('خطا در ذخیره تنظیمات', 'error');
      }
    } catch {
      showToast('خطا در برقراری ارتباط با سرور', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSave} className="space-y-6">
      {/* Top action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-[#ebdccb] shadow-xs">
        <div>
          <h2 className="font-black text-lg text-[#451a03]">تنظیمات عمومی و برندینگ فروشگاه</h2>
          <p className="text-xs text-[#78716c]">
            کلیه اطلاعات این بخش بلافاصله در صفحه اصلی، سبد خرید، فوتر و صفحه درباره ما بازتاب می‌یابد
          </p>
        </div>

        <button
          type="submit"
          disabled={isSaving}
          className="bg-[#78350f] hover:bg-[#b45309] text-white px-6 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 shadow-sm transition-all cursor-pointer disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          <span>{isSaving ? 'در حال ذخیره...' : 'ذخیره آنی تغییرات'}</span>
        </button>
      </div>

      {/* Brand & Hero Texts */}
      <div className="bg-white rounded-2xl border border-[#ebdccb] p-6 space-y-4 shadow-xs">
        <div className="flex items-center gap-2 text-[#78350f] font-bold text-sm border-b border-[#ebdccb] pb-3">
          <Store className="w-4 h-4 text-amber-600" />
          <span>هویت برند و متون صفحه اول (Hero)</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block font-bold text-[#451a03] mb-1">
              نام فروشگاه
            </label>
            <input
              type="text"
              value={formData.store_name}
              onChange={(e) => handleChange('store_name', e.target.value)}
              className="w-full px-3 py-2 text-sm bg-[#faf7f2] border border-[#d6cbbf] rounded-xl focus:outline-none focus:border-[#78350f]"
            />
          </div>

          <div>
            <label className="block font-bold text-[#451a03] mb-1">
              پیام کوتاه خوش‌آمدگویی
            </label>
            <input
              type="text"
              value={formData.welcome_text}
              onChange={(e) => handleChange('welcome_text', e.target.value)}
              className="w-full px-3 py-2 text-sm bg-[#faf7f2] border border-[#d6cbbf] rounded-xl focus:outline-none focus:border-[#78350f]"
            />
          </div>

          <div>
            <label className="block font-bold text-[#451a03] mb-1">
              تیتر اصلی بنر (Hero Title)
            </label>
            <input
              type="text"
              value={formData.hero_title}
              onChange={(e) => handleChange('hero_title', e.target.value)}
              className="w-full px-3 py-2 text-sm bg-[#faf7f2] border border-[#d6cbbf] rounded-xl focus:outline-none focus:border-[#78350f]"
            />
          </div>

          <div>
            <label className="block font-bold text-[#451a03] mb-1">
              زیرعنوان بنر (Hero Subtitle)
            </label>
            <input
              type="text"
              value={formData.hero_subtitle}
              onChange={(e) => handleChange('hero_subtitle', e.target.value)}
              className="w-full px-3 py-2 text-sm bg-[#faf7f2] border border-[#d6cbbf] rounded-xl focus:outline-none focus:border-[#78350f]"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-[#451a03] mb-1">
            متن صفحه درباره ما و توضیحات فوتر
          </label>
          <textarea
            rows={4}
            value={formData.about_text}
            onChange={(e) => handleChange('about_text', e.target.value)}
            className="w-full px-3 py-2 text-xs bg-[#faf7f2] border border-[#d6cbbf] rounded-xl focus:outline-none focus:border-[#78350f]"
          />
        </div>
      </div>

      {/* Bank Card & Payment Info */}
      <div className="bg-white rounded-2xl border border-[#ebdccb] p-6 space-y-4 shadow-xs">
        <div className="flex items-center gap-2 text-[#78350f] font-bold text-sm border-b border-[#ebdccb] pb-3">
          <CreditCard className="w-4 h-4 text-amber-600" />
          <span>اطلاعات حساب بانکی جهت پرداخت کارت به کارت</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block font-bold text-[#451a03] mb-1">
              شماره کارت بانکی (۱۶ رقمی)
            </label>
            <input
              type="text"
              dir="ltr"
              value={formData.card_number}
              onChange={(e) => handleChange('card_number', e.target.value)}
              placeholder="۶۰۳۷-۹۹۷۵-...."
              className="w-full px-3 py-2 text-sm bg-[#faf7f2] border border-[#d6cbbf] rounded-xl focus:outline-none focus:border-[#78350f] font-mono text-center"
            />
          </div>

          <div>
            <label className="block font-bold text-[#451a03] mb-1">
              نام و نام خانوادگی صاحب کارت
            </label>
            <input
              type="text"
              value={formData.card_holder}
              onChange={(e) => handleChange('card_holder', e.target.value)}
              className="w-full px-3 py-2 text-sm bg-[#faf7f2] border border-[#d6cbbf] rounded-xl focus:outline-none focus:border-[#78350f]"
            />
          </div>
        </div>
      </div>

      {/* Shipping & Currency */}
      <div className="bg-white rounded-2xl border border-[#ebdccb] p-6 space-y-4 shadow-xs">
        <div className="flex items-center gap-2 text-[#78350f] font-bold text-sm border-b border-[#ebdccb] pb-3">
          <Truck className="w-4 h-4 text-amber-600" />
          <span>تنظیمات ارسال و مالی</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block font-bold text-[#451a03] mb-1">
              هزینه پیش‌فرض ارسال با پست پیشتاز (تومان)
            </label>
            <input
              type="number"
              min="0"
              step="1000"
              value={formData.shipping_cost}
              onChange={(e) => handleChange('shipping_cost', e.target.value)}
              className="w-full px-3 py-2 text-sm bg-[#faf7f2] border border-[#d6cbbf] rounded-xl focus:outline-none focus:border-[#78350f]"
            />
            <span className="text-[10px] text-[#78716c]">
              (برای تحویل حضوری در کارگاه، هزینه همواره رایگان منظور می‌شود)
            </span>
          </div>

          <div>
            <label className="block font-bold text-[#451a03] mb-1">
              واحد پول فروشگاه
            </label>
            <input
              type="text"
              disabled
              value="تومان"
              className="w-full px-3 py-2 text-sm bg-stone-100 border border-[#d6cbbf] rounded-xl text-stone-600"
            />
          </div>
        </div>
      </div>

      {/* Contact & Social Handles */}
      <div className="bg-white rounded-2xl border border-[#ebdccb] p-6 space-y-4 shadow-xs">
        <div className="flex items-center gap-2 text-[#78350f] font-bold text-sm border-b border-[#ebdccb] pb-3">
          <Phone className="w-4 h-4 text-amber-600" />
          <span>راه‌های ارتباطی، آدرس کارگاه و شبکه‌های اجتماعی</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block font-bold text-[#451a03] mb-1">
              شماره تماس ثابت / همراه کارگاه
            </label>
            <input
              type="text"
              dir="ltr"
              value={formData.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              className="w-full px-3 py-2 text-sm bg-[#faf7f2] border border-[#d6cbbf] rounded-xl focus:outline-none focus:border-[#78350f] text-right"
            />
          </div>

          <div>
            <label className="block font-bold text-[#451a03] mb-1">
              آیدی کانال یا پشتیبانی تلگرام
            </label>
            <input
              type="text"
              dir="ltr"
              value={formData.telegram_id}
              onChange={(e) => handleChange('telegram_id', e.target.value)}
              placeholder="مثال: nutbutter_store"
              className="w-full px-3 py-2 text-sm bg-[#faf7f2] border border-[#d6cbbf] rounded-xl focus:outline-none focus:border-[#78350f] text-left"
            />
            <span className="text-[10px] text-[#78716c]">بدون علامت @ وارد شود</span>
          </div>

          <div>
            <label className="block font-bold text-[#451a03] mb-1">
              آیدی پیج اینستاگرام
            </label>
            <input
              type="text"
              dir="ltr"
              value={formData.instagram_id}
              onChange={(e) => handleChange('instagram_id', e.target.value)}
              placeholder="مثال: nutbutter_organic"
              className="w-full px-3 py-2 text-sm bg-[#faf7f2] border border-[#d6cbbf] rounded-xl focus:outline-none focus:border-[#78350f] text-left"
            />
            <span className="text-[10px] text-[#78716c]">بدون علامت @ وارد شود</span>
          </div>

          <div className="sm:col-span-2">
            <label className="block font-bold text-[#451a03] mb-1">
              آدرس دقیق کارگاه (جهت مراجعه مشتریان برای تحویل حضوری)
            </label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => handleChange('address', e.target.value)}
              className="w-full px-3 py-2 text-sm bg-[#faf7f2] border border-[#d6cbbf] rounded-xl focus:outline-none focus:border-[#78350f]"
            />
          </div>
        </div>
      </div>

      <div className="pt-2 flex justify-end">
        <button
          type="submit"
          disabled={isSaving}
          className="bg-[#78350f] hover:bg-[#b45309] text-white px-8 py-3 rounded-xl font-bold text-sm flex items-center gap-2 shadow-md transition-all cursor-pointer disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          <span>{isSaving ? 'در حال ذخیره...' : 'ذخیره تنظیمات'}</span>
        </button>
      </div>
    </form>
  );
};
