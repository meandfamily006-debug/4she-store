import React, { createContext, useContext, useState, useEffect } from 'react';
import { CartItem, Product, ProductColor, Order } from '../types';
import { useStore } from './StoreContext';

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: Product, size: string, color: ProductColor, quantity?: number) => { success: boolean; error?: string };
  removeFromCart: (productId: string, size: string, colorHex: string) => void;
  updateQuantity: (productId: string, size: string, colorHex: string, delta: number) => void;
  clearCart: () => void;
  isCartDrawerOpen: boolean;
  setIsCartDrawerOpen: (open: boolean) => void;
  isCheckoutModalOpen: boolean;
  setIsCheckoutModalOpen: (open: boolean) => void;
  selectedGovernorate: string;
  setSelectedGovernorate: (gov: string) => void;
  subtotal: number;
  deliveryFee: number;
  total: number;
  itemCount: number;
  lastCompletedOrder: Order | null;
  setLastCompletedOrder: (order: Order | null) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { settings } = useStore();
  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('4she_customer_cart');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return [];
      }
    }
    return [];
  });
  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState(false);
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [selectedGovernorate, setSelectedGovernorate] = useState<string>('نينوى (الموصل)');
  const [lastCompletedOrder, setLastCompletedOrder] = useState<Order | null>(null);

  // Save cart to local storage
  useEffect(() => {
    localStorage.setItem('4she_customer_cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (product: Product, size: string, color: ProductColor, quantity: number = 1): { success: boolean; error?: string } => {
    // Validate size if product has sizes
    if (product.sizes && product.sizes.length > 0 && !size) {
      return { success: false, error: 'يرجى اختيار المقاس المناسب أولاً' };
    }

    if (product.stock < quantity) {
      return { success: false, error: 'الكمية المطلوبة غير متوفرة في المخزون حاليًا' };
    }

    const effectiveColor = color || (product.colors && product.colors.length > 0 ? product.colors[0] : { name: 'افتراضي', hex: '#111' });
    const effectiveSize = size || (product.sizes && product.sizes.length > 0 ? product.sizes[0] : 'Free Size');

    setCart(prevCart => {
      const existingIndex = prevCart.findIndex(
        item => item.productId === product.id && item.size === effectiveSize && item.color.hex === effectiveColor.hex
      );

      if (existingIndex > -1) {
        const nextCart = [...prevCart];
        const newQty = nextCart[existingIndex].quantity + quantity;
        if (newQty > product.stock) {
          nextCart[existingIndex].quantity = product.stock;
        } else {
          nextCart[existingIndex].quantity = newQty;
        }
        return nextCart;
      } else {
        return [
          ...prevCart,
          {
            productId: product.id,
            product,
            size: effectiveSize,
            color: effectiveColor,
            quantity: Math.min(quantity, product.stock),
            unitPrice: product.price
          }
        ];
      }
    });

    setIsCartDrawerOpen(true);
    return { success: true };
  };

  const removeFromCart = (productId: string, size: string, colorHex: string) => {
    setCart(prev => prev.filter(item => !(item.productId === productId && item.size === size && item.color.hex === colorHex)));
  };

  const updateQuantity = (productId: string, size: string, colorHex: string, delta: number) => {
    setCart(prev => {
      return prev
        .map(item => {
          if (item.productId === productId && item.size === size && item.color.hex === colorHex) {
            const nextQty = item.quantity + delta;
            if (nextQty <= 0) return null;
            if (nextQty > item.product.stock) return item;
            return { ...item, quantity: nextQty };
          }
          return item;
        })
        .filter(Boolean) as CartItem[];
    });
  };

  const clearCart = () => {
    setCart([]);
    localStorage.removeItem('4she_customer_cart');
  };

  const subtotal = cart.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);

  // Delivery calculation based on governorate
  const isMosul = selectedGovernorate.includes('نينوى') || selectedGovernorate.includes('الموصل');
  const mosulFee = settings?.mosulDeliveryFee ?? 3000;
  const otherFee = settings?.otherGovernoratesDeliveryFee ?? 5000;
  const threshold = settings?.freeDeliveryThreshold ?? 100000;

  const deliveryFee = cart.length === 0 ? 0 : (subtotal >= threshold ? 0 : (isMosul ? mosulFee : otherFee));
  const total = subtotal + deliveryFee;
  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        isCartDrawerOpen,
        setIsCartDrawerOpen,
        isCheckoutModalOpen,
        setIsCheckoutModalOpen,
        selectedGovernorate,
        setSelectedGovernorate,
        subtotal,
        deliveryFee,
        total,
        itemCount,
        lastCompletedOrder,
        setLastCompletedOrder
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within a CartProvider');
  return context;
};
