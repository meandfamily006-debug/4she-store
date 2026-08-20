export interface ProductColor {
  name: string;
  hex: string;
}

export interface StaffNote {
  id: string;
  text: string;
  author: string;
  createdAt: string;
}

export interface StockMovement {
  id: string;
  type: 'restock' | 'sale' | 'adjustment' | 'manual';
  quantity: number; // positive or negative
  previousStock: number;
  newStock: number;
  reason?: string;
  timestamp: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  sku?: string;
  price: number; // In IQD (د.ع)
  originalPrice?: number;
  discountPercentage?: number;
  category: string;
  description: string;
  details: string[];
  sizes: string[];
  colors: ProductColor[];
  images: string[];
  stock: number;
  lowStockThreshold?: number; // Custom threshold for alert (default 3)
  stockMovements?: StockMovement[];
  isNew?: boolean;
  isFeatured?: boolean;
  isOnSale?: boolean;
  rating: number;
  reviewsCount: number;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  itemCount: number;
}

export type UserRole = 'manager' | 'worker' | 'customer';

export interface StaffMember {
  id: string;
  name: string;
  phone: string;
  role: 'manager' | 'worker';
  roleTitle: string; // e.g. 'المدير العام / صاحبة المتجر' or 'كادر المبيعات والمخزن'
  avatar?: string;
  status: 'active' | 'inactive';
  permissions: string[]; // e.g. ['all'] or ['orders', 'inventory', 'reviews']
  addedAt: string;
}

export interface Customer {
  id: string;
  phone: string;
  name?: string;
  role?: UserRole; // 'manager' | 'worker' | 'customer' (defaults to 'customer')
  roleTitle?: string;
  permissions?: string[];
  governorate?: string;
  district?: string;
  address?: string;
  token?: string;
  createdAt: string;
  ordersCount: number;
  totalSpent: number;
  wishlist: string[]; // array of product IDs
}

export interface CartItem {
  productId: string;
  product: Product;
  size: string;
  color: ProductColor;
  quantity: number;
  unitPrice: number;
}

export interface OrderItem {
  productId: string;
  name: string;
  image: string;
  size: string;
  colorName: string;
  colorHex: string;
  price: number;
  quantity: number;
}

export interface StatusHistoryItem {
  status: OrderStatus;
  timestamp: string;
  note: string;
}

export type OrderStatus = 'received' | 'processing' | 'out_for_delivery' | 'delivered' | 'cancelled';
export type PaymentMethod = 'cod' | 'electronic';
export type PaymentStatus = 'pending' | 'paid' | 'failed';

export interface Order {
  id: string; // e.g. "4SHE-8921"
  customerId: string;
  customerName: string;
  customerPhone: string;
  governorate: string;
  district: string;
  address: string;
  notes?: string;
  staffNotes?: StaffNote[];
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  discount: number;
  total: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  status: OrderStatus;
  statusHistory: StatusHistoryItem[];
  createdAt: string;
}

export interface StorePolicies {
  returnPolicy: string;
  privacyPolicy: string;
  shippingPolicy: string;
  terms: string;
}

export interface StoreSettings {
  storeName: string;
  tagline: string;
  storePhone: string;
  whatsappPhone: string;
  storeAddress: string;
  googleMapsCode: string;
  workingHours: string;
  mosulDeliveryFee: number;
  otherGovernoratesDeliveryFee: number;
  freeDeliveryThreshold: number;
  announcementText: string;
  showAnnouncement: boolean;
  policies: StorePolicies;
}

export interface ProductReview {
  id: string;
  productId: string;
  customerName: string;
  rating: number;
  comment: string;
  date: string;
}

export interface AdminAnalytics {
  totalSales: number;
  totalOrders: number;
  pendingOrders: number;
  deliveredOrders: number;
  totalCustomers: number;
  totalProducts: number;
  lowStockCount: number;
  recentSales: { date: string; amount: number; count: number }[];
}

export interface SystemLog {
  id: string;
  action: string;
  details: string;
  timestamp: string;
  type: 'auth' | 'order' | 'product' | 'system';
}
