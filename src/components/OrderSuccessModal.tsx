import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, Package, Truck, Phone, MessageSquare, Printer, ArrowLeft, MapPin, Sparkles, X, Clock } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useStore } from '../context/StoreContext';
import { formatIQD } from '../utils/formatters';

export const OrderSuccessModal: React.FC = () => {
  const { lastCompletedOrder, setLastCompletedOrder } = useCart();
  const { setActivePage, setTrackingOrderId } = useStore();

  if (!lastCompletedOrder) return null;

  const order = lastCompletedOrder;
  const whatsappUrl = `https://wa.me/9647707440557?text=${encodeURIComponent(
    `مرحبًا أزياء 4sHe، أود متابعة طلبي رقم (${order.id}) باسم (${order.customerName}) بالمبلغ ${formatIQD(order.total)}`
  )}`;

  const handlePrint = () => {
    window.print();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col border border-[#E8E1DA]"
          id="order-success-modal"
        >
          {/* Header */}
          <div className="p-6 sm:p-8 bg-[#4A3F35] text-white text-center relative overflow-hidden border-b border-[#3B322A]">
            <button
              type="button"
              onClick={() => setLastCompletedOrder(null)}
              className="absolute top-4 left-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-400/40 text-emerald-300 flex items-center justify-center mx-auto mb-3 shadow-lg">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <span className="inline-block px-3 py-1 rounded-full bg-white/10 text-[#E8DDD5] text-xs font-bold mb-2">
              تم استلام طلبكِ بنجاح ✨
            </span>
            <h2 className="text-2xl sm:text-3xl font-black mb-1">
              شكرًا لتسوقكِ من أزياء 4sHe
            </h2>
            <p className="text-xs text-[#E8DDD5] max-w-md mx-auto">
              سيقوم فريقنا بفرع أسواق المثنى في الموصل بتجهيز وتغليف طلبكِ وتوصيله بأسرع وقت
            </p>

            <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-white/15 backdrop-blur-md border border-white/20 text-white font-mono text-sm font-bold">
              <span>رقم الطلب:</span>
              <span className="text-[#A67C52] bg-white px-2 py-0.5 rounded-lg font-black">{order.id}</span>
            </div>
          </div>

          {/* Order Progress Tracker */}
          <div className="p-6 bg-[#FAF8F5] border-b border-[#E8E1DA]">
            <h3 className="text-xs font-bold text-[#5C5046] mb-4 text-right">
              مراحل تتبع الطلب:
            </h3>
            <div className="grid grid-cols-4 gap-2 text-center text-xs">
              {/* Step 1: Received */}
              <div className="space-y-1">
                <div className="w-8 h-8 rounded-full bg-[#4A3F35] text-white flex items-center justify-center mx-auto text-xs font-bold shadow-md">
                  ✓
                </div>
                <p className="font-bold text-[#4A3F35] text-[11px]">تم الاستلام</p>
              </div>

              {/* Step 2: Processing */}
              <div className="space-y-1">
                <div className="w-8 h-8 rounded-full bg-[#F2EAE4] text-[#A67C52] border border-[#E8DDD5] flex items-center justify-center mx-auto text-xs font-bold">
                  2
                </div>
                <p className="text-[#5C5046] text-[11px]">قيد التجهيز</p>
              </div>

              {/* Step 3: Out for Delivery */}
              <div className="space-y-1">
                <div className="w-8 h-8 rounded-full bg-[#E8E1DA] text-[#8C7D73] flex items-center justify-center mx-auto text-xs font-bold">
                  3
                </div>
                <p className="text-[#A69B91] text-[11px]">خرج للتوصيل</p>
              </div>

              {/* Step 4: Delivered */}
              <div className="space-y-1">
                <div className="w-8 h-8 rounded-full bg-[#E8E1DA] text-[#8C7D73] flex items-center justify-center mx-auto text-xs font-bold">
                  4
                </div>
                <p className="text-[#A69B91] text-[11px]">تم التسليم</p>
              </div>
            </div>
          </div>

          {/* Order Details Body */}
          <div className="p-6 overflow-y-auto space-y-6 text-right">
            {/* Delivery Info Box */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-white border border-[#E8E1DA] text-xs">
              <div>
                <span className="text-[#8C7D73] block mb-1">بيانات المستلم:</span>
                <p className="font-bold text-[#2D2621]">{order.customerName}</p>
                <p className="text-[#6B5E54] font-mono dir-ltr text-right">{order.customerPhone}</p>
              </div>

              <div>
                <span className="text-[#8C7D73] block mb-1">عنوان التوصيل:</span>
                <p className="font-bold text-[#2D2621]">{order.governorate} • {order.district}</p>
                <p className="text-[#6B5E54]">{order.address}</p>
              </div>
            </div>

            {/* Itemized Receipt */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-[#2D2621] border-b border-[#E8E1DA] pb-2">
                تفاصيل القطع المطلوبة ({order.items.length})
              </h4>
              <div className="space-y-2">
                {order.items.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2.5 rounded-xl bg-[#FAF8F5] border border-[#E8E1DA]/60 text-xs">
                    <div className="flex items-center gap-3">
                      <img src={item.image} alt="" className="w-10 h-12 rounded-lg object-cover" />
                      <div>
                        <p className="font-bold text-[#2D2621]">{item.name}</p>
                        <p className="text-[11px] text-[#8C7D73]">
                          المقاس: {item.size} • اللون: {item.colorName} • الكمية: {item.quantity}
                        </p>
                      </div>
                    </div>
                    <span className="font-black text-[#4A3F35]">
                      {formatIQD(item.price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Financial Summary */}
            <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#E8E1DA] space-y-2 text-xs">
              <div className="flex justify-between text-[#6B5E54]">
                <span>المجموع الفرعي:</span>
                <span className="font-bold text-[#2D2621]">{formatIQD(order.subtotal)}</span>
              </div>
              <div className="flex justify-between text-[#6B5E54]">
                <span>أجور التوصيل:</span>
                <span className="font-bold text-[#2D2621]">
                  {order.deliveryFee === 0 ? 'مجاني' : formatIQD(order.deliveryFee)}
                </span>
              </div>
              <div className="flex justify-between text-sm font-black text-[#4A3F35] border-t border-[#E8E1DA] pt-2">
                <span>المبلغ الكلي المطلوب عند الاستلام:</span>
                <span>{formatIQD(order.total)}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3 pt-2">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-3 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all"
              >
                <MessageSquare className="w-4 h-4" />
                <span>متابعة الطلب عبر الواتساب</span>
              </a>

              <button
                type="button"
                onClick={handlePrint}
                className="py-3 px-4 rounded-2xl bg-[#FAF8F5] border border-[#E8E1DA] hover:bg-[#F2EAE4] text-[#4A3F35] font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>طباعة الفاتورة</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setLastCompletedOrder(null);
                  setActivePage('profile');
                }}
                className="w-full py-3 px-4 rounded-2xl bg-[#4A3F35] hover:bg-[#3B322A] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer border border-[#6B5E54]/30"
              >
                <span>الذهاب إلى صفحة حسابي وطلباتي</span>
                <ArrowLeft className="w-4 h-4" />
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
