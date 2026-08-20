import React from 'react';
import { motion } from 'motion/react';
import { Heart, ShoppingBag, Eye, Star, Sparkles } from 'lucide-react';
import { Product } from '../types';
import { useStore } from '../context/StoreContext';
import { useCart } from '../context/CartContext';
import { formatIQD } from '../utils/formatters';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { setSelectedProduct, isWishlisted, toggleWishlist } = useStore();
  const { addToCart } = useCart();
  const wishlisted = isWishlisted(product.id);

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    // If product has sizes and needs selection, open modal so customer picks size
    if (product.sizes && product.sizes.length > 1) {
      setSelectedProduct(product);
      return;
    }

    const defaultSize = product.sizes?.[0] || 'Free Size';
    const defaultColor = product.colors?.[0] || { name: 'افتراضي', hex: '#111' };
    addToCart(product, defaultSize, defaultColor, 1);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="group relative bg-white rounded-2xl border border-[#E8E1DA] hover:border-[#A67C52]/40 hover:shadow-xl transition-all duration-300 flex flex-col overflow-hidden text-right"
      id={`product-card-${product.id}`}
      onClick={() => setSelectedProduct(product)}
    >
      {/* Image Container */}
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-[#FAF8F5] cursor-pointer">
        <img
          src={product.images[0]}
          alt={product.name}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        {/* Badges */}
        <div className="absolute top-3 right-3 flex flex-col gap-1.5 z-10">
          {product.discountPercentage && product.discountPercentage > 0 ? (
            <span className="px-2 py-1 rounded-lg bg-[#A67C52] text-white text-[11px] font-black shadow-sm">
              خصم {product.discountPercentage}%
            </span>
          ) : null}

          {product.isNew && (
            <span className="px-2 py-0.5 rounded-lg bg-[#4A3F35] text-white text-[10px] font-bold shadow-sm flex items-center gap-1">
              <Sparkles className="w-2.5 h-2.5" />
              <span>جديد</span>
            </span>
          )}
        </div>

        {/* Action Buttons Overlay */}
        <div className="absolute top-3 left-3 flex flex-col gap-2 z-10">
          <button
            type="button"
            onClick={e => {
              e.stopPropagation();
              toggleWishlist(product.id);
            }}
            className={`w-9 h-9 rounded-full flex items-center justify-center backdrop-blur-md shadow-md transition-all ${
              wishlisted
                ? 'bg-[#F2EAE4] text-[#A67C52]'
                : 'bg-white/80 text-[#5C5046] hover:bg-white hover:text-[#A67C52]'
            }`}
            title="إضافة للمفضلة"
          >
            <Heart className={`w-4 h-4 ${wishlisted ? 'fill-[#A67C52] text-[#A67C52]' : ''}`} />
          </button>

          <button
            type="button"
            onClick={e => {
              e.stopPropagation();
              setSelectedProduct(product);
            }}
            className="w-9 h-9 rounded-full bg-white/80 backdrop-blur-md text-[#5C5046] hover:bg-white hover:text-[#4A3F35] flex items-center justify-center shadow-md transition-all opacity-0 group-hover:opacity-100"
            title="نظرة سريعة"
          >
            <Eye className="w-4 h-4" />
          </button>
        </div>

        {/* Stock Alert Badge */}
        {product.stock <= 3 && product.stock > 0 && (
          <div className="absolute bottom-2 right-2 left-2 py-1 px-2 rounded-md bg-[#A67C52]/90 backdrop-blur-xs text-white text-[10px] font-bold text-center">
            متبقي {product.stock} قطع فقط!
          </div>
        )}

        {product.stock === 0 && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center text-white font-bold text-sm">
            نفدت الكمية حاليًا
          </div>
        )}
      </div>

      {/* Product Information */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-[11px] text-[#8C7D73]">
            <span>{product.category}</span>
            <div className="flex items-center gap-1 text-amber-600 font-bold">
              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
              <span>{product.rating}</span>
              <span className="text-[#A69B91]">({product.reviewsCount})</span>
            </div>
          </div>

          <h3 className="text-sm font-bold text-[#2D2621] group-hover:text-[#A67C52] line-clamp-1 transition-colors">
            {product.name}
          </h3>

          {/* Sizes preview */}
          {product.sizes && product.sizes.length > 0 && (
            <div className="flex flex-wrap gap-1 pt-0.5">
              {product.sizes.slice(0, 4).map(size => (
                <span key={size} className="px-1.5 py-0.5 rounded text-[10px] bg-[#FAF6F1] text-[#6B5E54] font-medium border border-[#E8E1DA]">
                  {size}
                </span>
              ))}
              {product.sizes.length > 4 && (
                <span className="text-[10px] text-[#8C7D73] self-center">
                  +{product.sizes.length - 4}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Price and Cart Action */}
        <div className="pt-2 border-t border-[#E8E1DA] flex items-center justify-between">
          <div>
            <div className="text-base font-black text-[#4A3F35]">
              {formatIQD(product.price)}
            </div>
            {product.originalPrice && product.originalPrice > product.price && (
              <div className="text-[11px] text-[#A69B91] line-through">
                {formatIQD(product.originalPrice)}
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={handleQuickAdd}
            disabled={product.stock === 0}
            className="p-2.5 rounded-xl bg-[#4A3F35] hover:bg-[#3B322A] text-white transition-all shadow-xs hover:shadow-md disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer border border-[#6B5E54]/30"
            title="أضيفي إلى السلة"
          >
            <ShoppingBag className="w-4 h-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};
