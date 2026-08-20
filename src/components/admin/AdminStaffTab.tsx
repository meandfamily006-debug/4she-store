import React, { useState } from 'react';
import { UserPlus, Shield, UserCheck, ShieldAlert, Trash2, Edit2, CheckCircle2, Phone, Sparkles } from 'lucide-react';
import { StaffMember } from '../../types';

interface AdminStaffTabProps {
  staff: StaffMember[];
  isManager: boolean;
  currentUserId?: string;
  onRefresh: () => void;
}

export const AdminStaffTab: React.FC<AdminStaffTabProps> = ({
  staff,
  isManager,
  onRefresh
}) => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<StaffMember | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    role: 'worker' as 'manager' | 'worker',
    roleTitle: '',
    permissions: ['orders', 'inventory']
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleOpenAdd = () => {
    setEditingStaff(null);
    setFormData({
      name: '',
      phone: '',
      role: 'worker',
      roleTitle: 'كادر المبيعات والتجهيز',
      permissions: ['orders', 'inventory']
    });
    setErrorMsg('');
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (member: StaffMember) => {
    setEditingStaff(member);
    setFormData({
      name: member.name,
      phone: member.phone,
      role: member.role,
      roleTitle: member.roleTitle,
      permissions: member.permissions || (member.role === 'manager' ? ['all'] : ['orders', 'inventory'])
    });
    setErrorMsg('');
    setIsAddModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg('');

    try {
      if (editingStaff) {
        // Edit
        const res = await fetch(`/api/admin/staff/${editingStaff.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'فشل تحديث بيانات الموظف');
        setSuccessMsg('تم تحديث بيانات العضو بنجاح');
      } else {
        // Add
        const res = await fetch('/api/admin/staff', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'فشل إضافة عضو الكادر');
        setSuccessMsg('تمت إضافة العضو وتفعيل صلاحيات لوحة الإدارة بنجاح');
      }

      setIsAddModalOpen(false);
      onRefresh();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err: any) {
      setErrorMsg(err.message || 'حدث خطأ غير متوقع');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`هل أنتِ متأكدة من إزالة صلاحيات الإدارة عن (${name})؟`)) return;
    try {
      const res = await fetch(`/api/admin/staff/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'فشل إزالة الموظف');
      setSuccessMsg(`تم إلغاء صلاحية الوصول لـ (${name})`);
      onRefresh();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err: any) {
      alert(err.message || 'حدث خطأ');
    }
  };

  const togglePermission = (perm: string) => {
    if (formData.permissions.includes(perm)) {
      setFormData(prev => ({
        ...prev,
        permissions: prev.permissions.filter(p => p !== perm)
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        permissions: [...prev.permissions, perm]
      }));
    }
  };

  return (
    <div className="space-y-6 text-right" dir="rtl">
      {/* Top Notification */}
      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2 shadow-xs">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Staff Header Card */}
      <div className="bg-white p-6 rounded-3xl border border-[#E8E1DA] shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-[#F2EAE4] text-[#4A3F35] text-[11px] font-bold border border-[#E8DDD5] flex items-center gap-1">
              <Shield className="w-3.5 h-3.5 text-[#A67C52]" />
              <span>نظام حماية الصلاحيات (RBAC)</span>
            </span>
            <span className="text-xs text-[#8C7D73]">حصري للمدير والعمال المصرح لهم</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-[#2D2621] mt-1">
            إدارة الكادر والصلاحيات
          </h2>
          <p className="text-xs text-[#8C7D73] mt-1 max-w-xl">
            يمكن فقط للأرقام المسجلة في هذه القائمة الوصول إلى لوحة الإدارة. يتم تسجيل الدخول عبر رمز التحقق OTP، وتطبيق الصلاحيات فورياً.
          </p>
        </div>

        {isManager && (
          <button
            type="button"
            onClick={handleOpenAdd}
            className="px-4 py-2.5 rounded-2xl bg-[#4A3F35] hover:bg-[#3B322A] text-white text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-sm border border-[#6B5E54]/30 shrink-0"
          >
            <UserPlus className="w-4 h-4" />
            <span>+ إضافة عامل / مدير جديد</span>
          </button>
        )}
      </div>

      {/* Staff Grid Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {staff.map(member => {
          const isManagerRole = member.role === 'manager';
          const isOwner = member.phone === '07707440557';

          return (
            <div
              key={member.id}
              className="bg-white rounded-3xl border border-[#E8E1DA] p-5 shadow-xs hover:border-[#A67C52]/40 transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-base shadow-xs ${
                        isManagerRole
                          ? 'bg-amber-100 text-amber-900 border border-amber-200'
                          : 'bg-[#F2EAE4] text-[#4A3F35] border border-[#E8DDD5]'
                      }`}
                    >
                      {isManagerRole ? <Shield className="w-5 h-5 text-amber-800" /> : <UserCheck className="w-5 h-5 text-[#4A3F35]" />}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-[#2D2621] flex items-center gap-1.5">
                        <span>{member.name}</span>
                        {isOwner && (
                          <span className="px-1.5 py-0.5 rounded-md bg-amber-50 text-amber-800 text-[10px] font-bold border border-amber-200">
                            المالك
                          </span>
                        )}
                      </h3>
                      <p className="text-xs text-[#8C7D73] font-medium">{member.roleTitle}</p>
                    </div>
                  </div>

                  <span
                    className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                      isManagerRole
                        ? 'bg-amber-50 text-amber-800 border border-amber-200'
                        : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    }`}
                  >
                    {isManagerRole ? 'مدير (Manager)' : 'عامل (Worker)'}
                  </span>
                </div>

                <div className="bg-[#FAF8F5] p-3 rounded-2xl border border-[#E8E1DA] space-y-1.5 text-xs">
                  <div className="flex items-center justify-between text-[#5C5046]">
                    <span className="text-[#8C7D73] flex items-center gap-1">
                      <Phone className="w-3 h-3 text-[#A67C52]" />
                      <span>رقم الهاتف المعتمد:</span>
                    </span>
                    <strong className="font-mono dir-ltr">{member.phone}</strong>
                  </div>
                  <div className="flex items-center justify-between text-[#5C5046]">
                    <span className="text-[#8C7D73]">الحالة:</span>
                    <span className="text-emerald-700 font-bold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                      <span>نشط ومفعل</span>
                    </span>
                  </div>
                </div>

                {/* Permissions Chips */}
                <div>
                  <span className="text-[11px] text-[#8C7D73] font-semibold block mb-1.5">الصلاحيات الممنوحة:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {member.permissions?.includes('all') ? (
                      <span className="px-2 py-0.5 rounded-xl bg-amber-100/70 text-amber-900 text-[10px] font-bold border border-amber-200">
                        ✨ كامل الصلاحيات الإدارية
                      </span>
                    ) : (
                      <>
                        {member.permissions?.includes('orders') && (
                          <span className="px-2 py-0.5 rounded-xl bg-blue-50 text-blue-800 text-[10px] font-bold border border-blue-200">
                            📦 إدارة الطلبات والفواتير
                          </span>
                        )}
                        {member.permissions?.includes('inventory') && (
                          <span className="px-2 py-0.5 rounded-xl bg-emerald-50 text-emerald-800 text-[10px] font-bold border border-emerald-200">
                            🏷️ المخزون والتوريد
                          </span>
                        )}
                        {member.permissions?.includes('reviews') && (
                          <span className="px-2 py-0.5 rounded-xl bg-purple-50 text-purple-800 text-[10px] font-bold border border-purple-200">
                            ⭐ المراجعات والتقييمات
                          </span>
                        )}
                        {member.permissions?.includes('settings') && (
                          <span className="px-2 py-0.5 rounded-xl bg-rose-50 text-rose-800 text-[10px] font-bold border border-rose-200">
                            ⚙️ إعدادات المتجر
                          </span>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Actions */}
              {isManager && (
                <div className="pt-3 border-t border-[#E8E1DA] flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => handleOpenEdit(member)}
                    className="p-2 rounded-xl bg-[#FAF8F5] hover:bg-[#F2EAE4] text-[#5C5046] text-xs font-bold transition-colors flex items-center gap-1 border border-[#E8E1DA] cursor-pointer"
                    title="تعديل الصلاحيات"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>تعديل</span>
                  </button>

                  {!isOwner && (
                    <button
                      type="button"
                      onClick={() => handleDelete(member.id, member.name)}
                      className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold transition-colors flex items-center gap-1 border border-rose-200/60 cursor-pointer"
                      title="إلغاء الصلاحيات"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>إلغاء</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Add / Edit Staff Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-[#E8E1DA] space-y-6 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-[#E8E1DA]">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-xl bg-[#F2EAE4] text-[#4A3F35] flex items-center justify-center border border-[#E8DDD5]">
                  <Shield className="w-5 h-5 text-[#A67C52]" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black text-[#2D2621]">
                    {editingStaff ? 'تعديل بيانات عضو الكادر' : 'إضافة عضو جديد لكادر 4sHe'}
                  </h3>
                  <p className="text-xs text-[#8C7D73]">منح صلاحيات الوصول للوحة الإدارة</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="w-8 h-8 rounded-full bg-[#FAF8F5] hover:bg-[#F2EAE4] text-[#5C5046] flex items-center justify-center transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            {errorMsg && (
              <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-[#5C5046]">الاسم الكامل</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: زينب علي / أحمد الموصلي"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full py-2.5 px-3.5 text-xs bg-[#FAF8F5] border border-[#E8E1DA] rounded-xl focus:outline-none focus:border-[#4A3F35] focus:bg-white text-[#2D2621]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-[#5C5046]">رقم الهاتف العراقي (المعتمد لتسجيل الدخول)</label>
                <input
                  type="tel"
                  required
                  placeholder="مثال: 07701234567"
                  value={formData.phone}
                  onChange={e => setFormData({ ...formData, phone: e.target.value })}
                  disabled={!!editingStaff}
                  className="w-full py-2.5 px-3.5 text-xs bg-[#FAF8F5] border border-[#E8E1DA] rounded-xl focus:outline-none focus:border-[#4A3F35] focus:bg-white text-[#2D2621] font-mono dir-ltr text-right disabled:opacity-60"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-[#5C5046]">الرتبة الأساسية</label>
                  <select
                    value={formData.role}
                    onChange={e => {
                      const r = e.target.value as 'manager' | 'worker';
                      setFormData({
                        ...formData,
                        role: r,
                        roleTitle: r === 'manager' ? 'مدير فرع' : 'كادر المبيعات والتجهيز',
                        permissions: r === 'manager' ? ['all'] : ['orders', 'inventory']
                      });
                    }}
                    className="w-full py-2.5 px-3.5 text-xs bg-[#FAF8F5] border border-[#E8E1DA] rounded-xl focus:outline-none focus:border-[#4A3F35] focus:bg-white text-[#2D2621]"
                  >
                    <option value="worker">عامل / كادر المتجر (Worker)</option>
                    <option value="manager">مدير فرع / إدارة عليا (Manager)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-[#5C5046]">المسمى الوظيفي</label>
                  <input
                    type="text"
                    required
                    placeholder="مثال: مسؤول المخزن / موظفة مبيعات"
                    value={formData.roleTitle}
                    onChange={e => setFormData({ ...formData, roleTitle: e.target.value })}
                    className="w-full py-2.5 px-3.5 text-xs bg-[#FAF8F5] border border-[#E8E1DA] rounded-xl focus:outline-none focus:border-[#4A3F35] focus:bg-white text-[#2D2621]"
                  />
                </div>
              </div>

              {/* Permissions Checkboxes */}
              {formData.role === 'worker' && (
                <div className="space-y-2 pt-2 border-t border-[#E8E1DA]">
                  <label className="block text-xs font-bold text-[#5C5046]">صلاحيات العامل المسموحة:</label>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <label className="flex items-center gap-2 p-2.5 bg-[#FAF8F5] rounded-xl border border-[#E8E1DA] cursor-pointer hover:bg-[#F2EAE4]">
                      <input
                        type="checkbox"
                        checked={formData.permissions.includes('orders')}
                        onChange={() => togglePermission('orders')}
                        className="accent-[#4A3F35] w-4 h-4 rounded"
                      />
                      <span className="font-semibold text-[#2D2621]">إدارة الطلبات والفواتير</span>
                    </label>

                    <label className="flex items-center gap-2 p-2.5 bg-[#FAF8F5] rounded-xl border border-[#E8E1DA] cursor-pointer hover:bg-[#F2EAE4]">
                      <input
                        type="checkbox"
                        checked={formData.permissions.includes('inventory')}
                        onChange={() => togglePermission('inventory')}
                        className="accent-[#4A3F35] w-4 h-4 rounded"
                      />
                      <span className="font-semibold text-[#2D2621]">تتبع وتوريد المخزون</span>
                    </label>

                    <label className="flex items-center gap-2 p-2.5 bg-[#FAF8F5] rounded-xl border border-[#E8E1DA] cursor-pointer hover:bg-[#F2EAE4]">
                      <input
                        type="checkbox"
                        checked={formData.permissions.includes('reviews')}
                        onChange={() => togglePermission('reviews')}
                        className="accent-[#4A3F35] w-4 h-4 rounded"
                      />
                      <span className="font-semibold text-[#2D2621]">التقييمات والمراجعات</span>
                    </label>

                    <label className="flex items-center gap-2 p-2.5 bg-[#FAF8F5] rounded-xl border border-[#E8E1DA] cursor-pointer hover:bg-[#F2EAE4]">
                      <input
                        type="checkbox"
                        checked={formData.permissions.includes('settings')}
                        onChange={() => togglePermission('settings')}
                        className="accent-[#4A3F35] w-4 h-4 rounded"
                      />
                      <span className="font-semibold text-[#2D2621]">إعدادات المتجر</span>
                    </label>
                  </div>
                </div>
              )}

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-[#E8E1DA]">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-[#FAF8F5] hover:bg-[#F2EAE4] text-[#5C5046] text-xs font-bold transition-colors cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 rounded-2xl bg-[#4A3F35] hover:bg-[#3B322A] text-white text-xs font-bold transition-all shadow-md cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? 'جاري الحفظ...' : editingStaff ? 'حفظ التعديلات' : 'تفعيل العضو'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
