import React from 'react';
import { motion } from 'motion/react';
import { Sparkles, ArrowLeft, Star, Heart, MapPin, Phone, MessageSquare, ShieldCheck, Truck, Clock } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { HeroSection } from '../components/HeroSection';
import { CategoriesSection } from '../components/CategoriesSection';
import { ProductCard } from '../components/ProductCard';
import { formatIQD } from '../utils/formatters';

export const HomeView: React.FC = () => {
  const { products, setActivePage, setSelectedCategory, settings } = useStore();

  const newArrivals = products.filter(p => p.isNew).slice(0, 4);
  const bestSellers = products.slice(0, 4);
  const saleProducts = products.filter(p => p.isOnSale || (p.discountPercentage && p.discountPercentage > 0)).slice(0, 4);

  const whatsappUrl = `https://wa.me/9647707440557?text=${encodeURIComponent('مرحبًا أزياء 4sHe، أود الاستفسار عن التشكيلات الجديدة في فرع أسواق المثنى')}`;

  return (
    <div className="space-y-16 pb-16">
      {/* 1. Main Hero Banner */}
      <HeroSection />

      {/* 2. Interactive Category Browser */}
      <CategoriesSection />

      {/* 3. New Arrivals Showcase */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-3 text-right">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#f8edf1] text-[#5a1e35] text-xs font-bold mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>تشكيلة الموسم الجديد</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-gray-900">
              الأحدث وصولًا إلى أزياء 4sHe
            </h2>
            <p className="text-xs text-gray-500 mt-1">
              أحدث موديلات الفساتين والأطقم التركية الواصلة حديثًا لفرعنا بالموصل
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              setSelectedCategory('all');
              setActivePage('shop');
            }}
            className="inline-flex items-center gap-2 text-xs font-bold text-[#5a1e35] hover:text-[#431424] hover:underline self-start sm:self-auto"
          >
            <span>عرض كافة الموديلات</span>
            <ArrowLeft className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {(newArrivals.length > 0 ? newArrivals : products.slice(0, 4)).map(prod => (
            <ProductCard key={prod.id} product={prod} />
          ))}
        </div>
      </section>

      {/* 4. Promotional Special Offer Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-[#2f101c] via-[#4d192c] to-[#6e233f] text-white p-8 sm:p-12 shadow-xl border border-[#782845]/30">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
            <div className="md:col-span-8 space-y-4 text-right">
              <span className="inline-block px-3 py-1 rounded-full bg-rose-500 text-white text-xs font-black">
                عروض حصرية محدودة 🏷️
              </span>
              <h2 className="text-2xl sm:text-4xl font-black leading-tight">
                تألقي بأرقى فساتين السهرة والمناسبات بخصم يصل إلى 30%
              </h2>
              <p className="text-xs sm:text-sm text-[#eed0d9] max-w-xl">
                تصاميم استثنائية تناسب ذوقكِ الرفيع في حفلات التخرج والأعراس والمناسبات الخاصة مع خدمة التوصيل السريع لجميع مناطق الموصل
              </p>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setActivePage('offers')}
                  className="px-7 py-3.5 rounded-2xl bg-white text-[#5a1e35] hover:bg-[#eed0d9] font-black text-xs shadow-lg transition-all flex items-center gap-2 cursor-pointer"
                >
                  <span>استكشفي عروض التخفيض</span>
                  <ArrowLeft className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="md:col-span-4 flex justify-center">
              <div className="p-6 rounded-3xl bg-white/10 backdrop-blur-md border border-white/20 text-center space-y-2 max-w-xs">
                <Star className="w-8 h-8 text-amber-400 fill-amber-400 mx-auto" />
                <h3 className="text-base font-bold text-white">ضمان الجودة العالية</h3>
                <p className="text-xs text-[#eed0d9]">
                  معاينة وفحص القطعة مع مندوب التوصيل قبل الدفع
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Best Sellers Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-3 text-right">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#f8edf1] text-[#5a1e35] text-xs font-bold mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>الأكثر طلبًا</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-gray-900">
              القطع المفضلة لدى زبونات الموصل
            </h2>
            <p className="text-xs text-gray-500 mt-1">
              القطع التي حازت على أعلى تقييمات وإعجاب زبوناتنا في أسواق المثنى
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              setSelectedCategory('all');
              setActivePage('shop');
            }}
            className="inline-flex items-center gap-2 text-xs font-bold text-[#5a1e35] hover:text-[#431424] hover:underline self-start sm:self-auto"
          >
            <span>مشاهدة كل الموديلات</span>
            <ArrowLeft className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {bestSellers.map(prod => (
            <ProductCard key={prod.id} product={prod} />
          ))}
        </div>
      </section>

      {/* 6. Mosul Store Visit & Customer Satisfaction Section */}
      <section className="bg-white py-14 border-y border-[#eedfd9]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Store Information */}
            <div className="lg:col-span-6 space-y-6 text-right">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#fcedf1] text-[#5a1e35] text-xs font-bold">
                <MapPin className="w-4 h-4" />
                <span>فرعنا الفعلي في أسواق المثنى</span>
              </div>

              <h2 className="text-2xl sm:text-4xl font-black text-gray-900 leading-tight">
                أزياء 4sHe ترحب بكم في قلب مدينة الموصل
              </h2>

              <p className="text-sm text-gray-600 leading-relaxed">
                يسعدنا دائمًا استقبالكم في فرعنا بأسواق المثنى لتجربة المقاسات والاطلاع على تشكيلاتنا المتجددة أسبوعيًا. كما نوفر خدمة توصيل سريعة ومباشرة إلى باب منزلكِ في كافة أحياء الموصل.
              </p>

              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="p-3.5 rounded-2xl bg-gray-50 border border-gray-100 space-y-1">
                  <div className="flex items-center gap-1.5 text-amber-500 font-bold">
                    <Star className="w-4 h-4 fill-amber-400" />
                    <span>تقييم 5.0 من 5</span>
                  </div>
                  <p className="text-gray-500 text-[11px]">على Google Maps</p>
                </div>

                <div className="p-3.5 rounded-2xl bg-gray-50 border border-gray-100 space-y-1">
                  <div className="flex items-center gap-1.5 text-[#5a1e35] font-bold">
                    <Clock className="w-4 h-4" />
                    <span>مفتوح حتى 11:00 م</span>
                  </div>
                  <p className="text-gray-500 text-[11px]">يوميًا طيلة الأسبوع</p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-5 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors flex items-center gap-2"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>تواصل مباشر عبر الواتساب</span>
                </a>

                <button
                  type="button"
                  onClick={() => setActivePage('contact')}
                  className="px-5 py-3 rounded-2xl bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold transition-colors"
                >
                  معلومات الموقع والخريطة
                </button>
              </div>
            </div>

            {/* Customer Testimonial & Review Cards */}
            <div className="lg:col-span-6 space-y-4">
              <div className="p-6 rounded-3xl bg-[#faf6f5] border border-[#eedfd9] space-y-3 text-right">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-amber-400">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400" />
                    ))}
                  </div>
                  <span className="text-[11px] text-gray-400">مراجعة موثقة</span>
                </div>
                <p className="text-xs text-gray-700 leading-relaxed font-medium">
                  "أجمل متجر ملابس نسائية في أسواق المثنى بالموصل! الفساتين فخمة جدًا والأقمشة تركية ممتازة والتوصيل للمنزل كان سريع ومرتب."
                </p>
                <div className="flex items-center justify-between text-xs border-t border-[#ebd8d0] pt-2">
                  <span className="font-bold text-gray-900">زبونة من حي الزهور، الموصل</span>
                  <span className="text-gray-400 font-mono text-[10px]">Google Maps Review</span>
                </div>
              </div>

              <div className="p-6 rounded-3xl bg-white border border-[#eedfd9] shadow-xs space-y-3 text-right">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-amber-400">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400" />
                    ))}
                  </div>
                  <span className="text-[11px] text-gray-400">مراجعة حديثة</span>
                </div>
                <p className="text-xs text-gray-700 leading-relaxed font-medium">
                  "خدمة المعاينة قبل الدفع ممتازة ومريحة جدًا، والمقاس طلع مضبوط تمامًا مثل الوصف على الموقع. شكرًا أزياء 4sHe."
                </p>
                <div className="flex items-center justify-between text-xs border-t border-gray-100 pt-2">
                  <span className="font-bold text-gray-900">زبونة من حي المهندسين، الموصل</span>
                  <span className="text-emerald-700 font-bold text-[10px]">طلب مكتمل ومستلم ✓</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
