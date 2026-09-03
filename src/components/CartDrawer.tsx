import React from 'react';
import { useStore } from '../context/StoreContext';
import { formatPrice, toPersianDigits } from '../lib/formatters';
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowLeft } from 'lucide-react';
import type { Product } from '../types';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ isOpen, onClose }) => {
  const {
    cart,
    updateCartQuantity,
    removeFromCart,
    clearCart,
    getCartSubtotal,
    setCurrentView,
  } = useStore();

  if (!isOpen) return null;

  const subtotal = getCartSubtotal();

  const handleCheckout = () => {
    onClose();
    setCurrentView('checkout');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="absolute inset-0" onClick={onClose} />

      <div className="absolute inset-y-0 left-0 max-w-full flex pl-0 sm:pl-10">
        <div className="w-screen max-w-md bg-[#faf7f2] border-r border-[#e8dfd5] shadow-2xl flex flex-col justify-between">
          {/* Header */}
          <div className="p-5 border-b border-[#e8dfd5] flex items-center justify-between bg-white/70">
            <div className="flex items-center gap-2.5">
              <ShoppingBag className="w-5 h-5 text-[#d97706]" />
              <h2 className="font-black text-lg text-[#451a03]">سبد خرید شما</h2>
              <span className="text-xs bg-[#fef3c7] text-[#b45309] font-bold px-2 py-0.5 rounded-full">
                {toPersianDigits(cart.length)} آیتم
              </span>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-xl hover:bg-[#ebdccb] text-[#57534e] transition-colors cursor-pointer"
              aria-label="بستن سبد"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Items List */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
                <div className="w-20 h-20 rounded-3xl bg-[#ebdccb]/50 flex items-center justify-center text-4xl">
                  🛒
                </div>
                <h3 className="font-bold text-lg text-[#451a03]">سبد خرید شما خالی است</h3>
                <p className="text-xs text-[#78716c] leading-relaxed max-w-xs">
                  محصولات لذیذ و طبیعی ما را بررسی کنید و بسته‌های مورد علاقه خود را انتخاب نمایید.
                </p>
                <button
                  onClick={() => {
                    onClose();
                    setCurrentView('shop');
                  }}
                  className="bg-[#78350f] text-white px-5 py-2.5 rounded-xl text-xs font-bold hover:bg-[#b45309] shadow-sm transition-colors cursor-pointer"
                >
                  مشاهده همه محصولات
                </button>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between pb-2 border-b border-[#ebdccb]">
                  <span className="text-xs text-[#78716c] font-medium">لیست اقلام انتخابی:</span>
                  <button
                    onClick={clearCart}
                    className="text-xs text-red-600 hover:text-red-700 flex items-center gap-1 font-semibold cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    خالی کردن سبد
                  </button>
                </div>

                {cart.map((item) => {
                  const basePrice = item.product[`price_${item.weight}` as keyof Product] as number;
                  const discount = (item.product[`discount_${item.weight}` as keyof Product] as number) || 0;
                  const unitPrice = Math.round(basePrice * (1 - discount / 100));
                  const rowTotal = unitPrice * item.quantity;

                  return (
                    <div
                      key={`${item.product.id}-${item.weight}`}
                      className="p-3.5 rounded-2xl bg-white border border-[#e8dfd5] shadow-xs flex items-center gap-3.5"
                    >
                      <img
                        src={item.product.image_url}
                        alt={item.product.name}
                        className="w-16 h-16 rounded-xl object-cover shrink-0 bg-[#ebdccb]/30"
                      />

                      <div className="flex-1 min-w-0 space-y-1">
                        <h4 className="font-bold text-xs sm:text-sm text-[#451a03] truncate">
                          {item.product.name}
                        </h4>
                        <div className="flex items-center gap-2 text-xs text-[#78716c]">
                          <span className="bg-[#f0e8dc] px-2 py-0.5 rounded text-[11px] font-semibold text-[#5c4636]">
                            بسته {toPersianDigits(item.weight)} گرمی
                          </span>
                        </div>
                        <div className="text-xs font-bold text-[#78350f]">
                          {formatPrice(unitPrice)} تومان
                        </div>
                      </div>

                      {/* Quantity & Delete */}
                      <div className="flex flex-col items-end gap-2 shrink-0">
                        <button
                          onClick={() => removeFromCart(item.product.id, item.weight)}
                          className="text-[#a8a29e] hover:text-red-600 p-1 transition-colors cursor-pointer"
                          title="حذف"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>

                        <div className="flex items-center border border-[#d6cbbf] bg-[#faf7f2] rounded-lg overflow-hidden">
                          <button
                            onClick={() =>
                              updateCartQuantity(item.product.id, item.weight, item.quantity - 1)
                            }
                            className="p-1 hover:bg-[#ebdccb] text-[#451a03] cursor-pointer"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="px-2 text-xs font-black text-[#451a03]">
                            {toPersianDigits(item.quantity)}
                          </span>
                          <button
                            onClick={() =>
                              updateCartQuantity(item.product.id, item.weight, item.quantity + 1)
                            }
                            className="p-1 hover:bg-[#ebdccb] text-[#451a03] cursor-pointer"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </>
            )}
          </div>

          {/* Footer Subtotal & Action */}
          {cart.length > 0 && (
            <div className="p-5 border-t border-[#e8dfd5] bg-white/80 space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="font-bold text-[#57534e]">جمع کل موقت اقلام:</span>
                <span className="font-black text-lg text-[#78350f]">
                  {formatPrice(subtotal)} تومان
                </span>
              </div>

              <p className="text-[11px] text-[#78716c] leading-relaxed">
                هزینه ارسال و تخفیف‌ها در گام بعد محاسبه خواهند شد.
              </p>

              <button
                onClick={handleCheckout}
                className="w-full bg-[#d97706] hover:bg-[#b45309] text-white py-3.5 rounded-xl font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-700/20 transition-all active:scale-98 cursor-pointer"
              >
                <span>ادامه و تکمیل خرید</span>
                <ArrowLeft className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
