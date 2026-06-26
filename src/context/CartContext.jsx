import { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

const API_BASE = 'http://localhost:5000/api';

// ─── Authenticated Fetch Helper ────────────────────────────────────────────
// Automatically attaches the session JWT Bearer token to protected cart routes.
const authFetch = (url, options = {}) => {
  const token = localStorage.getItem('mato_token');
  return fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });
};

const BACKEND_URL = 'http://localhost:5000';

const normalizeApiCart = (apiItems) =>
  (apiItems || []).map((item) => {
    const rawProd = item.productId || {};
    let imageUrl = rawProd.imageUrl || rawProd.image_url || rawProd.image;
    if (imageUrl && imageUrl.startsWith('/')) {
      imageUrl = `${BACKEND_URL}${imageUrl}`;
    }
    return {
      product: {
        ...rawProd,
        id: rawProd.id || rawProd._id,
        name: rawProd.title || rawProd.name, // Normalize title to name
        image: imageUrl,
      },
      quantity: item.quantity,
    };
  });

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isSynced, setIsSynced] = useState(false); // Has cart been loaded from API?

  // ─── Load Cart on Mount ──────────────────────────────────────────────────
  // If user is logged in: fetch cart from API (authoritative source).
  // If not logged in: fall back to localStorage.
  useEffect(() => {
    const token = localStorage.getItem('mato_token');

    if (token) {
      // Authenticated — sync from server
      authFetch(`${API_BASE}/cart`)
        .then((res) => res.json())
        .then((data) => {
          if (data.status === 'success') {
            setCartItems(normalizeApiCart(data.data.cart.items));
          }
        })
        .catch(() => {
          // Fallback to localStorage if network fails
          const saved = localStorage.getItem('mato_verse_cart');
          if (saved) {
            try { setCartItems(JSON.parse(saved)); } catch {}
          }
        })
        .finally(() => setIsSynced(true));
    } else {
      // Guest — load from localStorage
      try {
        const saved = localStorage.getItem('mato_verse_cart');
        setCartItems(saved ? JSON.parse(saved) : []);
      } catch {
        setCartItems([]);
      }
      setIsSynced(true);
    }
  }, []);

  // ─── Persist to localStorage for guests ──────────────────────────────────
  useEffect(() => {
    if (!localStorage.getItem('mato_token') && isSynced) {
      localStorage.setItem('mato_verse_cart', JSON.stringify(cartItems));
    }
  }, [cartItems, isSynced]);

  // ─── addToCart ────────────────────────────────────────────────────────────
  const addToCart = async (product, quantity = 1, openCart = false) => {
    const token = localStorage.getItem('mato_token');

    if (token) {
      // Logged in — sync with backend API
      try {
        const res = await authFetch(`${API_BASE}/cart/add`, {
          method: 'POST',
          body: JSON.stringify({
            productId: product._id || product.id,
            quantity,
          }),
        });
        const data = await res.json();
        if (data.status === 'success') {
          setCartItems(normalizeApiCart(data.data.cart.items));
        }
      } catch (err) {
        console.error('Cart sync error:', err);
      }
    } else {
      // Guest — local state only
      setCartItems((prev) => {
        const existing = prev.find((item) => item.product.id === product.id);
        if (existing) {
          return prev.map((item) =>
            item.product.id === product.id
              ? { ...item, quantity: item.quantity + quantity }
              : item
          );
        }
        return [...prev, { product, quantity }];
      });
    }

    if (openCart) setIsCartOpen(true);
  };

  // ─── removeFromCart ───────────────────────────────────────────────────────
  const removeFromCart = async (productId) => {
    const token = localStorage.getItem('mato_token');

    if (token) {
      try {
        const res = await authFetch(`${API_BASE}/cart/remove/${productId}`, {
          method: 'DELETE',
        });
        const data = await res.json();
        if (data.status === 'success') {
          setCartItems(normalizeApiCart(data.data.cart.items));
        }
      } catch (err) {
        console.error('Cart remove error:', err);
      }
    } else {
      setCartItems((prev) => prev.filter((item) => item.product.id !== productId));
    }
  };

  // ─── updateQuantity ───────────────────────────────────────────────────────
  const updateQuantity = async (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    const token = localStorage.getItem('mato_token');

    if (token) {
      try {
        const res = await authFetch(`${API_BASE}/cart/update`, {
          method: 'PUT',
          body: JSON.stringify({ productId, quantity }),
        });
        const data = await res.json();
        if (data.status === 'success') {
          setCartItems(normalizeApiCart(data.data.cart.items));
        }
      } catch (err) {
        console.error('Cart update error:', err);
      }
    } else {
      setCartItems((prev) =>
        prev.map((item) =>
          item.product.id === productId ? { ...item, quantity } : item
        )
      );
    }
  };

  // ─── clearCart ────────────────────────────────────────────────────────────
  const clearCart = async () => {
    const token = localStorage.getItem('mato_token');

    if (token) {
      try {
        await authFetch(`${API_BASE}/cart/clear`, { method: 'DELETE' });
      } catch (err) {
        console.error('Cart clear error:', err);
      }
    }

    setCartItems([]);
    localStorage.removeItem('mato_verse_cart');
  };

  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const cartTotal = cartItems.reduce(
    (acc, item) => acc + (item.product?.price || 0) * item.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{
        cartItems,
        isCartOpen,
        setIsCartOpen,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartCount,
        cartTotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
