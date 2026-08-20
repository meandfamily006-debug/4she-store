import React, { useState, useEffect } from 'react';
import { Star, Trash2, CheckCircle2, MessageSquare, AlertCircle, RefreshCw } from 'lucide-react';
import { ProductReview, Product } from '../../types';

interface AdminReviewsTabProps {
  products: Product[];
}

export const AdminReviewsTab: React.FC<AdminReviewsTabProps> = ({ products }) => {
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filterRating, setFilterRating] = useState<number | 'all'>('all');
  const [deleteMsg, setDeleteMsg] = useState('');

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/reviews');
      if (res.ok) {
        const data = await res.json();
        setReviews(Array.isArray(data) ? data : (data.reviews || []));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteReview = async (reviewId: string) => {
    if (!window.confirm('هل أنتِ متأكدة من حذف هذا التقييم؟')) return;

    try {
      const res = await fetch(`/api/admin/reviews/${reviewId}`, { method: 'DELETE' });
      if (res.ok) {
        setReviews(prev => prev.filter(r => r.id !== reviewId));
        setDeleteMsg('تم حذف التقييم وتحديث معدل المنتج بنجاح.');
        setTimeout(() => setDeleteMsg(''), 3000);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filteredReviews = reviews.filter(r => {
    if (filterRating !== 'all' && r.rating !== filterRating) return false;
    return true;
  });

  const getProductName = (productId: string) => {
    const prod = products.find(p => p.id === productId);
    return prod ? prod.name : 'منتج أزياء';
  };

  return (
    <div className="space-y-6 text-right">
      {/* Header and Toolbar */}
      <div className="bg-white p-4 sm:p-6 rounded-3xl border border-[#E8E1DA] shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-[#2D2621]">إدارة ومراقبة تقييمات وآراء العميلات</h3>
          <p className="text-xs text-[#8C7D73]">مراجعة التقييمات الحقيقية لفساتين وأزياء المتجر وإدارتها</p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={filterRating}
            onChange={e => setFilterRating(e.target.value === 'all' ? 'all' : Number(e.target.value))}
            className="py-2 px-3 bg-[#FAF8F5] border border-[#E8E1DA] rounded-xl text-xs font-semibold text-[#2D2621]"
          >
            <option value="all">كافة التقييمات ({reviews.length})</option>
            <option value="5">5 نجوم ⭐⭐⭐⭐⭐</option>
            <option value="4">4 نجوم ⭐⭐⭐⭐</option>
            <option value="3">3 نجوم أو أقل</option>
          </select>

          <button
            type="button"
            onClick={fetchReviews}
            className="p-2 rounded-xl bg-[#FAF8F5] hover:bg-[#F2EAE4] border border-[#E8E1DA] text-[#4A3F35] cursor-pointer"
            title="تحديث المراجعات"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {deleteMsg && (
        <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{deleteMsg}</span>
        </div>
      )}

      {/* Reviews Grid / Table */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredReviews.length === 0 ? (
          <div className="col-span-2 p-12 bg-white rounded-3xl border border-[#E8E1DA] text-center text-xs text-[#8C7D73]">
            لا توجد تقييمات مسجلة حالياً
          </div>
        ) : (
          filteredReviews.map(rev => (
            <div key={rev.id} className="bg-white p-5 rounded-3xl border border-[#E8E1DA] shadow-xs space-y-3 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-[#F2EAE4] text-[#4A3F35] font-bold text-xs flex items-center justify-center">
                      {rev.customerName.charAt(0)}
                    </div>
                    <div>
                      <p className="font-bold text-xs text-[#2D2621]">{rev.customerName}</p>
                      <p className="text-[10px] text-[#8C7D73]">{rev.date}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-0.5 text-amber-500">
                    {[1, 2, 3, 4, 5].map(star => (
                      <Star
                        key={star}
                        className={`w-3.5 h-3.5 ${
                          star <= rev.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-200'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-[#FAF8F5] border border-[#E8E1DA]/60 text-xs text-[#4A3F35]">
                  <p className="font-semibold text-[11px] text-[#8C7D73] mb-1">
                    المنتج: <span className="text-[#2D2621] font-bold">{getProductName(rev.productId)}</span>
                  </p>
                  <p className="italic">"{rev.comment}"</p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-[#E8E1DA]/60">
                <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 font-bold">
                  ✓ شراء موثق
                </span>

                <button
                  type="button"
                  onClick={() => handleDeleteReview(rev.id)}
                  className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer text-xs flex items-center gap-1 font-bold"
                  title="حذف هذا التقييم"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>حذف التقييم</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
