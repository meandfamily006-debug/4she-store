import React, { useRef, useState } from 'react';
import {
  X,
  Printer,
  Download,
  Phone,
  MapPin,
  CheckCircle,
  Package,
  MessageSquare,
  FileText,
  Clock,
  Send,
  Trash2,
  AlertCircle,
  Loader2,
  Sparkles,
  Share2,
  Check
} from 'lucide-react';
import { Order, StaffNote } from '../../types';
import { formatIQD } from '../../utils/formatters';
import { downloadInvoicePDF } from '../../utils/pdfGenerator';

interface OrderInvoiceModalProps {
  order: Order | null;
  onClose: () => void;
  onUpdateStatus?: (orderId: string, status: string) => void;
  onOrderUpdated?: (updatedOrder: Order) => void;
}

export const OrderInvoiceModal: React.FC<OrderInvoiceModalProps> = ({
  order,
  onClose,
  onUpdateStatus,
  onOrderUpdated
}) => {
  const invoiceRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState<'invoice' | 'notes'>('invoice');
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [pdfSuccess, setPdfSuccess] = useState(false);
  const [copiedSummary, setCopiedSummary] = useState(false);

  // Staff notes state
  const [newNoteText, setNewNoteText] = useState('');
  const [newNoteAuthor, setNewNoteAuthor] = useState('كادر المتجر');
  const [isSubmittingNote, setIsSubmittingNote] = useState(false);
  const [staffNotes, setStaffNotes] = useState<StaffNote[]>(order?.staffNotes || []);

  if (!order) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPdf = async () => {
    if (!invoiceRef.current) return;
    setIsGeneratingPdf(true);
    setPdfSuccess(false);

    try {
      const fileName = `4sHe-Invoice-${order.id}.pdf`;
      const ok = await downloadInvoicePDF(invoiceRef.current, fileName);
      if (ok) {
        setPdfSuccess(true);
        setTimeout(() => setPdfSuccess(false), 3000);
      }
    } catch (err) {
      console.error('Error generating PDF:', err);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handleCopySummary = () => {
    const itemsText = order.items.map(i => `• ${i.name} (مقاس: ${i.size} - لون: ${i.colorName}) × ${i.quantity} = ${formatIQD(i.price * i.quantity)}`).join('\n');
    const summary = `🛍️ فاتورة طلبية أزياء 4sHe
رقم الطلب: ${order.id}
الزبونة: ${order.customerName} (${order.customerPhone})
العنوان: ${order.governorate} - ${order.district} (${order.address})
المنتجات:
${itemsText}
-----------------------
المجموع الكلي: ${formatIQD(order.total)} (${order.paymentMethod === 'cod' ? 'عند الاستلام' : 'دفع إلكتروني'})
حالة الطلب: ${order.status}`;

    navigator.clipboard.writeText(summary);
    setCopiedSummary(true);
    setTimeout(() => setCopiedSummary(false), 2500);
  };

  const handleAddStaffNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteText.trim() || isSubmittingNote) return;

    setIsSubmittingNote(true);
    try {
      const res = await fetch(`/api/admin/orders/${order.id}/staff-notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: newNoteText.trim(),
          author: newNoteAuthor
        })
      });

      if (res.ok) {
        const data = await res.json();
        setStaffNotes(data.staffNotes || []);
        setNewNoteText('');
        if (onOrderUpdated && data.order) {
          onOrderUpdated(data.order);
        }
      }
    } catch (err) {
      console.error('Error adding staff note:', err);
    } finally {
      setIsSubmittingNote(false);
    }
  };

  const handleDeleteStaffNote = async (noteId: string) => {
    try {
      const res = await fetch(`/api/admin/orders/${order.id}/staff-notes/${noteId}`, {
        method: 'DELETE'
      });

      if (res.ok) {
        const data = await res.json();
        setStaffNotes(data.staffNotes || []);
        if (onOrderUpdated && data.order) {
          onOrderUpdated(data.order);
        }
      }
    } catch (err) {
      console.error('Error deleting staff note:', err);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'received':
        return { label: 'تم الاستلام (جديد)', bg: 'bg-blue-50 text-blue-800 border-blue-200' };
      case 'processing':
        return { label: 'قيد التجهيز والتغليف', bg: 'bg-amber-50 text-amber-800 border-amber-200' };
      case 'out_for_delivery':
        return { label: 'خرج مع مندوب التوصيل', bg: 'bg-purple-50 text-purple-800 border-purple-200' };
      case 'delivered':
        return { label: 'تم التسليم بنجاح', bg: 'bg-emerald-50 text-emerald-800 border-emerald-200' };
      case 'cancelled':
        return { label: 'طلب ملغي', bg: 'bg-rose-50 text-rose-800 border-rose-200' };
      default:
        return { label: status, bg: 'bg-gray-50 text-gray-800 border-gray-200' };
    }
  };

  const badge = getStatusBadge(order.status);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl p-6 sm:p-8 border border-[#E8E1DA] my-auto max-h-[92vh] overflow-y-auto text-right print:p-0 print:border-none print:shadow-none print:max-w-none print:m-0">
        
        {/* Top Controls & Navigation (Hidden on print) */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between pb-4 border-b border-[#E8E1DA] gap-3 print:hidden">
          <div className="flex items-center gap-2">
            <div className="flex bg-[#FAF8F5] p-1 rounded-2xl border border-[#E8E1DA]">
              <button
                type="button"
                onClick={() => setActiveTab('invoice')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeTab === 'invoice'
                    ? 'bg-[#4A3F35] text-white shadow-xs'
                    : 'text-[#8C7D73] hover:text-[#2D2621]'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>الفاتورة وبوليصة الشحن</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('notes')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeTab === 'notes'
                    ? 'bg-[#4A3F35] text-white shadow-xs'
                    : 'text-[#8C7D73] hover:text-[#2D2621]'
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>ملاحظات الفريق</span>
                {staffNotes.length > 0 && (
                  <span className="w-4 h-4 rounded-full bg-amber-500 text-white text-[10px] flex items-center justify-center font-mono">
                    {staffNotes.length}
                  </span>
                )}
              </button>
            </div>
            
            <span className="text-xs text-[#8C7D73] font-mono hidden sm:inline">#{order.id}</span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Generate PDF Button */}
            <button
              type="button"
              onClick={handleDownloadPdf}
              disabled={isGeneratingPdf}
              className="px-3.5 py-2 bg-gradient-to-r from-amber-700 to-[#4A3F35] hover:opacity-90 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all cursor-pointer shadow-xs disabled:opacity-50"
              title="توليد وتنزيل ملف PDF عالي الجودة"
            >
              {isGeneratingPdf ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : pdfSuccess ? (
                <Check className="w-3.5 h-3.5 text-emerald-300" />
              ) : (
                <Download className="w-3.5 h-3.5" />
              )}
              <span>{isGeneratingPdf ? 'جاري إنشاء PDF...' : pdfSuccess ? 'تم التنزيل ✓' : 'تنزيل PDF'}</span>
            </button>

            {/* Print Button */}
            <button
              type="button"
              onClick={handlePrint}
              className="px-3 py-2 bg-[#F2EAE4] hover:bg-[#E8DDD5] text-[#4A3F35] text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer border border-[#E8DDD5]"
              title="طباعة عبر الطابعة"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">طباعة</span>
            </button>

            {/* Copy Summary */}
            <button
              type="button"
              onClick={handleCopySummary}
              className="p-2 rounded-xl text-[#8C7D73] hover:text-[#2D2621] hover:bg-[#FAF8F5] transition-colors cursor-pointer border border-[#E8E1DA]"
              title="نسخ ملخص الطلب للمراسلة"
            >
              {copiedSummary ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4" />}
            </button>

            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-full text-[#8C7D73] hover:text-[#2D2621] hover:bg-[#FAF8F5] transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* TAB 1: INVOICE / WAYBILL VIEW (PRINTABLE & PDF CAPTURE AREA) */}
        {activeTab === 'invoice' && (
          <div ref={invoiceRef} className="pt-6 space-y-6 text-[#2D2621] bg-white">
            {/* Header of Invoice */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b-2 border-[#E8E1DA]">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xl sm:text-2xl font-black text-[#4A3F35] tracking-tight">أزياء 4sHe</span>
                  <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-[#FAF8F5] border border-[#E8E1DA] text-[#8C7D73] font-bold">
                    فرع الموصل - أسواق المثنى
                  </span>
                </div>
                <p className="text-xs text-[#8C7D73] mt-1">متجر الأزياء النسائية الراقية | الموصل - حي المثنى | هاتف: 07707440557</p>
              </div>

              <div className="text-left dir-ltr sm:text-right">
                <div className="text-base font-black font-mono text-[#4A3F35]">
                  {order.id}
                </div>
                <div className="text-[11px] text-[#8C7D73]">
                  {new Date(order.createdAt).toLocaleString('ar-IQ')}
                </div>
                <div className={`mt-1 inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${badge.bg}`}>
                  {badge.label}
                </div>
              </div>
            </div>

            {/* Customer & Shipping Details Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-[#FAF8F5] p-5 rounded-2xl border border-[#E8E1DA]">
              <div className="space-y-1.5 text-xs">
                <h4 className="font-bold text-[#4A3F35] border-b border-[#E8E1DA]/80 pb-1 flex items-center gap-1">
                  <span>بيانات الزبونة المستلمة</span>
                </h4>
                <p><span className="text-[#8C7D73]">الاسم:</span> <strong className="text-[#2D2621]">{order.customerName}</strong></p>
                <p><span className="text-[#8C7D73]">الهاتف:</span> <strong className="font-mono text-sm text-[#4A3F35]">{order.customerPhone}</strong></p>
                <p><span className="text-[#8C7D73]">طريقة الدفع:</span> <strong>{order.paymentMethod === 'cod' ? 'الدفع نقدًا عند الاستلام' : 'دفع إلكتروني (زين كاش / مصرفي)'}</strong></p>
                <p><span className="text-[#8C7D73]">حالة الدفع:</span> <strong className={order.paymentStatus === 'paid' ? 'text-emerald-700' : 'text-amber-700'}>{order.paymentStatus === 'paid' ? 'مدفوع مسبقاً' : 'غير مدفوع (يُحصل نقدًا)'}</strong></p>
              </div>

              <div className="space-y-1.5 text-xs">
                <h4 className="font-bold text-[#4A3F35] border-b border-[#E8E1DA]/80 pb-1 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-[#A67C52]" />
                  <span>عنوان التوصيل والتسليم</span>
                </h4>
                <p><span className="text-[#8C7D73]">المحافظة:</span> <strong>{order.governorate}</strong></p>
                <p><span className="text-[#8C7D73]">المنطقة / الحي:</span> <strong>{order.district}</strong></p>
                <p><span className="text-[#8C7D73]">العنوان التفصيلي:</span> <span>{order.address}</span></p>
                {order.notes && (
                  <p className="text-amber-900 bg-amber-50 p-2 rounded-xl border border-amber-200 mt-1">
                    <span className="font-bold">ملاحظات الزبونة:</span> {order.notes}
                  </p>
                )}
              </div>
            </div>

            {/* Items Table */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-[#4A3F35]">تفاصيل القطع والمنتجات المطلوبة</h4>
              <div className="border border-[#E8E1DA] rounded-2xl overflow-hidden">
                <table className="w-full text-xs text-right">
                  <thead className="bg-[#FAF8F5] text-[#5C5046] border-b border-[#E8E1DA]">
                    <tr>
                      <th className="p-3">#</th>
                      <th className="p-3">المنتج والموديل</th>
                      <th className="p-3">المقاس واللون</th>
                      <th className="p-3 text-center">الكمية</th>
                      <th className="p-3">سعر القطعة</th>
                      <th className="p-3">المجموع</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E8E1DA]/60">
                    {order.items.map((it, idx) => (
                      <tr key={idx}>
                        <td className="p-3 font-mono text-[#8C7D73]">{idx + 1}</td>
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <img src={it.image} alt="" className="w-8 h-10 rounded object-cover print:hidden" />
                            <span className="font-bold text-[#2D2621]">{it.name}</span>
                          </div>
                        </td>
                        <td className="p-3">
                          <span className="font-bold">{it.size}</span>
                          <span className="text-[#8C7D73] mx-1">•</span>
                          <span>{it.colorName}</span>
                        </td>
                        <td className="p-3 text-center font-bold">{it.quantity}</td>
                        <td className="p-3 font-mono">{formatIQD(it.price)}</td>
                        <td className="p-3 font-bold font-mono text-[#4A3F35]">{formatIQD(it.price * it.quantity)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Calculation Summary */}
            <div className="flex justify-end">
              <div className="w-full sm:w-80 bg-[#FAF8F5] p-4 rounded-2xl border border-[#E8E1DA] space-y-2 text-xs">
                <div className="flex justify-between text-[#5C5046]">
                  <span>مجموع القطع:</span>
                  <span className="font-mono font-bold">{formatIQD(order.subtotal)}</span>
                </div>
                <div className="flex justify-between text-[#5C5046]">
                  <span>أجور التوصيل:</span>
                  <span className="font-mono font-bold">{order.deliveryFee === 0 ? 'مجاني' : formatIQD(order.deliveryFee)}</span>
                </div>
                {order.discount > 0 && (
                  <div className="flex justify-between text-rose-700">
                    <span>خصم خاص:</span>
                    <span className="font-mono font-bold">-{formatIQD(order.discount)}</span>
                  </div>
                )}
                <div className="border-t border-[#E8E1DA] pt-2 flex justify-between items-center text-sm font-black text-[#4A3F35]">
                  <span>المبلغ الإجمالي المطلوب:</span>
                  <span className="text-base font-black font-mono">{formatIQD(order.total)}</span>
                </div>
              </div>
            </div>

            {/* Delivery Note & Signatures */}
            <div className="border-t border-[#E8E1DA] pt-4 grid grid-cols-2 text-[11px] text-[#8C7D73]">
              <div>
                <p className="font-bold text-[#2D2621]">تعليمات الاستلام والاستبدال:</p>
                <p>يحق للزبونة فحص القطع وقياسها والتأكد من سلامة الموديل خلال 48 ساعة من الاستلام.</p>
              </div>
              <div className="text-left dir-ltr">
                <p className="font-bold text-[#2D2621]">توقيع المستلم / المندوب:</p>
                <div className="h-8 border-b border-dashed border-[#8C7D73]/50 mt-2"></div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: INTERNAL STAFF NOTES & TEAM ACTIVITY */}
        {activeTab === 'notes' && (
          <div className="pt-6 space-y-6 text-[#2D2621]">
            <div className="bg-[#FAF8F5] p-5 rounded-2xl border border-[#E8E1DA] space-y-3">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-[#4A3F35]" />
                <h4 className="text-xs font-bold text-[#2D2621]">إضافة ملاحظة داخلية خاصة بفريق العمل</h4>
              </div>
              <p className="text-[11px] text-[#8C7D73]">
                هذه الملاحظات مخصصة لفريق الإدارة، مسؤولي التجهيز، ومندوبي التوصيل فقط ولا تظهر للزبونة على الفاتورة.
              </p>

              <form onSubmit={handleAddStaffNote} className="space-y-3 pt-2">
                <div className="flex flex-col sm:flex-row gap-2">
                  <select
                    value={newNoteAuthor}
                    onChange={e => setNewNoteAuthor(e.target.value)}
                    className="py-2 px-3 bg-white border border-[#E8E1DA] rounded-xl text-xs font-bold text-[#2D2621] focus:outline-none focus:border-[#4A3F35]"
                  >
                    <option value="كادر المتجر">كادر المتجر (أسواق المثنى)</option>
                    <option value="مسؤول التجهيز">مسؤول التجهيز والتغليف</option>
                    <option value="مسؤول التوصيل">مسؤول التوصيل والشحن</option>
                    <option value="خدمة العملاء">خدمة العملاء والواتساب</option>
                    <option value="الإدارة العامة">الإدارة العامة</option>
                  </select>

                  <input
                    type="text"
                    placeholder="اكتب ملاحظة للفريق (مثال: تم الاتصال بالزبونة، جاهز للشحن، المقاس مضبوط...)"
                    value={newNoteText}
                    onChange={e => setNewNoteText(e.target.value)}
                    className="flex-1 py-2 px-3 bg-white border border-[#E8E1DA] rounded-xl text-xs text-[#2D2621] focus:outline-none focus:border-[#4A3F35]"
                  />

                  <button
                    type="submit"
                    disabled={!newNoteText.trim() || isSubmittingNote}
                    className="px-4 py-2 bg-[#4A3F35] hover:bg-[#3B322A] text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50 shrink-0"
                  >
                    {isSubmittingNote ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                    <span>إضافة ملاحظة</span>
                  </button>
                </div>
              </form>
            </div>

            {/* List of existing staff notes */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-[#4A3F35] flex items-center justify-between">
                <span>سجل الملاحظات الداخلية ({staffNotes.length})</span>
                <span className="text-[10px] text-[#8C7D73] font-normal">مرتبة من الأحدث إلى الأقدم</span>
              </h4>

              {staffNotes.length === 0 ? (
                <div className="p-8 text-center bg-[#FAF8F5] rounded-2xl border border-dashed border-[#E8E1DA] text-[#8C7D73] text-xs">
                  لا توجد ملاحظات داخلية مسجلة لهذا الطلب بعد. يمكنك إضافة أول ملاحظة أعلاه.
                </div>
              ) : (
                <div className="space-y-2.5">
                  {staffNotes.map(note => (
                    <div
                      key={note.id}
                      className="bg-white p-3.5 rounded-2xl border border-[#E8E1DA] flex items-start justify-between gap-3 shadow-2xs hover:border-[#4A3F35]/30 transition-colors"
                    >
                      <div className="space-y-1 text-xs">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded-md bg-[#FAF8F5] border border-[#E8E1DA] text-[10px] font-bold text-[#4A3F35]">
                            {note.author}
                          </span>
                          <span className="text-[10px] text-[#8C7D73] font-mono flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {new Date(note.createdAt).toLocaleString('ar-IQ')}
                          </span>
                        </div>
                        <p className="text-[#2D2621] font-medium leading-relaxed pr-1">{note.text}</p>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleDeleteStaffNote(note.id)}
                        className="p-1.5 rounded-lg text-[#8C7D73] hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer shrink-0"
                        title="حذف الملاحظة"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Status History */}
            <div className="space-y-2 pt-4 border-t border-[#E8E1DA]">
              <h4 className="text-xs font-bold text-[#4A3F35]">سجل حركة وحالة الطلب</h4>
              <div className="space-y-2">
                {order.statusHistory.map((sh, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs p-2.5 rounded-xl bg-[#FAF8F5] border border-[#E8E1DA]">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${getStatusBadge(sh.status).bg}`}>
                        {getStatusBadge(sh.status).label}
                      </span>
                      <span className="text-[#5C5046]">{sh.note}</span>
                    </div>
                    <span className="text-[10px] text-[#8C7D73] font-mono">
                      {new Date(sh.timestamp).toLocaleString('ar-IQ')}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Bottom Actions (Hidden on print) */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-6 border-t border-[#E8E1DA] mt-6 print:hidden">
          <div className="flex items-center gap-2">
            {onUpdateStatus && (
              <div className="flex items-center gap-1.5 text-xs">
                <span className="text-[#8C7D73]">تحديث حالة الطلب:</span>
                <select
                  value={order.status}
                  onChange={e => onUpdateStatus(order.id, e.target.value)}
                  className="py-1.5 px-3 bg-[#FAF8F5] border border-[#E8E1DA] rounded-xl text-xs font-bold focus:outline-none text-[#2D2621]"
                >
                  <option value="received">تم الاستلام</option>
                  <option value="processing">قيد التجهيز</option>
                  <option value="out_for_delivery">خرج للتوصيل</option>
                  <option value="delivered">تم التسليم</option>
                  <option value="cancelled">ملغي</option>
                </select>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <a
              href={`https://wa.me/964${order.customerPhone.replace(/^0+/, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="py-2 px-4 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>مراسلة واتساب</span>
            </a>

            <button
              type="button"
              onClick={handleDownloadPdf}
              disabled={isGeneratingPdf}
              className="py-2 px-4 bg-gradient-to-r from-amber-700 to-[#4A3F35] hover:opacity-90 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all cursor-pointer shadow-xs disabled:opacity-50"
            >
              <Download className="w-3.5 h-3.5" />
              <span>تنزيل PDF</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
