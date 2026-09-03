import React, { createContext, useContext, useState, useEffect } from 'react';
import type {
  Product,
  StoreSettings,
  Announcement,
  CartItem,
  ProductWeight,
} from '../types';

interface Toast {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

interface StoreContextType {
  settings: StoreSettings | null;
  announcement: Announcement | null;
  announcements: Announcement[];
  products: Product[];
  cart: CartItem[];
  currentView: string;
  selectedProduct: Product | null;
  toasts: Toast[];
  isLoading: boolean;
  adminToken: string | null;
  // Methods
  setCurrentView: (view: string) => void;
  setSelectedProduct: (product: Product | null) => void;
  addToCart: (product: Product, weight: ProductWeight, quantity?: number) => void;
  updateCartQuantity: (productId: string, weight: ProductWeight, quantity: number) => void;
  removeFromCart: (productId: string, weight: ProductWeight) => void;
  clearCart: () => void;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  removeToast: (id: string) => void;
  refreshBootstrap: () => Promise<void>;
  fetchProducts: () => Promise<void>;
  fetchSettings: () => Promise<void>;
  fetchAnnouncements: () => Promise<void>;
  setAdminToken: (token: string | null) => void;
  getCartTotalCount: () => number;
  getCartSubtotal: () => number;
}

const StoreContext = createContext<StoreContextType | null>(null);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<StoreSettings | null>(null);
  const [announcement, setAnnouncement] = useState<Announcement | null>(null);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [currentView, setCurrentView] = useState<string>('home');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [adminToken, setAdminTokenState] = useState<string | null>(() => {
    return localStorage.getItem('nut_store_admin_token');
  });

  // Load cart from localStorage
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('nut_store_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Save cart changes
  useEffect(() => {
    localStorage.setItem('nut_store_cart', JSON.stringify(cart));
  }, [cart]);

  const setAdminToken = (token: string | null) => {
    if (token) {
      localStorage.setItem('nut_store_admin_token', token);
    } else {
      localStorage.removeItem('nut_store_admin_token');
    }
    setAdminTokenState(token);
  };

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      removeToast(id);
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const fetchProducts = async () => {
    try {
      const token = localStorage.getItem('nut_store_admin_token') || adminToken;
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;
      // In admin mode, load all products including inactive ones
      const url = token ? '/api/admin/products' : '/api/products';
      const res = await fetch(url, { headers });
      if (res.ok) {
        const data = await res.json();
        setProducts(data);
      }
    } catch (e) {
      console.error('Failed to fetch products:', e);
    }
  };

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/public/bootstrap');
      if (res.ok) {
        const data = await res.json();
        setSettings(data.settings);
        setAnnouncement(data.announcement);
      }
    } catch (e) {
      console.error('Failed to fetch settings:', e);
    }
  };

  const fetchAnnouncements = async () => {
    try {
      const token = localStorage.getItem('nut_store_admin_token') || adminToken;
      if (!token) return;
      const res = await fetch('/api/admin/announcements', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setAnnouncements(data);
      }
    } catch (e) {
      console.error('Failed to fetch announcements:', e);
    }
  };

  const refreshBootstrap = async () => {
    try {
      const res = await fetch('/api/public/bootstrap');
      if (res.ok) {
        const data = await res.json();
        setSettings(data.settings);
        setAnnouncement(data.announcement);
        setProducts(data.products || []);
      }
      if (adminToken) {
        await Promise.all([fetchProducts(), fetchAnnouncements()]);
      }
    } catch (e) {
      console.error('Failed to load store data:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshBootstrap();
  }, [adminToken]);

  const addToCart = (product: Product, weight: ProductWeight, quantity: number = 1) => {
    if (quantity <= 0) return;

    // Check product stock limit
    const existingTotalForProduct = cart
      .filter((item) => item.product.id === product.id)
      .reduce((sum, item) => sum + item.quantity, 0);

    if (existingTotalForProduct + quantity > product.stock) {
      showToast(
        `متأسفانه موجودی این محصول حداکثر ${product.stock} بسته است و امکان افزودن بیشتر وجود ندارد.`,
        'error'
      );
      return;
    }

    setCart((prev) => {
      const index = prev.findIndex(
        (it) => it.product.id === product.id && it.weight === weight
      );
      if (index >= 0) {
        const updated = [...prev];
        updated[index].quantity += quantity;
        return updated;
      } else {
        return [...prev, { product, weight, quantity }];
      }
    });

    showToast(`«${product.name}» (${weight} گرم) به سبد خرید اضافه شد.`, 'success');
  };

  const updateCartQuantity = (productId: string, weight: ProductWeight, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId, weight);
      return;
    }

    const item = cart.find((i) => i.product.id === productId && i.weight === weight);
    if (!item) return;

    // Calculate total needed for product
    const otherQty = cart
      .filter((i) => i.product.id === productId && i.weight !== weight)
      .reduce((s, i) => s + i.quantity, 0);

    if (otherQty + quantity > item.product.stock) {
      showToast(
        `حداکثر موجودی قابل سفارش برای این محصول ${item.product.stock} بسته است.`,
        'error'
      );
      return;
    }

    setCart((prev) =>
      prev.map((it) =>
        it.product.id === productId && it.weight === weight
          ? { ...it, quantity }
          : it
      )
    );
  };

  const removeFromCart = (productId: string, weight: ProductWeight) => {
    setCart((prev) =>
      prev.filter((it) => !(it.product.id === productId && it.weight === weight))
    );
    showToast('آیتم از سبد خرید حذف شد.', 'info');
  };

  const clearCart = () => {
    setCart([]);
  };

  const getCartTotalCount = () => {
    return cart.reduce((sum, it) => sum + it.quantity, 0);
  };

  const getCartSubtotal = () => {
    return cart.reduce((sum, it) => {
      const basePrice = it.product[`price_${it.weight}` as keyof Product] as number;
      const discount = (it.product[`discount_${it.weight}` as keyof Product] as number) || 0;
      const unitPrice = Math.round(basePrice * (1 - discount / 100));
      return sum + unitPrice * it.quantity;
    }, 0);
  };

  return (
    <StoreContext.Provider
      value={{
        settings,
        announcement,
        announcements,
        products,
        cart,
        currentView,
        selectedProduct,
        toasts,
        isLoading,
        adminToken,
        setCurrentView,
        setSelectedProduct,
        addToCart,
        updateCartQuantity,
        removeFromCart,
        clearCart,
        showToast,
        removeToast,
        refreshBootstrap,
        fetchProducts,
        fetchSettings,
        fetchAnnouncements,
        setAdminToken,
        getCartTotalCount,
        getCartSubtotal,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within StoreProvider');
  }
  return context;
}
