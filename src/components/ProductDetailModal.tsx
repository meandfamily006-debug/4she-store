import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Heart, ShoppingBag, Truck, ShieldCheck, Star, Sparkles, Check, AlertCircle, RefreshCw, MessageSquare } from 'lucide-react';
import { Product, ProductReview } from '../types';
import { useStore } from '../context/StoreContext';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { formatIQD } from '../utils/formatters';

export const ProductDetailModal: React.FC = () => {
  const { selectedProduct, setSelectedProduct, isWishlisted, toggleWishlist } = useStore();
  const { addToCart, setIsCheckoutModalOpen } = useCart();
  const { customer } = useAuth();

  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<{ name: string; hex: string } | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [isLoadingReviews, setIsLoadingReviews] = useState(false);
  const [newReviewComment, setNewReviewComment] = useState('');
  const [newReviewRating, setNewReviewRating] = useState(5);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  // Initialize selections when product opens
  useEffect(() => {
    if (selectedProduct) {
      setSelectedImageIndex(0);
      setSelectedSize(selectedProduct.sizes.length === 1 ? selectedProduct.sizes[0] : '');
      setSelectedColor(selectedProduct.colors.length > 0 ? selectedProduct.colors[0] : { name: 'افتراضي', hex: '#111' });
      setQuantity(1);
      setErrorMessage(null);
      setSuccessMessage(null);

      // Fetch reviews
      fetchProductDetails(selectedProduct.id);
    }
  }, [selectedProduct]);

  const fetchProductDetails = async (id: string) => {
    setIsLoadingReviews(true);
    try {
      const res = await fetch(`/api/products/${id}`);
      if (res.ok) {
        const data = await res.json();
        setReviews(data.reviews || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoadingReviews(false);
    }
  };

  if (!selectedProduct) return null;

  const wishlisted = isWishlisted(selectedProduct.id);

  const handleAddToCart = (directCheckout = false) => {
    setErrorMessage(null);
    setSuccessMessage(null);

    if (selectedProduct.sizes && selectedProduct.sizes.length > 0 && !selectedSize) {
      setErrorMessage('يرجى اختيار المقاس المطلوب أولاً للمتابعة');
      return;
    }

    const color = selectedColor || (selectedProduct.colors?.[0] || { name: 'افتراضي', hex: '#111' });
    const res = addToCart(selectedProduct, selectedSize, color, quantity);

    if (res.success) {
      if (directCheckout) {
        setSelectedProduct(null);
        setIsCheckoutModalOpen(true);
      } else {
        setSuccessMessage('تمت إضافة القطعة إلى سلة التسوق بنجاح ✨');
        setTimeout(() => setSuccessMessage(null), 3000);
      }
    } else {
      setErrorMessage(res.error || 'تعذر إضافة المنتج');
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReviewComment.trim()) return;

    setIsSubmittingReview(true);
    try {
      const res = await fetch(`/api/products/${selectedProduct.id}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: customer?.name || 'زبونة أزياء 4sHe (الموصل)',
          rating: newReviewRating,
          comment: newReviewComment.trim()
        })
      });

      if (res.ok) {
        const data = await res.json();
        setReviews(prev => [data.review, ...prev]);
        setNewReviewComment('');
        selectedProduct.rating = data.rating;
        selectedProduct.reviewsCount = data.reviewsCount;
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmittingReview(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col border border-[#eedfd9]"
          id="product-detail-modal"
        >
          {/* Close button */}
          <button
            type="button"
            onClick={() => setSelectedProduct(null)}
            className="absolute top-4 left-4 z-20 w-10 h-10 rounded-full bg-white/90 backdrop-blur-md text-gray-700 hover:bg-white hover:text-black flex items-center justify-center shadow-md transition-all"
            aria-label="إغلاق"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="overflow-y-auto p-4 sm:p-8 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
              {/* Image Gallery Column */}
              <div className="md:col-span-6 space-y-3">
                {/* Main Large Image */}
                <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-[#FAF8F5] border border-[#E8E1DA]">
                  <img
                    src={selectedProduct.images[selectedImageIndex] || selectedProduct.images[0]}
                    alt={selectedProduct.name}
                    className="w-full h-full object-cover object-center"
                  />
                  {selectedProduct.discountPercentage && selectedProduct.discountPercentage > 0 ? (
                    <span className="absolute top-3 right-3 px-3 py-1 rounded-xl bg-[#A67C52] text-white text-xs font-black shadow-md">
                      خصم {selectedProduct.discountPercentage}%
                    </span>
                  ) : null}
                </div>

                {/* Thumbnails */}
                {selectedProduct.images.length > 1 && (
                  <div className="flex gap-2 overflow-x-auto pb-1">
                    {selectedProduct.images.map((img, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setSelectedImageIndex(idx)}
                        className={`relative w-16 h-20 rounded-xl overflow-hidden border-2 transition-all shrink-0 ${
                          selectedImageIndex === idx
                            ? 'border-[#4A3F35] ring-2 ring-[#4A3F35]/20'
                            : 'border-[#E8E1DA] opacity-70 hover:opacity-100'
                        }`}
                      >
                        <img src={img} alt="" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Product Details & Purchase Form Column */}
              <div className="md:col-span-6 space-y-6 text-right">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#4A3F35] bg-[#F2EAE4] px-2.5 py-1 rounded-lg border border-[#E8DDD5]">
                      {selectedProduct.category}
                    </span>
                    <div className="flex items-center gap-1.5 text-amber-600 font-bold text-xs">
                      <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                      <span>{selectedProduct.rating}</span>
                      <span className="text-[#8C7D73]">({selectedProduct.reviewsCount} تقييم)</span>
                    </div>
                  </div>

                  <h2 className="text-xl sm:text-2xl font-black text-[#2D2621] leading-snug">
                    {selectedProduct.name}
                  </h2>
                </div>

                {/* Price Display */}
                <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#E8E1DA] flex items-center justify-between">
                  <div>
                    <span className="text-xs text-[#8C7D73] block mb-0.5">السعر بالدينار العراقي</span>
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-black text-[#4A3F35]">
                        {formatIQD(selectedProduct.price)}
                      </span>
                      {selectedProduct.originalPrice && selectedProduct.originalPrice > selectedProduct.price && (
                        <span className="text-sm text-[#A69B91] line-through">
                          {formatIQD(selectedProduct.originalPrice)}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="text-left">
                    <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-bold ${
                      selectedProduct.stock > 0
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}>
                      {selectedProduct.stock > 0 ? `متوفر (${selectedProduct.stock} قطع)` : 'نفدت الكمية'}
                    </span>
                  </div>
                </div>

                {/* Size Selection (MANDATORY) */}
                {selectedProduct.sizes && selectedProduct.sizes.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-[#2D2621]">
                        اختيار المقاس <span className="text-rose-500">*</span>
                      </label>
                      {selectedSize && (
                        <span className="text-xs font-semibold text-[#A67C52]">
                          المحدد: {selectedSize}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {selectedProduct.sizes.map(size => {
                        const isSelected = selectedSize === size;
                        return (
                          <button
                            key={size}
                            type="button"
                            onClick={() => {
                              setSelectedSize(size);
                              setErrorMessage(null);
                            }}
                            className={`min-w-[48px] py-2 px-3.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                              isSelected
                                ? 'border-[#4A3F35] bg-[#4A3F35] text-white shadow-md'
                                : 'border-[#E8E1DA] bg-white text-[#5C5046] hover:border-[#A67C52]'
                            }`}
                          >
                            {size}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Color Selection */}
                {selectedProduct.colors && selectedProduct.colors.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-[#2D2621]">اللون</label>
                      {selectedColor && (
                        <span className="text-xs text-[#8C7D73] font-medium">
                          {selectedColor.name}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {selectedProduct.colors.map(color => {
                        const isSelected = selectedColor?.hex === color.hex;
                        return (
                          <button
                            key={color.hex}
                            type="button"
                            onClick={() => setSelectedColor(color)}
                            className={`flex items-center gap-2 py-1.5 px-3 rounded-xl border text-xs font-medium transition-all ${
                              isSelected
                                ? 'border-[#A67C52] bg-[#F2EAE4] text-[#4A3F35] ring-1 ring-[#A67C52]'
                                : 'border-[#E8E1DA] bg-white text-[#5C5046] hover:bg-[#FAF8F5]'
                            }`}
                          >
                            <span
                              className="w-3.5 h-3.5 rounded-full border border-black/10 shrink-0 shadow-xs"
                              style={{ backgroundColor: color.hex }}
                            />
                            <span>{color.name}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Quantity Selector */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-[#2D2621]">الكمية</label>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center border border-[#E8E1DA] rounded-xl bg-[#FAF8F5] p-1">
                      <button
                        type="button"
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="w-8 h-8 rounded-lg bg-white text-[#4A3F35] font-bold flex items-center justify-center shadow-xs hover:bg-[#F2EAE4] disabled:opacity-40"
                        disabled={quantity <= 1}
                      >
                        -
                      </button>
                      <span className="w-12 text-center text-sm font-bold text-[#2D2621]">
                        {quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => setQuantity(Math.min(selectedProduct.stock, quantity + 1))}
                        className="w-8 h-8 rounded-lg bg-white text-[#4A3F35] font-bold flex items-center justify-center shadow-xs hover:bg-[#F2EAE4] disabled:opacity-40"
                        disabled={quantity >= selectedProduct.stock}
                      >
                        +
                      </button>
                    </div>
                    <span className="text-xs text-[#8C7D73]">
                      المجموع الفرعي: <strong className="text-[#2D2621]">{formatIQD(selectedProduct.price * quantity)}</strong>
                    </span>
                  </div>
                </div>

                {/* Feedback Alerts */}
                {errorMessage && (
                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2"
                  >
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                    <span>{errorMessage}</span>
                  </motion.div>
                )}

                {successMessage && (
                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2"
                  >
                    <Check className="w-4 h-4 shrink-0 text-emerald-600" />
                    <span>{successMessage}</span>
                  </motion.div>
                )}

                {/* Main Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => handleAddToCart(false)}
                    disabled={selectedProduct.stock === 0}
                    id="modal-add-to-cart-btn"
                    className="flex-1 py-3.5 px-6 rounded-2xl bg-[#4A3F35] hover:bg-[#3B322A] text-white font-bold text-sm shadow-lg shadow-[#4A3F35]/20 hover:shadow-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer border border-[#6B5E54]/30"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    <span>أضيفي إلى السلة</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleAddToCart(true)}
                    disabled={selectedProduct.stock === 0}
                    id="modal-buy-now-btn"
                    className="py-3.5 px-6 rounded-2xl bg-[#A67C52] hover:bg-[#916B44] text-white font-black text-sm shadow-md transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer border border-[#C29B72]/40"
                  >
                    <Sparkles className="w-4 h-4 text-[#E8DDD5]" />
                    <span>اشترِ الآن</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => toggleWishlist(selectedProduct.id)}
                    className={`p-3.5 rounded-2xl border transition-all flex items-center justify-center shrink-0 ${
                      wishlisted
                        ? 'border-[#E8DDD5] bg-[#F2EAE4] text-[#A67C52]'
                        : 'border-[#E8E1DA] hover:border-[#A67C52] text-[#5C5046] bg-white'
                    }`}
                    title="المفضلة"
                  >
                    <Heart className={`w-5 h-5 ${wishlisted ? 'fill-[#A67C52] text-[#A67C52]' : ''}`} />
                  </button>
                </div>

                {/* Shipping & Assurance Note */}
                <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#E8E1DA] space-y-2 text-xs text-[#6B5E54]">
                  <div className="flex items-center gap-2 text-[#2D2621] font-bold">
                    <Truck className="w-4 h-4 text-[#A67C52]" />
                    <span>توصيل داخل الموصل 3,000 د.ع • باقي المحافظات 5,000 د.ع</span>
                  </div>
                  <div className="flex items-center gap-2 text-[#6B5E54]">
                    <ShieldCheck className="w-4 h-4 text-[#A67C52]" />
                    <span>معاينة القطع مع المندوب قبل الدفع والاستلام لراحتك التامة</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Description & Product Details */}
            <div className="border-t border-[#E8E1DA] pt-6 space-y-4 text-right">
              <h3 className="text-base font-bold text-[#2D2621]">
                تفاصيل ووصف المنتج
              </h3>
              <p className="text-sm text-[#6B5E54] leading-relaxed">
                {selectedProduct.description}
              </p>

              {selectedProduct.details && selectedProduct.details.length > 0 && (
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-[#5C5046] pt-2">
                  {selectedProduct.details.map((item, idx) => (
                    <li key={idx} className="flex items-center gap-2 p-2 rounded-lg bg-[#FAF8F5] border border-[#E8E1DA]/60">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#A67C52] shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Reviews Section */}
            <div className="border-t border-[#E8E1DA] pt-6 space-y-6 text-right">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-[#2D2621] flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-[#A67C52]" />
                  <span>آراء وتقييمات العملاء ({reviews.length})</span>
                </h3>
                <div className="flex items-center gap-1 text-amber-600 font-bold text-sm">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  <span>5.0 من 5 على Google Maps</span>
                </div>
              </div>

              {/* Add Review Form */}
              <form onSubmit={handleReviewSubmit} className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#E8E1DA] space-y-3">
                <h4 className="text-xs font-bold text-[#2D2621]">
                  شاركينا رأيكِ في هذه القطعة
                </h4>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-[#6B5E54]">التقييم:</span>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map(star => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setNewReviewRating(star)}
                        className="p-1 focus:outline-none"
                      >
                        <Star className={`w-4 h-4 ${star <= newReviewRating ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`} />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="اكتبي تعليقكِ هنا بكل صدق..."
                    value={newReviewComment}
                    onChange={e => setNewReviewComment(e.target.value)}
                    className="flex-1 px-3 py-2 text-xs bg-white rounded-xl border border-[#E8E1DA] focus:outline-none focus:border-[#4A3F35] text-[#2D2621]"
                  />
                  <button
                    type="submit"
                    disabled={isSubmittingReview || !newReviewComment.trim()}
                    className="px-4 py-2 bg-[#4A3F35] text-white rounded-xl text-xs font-bold hover:bg-[#3B322A] transition-colors disabled:opacity-40 cursor-pointer border border-[#6B5E54]/30"
                  >
                    {isSubmittingReview ? 'جاري النشر...' : 'إرسال التقييم'}
                  </button>
                </div>
              </form>

              {/* Reviews List */}
              <div className="space-y-3">
                {reviews.length === 0 ? (
                  <p className="text-xs text-[#8C7D73] py-2">لا توجد تقييمات بعد لهذه القطعة. كوني أول من يقيمها!</p>
                ) : (
                  reviews.map(rev => (
                    <div key={rev.id} className="p-3.5 rounded-xl bg-white border border-[#E8E1DA] space-y-1.5 shadow-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[#2D2621]">{rev.customerName}</span>
                        <div className="flex items-center gap-1">
                          {[...Array(rev.rating)].map((_, i) => (
                            <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
                          ))}
                          <span className="text-[10px] text-[#8C7D73] mr-2">{rev.date}</span>
                        </div>
                      </div>
                      <p className="text-xs text-[#6B5E54] leading-relaxed">{rev.comment}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
