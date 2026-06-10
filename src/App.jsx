import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import Home from './pages/Home';
import Products from './pages/Products';
import About from './pages/About';
import Contact from './pages/Contact';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';
import CartDrawer from './components/cart/CartDrawer';
import AuthModal from './components/ui/AuthModal';

// Scroll to top on route change
function ScrollToTop() {
  const { pathname } = useLocation();

  // Scroll instantly on page transition
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  // Smooth scroll to top when clicking a link that points to the current page
  useEffect(() => {
    const handleGlobalClick = (e) => {
      const anchor = e.target.closest('a');
      if (anchor) {
        const href = anchor.getAttribute('href');
        if (href) {
          try {
            // Resolve relative paths to absolute URL
            const destUrl = new URL(href, window.location.origin);
            if (
              destUrl.origin === window.location.origin &&
              destUrl.pathname === window.location.pathname
            ) {
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }
          } catch {
            // Ignore non-standard hrefs
          }
        }
      }
    };

    document.addEventListener('click', handleGlobalClick);
    return () => document.removeEventListener('click', handleGlobalClick);
  }, []);

  return null;
}

function AppLayout() {
  return (
    <div className="flex flex-col min-h-screen bg-surface">
      <Header />
      <main className="flex-grow">
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<Products />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          {/* Catch-all redirect to home */}
          <Route path="*" element={<Home />} />
        </Routes>
      </main>
      <Footer />
      <CartDrawer />
      <AuthModal />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <BrowserRouter>
          <AppLayout />
        </BrowserRouter>
      </CartProvider>
    </AuthProvider>
  );
}

