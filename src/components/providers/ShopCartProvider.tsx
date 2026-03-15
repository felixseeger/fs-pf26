'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';

export interface ShopCartOption {
  name: string;
  value: string;
}

export interface ShopCartItem {
  id: string;
  productId: number;
  variationId?: number;
  name: string;
  price: number;
  quantity: number;
  imageSrc?: string;
  imageAlt?: string;
  selectedOptions: ShopCartOption[];
}

interface ShopCartContextValue {
  items: ShopCartItem[];
  itemCount: number;
  total: number;
  addItem: (item: ShopCartItem) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  removeItem: (itemId: string) => void;
  clearCart: () => void;
}

const STORAGE_KEY = 'shop-cart-items';

const ShopCartContext = createContext<ShopCartContextValue | null>(null);

export function useShopCart() {
  const context = useContext(ShopCartContext);

  if (!context) {
    throw new Error('useShopCart must be used within ShopCartProvider');
  }

  return context;
}

export function ShopCartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<ShopCartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const savedItems = localStorage.getItem(STORAGE_KEY);
      if (savedItems) {
        setItems(JSON.parse(savedItems) as ShopCartItem[]);
      }
    } catch {
      // Ignore invalid persisted cart data.
    } finally {
      setHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [hydrated, items]);

  const value = useMemo<ShopCartContextValue>(() => {
    const addItem = (item: ShopCartItem) => {
      setItems((prev) => {
        const existing = prev.find((entry) => entry.id === item.id);

        if (existing) {
          return prev.map((entry) =>
            entry.id === item.id
              ? { ...entry, quantity: entry.quantity + item.quantity }
              : entry
          );
        }

        return [...prev, item];
      });
    };

    const updateQuantity = (itemId: string, quantity: number) => {
      setItems((prev) =>
        prev.flatMap((item) => {
          if (item.id !== itemId) return [item];
          if (quantity <= 0) return [];
          return [{ ...item, quantity }];
        })
      );
    };

    const removeItem = (itemId: string) => {
      setItems((prev) => prev.filter((item) => item.id !== itemId));
    };

    const clearCart = () => {
      setItems([]);
    };

    const itemCount = items.reduce((count, item) => count + item.quantity, 0);
    const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

    return {
      items,
      itemCount,
      total,
      addItem,
      updateQuantity,
      removeItem,
      clearCart,
    };
  }, [items]);

  return (
    <ShopCartContext.Provider value={value}>
      {children}
    </ShopCartContext.Provider>
  );
}
