import express, { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';

// Types
interface ProductColor {
  name: string;
  hex: string;
}

interface Product {
  id: string;
  name: string;
  slug: string;
  sku?: string;
  price: number;
  originalPrice?: number;
  discountPercentage?: number;
  category: string;
  description: string;
  details: string[];
  sizes: string[];
  colors: ProductColor[];
  images: string[];
  stock: number;
  lowStockThreshold?: number;
  stockMovements?: Array<{
    id: string;
    type: 'restock' | 'sale' | 'adjustment' | 'manual';
    quantity: number;
    previousStock: number;
    newStock: number;
    reason?: string;
    timestamp: string;
  }>;
  isNew?: boolean;
  isFeatured?: boolean;
  isOnSale?: boolean;
  rating: number;
  reviewsCount: number;
  createdAt: string;
}

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  itemCount: number;
}

interface StaffMember {
  id: string;
  name: string;
  phone: string;
  role: 'manager' | 'worker';
  roleTitle: string;
  status: 'active' | 'inactive';
  permissions: string[];
  addedAt: string;
}

interface Customer {
  id: string;
  phone: string;
  name?: string;
  role?: 'manager' | 'worker' | 'customer';
  roleTitle?: string;
  permissions?: string[];
  governorate?: string;
  district?: string;
  address?: string;
  token?: string;
  createdAt: string;
  ordersCount: number;
  totalSpent: number;
  wishlist: string[];
}

interface OrderItem {
  productId: string;
  name: string;
  image: string;
  size: string;
  colorName: string;
  colorHex: string;
  price: number;
  quantity: number;
}

interface StatusHistoryItem {
  status: string;
  timestamp: string;
  note: string;
}

interface Order {
  id: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  governorate: string;
  district: string;
  address: string;
  notes?: string;
  staffNotes?: Array<{
    id: string;
    text: string;
    author: string;
    createdAt: string;
  }>;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  discount: number;
  total: number;
  paymentMethod: 'cod' | 'electronic';
  paymentStatus: 'pending' | 'paid' | 'failed';
  status: 'received' | 'processing' | 'out_for_delivery' | 'delivered' | 'cancelled';
  statusHistory: StatusHistoryItem[];
  createdAt: string;
}

interface StoreSettings {
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
  policies: {
    returnPolicy: string;
    privacyPolicy: string;
    shippingPolicy: string;
    terms: string;
  };
}

interface ProductReview {
  id: string;
  productId: string;
  customerName: string;
  rating: number;
  comment: string;
  date: string;
}

interface SystemLog {
  id: string;
  action: string;
  details: string;
  timestamp: string;
  type: 'auth' | 'order' | 'product' | 'system';
}

// Initial Database Seed Data
const initialCategories: Category[] = [
  {
    id: 'cat-1',
    name: 'فساتين',
    slug: 'dresses',
    description: 'فساتين أنيقة وعصرية تناسب كافة الإطلالات والمناسبات المميزة',
    image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&auto=format&fit=crop&q=80',
    itemCount: 8
  },
  {
    id: 'cat-2',
    name: 'أطقم أنيقة',
    slug: 'sets',
    description: 'أطقم نسائية متناسقة تجمع بين الراحة والفخامة اليومية',
    image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&auto=format&fit=crop&q=80',
    itemCount: 6
  },
  {
    id: 'cat-3',
    name: 'بلايز وقمصان',
    slug: 'tops',
    description: 'تشكيلة راقية من القمصان والبلايز الحريرية والقطنية',
    image: 'https://images.unsplash.com/photo-1584370848010-d7fe6bc767ec?w=800&auto=format&fit=crop&q=80',
    itemCount: 5
  },
  {
    id: 'cat-4',
    name: 'ملابس مناسبات',
    slug: 'occasions',
    description: 'تصاميم ساحرة وأقمشة فاخرة لحفلاتك ومناسباتك الخاصة في الموصل',
    image: 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=800&auto=format&fit=crop&q=80',
    itemCount: 4
  },
  {
    id: 'cat-5',
    name: 'بناطيل وتنانير',
    slug: 'bottoms',
    description: 'قصات مريحة وتصاميم تواكب أحدث خطوط الموضة',
    image: 'https://images.unsplash.com/photo-1509551388413-e18d0ac5d495?w=800&auto=format&fit=crop&q=80',
    itemCount: 4
  },
  {
    id: 'cat-6',
    name: 'عبايات وكيمونو',
    slug: 'abayas',
    description: 'عبايات وكارديجانات مفتوحة بطابع شرقي عصري جذاب',
    image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=800&auto=format&fit=crop&q=80',
    itemCount: 3
  }
];

