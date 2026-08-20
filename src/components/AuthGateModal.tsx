import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Phone, ShieldCheck, ArrowRight, RefreshCw, Sparkles, CheckCircle2, AlertCircle, ShoppingBag } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const AuthGateModal: React.FC = () => {
  const { isAuthModalOpen, closeAuthModal, sendOtp, verifyOtp, customer } = useAuth();
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(0);
  const [debugOtp, setDebugOtp] = useState<string | null>(null);

  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Countdown timer for OTP resend
  useEffect(() => {
    let timer: any;
    if (countdown > 0) {
      timer = setInterval(() => {
        setCountdown(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [countdown]);

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    // Clean phone number
    let clean = phoneNumber.replace(/[\s\-\(\)\+]/g, '');
    if (clean.startsWith('964')) clean = '0' + clean.slice(3);
    if (!clean.startsWith('0') && clean.length === 10) clean = '0' + clean;

    if (!clean || clean.length < 10) {
      setError('يرجى إدخال رقم هاتف صحيح مكون من 11 رقمًا (مثال: 07707440557)');
      return;
    }

    if (!/^07[3-9]\d{8}$/.test(clean)) {
      setError('يرجى التأكد من أن الرقم يبدأ بـ 077 أو 078 أو 075');
      return;
    }

    setIsLoading(true);
    const res = await sendOtp(clean);
    setIsLoading(false);

    if (res.success) {
      setStep('otp');
      setCountdown(res.resendCooldownSeconds || 45);
      setSuccessMsg('تم إرسال رمز التحقق إلى هاتفكِ بنجاح');
      if (res.debugOtp) {
        setDebugOtp(res.debugOtp);
      }
      setTimeout(() => {
        otpInputRefs.current[0]?.focus();
      }, 100);
    } else {
      setError(res.error || 'تعذر إرسال رمز التحقق');
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) {
      // Handle paste
      const pasted = value.replace(/\D/g, '').slice(0, 6).split('');
      const newDigits = [...otpDigits];
      pasted.forEach((char, i) => {
        if (i < 6) newDigits[i] = char;
      });
      setOtpDigits(newDigits);
      if (pasted.length === 6) {
        submitOtp(newDigits.join(''));
      }
      return;
    }

    const val = value.replace(/\D/g, '');
    const newDigits = [...otpDigits];
    newDigits[index] = val;
    setOtpDigits(newDigits);
    setError(null);

    if (val && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }

    // Auto submit if all 6 digits entered
    if (val && index === 5 && newDigits.every(d => d !== '')) {
      submitOtp(newDigits.join(''));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  const submitOtp = async (codeToVerify?: string) => {
    const code = codeToVerify || otpDigits.join('');
    if (code.length < 6) {
      setError('يرجى إدخال رمز التحقق المكون من 6 أرقام');
      return;
    }

    setIsLoading(true);
    setError(null);
    const res = await verifyOtp(phoneNumber, code);
    setIsLoading(false);

    if (res.success) {
      setSuccessMsg('تم تسجيل الدخول بنجاح! مرحبًا بكِ في أزياء 4sHe');
      setTimeout(() => {
        closeAuthModal();
        setStep('phone');
        setOtpDigits(['', '', '', '', '', '']);
      }, 800);
    } else {
      setError(res.error || 'رمز التحقق غير صحيح، يرجى المحاولة ثانية');
    }
  };

  const handleResendOtp = async () => {
    if (countdown > 0) return;
    setError(null);
    setIsLoading(true);
    const res = await sendOtp(phoneNumber);
    setIsLoading(false);
    if (res.success) {
      setCountdown(res.resendCooldownSeconds || 45);
      setSuccessMsg('تم إرسال رمز جديد بنجاح');
      if (res.debugOtp) setDebugOtp(res.debugOtp);
      setOtpDigits(['', '', '', '', '', '']);
      otpInputRefs.current[0]?.focus();
    } else {
      setError(res.error || 'تعذر إعادة الإرسال');
    }
  };

  if (!isAuthModalOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 20 }}
          transition={{ duration: 0.25 }}
          className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-[#eedfd9]"
          id="auth-gate-modal"
        >
          {/* Header Visual Banner */}
          <div className="relative bg-[#4A3F35] text-white p-8 text-center overflow-hidden border-b border-[#3B322A]">
            {/* Soft decorative background circles */}
            <div className="absolute -top-12 -right-12 w-40 h-40 rounded-full bg-[#A67C52]/20 blur-2xl pointer-events-none" />
            <div className="absolute -bottom-10 -left-10 w-36 h-36 rounded-full bg-[#E8DDD5]/15 blur-2xl pointer-events-none" />

            <div className="relative z-10 flex flex-col items-center">
              <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center mb-4 text-[#E8DDD5] shadow-inner">
                <ShoppingBag className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-bold tracking-tight text-white mb-1">
                أزياء 4sHe
              </h2>
              <p className="text-sm text-[#E8DDD5] font-medium">
                أسواق المثنى، الموصل • متجر الأزياء النسائية الفاخرة
              </p>
            </div>
          </div>

          {/* Modal Body */}
          <div className="p-6 md:p-8 space-y-6">
            {step === 'phone' ? (
              <form onSubmit={handlePhoneSubmit} className="space-y-5">
                <div className="text-center space-y-1.5">
                  <h3 className="text-xl font-bold text-[#2D2621]">
                    أهلًا بكِ في أزياء 4sHe
                  </h3>
                  <p className="text-sm text-[#8C7D73]">
                    سجّلي الدخول باستخدام رقم هاتفكِ للمتابعة والاستمتاع بتجربة تسوق راقية
                  </p>
                </div>

                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2"
                  >
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                    <span>{error}</span>
                  </motion.div>
                )}

                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-[#5C5046]">
                    رقم الهاتف المحمول (العراق)
                  </label>
                  <div className="relative flex items-center rounded-2xl border border-[#E8E1DA] focus-within:border-[#4A3F35] focus-within:ring-2 focus-within:ring-[#4A3F35]/20 bg-[#FAF8F5] transition-all overflow-hidden">
                    <div className="px-3.5 py-3 bg-[#F2EAE4] border-l border-[#E8E1DA] text-xs font-bold text-[#5C5046] flex items-center gap-1.5 shrink-0 select-none">
                      <span className="text-base">🇮🇶</span>
                      <span>+964</span>
                    </div>
                    <input
                      type="tel"
                      id="customer-phone-input"
                      value={phoneNumber}
                      onChange={e => setPhoneNumber(e.target.value)}
                      placeholder="0770 744 0557"
                      dir="ltr"
                      className="w-full py-3.5 px-4 text-left font-medium text-[#2D2621] bg-transparent focus:outline-none placeholder:text-[#A69B91] text-sm tracking-wider"
                      autoFocus
                    />
                  </div>
                  <p className="text-[11px] text-[#8C7D73] text-right">
                    نقبل أرقام زين، كورك، وآسيا سيل (077 / 078 / 075)
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={isLoading || !phoneNumber.trim()}
                  id="auth-submit-phone-btn"
                  className="w-full py-3.5 px-6 rounded-2xl bg-[#4A3F35] hover:bg-[#3B322A] text-white font-bold text-sm shadow-lg shadow-[#4A3F35]/20 hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group cursor-pointer border border-[#6B5E54]/30"
                >
                  {isLoading ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <span>متابعة</span>
                      <ArrowRight className="w-4 h-4 group-hover:-translate-x-1 transition-transform rotate-180" />
                    </>
                  )}
                </button>

                <div className="pt-2 text-center">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-[11px] font-medium border border-emerald-200">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>دخول آمن عبر رمز تحقق OTP بدون كلمة مرور</span>
                  </div>
                </div>
              </form>
            ) : (
              <div className="space-y-6">
                <div className="text-center space-y-1.5">
                  <h3 className="text-xl font-bold text-[#2D2621]">
                    أدخلي رمز التحقق
                  </h3>
                  <p className="text-sm text-[#8C7D73]">
                    أرسلنا رمز تحقق مكون من 6 أرقام إلى الرقم:
                  </p>
                  <div className="inline-flex items-center gap-2 text-xs font-bold text-[#4A3F35] bg-[#F2EAE4] px-3 py-1 rounded-full dir-ltr border border-[#E8DDD5]">
                    <span>{phoneNumber}</span>
                  </div>
                </div>

                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2"
                  >
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                    <span>{error}</span>
                  </motion.div>
                )}

                {successMsg && !error && (
                  <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                    <span>{successMsg}</span>
                  </motion.div>
                )}

                {/* Debug Preview Helper */}
                {debugOtp && (
                  <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center justify-between">
                    <span className="font-semibold">رمز التحقق للتجربة السريعة:</span>
                    <button
                      type="button"
                      onClick={() => {
                        const digits = debugOtp.split('');
                        setOtpDigits(digits);
                        submitOtp(debugOtp);
                      }}
                      className="px-2.5 py-1 bg-amber-200 hover:bg-amber-300 rounded-lg text-xs font-bold font-mono tracking-widest text-amber-950 transition-colors"
                    >
                      {debugOtp} (تعبئة فورية)
                    </button>
                  </div>
                )}

                {/* 6 Digit Inputs */}
                <div className="flex items-center justify-center gap-2 dir-ltr">
                  {otpDigits.map((digit, idx) => (
                    <input
                      key={idx}
                      ref={el => (otpInputRefs.current[idx] = el)}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={e => handleOtpChange(idx, e.target.value)}
                      onKeyDown={e => handleKeyDown(idx, e)}
                      className={`w-11 h-13 text-center text-lg font-bold rounded-xl border bg-[#FAF8F5] focus:bg-white transition-all focus:outline-none ${
                        digit
                          ? 'border-[#4A3F35] text-[#4A3F35] ring-2 ring-[#4A3F35]/15'
                          : 'border-[#E8E1DA] text-[#2D2621] focus:border-[#4A3F35]'
                      }`}
                    />
                  ))}
                </div>

                <div className="space-y-3">
                  <button
                    type="button"
                    onClick={() => submitOtp()}
                    disabled={isLoading || otpDigits.some(d => d === '')}
                    id="auth-verify-otp-btn"
                    className="w-full py-3.5 px-6 rounded-2xl bg-[#4A3F35] hover:bg-[#3B322A] text-white font-bold text-sm shadow-lg shadow-[#4A3F35]/20 hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer border border-[#6B5E54]/30"
                  >
                    {isLoading ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 text-[#E8DDD5]" />
                        <span>تحقق وتسجيل الدخول</span>
                      </>
                    )}
                  </button>

                  <div className="flex items-center justify-between text-xs pt-1 px-1">
                    <button
                      type="button"
                      onClick={() => {
                        setStep('phone');
                        setError(null);
                      }}
                      className="text-[#6B5E54] hover:text-[#4A3F35] transition-colors font-medium"
                    >
                      ← تعديل رقم الهاتف
                    </button>

                    <button
                      type="button"
                      onClick={handleResendOtp}
                      disabled={countdown > 0 || isLoading}
                      className="text-[#A67C52] hover:underline font-bold disabled:text-[#A69B91] disabled:no-underline disabled:cursor-not-allowed"
                    >
                      {countdown > 0 ? `إعادة الإرسال بعد (${countdown} ث)` : 'إعادة إرسال الرمز'}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
