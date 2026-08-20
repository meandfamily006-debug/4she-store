import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, CheckCircle2, Truck, ShieldCheck, MapPin, Phone, User, FileText, CreditCard, Banknote, RefreshCw, AlertCircle, Sparkles } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useStore } from '../context/StoreContext';
import { formatIQD, IRAQI_GOVERNORATES, MOSUL_DISTRICTS } from '../utils/formatters';

export const CheckoutModal: React.FC = () => {
  const {
    cart,
    isCheckoutModalOpen,
    setIsCheckoutModalOpen,
    clearCart,
    subtotal,
    deliveryFee,
    total,
    selectedGovernorate,
    setSelectedGovernorate,
    setLastCompletedOrder
  } = useCart();
  const { customer, isAuthenticated, openAuthModal } = useAuth();
  const { setTrackingOrderId } = useStore();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [district, setDistrict] = useState('');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'electronic'>('cod');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Prefill customer info
  useEffect(() => {
    if (customer) {
      setName(customer.name || '');
      setPhone(customer.phone || '');
      if (customer.governorate) setSelectedGovernorate(customer.governorate);
      if (customer.district) setDistrict(customer.district);
      if (customer.address) setAddress(customer.address);
    }
  }, [customer, isCheckoutModalOpen]);

  if (!isCheckoutModalOpen) return null;

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('يرجى إدخال الاسم الكامل للعميلة');
      return;
    }

    if (!phone.trim()) {
      setError('يرجى إدخال رقم الهاتف للتواصل');
      return;
    }

    if (!selectedGovernorate) {
      setError('يرجى اختيار المحافظة');
      return;
    }

    if (!address.trim()) {
      setError('يرجى إدخال العنوان التفصيلي أو أقرب نقطة دالة');
      return;
    }

    if (cart.length === 0) {
      setError('سلة التسوق فارغة');
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        customerPhone: phone,
        customerName: name,
        governorate: selectedGovernorate,
        district: district || (selectedGovernorate.includes('الموصل') ? 'الموصل' : ''),
        address,
        notes,
        items: cart.map(item => ({
          productId: item.productId,
          name: item.product.name,
          image: item.product.images[0],
          size: item.size,
          colorName: item.color.name,
          colorHex: item.color.hex,
          quantity: item.quantity
        })),
        paymentMethod
      };

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (res.ok && data.success) {
        // Order success!
        clearCart();
        setIsCheckoutModalOpen(false);
        setLastCompletedOrder(data.order);
        setTrackingOrderId(data.order.id);
      } else {
        setError(data.error || 'تعذر تأكيد الطلب. يرجى مراجعة البيانات والمحاولة مجددًا');
      }
    } catch (err) {
      setError('تعذر الاتصال بالخادم. يرجى المحاولة بعد قليل');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col border border-[#E8E1DA]"
          id="checkout-modal"
        >
          {/* Header */}
          <div className="p-5 sm:p-6 bg-[#4A3F35] text-white flex items-center justify-between border-b border-[#3B322A]">
            <div className="text-right">
              <h2 className="text-lg sm:text-xl font-black text-white">
                إتمام الطلب والتوصيل
              </h2>
              <p className="text-xs text-[#E8DDD5]">
                متجر أزياء 4sHe • توصيل فوري لكافة مناطق الموصل ومحافظات العراق
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsCheckoutModalOpen(false)}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Checkout Body Form */}
          <form onSubmit={handleSubmitOrder} className="overflow-y-auto p-5 sm:p-8 space-y-6 text-right">
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2"
              >
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                <span>{error}</span>
              </motion.div>
            )}

            {/* Order Items Preview */}
            <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#E8E1DA] space-y-3">
              <h3 className="text-xs font-bold text-[#2D2621] flex items-center justify-between">
                <span>ملخص المشتريات ({cart.length} قطع)</span>
                <span className="text-[#4A3F35] font-black">{formatIQD(subtotal)}</span>
              </h3>
              <div className="flex gap-2 overflow-x-auto pb-1">
                {cart.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2 p-2 bg-white rounded-xl border border-[#E8E1DA] shrink-0 text-xs">
                    <img src={item.product.images[0]} alt="" className="w-10 h-12 rounded-lg object-cover" />
                    <div>
                      <p className="font-bold text-[#2D2621] line-clamp-1 max-w-[120px]">{item.product.name}</p>
                      <p className="text-[10px] text-[#8C7D73]">
                        {item.size} • {item.color.name} (×{item.quantity})
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Customer Details Form */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-[#2D2621] border-b border-[#E8E1DA] pb-2 flex items-center gap-2">
                <User className="w-4 h-4 text-[#A67C52]" />
                <span>بيانات الزبونة وعنوان التوصيل</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Full Name */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-[#5C5046]">
                    الاسم الكامل <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="مثال: سارة محمد"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="w-full py-2.5 px-3.5 text-xs bg-[#FAF8F5] border border-[#E8E1DA] rounded-xl focus:outline-none focus:border-[#4A3F35] focus:bg-white text-[#2D2621]"
                  />
                </div>

                {/* Phone Number */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-[#5C5046]">
                    رقم الهاتف المحمول <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="0770 744 0557"
                    dir="ltr"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    className="w-full py-2.5 px-3.5 text-xs text-left bg-[#FAF8F5] border border-[#E8E1DA] rounded-xl focus:outline-none focus:border-[#4A3F35] focus:bg-white font-mono text-[#2D2621]"
                  />
                </div>

                {/* Governorate Selector */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-[#5C5046]">
                    المحافظة <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={selectedGovernorate}
                    onChange={e => setSelectedGovernorate(e.target.value)}
                    className="w-full py-2.5 px-3.5 text-xs bg-[#FAF8F5] border border-[#E8E1DA] rounded-xl focus:outline-none focus:border-[#4A3F35] focus:bg-white text-[#2D2621]"
                  >
                    {IRAQI_GOVERNORATES.map(gov => (
                      <option key={gov} value={gov}>
                        {gov}
                      </option>
                    ))}
                  </select>
                </div>

                {/* District / Neighborhood */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-[#5C5046]">
                    المنطقة / الحي (القضاء) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="مثال: حي المثنى / حي الزهور"
                    value={district}
                    onChange={e => setDistrict(e.target.value)}
                    list="mosul-districts-list"
                    className="w-full py-2.5 px-3.5 text-xs bg-[#FAF8F5] border border-[#E8E1DA] rounded-xl focus:outline-none focus:border-[#4A3F35] focus:bg-white text-[#2D2621]"
                  />
                  <datalist id="mosul-districts-list">
                    {MOSUL_DISTRICTS.map(d => (
                      <option key={d} value={d} />
                    ))}
                  </datalist>
                </div>
              </div>

              {/* Detailed Address */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-[#5C5046]">
                  العنوان بالتفصيل وأقرب نقطة دالة <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="مثال: الموصل، حي المثنى، قرب أسواق المثنى، مقابل صيدلية..."
                  value={address}
                  onChange={e => setAddress(e.target.value)}
                  className="w-full py-2.5 px-3.5 text-xs bg-[#FAF8F5] border border-[#E8E1DA] rounded-xl focus:outline-none focus:border-[#4A3F35] focus:bg-white text-[#2D2621]"
                />
              </div>

              {/* Delivery Notes */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-[#5C5046]">
                  ملاحظات إضافية للتوصيل (اختياري)
                </label>
                <input
                  type="text"
                  placeholder="مثال: يرجى التوصيل بعد الساعة 4 مساءً أو الاتصال قبل القدوم"
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  className="w-full py-2.5 px-3.5 text-xs bg-[#FAF8F5] border border-[#E8E1DA] rounded-xl focus:outline-none focus:border-[#4A3F35] focus:bg-white text-[#2D2621]"
                />
              </div>
            </div>

            {/* Payment Method Selection */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-[#2D2621] border-b border-[#E8E1DA] pb-2 flex items-center gap-2">
                <Banknote className="w-4 h-4 text-[#A67C52]" />
                <span>طريقة الدفع</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Cash on Delivery (Active) */}
                <label
                  onClick={() => setPaymentMethod('cod')}
                  className={`p-4 rounded-2xl border-2 flex items-center gap-3 cursor-pointer transition-all ${
                    paymentMethod === 'cod'
                      ? 'border-[#4A3F35] bg-[#F2EAE4]'
                      : 'border-[#E8E1DA] hover:border-[#A67C52] bg-[#FAF8F5]'
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === 'cod'}
                    onChange={() => setPaymentMethod('cod')}
                    className="accent-[#4A3F35]"
                  />
                  <div>
                    <span className="block text-xs font-bold text-[#2D2621]">
                      الدفع عند الاستلام (COD)
                    </span>
                    <span className="block text-[11px] text-[#6B5E54]">
                      ادفعي نقدًا عند فحص ومعاينة القطع مع المندوب
                    </span>
                  </div>
                </label>

                {/* Electronic Payment Option */}
                <label
                  onClick={() => setPaymentMethod('electronic')}
                  className={`p-4 rounded-2xl border-2 flex items-center gap-3 cursor-pointer transition-all ${
                    paymentMethod === 'electronic'
                      ? 'border-[#4A3F35] bg-[#F2EAE4]'
                      : 'border-[#E8E1DA] hover:border-[#A67C52] bg-[#FAF8F5]'
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === 'electronic'}
                    onChange={() => setPaymentMethod('electronic')}
                    className="accent-[#4A3F35]"
                  />
                  <div>
                    <span className="block text-xs font-bold text-[#2D2621]">
                      الدفع الإلكتروني (زين كاش / كي كارد / فيزا)
                    </span>
                    <span className="block text-[11px] text-[#6B5E54]">
                      بوابة الدفع الإلكتروني العراقي (الدفع عند التسليم متاح كبديل فوري)
                    </span>
                  </div>
                </label>
              </div>
            </div>

            {/* Total Summary */}
            <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#E8E1DA] space-y-2 text-xs">
              <div className="flex justify-between text-[#6B5E54]">
                <span>المجموع الفرعي للملابس:</span>
                <span className="font-bold text-[#2D2621]">{formatIQD(subtotal)}</span>
              </div>
              <div className="flex justify-between text-[#6B5E54]">
                <span>أجور التوصيل ({selectedGovernorate}):</span>
                <span className="font-bold text-[#2D2621]">
                  {deliveryFee === 0 ? <span className="text-emerald-700 font-bold">مجاني 🎉</span> : formatIQD(deliveryFee)}
                </span>
              </div>
              <div className="flex justify-between text-base font-black text-[#4A3F35] border-t border-[#E8E1DA] pt-2">
                <span>المجموع النهائي المطلوب:</span>
                <span>{formatIQD(total)}</span>
              </div>
            </div>

            {/* Confirm Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting || cart.length === 0}
              id="checkout-confirm-order-btn"
              className="w-full py-4 px-6 rounded-2xl bg-[#4A3F35] hover:bg-[#3B322A] text-white font-black text-sm shadow-xl shadow-[#4A3F35]/20 hover:shadow-2xl transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer border border-[#6B5E54]/30"
            >
              {isSubmitting ? (
                <RefreshCw className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-[#E8DDD5]" />
                  <span>تأكيد الطلب الآن ({formatIQD(total)})</span>
                </>
              )}
            </button>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
