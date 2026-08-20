import React from 'react';
import { motion } from 'motion/react';
import { Sparkles, Tag, Flame, Clock, ArrowLeft } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { ProductCard } from '../components/ProductCard';

export const OffersView: React.FC = () => {
  const { products, setActivePage, setSelectedCategory } = useStore();

  const saleProducts = products.filter(p => p.isOnSale || (p.discountPercentage && p.discountPercentage > 0));

  return (
    <div className="py-10 bg-[#FAF8F5] min-h-screen text-right">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Promotional Hero Banner */}
        <div className="relative rounded-3xl overflow-hidden bg-[#4A3F35] text-white p-8 sm:p-12 shadow-xl border border-[#3B322A]">
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#A67C52]/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-2xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#A67C52] text-white text-xs font-black shadow-md">
              <Flame className="w-3.5 h-3.5" />
              <span>تخفيضات أزياء 4sHe الحصرية</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black leading-tight text-white">
              خصومات استثنائية تصل إلى 30%
            </h1>

            <p className="text-sm sm:text-base text-[#E8DDD5] leading-relaxed">
              استمتعي بأقوى العروض على تشكيلات الفساتين والأطقم الفاخرة بأسعار مميزة لفترة محدودة داخل فرعنا بأسواق المثنى، الموصل.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 text-xs text-white">
                <Clock className="w-4 h-4 text-[#E8DDD5]" />
                <span>العروض سارية حتى نفاد الكمية</span>
              </div>
            </div>
          </div>
        </div>

        {/* Offers Grid */}
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-[#E8E1DA] pb-4">
            <div>
              <h2 className="text-xl font-bold text-[#2D2621]">
                القطع المشمولة بالتخفيض ({saleProducts.length})
              </h2>
              <p className="text-xs text-[#8C7D73]">
                جميع القطع أصلية بجودة عالية ومرفق معها نسبة الخصم والسعر السابق
              </p>
            </div>
          </div>

          {saleProducts.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-[#E8E1DA] space-y-4">
              <Tag className="w-12 h-12 text-[#A69B91] mx-auto" />
              <h3 className="text-base font-bold text-[#2D2621]">لا توجد عروض حاليًا</h3>
              <p className="text-xs text-[#8C7D73]">ترقبي عروضنا القادمة قريبًا جدًا!</p>
              <button
                type="button"
                onClick={() => {
                  setSelectedCategory('all');
                  setActivePage('shop');
                }}
                className="px-6 py-2.5 rounded-xl bg-[#4A3F35] hover:bg-[#3B322A] text-white text-xs font-bold transition-colors cursor-pointer border border-[#6B5E54]/30"
              >
                تصفحي باقي المنتجات
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {saleProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
