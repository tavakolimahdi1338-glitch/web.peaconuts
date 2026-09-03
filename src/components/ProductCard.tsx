import React from 'react';
import type { Product, ProductWeight } from '../types';
import { formatPrice, toPersianDigits } from '../lib/formatters';
import { ShoppingBag, Eye, Percent, CheckCircle, AlertCircle } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  onSelect: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onSelect }) => {
  // Find minimum active price and max discount
  const weights: ProductWeight[] = [300, 500, 1000];
  const activeWeights = weights.filter((w) => {
    const price = product[`price_${w}` as keyof Product] as number;
    return price && price > 0;
  });

  let minFinalPrice = Infinity;
  let maxDiscount = 0;

  activeWeights.forEach((w) => {
    const base = product[`price_${w}` as keyof Product] as number;
    const disc = (product[`discount_${w}` as keyof Product] as number) || 0;
    const finalPrice = Math.round(base * (1 - disc / 100));
    if (finalPrice < minFinalPrice) {
      minFinalPrice = finalPrice;
    }
    if (disc > maxDiscount) {
      maxDiscount = disc;
    }
  });

  const isOutOfStock = product.stock <= 0;

  return (
    <div
      id={`product-card-${product.id}`}
      className="group bg-[#fcfaf7] rounded-2xl border border-[#e8dfd5] hover:border-[#b45309]/40 shadow-sm hover:shadow-xl hover:shadow-amber-950/5 transition-all flex flex-col overflow-hidden"
    >
      {/* Image Container with Badges */}
      <div className="relative aspect-4/3 overflow-hidden bg-[#ebdccb]/30">
        <img
          src={product.image_url}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        {/* Discount Badge */}
        {maxDiscount > 0 && (
          <div className="absolute top-3 right-3 bg-red-600 text-white text-xs font-black px-2.5 py-1 rounded-full shadow-md flex items-center gap-1">
            <Percent className="w-3 h-3" />
            <span>تا {toPersianDigits(maxDiscount)}٪ تخفیف</span>
          </div>
        )}

        {/* Stock Status Badge */}
        <div className="absolute bottom-3 right-3">
          {isOutOfStock ? (
            <span className="bg-red-950/90 text-red-200 text-xs font-bold px-2.5 py-1 rounded-lg backdrop-blur-sm flex items-center gap-1">
              <AlertCircle className="w-3 h-3 text-red-400" />
              ناموجود
            </span>
          ) : (
            <span className="bg-emerald-950/80 text-emerald-200 text-xs font-semibold px-2.5 py-1 rounded-lg backdrop-blur-sm flex items-center gap-1">
              <CheckCircle className="w-3 h-3 text-emerald-400" />
              موجودی: {toPersianDigits(product.stock)} بسته
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3">
        <div>
          <h3 className="font-bold text-base sm:text-lg text-[#3b2416] group-hover:text-[#b45309] transition-colors line-clamp-1">
            {product.name}
          </h3>
          <p className="text-xs sm:text-sm text-[#78716c] line-clamp-2 mt-1 leading-relaxed">
            {product.description}
          </p>
        </div>

        {/* Available Weights chips */}
        <div className="flex flex-wrap gap-1.5 pt-1">
          {activeWeights.map((w) => (
            <span
              key={w}
              className="text-[11px] font-medium bg-[#f0e8dc] text-[#5c4636] px-2 py-0.5 rounded-md"
            >
              {toPersianDigits(w)} گرمی
            </span>
          ))}
        </div>

        {/* Price & CTA */}
        <div className="pt-3 border-t border-[#ede3d7] flex items-center justify-between gap-2">
          <div>
            <span className="text-[11px] text-[#8c7e72] block">شروع قیمت از:</span>
            <span className="text-base sm:text-lg font-black text-[#78350f]">
              {minFinalPrice !== Infinity ? formatPrice(minFinalPrice) : '-'}
              <span className="text-xs font-normal text-[#8c7e72] mr-1">تومان</span>
            </span>
          </div>

          <button
            onClick={() => onSelect(product)}
            disabled={isOutOfStock}
            className={`px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              isOutOfStock
                ? 'bg-stone-200 text-stone-400 cursor-not-allowed'
                : 'bg-[#78350f] hover:bg-[#b45309] text-white shadow-sm hover:shadow active:scale-95'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>{isOutOfStock ? 'اتمام موجودی' : 'مشاهده و خرید'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
