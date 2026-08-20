import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, Category, StoreSettings, ProductReview } from '../types';
import { useAuth } from './AuthContext';

export type ActivePage = 'home' | 'shop' | 'categories' | 'offers' | 'about' | 'contact' | 'policies' | 'profile' | 'admin';

interface StoreContextType {
  products: Product[];
  categories: Category[];
  settings: StoreSettings | null;
  isLoading: boolean;
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  activePage: ActivePage;
  setActivePage: (page: ActivePage) => void;
  selectedProduct: Product | null;
  setSelectedProduct: (product: Product | null) => void;
  wishlist: string[];
  toggleWishlist: (productId: string) => Promise<void>;
  isWishlisted: (productId: string) => boolean;
  fetchProducts: () => Promise<void>;
  fetchSettings: () => Promise<void>;
  currentPolicyTab: 'return' | 'privacy' | 'shipping' | 'terms';
  setCurrentPolicyTab: (tab: 'return' | 'privacy' | 'shipping' | 'terms') => void;
  trackingOrderId: string | null;
  setTrackingOrderId: (id: string | null) => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { customer } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [settings, setSettings] = useState<StoreSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activePage, setActivePage] = useState<ActivePage>('home');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [currentPolicyTab, setCurrentPolicyTab] = useState<'return' | 'privacy' | 'shipping' | 'terms'>('return');
  const [trackingOrderId, setTrackingOrderId] = useState<string | null>(null);

  // Sync wishlist with customer
  useEffect(() => {
    if (customer && customer.wishlist) {
      setWishlist(customer.wishlist);
    } else {
      const saved = localStorage.getItem('4she_local_wishlist');
      if (saved) {
        try {
          setWishlist(JSON.parse(saved));
        } catch (e) {}
      }
    }
  }, [customer]);

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/products');
      if (res.ok) {
        const data = await res.json();
        setProducts(data.products || []);
      }
    } catch (err) {
      console.error('Failed to fetch products', err);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/categories');
      if (res.ok) {
        const data = await res.json();
        setCategories(data.categories || []);
      }
    } catch (err) {
      console.error('Failed to fetch categories', err);
    }
  };

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/settings');
      if (res.ok) {
        const data = await res.json();
        setSettings(data.settings);
      }
    } catch (err) {
      console.error('Failed to fetch settings', err);
    }
  };

  useEffect(() => {
    const initData = async () => {
      setIsLoading(true);
      await Promise.all([fetchProducts(), fetchCategories(), fetchSettings()]);
      setIsLoading(false);
    };
    initData();
  }, []);

  const toggleWishlist = async (productId: string) => {
    let nextWishlist: string[];
    if (wishlist.includes(productId)) {
      nextWishlist = wishlist.filter(id => id !== productId);
    } else {
      nextWishlist = [...wishlist, productId];
    }
    setWishlist(nextWishlist);
    localStorage.setItem('4she_local_wishlist', JSON.stringify(nextWishlist));

    if (customer && customer.phone) {
      try {
        await fetch('/api/wishlist/toggle', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phone: customer.phone, productId })
        });
      } catch (err) {
        console.error('Wishlist sync failed', err);
      }
    }
  };

  const isWishlisted = (productId: string) => wishlist.includes(productId);

  return (
    <StoreContext.Provider
      value={{
        products,
        categories,
        settings,
        isLoading,
        selectedCategory,
        setSelectedCategory,
        searchQuery,
        setSearchQuery,
        activePage,
        setActivePage,
        selectedProduct,
        setSelectedProduct,
        wishlist,
        toggleWishlist,
        isWishlisted,
        fetchProducts,
        fetchSettings,
        currentPolicyTab,
        setCurrentPolicyTab,
        trackingOrderId,
        setTrackingOrderId
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) throw new Error('useStore must be used within a StoreProvider');
  return context;
};
