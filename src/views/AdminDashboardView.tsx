import React, { useState, useEffect } from 'react';
import {
  Package,
  ShoppingBag,
  Users,
  Settings,
  Plus,
  RefreshCw,
  Eye,
  Layers,
  Activity,
  PackagePlus,
  Star,
  CheckCircle2,
  Shield,
  ShieldAlert,
  UserCheck,
  Lock
} from 'lucide-react';
import { Product, Order, Customer, StoreSettings, Category, StaffMember } from '../types';
import { useStore } from '../context/StoreContext';
import { useAuth } from '../context/AuthContext';
import { formatIQD } from '../utils/formatters';

// Subcomponents
import { AdminAnalyticsTab } from '../components/admin/AdminAnalyticsTab';
import { AdminOrdersTab } from '../components/admin/AdminOrdersTab';
import { AdminProductsTab } from '../components/admin/AdminProductsTab';
import { AdminReviewsTab } from '../components/admin/AdminReviewsTab';
import { AdminStaffTab } from '../components/admin/AdminStaffTab';
import { CreateOrderModal } from '../components/admin/CreateOrderModal';
import { RestockModal } from '../components/admin/RestockModal';
import { OrderInvoiceModal } from '../components/admin/OrderInvoiceModal';
import { ProductFormModal } from '../components/admin/ProductFormModal';

