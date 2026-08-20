import React, { useState } from 'react';
import { X, PackagePlus, Check, AlertCircle } from 'lucide-react';
import { Product } from '../../types';

interface RestockModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  initialProductId?: string;
  onRestockSuccess: () => void;
}

export const RestockModal: React.FC<RestockModalProps> = ({
  isOpen,
  onClose,
  products,
  initialProductId,
  onRestockSuccess
}) => {
  const [selectedProductId, setSelectedProductId] = useState(initialProductId || products[0]?.id || '');
  const [quantity, setQuantity] = useState<number>(10);
  const [note, setNote] = useState('شحنة بضاعة جديدة للمخزن');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const currentProduct = products.find(p => p.id === selectedProductId) || products[0];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentProduct) {
      setErrorMsg('يرجى اختيار المنتج.');
      return;
    }

    if (quantity <= 0) {
      setErrorMsg('يرجى إدخال كمية صحيحة أكبر من صفر.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/admin/inventory/restock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: currentProduct.id,
          quantity: Number(quantity),
          note
        })
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'فشل تزويد المخزون');
      }

      onRestockSuccess();
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'حدث خطأ أثناء تزويد المخزون.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl p-6 sm:p-8 border border-[#E8E1DA] my-auto text-right">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#E8E1DA]">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <PackagePlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#2D2621]">توريد وتزويد كمية للمخزن</h3>
              <p className="text-xs text-[#8C7D73]">إضافة شحنة قطع جديدة وزيادة رصيد المخزون</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full text-[#8C7D73] hover:text-[#2D2621] hover:bg-[#FAF8F5] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="my-4 p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#5C5046]">اختيار المنتج</label>
            <select
              value={selectedProductId}
              onChange={e => setSelectedProductId(e.target.value)}
              className="w-full py-2.5 px-3.5 text-xs bg-[#FAF8F5] border border-[#E8E1DA] rounded-xl focus:outline-none focus:border-[#4A3F35] text-[#2D2621]"
            >
              {products.map(p => (
                <option key={p.id} value={p.id}>
                  {p.name} (المخزون الحالي: {p.stock} قطعة)
                </option>
              ))}
            </select>
          </div>

          {currentProduct && (
            <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#E8E1DA] flex items-center gap-3">
              <img src={currentProduct.images[0]} alt="" className="w-12 h-14 rounded-lg object-cover" />
              <div className="text-xs space-y-0.5">
                <p className="font-bold text-[#2D2621]">{currentProduct.name}</p>
                <p className="text-[#8C7D73]">التصنيف: {currentProduct.category}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[11px] text-[#5C5046]">الرصيد الحالي:</span>
                  <span className="font-bold px-2 py-0.5 rounded bg-white border border-[#E8E1DA] text-[#4A3F35]">
                    {currentProduct.stock} قطع
                  </span>
                  <span className="text-[11px] text-emerald-600 font-bold">
                    ← بعد التوريد: {currentProduct.stock + Number(quantity || 0)} قطعة
                  </span>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#5C5046]">عدد القطع المستلمة (الزيادة)</label>
            <div className="flex gap-2">
              <input
                type="number"
                min={1}
                required
                value={quantity}
                onChange={e => setQuantity(Math.max(1, Number(e.target.value)))}
                className="flex-1 py-2.5 px-3.5 text-sm font-bold bg-[#FAF8F5] border border-[#E8E1DA] rounded-xl focus:outline-none focus:border-[#4A3F35] text-[#2D2621]"
              />
              <div className="flex gap-1">
                {[5, 10, 20, 50].map(amt => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setQuantity(amt)}
                    className={`px-2.5 py-1 text-xs font-bold rounded-xl border transition-colors cursor-pointer ${
                      quantity === amt
                        ? 'bg-[#4A3F35] text-white border-[#4A3F35]'
                        : 'bg-white text-[#5C5046] border-[#E8E1DA] hover:bg-[#FAF8F5]'
                    }`}
                  >
                    +{amt}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#5C5046]">ملاحظات الشحنة أو المورد</label>
            <input
              type="text"
              value={note}
              onChange={e => setNote(e.target.value)}
              placeholder="مثال: توريد دفعة شتوية، شحنة تركيا، جرد أسبوعي"
              className="w-full py-2.5 px-3.5 text-xs bg-[#FAF8F5] border border-[#E8E1DA] rounded-xl focus:outline-none focus:border-[#4A3F35] text-[#2D2621]"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-3 px-6 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <Check className="w-4 h-4" />
              <span>{isSubmitting ? 'جاري التحديث...' : 'تأكيد تزويد المخزون'}</span>
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
