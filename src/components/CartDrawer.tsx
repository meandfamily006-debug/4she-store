import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Trash2, ShoppingBag, ArrowLeft, Truck, ShieldCheck, Sparkles } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useStore } from '../context/StoreContext';
import { formatIQD, IRAQI_GOVERNORATES } from '../utils/formatters';

export const CartDrawer: React.FC = () => {
  const {
    cart,
    isCartDrawerOpen,
    setIsCartDrawerOpen,
    removeFromCart,
    updateQuantity,
    subtotal,
    deliveryFee,
    total,
    selectedGovernorate,
    setSelectedGovernorate,
    setIsCheckoutModalOpen
  } = useCart();
  const { setActivePage, setSelectedProduct } = useStore();

  if (!isCartDrawerOpen) return null;

  const handleStartCheckout = () => {
    setIsCartDrawerOpen(false);
    setIsCheckoutModalOpen(true);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-hidden">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setIsCartDrawerOpen(false)}
          className="absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        />

        <div className="fixed inset-y-0 left-0 max-w-full flex pl-0 sm:pl-10">
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="w-screen max-w-md bg-white shadow-2xl flex flex-col border-r border-[#E8E1DA]"
            id="cart-drawer-panel"
          >
            {/* Drawer Header */}
            <div className="p-5 bg-white border-b border-[#E8E1DA] flex items-center justify-between text-right">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-[#F2EAE4] text-[#4A3F35] flex items-center justify-center font-bold">
                  <ShoppingBag className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-[#2D2621]">سلة التسوق</h2>
                  <p className="text-xs text-[#8C7D73]">{cart.length} منتجات في السلة</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsCartDrawerOpen(false)}
                className="p-2 rounded-xl text-gray-400 hover:text-[#2D2621] hover:bg-[#F2EAE4] transition-colors"
                aria-label="إغلاق"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Free Shipping Progress Indicator */}
            <div className="bg-[#FAF8F5] px-5 py-2.5 border-b border-[#E8E1DA] text-xs">
              {subtotal >= 100000 ? (
                <div className="flex items-center gap-1.5 text-emerald-800 font-bold">
                  <Sparkles className="w-4 h-4 text-emerald-700" />
                  <span>تهانينا! حصلتِ على توصيل مجاني لكافة محافظات العراق 🎉</span>
                </div>
              ) : (
                <div className="space-y-1">
                  <div className="flex justify-between text-[#6B5E54] text-[11px]">
                    <span>أضيفي {formatIQD(100000 - subtotal)} للحصول على توصيل مجاني</span>
                    <span className="font-bold text-[#4A3F35]">
                      {Math.round((subtotal / 100000) * 100)}%
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-[#E8DDD5] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#4A3F35] transition-all duration-300 rounded-full"
                      style={{ width: `${Math.min(100, (subtotal / 100000) * 100)}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Cart Items List */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4 text-right">
              {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-4 py-12">
                  <div className="w-20 h-20 rounded-3xl bg-[#F2EAE4] text-[#4A3F35] flex items-center justify-center">
                    <ShoppingBag className="w-10 h-10" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-base font-bold text-[#2D2621]">سلة التسوق فارغة</h3>
                    <p className="text-xs text-[#8C7D73] max-w-xs">
                      لم تقومي بإضافة أي منتجات إلى سلتكِ بعد. اكتشفي أحدث تشكيلاتنا بالموصل!
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setIsCartDrawerOpen(false);
                      setActivePage('shop');
                    }}
                    className="px-6 py-3 rounded-2xl bg-[#4A3F35] text-white text-xs font-bold shadow-md hover:bg-[#3B322A] transition-all border border-[#6B5E54]/30"
                  >
                    ابدئي التسوق الآن
                  </button>
                </div>
              ) : (
                cart.map((item, idx) => (
                  <motion.div
                    key={`${item.productId}-${item.size}-${item.color.hex}-${idx}`}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="flex gap-3 p-3 rounded-2xl bg-[#FAF8F5] border border-[#E8E1DA] relative group"
                  >
                    {/* Item Image */}
                    <img
                      src={item.product.images[0]}
                      alt={item.product.name}
                      className="w-20 h-24 rounded-xl object-cover bg-white shrink-0 cursor-pointer"
                      onClick={() => {
                        setSelectedProduct(item.product);
                        setIsCartDrawerOpen(false);
                      }}
                    />

                    {/* Item Details */}
                    <div className="flex-1 flex flex-col justify-between">
                      <div className="space-y-1">
                        <div className="flex items-start justify-between">
                          <h4 className="text-xs font-bold text-[#2D2621] line-clamp-1">
                            {item.product.name}
                          </h4>
                          <button
                            type="button"
                            onClick={() => removeFromCart(item.productId, item.size, item.color.hex)}
                            className="text-gray-400 hover:text-rose-600 p-1 transition-colors"
                            title="حذف"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Size and Color tags */}
                        <div className="flex items-center gap-2 text-[11px] text-[#6B5E54]">
                          <span className="bg-white px-2 py-0.5 rounded-md border border-[#E8E1DA] font-semibold">
                            المقاس: {item.size}
                          </span>
                          <span className="flex items-center gap-1 bg-white px-2 py-0.5 rounded-md border border-[#E8E1DA]">
                            <span
                              className="w-2.5 h-2.5 rounded-full border border-black/10"
                              style={{ backgroundColor: item.color.hex }}
                            />
                            <span>{item.color.name}</span>
                          </span>
                        </div>
                      </div>

                      {/* Price & Quantity Stepper */}
                      <div className="flex items-center justify-between pt-2">
                        <span className="text-xs font-black text-[#4A3F35]">
                          {formatIQD(item.unitPrice * item.quantity)}
                        </span>

                        <div className="flex items-center border border-[#E8E1DA] rounded-lg bg-white">
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.productId, item.size, item.color.hex, -1)}
                            className="w-6 h-6 flex items-center justify-center text-[#4A3F35] font-bold hover:bg-[#FAF8F5] rounded-r-lg"
                          >
                            -
                          </button>
                          <span className="w-8 text-center text-xs font-bold text-[#2D2621]">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.productId, item.size, item.color.hex, 1)}
                            className="w-6 h-6 flex items-center justify-center text-[#4A3F35] font-bold hover:bg-[#FAF8F5] rounded-l-lg"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>

            {/* Drawer Footer (Summary & Checkout CTA) */}
            {cart.length > 0 && (
              <div className="p-5 bg-white border-t border-[#E8E1DA] space-y-4 text-right">
                {/* Delivery Governorate Selector */}
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-[#5C5046]">
                    محافظة التوصيل لحساب الأجور:
                  </label>
                  <select
                    value={selectedGovernorate}
                    onChange={e => setSelectedGovernorate(e.target.value)}
                    className="w-full py-2 px-3 text-xs bg-[#FAF8F5] border border-[#E8E1DA] rounded-xl focus:outline-none focus:border-[#4A3F35] text-[#2D2621]"
                  >
                    {IRAQI_GOVERNORATES.map(gov => (
                      <option key={gov} value={gov}>
                        {gov} {gov.includes('الموصل') ? '(3,000 د.ع)' : '(5,000 د.ع)'}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Subtotals breakdown */}
                <div className="space-y-1.5 text-xs text-[#6B5E54] border-t border-[#E8E1DA] pt-3">
                  <div className="flex justify-between">
                    <span>المجموع الفرعي:</span>
                    <span className="font-bold text-[#2D2621]">{formatIQD(subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="flex items-center gap-1">
                      <Truck className="w-3.5 h-3.5 text-[#A67C52]" />
                      <span>أجور التوصيل:</span>
                    </span>
                    <span className="font-bold text-[#2D2621]">
                      {deliveryFee === 0 ? (
                        <span className="text-emerald-700 font-bold">مجاني 🎉</span>
                      ) : (
                        formatIQD(deliveryFee)
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm font-black text-[#4A3F35] pt-2 border-t border-[#E8E1DA]">
                    <span>المجموع النهائي:</span>
                    <span>{formatIQD(total)}</span>
                  </div>
                </div>

                {/* Checkout Button */}
                <button
                  type="button"
                  onClick={handleStartCheckout}
                  id="drawer-checkout-btn"
                  className="w-full py-3.5 px-6 rounded-2xl bg-[#4A3F35] hover:bg-[#3B322A] text-white font-bold text-sm shadow-lg shadow-[#4A3F35]/20 hover:shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer border border-[#6B5E54]/30"
                >
                  <span>إتمام الطلب والدفع</span>
                  <ArrowLeft className="w-4 h-4" />
                </button>

                <div className="flex items-center justify-center gap-2 text-[11px] text-[#8C7D73] text-center">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>دفع عند الاستلام مع إمكانية فحص ومعاينة الملابس</span>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </AnimatePresence>
  );
};
