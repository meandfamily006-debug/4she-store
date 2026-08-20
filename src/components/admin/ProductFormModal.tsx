import React, { useState } from 'react';
import { X, Sparkles, Check } from 'lucide-react';
import { Product, Category } from '../../types';

interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingProduct: Product | null;
  categories: Category[];
  onSaveSuccess: () => void;
}

export const ProductFormModal: React.FC<ProductFormModalProps> = ({
  isOpen,
  onClose,
  editingProduct,
  categories,
  onSaveSuccess
}) => {
  const [name, setName] = useState(editingProduct?.name || '');
  const [category, setCategory] = useState(editingProduct?.category || categories[0]?.name || 'فساتين');
  const [price, setPrice] = useState<number>(editingProduct?.price || 35000);
  const [originalPrice, setOriginalPrice] = useState<number>(editingProduct?.originalPrice || 45000);
  const [stock, setStock] = useState<number>(editingProduct?.stock ?? 10);
  const [sizes, setSizes] = useState(editingProduct?.sizes.join(', ') || 'S, M, L, XL');
  const [colors, setColors] = useState(
    editingProduct?.colors.map(c => `${c.name}:${c.hex}`).join(', ') || 'أسود:#111111, وردي:#f472b6, خمري:#5a1e35'
  );
  const [images, setImages] = useState(
    editingProduct?.images.join(', ') || 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800'
  );
  const [description, setDescription] = useState(
    editingProduct?.description || 'فستان نسائي أنيق بتصميم عصري وخامة عالية الجودة متوفر لدى أزياء 4sHe بالموصل.'
  );
  const [isNew, setIsNew] = useState(editingProduct?.isNew ?? true);
  const [isOnSale, setIsOnSale] = useState(editingProduct?.isOnSale ?? false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg('يرجى إدخال اسم المنتج.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    const sizesArr = sizes.split(',').map(s => s.trim()).filter(Boolean);
    const colorsArr = colors
      .split(',')
      .map(c => {
        const [cName, cHex] = c.split(':').map(x => x.trim());
        return { name: cName || 'لون', hex: cHex || '#333333' };
      })
      .filter(Boolean);

    const imagesArr = images.split(',').map(i => i.trim()).filter(Boolean);

    const payload = {
      name: name.trim(),
      category,
      price: Number(price),
      originalPrice: Number(originalPrice),
      stock: Number(stock),
      sizes: sizesArr.length > 0 ? sizesArr : ['Standard'],
      colors: colorsArr.length > 0 ? colorsArr : [{ name: 'افتراضي', hex: '#222222' }],
      images: imagesArr.length > 0 ? imagesArr : ['https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800'],
      description: description.trim(),
      details: ['خامة تركية فاخرة', 'تطريز وقصة انسيابية مريحة', 'متوفر لدى فرع أسواق المثنى بالموصل'],
      isNew,
      isOnSale
    };

    try {
      const url = editingProduct ? `/api/products/${editingProduct.id}` : '/api/products';
      const method = editingProduct ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        throw new Error('فشل حفظ بيانات المنتج.');
      }

      onSaveSuccess();
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'حدث خطأ أثناء حفظ المنتج.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl p-6 sm:p-8 border border-[#E8E1DA] my-auto max-h-[92vh] overflow-y-auto text-right">
        <div className="flex items-center justify-between pb-4 border-b border-[#E8E1DA]">
          <h3 className="text-base font-bold text-[#2D2621]">
            {editingProduct ? 'تعديل بيانات الموديل' : 'إضافة قطعة أزياء جديدة للمتجر'}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full text-[#8C7D73] hover:text-[#2D2621] hover:bg-[#FAF8F5] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="my-3 p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#5C5046]">اسم القطعة / الفستان</label>
            <input
              type="text"
              required
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full py-2.5 px-3.5 text-xs bg-[#FAF8F5] border border-[#E8E1DA] rounded-xl focus:outline-none focus:border-[#4A3F35] text-[#2D2621]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#5C5046]">القسم / التصنيف</label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value)}
                className="w-full py-2.5 px-3 text-xs bg-[#FAF8F5] border border-[#E8E1DA] rounded-xl focus:outline-none text-[#2D2621]"
              >
                {categories.map(c => (
                  <option key={c.id} value={c.name}>{c.name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#5C5046]">السعر (IQD)</label>
              <input
                type="number"
                required
                value={price}
                onChange={e => setPrice(Number(e.target.value))}
                className="w-full py-2.5 px-3 text-xs bg-[#FAF8F5] border border-[#E8E1DA] rounded-xl focus:outline-none text-[#2D2621]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#5C5046]">السعر قبل الخصم (IQD)</label>
              <input
                type="number"
                value={originalPrice}
                onChange={e => setOriginalPrice(Number(e.target.value))}
                className="w-full py-2.5 px-3 text-xs bg-[#FAF8F5] border border-[#E8E1DA] rounded-xl focus:outline-none text-[#2D2621]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#5C5046]">رصيد المخزن المتاح (قطع)</label>
              <input
                type="number"
                required
                value={stock}
                onChange={e => setStock(Number(e.target.value))}
                className="w-full py-2.5 px-3.5 text-xs bg-[#FAF8F5] border border-[#E8E1DA] rounded-xl focus:outline-none text-[#2D2621]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#5C5046]">المقاسات (مفصولة بفاصلة)</label>
              <input
                type="text"
                value={sizes}
                onChange={e => setSizes(e.target.value)}
                placeholder="S, M, L, XL, 38, 40"
                className="w-full py-2.5 px-3.5 text-xs bg-[#FAF8F5] border border-[#E8E1DA] rounded-xl focus:outline-none text-[#2D2621]"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#5C5046]">الألوان (الاسم:كود اللون، مفصولة بفاصلة)</label>
            <input
              type="text"
              value={colors}
              onChange={e => setColors(e.target.value)}
              placeholder="أسود:#111111, كحلي:#0f172a, أحمر:#b91c1c"
              className="w-full py-2.5 px-3.5 text-xs bg-[#FAF8F5] border border-[#E8E1DA] rounded-xl focus:outline-none text-[#2D2621] font-mono text-left dir-ltr"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#5C5046]">روابط الصور المباشرة (مفصولة بفاصلة)</label>
            <input
              type="text"
              required
              value={images}
              onChange={e => setImages(e.target.value)}
              className="w-full py-2.5 px-3.5 text-xs bg-[#FAF8F5] border border-[#E8E1DA] rounded-xl focus:outline-none text-[#2D2621] font-mono text-left dir-ltr"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#5C5046]">وصف ومميزات القطعة</label>
            <textarea
              rows={3}
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full py-2.5 px-3.5 text-xs bg-[#FAF8F5] border border-[#E8E1DA] rounded-xl focus:outline-none text-[#2D2621] resize-none"
            />
          </div>

          <div className="flex items-center gap-6 pt-2">
            <label className="flex items-center gap-2 text-xs font-bold text-[#5C5046] cursor-pointer">
              <input
                type="checkbox"
                checked={isNew}
                onChange={e => setIsNew(e.target.checked)}
                className="rounded accent-[#4A3F35]"
              />
              <span>تمييز كـ "وصل حديثاً" (New Arrival)</span>
            </label>

            <label className="flex items-center gap-2 text-xs font-bold text-[#5C5046] cursor-pointer">
              <input
                type="checkbox"
                checked={isOnSale}
                onChange={e => setIsOnSale(e.target.checked)}
                className="rounded accent-[#4A3F35]"
              />
              <span>تفعيل شارة "خصم خاص" (On Sale)</span>
            </label>
          </div>

          <div className="flex gap-3 pt-4 border-t border-[#E8E1DA]">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-3 px-6 bg-[#4A3F35] hover:bg-[#3B322A] text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 border border-[#6B5E54]/30"
            >
              <Check className="w-4 h-4" />
              <span>{isSubmitting ? 'جاري الحفظ...' : 'حفظ ونشر الموديل'}</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="py-3 px-6 bg-[#FAF8F5] text-[#5C5046] font-bold text-xs rounded-xl hover:bg-[#F2EAE4] transition-colors border border-[#E8E1DA] cursor-pointer"
            >
              إلغاء
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