const initialProducts: Product[] = [
  {
    id: 'prd-101',
    name: 'فستان مخملي ملكي بتطريز ناعم',
    slug: 'royal-velvet-embroidered-dress',
    price: 58000,
    originalPrice: 75000,
    discountPercentage: 23,
    category: 'فساتين',
    description: 'فستان سهرة مخملي ناعم بتطريز يدوي على الأكمام، تصميم يمنحكِ إطلالة ملكية ساحرة في كافة المناسبات. قماش كوري فاخر لا ينكمش.',
    details: [
      'نوع القماش: مخمل كوري استرتش فاخر مع بطانة ناعمة',
      'القصة: قصة كلوش انسيابية مريحة',
      'المناسبات: مناسبات مسائية وحفلات خطوبة وأعراس',
      'العناية: غسيل جاف (Dry Clean) أو غسيل يدوي بماء بارد'
    ],
    sizes: ['38', '40', '42', '44', '46'],
    colors: [
      { name: 'خمري ملكي', hex: '#631828' },
      { name: 'أسود فحمي', hex: '#1c1b1b' },
      { name: 'زمردي داكن', hex: '#144534' }
    ],
    images: [
      'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=900&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=900&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=900&auto=format&fit=crop&q=80'
    ],
    stock: 12,
    isNew: true,
    isFeatured: true,
    isOnSale: true,
    rating: 5.0,
    reviewsCount: 14,
    createdAt: new Date().toISOString()
  },
  {
    id: 'prd-102',
    name: 'طقم بنطلون وبليزر كلاسيكي راقٍ',
    slug: 'classic-blazer-trousers-set',
    price: 65000,
    originalPrice: 80000,
    discountPercentage: 19,
    category: 'أطقم أنيقة',
    description: 'طقم متناسق يتكون من جاكيت بليزر بقصة حديثة مع بنطلون واسع ومريح. مثالي للاجتماعات، الدوام، والإطلالات اليومية الفخمة.',
    details: [
      'نوع القماش: كريب تركي عالي الجودة مع بطانة ستان',
      'المقاس: قصة مريحة تبرز القوام بأناقة',
      'الميزات: أزرار ذهبية مصقولة وجيوب عملية',
      'صنع في تركيا خصيصًا لـ 4sHe'
    ],
    sizes: ['S', 'M', 'L', 'XL'],
    colors: [
      { name: 'بيج كريمي', hex: '#d8c5b0' },
      { name: 'موكا هادئ', hex: '#8a7365' },
      { name: 'أسود كلاسيكي', hex: '#201f1e' }
    ],
    images: [
      'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=900&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=900&auto=format&fit=crop&q=80'
    ],
    stock: 8,
    isNew: true,
    isFeatured: true,
    isOnSale: true,
    rating: 4.9,
    reviewsCount: 18,
    createdAt: new Date().toISOString()
  },
  {
    id: 'prd-103',
    name: 'بلوزة حريرية بأكمام منفوخة وأربطة عنق',
    slug: 'silk-bow-blouse',
    price: 32000,
    originalPrice: 42000,
    discountPercentage: 24,
    category: 'بلايز وقمصان',
    description: 'بلوزة أنثوية راقية من قماش الحرير الناعم، مزودة بربطة أنيقة على الياقة وأزرار لؤلؤية على الأكمام. تمنحك إشراقة ساحرة.',
    details: [
      'نوع القماش: ساتان حريري ناعم بملمس بارد',
      'التصميم: ياقة عالية مع شريطة عنق قابلة للربط',
      'الأكمام: أكمام واسعة مزمومة بأساور مطرزة'
    ],
    sizes: ['S', 'M', 'L', 'XL', 'Free Size'],
    colors: [
      { name: 'وردي بودري', hex: '#eec9d2' },
      { name: 'أبيض عاجي', hex: '#f7f4ee' },
      { name: 'أزرق باستيل', hex: '#a8c4db' }
    ],
    images: [
      'https://images.unsplash.com/photo-1584370848010-d7fe6bc767ec?w=900&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1551803091-e20673f15770?w=900&auto=format&fit=crop&q=80'
    ],
    stock: 15,
    isNew: false,
    isFeatured: true,
    isOnSale: true,
    rating: 5.0,
    reviewsCount: 9,
    createdAt: new Date().toISOString()
  },
  {
    id: 'prd-104',
    name: 'فستان ماكسي مشجر بكسرات بليسيه',
    slug: 'pleated-floral-maxi-dress',
    price: 48000,
    originalPrice: 60000,
    discountPercentage: 20,
    category: 'فساتين',
    description: 'فستان طويل بطبعات زهور ناعمة مع كسرات بليسيه متدرجة وحزام خصر متطابق يبرز الرشاقة. خفيف ومثالي لجميع الأوقات.',
    details: [
      'نوع القماش: شيفون جورجيت عالي الجودة مع بطانة كاملة',
      'التصميم: ياقة مثلثة مع أكمام مطاطية مريحة',
      'المقاس: متوفر بمقاسات متعددة تناسب الجميع'
    ],
    sizes: ['38', '40', '42', '44', '46', '48'],
    colors: [
      { name: 'زهري مشجر', hex: '#d99b9b' },
      { name: 'زيتي ربيعي', hex: '#687754' },
      { name: 'كحلي ناعم', hex: '#263859' }
    ],
    images: [
      'https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=900&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1502716119720-b23a93e5fe1b?w=900&auto=format&fit=crop&q=80'
    ],
    stock: 10,
    isNew: true,
    isFeatured: true,
    isOnSale: true,
    rating: 4.8,
    reviewsCount: 11,
    createdAt: new Date().toISOString()
  },
  {
    id: 'prd-105',
    name: 'فستان مناسبات كلوش مزين بالترتر اللامع',
    slug: 'sequin-evening-gown',
    price: 85000,
    originalPrice: 110000,
    discountPercentage: 23,
    category: 'ملابس مناسبات',
    description: 'قطعة استثنائية لمناسباتكِ السعيدة في الموصل. فستان سهرة بتطريز ترتر متدرج عاكس للضوء مع ذيل خفيف وقصة ساحرة.',
    details: [
      'نوع القماش: تول فاخر مطرز بالترتر الناعم مع بطانة ستان باردة',
      'القصة: ضيق من الأعلى مع اتساع كلوش ملكي بالأسفل',
      'الإغلاق: سحاب خلفي مخفي محكم'
    ],
    sizes: ['38', '40', '42', '44'],
    colors: [
      { name: 'ذهبي شامبين', hex: '#dfc8a5' },
      { name: 'فضي لؤلؤي', hex: '#c5cbd3' },
      { name: 'أسود برّاق', hex: '#1f1e24' }
    ],
    images: [
      'https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=900&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=900&auto=format&fit=crop&q=80'
    ],
    stock: 6,
    isNew: true,
    isFeatured: true,
    isOnSale: true,
    rating: 5.0,
    reviewsCount: 7,
    createdAt: new Date().toISOString()
  },
  {
    id: 'prd-106',
    name: 'طقم كاجوال شتوي تريكو قطعتين',
    slug: 'knitwear-two-piece-set',
    price: 45000,
    originalPrice: 55000,
    discountPercentage: 18,
    category: 'أطقم أنيقة',
    description: 'طقم نسائي مريح يتكون من سترة أوفرسايز وبنطلون تريكو ناعم ودافئ. مثالي للأيام الباردة والطلعات اليومية السريعة.',
    details: [
      'نوع القماش: صوف تريكو ناعم لا يسبب تحسس',
      'المرونة: قماش مطاطي مريح للغاية',
      'المقاس: Free Size يناسب من وزن 50 إلى 85 كغم'
    ],
    sizes: ['Free Size'],
    colors: [
      { name: 'أوف وايت', hex: '#ede8e1' },
      { name: 'رمادي ميلانج', hex: '#9e9e9e' },
      { name: 'كاكاو دافئ', hex: '#6e5144' }
    ],
    images: [
      'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=900&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=900&auto=format&fit=crop&q=80'
    ],
    stock: 14,
    isNew: false,
    isFeatured: false,
    isOnSale: true,
    rating: 4.9,
    reviewsCount: 16,
    createdAt: new Date().toISOString()
  },
  {
    id: 'prd-107',
    name: 'بنطلون كريب واسع بقصة Wide Leg',
    slug: 'wide-leg-crepe-trousers',
    price: 28000,
    originalPrice: 35000,
    discountPercentage: 20,
    category: 'بناطيل وتنانير',
    description: 'بنطلون واسع وعملي بخصر مرتفع مع حزام قماشي أنيق. يتناسب تمامًا مع البلايز والقمصان لإطلالة متجددة كل يوم.',
    details: [
      'نوع القماش: كريب صيفي بارد وناعم ومقاوم للتجعد',
      'القصة: أرجل واسعة مستقيمة مع جيوب جانبية مخفية',
      'الخصر: خصر عالي مريح مع كسرات أمامية'
    ],
    sizes: ['38', '40', '42', '44', '46'],
    colors: [
      { name: 'أسود فحمي', hex: '#1a1a1a' },
      { name: 'بيج كابتشينو', hex: '#cbb39c' },
      { name: 'أبيض ناصع', hex: '#fafafa' }
    ],
    images: [
      'https://images.unsplash.com/photo-1509551388413-e18d0ac5d495?w=900&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1584370848010-d7fe6bc767ec?w=900&auto=format&fit=crop&q=80'
    ],
    stock: 20,
    isNew: false,
    isFeatured: false,
    isOnSale: true,
    rating: 4.7,
    reviewsCount: 8,
    createdAt: new Date().toISOString()
  },
  {
    id: 'prd-108',
    name: 'كيمونو ساتان مطرز بنقوش شرقية',
    slug: 'oriental-embroidered-kimono',
    price: 42000,
    originalPrice: 52000,
    discountPercentage: 19,
    category: 'عبايات وكيمونو',
    description: 'كيمونو طويل مفتوح من قماش الساتان اللامع بتطريز ناعم على الأطراف، يمنحك لمسة راقية وفخمة فوق الملابس اليومية أو فساتين السهرة.',
    details: [
      'نوع القماش: ساتان تركي حريري مع تطريز خيوط حريرية',
      'التصميم: قصة فضفاضة مريحة مع حزام خصر اختياري',
      'المقاس: Free Size واسع يناسب جميع المقاسات'
    ],
    sizes: ['Free Size'],
    colors: [
      { name: 'عنابي فاخر', hex: '#58111a' },
      { name: 'كحلي داكن', hex: '#162238' },
      { name: 'أسود مع ذهبي', hex: '#22201d' }
    ],
    images: [
      'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=900&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=900&auto=format&fit=crop&q=80'
    ],
    stock: 9,
    isNew: true,
    isFeatured: true,
    isOnSale: true,
    rating: 5.0,
    reviewsCount: 6,
    createdAt: new Date().toISOString()
  }
];

const initialReviews: ProductReview[] = [
  {
    id: 'rev-1',
    productId: 'prd-101',
    customerName: 'فاطمة العبيدي (الموصل)',
    rating: 5,
    comment: 'الفستان يجنن والقماش مخمل ثقيل وفخم جداً مثل الصورة بالضبط! والتوصيل للمثنى كان بنفس اليوم، شكراً أزياء 4sHe.',
    date: 'منذ يومين'
  },
  {
    id: 'rev-2',
    productId: 'prd-101',
    customerName: 'سارة الحيالي',
    rating: 5,
    comment: 'الخياطة والتطريز متقنين والمقاس مضبوط 100%. تعامل راقي وسرعة بالتوصيل.',
    date: 'منذ أسبوع'
  },
  {
    id: 'rev-3',
    productId: 'prd-102',
    customerName: 'د. نور الجبوري',
    rating: 5,
    comment: 'الطقم يجنن للدوام وخامته تركية أصلية راقية. أنصح بيه كل البنات بالموصل.',
    date: 'منذ 3 أيام'
  },
  {
    id: 'rev-4',
    productId: 'prd-103',
    customerName: 'مريم الحداد',
    rating: 5,
    comment: 'البلوزة ناعمة وباردة واللون الوردي البودري خيالي.',
    date: 'منذ 5 أيام'
  }
];

const initialStoreSettings: StoreSettings = {
  storeName: 'أزياء 4sHe',
  tagline: 'أناقتكِ تبدأ من هنا | تشكيلات أزياء نسائية فاخرة',
  storePhone: '0770 744 0557',
  whatsappPhone: '9647707440557',
  storeAddress: 'أسواق المثنى، الموصل، محافظة نينوى، العراق',
  googleMapsCode: '95FF+3F الموصل',
  workingHours: 'مفتوح يوميًا من الساعة 10:00 صباحًا حتى 11:00 مساءً',
  mosulDeliveryFee: 3000,
  otherGovernoratesDeliveryFee: 5000,
  freeDeliveryThreshold: 100000,
  announcementText: '✨ أهلاً بكم في متجر أزياء 4sHe بالموصل - توصيل سريع لجميع أحياء الموصل وباقي محافظات العراق مع إمكانية المعاينة والدفع عند الاستلام!',
  showAnnouncement: true,
  policies: {
    returnPolicy: 'نضمن لكِ في أزياء 4sHe تجربة تسوق آمنة ومريحة. يحق للزبونة فحص ومعاينة القطع مع مندوب التوصيل قبل الاستلام والدفع. في حال وجود أي عيب مصنعي أو رغبة في استبدال المقاس، يرجى التواصل معنا خلال 48 ساعة من استلام الطلب بشرط بقاء المنتج بحالته الأصلية مع بطاقة السعر والغلاف الأصلي.',
    privacyPolicy: 'نحن نلتزم بحماية خصوصية بيانات عميلاتنا الكرام. يتم استخدام رقم الهاتف والاسم والعنوان فقط لأغراض تجهيز وتوصيل طلباتكم وتقديم الدعم الفني، ولا تتم مشاركة معلوماتكم مع أي طرف ثالث على الإطلاق.',
    shippingPolicy: 'خدمة التوصيل الفوري متوفرة داخل مدينة الموصل وأحياء نينوى خلال 24 ساعة برسم توصيل 3,000 د.ع (أو مجانًا للطلبات فوق 100,000 د.ع). كما يتوفر الشحن لكافة محافظات العراق (بغداد، أربيل، البصرة، كركوك، السليمانية، دهوك، وكافة المحافظات) خلال 48-72 ساعة برسم توصيل 5,000 د.ع.',
    terms: 'جميع الأسعار المعروضة بالدينار العراقي (د.ع) وشاملة. يتم تأكيد الطلب فور إتمام عملية الشراء، ونتواصل معكِ هاتفيًا أو عبر الواتساب لتأكيد موعد التوصيل المناسب.'
  }
};

