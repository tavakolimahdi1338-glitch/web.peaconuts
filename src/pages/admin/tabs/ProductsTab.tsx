import React, { useState, useRef } from 'react';
import { useStore } from '../../../context/StoreContext';
import { formatPrice, toPersianDigits } from '../../../lib/formatters';
import type { Product } from '../../../types';
import {
  Plus,
  Edit2,
  Trash2,
  Check,
  X,
  AlertCircle,
  Package,
  Percent,
  CheckCircle,
  Eye,
  EyeOff,
  UploadCloud,
  Image as ImageIcon,
  ImagePlus,
  RefreshCw,
  Loader2,
} from 'lucide-react';

export const ProductsTab: React.FC = () => {
  const { products, adminToken, fetchProducts, showToast } = useStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [stock, setStock] = useState<number>(20);
  const [active, setActive] = useState(true);

  // Image upload state
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [showUrlFallback, setShowUrlFallback] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 300g
  const [price300, setPrice300] = useState<number>(0);
  const [discount300, setDiscount300] = useState<number>(0);

  // 500g
  const [price500, setPrice500] = useState<number>(0);
  const [discount500, setDiscount500] = useState<number>(0);

  // 1000g
  const [price1000, setPrice1000] = useState<number>(0);
  const [discount1000, setDiscount1000] = useState<number>(0);

  const openAddModal = () => {
    setEditingProduct(null);
    setName('');
    setDescription('');
    setImageUrl('https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?auto=format&fit=crop&q=80&w=800');
    setStock(20);
    setActive(true);
    setPrice300(250000);
    setDiscount300(0);
    setPrice500(390000);
    setDiscount500(0);
    setPrice1000(720000);
    setDiscount1000(0);
    setShowUrlFallback(false);
    setIsModalOpen(true);
  };

  const openEditModal = (p: Product) => {
    setEditingProduct(p);
    setName(p.name);
    setDescription(p.description);
    setImageUrl(p.image_url);
    setStock(p.stock);
    setActive(p.active);
    setPrice300(p.price_300 || 0);
    setDiscount300(p.discount_300 || 0);
    setPrice500(p.price_500 || 0);
    setDiscount500(p.discount_500 || 0);
    setPrice1000(p.price_1000 || 0);
    setDiscount1000(p.discount_1000 || 0);
    setShowUrlFallback(false);
    setIsModalOpen(true);
  };

  // Direct Image File Upload Handler
  const handleFileUpload = async (file: File) => {
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('لطفاً یک فایل تصویری (JPG, PNG, WebP) انتخاب کنید.', 'error');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showToast('حجم فایل انتخابی نباید بیشتر از ۵ مگابایت باشد.', 'error');
      return;
    }

    setIsUploadingImage(true);

    try {
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const base64Data = reader.result as string;
          const res = await fetch('/api/upload', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              base64: base64Data,
              filename: file.name,
              mimeType: file.type,
            }),
          });

          const data = await res.json();
          if (res.ok && data.url) {
            setImageUrl(data.url);
            showToast('تصویر محصول با موفقیت آپلود و تنظیم شد.', 'success');
          } else {
            showToast(data.error || 'خطا در بارگذاری تصویر روی سرور', 'error');
          }
        } catch {
          showToast('خطا در ارسال تصویر به سرور', 'error');
        } finally {
          setIsUploadingImage(false);
        }
      };

      reader.onerror = () => {
        showToast('خطا در خواندن فایل تصویری', 'error');
        setIsUploadingImage(false);
      };

      reader.readAsDataURL(file);
    } catch {
      showToast('خطا در پردازش فایل', 'error');
      setIsUploadingImage(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      showToast('نام محصول را وارد کنید.', 'error');
      return;
    }

    if (isUploadingImage) {
      showToast('لطفاً تا اتمام بارگذاری کامل تصویر صبور باشید.', 'error');
      return;
    }

    const token = adminToken || localStorage.getItem('nut_store_admin_token') || '';
    if (!token) {
      showToast('توکن مدیریت یافت نشد. لطفاً مجدداً وارد پنل شوید.', 'error');
      return;
    }

    setIsSubmitting(true);
    const payload = {
      name: name.trim(),
      description: description.trim(),
      image_url: imageUrl.trim() || 'https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?auto=format&fit=crop&q=80&w=800',
      stock: Number(stock) || 0,
      active,
      price_300: Number(price300) || 0,
      discount_300: Number(discount300) || 0,
      price_500: Number(price500) || 0,
      discount_500: Number(discount500) || 0,
      price_1000: Number(price1000) || 0,
      discount_1000: Number(discount1000) || 0,
    };

    try {
      const url = editingProduct
        ? `/api/admin/products/${editingProduct.id}`
        : '/api/admin/products';
      const method = editingProduct ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        showToast(data.error || 'خطا در ذخیره محصول', 'error');
      } else {
        showToast(
          editingProduct ? 'محصول با موفقیت ویرایش شد.' : 'محصول جدید اضافه گردید.',
          'success'
        );
        setIsModalOpen(false);
        await fetchProducts();
      }
    } catch {
      showToast('خطا در برقراری ارتباط با سرور', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteProduct = async (id: string, prodName: string) => {
    if (!window.confirm(`آیا از حذف دائم محصول «${prodName}» اطمینان دارید؟`)) {
      return;
    }

    const token = adminToken || localStorage.getItem('nut_store_admin_token') || '';
    try {
      const res = await fetch(`/api/admin/products/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      if (!res.ok) {
        showToast(data.error || 'خطا در حذف محصول', 'error');
      } else {
        showToast('محصول با موفقیت حذف شد.', 'success');
        await fetchProducts();
      }
    } catch {
      showToast('خطا در حذف محصول', 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top action bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-[#ebdccb]">
        <div>
          <h2 className="font-black text-lg text-[#451a03]">مدیریت محصولات کارگاه</h2>
          <p className="text-xs text-[#78716c]">
            تعریف وزن‌ها، قیمت‌گذاری مستقل، تخفیف‌های درصدی و کنترل موجودی انبار
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="bg-[#78350f] hover:bg-[#b45309] text-white px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 shadow-sm transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>افزودن محصول جدید</span>
        </button>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-2xl border border-[#ebdccb] overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-right">
            <thead>
              <tr className="bg-[#faf7f2] border-b border-[#ebdccb] text-[#78716c]">
                <th className="py-3.5 px-4 font-bold">تصویر و نام محصول</th>
                <th className="py-3.5 px-4 font-bold">قیمت و تخفیف وزن‌ها</th>
                <th className="py-3.5 px-4 font-bold">موجودی انبار</th>
                <th className="py-3.5 px-4 font-bold">وضعیت نمایش</th>
                <th className="py-3.5 px-4 font-bold text-left">عملیات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#faf7f2]">
              {products.map((p) => (
                <tr key={p.id} className="hover:bg-[#fcfaf7]">
                  {/* Photo & Name */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={p.image_url}
                        alt={p.name}
                        className="w-12 h-12 rounded-xl object-cover border border-[#ebdccb] bg-[#ebdccb]/20"
                      />
                      <div>
                        <span className="font-bold text-sm text-[#451a03] block">
                          {p.name}
                        </span>
                        <span className="text-[11px] text-[#78716c] line-clamp-1 max-w-xs">
                          {p.description}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Weights & Prices */}
                  <td className="py-3.5 px-4">
                    <div className="space-y-1">
                      {p.price_300 > 0 && (
                        <div className="text-[11px] text-[#57534e]">
                          ۳۰۰ گرم: {formatPrice(p.price_300)} ت
                          {p.discount_300 > 0 && (
                            <span className="text-red-600 font-bold mr-1">
                              (٪{toPersianDigits(p.discount_300)} تخفیف)
                            </span>
                          )}
                        </div>
                      )}
                      {p.price_500 > 0 && (
                        <div className="text-[11px] text-[#57534e]">
                          ۵۰۰ گرم: {formatPrice(p.price_500)} ت
                          {p.discount_500 > 0 && (
                            <span className="text-red-600 font-bold mr-1">
                              (٪{toPersianDigits(p.discount_500)} تخفیف)
                            </span>
                          )}
                        </div>
                      )}
                      {p.price_1000 > 0 && (
                        <div className="text-[11px] text-[#57534e]">
                          ۱۰۰۰ گرم: {formatPrice(p.price_1000)} ت
                          {p.discount_1000 > 0 && (
                            <span className="text-red-600 font-bold mr-1">
                              (٪{toPersianDigits(p.discount_1000)} تخفیف)
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </td>

                  {/* Stock */}
                  <td className="py-3.5 px-4">
                    <span
                      className={`font-black px-2 py-0.5 rounded text-xs ${
                        p.stock <= 0
                          ? 'bg-red-100 text-red-700'
                          : p.stock < 5
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {toPersianDigits(p.stock)} بسته
                    </span>
                  </td>

                  {/* Status */}
                  <td className="py-3.5 px-4">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold inline-flex items-center gap-1 ${
                        p.active
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-stone-100 text-stone-600 border border-stone-200'
                      }`}
                    >
                      {p.active ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                      {p.active ? 'فعال در سایت' : 'مخفی / غیرفعال'}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="py-3.5 px-4 text-left">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => openEditModal(p)}
                        className="p-1.5 rounded-lg bg-[#faf7f2] hover:bg-[#ebdccb] text-[#451a03] transition-colors cursor-pointer"
                        title="ویرایش محصول"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(p.id, p.name)}
                        className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 transition-colors cursor-pointer"
                        title="حذف محصول"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div
            className="bg-white rounded-3xl max-w-2xl w-full max-h-[92vh] overflow-y-auto border border-[#ebdccb] shadow-2xl p-6 sm:p-8 space-y-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-[#ebdccb] pb-3">
              <h3 className="font-black text-lg text-[#451a03]">
                {editingProduct ? 'ویرایش اطلاعات محصول' : 'افزودن محصول جدید'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg hover:bg-[#ebdccb] text-[#57534e]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#451a03] mb-1">
                    نام محصول <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="مثال: کره فندق خالص و طبیعی"
                    className="w-full px-3 py-2 text-sm bg-[#faf7f2] border border-[#d6cbbf] rounded-xl focus:outline-none focus:border-[#78350f]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#451a03] mb-1">
                    موجودی کل انبار (بسته) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={stock}
                    onChange={(e) => setStock(Number(e.target.value))}
                    className="w-full px-3 py-2 text-sm bg-[#faf7f2] border border-[#d6cbbf] rounded-xl focus:outline-none focus:border-[#78350f]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#451a03] mb-1">
                  توضیحات معرفی محصول
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="ویژگی‌ها، بافت، ترکیبات و نحوه مصرف..."
                  className="w-full px-3 py-2 text-sm bg-[#faf7f2] border border-[#d6cbbf] rounded-xl focus:outline-none focus:border-[#78350f]"
                />
              </div>

              {/* Direct Product Image Upload Component */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-[#451a03]">
                    تصویر محصول <span className="text-red-500">*</span>
                  </label>
                  <span className="text-[11px] text-[#78716c]">
                    آپلود مستقیم از کامپیوتر یا گوشی
                  </span>
                </div>

                {/* Hidden File Input */}
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleFileUpload(e.target.files[0]);
                    }
                  }}
                  className="hidden"
                />

                {/* Preview if image exists */}
                {imageUrl && !isUploadingImage && (
                  <div className="flex flex-col sm:flex-row items-center gap-4 p-3.5 bg-[#faf7f2] border border-[#ebdccb] rounded-2xl">
                    <img
                      src={imageUrl}
                      alt={name || 'پیش‌نمایش تصویر محصول'}
                      className="w-24 h-24 object-cover rounded-xl border border-[#d6cbbf] shadow-xs bg-white shrink-0"
                    />
                    <div className="flex-1 text-right space-y-1.5 w-full">
                      <div className="flex items-center gap-1.5 text-emerald-700 text-xs font-bold">
                        <CheckCircle className="w-4 h-4" />
                        <span>تصویر با موفقیت بارگذاری شد</span>
                      </div>
                      <p className="text-[11px] text-[#78716c] truncate dir-ltr text-right max-w-xs">
                        {imageUrl}
                      </p>
                      <div className="flex items-center gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="px-3 py-1.5 text-xs font-bold bg-[#78350f] text-white hover:bg-[#b45309] rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          <UploadCloud className="w-3.5 h-3.5" />
                          <span>تغییر تصویر (آپلود جدید)</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setImageUrl('')}
                          className="px-3 py-1.5 text-xs font-bold text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                        >
                          حذف
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Drag and Drop Upload Area */}
                {(!imageUrl || isUploadingImage) && (
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => !isUploadingImage && fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2 ${
                      isDragging
                        ? 'border-[#78350f] bg-amber-50/70 scale-[1.01]'
                        : 'border-[#d6cbbf] bg-[#faf7f2] hover:bg-amber-50/40 hover:border-[#78350f]'
                    }`}
                  >
                    {isUploadingImage ? (
                      <div className="py-4 flex flex-col items-center gap-2 text-[#78350f]">
                        <Loader2 className="w-8 h-8 animate-spin text-amber-600" />
                        <span className="text-xs font-bold">در حال پردازش و آپلود تصویر روی سرور...</span>
                        <span className="text-[11px] text-[#78716c]">لطفاً چند لحظه صبر کنید</span>
                      </div>
                    ) : (
                      <>
                        <div className="w-12 h-12 rounded-2xl bg-amber-100/80 text-[#78350f] flex items-center justify-center shadow-xs">
                          <UploadCloud className="w-6 h-6" />
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs font-bold text-[#451a03]">
                            برای آپلود تصویر محصول کلیک کنید یا عکس را اینجا رها نمایید
                          </p>
                          <p className="text-[11px] text-[#78716c]">
                            فرمت‌های مجاز: JPG ،PNG ،WebP (حداکثر ۵ مگابایت)
                          </p>
                        </div>
                        <button
                          type="button"
                          className="mt-1 px-4 py-1.5 text-xs font-bold text-[#78350f] bg-white border border-[#d6cbbf] rounded-xl shadow-2xs hover:bg-[#faf7f2]"
                        >
                          انتخاب تصویر از دستگاه
                        </button>
                      </>
                    )}
                  </div>
                )}

                {/* Optional URL Toggle */}
                <div className="pt-1">
                  <button
                    type="button"
                    onClick={() => setShowUrlFallback(!showUrlFallback)}
                    className="text-[11px] text-[#78716c] hover:text-[#78350f] underline decoration-dotted cursor-pointer"
                  >
                    {showUrlFallback
                      ? 'بستن ورودی لینک دستی'
                      : 'نیاز به درج آدرس اینترنتی (URL) به جای آپلود فایل دارید؟'}
                  </button>
                  {showUrlFallback && (
                    <div className="mt-2 animate-in fade-in duration-150">
                      <input
                        type="url"
                        value={imageUrl}
                        onChange={(e) => setImageUrl(e.target.value)}
                        dir="ltr"
                        placeholder="https://example.com/photo.jpg"
                        className="w-full px-3 py-1.5 text-xs bg-[#faf7f2] border border-[#d6cbbf] rounded-xl focus:outline-none focus:border-[#78350f] text-left"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Weight Pricing & Discounts Accordion / Sections */}
              <div className="bg-[#faf7f2] p-4 rounded-2xl border border-[#ebdccb] space-y-3">
                <h4 className="font-bold text-xs text-[#78350f]">
                  تعیین قیمت و درصد تخفیف به ازای وزن‌های عرضه شده:
                </h4>

                {/* 300g */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-white rounded-xl border border-[#ebdccb]">
                  <div>
                    <label className="block text-[11px] font-bold text-[#451a03] mb-1">
                      قیمت بسته ۳۰۰ گرمی (تومان)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="1000"
                      value={price300}
                      onChange={(e) => setPrice300(Number(e.target.value))}
                      className="w-full px-3 py-1.5 text-xs bg-[#faf7f2] border border-[#d6cbbf] rounded-lg focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-[#451a03] mb-1">
                      درصد تخفیف ۳۰۰ گرمی (٪)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={discount300}
                      onChange={(e) => setDiscount300(Number(e.target.value))}
                      className="w-full px-3 py-1.5 text-xs bg-[#faf7f2] border border-[#d6cbbf] rounded-lg focus:outline-none"
                    />
                  </div>
                </div>

                {/* 500g */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-white rounded-xl border border-[#ebdccb]">
                  <div>
                    <label className="block text-[11px] font-bold text-[#451a03] mb-1">
                      قیمت بسته ۵۰۰ گرمی (تومان)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="1000"
                      value={price500}
                      onChange={(e) => setPrice500(Number(e.target.value))}
                      className="w-full px-3 py-1.5 text-xs bg-[#faf7f2] border border-[#d6cbbf] rounded-lg focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-[#451a03] mb-1">
                      درصد تخفیف ۵۰۰ گرمی (٪)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={discount500}
                      onChange={(e) => setDiscount500(Number(e.target.value))}
                      className="w-full px-3 py-1.5 text-xs bg-[#faf7f2] border border-[#d6cbbf] rounded-lg focus:outline-none"
                    />
                  </div>
                </div>

                {/* 1000g */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-white rounded-xl border border-[#ebdccb]">
                  <div>
                    <label className="block text-[11px] font-bold text-[#451a03] mb-1">
                      قیمت بسته ۱۰۰۰ گرمی (تومان)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="1000"
                      value={price1000}
                      onChange={(e) => setPrice1000(Number(e.target.value))}
                      className="w-full px-3 py-1.5 text-xs bg-[#faf7f2] border border-[#d6cbbf] rounded-lg focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-[#451a03] mb-1">
                      درصد تخفیف ۱۰۰۰ گرمی (٪)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={discount1000}
                      onChange={(e) => setDiscount1000(Number(e.target.value))}
                      className="w-full px-3 py-1.5 text-xs bg-[#faf7f2] border border-[#d6cbbf] rounded-lg focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Status active checkbox */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="product-active"
                  checked={active}
                  onChange={(e) => setActive(e.target.checked)}
                  className="w-4 h-4 rounded text-[#78350f] accent-[#78350f]"
                />
                <label htmlFor="product-active" className="text-xs font-bold text-[#451a03]">
                  این محصول در سایت برای مشتریان فعال و قابل سفارش باشد
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#ebdccb]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-[#78716c] hover:bg-[#faf7f2] rounded-xl cursor-pointer"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-[#78350f] hover:bg-[#b45309] text-white px-6 py-2.5 rounded-xl font-bold text-xs shadow-md transition-all cursor-pointer"
                >
                  {isSubmitting ? 'در حال ذخیره...' : 'ذخیره محصول'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
