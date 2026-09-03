import React, { useState, useEffect } from 'react';
import type { Product, ProductWeight } from '../types';
import { useStore } from '../context/StoreContext';
import { formatPrice, toPersianDigits } from '../lib/formatters';
import { X, ShoppingBag, Plus, Minus, Check, AlertCircle, ShieldCheck, Truck } from 'lucide-react';

interface ProductModalProps {
  product: Product | null;
  onClose: () => void;
}

export const ProductModal: React.FC<ProductModalProps> = ({ product, onClose }) => {
  const { addToCart } = useStore();

  const [selectedWeight, setSelectedWeight] = useState<ProductWeight>(300);
  const [quantity, setQuantity] = useState<number>(1);

  // Available weights (price > 0)
  const weights: ProductWeight[] = [300, 500, 1000];
  const activeWeights = product
    ? weights.filter((w) => {
        const p = product[`price_${w}` as keyof Product] as number;
        return p && p > 0;
      })
    : [];

  useEffect(() => {
    if (activeWeights.length > 0 && !activeWeights.includes(selectedWeight)) {
      setSelectedWeight(activeWeights[0]);
    }
    setQuantity(1);
  }, [product]);

  if (!product) return null;

  const isOutOfStock = product.stock <= 0;

  // Selected weight calculations
  const basePrice = (product[`price_${selectedWeight}` as keyof Product] as number) || 0;
  const discountPercent = (product[`discount_${selectedWeight}` as keyof Product] as number) || 0;
  const unitPrice = Math.round(basePrice * (1 - discountPercent / 100));
  const subtotal = unitPrice * quantity;

  const handleAdd = () => {
    if (isOutOfStock) return;
    addToCart(product, selectedWeight, quantity);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="bg-[#faf7f2] rounded-3xl max-w-2xl w-full max-h-[92vh] overflow-y-auto border border-[#e8dfd5] shadow-2xl relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 left-4 z-10 w-9 h-9 rounded-full bg-white/80 hover:bg-white text-[#451a03] flex items-center justify-center shadow-md transition-all cursor-pointer"
          aria-label="بستن"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-6 sm:p-8 space-y-6">
          {/* Header Image & Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-start">
            <div className="rounded-2xl overflow-hidden aspect-4/3 sm:aspect-square bg-[#ebdccb]/30 shadow-md">
              <img
                src={product.image_url}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="space-y-3">
              <span className="text-xs font-bold text-[#b45309] bg-[#fef3c7] px-3 py-1 rounded-lg inline-block">
                تولید روزانه و ۱۰۰٪ طبیعی
              </span>

              <h2 className="text-xl sm:text-2xl font-black text-[#451a03] leading-snug">
                {product.name}
              </h2>

              <p className="text-sm text-[#78716c] leading-relaxed">
                {product.description}
              </p>

              <div className="flex items-center gap-2 pt-2 text-xs text-[#57534e]">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>موجودی کلی انبار:</span>
                {isOutOfStock ? (
                  <span className="text-red-600 font-bold">ناموجود</span>
                ) : (
                  <span className="text-emerald-700 font-bold">
                    {toPersianDigits(product.stock)} بسته موجود در کارگاه
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Active Weights List (Strict format required) */}
          <div className="bg-[#f2ece2] p-4 sm:p-5 rounded-2xl border border-[#e2d5c3] space-y-3">
            <h3 className="text-sm font-bold text-[#451a03] flex items-center gap-1.5">
              <Check className="w-4 h-4 text-[#d97706]" />
              لیست و تعرفه وزن‌های ارائه شده:
            </h3>

            <div className="space-y-2">
              {activeWeights.map((w) => {
                const bPrice = product[`price_${w}` as keyof Product] as number;
                const dPercent = (product[`discount_${w}` as keyof Product] as number) || 0;
                const fPrice = Math.round(bPrice * (1 - dPercent / 100));
                const isSelected = selectedWeight === w;

                return (
                  <button
                    key={w}
                    type="button"
                    onClick={() => setSelectedWeight(w)}
                    className={`w-full p-3 rounded-xl border text-right transition-all flex items-center justify-between cursor-pointer ${
                      isSelected
                        ? 'bg-[#78350f] text-white border-[#78350f] shadow-md'
                        : 'bg-white text-[#451a03] border-[#e2d5c3] hover:border-[#b45309]'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                          isSelected ? 'border-amber-400 bg-amber-400' : 'border-[#a8a29e]'
                        }`}
                      >
                        {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-[#78350f]" />}
                      </div>
                      <span className="font-bold text-sm">
                        {toPersianDigits(w)} گرمی
                      </span>
                    </div>

                    {/* Format according to prompt:
                        ۳۰۰ گرمی ← ۵۰۰,۰۰۰ تومان
                        یا
                        ۳۰۰ گرمی ← قیمت قبلی خط‌خورده  ٪۲۰  = قیمت نهایی
                    */}
                    <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold">
                      <span>←</span>
                      {dPercent > 0 ? (
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`line-through ${
                              isSelected ? 'text-stone-300' : 'text-stone-400'
                            }`}
                          >
                            {formatPrice(bPrice)}
                          </span>
                          <span
                            className={`px-1.5 py-0.5 rounded text-[11px] font-black ${
                              isSelected
                                ? 'bg-red-500 text-white'
                                : 'bg-red-100 text-red-700'
                            }`}
                          >
                            ٪{toPersianDigits(dPercent)}
                          </span>
                          <span>=</span>
                          <span
                            className={`font-black ${
                              isSelected ? 'text-amber-300 text-base' : 'text-[#78350f] text-base'
                            }`}
                          >
                            {formatPrice(fPrice)} تومان
                          </span>
                        </div>
                      ) : (
                        <span
                          className={`font-black ${
                            isSelected ? 'text-amber-300 text-base' : 'text-[#78350f] text-base'
                          }`}
                        >
                          {formatPrice(fPrice)} تومان
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quantity and Final Subtotal Action */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-[#e8dfd5]">
            {/* Quantity Selector */}
            <div className="flex items-center gap-3">
              <span className="text-xs sm:text-sm font-bold text-[#57534e]">تعداد:</span>
              <div className="flex items-center border border-[#d6cbbf] bg-white rounded-xl overflow-hidden shadow-sm">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  disabled={quantity <= 1 || isOutOfStock}
                  className="p-2.5 hover:bg-[#faf7f2] text-[#451a03] disabled:opacity-30 cursor-pointer"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="px-4 text-base font-black text-[#451a03]">
                  {toPersianDigits(quantity)}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                  disabled={quantity >= product.stock || isOutOfStock}
                  className="p-2.5 hover:bg-[#faf7f2] text-[#451a03] disabled:opacity-30 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Total Price & Add to Cart */}
            <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
              <div className="text-left">
                <span className="text-[11px] text-[#78716c] block text-right">جمع این آیتم:</span>
                <span className="text-lg font-black text-[#78350f]">
                  {formatPrice(subtotal)}
                  <span className="text-xs text-[#78716c] font-normal mr-1">تومان</span>
                </span>
              </div>

              <button
                type="button"
                onClick={handleAdd}
                disabled={isOutOfStock}
                className={`px-6 py-3 rounded-2xl font-black text-sm flex items-center gap-2 shadow-lg transition-all cursor-pointer ${
                  isOutOfStock
                    ? 'bg-stone-300 text-stone-500 cursor-not-allowed'
                    : 'bg-[#d97706] hover:bg-[#b45309] text-white shadow-amber-600/30 active:scale-95'
                }`}
              >
                <ShoppingBag className="w-5 h-5" />
                <span>{isOutOfStock ? 'عدم موجودی' : 'افزودن به سبد خرید'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