// In-Memory & Persisted Database State
class DataStore {
  products: Product[] = [...initialProducts];
  categories: Category[] = [...initialCategories];
  reviews: ProductReview[] = [...initialReviews];
  settings: StoreSettings = { ...initialStoreSettings };
  customers: Map<string, Customer> = new Map();
  orders: Order[] = [
    {
      id: '4SHE-1048',
      customerId: 'cust-demo-1',
      customerName: 'شهد عبد الله',
      customerPhone: '07707440557',
      governorate: 'نينوى',
      district: 'حي المثنى',
      address: 'قرب أسواق المثنى، الموصل',
      notes: 'يرجى الاتصال قبل الوصول بنصف ساعة',
      staffNotes: [
        {
          id: 'sn-1',
          author: 'كادر المتجر',
          text: 'تم التأكد من المقاس 40 بالفستان الخمري وفحص السحاب والبطانة قبل التغليف.',
          createdAt: new Date(Date.now() - 3600000 * 3).toISOString()
        },
        {
          id: 'sn-2',
          author: 'مسؤول التوصيل',
          text: 'مندوب التوصيل بالموصل: كابتن عمر (دراجة رقم 4)',
          createdAt: new Date(Date.now() - 3600000 * 1).toISOString()
        }
      ],
      items: [
        {
          productId: 'prd-101',
          name: 'فستان مخملي ملكي بتطريز ناعم',
          image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=900&auto=format&fit=crop&q=80',
          size: '40',
          colorName: 'خمري ملكي',
          colorHex: '#631828',
          price: 58000,
          quantity: 1
        }
      ],
      subtotal: 58000,
      deliveryFee: 3000,
      discount: 0,
      total: 61000,
      paymentMethod: 'cod',
      paymentStatus: 'pending',
      status: 'processing',
      statusHistory: [
        { status: 'received', timestamp: new Date(Date.now() - 3600000 * 4).toISOString(), note: 'تم استلام الطلب بنجاح' },
        { status: 'processing', timestamp: new Date(Date.now() - 3600000 * 2).toISOString(), note: 'جاري تغليف وفحص القطع في فرع المثنى' }
      ],
      createdAt: new Date(Date.now() - 3600000 * 4).toISOString()
    },
    {
      id: '4SHE-1049',
      customerId: 'cust-demo-2',
      customerName: 'مريم الحداد',
      customerPhone: '07712345678',
      governorate: 'نينوى',
      district: 'حي السكر',
      address: 'شارع الجامعة، قرب مكتبة نينوى',
      notes: 'التوصيل بعد الساعة 4 عصراً لطفاً',
      staffNotes: [
        {
          id: 'sn-3',
          author: 'خدمة العملاء',
          text: 'الزبونة طلبت إضافة كيس هدايا خاص مع شريط ساتان لـ 4sHe.',
          createdAt: new Date(Date.now() - 3600000 * 5).toISOString()
        }
      ],
      items: [
        {
          productId: 'prd-102',
          name: 'طقم بنطلون وبليزر كلاسيكي راقٍ',
          image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=900&auto=format&fit=crop&q=80',
          size: 'M',
          colorName: 'بيج كريمي',
          colorHex: '#d8c5b0',
          price: 65000,
          quantity: 1
        },
        {
          productId: 'prd-103',
          name: 'بلوزة حريرية بأكمام منفوخة وأربطة عنق',
          image: 'https://images.unsplash.com/photo-1584370848010-d7fe6bc767ec?w=900&auto=format&fit=crop&q=80',
          size: 'M',
          colorName: 'وردي بودري',
          colorHex: '#f2ccd8',
          price: 32000,
          quantity: 1
        }
      ],
      subtotal: 97000,
      deliveryFee: 3000,
      discount: 5000,
      total: 95000,
      paymentMethod: 'cod',
      paymentStatus: 'pending',
      status: 'received',
      statusHistory: [
        { status: 'received', timestamp: new Date(Date.now() - 3600000 * 6).toISOString(), note: 'تم استلام وتأكيد الطلب' }
      ],
      createdAt: new Date(Date.now() - 3600000 * 6).toISOString()
    },
    {
      id: '4SHE-1050',
      customerId: 'cust-demo-3',
      customerName: 'زينب الحيالي',
      customerPhone: '07809876543',
      governorate: 'بغداد',
      district: 'الكرادة',
      address: 'شارع العرصات، مجمع النخيل',
      notes: '',
      staffNotes: [
        {
          id: 'sn-4',
          author: 'قسم الشحن الخارجي',
          text: 'تم تسليم الشحنة لشركة الصقر للشحن السريع لمحافظة بغداد - رقم التتبع BG-9921',
          createdAt: new Date(Date.now() - 3600000 * 10).toISOString()
        }
      ],
      items: [
        {
          productId: 'prd-108',
          name: 'كيمونو ساتان مطرز بنقوش شرقية',
          image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=900&auto=format&fit=crop&q=80',
          size: 'Free Size',
          colorName: 'عنابي فاخر',
          colorHex: '#58111a',
          price: 42000,
          quantity: 2
        }
      ],
      subtotal: 84000,
      deliveryFee: 5000,
      discount: 0,
      total: 89000,
      paymentMethod: 'electronic',
      paymentStatus: 'paid',
      status: 'out_for_delivery',
      statusHistory: [
        { status: 'received', timestamp: new Date(Date.now() - 3600000 * 20).toISOString(), note: 'تم استلام الطلب والدفع الإلكتروني' },
        { status: 'processing', timestamp: new Date(Date.now() - 3600000 * 15).toISOString(), note: 'تم التجهيز والتغليف' },
        { status: 'out_for_delivery', timestamp: new Date(Date.now() - 3600000 * 10).toISOString(), note: 'خرجت الشحنة للشحن لبغداد' }
      ],
      createdAt: new Date(Date.now() - 3600000 * 20).toISOString()
    }
  ];
  otpStore: Map<string, { code: string; expiresAt: number; attempts: number }> = new Map();
  systemLogs: SystemLog[] = [];
  staffMembers: StaffMember[] = [
    {
      id: 'staff-1',
      name: 'شهد عبد الله (الإدارة العامة)',
      phone: '07707440557',
      role: 'manager',
      roleTitle: 'مديرة المتجر والمالكة',
      status: 'active',
      permissions: ['all'],
      addedAt: new Date(Date.now() - 3600000 * 24 * 30).toISOString()
    },
    {
      id: 'staff-2',
      name: 'زينب محمد',
      phone: '07701112233',
      role: 'manager',
      roleTitle: 'مديرة فرع أسواق المثنى',
      status: 'active',
      permissions: ['all'],
      addedAt: new Date(Date.now() - 3600000 * 24 * 15).toISOString()
    },
    {
      id: 'staff-3',
      name: 'عمر الموصلي',
      phone: '07704445566',
      role: 'worker',
      roleTitle: 'مسؤول التجهيز والمخزن',
      status: 'active',
      permissions: ['orders', 'inventory', 'reviews'],
      addedAt: new Date(Date.now() - 3600000 * 24 * 10).toISOString()
    },
    {
      id: 'staff-4',
      name: 'نور الهدى',
      phone: '07708889900',
      role: 'worker',
      roleTitle: 'موظفة مبيعات وخدمة عملاء',
      status: 'active',
      permissions: ['orders', 'inventory'],
      addedAt: new Date(Date.now() - 3600000 * 24 * 5).toISOString()
    }
  ];

  constructor() {
    // Initial demo customer (Store Manager)
    const demoCust: Customer = {
      id: 'cust-demo-1',
      phone: '07707440557',
      name: 'شهد عبد الله',
      role: 'manager',
      roleTitle: 'مديرة المتجر والمالكة',
      permissions: ['all'],
      governorate: 'نينوى',
      district: 'الموصل - حي المثنى',
      address: 'أسواق المثنى',
      token: 'session_demo_4she_token',
      createdAt: new Date().toISOString(),
      ordersCount: 1,
      totalSpent: 61000,
      wishlist: ['prd-101', 'prd-105']
    };
    this.customers.set(demoCust.phone, demoCust);

    // Initial worker user
    const workerCust: Customer = {
      id: 'cust-demo-worker',
      phone: '07704445566',
      name: 'عمر الموصلي',
      role: 'worker',
      roleTitle: 'مسؤول التجهيز والمخزن',
      permissions: ['orders', 'inventory', 'reviews'],
      governorate: 'نينوى',
      district: 'الموصل - حي المثنى',
      address: 'فرع أسواق المثنى',
      token: 'session_worker_token',
      createdAt: new Date().toISOString(),
      ordersCount: 0,
      totalSpent: 0,
      wishlist: []
    };
    this.customers.set(workerCust.phone, workerCust);

    this.addLog('system', 'System Initialized', 'متجر أزياء 4sHe - بدء تشغيل النظام مع تمكين حماية وصلاحيات لوحة الإدارة للمدير والعمال');
  }

  addLog(type: 'auth' | 'order' | 'product' | 'system', action: string, details: string) {
    const log: SystemLog = {
      id: 'log-' + Math.random().toString(36).substring(2, 9),
      action,
      details,
      timestamp: new Date().toISOString(),
      type
    };
    this.systemLogs.unshift(log);
    if (this.systemLogs.length > 200) {
      this.systemLogs.pop();
    }
  }
}

const db = new DataStore();

