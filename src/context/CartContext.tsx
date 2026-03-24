import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from './AuthContext';
import { apiFetch } from '../utils/api';

// Define types for clarity
export interface Product {
  id: string;
  _id: string;
  name: string;
  price: number;
  image_url: string;
  vendor_id: string;
  category: string;
  stock: number;
}

export interface CartItem extends Product {
  quantity: number;
}

interface CartAPIResponse {
  _id: string;
  user: string;
  items: {
    product: Product;
    quantity: number;
    _id: string;
  }[];
}

interface CartContextType {
  items: CartItem[];
  loading: boolean;
  error: string | null;
  addToCart: (product: Product, quantity?: number) => Promise<void>;
  removeFromCart: (productId: string) => Promise<void>;
  updateQuantity: (productId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  total: number;
  itemCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

const transformCartItems = (apiItems: CartAPIResponse['items']): CartItem[] => {
  if (!apiItems) return [];
  return apiItems.map(item => ({
    ...item.product,
    id: item.product._id, // ensure id is present for components that use it
    quantity: item.quantity,
  }));
};

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, token } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCart = useCallback(async () => {
    if (!token) {
      // Guest logic: Load from localStorage
      const localCart = localStorage.getItem('elibuy_cart');
      if (localCart) {
        try {
          setItems(JSON.parse(localCart));
        } catch (e) {
          console.error("Failed to parse local cart", e);
          setItems([]);
        }
      } else {
        setItems([]);
      }
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    // Check for local cart to merge upon login
    const localCartStr = localStorage.getItem('elibuy_cart');
    if (localCartStr) {
      try {
        const localItems: CartItem[] = JSON.parse(localCartStr);
        if (localItems.length > 0) {
          await apiFetch('/api/cart/merge', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ 
              items: localItems.map(item => ({ productId: item.id || item._id, quantity: item.quantity })) 
            }),
          });
          localStorage.removeItem('elibuy_cart');
        }
      } catch (e) {
        console.error("Failed to merge local cart", e);
      }
    }

    try {
      const res = await apiFetch('/api/cart', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data: CartAPIResponse = await res.json();
      if (res.ok) {
        setItems(transformCartItems(data.items));
      } else {
        throw new Error((data as any).error || 'Failed to fetch cart');
      }
    } catch (err: any) {
      setError(err.message);
      console.error("Failed to fetch cart:", err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const handleCartUpdate = (data: CartAPIResponse) => {
    setItems(transformCartItems(data.items));
  };

  const addToCart = async (product: Product, quantity = 1) => {
    if (!token) {
      // Guest logic: Save to localStorage
      setItems(prevItems => {
        const newItem = { ...product, quantity, id: product.id || product._id };
        const existingItemIndex = prevItems.findIndex(item => item.id === newItem.id);
        
        let newItems;
        if (existingItemIndex > -1) {
          newItems = [...prevItems];
          newItems[existingItemIndex].quantity += quantity;
        } else {
          newItems = [...prevItems, newItem];
        }
        
        localStorage.setItem('elibuy_cart', JSON.stringify(newItems));
        return newItems;
      });
      alert('Item added to local cart.');
      return;
    }
    setLoading(true);
    try {
      const res = await apiFetch('/api/cart/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ productId: product.id || product._id, quantity }),
      });
      const data = await res.json();
      if (res.ok) { handleCartUpdate(data); } 
      else { throw new Error(data.error || 'Failed to add item'); }
    } catch (err: any) { alert(`Error: ${err.message}`); } 
    finally { setLoading(false); }
  };

  const updateCartItem = async (productId: string, quantity: number) => {
    if (!token) {
      // Guest logic: Update localStorage
      setItems(prevItems => {
        let newItems;
        if (quantity <= 0) {
          newItems = prevItems.filter(item => item.id !== productId);
        } else {
          newItems = prevItems.map(item => item.id === productId ? { ...item, quantity } : item);
        }
        localStorage.setItem('elibuy_cart', JSON.stringify(newItems));
        return newItems;
      });
      return;
    }
    setLoading(true);
    try {
      const method = quantity > 0 ? 'PUT' : 'DELETE';
      const endpoint = `/api/cart/items/${productId}`;
      const res = await apiFetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: quantity > 0 ? JSON.stringify({ quantity }) : undefined,
      });
      const data = await res.json();
      if (res.ok) { handleCartUpdate(data); } 
      else { throw new Error(data.error || 'Failed to update cart'); }
    } catch (err: any) { alert(`Error: ${err.message}`); } 
    finally { setLoading(false); }
  };

  const updateQuantity = (productId: string, quantity: number) => updateCartItem(productId, quantity);
  const removeFromCart = (productId: string) => updateCartItem(productId, 0);

  const clearCart = async () => {
    if (!token) {
      // Guest logic: Clear localStorage
      setItems([]);
      localStorage.removeItem('elibuy_cart');
      return;
    }
    setLoading(true);
    try {
      await apiFetch('/api/cart', { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
      setItems([]);
    } catch (err: any) { alert(`Error: ${err.message}`); } 
    finally { setLoading(false); }
  };

  const total = useMemo(() => items.reduce((sum, item) => sum + item.price * item.quantity, 0), [items]);
  const itemCount = useMemo(() => items.reduce((sum, item) => sum + item.quantity, 0), [items]);

  const value = { items, loading, error, addToCart, removeFromCart, updateQuantity, clearCart, total, itemCount };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};