import React, { useState } from 'react';
import {
  Search,
  Filter,
  Plus,
  Printer,
  Phone,
  Eye,
  CheckCircle2,
  Clock,
  Truck,
  XCircle,
  ShoppingBag,
  CheckSquare,
  Square,
  MessageSquare,
  Layers,
  ArrowRightLeft,
  Loader2,
  FileText,
  AlertCircle,
  Sparkles
} from 'lucide-react';
import { Order } from '../../types';
import { formatIQD } from '../../utils/formatters';

interface AdminOrdersTabProps {
  orders: Order[];
  onOpenCreateOrderModal: () => void;
  onSelectOrderForInvoice: (order: Order, defaultTab?: 'invoice' | 'notes') => void;
  onUpdateOrderStatus: (orderId: string, status: string) => void;
  onBulkUpdateOrderStatus?: (orderIds: string[], status: string, note?: string) => Promise<void>;
  onRefreshOrders?: () => void;
}

export const AdminOrdersTab: React.FC<AdminOrdersTabProps> = ({
  orders,
  onOpenCreateOrderModal,
  onSelectOrderForInvoice,
  onUpdateOrderStatus,
  onBulkUpdateOrderStatus,
  onRefreshOrders
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [governorateFilter, setGovernorateFilter] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState('all');

  // Bulk Selection State
  const [selectedOrderIds, setSelectedOrderIds] = useState<string[]>([]);
  const [bulkTargetStatus, setBulkTargetStatus] = useState<string>('processing');
  const [bulkCustomNote, setBulkCustomNote] = useState<string>('');
  const [isBulkExecuting, setIsBulkExecuting] = useState(false);
  const [bulkSuccessMessage, setBulkSuccessMessage] = useState<string | null>(null);

  const filteredOrders = orders.filter(ord => {
    if (statusFilter !== 'all' && ord.status !== statusFilter) return false;
    if (paymentFilter !== 'all' && ord.paymentStatus !== paymentFilter) return false;
    if (governorateFilter !== 'all') {
      if (governorateFilter === 'mosul' && !ord.governorate.includes('الموصل') && !ord.governorate.includes('نينوى')) return false;
      if (governorateFilter === 'other' && (ord.governorate.includes('الموصل') || ord.governorate.includes('نينوى'))) return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        ord.id.toLowerCase().includes(q) ||
        ord.customerName.toLowerCase().includes(q) ||
        ord.customerPhone.includes(q) ||
        ord.district.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Checkbox handlers
  const handleToggleSelectAll = () => {
    if (selectedOrderIds.length === filteredOrders.length && filteredOrders.length > 0) {
      setSelectedOrderIds([]);
    } else {
      setSelectedOrderIds(filteredOrders.map(o => o.id));
    }
  };

  const handleToggleSelectOrder = (id: string) => {
    setSelectedOrderIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleSelectByStatus = (status: string) => {
    const matchingIds = filteredOrders.filter(o => o.status === status).map(o => o.id);
    setSelectedOrderIds(matchingIds);
  };

  // Bulk status submission
  const handleExecuteBulkUpdate = async () => {
    if (selectedOrderIds.length === 0 || isBulkExecuting) return;

    setIsBulkExecuting(true);
    setBulkSuccessMessage(null);

    try {
      if (onBulkUpdateOrderStatus) {
        await onBulkUpdateOrderStatus(selectedOrderIds, bulkTargetStatus, bulkCustomNote);
      } else {
        // Fallback direct API call
        const res = await fetch('/api/admin/orders/bulk-status', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            orderIds: selectedOrderIds,
            status: bulkTargetStatus,
            note: bulkCustomNote || undefined
          })
        });
        if (res.ok && onRefreshOrders) {
          onRefreshOrders();
        }
      }

      setBulkSuccessMessage(`تم تحديث حالة ${selectedOrderIds.length} طلبات بنجاح إلى "${getStatusDisplay(bulkTargetStatus).label}"`);
      setSelectedOrderIds([]);
      setBulkCustomNote('');
      setTimeout(() => setBulkSuccessMessage(null), 4000);
    } catch (err) {
      console.error('Error executing bulk status update:', err);
    } finally {
      setIsBulkExecuting(false);
    }
  };

  const getStatusDisplay = (status: string) => {
    switch (status) {
      case 'received':
        return { label: 'تم الاستلام (جديد)', color: 'bg-blue-50 text-blue-800 border-blue-200' };
      case 'processing':
        return { label: 'قيد التجهيز', color: 'bg-amber-50 text-amber-800 border-amber-200' };
      case 'out_for_delivery':
        return { label: 'خرج للتوصيل', color: 'bg-purple-50 text-purple-800 border-purple-200' };
      case 'delivered':
        return { label: 'تم التسليم', color: 'bg-emerald-50 text-emerald-800 border-emerald-200' };
      case 'cancelled':
        return { label: 'ملغي', color: 'bg-rose-50 text-rose-800 border-rose-200' };
      default:
        return { label: status, color: 'bg-gray-50 text-gray-800 border-gray-200' };
    }
  };

  // Status counts
  const counts = {
    all: orders.length,
    received: orders.filter(o => o.status === 'received').length,
    processing: orders.filter(o => o.status === 'processing').length,
    out_for_delivery: orders.filter(o => o.status === 'out_for_delivery').length,
    delivered: orders.filter(o => o.status === 'delivered').length,
    cancelled: orders.filter(o => o.status === 'cancelled').length
  };

  return (
    <div className="space-y-6 text-right">
      {/* Top Header & Fast Actions */}
      <div className="bg-white p-4 sm:p-6 rounded-3xl border border-[#E8E1DA] shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-[#2D2621]">تنظيم وإدارة طلبيات المتجر</h3>
              <span className="px-2.5 py-0.5 rounded-full bg-[#FAF8F5] border border-[#E8E1DA] text-[#8C7D73] text-[11px] font-bold">
                {orders.length} طلبات إجمالية
              </span>
            </div>
            <p className="text-xs text-[#8C7D73] mt-0.5">
              إدارة مراحل التوصيل، التحديث الجماعي للحالات، إضافة ملاحظات كادر العمل، وتوليد فواتير PDF قابلة للطباعة
            </p>
          </div>

          <button
            type="button"
            onClick={onOpenCreateOrderModal}
            className="px-5 py-2.5 bg-[#4A3F35] hover:bg-[#3B322A] text-white text-xs font-bold rounded-2xl flex items-center justify-center gap-2 cursor-pointer transition-all shadow-sm border border-[#6B5E54]/30 shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>+ إنشاء طلب يدوي جديد</span>
          </button>
        </div>

        {/* Quick Status Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-[#E8E1DA]/80">
          <button
            type="button"
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              statusFilter === 'all'
                ? 'bg-[#4A3F35] text-white shadow-xs'
                : 'text-[#8C7D73] hover:bg-[#FAF8F5]'
            }`}
          >
            الكل ({counts.all})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('received')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              statusFilter === 'received'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-blue-700 bg-blue-50/70 hover:bg-blue-100/70'
            }`}
          >
            تم الاستلام ({counts.received})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('processing')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              statusFilter === 'processing'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-amber-700 bg-amber-50/70 hover:bg-amber-100/70'
            }`}
          >
            قيد التجهيز ({counts.processing})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('out_for_delivery')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              statusFilter === 'out_for_delivery'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'text-purple-700 bg-purple-50/70 hover:bg-purple-100/70'
            }`}
          >
            خرج للتوصيل ({counts.out_for_delivery})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('delivered')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              statusFilter === 'delivered'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-emerald-700 bg-emerald-50/70 hover:bg-emerald-100/70'
            }`}
          >
            تم التسليم ({counts.delivered})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('cancelled')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              statusFilter === 'cancelled'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'text-rose-700 bg-rose-50/70 hover:bg-rose-100/70'
            }`}
          >
            ملغي ({counts.cancelled})
          </button>
        </div>

        {/* Filters Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 text-[#8C7D73] absolute right-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="ابحث برقم الطلب، الاسم، أو الهاتف..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-3 pr-9 py-2 text-xs bg-[#FAF8F5] border border-[#E8E1DA] rounded-xl focus:outline-none focus:border-[#4A3F35] text-[#2D2621]"
            />
          </div>

          {/* Governorate Filter */}
          <select
            value={governorateFilter}
            onChange={e => setGovernorateFilter(e.target.value)}
            className="py-2 px-3 bg-[#FAF8F5] border border-[#E8E1DA] rounded-xl text-xs font-semibold focus:outline-none focus:border-[#4A3F35] text-[#2D2621]"
          >
            <option value="all">كل المناطق والمحافظات</option>
            <option value="mosul">داخل مدينة الموصل ونينوى</option>
            <option value="other">باقي محافظات العراق</option>
          </select>

          {/* Payment Status Filter */}
          <select
            value={paymentFilter}
            onChange={e => setPaymentFilter(e.target.value)}
            className="py-2 px-3 bg-[#FAF8F5] border border-[#E8E1DA] rounded-xl text-xs font-semibold focus:outline-none focus:border-[#4A3F35] text-[#2D2621]"
          >
            <option value="all">كل حالات الدفع</option>
            <option value="paid">مدفوع مسبقاً</option>
            <option value="pending">عند الاستلام (معلق)</option>
          </select>

          {/* Quick Select Helpers */}
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handleToggleSelectAll}
              className="flex-1 py-2 px-2.5 bg-[#FAF8F5] hover:bg-[#F2EAE4] border border-[#E8E1DA] rounded-xl text-[11px] font-bold text-[#5C5046] transition-colors cursor-pointer text-center truncate"
            >
              {selectedOrderIds.length === filteredOrders.length && filteredOrders.length > 0
                ? 'إلغاء تحديد الكل'
                : 'تحديد المعروض بالكامل'}
            </button>
          </div>
        </div>
      </div>

      {/* SUCCESS NOTIFICATION */}
      {bulkSuccessMessage && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-bold">{bulkSuccessMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setBulkSuccessMessage(null)}
            className="text-emerald-700 hover:text-emerald-900 text-xs font-bold"
          >
            إغلاق
          </button>
        </div>
      )}

      {/* BULK ACTION BAR (Visible when 1 or more items selected) */}
      {selectedOrderIds.length > 0 && (
        <div className="bg-gradient-to-r from-[#4A3F35] to-[#3B322A] text-white p-4 rounded-3xl shadow-lg border border-[#6B5E54]/30 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-amber-500 text-white flex items-center justify-center font-bold text-xs shadow-inner">
              {selectedOrderIds.length}
            </div>
            <div>
              <h4 className="text-xs font-bold">تم تحديد {selectedOrderIds.length} طلبيات</h4>
              <p className="text-[11px] text-[#E8DDD5]">يمكنك الآن تغيير حالتها أو إسنادها دفعة واحدة للمندوب أو فريق التجهيز</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              value={bulkTargetStatus}
              onChange={e => setBulkTargetStatus(e.target.value)}
              className="py-2 px-3 bg-white/10 text-white border border-white/20 rounded-xl text-xs font-bold focus:outline-none focus:bg-[#3B322A]"
            >
              <option value="received" className="text-[#2D2621]">تحويل إلى: تم الاستلام (جديد)</option>
              <option value="processing" className="text-[#2D2621]">تحويل إلى: قيد التجهيز والتغليف</option>
              <option value="out_for_delivery" className="text-[#2D2621]">تحويل إلى: خرج للتوصيل</option>
              <option value="delivered" className="text-[#2D2621]">تحويل إلى: تم التسليم للزبونة</option>
              <option value="cancelled" className="text-[#2D2621]">تحويل إلى: إلغاء الطلبات</option>
            </select>

            <input
              type="text"
              placeholder="ملاحظة التحديث الجماعي (اختياري)..."
              value={bulkCustomNote}
              onChange={e => setBulkCustomNote(e.target.value)}
              className="py-2 px-3 bg-white/10 text-white placeholder:text-[#E8DDD5]/60 border border-white/20 rounded-xl text-xs focus:outline-none focus:bg-[#3B322A] min-w-[200px]"
            />

            <button
              type="button"
              onClick={handleExecuteBulkUpdate}
              disabled={isBulkExecuting}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs disabled:opacity-50"
            >
              {isBulkExecuting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ArrowRightLeft className="w-3.5 h-3.5" />}
              <span>تطبيق التحديث الجماعي</span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedOrderIds([])}
              className="p-2 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              title="إلغاء التحديد"
            >
              <XCircle className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Orders Table */}
      <div className="bg-white rounded-3xl border border-[#E8E1DA] overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-right">
            <thead className="bg-[#FAF8F5] text-[#5C5046] border-b border-[#E8E1DA]">
              <tr>
                <th className="p-4 w-10 text-center">
                  <button
                    type="button"
                    onClick={handleToggleSelectAll}
                    className="cursor-pointer text-[#4A3F35] hover:text-[#2D2621]"
                    title="تحديد الكل"
                  >
                    {selectedOrderIds.length > 0 && selectedOrderIds.length === filteredOrders.length ? (
                      <CheckSquare className="w-4 h-4 text-[#4A3F35]" />
                    ) : (
                      <Square className="w-4 h-4 text-[#8C7D73]" />
                    )}
                  </button>
                </th>
                <th className="p-4 font-semibold">رقم الطلب</th>
                <th className="p-4 font-semibold">الزبونة والهاتف</th>
                <th className="p-4 font-semibold">العنوان والمحافظة</th>
                <th className="p-4 font-semibold">القطع المطلوبة</th>
                <th className="p-4 font-semibold">ملاحظات الفريق</th>
                <th className="p-4 font-semibold">المبلغ الكلي</th>
                <th className="p-4 font-semibold">حالة الطلب</th>
                <th className="p-4 font-semibold text-center">الفاتورة والطباعة</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8E1DA]/60">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-12 text-center text-[#8C7D73] text-xs">
                    لا توجد طلبيات مطابقة للبحث أو الفلتر المحدد
                  </td>
                </tr>
              ) : (
                filteredOrders.map(ord => {
                  const statusInfo = getStatusDisplay(ord.status);
                  const isSelected = selectedOrderIds.includes(ord.id);
                  const staffNotesCount = ord.staffNotes?.length || 0;

                  return (
                    <tr
                      key={ord.id}
                      className={`hover:bg-[#FAF8F5] transition-colors ${
                        isSelected ? 'bg-amber-50/50' : ''
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="p-4 text-center">
                        <button
                          type="button"
                          onClick={() => handleToggleSelectOrder(ord.id)}
                          className="cursor-pointer"
                        >
                          {isSelected ? (
                            <CheckSquare className="w-4 h-4 text-[#4A3F35]" />
                          ) : (
                            <Square className="w-4 h-4 text-[#8C7D73]" />
                          )}
                        </button>
                      </td>

                      {/* Order ID */}
                      <td className="p-4 font-mono font-bold text-[#4A3F35]">
                        <button
                          type="button"
                          onClick={() => onSelectOrderForInvoice(ord, 'invoice')}
                          className="hover:underline cursor-pointer flex items-center gap-1"
                        >
                          <span>{ord.id}</span>
                        </button>
                      </td>

                      {/* Customer Info */}
                      <td className="p-4">
                        <p className="font-bold text-[#2D2621]">{ord.customerName}</p>
                        <p className="text-[11px] text-[#8C7D73] font-mono dir-ltr text-right">{ord.customerPhone}</p>
                      </td>

                      {/* Shipping Info */}
                      <td className="p-4">
                        <p className="font-bold text-[#2D2621]">{ord.governorate} • {ord.district}</p>
                        <p className="text-[11px] text-[#8C7D73] truncate max-w-[150px]">{ord.address}</p>
                      </td>

                      {/* Items */}
                      <td className="p-4">
                        <span className="font-bold text-[#5C5046]">{ord.items.length} قطع</span>
                        <div className="text-[10px] text-[#8C7D73] truncate max-w-[140px]">
                          {ord.items.map(i => `${i.name} (${i.size})`).join('، ')}
                        </div>
                      </td>

                      {/* Staff Internal Notes */}
                      <td className="p-4">
                        <button
                          type="button"
                          onClick={() => onSelectOrderForInvoice(ord, 'notes')}
                          className={`px-2.5 py-1 rounded-xl text-[11px] font-bold border transition-colors flex items-center gap-1.5 cursor-pointer ${
                            staffNotesCount > 0
                              ? 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'
                              : 'bg-[#FAF8F5] text-[#8C7D73] border-[#E8E1DA] hover:bg-[#F2EAE4]'
                          }`}
                          title="عرض وإضافة ملاحظات الفريق"
                        >
                          <MessageSquare className="w-3 h-3" />
                          <span>{staffNotesCount > 0 ? `${staffNotesCount} ملاحظات` : '+ إضافة'}</span>
                        </button>
                      </td>

                      {/* Total Amount */}
                      <td className="p-4 font-black text-[#4A3F35]">
                        <div>{formatIQD(ord.total)}</div>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded font-normal ${
                          ord.paymentStatus === 'paid' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                        }`}>
                          {ord.paymentStatus === 'paid' ? 'مدفوع' : 'عند الاستلام'}
                        </span>
                      </td>

                      {/* Status Dropdown */}
                      <td className="p-4">
                        <select
                          value={ord.status}
                          onChange={e => onUpdateOrderStatus(ord.id, e.target.value)}
                          className={`py-1 px-2.5 rounded-xl border text-[11px] font-bold focus:outline-none cursor-pointer ${statusInfo.color}`}
                        >
                          <option value="received">تم الاستلام</option>
                          <option value="processing">قيد التجهيز</option>
                          <option value="out_for_delivery">خرج للتوصيل</option>
                          <option value="delivered">تم التسليم</option>
                          <option value="cancelled">ملغي</option>
                        </select>
                      </td>

                      {/* Actions */}
                      <td className="p-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => onSelectOrderForInvoice(ord, 'invoice')}
                            className="p-2 rounded-xl bg-[#F2EAE4] hover:bg-[#E8DDD5] text-[#4A3F35] transition-colors cursor-pointer border border-[#E8DDD5]"
                            title="عرض الفاتورة وتوليد PDF"
                          >
                            <FileText className="w-3.5 h-3.5" />
                          </button>

                          <a
                            href={`https://wa.me/964${ord.customerPhone.replace(/^0+/, '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors cursor-pointer border border-emerald-200"
                            title="مراسلة واتساب"
                          >
                            <Phone className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
