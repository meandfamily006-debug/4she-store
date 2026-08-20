import React, { useState } from 'react';
import {
  ShieldCheck,
  Truck,
  RotateCcw,
  FileText,
  CheckCircle2,
  AlertCircle,
  Clock,
  MapPin,
  MessageCircle,
  HelpCircle,
  RefreshCw,
  Sparkles,
  PackageCheck
} from 'lucide-react';
import { useStore } from '../context/StoreContext';

export const PoliciesView: React.FC = () => {
  const { settings } = useStore();
  const [activeTab, setActiveTab] = useState<'returns' | 'shipping' | 'privacy' | 'terms'>('returns');

  return (
    <div className="py-12 bg-[#FAF8F5] min-h-screen text-right" id="policies-page">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header */}
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F2EAE4] text-[#A67C52] text-xs font-bold border border-[#E8DDD5]">
            <Sparkles className="w-3.5 h-3.5" />
            <span>خدمة زبوناتنا وشفافية التعامل أولويتنا</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-[#2D2621]">
            سياسات وقوانين متجر أزياء 4sHe
          </h1>
          <p className="text-sm text-[#8C7D73] max-w-2xl leading-relaxed">
            دليلكِ الشامل لسياسة الاسترجاع والاستبدال المرنة، أجور التوصيل لمدينة الموصل وكافة محافظات العراق، وحماية الخصوصية لضمان تجربة تسوق مريحة وموثوقة.
          </p>
        </div>

        {/* Tab Buttons */}
        <div className="flex flex-wrap gap-2 border-b border-[#E8E1DA] pb-3">
          <button
            type="button"
            onClick={() => setActiveTab('returns')}
            className={`px-5 py-3 rounded-2xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2.5 cursor-pointer ${
              activeTab === 'returns'
                ? 'bg-[#4A3F35] text-white shadow-md'
                : 'bg-white text-[#5C5046] hover:bg-[#F2EAE4] border border-[#E8E1DA]'
            }`}
          >
            <RotateCcw className="w-4 h-4" />
            <span>سياسة الاسترجاع والاستبدال</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('shipping')}
            className={`px-5 py-3 rounded-2xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2.5 cursor-pointer ${
              activeTab === 'shipping'
                ? 'bg-[#4A3F35] text-white shadow-md'
                : 'bg-white text-[#5C5046] hover:bg-[#F2EAE4] border border-[#E8E1DA]'
            }`}
          >
            <Truck className="w-4 h-4" />
            <span>سياسة الشحن والتوصيل</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('privacy')}
            className={`px-5 py-3 rounded-2xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2.5 cursor-pointer ${
              activeTab === 'privacy'
                ? 'bg-[#4A3F35] text-white shadow-md'
                : 'bg-white text-[#5C5046] hover:bg-[#F2EAE4] border border-[#E8E1DA]'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>سياسة الخصوصية والأمان</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('terms')}
            className={`px-5 py-3 rounded-2xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2.5 cursor-pointer ${
              activeTab === 'terms'
                ? 'bg-[#4A3F35] text-white shadow-md'
                : 'bg-white text-[#5C5046] hover:bg-[#F2EAE4] border border-[#E8E1DA]'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>الشروط والأحكام العامة</span>
          </button>
        </div>

        {/* Tab Content Panels */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-[#E8E1DA] shadow-xs space-y-8 text-sm text-[#5C5046] leading-relaxed">
          {activeTab === 'returns' && (
            <div className="space-y-8">
              <div className="border-b border-[#E8E1DA] pb-6 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-[#F2EAE4] text-[#A67C52] flex items-center justify-center shrink-0">
                    <RotateCcw className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-xl sm:text-2xl font-black text-[#2D2621]">
                      سياسة الاسترجاع والاستبدال المرنة
                    </h2>
                    <p className="text-xs sm:text-sm text-[#8C7D73]">
                      تسوقي بثقة واطمئنان تام.. رضاكِ وسعادتكِ بالقطع المختارة هي غايتنا الأولى
                    </p>
                  </div>
                </div>
              </div>

              {/* Highlight Box: Inspection on Delivery */}
              <div className="p-5 rounded-2xl bg-[#FBF7F2] border border-[#E8DDD5] flex flex-col sm:flex-row items-start gap-4">
                <div className="p-3 rounded-xl bg-[#A67C52] text-white shrink-0">
                  <PackageCheck className="w-6 h-6" />
                </div>
                <div className="space-y-1.5 flex-1">
                  <h3 className="text-base font-bold text-[#2D2621]">
                    ميزة المعاينة المجانية المباشرة عند الاستلام
                  </h3>
                  <p className="text-xs sm:text-sm text-[#6B5E54] leading-relaxed">
                    يحق لكِ معاينة ومطابقة القطعة والتحقق من القماش والمقاس واللون فور وصول مندوب التوصيل إلى باب منزلكِ وقبل دفع المبلغ. إذا لم تناسبكِ القطعة، يمكنكِ إرجاعها مباشرة مع المندوب مع دفع أجور التوصيل فقط، دون أي إجراءات إضافية!
                  </p>
                </div>
              </div>

              {/* Timeframes & Key Rules */}
              <div className="space-y-4">
                <h3 className="text-base font-bold text-[#2D2621] flex items-center gap-2">
                  <Clock className="w-5 h-5 text-[#A67C52]" />
                  <span>المدد الزمنية للاستبدال والاسترجاع</span>
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#E8E1DA] space-y-2">
                    <div className="flex items-center gap-2 text-[#4A3F35] font-bold text-sm">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#A67C52]" />
                      <span>مدة الاستبدال (مقاس أو موديل بديل)</span>
                    </div>
                    <p className="text-xs text-[#6B5E54]">
                      يمكنكِ طلب استبدال المقاس أو تغيير الموديل خلال مدة أقصاها <strong>3 أيام (72 ساعة)</strong> من تاريخ استلام الشحنة.
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#E8E1DA] space-y-2">
                    <div className="flex items-center gap-2 text-[#4A3F35] font-bold text-sm">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#A67C52]" />
                      <span>مدة الاسترجاع واسترداد المبلغ</span>
                    </div>
                    <p className="text-xs text-[#6B5E54]">
                      في حال رغبتكِ بإرجاع القطعة واسترداد المبلغ، يمكنكِ تقديم الطلب خلال <strong>48 ساعة</strong> من استلام الطلبية.
                    </p>
                  </div>
                </div>
              </div>

              {/* Conditions */}
              <div className="space-y-4">
                <h3 className="text-base font-bold text-[#2D2621] flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-[#A67C52]" />
                  <span>شروط قبول طلب الاستبدال أو الإرجاع</span>
                </h3>

                <ul className="space-y-3 text-xs sm:text-sm">
                  <li className="p-3.5 rounded-xl bg-[#FAF8F5] border border-[#E8E1DA] flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-[#2D2621] block font-bold mb-0.5">الحالة الأصلية للملابس:</strong>
                      <span>يجب أن تكون القطعة بحالتها الأصلية الجديدة تماماً، غير مستعملة، غير مغسولة، وخالية من أي روائح عطور، مكياج، أو أي تعديلات في الخياطة.</span>
                    </div>
                  </li>

                  <li className="p-3.5 rounded-xl bg-[#FAF8F5] border border-[#E8E1DA] flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-[#2D2621] block font-bold mb-0.5">البطاقات والتغليف:</strong>
                      <span>يجب أن تظل جميع بطاقات الماركة (Tag/Labels) والكود التعريفي مثبتة على القطعة مع الحفاظ على كيس التغليف الخاص بها.</span>
                    </div>
                  </li>

                  <li className="p-3.5 rounded-xl bg-[#FAF8F5] border border-[#E8E1DA] flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-[#2D2621] block font-bold mb-0.5">إثبات الشراء:</strong>
                      <span>إبراز رقم الطلب (مثل 4SHE-XXXX) أو وصل الاستلام المرفق مع الطلب أو رقم الهاتف المسجل به الطلب.</span>
                    </div>
                  </li>

                  <li className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <strong className="block font-bold mb-0.5">المنتجات المستثناة من الإرجاع:</strong>
                      <span>حرصاً على الصحة والسلامة العامة، لا تشمل سياسة الاسترجاع الملابس الداخلية، اللانجري، والإكسسوارات الملامسة للبشرة إلا في حال وجود عيب مصنعي مثبت.</span>
                    </div>
                  </li>
                </ul>
              </div>

              {/* Step-by-Step Return Procedures */}
              <div className="space-y-4">
                <h3 className="text-base font-bold text-[#2D2621] flex items-center gap-2">
                  <RefreshCw className="w-5 h-5 text-[#A67C52]" />
                  <span>خطوات وإجراءات الاستبدال والإرجاع (4 خطوات سهلة)</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#E8E1DA] space-y-2">
                    <span className="w-8 h-8 rounded-full bg-[#4A3F35] text-white font-bold flex items-center justify-center text-xs">
                      1
                    </span>
                    <h4 className="font-bold text-[#2D2621] text-xs sm:text-sm">التواصل مع خدمة الزبائن</h4>
                    <p className="text-xs text-[#6B5E54]">
                      تواصلي معنا عبر واتساب أو الهاتف على الرقم <strong className="font-mono">{settings?.storePhone || '0770 744 0557'}</strong> وزودينا برقم الطلب والسبب.
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#E8E1DA] space-y-2">
                    <span className="w-8 h-8 rounded-full bg-[#4A3F35] text-white font-bold flex items-center justify-center text-xs">
                      2
                    </span>
                    <h4 className="font-bold text-[#2D2621] text-xs sm:text-sm">تأكيد الموديل أو المقاس البديل</h4>
                    <p className="text-xs text-[#6B5E54]">
                      سيقوم فريقنا بحجز المقاس أو اللون البديل لكِ فوراً أو تنسيق استرداد المبلغ بحسب رغبتكِ.
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#E8E1DA] space-y-2">
                    <span className="w-8 h-8 rounded-full bg-[#4A3F35] text-white font-bold flex items-center justify-center text-xs">
                      3
                    </span>
                    <h4 className="font-bold text-[#2D2621] text-xs sm:text-sm">طريقة تسليم القطعة</h4>
                    <p className="text-xs text-[#6B5E54]">
                      <strong>خيار 1 (الموصل):</strong> التفضل بزيارة فرعنا في أسواق المثنى للاستبدال المباشر مجاناً.<br />
                      <strong>خيار 2:</strong> إرسال مندوب الشحن لاستلامها من منزلكِ.
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#E8E1DA] space-y-2">
                    <span className="w-8 h-8 rounded-full bg-[#4A3F35] text-white font-bold flex items-center justify-center text-xs">
                      4
                    </span>
                    <h4 className="font-bold text-[#2D2621] text-xs sm:text-sm">الفحص والاستلام النهائي</h4>
                    <p className="text-xs text-[#6B5E54]">
                      يتم تسليمكِ القطعة البديلة أو تحويل المبلغ لكِ (عبر زين كاش أو نقدياً) خلال 24 إلى 48 ساعة بعد فحص القطعة.
                    </p>
                  </div>
                </div>
              </div>

              {/* Delivery Cost Responsibility */}
              <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 space-y-2 text-xs sm:text-sm">
                <h4 className="font-bold text-emerald-950 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                  <span>من يتحمل أجور التوصيل في الاستبدال والإرجاع؟</span>
                </h4>
                <p>
                  • <strong>في حال وجود عيب مصنعي أو خطأ في تجهيز الطلب:</strong> يتحمل متجر أزياء 4sHe كافة أجور التوصيل والشحن ذهاباً وإياباً دون أن تدفعي أي دينار إضافي.
                </p>
                <p>
                  • <strong>في حال رغبة الزبونة في تغيير المقاس أو اللون لسبب شخصي:</strong> تتحمل الزبونة أجور التوصيل الرمزية (3,000 د.ع داخل الموصل / 5,000 د.ع لباقي المحافظات)، أو يمكنها الاستبدال مجاناً بزيارة فرعنا.
                </p>
              </div>

              {/* Direct Support Contact CTA */}
              <div className="p-6 rounded-3xl bg-[#4A3F35] text-white flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="space-y-1 text-center sm:text-right">
                  <h4 className="text-base font-bold">هل لديكِ استفسار أو ترغبين بطلب استبدال الآن؟</h4>
                  <p className="text-xs text-[#E8DDD5]">
                    فريق خدمة العملاء متواجد لمساعدتكِ يومياً من 10:00 صباحاً حتى 10:00 مساءً
                  </p>
                </div>

                <a
                  href={`https://wa.me/964${(settings?.whatsappPhone || '07707440557').replace(/[^0-9]/g, '')}?text=${encodeURIComponent('مرحباً أزياء 4sHe، أود الاستفسار عن استبدال/استرجاع طلبية')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-3 rounded-2xl bg-[#A67C52] hover:bg-[#916B44] text-white font-bold text-xs sm:text-sm flex items-center gap-2 shrink-0 shadow-md transition-all cursor-pointer border border-[#C29B72]/40"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>تواصل مباشر عبر واتساب</span>
                </a>
              </div>
            </div>
          )}

          {activeTab === 'shipping' && (
            <div className="space-y-6">
              <div className="border-b border-[#E8E1DA] pb-4 space-y-2">
                <h2 className="text-xl sm:text-2xl font-black text-[#2D2621] flex items-center gap-2">
                  <Truck className="w-6 h-6 text-[#A67C52]" />
                  <span>سياسة الشحن والتوصيل لكافة المحافظات</span>
                </h2>
                <p className="text-xs text-[#8C7D73]">
                  أسرع خدمة توصيل للمنازل مع شبكة مناديب محترفين في الموصل وجميع محافظات العراق
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-5 bg-[#FAF8F5] rounded-2xl border border-[#E8E1DA] space-y-2">
                  <div className="flex items-center justify-between">
                    <strong className="text-[#2D2621] text-sm font-bold block">داخل مدينة الموصل (محافظة نينوى)</strong>
                    <span className="px-2.5 py-1 rounded-lg bg-[#4A3F35] text-white text-xs font-bold font-mono">
                      {settings?.mosulDeliveryFee ? `${settings.mosulDeliveryFee.toLocaleString('ar-IQ')} د.ع` : '3,000 د.ع'}
                    </span>
                  </div>
                  <p className="text-xs text-[#6B5E54]">
                    توصيل فوري وبنفس اليوم أو خلال 24 ساعة كحد أقصى لكافة أحياء الجانبين الأيمن والأيسر.
                  </p>
                </div>

                <div className="p-5 bg-[#FAF8F5] rounded-2xl border border-[#E8E1DA] space-y-2">
                  <div className="flex items-center justify-between">
                    <strong className="text-[#2D2621] text-sm font-bold block">كافة محافظات العراق</strong>
                    <span className="px-2.5 py-1 rounded-lg bg-[#A67C52] text-white text-xs font-bold font-mono">
                      {settings?.otherGovernoratesDeliveryFee ? `${settings.otherGovernoratesDeliveryFee.toLocaleString('ar-IQ')} د.ع` : '5,000 د.ع'}
                    </span>
                  </div>
                  <p className="text-xs text-[#6B5E54]">
                    يشمل بغداد، أربيل، دهوك، كركوك، البصرة، النجف، كربلاء وكافة المحافظات خلال 48 إلى 72 ساعة.
                  </p>
                </div>
              </div>

              <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 text-emerald-900 flex items-center gap-3">
                <Sparkles className="w-5 h-5 text-emerald-600 shrink-0" />
                <p className="text-xs sm:text-sm">
                  <strong>عرض التوصيل المجاني:</strong> عند شرائكِ بقيمة <strong>{settings?.freeDeliveryThreshold ? `${settings.freeDeliveryThreshold.toLocaleString('ar-IQ')} دينار عراقي` : '100,000 دينار عراقي'}</strong> أو أكثر، يكون التوصيل <strong>مجاناً بالكامل</strong> لكافة المحافظات!
                </p>
              </div>
            </div>
          )}

          {activeTab === 'privacy' && (
            <div className="space-y-6">
              <div className="border-b border-[#E8E1DA] pb-4 space-y-2">
                <h2 className="text-xl sm:text-2xl font-black text-[#2D2621] flex items-center gap-2">
                  <ShieldCheck className="w-6 h-6 text-[#A67C52]" />
                  <span>سياسة الخصوصية وسرية البيانات</span>
                </h2>
                <p className="text-xs text-[#8C7D73]">
                  خصوصيتكِ مقدسة لدينا ومعلوماتكِ محمية بأعلى درجات الأمان
                </p>
              </div>

              <div className="space-y-3 text-xs sm:text-sm">
                <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#E8E1DA]">
                  <strong className="text-[#2D2621] block mb-1">البيانات التي نجمعها:</strong>
                  <span>نطلب فقط الاسم ورقم الهاتف والعنوان بهدف إيصال الطلبيات وتوثيق حسابكِ الشخصي.</span>
                </div>
                <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#E8E1DA]">
                  <strong className="text-[#2D2621] block mb-1">عدم مشاركة البيانات:</strong>
                  <span>نلتزم بشكل قاطع بعدم بيع أو مشاركة أي من بيانات زبوناتنا مع أي طرف ثالث أو شبكة إعلانية.</span>
                </div>
                <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#E8E1DA]">
                  <strong className="text-[#2D2621] block mb-1">التواصل الآمن:</strong>
                  <span>يتم إرسال رسائل الإشعارات أو رمز التحقق وتحديثات الطلبات فقط عبر القنوات الرسمية لمتجرنا.</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'terms' && (
            <div className="space-y-6">
              <div className="border-b border-[#E8E1DA] pb-4 space-y-2">
                <h2 className="text-xl sm:text-2xl font-black text-[#2D2621] flex items-center gap-2">
                  <FileText className="w-6 h-6 text-[#A67C52]" />
                  <span>الشروط والأحكام العامة للمتجر</span>
                </h2>
                <p className="text-xs text-[#8C7D73]">
                  القواعد المنظمة لعمليات الشراء والطلبيات عبر متجر أزياء 4sHe
                </p>
              </div>

              <ul className="space-y-3 text-xs sm:text-sm">
                <li className="p-3.5 rounded-xl bg-[#FAF8F5] border border-[#E8E1DA]">
                  • <strong>العملة والأسعار:</strong> كافة الأسعار معروضة بالدينار العراقي (IQD) وشاملة لكافة التفاصيل.
                </li>
                <li className="p-3.5 rounded-xl bg-[#FAF8F5] border border-[#E8E1DA]">
                  • <strong>تأكيد توفر المخزون:</strong> تخضع المنتجات لمدى توفرها في المخزن، ويتم تأكيد التوفر لحظياً عند إتمام الطلب.
                </li>
                <li className="p-3.5 rounded-xl bg-[#FAF8F5] border border-[#E8E1DA]">
                  • <strong>دقة الألوان والتصوير:</strong> نحرص على تصوير القطع بإضاءة احترافية لعكس اللون الحقيقي للأقمشة، مع الأخذ بالاعتبار اختلافات شاشات الهواتف.
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

