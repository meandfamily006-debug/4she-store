import React from 'react';
import { MapPin, Phone, Clock, Star, ShieldCheck, Truck, Sparkles, Heart, ChevronLeft } from 'lucide-react';
import { useStore, ActivePage } from '../context/StoreContext';

export const Footer: React.FC = () => {
  const { setActivePage, setSelectedCategory, settings } = useStore();

  const handleNav = (page: ActivePage, cat?: string) => {
    if (cat) setSelectedCategory(cat);
    setActivePage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-[#241E1A] text-white border-t border-[#3B322A] text-right">
      {/* Upper Features Strip */}
      <div className="border-b border-white/10 py-8 bg-[#2D2621]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-white/5 border border-white/10 text-[#D7C4B7] flex items-center justify-center shrink-0">
                <Truck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">توصيل سريع للموصل والعراق</h4>
                <p className="text-[11px] text-[#D5C9C0]">3,000 د.ع بالموصل • 5,000 بالمحافظات</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-white/5 border border-white/10 text-[#D7C4B7] flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">فحص ومعاينة قبل الدفع</h4>
                <p className="text-[11px] text-[#D5C9C0]">اطمئنان تام بجودة القطع والمقاسات</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-white/5 border border-white/10 text-amber-400 flex items-center justify-center shrink-0">
                <Star className="w-5 h-5 fill-amber-400" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">تقييم 5.0 نجوم على الخرائط</h4>
                <p className="text-[11px] text-[#D5C9C0]">ثقة ورضا تام من زبوناتنا في نينوى</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-white/5 border border-white/10 text-[#D7C4B7] flex items-center justify-center shrink-0">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">مفتوح حتى 11:00 مساءً</h4>
                <p className="text-[11px] text-[#D5C9C0]">نستقبلكم يوميًا بفرع أسواق المثنى</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8">
          {/* Brand & Store Info */}
          <div className="lg:col-span-4 space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#4A3F35] to-[#2D2621] text-white flex items-center justify-center font-serif-brand font-bold text-xl shadow-md border border-[#6B5E54]/30">
                4s
              </div>
              <div>
                <span className="text-xl font-black tracking-tight text-white">أزياء</span>{' '}
                <span className="text-xl font-black text-[#D7C4B7] font-serif-brand">4sHe</span>
              </div>
            </div>

            <p className="text-xs text-[#D5C9C0] leading-relaxed max-w-sm">
              المتجر النسائي الأول في مدينة الموصل للأزياء الراقية، الفساتين التركية الفاخرة، والأطقم العصرية لجميع مناسباتكِ السعيدة.
            </p>

            <div className="space-y-2 text-xs text-[#E8DDD5] pt-2">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#D7C4B7] shrink-0" />
                <span>{settings?.storeAddress || 'أسواق المثنى، الموصل، نينوى، العراق'}</span>
              </div>

              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-[#D7C4B7] shrink-0" />
                <span className="font-mono dir-ltr text-right">{settings?.storePhone || '0770 744 0557'}</span>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="text-xs font-bold text-white tracking-wider border-b border-white/10 pb-2">
              روابط سريعة
            </h4>
            <ul className="space-y-2 text-xs text-[#D5C9C0]">
              <li>
                <button
                  type="button"
                  onClick={() => handleNav('home')}
                  className="hover:text-white transition-colors"
                >
                  الرئيسية
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => handleNav('shop')}
                  className="hover:text-white transition-colors"
                >
                  كافة المنتجات
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => handleNav('offers')}
                  className="hover:text-white transition-colors text-[#D7C4B7] font-bold"
                >
                  العروض والتخفيضات
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => handleNav('about')}
                  className="hover:text-white transition-colors"
                >
                  عن أزياء 4sHe
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => handleNav('contact')}
                  className="hover:text-white transition-colors"
                >
                  تواصل معنا
                </button>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="text-xs font-bold text-white tracking-wider border-b border-white/10 pb-2">
              أبرز التصنيفات
            </h4>
            <ul className="space-y-2 text-xs text-[#D5C9C0]">
              <li>
                <button
                  type="button"
                  onClick={() => handleNav('shop', 'فساتين')}
                  className="hover:text-white transition-colors"
                >
                  فساتين سهرة ومناسبات
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => handleNav('shop', 'أطقم أنيقة')}
                  className="hover:text-white transition-colors"
                >
                  أطقم وبدلات نسائية راقية
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => handleNav('shop', 'بلايز وقمصان')}
                  className="hover:text-white transition-colors"
                >
                  بلايز وقمصان شيك
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => handleNav('shop', 'عبايات وكيمونو')}
                  className="hover:text-white transition-colors"
                >
                  عبايات وكيمونو عصري
                </button>
              </li>
            </ul>
          </div>

          {/* Policies & Assistance */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="text-xs font-bold text-white tracking-wider border-b border-white/10 pb-2">
              خدمة العملاء والسياسات
            </h4>
            <ul className="space-y-2 text-xs text-[#D5C9C0]">
              <li>
                <button
                  type="button"
                  onClick={() => handleNav('policies')}
                  className="hover:text-white transition-colors"
                >
                  سياسة الاسترجاع والاستبدال
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => handleNav('policies')}
                  className="hover:text-white transition-colors"
                >
                  أجور ومناطق الشحن والتوصيل
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => handleNav('policies')}
                  className="hover:text-white transition-colors"
                >
                  الخصوصية وسرية البيانات
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => handleNav('admin')}
                  className="hover:text-[#E8DDD5] transition-colors text-[#C29B72] font-semibold"
                >
                  دخول لوحة الإدارة
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Copyright */}
        <div className="mt-10 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between text-xs text-[#A69B91] gap-4">
          <p>© {new Date().getFullYear()} أزياء 4sHe • الموصل، أسواق المثنى. جميع الحقوق محفوظة.</p>
          <p className="flex items-center gap-1">
            صُمم بكل <Heart className="w-3.5 h-3.5 text-[#A67C52] fill-[#A67C52]" /> لسيدات وفتيات الموصل والعراق
          </p>
        </div>
      </div>
    </footer>
  );
};