export const AdminDashboardView: React.FC = () => {
  const { products, categories, settings, refreshStoreData, setActivePage } = useStore();
  const { customer, isAuthenticated, openAuthModal, logout } = useAuth();

  const [activeTab, setActiveTab] = useState<'analytics' | 'orders' | 'products' | 'reviews' | 'staff' | 'categories' | 'customers' | 'settings' | 'logs'>('analytics');
  const [stats, setStats] = useState<any>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Modals state
  const [isCreateOrderModalOpen, setIsCreateOrderModalOpen] = useState(false);
  const [isRestockModalOpen, setIsRestockModalOpen] = useState(false);
  const [restockProductId, setRestockProductId] = useState<string>('');
  const [selectedInvoiceOrder, setSelectedInvoiceOrder] = useState<Order | null>(null);
  const [invoiceDefaultTab, setInvoiceDefaultTab] = useState<'invoice' | 'notes'>('invoice');
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Settings State
  const [settingsForm, setSettingsForm] = useState<StoreSettings>(settings);
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [settingsSavedMessage, setSettingsSavedMessage] = useState(false);

  // Check RBAC Authorization
  const isManager = customer?.role === 'manager' || customer?.phone === '07707440557';
  const isWorker = customer?.role === 'worker';
  const isAuthorizedStaff = isAuthenticated && (isManager || isWorker);

  useEffect(() => {
    if (isAuthorizedStaff) {
      fetchAdminData();
    }
  }, [isAuthorizedStaff]);

  useEffect(() => {
    if (settings) {
      setSettingsForm(settings);
    }
  }, [settings]);

  const fetchAdminData = async () => {
    setIsLoading(true);
    try {
      const [statsRes, ordersRes, custRes, logsRes, staffRes] = await Promise.all([
        fetch('/api/admin/analytics'),
        fetch('/api/orders'),
        fetch('/api/admin/customers'),
        fetch('/api/admin/logs'),
        fetch('/api/admin/staff')
      ]);

      if (statsRes.ok) {
        const d = await statsRes.json();
        setStats(d.analytics || d);
      }
      if (ordersRes.ok) {
        const d = await ordersRes.json();
        setOrders(Array.isArray(d) ? d : (d.orders || []));
      }
      if (custRes.ok) {
        const d = await custRes.json();
        setCustomers(Array.isArray(d) ? d : (d.customers || []));
      }
      if (logsRes.ok) {
        const d = await logsRes.json();
        setLogs(Array.isArray(d) ? d : (d.logs || []));
      }
      if (staffRes.ok) {
        const d = await staffRes.json();
        setStaff(d.staff || []);
      }
    } catch (err) {
      console.error('Failed to load admin data', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Order Status update
  const handleUpdateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });

      if (res.ok) {
        const updated = await res.json();
        setOrders(prev => prev.map(o => (o.id === orderId ? (updated.order || o) : o)));
        if (selectedInvoiceOrder && selectedInvoiceOrder.id === orderId) {
          setSelectedInvoiceOrder(updated.order || { ...selectedInvoiceOrder, status: newStatus as any });
        }
        fetchAdminData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Bulk Order Status update
  const handleBulkUpdateOrderStatus = async (orderIds: string[], status: string, note?: string) => {
    try {
      const res = await fetch('/api/admin/orders/bulk-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderIds, status, note })
      });

      if (res.ok) {
        await fetchAdminData();
      }
    } catch (err) {
      console.error('Bulk update error:', err);
    }
  };

  // Product Delete
  const handleDeleteProduct = async (id: string) => {
    if (!window.confirm('هل أنتِ متأكدة من حذف هذا المنتج نهائيًا؟')) return;

    try {
      const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
      if (res.ok) {
        await refreshStoreData();
        fetchAdminData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Open Restock Modal
  const handleOpenRestock = (productId?: string) => {
    setRestockProductId(productId || (products[0]?.id || ''));
    setIsRestockModalOpen(true);
  };

  // Open Add / Edit Product Modal
  const handleOpenAddProduct = () => {
    setEditingProduct(null);
    setIsProductModalOpen(true);
  };

  const handleOpenEditProduct = (prod: Product) => {
    setEditingProduct(prod);
    setIsProductModalOpen(true);
  };

  // Settings Save
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingSettings(true);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settingsForm)
      });

      if (res.ok) {
        await refreshStoreData();
        setSettingsSavedMessage(true);
        setTimeout(() => setSettingsSavedMessage(false), 3000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSavingSettings(false);
    }
  };

  // -------------------------------------------------------------
  // GUARD SCREEN: Access restricted to Manager and Workers only
  // -------------------------------------------------------------
  if (!isAuthorizedStaff) {
    return (
      <div className="py-16 bg-[#FAF8F5] min-h-[80vh] flex items-center justify-center p-4 text-right" dir="rtl">
        <div className="max-w-md w-full bg-white p-8 rounded-3xl border border-[#E8E1DA] shadow-xl space-y-6 text-center">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-800 flex items-center justify-center mx-auto border border-amber-200 shadow-inner">
            <Lock className="w-8 h-8 text-amber-700" />
          </div>

          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200 text-xs font-bold">
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>منطقة إدارية مخصصة ومحمية</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-[#2D2621]">
              لوحة تحكم كادر أزياء 4sHe
            </h1>
            <p className="text-xs text-[#8C7D73] leading-relaxed">
              هذه اللوحة مخصصة حصرياً <strong>لإدارة المتجر والعمال المعتمدين</strong> في فرع أسواق المثنى، الموصل. يرجى تسجيل الدخول برقم هاتف مصرح له للمتابعة.
            </p>
          </div>

          {isAuthenticated ? (
            <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#E8E1DA] text-right space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#8C7D73]">الحساب الحالي:</span>
                <span className="font-bold text-[#2D2621]">{customer?.name || 'عميلة'}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#8C7D73]">رقم الهاتف:</span>
                <span className="font-mono font-bold text-[#4A3F35] dir-ltr">{customer?.phone}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#8C7D73]">نوع الحساب:</span>
                <span className="px-2 py-0.5 rounded-md bg-zinc-100 text-zinc-700 font-bold text-[11px]">
                  حساب زبونة (غير مصرح بالإدارة)
                </span>
              </div>
              <p className="text-[11px] text-rose-600 font-medium pt-1 border-t border-[#E8E1DA]">
                إذا كنتِ من كادر المتجر، يرجى تسجيل الخروج ثم الدخول برقم الهاتف المسجل لدى الإدارة.
              </p>
              <div className="pt-2 flex flex-col gap-2">
                <button
                  type="button"
                  onClick={logout}
                  className="w-full py-2.5 px-4 rounded-xl bg-rose-50 text-rose-700 hover:bg-rose-100 text-xs font-bold transition-colors cursor-pointer border border-rose-200"
                >
                  تسجيل الخروج والدخول برقم الكادر
                </button>
                <button
                  type="button"
                  onClick={() => setActivePage('shop')}
                  className="w-full py-2.5 px-4 rounded-xl bg-[#FAF8F5] hover:bg-[#F2EAE4] text-[#5C5046] text-xs font-bold transition-colors cursor-pointer border border-[#E8E1DA]"
                >
                  العودة لواجهة المتجر
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <button
                type="button"
                onClick={openAuthModal}
                className="w-full py-3.5 px-6 rounded-2xl bg-[#4A3F35] hover:bg-[#3B322A] text-white font-bold text-xs shadow-md transition-all cursor-pointer border border-[#6B5E54]/30 flex items-center justify-center gap-2"
              >
                <UserCheck className="w-4 h-4" />
                <span>تسجيل دخول المدير / العامل</span>
              </button>

              <button
                type="button"
                onClick={() => setActivePage('shop')}
                className="w-full py-3 px-6 rounded-2xl bg-[#FAF8F5] hover:bg-[#F2EAE4] text-[#5C5046] font-bold text-xs transition-all cursor-pointer border border-[#E8E1DA]"
              >
                تصفح متجر أزياء 4sHe
              </button>
            </div>
          )}

          {/* Helper demo numbers info */}
          <div className="pt-4 border-t border-[#E8E1DA] text-[11px] text-[#8C7D73] space-y-1 bg-[#FAF8F5]/80 p-3 rounded-2xl">
            <p className="font-bold text-[#4A3F35]">أرقام كادر المتجر المصرح لهم للتجربة:</p>
            <p className="font-mono text-[#5C5046]">👑 المدير العام: <strong className="dir-ltr text-[#2D2621]">07707440557</strong></p>
            <p className="font-mono text-[#5C5046]">👷 كادر المخزن/عامل: <strong className="dir-ltr text-[#2D2621]">07704445566</strong></p>
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // AUTHORIZED VIEW (Managers & Workers)
  // -------------------------------------------------------------
  return (
    <div className="py-8 bg-[#FAF8F5] min-h-screen text-right" dir="rtl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Top Header with Role Badge */}
        <div className="bg-white p-6 rounded-3xl border border-[#E8E1DA] shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border flex items-center gap-1 ${
                isManager
                  ? 'bg-amber-100/70 text-amber-900 border-amber-200'
                  : 'bg-emerald-50 text-emerald-800 border-emerald-200'
              }`}>
                {isManager ? <Shield className="w-3.5 h-3.5 text-amber-800" /> : <UserCheck className="w-3.5 h-3.5 text-emerald-700" />}
                <span>{customer?.roleTitle || (isManager ? 'المدير العام' : 'كادر المتجر')}</span>
              </span>
              <span className="text-xs text-[#8C7D73]">• فرع أسواق المثنى، الموصل</span>
              <span className="text-xs text-[#8C7D73] font-mono dir-ltr">({customer?.phone})</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-[#2D2621] mt-1">
              إدارة متجر أزياء 4sHe
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setIsCreateOrderModalOpen(true)}
              className="px-4 py-2.5 rounded-2xl bg-[#4A3F35] hover:bg-[#3B322A] text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm border border-[#6B5E54]/30"
            >
              <Plus className="w-4 h-4" />
              <span>+ إضافة طلبية جديدة</span>
            </button>

            <button
              type="button"
              onClick={() => handleOpenRestock()}
              className="px-4 py-2.5 rounded-2xl bg-emerald-50 text-emerald-800 hover:bg-emerald-100 text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer border border-emerald-200"
            >
              <PackagePlus className="w-4 h-4 text-emerald-700" />
              <span>توريد للمخزن</span>
            </button>

            <button
              type="button"
              onClick={fetchAdminData}
              className="p-2.5 rounded-xl bg-[#FAF8F5] hover:bg-[#F2EAE4] text-[#5C5046] text-xs font-bold transition-colors flex items-center gap-1.5 border border-[#E8E1DA] cursor-pointer"
              title="تحديث البيانات"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>

            <button
              type="button"
              onClick={() => setActivePage('shop')}
              className="px-4 py-2.5 rounded-xl bg-[#F2EAE4] hover:bg-[#E8DDD5] text-[#4A3F35] text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer border border-[#E8DDD5]"
            >
              <Eye className="w-4 h-4" />
              <span className="hidden sm:inline">واجهة المتجر</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-[#E8E1DA] scrollbar-none">
          <button
            type="button"
            onClick={() => setActiveTab('analytics')}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'analytics' ? 'bg-[#4A3F35] text-white shadow-md' : 'text-[#5C5046] hover:bg-[#F2EAE4]'
            }`}
          >
            <Activity className="w-4 h-4" />
            <span>المبيعات والإحصائيات</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('orders')}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'orders' ? 'bg-[#4A3F35] text-white shadow-md' : 'text-[#5C5046] hover:bg-[#F2EAE4]'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>تنظيم الطلبات ({orders.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('products')}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'products' ? 'bg-[#4A3F35] text-white shadow-md' : 'text-[#5C5046] hover:bg-[#F2EAE4]'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>المخزن والمنتجات ({products.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('reviews')}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'reviews' ? 'bg-[#4A3F35] text-white shadow-md' : 'text-[#5C5046] hover:bg-[#F2EAE4]'
            }`}
          >
            <Star className="w-4 h-4 text-amber-400" />
            <span>التقييمات والمراجعات</span>
          </button>

          {/* Staff & RBAC Tab */}
          <button
            type="button"
            onClick={() => setActiveTab('staff')}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'staff' ? 'bg-[#4A3F35] text-white shadow-md' : 'text-[#5C5046] hover:bg-[#F2EAE4]'
            }`}
          >
            <Shield className="w-4 h-4 text-amber-400" />
            <span>كادر المتجر والصلاحيات ({staff.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('categories')}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'categories' ? 'bg-[#4A3F35] text-white shadow-md' : 'text-[#5C5046] hover:bg-[#F2EAE4]'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>الأقسام ({categories.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('customers')}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'customers' ? 'bg-[#4A3F35] text-white shadow-md' : 'text-[#5C5046] hover:bg-[#F2EAE4]'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>سجل العميلات ({customers.length})</span>
          </button>

          {/* Settings available for Manager */}
          {isManager && (
            <button
              type="button"
              onClick={() => setActiveTab('settings')}
              className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                activeTab === 'settings' ? 'bg-[#4A3F35] text-white shadow-md' : 'text-[#5C5046] hover:bg-[#F2EAE4]'
              }`}
            >
              <Settings className="w-4 h-4" />
              <span>إعدادات المتجر والتوصيل</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setActiveTab('logs')}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'logs' ? 'bg-[#4A3F35] text-white shadow-md' : 'text-[#5C5046] hover:bg-[#F2EAE4]'
            }`}
          >
            <Activity className="w-4 h-4" />
            <span>سجل العمليات</span>
          </button>
        </div>

        {/* TAB CONTENTS */}
        {activeTab === 'analytics' && (
          <AdminAnalyticsTab
            stats={stats}
            orders={orders}
            products={products}
            onOpenRestockModal={handleOpenRestock}
            onNavigateToOrders={() => setActiveTab('orders')}
          />
        )}

        {activeTab === 'orders' && (
          <AdminOrdersTab
            orders={orders}
            onOpenCreateOrderModal={() => setIsCreateOrderModalOpen(true)}
            onSelectOrderForInvoice={(ord, defaultTab) => {
              setSelectedInvoiceOrder(ord);
              if (defaultTab) setInvoiceDefaultTab(defaultTab);
            }}
            onUpdateOrderStatus={handleUpdateOrderStatus}
            onBulkUpdateOrderStatus={handleBulkUpdateOrderStatus}
            onRefreshOrders={fetchAdminData}
          />
        )}

        {activeTab === 'products' && (
          <AdminProductsTab
            products={products}
            onOpenAddProduct={handleOpenAddProduct}
            onOpenEditProduct={handleOpenEditProduct}
            onDeleteProduct={handleDeleteProduct}
            onOpenRestockModal={handleOpenRestock}
            onProductUpdated={() => {
              fetchAdminData();
              refreshStoreData();
            }}
          />
        )}

        {activeTab === 'reviews' && (
          <AdminReviewsTab products={products} />
        )}

        {activeTab === 'staff' && (
          <AdminStaffTab
            staff={staff}
            isManager={isManager}
            currentUserId={customer?.id}
            onRefresh={fetchAdminData}
          />
        )}

        {activeTab === 'categories' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map(cat => (
              <div key={cat.id} className="bg-white rounded-3xl p-5 border border-[#E8E1DA] shadow-xs flex items-center gap-4">
                <img src={cat.image} alt={cat.name} className="w-20 h-20 rounded-2xl object-cover border border-[#E8E1DA]" />
                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-[#2D2621]">{cat.name}</h3>
                  <p className="text-xs text-[#8C7D73]">
                    {products.filter(p => p.category === cat.name).length} قطع أزياء متوفرة
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'customers' && (
          <div className="bg-white rounded-3xl border border-[#E8E1DA] overflow-hidden shadow-xs">
            <div className="p-4 border-b border-[#E8E1DA]">
              <h3 className="text-sm font-bold text-[#2D2621]">سجل حسابات العميلات المسجلات</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-right">
                <thead className="bg-[#FAF8F5] text-[#5C5046] border-b border-[#E8E1DA]">
                  <tr>
                    <th className="p-4 font-semibold">رقم الهاتف (موثق)</th>
                    <th className="p-4 font-semibold">اسم العميلة</th>
                    <th className="p-4 font-semibold">المحافظة والمنطقة</th>
                    <th className="p-4 font-semibold">عدد الطلبات</th>
                    <th className="p-4 font-semibold">إجمالي المشتريات</th>
                    <th className="p-4 font-semibold">تاريخ الانضمام</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E8E1DA]/60">
                  {customers.map(cust => (
                    <tr key={cust.id} className="hover:bg-[#FAF8F5]">
                      <td className="p-4 font-mono font-bold text-[#4A3F35] dir-ltr text-right">{cust.phone}</td>
                      <td className="p-4 font-bold text-[#2D2621]">{cust.name || 'عميلة أزياء 4sHe'}</td>
                      <td className="p-4 text-[#5C5046]">{cust.governorate || 'نينوى (الموصل)'} • {cust.district || 'الموصل'}</td>
                      <td className="p-4 font-bold text-[#2D2621]">{cust.ordersCount || 0}</td>
                      <td className="p-4 font-black text-[#2D2621]">{formatIQD(cust.totalSpent || 0)}</td>
                      <td className="p-4 text-[#8C7D73]">{new Date(cust.createdAt).toLocaleDateString('ar-IQ')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'settings' && isManager && (
          <div className="bg-white rounded-3xl border border-[#E8E1DA] p-6 sm:p-8 max-w-3xl space-y-6">
            <h2 className="text-lg font-black text-[#2D2621] border-b border-[#E8E1DA] pb-3">
              إعدادات المتجر وأجور التوصيل وسياسات الأسعار
            </h2>

            {settingsSavedMessage && (
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <span>تم حفظ وتحديث إعدادات المتجر بنجاح!</span>
              </div>
            )}

            <form onSubmit={handleSaveSettings} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-[#5C5046]">اسم المتجر</label>
                  <input
                    type="text"
                    value={settingsForm.storeName}
                    onChange={e => setSettingsForm({ ...settingsForm, storeName: e.target.value })}
                    className="w-full py-2.5 px-3.5 text-xs bg-[#FAF8F5] border border-[#E8E1DA] rounded-xl focus:outline-none focus:border-[#4A3F35] text-[#2D2621]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-[#5C5046]">رقم الهاتف الرسمي</label>
                  <input
                    type="text"
                    dir="ltr"
                    value={settingsForm.storePhone}
                    onChange={e => setSettingsForm({ ...settingsForm, storePhone: e.target.value })}
                    className="w-full py-2.5 px-3.5 text-xs bg-[#FAF8F5] border border-[#E8E1DA] rounded-xl focus:outline-none focus:border-[#4A3F35] font-mono text-[#2D2621]"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-[#5C5046]">عنوان المتجر الفعلي في الموصل</label>
                <input
                  type="text"
                  value={settingsForm.storeAddress}
                  onChange={e => setSettingsForm({ ...settingsForm, storeAddress: e.target.value })}
                  className="w-full py-2.5 px-3.5 text-xs bg-[#FAF8F5] border border-[#E8E1DA] rounded-xl focus:outline-none focus:border-[#4A3F35] text-[#2D2621]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-[#5C5046]">توصيل داخل الموصل (IQD)</label>
                  <input
                    type="number"
                    value={settingsForm.mosulDeliveryFee}
                    onChange={e => setSettingsForm({ ...settingsForm, mosulDeliveryFee: Number(e.target.value) })}
                    className="w-full py-2.5 px-3.5 text-xs bg-[#FAF8F5] border border-[#E8E1DA] rounded-xl focus:outline-none focus:border-[#4A3F35] text-[#2D2621]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-[#5C5046]">توصيل باقي المحافظات (IQD)</label>
                  <input
                    type="number"
                    value={settingsForm.otherGovernoratesDeliveryFee}
                    onChange={e => setSettingsForm({ ...settingsForm, otherGovernoratesDeliveryFee: Number(e.target.value) })}
                    className="w-full py-2.5 px-3.5 text-xs bg-[#FAF8F5] border border-[#E8E1DA] rounded-xl focus:outline-none focus:border-[#4A3F35] text-[#2D2621]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-[#5C5046]">حد التوصيل المجاني (IQD)</label>
                  <input
                    type="number"
                    value={settingsForm.freeDeliveryThreshold}
                    onChange={e => setSettingsForm({ ...settingsForm, freeDeliveryThreshold: Number(e.target.value) })}
                    className="w-full py-2.5 px-3.5 text-xs bg-[#FAF8F5] border border-[#E8E1DA] rounded-xl focus:outline-none focus:border-[#4A3F35] text-[#2D2621]"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSavingSettings}
                className="w-full py-3.5 px-6 rounded-2xl bg-[#4A3F35] hover:bg-[#3B322A] text-white font-bold text-xs shadow-md transition-all cursor-pointer border border-[#6B5E54]/30"
              >
                {isSavingSettings ? 'جاري الحفظ...' : 'حفظ التعديلات'}
              </button>
            </form>
          </div>
        )}

        {activeTab === 'logs' && (
          <div className="bg-white rounded-3xl border border-[#E8E1DA] p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-[#2D2621]">سجل العمليات والنشاطات الإدارية</h3>
            <div className="space-y-2">
              {logs.map((lg, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-[#FAF8F5] text-xs border border-[#E8E1DA]">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#A67C52]" />
                    <span className="font-bold text-[#2D2621]">{lg.action}</span>
                    <span className="text-[#5C5046]">{lg.details}</span>
                  </div>
                  <span className="text-[#8C7D73] text-[10px]">{new Date(lg.timestamp).toLocaleTimeString('ar-IQ')}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* MODALS */}
        <CreateOrderModal
          isOpen={isCreateOrderModalOpen}
          onClose={() => setIsCreateOrderModalOpen(false)}
          products={products}
          onOrderCreated={() => {
            fetchAdminData();
            refreshStoreData();
          }}
        />

        <RestockModal
          isOpen={isRestockModalOpen}
          onClose={() => setIsRestockModalOpen(false)}
          products={products}
          initialProductId={restockProductId}
          onRestockSuccess={() => {
            fetchAdminData();
            refreshStoreData();
          }}
        />

        <OrderInvoiceModal
          order={selectedInvoiceOrder}
          onClose={() => setSelectedInvoiceOrder(null)}
          onUpdateStatus={handleUpdateOrderStatus}
          onOrderUpdated={fetchAdminData}
          defaultTab={invoiceDefaultTab}
        />

        <ProductFormModal
          isOpen={isProductModalOpen}
          onClose={() => setIsProductModalOpen(false)}
          editingProduct={editingProduct}
          categories={categories}
          onSaveSuccess={() => {
            fetchAdminData();
            refreshStoreData();
          }}
        />
      </div>
    </div>
  );
};
