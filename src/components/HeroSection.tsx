import React from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Sparkles, ShieldCheck, Truck, Star, Eye } from 'lucide-react';
import { useStore } from '../context/StoreContext';

export const HeroSection: React.FC = () => {
  const { setActivePage, setSelectedCategory } = useStore();

  return (
    <section className="relative overflow-hidden bg-[#241E1A] text-white">
      {/* Background Decorative Gradients and Elements */}
      <div className="absolute inset-0 bg-radial from-[#3E342B]/75 via-[#29221C] to-[#1C1713] opacity-90" />
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#A67C52]/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-10 w-80 h-80 bg-[#D7C4B7]/15 rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Right Column: Hero Copywriting & Actions */}
          <div className="lg:col-span-7 space-y-8 text-right z-10">
            {/* Store Location & Rating Badge */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs text-[#E8DDD5]"
            >
              <div className="flex items-center text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3 h-3 fill-amber-400" />
                ))}
              </div>
              <span className="font-bold text-white">5.0</span>
              <span className="text-white/40">•</span>
              <span>أسواق المثنى، الموصل</span>
            </motion.div>

            {/* Main Headline */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="space-y-4"
            >
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight sm:leading-tight">
                أناقتكِ تبدأ من هنا
                <span className="block text-transparent bg-clip-text bg-gradient-to-l from-[#D7C4B7] via-[#F4EBE8] to-white mt-1">
                  أزياء 4sHe
                </span>
              </h1>
              <p className="text-base sm:text-lg text-[#DCD3CB] max-w-2xl leading-relaxed">
                اختيارات فريدة من أجمل الفساتين، الأطقم الأنيقة، وملابس السهرة والمناسبات المصممة خصيصًا لتمنحكِ إطلالة ساحرة ومتميزة في كل لحظة.
              </p>
            </motion.div>

            {/* Call to Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex flex-wrap items-center gap-4 pt-2"
            >
              <button
                type="button"
                id="hero-shop-now-btn"
                onClick={() => {
                  setSelectedCategory('all');
                  setActivePage('shop');
                }}
                className="px-8 py-4 rounded-2xl bg-[#A67C52] hover:bg-[#916B44] text-white font-black text-sm tracking-wide shadow-xl shadow-[#A67C52]/25 hover:shadow-2xl hover:-translate-y-0.5 transition-all flex items-center gap-2 group cursor-pointer border border-[#C29B72]/40"
              >
                <span>تسوقي الآن</span>
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              </button>

              <button
                type="button"
                id="hero-new-collection-btn"
                onClick={() => {
                  setSelectedCategory('فساتين');
                  setActivePage('shop');
                }}
                className="px-7 py-4 rounded-2xl bg-white/10 hover:bg-white/15 text-white font-bold text-sm border border-white/20 backdrop-blur-md hover:-translate-y-0.5 transition-all flex items-center gap-2 cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-[#D7C4B7]" />
                <span>اكتشفي أحدث تشكيلاتنا</span>
              </button>
            </motion.div>

            {/* Trust Points */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="grid grid-cols-3 gap-3 pt-6 border-t border-white/10"
            >
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0 text-[#D7C4B7]">
                  <Truck className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">توصيل سريع</h4>
                  <p className="text-[11px] text-[#C2B5AA]">لكافة مناطق الموصل</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0 text-[#D7C4B7]">
                  <Eye className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">معاينة قبل الدفع</h4>
                  <p className="text-[11px] text-[#C2B5AA]">اطمئنان تام بالجودة</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0 text-[#D7C4B7]">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">دفع عند الاستلام</h4>
                  <p className="text-[11px] text-[#C2B5AA]">سهولة وسرعة</p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Left Column: Visual Showcase Card Grid */}
          <div className="lg:col-span-5 relative">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="relative mx-auto max-w-sm lg:max-w-none"
            >
              {/* Main Visual Image Card */}
              <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white/10 bg-[#352B23] aspect-[4/5] group">
                <img
                  src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=1000&auto=format&fit=crop&q=85"
                  alt="أزياء 4sHe - تشكيلات نسائية بالموصل"
                  className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#1C1713]/90 via-transparent to-transparent" />

                {/* Floating In-Image Badge */}
                <div className="absolute bottom-6 right-6 left-6 p-4 rounded-2xl bg-white/15 backdrop-blur-md border border-white/25 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="inline-block px-2 py-0.5 rounded-md bg-[#A67C52] text-white text-[10px] font-black mb-1">
                        تشكيلة الموسم الجديد
                      </span>
                      <h3 className="text-sm font-bold">أحدث صيحات الموضة التركية</h3>
                      <p className="text-xs text-[#E8DDD5]">متوفرة حصريًا في فرع المثنى</p>
                    </div>
                    <div className="text-left">
                      <span className="text-xs text-[#E8DDD5] block">تبدأ من</span>
                      <span className="text-base font-black text-amber-300">25,000 د.ع</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating Secondary Mini Card */}
              <div className="absolute -top-6 -left-6 bg-white p-3.5 rounded-2xl shadow-xl border border-[#E8E1DA] hidden sm:flex items-center gap-3 text-gray-900 animate-bounce duration-1000">
                <div className="w-10 h-10 rounded-xl bg-[#F4EBE8] text-[#4A3F35] flex items-center justify-center font-bold text-sm">
                  ✨
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-[#2D2621]">خصومات تصل إلى 30%</p>
                  <p className="text-[10px] text-[#8C7D73]">على فساتين المناسبات</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};
