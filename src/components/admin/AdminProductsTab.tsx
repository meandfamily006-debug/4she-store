import React, { useState } from 'react';
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  PackagePlus,
  AlertCircle,
  AlertTriangle,
  Sparkles,
  CheckCircle2,
  History,
  TrendingDown,
  TrendingUp,
  Sliders,
  X,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  ShieldCheck,
  ChevronDown,
  Check,
  Package
} from 'lucide-react';
import { Product, StockMovement } from '../../types';
import { formatIQD } from '../../utils/formatters';

interface AdminProductsTabProps {
  products: Product[];
  onOpenAddProduct: () => void;
  onOpenEditProduct: (product: Product) => void;
  onDeleteProduct: (productId: string) => void;
  onOpenRestockModal: (productId: string) => void;
  onProductUpdated?: () => void;
}

export const AdminProductsTab: React.FC<AdminProductsTabProps> = ({
  products,
  onOpenAddProduct,
  onOpenEditProduct,
  onDeleteProduct,
  onOpenRestockModal,
  onProductUpdated
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [stockFilter, setStockFilter] = useState<'all' | 'safe' | 'low' | 'out'>('all');

  // Fast inline stock adjustment loading state
  const [adjustingProductId, setAdjustingProductId] = useState<string | null>(null);

  // Selected product for stock movements history modal
  const [historyProduct, setHistoryProduct] = useState<Product | null>(null);

  // Threshold edit modal
  const [thresholdProduct, setThresholdProduct] = useState<Product | null>(null);
  const [tempThreshold, setTempThreshold] = useState<number>(3);
  const [isSavingThreshold, setIsSavingThreshold] = useState(false);

  const categories = Array.from(new Set(products.map(p => p.category)));

  // Calculate inventory metrics
  const totalStockItems = products.reduce((sum, p) => sum + (p.stock || 0), 0);
  const outOfStockProducts = products.filter(p => (p.stock || 0) === 0);
  const lowStockProducts = products.filter(p => {
    const threshold = p.lowStockThreshold ?? 3;
    return p.stock > 0 && p.stock <= threshold;
  });
  const safeStockProducts = products.filter(p => {
    const threshold = p.lowStockThreshold ?? 3;
    return p.stock > threshold;
  });

  const filteredProducts = products.filter(p => {
    const threshold = p.lowStockThreshold ?? 3;
    if (categoryFilter !== 'all' && p.category !== categoryFilter) return false;
    if (stockFilter === 'safe' && p.stock <= threshold) return false;
    if (stockFilter === 'low' && (p.stock === 0 || p.stock > threshold)) return false;
    if (stockFilter === 'out' && p.stock > 0) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        (p.id && p.id.toLowerCase().includes(q))
      );
    }
    return true;
  });

  // Quick stock adjust (+ / -)
  const handleQuickAdjustStock = async (prod: Product, delta: number) => {
    const newStock = Math.max(0, prod.stock + delta);
    setAdjustingProductId(prod.id);

    try {
      const res = await fetch('/api/admin/inventory/quick-adjust', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: prod.id,
          change: delta,
          reason: delta > 0 ? `تزويد سريع (+${delta}) من لوحة المخزون` : `خصم كمية (${delta}) من لوحة المخزون`
        })
      });

      if (res.ok) {
        prod.stock = newStock;
        if (onProductUpdated) onProductUpdated();
      }
    } catch (err) {
      console.error('Error quick adjusting stock:', err);
    } finally {
      setAdjustingProductId(null);
    }
  };

  // Update threshold
  const handleSaveThreshold = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!thresholdProduct || isSavingThreshold) return;

    setIsSavingThreshold(true);
    try {
      const res = await fetch(`/api/products/${thresholdProduct.id}/threshold`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lowStockThreshold: tempThreshold
        })
      });

      if (res.ok) {
        thresholdProduct.lowStockThreshold = tempThreshold;
        if (onProductUpdated) onProductUpdated();
        setThresholdProduct(null);
      }
    } catch (err) {
      console.error('Error saving threshold:', err);
    } finally {
      setIsSavingThreshold(false);
    }
  };

  return (
    <div className="space-y-6 text-right">
      {/* INVENTORY METRICS & SMART ALERTS BANNER */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Stock */}
        <div className="bg-white p-5 rounded-3xl border border-[#E8E1DA] shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs text-[#8C7D73] font-semibold">إجمالي رصيد القطع بالمخزن</p>
            <h4 className="text-2xl font-black text-[#2D2621] mt-1 font-mono">{totalStockItems} <span className="text-xs font-normal text-[#8C7D73]">قطعة</span></h4>
            <p className="text-[11px] text-[#5C5046] mt-0.5">{products.length} موديلات مسجلة</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-[#F2EAE4] text-[#4A3F35] flex items-center justify-center">
            <Package className="w-6 h-6" />
          </div>
        </div>

        {/* Low Stock Alert */}
        <div
          onClick={() => setStockFilter(stockFilter === 'low' ? 'all' : 'low')}
          className={`p-5 rounded-3xl border transition-all cursor-pointer shadow-xs flex items-center justify-between ${
            lowStockProducts.length > 0
              ? 'bg-amber-50/80 border-amber-200 hover:bg-amber-100/70 text-amber-900'
              : 'bg-white border-[#E8E1DA] text-[#2D2621]'
          }`}
        >
          <div>
            <div className="flex items-center gap-1.5">
              <p className="text-xs font-bold text-amber-900">تنبيه انخفاض المخزون</p>
              {lowStockProducts.length > 0 && (
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
              )}
            </div>
            <h4 className="text-2xl font-black text-amber-950 mt-1 font-mono">{lowStockProducts.length} <span className="text-xs font-normal">موديلات</span></h4>
            <p className="text-[11px] text-amber-800/80 mt-0.5">تحتاج توريد عاجل قبل النفاد</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>

        {/* Out of Stock Alert */}
        <div
          onClick={() => setStockFilter(stockFilter === 'out' ? 'all' : 'out')}
          className={`p-5 rounded-3xl border transition-all cursor-pointer shadow-xs flex items-center justify-between ${
            outOfStockProducts.length > 0
              ? 'bg-rose-50/80 border-rose-200 hover:bg-rose-100/70 text-rose-900'
              : 'bg-white border-[#E8E1DA] text-[#2D2621]'
          }`}
        >
          <div>
            <p className="text-xs font-bold text-rose-900">قطع نفدت من المخزن</p>
            <h4 className="text-2xl font-black text-rose-950 mt-1 font-mono">{outOfStockProducts.length} <span className="text-xs font-normal">موديل</span></h4>
            <p className="text-[11px] text-rose-800/80 mt-0.5">غير متوفرة للزبائن حالياً</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center">
            <AlertCircle className="w-6 h-6" />
          </div>
        </div>

        {/* Safe Stock */}
        <div
          onClick={() => setStockFilter(stockFilter === 'safe' ? 'all' : 'safe')}
          className="bg-white p-5 rounded-3xl border border-[#E8E1DA] hover:bg-[#FAF8F5] transition-all cursor-pointer shadow-xs flex items-center justify-between"
        >
          <div>
            <p className="text-xs text-emerald-800 font-bold">مخزون وافر وآمن</p>
            <h4 className="text-2xl font-black text-emerald-950 mt-1 font-mono">{safeStockProducts.length} <span className="text-xs font-normal text-[#8C7D73]">موديل</span></h4>
            <p className="text-[11px] text-[#8C7D73] mt-0.5">فوق الحد الأدنى للتنبيه</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
            <ShieldCheck className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* AUTOMATIC ALERT CALLOUT IF LOW STOCK DETECTED */}
      {lowStockProducts.length > 0 && stockFilter !== 'low' && (
        <div className="bg-amber-50 border border-amber-200 p-4 rounded-3xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-amber-900">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-amber-200/80 flex items-center justify-center text-amber-800 shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h5 className="text-xs font-bold">تنبيه ذكي: يوجد {lowStockProducts.length} موديلات وصلت للحد الأدنى المسموح به</h5>
              <p className="text-[11px] text-amber-800/80">
                القطع: {lowStockProducts.slice(0, 3).map(p => p.name).join('، ')} {lowStockProducts.length > 3 ? 'وغيرها...' : ''}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setStockFilter('low')}
              className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
            >
              عرض القطع المنخفضة
            </button>
            <button
              type="button"
              onClick={() => onOpenRestockModal('')}
              className="px-3.5 py-1.5 bg-white border border-amber-300 hover:bg-amber-100 text-amber-900 rounded-xl text-xs font-bold transition-colors cursor-pointer"
            >
              + توريد شحنة
            </button>
          </div>
        </div>
      )}

      {/* Products Toolbar */}
      <div className="bg-white p-4 sm:p-6 rounded-3xl border border-[#E8E1DA] shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-[#2D2621]">إدارة المخزون وتتبع الكميات</h3>
            <p className="text-xs text-[#8C7D73]">مراقبة رصيد الموديلات، ضبط حدود التنبيه التلقائي، التعديل السريع، وتوريد شحنات جديدة</p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onOpenRestockModal('')}
              className="px-4 py-2.5 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 text-xs font-bold rounded-2xl flex items-center justify-center gap-1.5 cursor-pointer transition-colors border border-emerald-200 shrink-0"
            >
              <PackagePlus className="w-4 h-4 text-emerald-600" />
              <span>توريد شحنة بضاعة</span>
            </button>

            <button
              type="button"
              onClick={onOpenAddProduct}
              className="px-5 py-2.5 bg-[#4A3F35] hover:bg-[#3B322A] text-white text-xs font-bold rounded-2xl flex items-center justify-center gap-2 cursor-pointer transition-all shadow-sm border border-[#6B5E54]/30 shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>+ إضافة موديل جديد</span>
            </button>
          </div>
        </div>

        {/* Filters and Stock Chips */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-[#E8E1DA]">
          <button
            type="button"
            onClick={() => setStockFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              stockFilter === 'all'
                ? 'bg-[#4A3F35] text-white shadow-xs'
                : 'bg-[#FAF8F5] text-[#5C5046] hover:bg-[#F2EAE4]'
            }`}
          >
            كل المنتجات ({products.length})
          </button>

          <button
            type="button"
            onClick={() => setStockFilter('low')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              stockFilter === 'low'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>تنبيه المخزون المنخفض ({lowStockProducts.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setStockFilter('out')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              stockFilter === 'out'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'bg-rose-50 text-rose-800 border border-rose-200 hover:bg-rose-100'
            }`}
          >
            <AlertCircle className="w-3.5 h-3.5" />
            <span>نفد من المخزن ({outOfStockProducts.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setStockFilter('safe')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              stockFilter === 'safe'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>مخزون وافر ({safeStockProducts.length})</span>
          </button>
        </div>

        {/* Search & Category Select */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          <div className="relative">
            <Search className="w-4 h-4 text-[#8C7D73] absolute right-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="ابحثي عن فستان، طقم، كيمونو، كود المنتج..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-3 pr-9 py-2 text-xs bg-[#FAF8F5] border border-[#E8E1DA] rounded-xl focus:outline-none focus:border-[#4A3F35] text-[#2D2621]"
            />
          </div>

          <select
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
            className="py-2 px-3 bg-[#FAF8F5] border border-[#E8E1DA] rounded-xl text-xs font-semibold focus:outline-none focus:border-[#4A3F35] text-[#2D2621]"
          >
            <option value="all">كل الأقسام والتصنيفات ({products.length})</option>
            {categories.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Products & Inventory Table */}
      <div className="bg-white rounded-3xl border border-[#E8E1DA] overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-right">
            <thead className="bg-[#FAF8F5] text-[#5C5046] border-b border-[#E8E1DA]">
              <tr>
                <th className="p-4 font-semibold">الصورة</th>
                <th className="p-4 font-semibold">اسم الموديل والتصنيف</th>
                <th className="p-4 font-semibold">السعر الحالي</th>
                <th className="p-4 font-semibold">حالة المخزون والرصيد</th>
                <th className="p-4 font-semibold text-center">تعديل سريع للرصيد</th>
                <th className="p-4 font-semibold">حد التنبيه</th>
                <th className="p-4 font-semibold text-center">إجراءات المخزن</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8E1DA]/60">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-12 text-center text-[#8C7D73] text-xs">
                    لا توجد منتجات مطابقة للبحث أو الفلتر المحدد
                  </td>
                </tr>
              ) : (
                filteredProducts.map(prod => {
                  const threshold = prod.lowStockThreshold ?? 3;
                  const isOutOfStock = prod.stock === 0;
                  const isLowStock = prod.stock > 0 && prod.stock <= threshold;
                  const isAdjusting = adjustingProductId === prod.id;

                  return (
                    <tr
                      key={prod.id}
                      className={`hover:bg-[#FAF8F5] transition-colors ${
                        isOutOfStock ? 'bg-rose-50/30' : isLowStock ? 'bg-amber-50/30' : ''
                      }`}
                    >
                      {/* Image */}
                      <td className="p-4">
                        <img
                          src={prod.images[0]}
                          alt=""
                          className="w-12 h-14 rounded-xl object-cover border border-[#E8E1DA] shrink-0"
                        />
                      </td>

                      {/* Product Name & Category */}
                      <td className="p-4">
                        <p className="font-bold text-[#2D2621]">{prod.name}</p>
                        <div className="flex items-center gap-1.5 mt-1">
                          <span className="px-2 py-0.5 rounded-md bg-[#FAF8F5] border border-[#E8E1DA] text-[10px] font-semibold text-[#5C5046]">
                            {prod.category}
                          </span>
                          <span className="text-[10px] text-[#8C7D73] font-mono">
                            {prod.id}
                          </span>
                        </div>
                      </td>

                      {/* Price */}
                      <td className="p-4 font-black text-[#4A3F35]">
                        <div>{formatIQD(prod.price)}</div>
                        {prod.originalPrice && prod.originalPrice > prod.price && (
                          <span className="text-[10px] text-[#8C7D73] line-through font-normal">
                            {formatIQD(prod.originalPrice)}
                          </span>
                        )}
                      </td>

                      {/* Stock Level & Status Badge */}
                      <td className="p-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span
                              className={`px-2.5 py-1 rounded-full text-[11px] font-bold inline-flex items-center gap-1 ${
                                isOutOfStock
                                  ? 'bg-rose-100 text-rose-900 border border-rose-200'
                                  : isLowStock
                                  ? 'bg-amber-100 text-amber-900 border border-amber-200'
                                  : 'bg-emerald-100 text-emerald-900 border border-emerald-200'
                              }`}
                            >
                              {isOutOfStock ? (
                                <>
                                  <AlertCircle className="w-3 h-3 text-rose-700" />
                                  <span>نفد من المخزن (0)</span>
                                </>
                              ) : isLowStock ? (
                                <>
                                  <AlertTriangle className="w-3 h-3 text-amber-700" />
                                  <span>منخفض: {prod.stock} قطع</span>
                                </>
                              ) : (
                                <>
                                  <ShieldCheck className="w-3 h-3 text-emerald-700" />
                                  <span>متوفر: {prod.stock} قطع</span>
                                </>
                              )}
                            </span>
                          </div>

                          {/* Mini Visual Bar */}
                          <div className="w-28 h-1.5 bg-[#E8E1DA] rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all ${
                                isOutOfStock
                                  ? 'w-0'
                                  : isLowStock
                                  ? 'bg-amber-500 w-1/4'
                                  : 'bg-emerald-600 w-3/4'
                              }`}
                            />
                          </div>
                        </div>
                      </td>

                      {/* Quick Adjust Buttons */}
                      <td className="p-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            type="button"
                            disabled={prod.stock <= 0 || isAdjusting}
                            onClick={() => handleQuickAdjustStock(prod, -1)}
                            className="w-7 h-7 rounded-lg bg-[#FAF8F5] hover:bg-[#F2EAE4] border border-[#E8E1DA] text-[#4A3F35] font-bold text-xs flex items-center justify-center cursor-pointer disabled:opacity-40"
                            title="خصم قطعة (-1)"
                          >
                            -1
                          </button>

                          <span className="w-8 font-mono font-bold text-center text-[#2D2621]">
                            {prod.stock}
                          </span>

                          <button
                            type="button"
                            disabled={isAdjusting}
                            onClick={() => handleQuickAdjustStock(prod, 1)}
                            className="w-7 h-7 rounded-lg bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 font-bold text-xs flex items-center justify-center cursor-pointer disabled:opacity-40"
                            title="إضافة قطعة (+1)"
                          >
                            +1
                          </button>

                          <button
                            type="button"
                            disabled={isAdjusting}
                            onClick={() => handleQuickAdjustStock(prod, 5)}
                            className="px-1.5 h-7 rounded-lg bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 font-bold text-[10px] flex items-center justify-center cursor-pointer disabled:opacity-40"
                            title="إضافة 5 قطع (+5)"
                          >
                            +5
                          </button>
                        </div>
                      </td>

                      {/* Threshold Configuration */}
                      <td className="p-4">
                        <button
                          type="button"
                          onClick={() => {
                            setThresholdProduct(prod);
                            setTempThreshold(prod.lowStockThreshold ?? 3);
                          }}
                          className="px-2.5 py-1 rounded-xl bg-[#FAF8F5] hover:bg-[#F2EAE4] border border-[#E8E1DA] text-[#5C5046] text-[11px] font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
                          title="تعديل حد التنبيه التلقائي"
                        >
                          <Sliders className="w-3 h-3 text-[#8C7D73]" />
                          <span>حد: {threshold} قطع</span>
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="p-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => onOpenRestockModal(prod.id)}
                            className="py-1.5 px-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] transition-colors cursor-pointer shadow-2xs"
                            title="توريد شحنة لهذا الموديل"
                          >
                            + توريد
                          </button>

                          <button
                            type="button"
                            onClick={() => setHistoryProduct(prod)}
                            className="p-1.5 rounded-xl bg-[#FAF8F5] text-[#5C5046] hover:bg-[#F2EAE4] transition-colors cursor-pointer border border-[#E8E1DA]"
                            title="سجل حركات وتوريد المخزون"
                          >
                            <History className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => onOpenEditProduct(prod)}
                            className="p-1.5 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors cursor-pointer border border-blue-200"
                            title="تعديل تفاصيل الموديل"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => onDeleteProduct(prod.id)}
                            className="p-1.5 rounded-xl bg-rose-50 text-rose-700 hover:bg-rose-100 transition-colors cursor-pointer border border-rose-200"
                            title="حذف الموديل"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
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

      {/* STOCK MOVEMENT HISTORY MODAL */}
      {historyProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl p-6 border border-[#E8E1DA] my-auto text-right">
            <div className="flex items-center justify-between pb-4 border-b border-[#E8E1DA]">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-2xl bg-[#FAF8F5] border border-[#E8E1DA] flex items-center justify-center text-[#4A3F35]">
                  <History className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#2D2621]">سجل حركات وتوريد المخزون</h3>
                  <p className="text-xs text-[#8C7D73]">{historyProduct.name}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setHistoryProduct(null)}
                className="p-2 rounded-full text-[#8C7D73] hover:text-[#2D2621] hover:bg-[#FAF8F5] transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="pt-4 space-y-4">
              <div className="bg-[#FAF8F5] p-3.5 rounded-2xl border border-[#E8E1DA] flex items-center justify-between text-xs">
                <div>
                  <span className="text-[#8C7D73]">الرصيد الحالي بالمخزن:</span>
                  <strong className="text-base text-[#4A3F35] font-mono mr-2">{historyProduct.stock} قطع</strong>
                </div>
                <div>
                  <span className="text-[#8C7D73]">حد التنبيه:</span>
                  <strong className="text-xs text-amber-800 mr-2">{historyProduct.lowStockThreshold ?? 3} قطع</strong>
                </div>
              </div>

              <div className="space-y-2 max-h-[300px] overflow-y-auto">
                <h4 className="text-xs font-bold text-[#4A3F35]">الحركات والتوريدات السابقة</h4>
                {(!historyProduct.stockMovements || historyProduct.stockMovements.length === 0) ? (
                  <div className="p-6 text-center text-xs text-[#8C7D73] bg-[#FAF8F5] rounded-2xl border border-dashed border-[#E8E1DA]">
                    لا توجد حركات مسجلة مؤخراً لهذا المنتج
                  </div>
                ) : (
                  historyProduct.stockMovements.map(mov => (
                    <div
                      key={mov.id}
                      className="bg-white p-3 rounded-xl border border-[#E8E1DA] flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold ${
                            mov.quantity > 0
                              ? 'bg-emerald-50 text-emerald-700'
                              : 'bg-rose-50 text-rose-700'
                          }`}
                        >
                          {mov.quantity > 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                        </div>
                        <div>
                          <p className="font-bold text-[#2D2621]">{mov.reason || 'حركة مخزون'}</p>
                          <p className="text-[10px] text-[#8C7D73] font-mono flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {new Date(mov.timestamp).toLocaleString('ar-IQ')}
                          </p>
                        </div>
                      </div>

                      <div className="text-left font-mono font-bold">
                        <span className={mov.quantity > 0 ? 'text-emerald-700' : 'text-rose-700'}>
                          {mov.quantity > 0 ? `+${mov.quantity}` : mov.quantity}
                        </span>
                        <div className="text-[10px] text-[#8C7D73] font-normal">
                          الرصيد: {mov.newStock}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    const pid = historyProduct.id;
                    setHistoryProduct(null);
                    onOpenRestockModal(pid);
                  }}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                >
                  <PackagePlus className="w-4 h-4" />
                  <span>توريد شحنة جديدة لهذا المنتج</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* THRESHOLD CONFIGURATION MODAL */}
      {thresholdProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-sm bg-white rounded-3xl shadow-2xl p-6 border border-[#E8E1DA] my-auto text-right">
            <div className="flex items-center justify-between pb-3 border-b border-[#E8E1DA]">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-[#4A3F35]" />
                <h3 className="text-sm font-bold text-[#2D2621]">ضبط حد التنبيه التلقائي</h3>
              </div>
              <button
                type="button"
                onClick={() => setThresholdProduct(null)}
                className="p-1.5 rounded-full text-[#8C7D73] hover:text-[#2D2621] hover:bg-[#FAF8F5] transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveThreshold} className="pt-4 space-y-4">
              <div>
                <p className="text-xs text-[#5C5046] font-bold">{thresholdProduct.name}</p>
                <p className="text-[11px] text-[#8C7D73] mt-1">
                  سيتم إطلاق تنبيه تلقائي في لوحة التحكم عند وصول الكمية المتوفرة إلى هذا الرقم أو أقل.
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-[#2D2621]">الحد الأدنى للتنبيه (قطع)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={tempThreshold}
                  onChange={e => setTempThreshold(Number(e.target.value))}
                  className="w-full py-2.5 px-3 bg-[#FAF8F5] border border-[#E8E1DA] rounded-xl text-sm font-bold text-[#2D2621] focus:outline-none focus:border-[#4A3F35]"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="submit"
                  disabled={isSavingThreshold}
                  className="flex-1 py-2.5 bg-[#4A3F35] hover:bg-[#3B322A] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-xs disabled:opacity-50"
                >
                  <Check className="w-4 h-4" />
                  <span>حفظ التعديل</span>
                </button>
                <button
                  type="button"
                  onClick={() => setThresholdProduct(null)}
                  className="px-4 py-2.5 bg-[#FAF8F5] hover:bg-[#F2EAE4] text-[#5C5046] rounded-xl text-xs font-bold cursor-pointer"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
