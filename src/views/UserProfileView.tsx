import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { User, Phone, MapPin, Package, Heart, LogOut, CheckCircle2, Clock, Truck, ShieldCheck, ChevronRight, Sparkles, AlertCircle, RefreshCw, ShoppingBag } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useStore } from '../context/StoreContext';
import { useCart } from '../context/CartContext';
import { Order, Product } from '../types';
import { formatIQD, IRAQI_GOVERNORATES, MOSUL_DISTRICTS } from '../utils/formatters';

export const UserProfileView: React.FC = () => {
  const { customer, logout, updateProfile, openAuthModal, isAuthenticated } = useAuth();
  const { products, wishlist, toggleWishlist, setSelectedProduct, setActivePage } = useStore();
  const { setLastCompletedOrder } = useCart();

  const [activeTab, setActiveTab] = useState<'orders' | 'profile' | 'wishlist'>('orders');
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);

  // Profile Form States
  const [name, setName] = useState(customer?.name || '');
  const [governorate, setGovernorate] = useState(customer?.governorate || 'نينوى (الموصل)');
  const [district, setDistrict] = useState(customer?.district || 'الموصل');
  const [address, setAddress] = useState(customer?.address || '');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (customer) {
      setName(customer.name || '');
      setGovernorate(customer.governorate || 'نينوى (الموصل)');
      setDistrict(customer.district || 'الموصل');
      setAddress(customer.address || '');
      fetchUserOrders();
    }
  }, [customer]);

  const fetchUserOrders = async () => {
    if (!customer?.token) return;
    setIsLoadingOrders(true);
    try {
      const res = await fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${customer.token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setOrders(data.orders || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoadingOrders(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccess(false);
    const ok = await updateProfile({
      name,
      governorate,
      district,
      address
    });
    setIsSaving(false);
    if (ok) {
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    }
  };

  const wishlistedProducts = products.filter(p => wishlist.includes(p.id));

  if (!isAuthenticated) {
    return (
      <div className="py-16 bg-[#FAF8F5] min-h-[70vh] flex items-center justify-center text-center p-4">
        <div className="max-w-md w-full bg-white p-8 rounded-3xl border border-[#E8E1DA] shadow-lg space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-[#F2EAE4] text-[#4A3F35] flex items-center justify-center mx-auto border border-[#E8DDD5]">
            <User className="w-8 h-8 text-[#A67C52]" />
          </div>
          <h2 className="text-xl font-bold text-[#2D2621]">سجّلي الدخول للوصول إلى حسابكِ</h2>
          <p className="text-xs text-[#8C7D73]">
            يمكنكِ متابعة طلباتكِ السابقة وحفظ عناوينكِ والمفضلة عبر رقم هاتفكِ المحمول
          </p>
          <button
            type="button"
            onClick={openAuthModal}
            className="w-full py-3.5 px-6 rounded-2xl bg-[#4A3F35] text-white font-bold text-xs shadow-md hover:bg-[#3B322A] transition-all cursor-pointer border border-[#6B5E54]/30"
          >
            تسجيل الدخول برقم الهاتف
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="py-10 bg-[#FAF8F5] min-h-screen text-right">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Customer Profile Header Banner */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#E8E1DA] shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-[#4A3F35] text-white flex items-center justify-center text-xl font-bold font-serif-brand shadow-md border border-[#3B322A]">
              4s
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-[#2D2621]">
                  {customer?.name || 'عميلة أزياء 4sHe'}
                </h1>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" />
                  <span>رقم موثق</span>
                </span>
                {(customer?.role === 'manager' || customer?.role === 'worker' || customer?.phone === '07707440557') && (
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border flex items-center gap-1 ${
                    customer?.role === 'manager' || customer?.phone === '07707440557'
                      ? 'bg-amber-100/70 text-amber-900 border-amber-200'
                      : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  }`}>
                    {customer?.roleTitle || (customer?.role === 'manager' ? 'المدير العام' : 'كادر المتجر')}
                  </span>
                )}
              </div>
              <p className="text-xs text-[#8C7D73] font-mono dir-ltr text-right">
                {customer?.phone}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            {(customer?.role === 'manager' || customer?.role === 'worker' || customer?.phone === '07707440557') && (
              <button
                type="button"
                onClick={() => setActivePage('admin')}
                className="px-4 py-2.5 rounded-2xl bg-amber-100/80 hover:bg-amber-200 text-amber-900 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border border-amber-300 shadow-xs"
              >
                <span>لوحة تحكم الإدارة</span>
                <ChevronRight className="w-3.5 h-3.5 rotate-180" />
              </button>
            )}

            <div className="px-4 py-2 bg-[#FAF8F5] rounded-2xl border border-[#E8E1DA] text-xs text-center flex-1 md:flex-initial">
              <span className="text-[#8C7D73] block">إجمالي الطلبات</span>
              <strong className="text-[#2D2621] font-bold">{orders.length} طلب</strong>
            </div>

            <button
              type="button"
              onClick={logout}
              className="px-4 py-2.5 rounded-2xl bg-rose-50 text-rose-700 hover:bg-rose-100 text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer border border-rose-200/50"
            >
              <LogOut className="w-4 h-4" />
              <span>تسجيل الخروج</span>
            </button>
          </div>
        </div>

        {/* Profile Tabs */}
        <div className="flex items-center gap-2 border-b border-[#E8E1DA] pb-2">
          <button
            type="button"
            onClick={() => setActiveTab('orders')}
            className={`px-5 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'orders'
                ? 'bg-[#4A3F35] text-white shadow-md'
                : 'text-[#5C5046] hover:bg-[#F2EAE4]'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>طلباتي السابقة ({orders.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('wishlist')}
            className={`px-5 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'wishlist'
                ? 'bg-[#4A3F35] text-white shadow-md'
                : 'text-[#5C5046] hover:bg-[#F2EAE4]'
            }`}
          >
            <Heart className="w-4 h-4" />
            <span>المفضلة ({wishlist.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('profile')}
            className={`px-5 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'profile'
                ? 'bg-[#4A3F35] text-white shadow-md'
                : 'text-[#5C5046] hover:bg-[#F2EAE4]'
            }`}
          >
            <User className="w-4 h-4" />
            <span>بياناتي وعناوين التوصيل</span>
          </button>
        </div>

        {/* Tab 1: Orders History */}
        {activeTab === 'orders' && (
          <div className="space-y-4">
            {isLoadingOrders ? (
              <div className="p-12 text-center text-xs text-[#8C7D73]">
                <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-[#4A3F35]" />
                <span>جاري تحميل سجل الطلبات...</span>
              </div>
            ) : orders.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-[#E8E1DA] space-y-4">
                <Package className="w-12 h-12 text-[#8C7D73]/40 mx-auto" />
                <h3 className="text-base font-bold text-[#2D2621]">لا توجد طلبات سابقة</h3>
                <p className="text-xs text-[#8C7D73] max-w-sm mx-auto">
                  لم تقومي بتأكيد أي طلب بعد. تصفحي المتجر واختاري قطعتكِ المفضلة!
                </p>
                <button
                  type="button"
                  onClick={() => setActivePage('shop')}
                  className="px-6 py-2.5 rounded-2xl bg-[#4A3F35] text-white text-xs font-bold hover:bg-[#3B322A] cursor-pointer"
                >
                  تسوقي الآن
                </button>
              </div>
            ) : (
              orders.map(order => {
                const isDelivered = order.status === 'delivered';
                const isProcessing = order.status === 'processing';
                const isOut = order.status === 'out_for_delivery';
                const isCancelled = order.status === 'cancelled';

                return (
                  <div
                    key={order.id}
                    className="bg-white rounded-3xl border border-[#E8E1DA] p-5 sm:p-6 shadow-xs space-y-4"
                  >
                    {/* Order Top Bar */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#E8E1DA] gap-2">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-[#F2EAE4] text-[#4A3F35] font-mono font-bold text-xs border border-[#E8DDD5]">
                          {order.id}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-[#2D2621]">
                            تاريخ الطلب: {new Date(order.createdAt).toLocaleDateString('ar-IQ')}
                          </p>
                          <p className="text-[11px] text-[#8C7D73]">
                            طريقة الدفع: {order.paymentMethod === 'cod' ? 'الدفع عند الاستلام' : 'دفع إلكتروني'}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-bold ${
                            isDelivered
                              ? 'bg-emerald-100 text-emerald-800'
                              : isProcessing
                              ? 'bg-amber-100 text-amber-800'
                              : isOut
                              ? 'bg-blue-100 text-blue-800'
                              : isCancelled
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-[#F2EAE4] text-[#4A3F35]'
                          }`}
                        >
                          {order.status === 'received' && 'تم استلام الطلب'}
                          {order.status === 'processing' && 'قيد التجهيز والتغليف'}
                          {order.status === 'out_for_delivery' && 'خرج للتوصيل مع المندوب'}
                          {order.status === 'delivered' && 'تم التسليم بنجاح'}
                          {order.status === 'cancelled' && 'ملغي'}
                        </span>

                        <button
                          type="button"
                          onClick={() => setLastCompletedOrder(order)}
                          className="px-3 py-1 bg-[#FAF8F5] hover:bg-[#F2EAE4] text-[#5C5046] text-xs font-bold rounded-xl transition-colors cursor-pointer border border-[#E8E1DA]"
                        >
                          عرض الفاتورة
                        </button>
                      </div>
                    </div>

                    {/* Order Items */}
                    <div className="space-y-2">
                      {order.items.map((item, i) => (
                        <div key={i} className="flex items-center justify-between p-2 rounded-xl bg-[#FAF8F5] text-xs border border-[#E8E1DA]/50">
                          <div className="flex items-center gap-3">
                            <img src={item.image} alt="" className="w-10 h-12 rounded-lg object-cover" />
                            <div>
                              <p className="font-bold text-[#2D2621]">{item.name}</p>
                              <p className="text-[11px] text-[#8C7D73]">
                                المقاس: {item.size} • اللون: {item.colorName} • الكمية: {item.quantity}
                              </p>
                            </div>
                          </div>
                          <span className="font-black text-[#2D2621]">{formatIQD(item.price * item.quantity)}</span>
                        </div>
                      ))}
                    </div>

                    {/* Order Footer */}
                    <div className="flex items-center justify-between pt-2 border-t border-[#E8E1DA] text-xs">
                      <span className="text-[#8C7D73]">
                        عنوان التوصيل: <strong className="text-[#2D2621]">{order.governorate}، {order.district}</strong>
                      </span>
                      <div className="text-left">
                        <span className="text-[#8C7D73] block text-[10px]">المبلغ الإجمالي:</span>
                        <span className="text-base font-black text-[#4A3F35]">{formatIQD(order.total)}</span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* Tab 2: Wishlist */}
        {activeTab === 'wishlist' && (
          <div>
            {wishlistedProducts.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-[#E8E1DA] space-y-4">
                <Heart className="w-12 h-12 text-[#8C7D73]/40 mx-auto" />
                <h3 className="text-base font-bold text-[#2D2621]">قائمة المفضلة فارغة</h3>
                <p className="text-xs text-[#8C7D73] max-w-sm mx-auto">
                  احفظي القطع التي تعجبكِ بالضغط على أيقونة القلب لتجديها بسهولة لاحقًا
                </p>
                <button
                  type="button"
                  onClick={() => setActivePage('shop')}
                  className="px-6 py-2.5 rounded-2xl bg-[#4A3F35] text-white text-xs font-bold hover:bg-[#3B322A] cursor-pointer"
                >
                  استكشاف المنتجات
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                {wishlistedProducts.map(prod => (
                  <div
                    key={prod.id}
                    onClick={() => setSelectedProduct(prod)}
                    className="bg-white rounded-2xl border border-[#E8E1DA] overflow-hidden p-3 space-y-2 cursor-pointer group hover:shadow-md transition-all"
                  >
                    <div className="relative aspect-[3/4] rounded-xl overflow-hidden bg-[#FAF8F5]">
                      <img src={prod.images[0]} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                      <button
                        type="button"
                        onClick={e => {
                          e.stopPropagation();
                          toggleWishlist(prod.id);
                        }}
                        className="absolute top-2 left-2 p-2 rounded-full bg-white/90 text-rose-600 shadow-xs"
                      >
                        <Heart className="w-4 h-4 fill-rose-600" />
                      </button>
                    </div>
                    <h4 className="text-xs font-bold text-[#2D2621] line-clamp-1">{prod.name}</h4>
                    <div className="text-xs font-black text-[#4A3F35]">{formatIQD(prod.price)}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Customer Profile & Addresses */}
        {activeTab === 'profile' && (
          <div className="bg-white rounded-3xl border border-[#E8E1DA] p-6 sm:p-8 max-w-2xl">
            <form onSubmit={handleSaveProfile} className="space-y-5">
              <h3 className="text-sm font-bold text-[#2D2621] border-b border-[#E8E1DA] pb-3">
                تعديل البيانات وعنوان التوصيل الافتراضي
              </h3>

              {saveSuccess && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>تم حفظ وتحديث بياناتكِ بنجاح ✨</span>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-[#5C5046]">الاسم الكامل</label>
                <input
                  type="text"
                  placeholder="مثال: سارة محمد"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full py-2.5 px-3.5 text-xs bg-[#FAF8F5] border border-[#E8E1DA] rounded-xl focus:outline-none focus:border-[#4A3F35] focus:bg-white text-[#2D2621]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-[#5C5046]">رقم الهاتف (موثق)</label>
                <input
                  type="tel"
                  disabled
                  value={customer?.phone || ''}
                  className="w-full py-2.5 px-3.5 text-xs bg-[#F2EAE4] border border-[#E8E1DA] rounded-xl text-[#8C7D73] font-mono dir-ltr text-right cursor-not-allowed"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-[#5C5046]">المحافظة</label>
                  <select
                    value={governorate}
                    onChange={e => setGovernorate(e.target.value)}
                    className="w-full py-2.5 px-3.5 text-xs bg-[#FAF8F5] border border-[#E8E1DA] rounded-xl focus:outline-none focus:border-[#4A3F35] focus:bg-white text-[#2D2621]"
                  >
                    {IRAQI_GOVERNORATES.map(gov => (
                      <option key={gov} value={gov}>
                        {gov}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-[#5C5046]">المنطقة / الحي</label>
                  <input
                    type="text"
                    placeholder="مثال: حي المثنى / حي الزهور"
                    value={district}
                    onChange={e => setDistrict(e.target.value)}
                    list="user-districts-list"
                    className="w-full py-2.5 px-3.5 text-xs bg-[#FAF8F5] border border-[#E8E1DA] rounded-xl focus:outline-none focus:border-[#4A3F35] focus:bg-white text-[#2D2621]"
                  />
                  <datalist id="user-districts-list">
                    {MOSUL_DISTRICTS.map(d => (
                      <option key={d} value={d} />
                    ))}
                  </datalist>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-[#5C5046]">العنوان بالتفصيل</label>
                <input
                  type="text"
                  placeholder="مثال: الموصل، حي المثنى، قرب أسواق المثنى، دار رقم..."
                  value={address}
                  onChange={e => setAddress(e.target.value)}
                  className="w-full py-2.5 px-3.5 text-xs bg-[#FAF8F5] border border-[#E8E1DA] rounded-xl focus:outline-none focus:border-[#4A3F35] focus:bg-white text-[#2D2621]"
                />
              </div>

              <button
                type="submit"
                disabled={isSaving}
                className="w-full py-3.5 px-6 rounded-2xl bg-[#4A3F35] hover:bg-[#3B322A] text-white font-bold text-xs shadow-md transition-all disabled:opacity-50 cursor-pointer border border-[#6B5E54]/30"
              >
                {isSaving ? 'جاري الحفظ...' : 'حفظ التعديلات'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
