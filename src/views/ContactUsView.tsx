import React, { useState } from 'react';
import { motion } from 'motion/react';
import { MapPin, Phone, MessageSquare, Clock, Star, Send, CheckCircle2, Navigation, Sparkles } from 'lucide-react';
import { useStore } from '../context/StoreContext';

export const ContactUsView: React.FC = () => {
  const { settings } = useStore();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone || !message) return;
    setIsSubmitted(true);
    setTimeout(() => {
      setName('');
      setPhone('');
      setSubject('');
      setMessage('');
      setIsSubmitted(false);
    }, 4000);
  };

  const whatsappUrl = `https://wa.me/9647707440557?text=${encodeURIComponent('مرحبًا أزياء 4sHe، أود الاستفسار عن تشكيلات الملابس المتوفرة')}`;

  return (
    <div className="py-12 bg-[#FAF8F5] min-h-screen text-right">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Header */}
        <div className="space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F2EAE4] text-[#4A3F35] text-xs font-bold border border-[#E8DDD5]">
            <Sparkles className="w-3.5 h-3.5 text-[#A67C52]" />
            <span>نحن في خدمتكم دائمًا</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-[#2D2621]">
            تواصل مع أزياء 4sHe • الموصل
          </h1>
          <p className="text-sm text-[#8C7D73] max-w-xl">
            يسعدنا استقبال استفساراتكم وطلباتكم، أو زيارتكم لنا في فرعنا بأسواق المثنى
          </p>
        </div>

        {/* Contact Cards Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
          {/* Location Card */}
          <div className="bg-white p-6 rounded-3xl border border-[#E8E1DA] shadow-xs space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-[#F2EAE4] text-[#4A3F35] flex items-center justify-center border border-[#E8DDD5]">
              <MapPin className="w-6 h-6 text-[#A67C52]" />
            </div>
            <h3 className="text-base font-bold text-[#2D2621]">عنوان المتجر</h3>
            <p className="text-xs text-[#6B5E54] leading-relaxed">
              {settings.storeAddress}
            </p>
            <div className="pt-2">
              <span className="inline-block px-2.5 py-1 rounded-lg bg-[#FAF8F5] text-[#5C5046] border border-[#E8E1DA] text-[11px] font-mono">
                رمز الخريطة: 95FF+3F الموصل
              </span>
            </div>
          </div>

          {/* Phone & WhatsApp Card */}
          <div className="bg-white p-6 rounded-3xl border border-[#E8E1DA] shadow-xs space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-100">
              <Phone className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-[#2D2621]">الهاتف والواتساب</h3>
            <p className="text-xs text-[#6B5E54]">
              خدمة العملاء والطلبات المباشرة
            </p>
            <div className="space-y-2 pt-2">
              <a
                href="tel:07707440557"
                className="block text-sm font-mono font-bold text-[#4A3F35] hover:underline dir-ltr text-right"
              >
                0770 744 0557
              </a>
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition-colors shadow-sm"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>محادثة واتساب سريعة</span>
              </a>
            </div>
          </div>

          {/* Working Hours Card */}
          <div className="bg-white p-6 rounded-3xl border border-[#E8E1DA] shadow-xs space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center border border-amber-200">
              <Clock className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-[#2D2621]">أوقات العمل</h3>
            <p className="text-xs text-[#6B5E54]">
              نستقبلكم يوميًا طيلة أيام الأسبوع
            </p>
            <div className="pt-2">
              <span className="inline-block px-3 py-1.5 rounded-xl bg-[#F2EAE4] text-[#4A3F35] text-xs font-bold border border-[#E8DDD5]">
                {settings.workingHours}
              </span>
            </div>
          </div>
        </div>

        {/* Map & Message Form Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Contact Form */}
          <div className="lg:col-span-6 bg-white rounded-3xl p-6 sm:p-8 border border-[#E8E1DA] shadow-xs">
            <h2 className="text-xl font-bold text-[#2D2621] mb-2">أرسلي لنا رسالة</h2>
            <p className="text-xs text-[#8C7D73] mb-6">
              إذا كان لديكِ أي استفسار أو طلب خاص، سنكون سعداء بالرد عليكِ في أقرب وقت
            </p>

            {isSubmitted && (
              <div className="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>تم إرسال رسالتكِ بنجاح! سيقوم فريق أزياء 4sHe بالتواصل معكِ قريبًا.</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-[#5C5046]">الاسم</label>
                  <input
                    type="text"
                    required
                    placeholder="اسمكِ الكريم"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="w-full py-2.5 px-3.5 text-xs bg-[#FAF8F5] border border-[#E8E1DA] rounded-xl focus:outline-none focus:border-[#4A3F35] focus:bg-white text-[#2D2621]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-[#5C5046]">رقم الهاتف</label>
                  <input
                    type="tel"
                    required
                    placeholder="0770..."
                    dir="ltr"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    className="w-full py-2.5 px-3.5 text-xs text-left bg-[#FAF8F5] border border-[#E8E1DA] rounded-xl focus:outline-none focus:border-[#4A3F35] focus:bg-white font-mono text-[#2D2621]"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-[#5C5046]">موضوع الرسالة</label>
                <input
                  type="text"
                  placeholder="مثال: استفسار عن مقاس فستان سهرة"
                  value={subject}
                  onChange={e => setSubject(e.target.value)}
                  className="w-full py-2.5 px-3.5 text-xs bg-[#FAF8F5] border border-[#E8E1DA] rounded-xl focus:outline-none focus:border-[#4A3F35] focus:bg-white text-[#2D2621]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-[#5C5046]">الرسالة / الاستفسار</label>
                <textarea
                  rows={4}
                  required
                  placeholder="اكتبي استفساركِ بالتفصيل..."
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  className="w-full py-2.5 px-3.5 text-xs bg-[#FAF8F5] border border-[#E8E1DA] rounded-xl focus:outline-none focus:border-[#4A3F35] focus:bg-white resize-none text-[#2D2621]"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 px-6 rounded-2xl bg-[#4A3F35] hover:bg-[#3B322A] text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer border border-[#6B5E54]/30"
              >
                <Send className="w-4 h-4" />
                <span>إرسال الرسالة</span>
              </button>
            </form>
          </div>

          {/* Interactive Map & Directions */}
          <div className="lg:col-span-6 space-y-4">
            <div className="bg-white rounded-3xl p-6 border border-[#E8E1DA] shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-[#2D2621] flex items-center gap-2">
                  <Navigation className="w-4 h-4 text-[#A67C52]" />
                  <span>موقع المتجر على الخريطة</span>
                </h3>
                <span className="text-xs text-[#8C7D73]">الموصل، أسواق المثنى</span>
              </div>

              {/* Embedded Google Map iframe for Mosul al-Muthanna */}
              <div className="w-full h-80 rounded-2xl overflow-hidden border border-[#E8E1DA] relative bg-[#FAF8F5]">
                <iframe
                  title="موقع أزياء 4sHe - أسواق المثنى الموصل"
                  src="https://maps.google.com/maps?q=Al-Muthanna+Market+Mosul+Nineveh+Iraq&t=&z=16&ie=UTF8&iwloc=&output=embed"
                  className="w-full h-full border-0"
                  loading="lazy"
                  referrerPolicy="no-referrer"
                />
              </div>

              <div className="flex items-center justify-between text-xs text-[#8C7D73] pt-2">
                <span>رمز الموقع: <strong className="text-[#2D2621]">95FF+3F Mosul</strong></span>
                <a
                  href="https://maps.google.com/?q=95FF%2B3F+Mosul"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#A67C52] font-bold hover:underline"
                >
                  فتح في تطبيق Google Maps ↗
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