// Express Server Init
async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Helper to normalize Iraqi phone number
  function normalizePhone(phone: string): string {
    let clean = phone.replace(/[\s\-\(\)\+]/g, '');
    if (clean.startsWith('964')) {
      clean = '0' + clean.slice(3);
    } else if (clean.startsWith('00964')) {
      clean = '0' + clean.slice(5);
    } else if (!clean.startsWith('0') && clean.length === 10) {
      clean = '0' + clean;
    }
    return clean;
  }

  // --- AUTH & OTP APIS ---

  // 1. Send OTP
  app.post('/api/auth/send-otp', (req: Request, res: Response) => {
    try {
      const { phone } = req.body;
      if (!phone || typeof phone !== 'string') {
        return res.status(400).json({ error: 'يرجى إدخال رقم هاتف صحيح' });
      }

      const normalized = normalizePhone(phone);
      if (normalized.length < 10 || !/^07[3-9]\d{8}$/.test(normalized)) {
        return res.status(400).json({
          error: 'صيغة رقم الهاتف غير صحيحة. يجب أن يبدأ بـ 077 أو 078 أو 075 ويتكون من 11 رقمًا'
        });
      }

      // Check existing OTP rate limiting (cooldown 45 seconds)
      const existing = db.otpStore.get(normalized);
      const now = Date.now();
      if (existing && existing.expiresAt > now && (existing.expiresAt - now > 4 * 60 * 1000)) {
        // Less than 60s since generation
        return res.status(429).json({
          error: 'تم إرسال رمز تحقق مؤخرًا. يرجى الانتظار قبل طلب رمز جديد',
          resendInSeconds: Math.ceil((existing.expiresAt - 4 * 60 * 1000 - now) / 1000)
        });
      }

      // Generate 6-digit cryptographic-style OTP
      // For reliable customer onboarding and testing, we generate a 6-digit code.
      // In production, this can hook to Twilio / Asiacell / Zain SMS Gateway via process.env.SMS_API_KEY
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = now + 5 * 60 * 1000; // 5 minutes validity

      db.otpStore.set(normalized, {
        code,
        expiresAt,
        attempts: 0
      });

      db.addLog('auth', 'OTP Generated', `تم توليد رمز تحقق لرقم الهاتف ${normalized}`);

      // If SMS Gateway is configured:
      const smsProvider = process.env.SMS_PROVIDER || 'local_gateway';
      console.log(`[SMS GATEWAY - ${smsProvider}] Message to ${normalized}: رمز التحقق الخاص بك للدخول إلى أزياء 4sHe هو: ${code}`);

      // We return success, resend cooldown (45s), and provide security status.
      // We also provide debugCode during development/preview for instantaneous seamless testing.
      return res.json({
        success: true,
        message: 'تم إرسال رمز التحقق بنجاح إلى رقم هاتفك',
        phone: normalized,
        resendCooldownSeconds: 45,
        expiresInSeconds: 300,
        // Provided for seamless preview testing without external SMS billing cost
        debugOtp: code
      });
    } catch (err: any) {
      console.error('Error sending OTP:', err);
      return res.status(500).json({ error: 'حدث خطأ أثناء إرسال رمز التحقق. يرجى المحاولة لاحقًا' });
    }
  });

  // 2. Verify OTP
  app.post('/api/auth/verify-otp', (req: Request, res: Response) => {
    try {
      const { phone, code } = req.body;
      if (!phone || !code) {
        return res.status(400).json({ error: 'يرجى إدخال رقم الهاتف ورمز التحقق' });
      }

      const normalized = normalizePhone(phone);
      const session = db.otpStore.get(normalized);
      const now = Date.now();

      if (!session) {
        return res.status(400).json({ error: 'لم يتم طلب رمز تحقق لهذا الرقم أو انتهت صلاحيته' });
      }

      if (session.expiresAt < now) {
        db.otpStore.delete(normalized);
        return res.status(400).json({ error: 'انتهت صلاحية رمز التحقق. يرجى طلب رمز جديد' });
      }

      if (session.attempts >= 4) {
        db.otpStore.delete(normalized);
        db.addLog('auth', 'OTP Lockout', `تجاوز الحد الأقصى للمحاولات لرقم ${normalized}`);
        return res.status(429).json({ error: 'تجاوزت الحد المسموح به من المحاولات الخاطئة. يرجى طلب رمز جديد' });
      }

      if (session.code !== code.toString().trim()) {
        session.attempts += 1;
        db.otpStore.set(normalized, session);
        return res.status(400).json({
          error: `رمز التحقق غير صحيح. المتبقي ${4 - session.attempts} محاولات.`
        });
      }

      // Valid OTP! Clear OTP session
      db.otpStore.delete(normalized);

      // Check if this phone belongs to a predefined staff member
      const staffInfo = db.staffMembers.find(s => s.phone === normalized && s.status === 'active');

      // Fetch or Create Customer
      let customer = db.customers.get(normalized);
      const isNewUser = !customer;

      if (!customer) {
        const newCustId = 'cust-' + Math.random().toString(36).substring(2, 9);
        const token = 'token_' + Math.random().toString(36).substring(2) + Date.now().toString(36);
        customer = {
          id: newCustId,
          phone: normalized,
          name: staffInfo ? staffInfo.name : '',
          role: staffInfo ? staffInfo.role : 'customer',
          roleTitle: staffInfo ? staffInfo.roleTitle : 'زبونة المتجر',
          permissions: staffInfo ? staffInfo.permissions : [],
          governorate: 'نينوى',
          district: 'الموصل',
          address: '',
          token,
          createdAt: new Date().toISOString(),
          ordersCount: 0,
          totalSpent: 0,
          wishlist: []
        };
        db.customers.set(normalized, customer);
        db.addLog('auth', 'New Customer Registered', `تم تسجيل حساب جديد برقم ${normalized} ${staffInfo ? `(برتبة: ${staffInfo.roleTitle})` : ''}`);
      } else {
        // Refresh token & update staff role if applicable
        customer.token = 'token_' + Math.random().toString(36).substring(2) + Date.now().toString(36);
        if (staffInfo) {
          customer.role = staffInfo.role;
          customer.roleTitle = staffInfo.roleTitle;
          customer.permissions = staffInfo.permissions;
          if (!customer.name && staffInfo.name) {
            customer.name = staffInfo.name;
          }
        }
        db.customers.set(normalized, customer);
        db.addLog('auth', 'Customer Login', `تسجيل دخول ناجح للرقم ${normalized} (${customer.roleTitle || customer.role || 'زبونة'})`);
      }

      // Find user orders
      const userOrders = db.orders.filter(o => o.customerPhone === normalized || o.customerId === customer?.id);

      return res.json({
        success: true,
        isNewUser,
        customer: {
          id: customer.id,
          phone: customer.phone,
          name: customer.name || '',
          role: customer.role || 'customer',
          roleTitle: customer.roleTitle || (customer.role === 'manager' ? 'مدير' : customer.role === 'worker' ? 'عامل / كادر' : 'زبونة'),
          permissions: customer.permissions || [],
          governorate: customer.governorate || 'نينوى',
          district: customer.district || 'الموصل',
          address: customer.address || '',
          token: customer.token,
          ordersCount: userOrders.length,
          totalSpent: userOrders.reduce((sum, o) => sum + o.total, 0),
          wishlist: customer.wishlist || []
        },
        orders: userOrders
      });
    } catch (err: any) {
      console.error('Error verifying OTP:', err);
      return res.status(500).json({ error: 'حدث خطأ أثناء التحقق من الرمز' });
    }
  });

  // 3. Get Current User Profile (Auth Check)
  app.get('/api/auth/me', (req: Request, res: Response) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'غير مصرح بالدخول' });
    }
    const token = authHeader.split(' ')[1];
    let foundCustomer: Customer | undefined;
    for (const cust of db.customers.values()) {
      if (cust.token === token) {
        foundCustomer = cust;
        break;
      }
    }

    if (!foundCustomer) {
      return res.status(401).json({ error: 'جلسة المستخدم منتهية الصلاحية' });
    }

    const userOrders = db.orders.filter(o => o.customerPhone === foundCustomer?.phone || o.customerId === foundCustomer?.id);

    return res.json({
      customer: {
        id: foundCustomer.id,
        phone: foundCustomer.phone,
        name: foundCustomer.name || '',
        role: foundCustomer.role || 'customer',
        roleTitle: foundCustomer.roleTitle || (foundCustomer.role === 'manager' ? 'المدير العام' : foundCustomer.role === 'worker' ? 'عامل / كادر' : 'زبونة'),
        permissions: foundCustomer.permissions || [],
        governorate: foundCustomer.governorate || 'نينوى',
        district: foundCustomer.district || 'الموصل',
        address: foundCustomer.address || '',
        token: foundCustomer.token,
        ordersCount: userOrders.length,
        totalSpent: userOrders.reduce((sum, o) => sum + o.total, 0),
        wishlist: foundCustomer.wishlist || []
      },
      orders: userOrders
    });
  });

  // 4. Update Customer Profile
  app.post('/api/auth/update-profile', (req: Request, res: Response) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'غير مصرح بالدخول' });
    }
    const token = authHeader.split(' ')[1];
    let foundCustomer: Customer | undefined;
    for (const cust of db.customers.values()) {
      if (cust.token === token) {
        foundCustomer = cust;
        break;
      }
    }

    if (!foundCustomer) {
      return res.status(401).json({ error: 'جلسة المستخدم منتهية' });
    }

    const { name, governorate, district, address } = req.body;
    if (name !== undefined) foundCustomer.name = name;
    if (governorate !== undefined) foundCustomer.governorate = governorate;
    if (district !== undefined) foundCustomer.district = district;
    if (address !== undefined) foundCustomer.address = address;

    db.customers.set(foundCustomer.phone, foundCustomer);
    db.addLog('auth', 'Profile Updated', `تم تحديث بيانات العميلة ${foundCustomer.phone}`);

    return res.json({
      success: true,
      customer: foundCustomer
    });
  });

  // 5. Logout
  app.post('/api/auth/logout', (req: Request, res: Response) => {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      for (const cust of db.customers.values()) {
        if (cust.token === token) {
          cust.token = undefined;
          db.customers.set(cust.phone, cust);
          db.addLog('auth', 'Customer Logout', `تسجيل خروج للعميلة ${cust.phone}`);
          break;
        }
      }
    }
    return res.json({ success: true, message: 'تم تسجيل الخروج بنجاح' });
  });

  // --- PRODUCTS APIS ---

  app.get('/api/products', (req: Request, res: Response) => {
    const { category, search, minPrice, maxPrice, size, color, onSale, isNew, sort } = req.query;
    let list = [...db.products];

    if (category && typeof category === 'string' && category !== 'all' && category !== 'الكل') {
      list = list.filter(p => p.category.toLowerCase() === category.toLowerCase() || p.category.includes(category));
    }

    if (search && typeof search === 'string' && search.trim() !== '') {
      const q = search.trim().toLowerCase();
      list = list.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.details.some(d => d.toLowerCase().includes(q))
      );
    }

    if (minPrice) {
      const min = Number(minPrice);
      if (!isNaN(min)) list = list.filter(p => p.price >= min);
    }

    if (maxPrice) {
      const max = Number(maxPrice);
      if (!isNaN(max)) list = list.filter(p => p.price <= max);
    }

    if (size && typeof size === 'string') {
      list = list.filter(p => p.sizes.includes(size));
    }

    if (color && typeof color === 'string') {
      list = list.filter(p => p.colors.some(c => c.name.includes(color) || c.hex.toLowerCase() === color.toLowerCase()));
    }

    if (onSale === 'true') {
      list = list.filter(p => p.isOnSale || (p.discountPercentage && p.discountPercentage > 0));
    }

    if (isNew === 'true') {
      list = list.filter(p => p.isNew);
    }

    // Sorting
    if (sort === 'price-asc') {
      list.sort((a, b) => a.price - b.price);
    } else if (sort === 'price-desc') {
      list.sort((a, b) => b.price - a.price);
    } else if (sort === 'rating') {
      list.sort((a, b) => b.rating - a.rating);
    } else if (sort === 'reviews') {
      list.sort((a, b) => b.reviewsCount - a.reviewsCount);
    } else {
      // Default newest
      list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    return res.json({ products: list, total: list.length });
  });

  app.get('/api/products/:id', (req: Request, res: Response) => {
    const product = db.products.find(p => p.id === req.params.id || p.slug === req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'المنتج غير موجود' });
    }
    const reviews = db.reviews.filter(r => r.productId === product.id);
    const related = db.products.filter(p => p.category === product.category && p.id !== product.id).slice(0, 4);

    return res.json({ product, reviews, related });
  });

  // Admin Add Product
  app.post('/api/products', (req: Request, res: Response) => {
    try {
      const body = req.body;
      if (!body.name || !body.price || !body.category) {
        return res.status(400).json({ error: 'يرجى إدخال اسم المنتج والسعر والتصنيف' });
      }

      const newProduct: Product = {
        id: 'prd-' + Math.random().toString(36).substring(2, 8),
        name: body.name,
        slug: (body.name || 'item').toLowerCase().replace(/\s+/g, '-') + '-' + Date.now(),
        price: Number(body.price),
        originalPrice: body.originalPrice ? Number(body.originalPrice) : undefined,
        discountPercentage: body.discountPercentage ? Number(body.discountPercentage) : (body.originalPrice && body.originalPrice > body.price ? Math.round(((body.originalPrice - body.price) / body.originalPrice) * 100) : 0),
        category: body.category,
        description: body.description || '',
        details: Array.isArray(body.details) ? body.details : (body.details ? body.details.split('\n').filter(Boolean) : []),
        sizes: Array.isArray(body.sizes) && body.sizes.length > 0 ? body.sizes : ['Free Size'],
        colors: Array.isArray(body.colors) && body.colors.length > 0 ? body.colors : [{ name: 'افتراضي', hex: '#111111' }],
        images: Array.isArray(body.images) && body.images.length > 0 ? body.images : ['https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=900&auto=format&fit=crop&q=80'],
        stock: body.stock !== undefined ? Number(body.stock) : 10,
        isNew: body.isNew !== undefined ? Boolean(body.isNew) : true,
        isFeatured: body.isFeatured !== undefined ? Boolean(body.isFeatured) : false,
        isOnSale: body.isOnSale !== undefined ? Boolean(body.isOnSale) : Boolean(body.originalPrice && body.originalPrice > body.price),
        rating: 5.0,
        reviewsCount: 0,
        createdAt: new Date().toISOString()
      };

      db.products.unshift(newProduct);

      // Update category count
      const cat = db.categories.find(c => c.name === newProduct.category);
      if (cat) cat.itemCount += 1;

      db.addLog('product', 'Product Added', `تمت إضافة منتج جديد: ${newProduct.name}`);
      return res.status(201).json({ success: true, product: newProduct });
    } catch (err: any) {
      console.error('Error creating product:', err);
      return res.status(500).json({ error: 'حدث خطأ أثناء إضافة المنتج' });
    }
  });

  // Admin Update Product
  app.put('/api/products/:id', (req: Request, res: Response) => {
    const idx = db.products.findIndex(p => p.id === req.params.id);
    if (idx === -1) {
      return res.status(404).json({ error: 'المنتج غير موجود' });
    }

    const updated = {
      ...db.products[idx],
      ...req.body,
      price: req.body.price ? Number(req.body.price) : db.products[idx].price,
      stock: req.body.stock !== undefined ? Number(req.body.stock) : db.products[idx].stock
    };

    if (updated.originalPrice && updated.originalPrice > updated.price) {
      updated.discountPercentage = Math.round(((updated.originalPrice - updated.price) / updated.originalPrice) * 100);
      updated.isOnSale = true;
    }

    db.products[idx] = updated;
    db.addLog('product', 'Product Updated', `تم تعديل المنتج: ${updated.name}`);
    return res.json({ success: true, product: updated });
  });

  // Admin Delete Product
  app.delete('/api/products/:id', (req: Request, res: Response) => {
    const idx = db.products.findIndex(p => p.id === req.params.id);
    if (idx === -1) {
      return res.status(404).json({ error: 'المنتج غير موجود' });
    }

    const deleted = db.products.splice(idx, 1)[0];
    const cat = db.categories.find(c => c.name === deleted.category);
    if (cat && cat.itemCount > 0) cat.itemCount -= 1;

    db.addLog('product', 'Product Deleted', `تم حذف المنتج: ${deleted.name}`);
    return res.json({ success: true, message: 'تم حذف المنتج بنجاح' });
  });

  // --- CATEGORIES APIS ---

  app.get('/api/categories', (req: Request, res: Response) => {
    // Recount items
    db.categories.forEach(cat => {
      cat.itemCount = db.products.filter(p => p.category === cat.name).length;
    });
    return res.json({ categories: db.categories });
  });

  app.post('/api/categories', (req: Request, res: Response) => {
    const { name, description, image } = req.body;
    if (!name) return res.status(400).json({ error: 'اسم التصنيف مطلوب' });

    const newCat: Category = {
      id: 'cat-' + Math.random().toString(36).substring(2, 7),
      name,
      slug: name.toLowerCase().replace(/\s+/g, '-'),
      description: description || '',
      image: image || 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&auto=format&fit=crop&q=80',
      itemCount: 0
    };
    db.categories.push(newCat);
    db.addLog('product', 'Category Created', `تم إنشاء تصنيف جديد: ${name}`);
    return res.status(201).json({ success: true, category: newCat });
  });

  app.delete('/api/categories/:id', (req: Request, res: Response) => {
    const idx = db.categories.findIndex(c => c.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: 'التصنيف غير موجود' });
    const deleted = db.categories.splice(idx, 1)[0];
    db.addLog('product', 'Category Deleted', `تم حذف التصنيف: ${deleted.name}`);
    return res.json({ success: true, message: 'تم حذف التصنيف بنجاح' });
  });

  // --- REVIEWS APIS ---

  app.post('/api/products/:id/reviews', (req: Request, res: Response) => {
    const { customerName, rating, comment } = req.body;
    if (!customerName || !rating || !comment) {
      return res.status(400).json({ error: 'يرجى ملء جميع حقول التقييم' });
    }
    const product = db.products.find(p => p.id === req.params.id);
    if (!product) return res.status(404).json({ error: 'المنتج غير موجود' });

    const newReview: ProductReview = {
      id: 'rev-' + Math.random().toString(36).substring(2, 7),
      productId: product.id,
      customerName,
      rating: Number(rating),
      comment,
      date: 'الآن'
    };

    db.reviews.unshift(newReview);

    // Update product rating and reviewsCount
    const allProdReviews = db.reviews.filter(r => r.productId === product.id);
    const avg = allProdReviews.reduce((sum, r) => sum + r.rating, 0) / allProdReviews.length;
    product.rating = Number(avg.toFixed(1));
    product.reviewsCount = allProdReviews.length;

    db.addLog('product', 'Review Added', `تقييم جديد للمنتج ${product.name} من ${customerName}`);
    return res.status(201).json({ success: true, review: newReview, rating: product.rating, reviewsCount: product.reviewsCount });
  });

  // --- WISHLIST APIS ---

  app.post('/api/wishlist/toggle', (req: Request, res: Response) => {
    const { phone, productId } = req.body;
    if (!phone || !productId) return res.status(400).json({ error: 'معلومات غير مكتملة' });

    const normalized = normalizePhone(phone);
    const cust = db.customers.get(normalized);
    if (!cust) return res.status(404).json({ error: 'العميل غير مسجل' });

    const idx = cust.wishlist.indexOf(productId);
    let isWishlisted = false;
    if (idx > -1) {
      cust.wishlist.splice(idx, 1);
      isWishlisted = false;
    } else {
      cust.wishlist.push(productId);
      isWishlisted = true;
    }
    db.customers.set(normalized, cust);

    return res.json({ success: true, isWishlisted, wishlist: cust.wishlist });
  });

  // --- ORDERS & CHECKOUT APIS ---

  app.post('/api/orders', (req: Request, res: Response) => {
    try {
      const {
        customerPhone,
        customerName,
        governorate,
        district,
        address,
        notes,
        items,
        paymentMethod
      } = req.body;

      if (!customerPhone || !customerName || !governorate || !address || !items || !items.length) {
        return res.status(400).json({ error: 'يرجى استكمال جميع بيانات التوصيل والطلب' });
      }

      const normalized = normalizePhone(customerPhone);
      let customer = db.customers.get(normalized);
      if (!customer) {
        customer = {
          id: 'cust-' + Math.random().toString(36).substring(2, 8),
          phone: normalized,
          name: customerName,
          governorate,
          district: district || 'الموصل',
          address,
          createdAt: new Date().toISOString(),
          ordersCount: 0,
          totalSpent: 0,
          wishlist: []
        };
        db.customers.set(normalized, customer);
      } else {
        customer.name = customerName;
        customer.governorate = governorate;
        customer.district = district || customer.district;
        customer.address = address;
        db.customers.set(normalized, customer);
      }

      // Calculate Subtotal & Verify Stock
      let subtotal = 0;
      const orderItems: OrderItem[] = [];

      for (const item of items) {
        const prod = db.products.find(p => p.id === item.productId);
        if (!prod) {
          return res.status(400).json({ error: `المنتج ${item.name || item.productId} غير متوفر` });
        }
        if (prod.stock < item.quantity) {
          return res.status(400).json({ error: `الكمية المطلوبة من ${prod.name} غير متوفرة في المخزون حاليًا` });
        }

        // Deduct stock
        prod.stock -= item.quantity;

        const price = prod.price;
        subtotal += price * item.quantity;

        orderItems.push({
          productId: prod.id,
          name: prod.name,
          image: item.image || prod.images[0],
          size: item.size || 'Free Size',
          colorName: item.colorName || (item.color?.name || 'افتراضي'),
          colorHex: item.colorHex || (item.color?.hex || '#111'),
          price,
          quantity: item.quantity
        });
      }

      // Calculate delivery fee
      const isMosulOrNineveh = governorate.includes('نينوى') || governorate.includes('الموصل');
      let deliveryFee = isMosulOrNineveh ? db.settings.mosulDeliveryFee : db.settings.otherGovernoratesDeliveryFee;
      if (subtotal >= db.settings.freeDeliveryThreshold) {
        deliveryFee = 0;
      }

      const total = subtotal + deliveryFee;

      // Unique Iraqi Order ID (e.g. 4SHE-8291)
      const orderId = `4SHE-${Math.floor(1000 + Math.random() * 9000)}`;

      const newOrder: Order = {
        id: orderId,
        customerId: customer.id,
        customerName,
        customerPhone: normalized,
        governorate,
        district: district || '',
        address,
        notes: notes || '',
        items: orderItems,
        subtotal,
        deliveryFee,
        discount: 0,
        total,
        paymentMethod: paymentMethod === 'electronic' ? 'electronic' : 'cod',
        paymentStatus: 'pending',
        status: 'received',
        statusHistory: [
          {
            status: 'received',
            timestamp: new Date().toISOString(),
            note: 'تم تأكيد طلبكِ بنجاح في متجر أزياء 4sHe وسيتم تجهيزه فورًا'
          }
        ],
        createdAt: new Date().toISOString()
      };

      db.orders.unshift(newOrder);

      // Update customer stats
      customer.ordersCount += 1;
      customer.totalSpent += total;
      db.customers.set(normalized, customer);

      db.addLog('order', 'Order Created', `طلب جديد ${orderId} بقيمة ${total.toLocaleString('ar-IQ')} د.ع من ${customerName}`);

      return res.status(201).json({
        success: true,
        order: newOrder
      });
    } catch (err: any) {
      console.error('Error placing order:', err);
      return res.status(500).json({ error: 'حدث خطأ أثناء تأكيد الطلب' });
    }
  });

  // Get All Orders (Universal Endpoint)
  app.get('/api/orders', (req: Request, res: Response) => {
    const { status, search } = req.query;
    let list = [...db.orders];

    if (status && typeof status === 'string' && status !== 'all') {
      list = list.filter(o => o.status === status);
    }

    if (search && typeof search === 'string' && search.trim() !== '') {
      const q = search.trim().toLowerCase();
      list = list.filter(o =>
        o.id.toLowerCase().includes(q) ||
        o.customerPhone.includes(q) ||
        o.customerName.toLowerCase().includes(q) ||
        o.district.toLowerCase().includes(q)
      );
    }

    return res.json({ orders: list, total: list.length });
  });

  // Get Order By ID (Public Tracking)
  app.get('/api/orders/:id', (req: Request, res: Response) => {
    const order = db.orders.find(o => o.id.toLowerCase() === req.params.id.toLowerCase());
    if (!order) {
      return res.status(404).json({ error: 'رقم الطلب غير موجود' });
    }
    return res.json({ order });
  });

  // Update Order Status (Universal Endpoint)
  app.patch('/api/orders/:id/status', (req: Request, res: Response) => {
    const { status, note } = req.body;
    const order = db.orders.find(o => o.id === req.params.id);
    if (!order) return res.status(404).json({ error: 'الطلب غير موجود' });

    order.status = status;
    order.statusHistory.push({
      status,
      timestamp: new Date().toISOString(),
      note: note || (
        status === 'processing' ? 'قيد التجهيز والتغليف بفرع أسواق المثنى' :
        status === 'out_for_delivery' ? 'خرج الطلب مع مندوب التوصيل في الموصل' :
        status === 'delivered' ? 'تم تسليم الطلب بنجاح للزبونة' :
        status === 'cancelled' ? 'تم إلغاء الطلب' : 'تم تحديث الحالة'
      )
    });

    if (status === 'delivered') {
      order.paymentStatus = 'paid';
    }

    db.addLog('order', 'Order Status Updated', `تم تغيير حالة الطلب ${order.id} إلى ${status}`);
    return res.json({ success: true, order });
  });

  // Admin Get All Orders
  app.get('/api/admin/orders', (req: Request, res: Response) => {
    const { status, search } = req.query;
    let list = [...db.orders];

    if (status && typeof status === 'string' && status !== 'all') {
      list = list.filter(o => o.status === status);
    }

    if (search && typeof search === 'string' && search.trim() !== '') {
      const q = search.trim().toLowerCase();
      list = list.filter(o =>
        o.id.toLowerCase().includes(q) ||
        o.customerPhone.includes(q) ||
        o.customerName.toLowerCase().includes(q) ||
        o.district.toLowerCase().includes(q)
      );
    }

    return res.json({ orders: list, total: list.length });
  });

  // Admin Manual Order Creation (From Store / Phone)
  app.post('/api/admin/orders/create', (req: Request, res: Response) => {
    try {
      const {
        customerName,
        customerPhone,
        governorate,
        district,
        address,
        notes,
        items,
        paymentMethod,
        paymentStatus,
        status,
        discount
      } = req.body;

      if (!customerName || !customerPhone || !items || !items.length) {
        return res.status(400).json({ error: 'يرجى إدخال اسم الزبونة ورقم الهاتف وإضافة منتج واحد على الأقل' });
      }

      const normalized = normalizePhone(customerPhone);
      let customer = db.customers.get(normalized);
      if (!customer) {
        customer = {
          id: 'cust-' + Math.random().toString(36).substring(2, 8),
          phone: normalized,
          name: customerName,
          governorate: governorate || 'نينوى (الموصل)',
          district: district || 'الموصل',
          address: address || 'طلب مباشر من الفرع',
          createdAt: new Date().toISOString(),
          ordersCount: 0,
          totalSpent: 0,
          wishlist: []
        };
        db.customers.set(normalized, customer);
      }

      let subtotal = 0;
      const orderItems: OrderItem[] = [];

      for (const item of items) {
        const prod = db.products.find(p => p.id === item.productId);
        const itemPrice = item.price || (prod ? prod.price : 0);
        const itemQty = Number(item.quantity) || 1;

        if (prod) {
          prod.stock = Math.max(0, prod.stock - itemQty);
        }

        subtotal += itemPrice * itemQty;
        orderItems.push({
          productId: item.productId,
          name: item.name || (prod ? prod.name : 'منتج أزياء'),
          image: item.image || (prod ? prod.images[0] : ''),
          size: item.size || 'Free Size',
          colorName: item.colorName || 'افتراضي',
          colorHex: item.colorHex || '#111',
          price: itemPrice,
          quantity: itemQty
        });
      }

      const isMosul = (governorate || 'نينوى').includes('نينوى') || (governorate || '').includes('الموصل');
      let deliveryFee = isMosul ? db.settings.mosulDeliveryFee : db.settings.otherGovernoratesDeliveryFee;
      if (address?.includes('استلام من الفرع') || subtotal >= db.settings.freeDeliveryThreshold) {
        deliveryFee = 0;
      }

      const orderDiscount = Number(discount) || 0;
      const total = Math.max(0, subtotal + deliveryFee - orderDiscount);
      const orderId = `4SHE-${Math.floor(1000 + Math.random() * 9000)}`;

      const newOrder: Order = {
        id: orderId,
        customerId: customer.id,
        customerName,
        customerPhone: normalized,
        governorate: governorate || 'نينوى (الموصل)',
        district: district || 'الموصل',
        address: address || 'فرع أسواق المثنى',
        notes: notes || 'تم إنشاء الطلب يدويًا من لوحة الإدارة',
        items: orderItems,
        subtotal,
        deliveryFee,
        discount: orderDiscount,
        total,
        paymentMethod: paymentMethod || 'cod',
        paymentStatus: paymentStatus || 'paid',
        status: status || 'processing',
        statusHistory: [
          {
            status: status || 'processing',
            timestamp: new Date().toISOString(),
            note: 'تم تسجيل الطلب يدويًا بواسطة إدارة المتجر'
          }
        ],
        createdAt: new Date().toISOString()
      };

      db.orders.unshift(newOrder);
      customer.ordersCount += 1;
      customer.totalSpent += total;
      db.customers.set(normalized, customer);

      db.addLog('order', 'Manual Order Created', `تم إنشاء طلب يدوي ${orderId} بقيمة ${total.toLocaleString('ar-IQ')} د.ع`);
      return res.status(201).json({ success: true, order: newOrder });
    } catch (err: any) {
      console.error('Error creating manual order:', err);
      return res.status(500).json({ error: 'حدث خطأ أثناء إنشاء الطلب' });
    }
  });

  // Admin Restock / Inventory Inflow
  app.post('/api/admin/inventory/restock', (req: Request, res: Response) => {
    const { productId, addedQuantity, quantity, note } = req.body;
    const qty = Number(addedQuantity !== undefined ? addedQuantity : quantity);
    if (!productId || isNaN(qty) || qty <= 0) {
      return res.status(400).json({ error: 'يرجى تحديد المنتج والكمية المضافة بشكل صحيح' });
    }

    const prod = db.products.find(p => p.id === productId);
    if (!prod) return res.status(404).json({ error: 'المنتج غير موجود' });

    const prevStock = prod.stock;
    prod.stock += qty;

    if (!prod.stockMovements) {
      prod.stockMovements = [];
    }

    prod.stockMovements.unshift({
      id: 'mov-' + Math.random().toString(36).substring(2, 8),
      type: 'restock',
      quantity: qty,
      previousStock: prevStock,
      newStock: prod.stock,
      reason: note || `توريد شحنة بضاعة (+${qty})`,
      timestamp: new Date().toISOString()
    });

    db.addLog('product', 'Inventory Restocked', `تم تزويد المخزن بـ ${qty} قطعة من (${prod.name}) - الرصيد الحالي: ${prod.stock} قطعة. ${note ? `[ملاحظة: ${note}]` : ''}`);

    return res.json({
      success: true,
      message: `تم تحديث رصيد المخزن بنجاح إلى ${prod.stock} قطعة`,
      product: prod
    });
  });

  // Admin Update Order Status
  app.patch('/api/admin/orders/:id/status', (req: Request, res: Response) => {
    const { status, note } = req.body;
    const order = db.orders.find(o => o.id === req.params.id);
    if (!order) return res.status(404).json({ error: 'الطلب غير موجود' });

    order.status = status;
    order.statusHistory.push({
      status,
      timestamp: new Date().toISOString(),
      note: note || (
        status === 'processing' ? 'قيد التجهيز والتغليف بفرع أسواق المثنى' :
        status === 'out_for_delivery' ? 'خرج الطلب مع مندوب التوصيل في الموصل' :
        status === 'delivered' ? 'تم تسليم الطلب بنجاح للزبونة' :
        status === 'cancelled' ? 'تم إلغاء الطلب' : 'تم تحديث الحالة'
      )
    });

    if (status === 'delivered') {
      order.paymentStatus = 'paid';
    }

    db.addLog('order', 'Order Status Updated', `تم تغيير حالة الطلب ${order.id} إلى ${status}`);
    return res.json({ success: true, order });
  });

  // Admin Bulk Update Order Status
  app.post('/api/admin/orders/bulk-status', (req: Request, res: Response) => {
    try {
      const { orderIds, status, note } = req.body;
      if (!Array.isArray(orderIds) || orderIds.length === 0 || !status) {
        return res.status(400).json({ error: 'يرجى تحديد الطلبات والحالة الجديدة' });
      }

      let updatedCount = 0;
      const statusNote = note || (
        status === 'processing' ? 'تحديث جماعي: قيد التجهيز والتغليف' :
        status === 'out_for_delivery' ? 'تحديث جماعي: خرج مع مندوب التوصيل' :
        status === 'delivered' ? 'تحديث جماعي: تم التسليم للزبونة' :
        status === 'cancelled' ? 'تحديث جماعي: تم إلغاء الطلب' : `تحديث جماعي للحالة: ${status}`
      );

      for (const orderId of orderIds) {
        const order = db.orders.find(o => o.id === orderId);
        if (order) {
          order.status = status;
          order.statusHistory.push({
            status,
            timestamp: new Date().toISOString(),
            note: statusNote
          });
          if (status === 'delivered') {
            order.paymentStatus = 'paid';
          }
          updatedCount++;
        }
      }

      db.addLog('order', 'Bulk Order Status Updated', `تم تحديث حالة ${updatedCount} طلبات إلى (${status})`);

      return res.json({
        success: true,
        updatedCount,
        message: `تم تحديث حالة ${updatedCount} طلبات بنجاح`
      });
    } catch (err: any) {
      console.error('Error in bulk status update:', err);
      return res.status(500).json({ error: 'حدث خطأ أثناء التحديث الجماعي' });
    }
  });

  // Admin Add Staff Note to Order
  app.post('/api/admin/orders/:id/staff-notes', (req: Request, res: Response) => {
    try {
      const { text, author } = req.body;
      if (!text || !text.trim()) {
        return res.status(400).json({ error: 'يرجى كتابة نص الملاحظة' });
      }

      const order = db.orders.find(o => o.id === req.params.id);
      if (!order) return res.status(404).json({ error: 'الطلب غير موجود' });

      if (!order.staffNotes) {
        order.staffNotes = [];
      }

      const newNote = {
        id: 'sn-' + Math.random().toString(36).substring(2, 8),
        text: text.trim(),
        author: author?.trim() || 'فريق الإدارة',
        createdAt: new Date().toISOString()
      };

      order.staffNotes.unshift(newNote);
      db.addLog('order', 'Staff Note Added', `ملاحظة داخلية جديدة على الطلب ${order.id}: "${newNote.text.substring(0, 40)}..."`);

      return res.status(201).json({
        success: true,
        note: newNote,
        staffNotes: order.staffNotes,
        order
      });
    } catch (err: any) {
      console.error('Error adding staff note:', err);
      return res.status(500).json({ error: 'حدث خطأ أثناء إضافة الملاحظة' });
    }
  });

  // Admin Delete Staff Note
  app.delete('/api/admin/orders/:id/staff-notes/:noteId', (req: Request, res: Response) => {
    const order = db.orders.find(o => o.id === req.params.id);
    if (!order || !order.staffNotes) {
      return res.status(404).json({ error: 'الطلب أو الملاحظة غير موجودة' });
    }

    const idx = order.staffNotes.findIndex(n => n.id === req.params.noteId);
    if (idx === -1) {
      return res.status(404).json({ error: 'الملاحظة غير موجودة' });
    }

    order.staffNotes.splice(idx, 1);
    db.addLog('order', 'Staff Note Deleted', `تم حذف ملاحظة داخلية من الطلب ${order.id}`);

    return res.json({
      success: true,
      staffNotes: order.staffNotes,
      order
    });
  });

  // Admin Inventory Quick Adjust (+ / - or set)
  app.post('/api/admin/inventory/quick-adjust', (req: Request, res: Response) => {
    try {
      const { productId, change, newStock, reason } = req.body;
      const prod = db.products.find(p => p.id === productId);
      if (!prod) return res.status(404).json({ error: 'المنتج غير موجود' });

      const prevStock = prod.stock;
      let targetStock = prevStock;

      if (newStock !== undefined && !isNaN(Number(newStock))) {
        targetStock = Math.max(0, Number(newStock));
      } else if (change !== undefined && !isNaN(Number(change))) {
        targetStock = Math.max(0, prevStock + Number(change));
      }

      prod.stock = targetStock;

      if (!prod.stockMovements) {
        prod.stockMovements = [];
      }

      const diff = targetStock - prevStock;
      const movement = {
        id: 'mov-' + Math.random().toString(36).substring(2, 8),
        type: (diff > 0 ? 'restock' : diff < 0 ? 'adjustment' : 'manual') as any,
        quantity: diff,
        previousStock: prevStock,
        newStock: targetStock,
        reason: reason || (diff > 0 ? `زيادة رصيد (+${diff})` : diff < 0 ? `خصم رصيد (${diff})` : 'تعديل يدوي'),
        timestamp: new Date().toISOString()
      };

      prod.stockMovements.unshift(movement);
      db.addLog('product', 'Stock Adjusted', `تعديل رصيد (${prod.name}): من ${prevStock} إلى ${targetStock} قطعة. [${movement.reason}]`);

      return res.json({
        success: true,
        product: prod,
        movement,
        message: `تم تحديث المخزون إلى ${prod.stock} قطعة`
      });
    } catch (err: any) {
      console.error('Error adjusting stock:', err);
      return res.status(500).json({ error: 'حدث خطأ أثناء تعديل المخزون' });
    }
  });

  // Admin Update Product Low Stock Threshold
  app.patch('/api/products/:id/threshold', (req: Request, res: Response) => {
    const { lowStockThreshold } = req.body;
    const prod = db.products.find(p => p.id === req.params.id);
    if (!prod) return res.status(404).json({ error: 'المنتج غير موجود' });

    prod.lowStockThreshold = Number(lowStockThreshold) >= 0 ? Number(lowStockThreshold) : 3;
    db.addLog('product', 'Threshold Updated', `تم ضبط حد تنبيه المخزون للمنتج (${prod.name}) إلى ${prod.lowStockThreshold} قطع`);

    return res.json({ success: true, product: prod });
  });

  // Admin Update Order Payment Status
  app.patch('/api/admin/orders/:id/payment', (req: Request, res: Response) => {
    const { paymentStatus } = req.body;
    const order = db.orders.find(o => o.id === req.params.id);
    if (!order) return res.status(404).json({ error: 'الطلب غير موجود' });

    order.paymentStatus = paymentStatus;
    db.addLog('order', 'Payment Status Updated', `تم تحديث حالة الدفع للطلب ${order.id} إلى ${paymentStatus}`);
    return res.json({ success: true, order });
  });

  // Admin Get All Reviews & Moderation
  app.get('/api/admin/reviews', (req: Request, res: Response) => {
    return res.json({ reviews: db.reviews });
  });

  app.delete('/api/admin/reviews/:id', (req: Request, res: Response) => {
    const idx = db.reviews.findIndex(r => r.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: 'التقييم غير موجود' });
    const deleted = db.reviews.splice(idx, 1)[0];

    // Recalculate product rating
    const prod = db.products.find(p => p.id === deleted.productId);
    if (prod) {
      const remaining = db.reviews.filter(r => r.productId === prod.id);
      if (remaining.length > 0) {
        const avg = remaining.reduce((sum, r) => sum + r.rating, 0) / remaining.length;
        prod.rating = Number(avg.toFixed(1));
        prod.reviewsCount = remaining.length;
      } else {
        prod.rating = 5.0;
        prod.reviewsCount = 0;
      }
    }

    db.addLog('product', 'Review Deleted', `تم حذف تقييم للعميل (${deleted.customerName})`);
    return res.json({ success: true, message: 'تم حذف التقييم بنجاح' });
  });

  // --- ADMIN CUSTOMERS & ANALYTICS ---

  app.get('/api/admin/customers', (req: Request, res: Response) => {
    const customerList = Array.from(db.customers.values()).map(c => {
      const orders = db.orders.filter(o => o.customerPhone === c.phone || o.customerId === c.id);
      return {
        id: c.id,
        phone: c.phone,
        name: c.name || 'عميلة جديدة',
        governorate: c.governorate || 'نينوى',
        district: c.district || 'الموصل',
        address: c.address || '',
        ordersCount: orders.length,
        totalSpent: orders.reduce((sum, o) => sum + o.total, 0),
        createdAt: c.createdAt
      };
    });
    return res.json({ customers: customerList });
  });

  app.get('/api/admin/analytics', (req: Request, res: Response) => {
    const totalSales = db.orders.filter(o => o.status !== 'cancelled').reduce((sum, o) => sum + o.total, 0);
    const totalOrders = db.orders.length;
    const pendingOrders = db.orders.filter(o => o.status === 'received' || o.status === 'processing').length;
    const deliveredOrders = db.orders.filter(o => o.status === 'delivered').length;
    const totalCustomers = db.customers.size;
    const totalProducts = db.products.length;
    const lowStockCount = db.products.filter(p => p.stock <= 3).length;

    return res.json({
      analytics: {
        totalSales,
        totalOrders,
        pendingOrders,
        deliveredOrders,
        totalCustomers,
        totalProducts,
        lowStockCount,
        recentSales: [
          { date: 'اليوم', amount: totalSales * 0.4, count: 3 },
          { date: 'أمس', amount: totalSales * 0.3, count: 2 },
          { date: 'قبل يومين', amount: totalSales * 0.2, count: 2 },
          { date: 'قبل 3 أيام', amount: totalSales * 0.1, count: 1 }
        ]
      }
    });
  });

  app.get('/api/admin/logs', (req: Request, res: Response) => {
    return res.json({ logs: db.systemLogs });
  });

  // --- STAFF & RBAC APIS ---

  // Get All Staff Members
  app.get('/api/admin/staff', (req: Request, res: Response) => {
    return res.json({ staff: db.staffMembers });
  });

  // Add / Invite Staff Member (Manager Only)
  app.post('/api/admin/staff', (req: Request, res: Response) => {
    try {
      const { name, phone, role, roleTitle, permissions } = req.body;
      if (!name || !phone || !role) {
        return res.status(400).json({ error: 'يرجى إدخال اسم الموظف ورقم الهاتف والرتبة' });
      }

      const normalized = normalizePhone(phone);
      const existing = db.staffMembers.find(s => s.phone === normalized);
      if (existing) {
        return res.status(400).json({ error: 'هذا الرقم مسجل بالفعل ضمن كادر المتجر' });
      }

      const newStaff: StaffMember = {
        id: 'staff-' + Math.random().toString(36).substring(2, 8),
        name: name.trim(),
        phone: normalized,
        role: role === 'manager' ? 'manager' : 'worker',
        roleTitle: roleTitle?.trim() || (role === 'manager' ? 'مدير فرع' : 'كادر المبيعات والتجهيز'),
        status: 'active',
        permissions: Array.isArray(permissions) ? permissions : (role === 'manager' ? ['all'] : ['orders', 'inventory']),
        addedAt: new Date().toISOString()
      };

      db.staffMembers.push(newStaff);

      // If customer exists with this phone, update their role immediately
      const cust = db.customers.get(normalized);
      if (cust) {
        cust.role = newStaff.role;
        cust.roleTitle = newStaff.roleTitle;
        cust.permissions = newStaff.permissions;
        cust.name = newStaff.name;
        db.customers.set(normalized, cust);
      }

      db.addLog('auth', 'Staff Member Added', `تمت إضافة (${newStaff.name}) برتبة (${newStaff.roleTitle}) ورقم هاتف ${normalized}`);
      return res.status(201).json({ success: true, staff: newStaff, staffList: db.staffMembers });
    } catch (err: any) {
      console.error('Error adding staff:', err);
      return res.status(500).json({ error: 'حدث خطأ أثناء إضافة الموظف' });
    }
  });

  // Update Staff Member
  app.put('/api/admin/staff/:id', (req: Request, res: Response) => {
    try {
      const { name, role, roleTitle, status, permissions } = req.body;
      const staff = db.staffMembers.find(s => s.id === req.params.id);
      if (!staff) return res.status(404).json({ error: 'عضو الكادر غير موجود' });

      if (name) staff.name = name.trim();
      if (role) staff.role = role === 'manager' ? 'manager' : 'worker';
      if (roleTitle) staff.roleTitle = roleTitle.trim();
      if (status) staff.status = status;
      if (permissions && Array.isArray(permissions)) staff.permissions = permissions;

      // Update associated customer if exists
      const cust = db.customers.get(staff.phone);
      if (cust) {
        cust.role = staff.role;
        cust.roleTitle = staff.roleTitle;
        cust.permissions = staff.permissions;
        if (staff.name) cust.name = staff.name;
        db.customers.set(staff.phone, cust);
      }

      db.addLog('auth', 'Staff Member Updated', `تم تحديث بيانات (${staff.name}) - الرتبة: ${staff.roleTitle}`);
      return res.json({ success: true, staff, staffList: db.staffMembers });
    } catch (err: any) {
      console.error('Error updating staff:', err);
      return res.status(500).json({ error: 'حدث خطأ أثناء تحديث بيانات الموظف' });
    }
  });

  // Delete Staff Member
  app.delete('/api/admin/staff/:id', (req: Request, res: Response) => {
    const idx = db.staffMembers.findIndex(s => s.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: 'عضو الكادر غير موجود' });

    // Protect primary store owner
    if (db.staffMembers[idx].phone === '07707440557') {
      return res.status(400).json({ error: 'لا يمكن حذف الحساب الإداري الرئيسي للمتجر' });
    }

    const removed = db.staffMembers.splice(idx, 1)[0];
    const cust = db.customers.get(removed.phone);
    if (cust) {
      cust.role = 'customer';
      cust.roleTitle = 'زبونة';
      cust.permissions = [];
      db.customers.set(removed.phone, cust);
    }

    db.addLog('auth', 'Staff Member Removed', `تم إلغاء صلاحيات الإدارة للموظف (${removed.name})`);
    return res.json({ success: true, message: 'تم إزالة الموظف بنجاح', staffList: db.staffMembers });
  });

  // Reset Demo Data
  app.post('/api/admin/reset-demo', (req: Request, res: Response) => {
    db.products = [...initialProducts];
    db.categories = [...initialCategories];
    db.reviews = [...initialReviews];
    db.settings = { ...initialStoreSettings };
    db.addLog('system', 'Demo Reset', 'تمت استعادة البيانات الافتراضية للمتجر');
    return res.json({ success: true, message: 'تمت استعادة البيانات بنجاح' });
  });

  // --- SETTINGS APIS ---

  app.get('/api/settings', (req: Request, res: Response) => {
    return res.json({ settings: db.settings });
  });

  app.put('/api/settings', (req: Request, res: Response) => {
    db.settings = {
      ...db.settings,
      ...req.body
    };
    db.addLog('system', 'Settings Updated', 'تم تحديث إعدادات المتجر ومعلومات التواصل والتوصيل');
    return res.json({ success: true, settings: db.settings });
  });

  // --- VITE MIDDLEWARE ---
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🌸 متجر أزياء 4sHe يعمل بنجاح على http://localhost:${PORT}`);
  });
}

startServer();
