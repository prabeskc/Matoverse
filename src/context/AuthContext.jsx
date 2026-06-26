import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

// Backend API base URL
const API_BASE = 'http://localhost:5000/api';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState('login'); // 'login' | 'signup'
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load user from localStorage on startup (persists session across refresh)
  useEffect(() => {
    const savedUser = localStorage.getItem('mato_user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        localStorage.removeItem('mato_user');
        localStorage.removeItem('mato_token');
      }
    }
  }, []);

  const openAuthModal = (tab = 'login') => {
    setAuthModalTab(tab);
    setError(null);
    setAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setAuthModalOpen(false);
    setError(null);
  };

  // ─── LOGIN ────────────────────────────────────────────────────────────────
  // Calls the real backend API — Supabase Auth verifies credentials.
  // Random/invalid credentials will be rejected with a 401 error.
  const login = async (email, password) => {
    setIsLoading(true);
    setError(null);

    // Basic client-side format validation before hitting the network
    if (!email || !password) {
      setError('Please fill in all fields.');
      setIsLoading(false);
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Please enter a valid email address.');
      setIsLoading(false);
      return false;
    }

    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        // Server returned an error (e.g. wrong password, user not found)
        setError(data.message || 'Incorrect email or password.');
        setIsLoading(false);
        return false;
      }

      // Persist session token and user profile (including phone + address)
      localStorage.setItem('mato_token', data.token);
      localStorage.setItem('mato_user', JSON.stringify(data.user));
      setUser(data.user);
      closeAuthModal();
      return true;
    } catch (err) {
      // Network error (e.g. backend not running)
      setError('Cannot reach the server. Make sure the backend is running.');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // ─── SIGNUP ───────────────────────────────────────────────────────────────
  // Calls the real backend API — creates a new Supabase Auth user.
  // Duplicate emails are rejected with a 409 error from the backend.
  const signup = async (name, email, password) => {
    setIsLoading(true);
    setError(null);

    // Client-side validation
    if (!name || !email || !password) {
      setError('Please fill in all fields.');
      setIsLoading(false);
      return false;
    }
    if (name.trim().length < 2) {
      setError('Name must be at least 2 characters.');
      setIsLoading(false);
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Please enter a valid email address.');
      setIsLoading(false);
      return false;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      setIsLoading(false);
      return false;
    }

    try {
      const res = await fetch(`${API_BASE}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || 'Signup failed. Please try again.');
        setIsLoading(false);
        return false;
      }

      // Persist session token and user profile
      localStorage.setItem('mato_token', data.token);
      localStorage.setItem('mato_user', JSON.stringify(data.user));
      setUser(data.user);
      closeAuthModal();
      return true;
    } catch (err) {
      setError('Cannot reach the server. Make sure the backend is running.');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // ─── LOGOUT ───────────────────────────────────────────────────────────────
  const logout = () => {
    setUser(null);
    localStorage.removeItem('mato_user');
    localStorage.removeItem('mato_token'); // Clear the session JWT
  };

  // ─── UPDATE PROFILE ───────────────────────────────────────────────────────
  // Saves phone number and delivery address to Supabase profiles table.
  // Updates local state and localStorage so checkout form auto-fills next time.
  const updateProfile = async (phone, address) => {
    const token = localStorage.getItem('mato_token');
    if (!token) return { success: false, message: 'Not authenticated.' };

    try {
      const res = await fetch(`${API_BASE}/auth/profile`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ phone, address }),
      });

      const data = await res.json();

      if (!res.ok) {
        return { success: false, message: data.message || 'Failed to update profile.' };
      }

      // Merge updated fields into local user state (preserve role)
      const updatedUser = {
        ...user,
        phone: data.user.phone,
        address: data.user.address,
      };
      localStorage.setItem('mato_user', JSON.stringify(updatedUser));
      setUser(updatedUser);

      return { success: true };
    } catch (err) {
      return { success: false, message: 'Cannot reach the server. Make sure the backend is running.' };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        authModalOpen,
        authModalTab,
        isLoading,
        error,
        openAuthModal,
        closeAuthModal,
        setAuthModalTab,
        login,
        signup,
        logout,
        updateProfile,
        setError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
