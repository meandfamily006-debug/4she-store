import React from 'react';
import { motion } from 'motion/react';
import { Sparkles, MapPin, Phone, Star, ShieldCheck, Heart, Clock, Award, CheckCircle2 } from 'lucide-react';
import { useStore } from '../context/StoreContext';

export const AboutUsView: React.FC = () => {
  const { settings, setActivePage } = useStore();

  return (
    <div className="py-12 bg-[#FAF8F5] min-h-screen text-right">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Hero Section */}
        <div className="relative rounded-3xl overflow-hidden bg-[#4A3F35] text-white p-8 sm:p-14 shadow-xl border border-[#3B322A]">
          <div className="max-w-2xl space-y-4 relative z-10">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-[#E8DDD5] text-xs font-bold backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5 text-[#E8DDD5]" />
              <span>قصتنا في مدينة الموصل</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black leading-tight text-white">
              أزياء 4sHe • عنوان الأناقة النسائية الراقية
            </h1>

            <p className="text-sm sm:text-base text-[#E8DDD5] leading-relaxed">
              انطلق متجر **"أزياء 4sHe"** من قلب مدينة الموصل العريقة (أسواق المثنى) بهدف تقديم تجربة تسوق نسائية متكاملة تجمع بين الفخامة المعاصرة، الأقمشة الفاخرة، والذوق الرفيع.
            </p>
          </div>
        </div>

        {/* Story & Store Facts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Story Column */}
          <div className="lg:col-span-2 bg-white rounded-3xl p-6 sm:p-10 border border-[#E8E1DA] shadow-xs space-y-6">
            <h2 className="text-2xl font-black text-[#2D2621] border-b border-[#E8E1DA] pb-4">
              من نحن ورسالتنا
            </h2>

            <p className="text-sm text-[#5C5046] leading-relaxed">
              في متجر <strong>أزياء 4sHe</strong>، نؤمن بأن كل امرأة تستحق أن تشعر بالتميز والثقة في إطلالتها. نحرص على انتقاء أرقى الفساتين، الأطقم الرسمية والكاجوال، والملابس النسائية ذات الجودة العالية من أرقى بيوت الموضة التركية والعالمية.
            </p>

            <p className="text-sm text-[#5C5046] leading-relaxed">
              يقع متجرنا الفعلي في <strong>أسواق المثنى بمدينة الموصل، محافظة نينوى</strong>، حيث نستقبل زبوناتنا يوميًا حتى الساعة 11:00 مساءً، ونوفر أيضًا خدمة الطلب والتوصيل السريع للمنازل داخل كافة أحياء الموصل وجميع محافظات العراق.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-[#E8E1DA]">
              <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#E8E1DA] space-y-1">
                <div className="flex items-center gap-2 text-[#4A3F35] font-bold text-sm">
                  <CheckCircle2 className="w-4 h-4 text-[#A67C52]" />
                  <span>معاينة وفحص قبل الدفع</span>
                </div>
                <p className="text-xs text-[#8C7D73]">لكِ كامل الحرية في التأكد من مقاس وجودة القطعة قبل الدفع للمندوب</p>
              </div>

              <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#E8E1DA] space-y-1">
                <div className="flex items-center gap-2 text-[#4A3F35] font-bold text-sm">
                  <Award className="w-4 h-4 text-[#A67C52]" />
                  <span>أقمشة وتصاميم مختارة</span>
                </div>
                <p className="text-xs text-[#8C7D73]">نلتزم بأعلى معايير الخياطة والأقمشة المريحة والمناسبة لجميع الأذواق</p>
              </div>
            </div>
          </div>

          {/* Location & Contact Summary */}
          <div className="space-y-6">
            {/* Google Maps Rating Card */}
            <div className="bg-white rounded-3xl p-6 border border-[#E8E1DA] shadow-xs text-center space-y-4">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#F2EAE4] text-[#A67C52] mx-auto border border-[#E8DDD5]">
                <Star className="w-8 h-8 fill-[#A67C52]" />
              </div>
              <div className="space-y-1">
                <div className="text-3xl font-black text-[#2D2621]">5.0 / 5.0</div>
                <div className="flex justify-center text-[#A67C52] gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-[#A67C52]" />
                  ))}
                </div>
                <p className="text-xs text-[#8C7D73]">تقييم ممتاز على خرائط Google Maps</p>
              </div>
            </div>

            {/* Visit Details */}
            <div className="bg-[#4A3F35] text-white rounded-3xl p-6 space-y-4 border border-[#3B322A]">
              <h3 className="text-sm font-bold border-b border-white/15 pb-2 text-white">
                معلومات زيارة الفرع
              </h3>

              <div className="space-y-3 text-xs">
                <div className="flex items-start gap-2.5">
                  <MapPin className="w-4 h-4 text-[#E8DDD5] shrink-0 mt-0.5" />
                  <div>
                    <strong className="block text-white">الموقع:</strong>
                    <span className="text-[#E8DDD5]">{settings.storeAddress}</span>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <Clock className="w-4 h-4 text-[#E8DDD5] shrink-0 mt-0.5" />
                  <div>
                    <strong className="block text-white">ساعات العمل:</strong>
                    <span className="text-[#E8DDD5]">{settings.workingHours}</span>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <Phone className="w-4 h-4 text-[#E8DDD5] shrink-0 mt-0.5" />
                  <div>
                    <strong className="block text-white">رقم الهاتف / واتساب:</strong>
                    <span className="text-[#E8DDD5] font-mono dir-ltr text-right block">{settings.storePhone}</span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setActivePage('shop')}
                className="w-full py-3 bg-[#FAF8F5] text-[#4A3F35] hover:bg-[#F2EAE4] rounded-2xl font-bold text-xs transition-colors cursor-pointer border border-[#E8E1DA]"
              >
                تصفحي المتجر الإلكتروني
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
