import React from 'react';
import {
  TrendingUp,
  ShoppingBag,
  Users,
  AlertCircle,
  Package,
  DollarSign,
  Truck,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  PackagePlus
} from 'lucide-react';
import { Product, Order } from '../../types';
import { formatIQD } from '../../utils/formatters';

interface AdminAnalyticsTabProps {
  stats: any;
  orders: Order[];
  products: Product[];
  onOpenRestockModal: (productId?: string) => void;
  onNavigateToOrders: () => void;
}

export const AdminAnalyticsTab: React.FC<AdminAnalyticsTabProps> = ({
  stats,
  orders,
  products,
  onOpenRestockModal,
  onNavigateToOrders
}) => {
  if (!stats) return null;

  const lowStockList = products.filter(p => p.stock <= 3);
  const deliveredCount = orders.filter(o => o.status === 'delivered').length;
  const deliveryRate = orders.length > 0 ? Math.round((deliveredCount / orders.length) * 100) : 100;

  // Mosul orders vs Other governorates
  const mosulOrdersCount = orders.filter(o => o.governorate.includes('الموصل') || o.governorate.includes('نينوى')).length;
  const otherGovernoratesOrdersCount = orders.length - mosulOrdersCount;

  return (
    <div className="space-y-8 text-right">
      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Total Revenue */}
        <div className="bg-white p-6 rounded-3xl border border-[#E8E1DA] shadow-xs space-y-2 relative overflow-hidden">
          <div className="flex items-center justify-between text-[#8C7D73] text-xs">
            <span className="font-bold">إجمالي المبيعات المؤكدة</span>
            <div className="w-9 h-9 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-[#4A3F35]">
            {formatIQD(stats.totalRevenue || 0)}
          </div>
          <p className="text-[11px] text-[#8C7D73] flex items-center gap-1">
            <ArrowUpRight className="w-3.5 h-3.5 text-emerald-600 inline" />
            <span>شامل كافة طلبيات الموصل والمحافظات</span>
          </p>
        </div>

        {/* Total Orders */}
        <div className="bg-white p-6 rounded-3xl border border-[#E8E1DA] shadow-xs space-y-2">
          <div className="flex items-center justify-between text-[#8C7D73] text-xs">
            <span className="font-bold">إجمالي الطلبيات</span>
            <div className="w-9 h-9 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center">
              <ShoppingBag className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-[#2D2621]">
            {orders.length} طلب
          </div>
          <div className="flex items-center justify-between text-[11px] text-[#8C7D73]">
            <span>نسبة إنجاز التسليم:</span>
            <span className="font-bold text-emerald-700">{deliveryRate}%</span>
          </div>
        </div>

        {/* Pending Orders */}
        <div className="bg-white p-6 rounded-3xl border border-[#E8E1DA] shadow-xs space-y-2">
          <div className="flex items-center justify-between text-[#8C7D73] text-xs">
            <span className="font-bold">بانتظار التجهيز والشحن</span>
            <div className="w-9 h-9 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-amber-700">
            {orders.filter(o => o.status === 'received' || o.status === 'processing').length} طلب
          </div>
          <button
            type="button"
            onClick={onNavigateToOrders}
            className="text-[11px] text-[#4A3F35] font-bold hover:underline cursor-pointer flex items-center gap-1"
          >
            <span>عرض وتجهيز الطلبيات</span>
            <span>←</span>
          </button>
        </div>

        {/* Low Stock Alert */}
        <div className="bg-white p-6 rounded-3xl border border-[#E8E1DA] shadow-xs space-y-2">
          <div className="flex items-center justify-between text-[#8C7D73] text-xs">
            <span className="font-bold">تنبيهات المخزن</span>
            <div className="w-9 h-9 rounded-2xl bg-rose-50 text-rose-700 flex items-center justify-center">
              <AlertCircle className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-rose-700">
            {lowStockList.length} موديلات
          </div>
          <p className="text-[11px] text-[#8C7D73]">متبقي بالمخزن 3 قطع أو أقل</p>
        </div>
      </div>

      {/* Middle Grid: Sales Geography + Low Stock Restock Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales Geography Card */}
        <div className="bg-white rounded-3xl border border-[#E8E1DA] p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-[#E8E1DA] pb-3">
            <h3 className="text-sm font-bold text-[#2D2621]">توزيع الطلبات الجغرافي</h3>
            <Truck className="w-4 h-4 text-[#A67C52]" />
          </div>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-bold text-[#5C5046]">
                <span>داخل مدينة الموصل (أسواق المثنى وباقي الأحياء)</span>
                <span>{mosulOrdersCount} طلب ({orders.length > 0 ? Math.round((mosulOrdersCount / orders.length) * 100) : 0}%)</span>
              </div>
              <div className="w-full h-2.5 bg-[#FAF8F5] rounded-full overflow-hidden border border-[#E8E1DA]">
                <div
                  className="h-full bg-[#4A3F35] rounded-full transition-all duration-500"
                  style={{ width: `${orders.length > 0 ? (mosulOrdersCount / orders.length) * 100 : 0}%` }}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-bold text-[#5C5046]">
                <span>باقي محافظات العراق (بغداد، أربيل، دهوك، البصرة...)</span>
                <span>{otherGovernoratesOrdersCount} طلب ({orders.length > 0 ? Math.round((otherGovernoratesOrdersCount / orders.length) * 100) : 0}%)</span>
              </div>
              <div className="w-full h-2.5 bg-[#FAF8F5] rounded-full overflow-hidden border border-[#E8E1DA]">
                <div
                  className="h-full bg-[#A67C52] rounded-full transition-all duration-500"
                  style={{ width: `${orders.length > 0 ? (otherGovernoratesOrdersCount / orders.length) * 100 : 0}%` }}
                />
              </div>
            </div>

            <div className="p-3 bg-[#FAF8F5] rounded-2xl border border-[#E8E1DA] text-xs text-[#8C7D73] space-y-1">
              <p className="font-bold text-[#2D2621]">معلومات التوصيل:</p>
              <p>توصيل الموصل: 3,000 د.ع (نفس اليوم أو خلال 24 ساعة)</p>
              <p>باقي المحافظات: 5,000 د.ع (خلال 24-48 ساعة)</p>
            </div>
          </div>
        </div>

        {/* Low Stock Immediate Restock Table */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-[#E8E1DA] p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-[#E8E1DA] pb-3">
            <div>
              <h3 className="text-sm font-bold text-[#2D2621]">حالة المخزون وتوريد الشحنات السريع</h3>
              <p className="text-[11px] text-[#8C7D73]">إدارة رصيد القطع المتوفرة في محل ومخزن أزياء 4sHe</p>
            </div>
            <button
              type="button"
              onClick={() => onOpenRestockModal()}
              className="px-3 py-1.5 bg-[#4A3F35] hover:bg-[#3B322A] text-white text-xs font-bold rounded-xl flex items-center gap-1 cursor-pointer transition-colors shadow-xs border border-[#6B5E54]/30"
            >
              <PackagePlus className="w-3.5 h-3.5" />
              <span>+ توريد شحنة عامة</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-right">
              <thead>
                <tr className="border-b border-[#E8E1DA] text-[#8C7D73]">
                  <th className="pb-3">المنتج</th>
                  <th className="pb-3">التصنيف</th>
                  <th className="pb-3">السعر</th>
                  <th className="pb-3">الرصيد المتاح</th>
                  <th className="pb-3 text-center">إجراء سريع</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8E1DA]/60">
                {products.slice(0, 5).map(prod => (
                  <tr key={prod.id} className="hover:bg-[#FAF8F5]">
                    <td className="py-2.5">
                      <div className="flex items-center gap-2">
                        <img src={prod.images[0]} alt="" className="w-9 h-11 rounded-lg object-cover" />
                        <div>
                          <p className="font-bold text-[#2D2621]">{prod.name}</p>
                          <p className="text-[10px] text-[#8C7D73]">{prod.sizes.join(', ')}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-2.5 text-[#5C5046]">{prod.category}</td>
                    <td className="py-2.5 font-bold text-[#4A3F35]">{formatIQD(prod.price)}</td>
                    <td className="py-2.5">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        prod.stock <= 3
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {prod.stock} قطع بالمخزن
                      </span>
                    </td>
                    <td className="py-2.5 text-center">
                      <button
                        type="button"
                        onClick={() => onOpenRestockModal(prod.id)}
                        className="py-1 px-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-[11px] font-bold rounded-lg border border-emerald-200 transition-colors cursor-pointer"
                      >
                        + تزويد المخزون
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Recent Orders Overview */}
      <div className="bg-white rounded-3xl border border-[#E8E1DA] p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-[#E8E1DA] pb-3">
          <h3 className="text-sm font-bold text-[#2D2621]">أحدث حركات المبيعات والطلبيات</h3>
          <button
            type="button"
            onClick={onNavigateToOrders}
            className="text-xs text-[#4A3F35] font-bold hover:underline cursor-pointer"
          >
            عرض كافة الطلبيات ({orders.length})
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-right">
            <thead>
              <tr className="border-b border-[#E8E1DA] text-[#8C7D73]">
                <th className="pb-3 font-semibold">رقم الطلب</th>
                <th className="pb-3 font-semibold">الزبونة</th>
                <th className="pb-3 font-semibold">الموقع / الحي</th>
                <th className="pb-3 font-semibold">عدد القطع</th>
                <th className="pb-3 font-semibold">المبلغ الكلي</th>
                <th className="pb-3 font-semibold">الحالة</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8E1DA]/60">
              {orders.slice(0, 6).map(ord => (
                <tr key={ord.id} className="hover:bg-[#FAF8F5]">
                  <td className="py-3 font-mono font-bold text-[#4A3F35]">{ord.id}</td>
                  <td className="py-3 font-bold text-[#2D2621]">{ord.customerName}</td>
                  <td className="py-3 text-[#8C7D73]">{ord.governorate} • {ord.district}</td>
                  <td className="py-3 font-bold text-[#5C5046]">{ord.items.length} قطع</td>
                  <td className="py-3 font-black text-[#2D2621]">{formatIQD(ord.total)}</td>
                  <td className="py-3">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#F2EAE4] text-[#4A3F35]">
                      {ord.status === 'received' ? 'تم الاستلام' :
                       ord.status === 'processing' ? 'قيد التجهيز' :
                       ord.status === 'out_for_delivery' ? 'خرج للتوصيل' :
                       ord.status === 'delivered' ? 'تم التسليم' : 'ملغي'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
