import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState('login'); // 'login' | 'signup'
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load user on startup
  useEffect(() => {
    const savedUser = localStorage.getItem('mato_user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        localStorage.removeItem('mato_user');
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

  const login = async (email, password) => {
    setIsLoading(true);
    setError(null);

    // Simulate server response delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Simple validation
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

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      setIsLoading(false);
      return false;
    }

    // Success Mock
    const displayName = email.split('@')[0];
    const formattedName = displayName.charAt(0).toUpperCase() + displayName.slice(1);
    const mockUser = {
      name: formattedName,
      email: email.toLowerCase(),
      // Use initials fallback styling or UI avatar service
      avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(formattedName)}&backgroundColor=0d9488,14b8a6,0f766e`,
    };

    setUser(mockUser);
    localStorage.setItem('mato_user', JSON.stringify(mockUser));
    setIsLoading(false);
    closeAuthModal();
    return true;
  };

  const signup = async (name, email, password) => {
    setIsLoading(true);
    setError(null);

    // Simulate server response delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

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

    // Success Mock
    const mockUser = {
      name: name.trim(),
      email: email.toLowerCase(),
      avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name.trim())}&backgroundColor=0d9488,14b8a6,0f766e`,
    };

    setUser(mockUser);
    localStorage.setItem('mato_user', JSON.stringify(mockUser));
    setIsLoading(false);
    closeAuthModal();
    return true;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('mato_user');
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
