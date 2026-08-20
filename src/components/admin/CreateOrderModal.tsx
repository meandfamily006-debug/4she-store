import React, { useState } from 'react';
import { X, Plus, Trash2, ShoppingBag, Check } from 'lucide-react';
import { Product, OrderItem } from '../../types';
import { formatIQD, IRAQI_GOVERNORATES, MOSUL_DISTRICTS } from '../../utils/formatters';

interface CreateOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  onOrderCreated: () => void;
}

export const CreateOrderModal: React.FC<CreateOrderModalProps> = ({
  isOpen,
  onClose,
  products,
  onOrderCreated
}) => {
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('0770');
  const [governorate, setGovernorate] = useState('نينوى (الموصل)');
  const [district, setDistrict] = useState(MOSUL_DISTRICTS[0]);
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'electronic'>('cod');
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'paid'>('pending');
  const [orderStatus, setOrderStatus] = useState<'received' | 'processing' | 'out_for_delivery' | 'delivered'>('received');
  const [deliveryFee, setDeliveryFee] = useState(3000);
  const [discount, setDiscount] = useState(0);

  // Selected products for this order
  const [items, setItems] = useState<OrderItem[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<string>(products[0]?.id || '');
  const [selectedSize, setSelectedSize] = useState<string>(products[0]?.sizes[0] || 'M');
  const [selectedColorIndex, setSelectedColorIndex] = useState<number>(0);
  const [quantity, setQuantity] = useState<number>(1);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const currentProduct = products.find(p => p.id === selectedProductId) || products[0];

  const handleAddItem = () => {
    if (!currentProduct) return;
    const colorObj = currentProduct.colors[selectedColorIndex] || currentProduct.colors[0] || { name: 'افتراضي', hex: '#000000' };
    
    const existingIndex = items.findIndex(
      it => it.productId === currentProduct.id && it.size === selectedSize && it.colorName === colorObj.name
    );

    if (existingIndex >= 0) {
      const updated = [...items];
      updated[existingIndex].quantity += quantity;
      setItems(updated);
    } else {
      const newItem: OrderItem = {
        productId: currentProduct.id,
        name: currentProduct.name,
        image: currentProduct.images[0] || 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400',
        size: selectedSize,
        colorName: colorObj.name,
        colorHex: colorObj.hex,
        price: currentProduct.price,
        quantity: quantity
      };
      setItems([...items, newItem]);
    }
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const total = Math.max(0, subtotal + deliveryFee - discount);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) {
      setErrorMsg('يرجى إضافة قطعة واحدة على الأقل للطلبية.');
      return;
    }

    if (!customerPhone.trim() || customerPhone.length < 10) {
      setErrorMsg('يرجى إدخال رقم هاتف عراقي صحيح (مثال: 07701234567).');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const payload = {
        customerName: customerName.trim() || 'زبونة أزياء 4sHe',
        customerPhone: customerPhone.trim(),
        governorate,
        district,
        address: address.trim() || 'استلام مباشر / طلب هاتفي',
        notes,
        items,
        subtotal,
        deliveryFee,
        discount,
        total,
        paymentMethod,
        paymentStatus,
        status: orderStatus
      };

      const res = await fetch('/api/admin/orders/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'فشل إنشاء الطلبية');
      }

      onOrderCreated();
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'حدث خطأ أثناء حفظ الطلبية.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl p-6 sm:p-8 border border-[#E8E1DA] my-auto max-h-[92vh] overflow-y-auto text-right">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#E8E1DA]">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-2xl bg-[#F2EAE4] text-[#4A3F35] flex items-center justify-center">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-[#2D2621]">إنشاء طلبية جديدة (طلب يدوي / هاتفي)</h3>
              <p className="text-xs text-[#8C7D73]">تسجيل مبيعات المحل أو الطلبات الهاتفية المباشرة مع خصم تلقائي من المخزن</p>
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

        <form onSubmit={handleSubmit} className="space-y-6 pt-4">
          {/* Customer Info Section */}
          <div className="space-y-3 bg-[#FAF8F5] p-4 rounded-2xl border border-[#E8E1DA]">
            <h4 className="text-xs font-bold text-[#4A3F35]">١. بيانات الزبونة والتوصيل</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-[#5C5046]">اسم الزبونة</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: مريم أحمد"
                  value={customerName}
                  onChange={e => setCustomerName(e.target.value)}
                  className="w-full py-2 px-3 text-xs bg-white border border-[#E8E1DA] rounded-xl focus:outline-none focus:border-[#4A3F35] text-[#2D2621]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-[#5C5046]">رقم الهاتف العراقي</label>
                <input
                  type="text"
                  required
                  dir="ltr"
                  placeholder="0770xxxxxxx"
                  value={customerPhone}
                  onChange={e => setCustomerPhone(e.target.value)}
                  className="w-full py-2 px-3 text-xs bg-white border border-[#E8E1DA] rounded-xl focus:outline-none focus:border-[#4A3F35] font-mono text-[#2D2621]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-[#5C5046]">المحافظة</label>
                <select
                  value={governorate}
                  onChange={e => {
                    setGovernorate(e.target.value);
                    if (e.target.value === 'نينوى (الموصل)') {
                      setDeliveryFee(3000);
                    } else {
                      setDeliveryFee(5000);
                    }
                  }}
                  className="w-full py-2 px-3 text-xs bg-white border border-[#E8E1DA] rounded-xl focus:outline-none focus:border-[#4A3F35] text-[#2D2621]"
                >
                  {IRAQI_GOVERNORATES.map(gov => (
                    <option key={gov} value={gov}>{gov}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-[#5C5046]">المنطقة / الحي</label>
                {governorate === 'نينوى (الموصل)' ? (
                  <select
                    value={district}
                    onChange={e => setDistrict(e.target.value)}
                    className="w-full py-2 px-3 text-xs bg-white border border-[#E8E1DA] rounded-xl focus:outline-none focus:border-[#4A3F35] text-[#2D2621]"
                  >
                    {MOSUL_DISTRICTS.map(dist => (
                      <option key={dist} value={dist}>{dist}</option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    placeholder="اسم الحي أو القضاء"
                    value={district}
                    onChange={e => setDistrict(e.target.value)}
                    className="w-full py-2 px-3 text-xs bg-white border border-[#E8E1DA] rounded-xl focus:outline-none focus:border-[#4A3F35] text-[#2D2621]"
                  />
                )}
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-[#5C5046]">العنوان التفصيلي / أقرب نقطة دالة</label>
              <input
                type="text"
                placeholder="مثال: المثنى، شارع الأسواق، قرب صيدلية..."
                value={address}
                onChange={e => setAddress(e.target.value)}
                className="w-full py-2 px-3 text-xs bg-white border border-[#E8E1DA] rounded-xl focus:outline-none focus:border-[#4A3F35] text-[#2D2621]"
              />
            </div>
          </div>

          {/* Product Items Section */}
          <div className="space-y-3 bg-[#FAF8F5] p-4 rounded-2xl border border-[#E8E1DA]">
            <h4 className="text-xs font-bold text-[#4A3F35]">٢. اختيار وتحديد القطع من المخزن</h4>
            
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-end">
              <div className="sm:col-span-4 space-y-1">
                <label className="text-[10px] font-bold text-[#5C5046]">المنتج</label>
                <select
                  value={selectedProductId}
                  onChange={e => {
                    setSelectedProductId(e.target.value);
                    const p = products.find(prod => prod.id === e.target.value);
                    if (p) {
                      setSelectedSize(p.sizes[0] || 'M');
                      setSelectedColorIndex(0);
                    }
                  }}
                  className="w-full py-2 px-2.5 text-xs bg-white border border-[#E8E1DA] rounded-xl focus:outline-none text-[#2D2621]"
                >
                  {products.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({formatIQD(p.price)}) - متاح: {p.stock}
                    </option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-2 space-y-1">
                <label className="text-[10px] font-bold text-[#5C5046]">المقاس</label>
                <select
                  value={selectedSize}
                  onChange={e => setSelectedSize(e.target.value)}
                  className="w-full py-2 px-2 text-xs bg-white border border-[#E8E1DA] rounded-xl focus:outline-none text-[#2D2621]"
                >
                  {currentProduct?.sizes.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-3 space-y-1">
                <label className="text-[10px] font-bold text-[#5C5046]">اللون</label>
                <select
                  value={selectedColorIndex}
                  onChange={e => setSelectedColorIndex(Number(e.target.value))}
                  className="w-full py-2 px-2 text-xs bg-white border border-[#E8E1DA] rounded-xl focus:outline-none text-[#2D2621]"
                >
                  {currentProduct?.colors.map((c, i) => (
                    <option key={i} value={i}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-1 space-y-1">
                <label className="text-[10px] font-bold text-[#5C5046]">العدد</label>
                <input
                  type="number"
                  min={1}
                  max={currentProduct?.stock || 50}
                  value={quantity}
                  onChange={e => setQuantity(Math.max(1, Number(e.target.value)))}
                  className="w-full py-2 px-2 text-xs bg-white border border-[#E8E1DA] rounded-xl text-center font-bold text-[#2D2621]"
                />
              </div>

              <div className="sm:col-span-2">
                <button
                  type="button"
                  onClick={handleAddItem}
                  className="w-full py-2 px-3 bg-[#4A3F35] hover:bg-[#3B322A] text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1 cursor-pointer transition-colors shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>إضافة للطلب</span>
                </button>
              </div>
            </div>

            {/* List of Added Items */}
            {items.length > 0 ? (
              <div className="space-y-2 pt-2 border-t border-[#E8E1DA]">
                {items.map((it, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-[#E8E1DA] text-xs">
                    <div className="flex items-center gap-3">
                      <img src={it.image} alt="" className="w-10 h-12 rounded-lg object-cover" />
                      <div>
                        <p className="font-bold text-[#2D2621]">{it.name}</p>
                        <div className="flex items-center gap-2 text-[11px] text-[#8C7D73] mt-0.5">
                          <span className="px-1.5 py-0.5 bg-[#FAF8F5] border border-[#E8E1DA] rounded">المقاس: {it.size}</span>
                          <span className="flex items-center gap-1">
                            <span className="w-2.5 h-2.5 rounded-full inline-block border" style={{ backgroundColor: it.colorHex }} />
                            {it.colorName}
                          </span>
                          <span className="font-bold text-[#4A3F35]">الكمية: {it.quantity}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="font-bold text-[#2D2621]">{formatIQD(it.price * it.quantity)}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(idx)}
                        className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                        title="إزالة"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-xs text-[#8C7D73] py-3">لم يتم اختيار أي قطع بعد</p>
            )}
          </div>

          {/* Payment & Status Settings */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-[#FAF8F5] p-4 rounded-2xl border border-[#E8E1DA]">
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-[#5C5046]">طريقة الدفع</label>
              <select
                value={paymentMethod}
                onChange={e => setPaymentMethod(e.target.value as any)}
                className="w-full py-2 px-3 text-xs bg-white border border-[#E8E1DA] rounded-xl text-[#2D2621]"
              >
                <option value="cod">الدفع عند الاستلام (COD)</option>
                <option value="electronic">دفع إلكتروني (زين كاش / ماستر كارد)</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-[#5C5046]">حالة الدفع</label>
              <select
                value={paymentStatus}
                onChange={e => setPaymentStatus(e.target.value as any)}
                className="w-full py-2 px-3 text-xs bg-white border border-[#E8E1DA] rounded-xl text-[#2D2621]"
              >
                <option value="pending">بانتظار الدفع (معلق)</option>
                <option value="paid">تم استلام المبلغ (مدفوع)</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-[#5C5046]">حالة الطلب الأولية</label>
              <select
                value={orderStatus}
                onChange={e => setOrderStatus(e.target.value as any)}
                className="w-full py-2 px-3 text-xs bg-white border border-[#E8E1DA] rounded-xl text-[#2D2621]"
              >
                <option value="received">تم الاستلام</option>
                <option value="processing">قيد التجهيز</option>
                <option value="out_for_delivery">خرج للتوصيل</option>
                <option value="delivered">تم التسليم مباشرة</option>
              </select>
            </div>
          </div>

          {/* Pricing Summary */}
          <div className="bg-[#F2EAE4]/60 p-4 rounded-2xl border border-[#E8DDD5] space-y-2 text-xs">
            <div className="flex justify-between text-[#5C5046]">
              <span>مجموع المنتجات ({items.reduce((s, i) => s + i.quantity, 0)} قطع):</span>
              <span className="font-bold">{formatIQD(subtotal)}</span>
            </div>

            <div className="flex items-center justify-between gap-4">
              <span className="text-[#5C5046]">أجور التوصيل:</span>
              <input
                type="number"
                value={deliveryFee}
                onChange={e => setDeliveryFee(Number(e.target.value))}
                className="w-28 py-1 px-2 text-xs bg-white border border-[#E8DDD5] rounded-lg text-left font-mono font-bold"
              />
            </div>

            <div className="flex items-center justify-between gap-4">
              <span className="text-[#5C5046]">خصم خاص للزبونة (IQD):</span>
              <input
                type="number"
                value={discount}
                onChange={e => setDiscount(Number(e.target.value))}
                className="w-28 py-1 px-2 text-xs bg-white border border-[#E8DDD5] rounded-lg text-left font-mono font-bold text-rose-600"
              />
            </div>

            <div className="border-t border-[#E8DDD5] pt-2 flex justify-between items-center text-sm font-black text-[#4A3F35]">
              <span>المجموع الكلي النهائي:</span>
              <span className="text-base font-black">{formatIQD(total)}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-3 px-6 bg-[#4A3F35] hover:bg-[#3B322A] text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 border border-[#6B5E54]/30"
            >
              <Check className="w-4 h-4" />
              <span>{isSubmitting ? 'جاري حفظ الطلبية...' : 'تأكيد وحفظ الطلبية'}</span>
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
