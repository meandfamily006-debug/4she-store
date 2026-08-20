import React from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Sparkles } from 'lucide-react';
import { useStore } from '../context/StoreContext';

export const CategoriesSection: React.FC = () => {
  const { categories, setSelectedCategory, setActivePage } = useStore();

  const handleCategoryClick = (catName: string) => {
    setSelectedCategory(catName);
    setActivePage('shop');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <section className="py-16 bg-[#FAF6F1] border-b border-[#E8E1DA]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div className="text-right space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F2EAE4] text-[#4A3F35] text-xs font-bold border border-[#E8DDD5]">
              <Sparkles className="w-3.5 h-3.5 text-[#A67C52]" />
              <span>تسوقي حسب التصنيف</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-[#2D2621]">
              تصنيفات أزياء 4sHe
            </h2>
            <p className="text-sm text-[#736458] max-w-xl">
              تصفحي مجموعاتنا المختارة بعناية لتجدي ما يناسب ذوقكِ الرفيع في كافة الإطلالات
            </p>
          </div>

          <button
            type="button"
            id="view-all-categories-btn"
            onClick={() => {
              setSelectedCategory('all');
              setActivePage('shop');
            }}
            className="self-start md:self-auto inline-flex items-center gap-2 text-xs font-bold text-[#A67C52] hover:text-[#4A3F35] hover:underline"
          >
            <span>عرض كل المنتجات</span>
            <ArrowLeft className="w-4 h-4" />
          </button>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-6">
          {categories.map((cat, idx) => (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              onClick={() => handleCategoryClick(cat.name)}
              className="group cursor-pointer flex flex-col items-center text-center bg-white p-3 rounded-2xl border border-[#E8E1DA] hover:border-[#A67C52]/50 hover:shadow-md transition-all duration-300"
              id={`category-card-${cat.id}`}
            >
              <div className="relative w-full aspect-square rounded-xl overflow-hidden mb-3 bg-[#F2EAE4]">
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>

              <h3 className="text-sm font-bold text-[#2D2621] group-hover:text-[#A67C52] transition-colors">
                {cat.name}
              </h3>
              <p className="text-[11px] text-[#8C7D73] mt-0.5">
                {cat.itemCount} قطعة متوفرة
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
