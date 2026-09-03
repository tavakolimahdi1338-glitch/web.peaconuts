import React, { useState, useMemo } from 'react';
import { useStore } from '../context/StoreContext';
import { ProductCard } from '../components/ProductCard';
import type { Product } from '../types';
import { Search, Filter, Sparkles, AlertCircle } from 'lucide-react';
import { toPersianDigits } from '../lib/formatters';

interface ShopPageProps {
  onSelectProduct: (product: Product) => void;
}

export const ShopPage: React.FC<ShopPageProps> = ({ onSelectProduct }) => {
  const { products } = useStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'discounted' | 'in_stock'>('all');

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      if (!p.active) return false;

      const matchesSearch =
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchesSearch) return false;

      if (filterType === 'in_stock') {
        return p.stock > 0;
      }

      if (filterType === 'discounted') {
        return (p.discount_300 > 0 || p.discount_500 > 0 || p.discount_1000 > 0);
      }

      return true;
    });
  }, [products, searchQuery, filterType]);

  return (
    <div className="space-y-8 pb-12">
      {/* Header Banner */}
      <div className="bg-[#f0e8dc] rounded-3xl p-6 sm:p-10 border border-[#dfd2c0] flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <span className="text-xs font-bold text-[#b45309] block">فروشگاه آنلاین</span>
          <h1 className="text-2xl sm:text-3xl font-black text-[#451a03] mt-1">
            محصولات تازه و کره‌های آجیلی خالص
          </h1>
          <p className="text-xs sm:text-sm text-[#78716c] mt-2 max-w-xl leading-relaxed">
            تمامی کره‌ها به صورت روزانه از مغزهای ممتاز آجیلی با دستگاه‌های پیشرفته بهداشتی و بدون هیچ‌گونه ماده نگهدارنده یا شکر افزوده تهیه می‌شوند.
          </p>
        </div>

        <div className="bg-white/80 backdrop-blur-xs px-4 py-3 rounded-2xl border border-[#d6cbbf] flex items-center gap-3 shrink-0">
          <Sparkles className="w-5 h-5 text-amber-600" />
          <div className="text-right">
            <span className="text-[11px] text-[#78716c] block">تعداد محصولات موجود:</span>
            <span className="text-base font-black text-[#451a03]">
              {toPersianDigits(filteredProducts.length)} محصول
            </span>
          </div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-3.5 rounded-2xl border border-[#ebdccb] shadow-xs">
        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-[#a8a29e] absolute right-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="جستجو بر اساس نام محصول..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pr-10 pl-4 py-2 text-sm bg-[#faf7f2] border border-[#e2d5c3] rounded-xl focus:outline-none focus:border-[#78350f] text-[#451a03]"
          />
        </div>

        {/* Filter Buttons */}
        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer shrink-0 ${
              filterType === 'all'
                ? 'bg-[#78350f] text-white shadow-xs'
                : 'bg-[#faf7f2] text-[#57534e] hover:bg-[#ebdccb]'
            }`}
          >
            همه محصولات
          </button>
          <button
            onClick={() => setFilterType('discounted')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer shrink-0 ${
              filterType === 'discounted'
                ? 'bg-[#78350f] text-white shadow-xs'
                : 'bg-[#faf7f2] text-[#57534e] hover:bg-[#ebdccb]'
            }`}
          >
            دارای تخفیف ویژه
          </button>
          <button
            onClick={() => setFilterType('in_stock')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer shrink-0 ${
              filterType === 'in_stock'
                ? 'bg-[#78350f] text-white shadow-xs'
                : 'bg-[#faf7f2] text-[#57534e] hover:bg-[#ebdccb]'
            }`}
          >
            فقط کالاهای موجود
          </button>
        </div>
      </div>

      {/* Products Grid */}
      {filteredProducts.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-[#ebdccb] space-y-4">
          <div className="w-16 h-16 rounded-full bg-amber-50 text-amber-700 flex items-center justify-center mx-auto">
            <AlertCircle className="w-8 h-8" />
          </div>
          <h3 className="font-bold text-lg text-[#451a03]">محصولی با این مشخصات یافت نشد</h3>
          <p className="text-xs text-[#78716c]">
            عبارت دیگری را جستجو کنید یا فیلترهای انتخابی را تغییر دهید.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setFilterType('all');
            }}
            className="bg-[#78350f] text-white px-5 py-2 rounded-xl text-xs font-bold hover:bg-[#b45309]"
          >
            مشاهده همه محصولات
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onSelect={onSelectProduct}
            />
          ))}
        </div>
      )}
    </div>
  );
};
