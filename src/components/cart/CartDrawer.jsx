import { useEffect, useState } from 'react';
import { X, ShoppingBag, Plus, Minus, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';

export default function CartDrawer() {
  const navigate = useNavigate();
  const {
    cartItems,
    isCartOpen,
    setIsCartOpen,
    updateQuantity,
    removeFromCart,
    cartTotal,
    clearCart,
  } = useCart();

  const [checkoutStep, setCheckoutStep] = useState('cart'); // cart, checkout, success
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    notes: '',
  });

  // Prevent background scrolling when cart is open
  useEffect(() => {
    if (isCartOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
      // Reset checkout step when drawer is closed
      setTimeout(() => setCheckoutStep('cart'), 300);
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isCartOpen]);

  if (!isCartOpen) return null;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckoutSubmit = (e) => {
    e.preventDefault();
    setCheckoutStep('success');
  };

  const finishCheckout = () => {
    clearCart();
    setIsCartOpen(false);
    setFormData({ name: '', phone: '', address: '', notes: '' });
  };

  return (
    <div className="fixed inset-0 z-[100] flex justify-end">
      {/* Overlay backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 animate-fade-in"
        onClick={() => setIsCartOpen(false)}
      />

      {/* Cart Drawer Panel */}
      <div className="relative w-full max-w-md h-full bg-surface-card border-l border-surface-border backdrop-blur-xl shadow-2xl flex flex-col z-10 transition-transform duration-300 animate-slide-left carbon-texture">
        {/* Header */}
        <div className="p-6 border-b border-surface-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-brand-500" />
            <h2 className="text-lg font-bold text-white">Your Cart</h2>
          </div>
          <button
            onClick={() => setIsCartOpen(false)}
            className="p-2 rounded-lg border border-surface-border bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content area based on step */}
        {checkoutStep === 'cart' && (
          <>
            {/* Cart Items List */}
            <div className="flex-grow overflow-y-auto p-6 space-y-4">
              {cartItems.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-4 py-12">
                  <div className="w-16 h-16 rounded-full bg-white/5 border border-surface-border flex items-center justify-center text-slate-500">
                    <ShoppingBag className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">Your cart is empty</h3>
                    <p className="text-xs text-slate-500 max-w-[200px] mx-auto mt-1">
                      Choose from our premium 3D prints to upgrade your setup.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setIsCartOpen(false);
                      navigate('/products');
                    }}
                    className="btn-primary py-2 px-6 text-xs mt-2"
                  >
                    Start Shopping
                  </button>
                </div>
              ) : (
                cartItems.map((item) => (
                  <div
                    key={item.product.id}
                    className="flex gap-4 p-4 rounded-xl border border-surface-border bg-black/20"
                  >
                    {/* Thumbnail */}
                    <div className="w-20 h-20 rounded-lg overflow-hidden border border-surface-border/50 bg-surface flex-shrink-0">
                      <img
                        src={item.product.image}
                        alt={item.product.name}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Info */}
                    <div className="flex-grow flex flex-col justify-between">
                      <div>
                        <h4 className="text-sm font-bold text-white line-clamp-1">
                          {item.product.name}
                        </h4>
                        <p className="text-xs text-brand-400 font-semibold mt-0.5">
                          Rs. {item.product.price}
                        </p>
                      </div>

                      {/* Controls */}
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center gap-2 border border-surface-border bg-white/5 rounded-lg p-0.5">
                          <button
                            onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                            className="p-1 rounded text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="text-xs font-semibold text-white px-1.5 min-w-[20px] text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                            className="p-1 rounded text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <button
                          onClick={() => removeFromCart(item.product.id)}
                          className="text-slate-500 hover:text-rose-500 p-1.5 rounded transition-colors"
                          aria-label="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer Summary */}
            {cartItems.length > 0 && (
              <div className="p-6 border-t border-surface-border bg-surface/50 space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-slate-400">
                    <span>Subtotal</span>
                    <span className="font-semibold text-white">Rs. {cartTotal}</span>
                  </div>
                  <div className="flex justify-between text-xs text-slate-400">
                    <span>Shipping</span>
                    <span className="text-emerald-400 font-medium">Free Shipping (Nepal)</span>
                  </div>
                  <div className="border-t border-surface-border/50 pt-2 flex justify-between text-sm font-bold text-white">
                    <span>Total</span>
                    <span className="text-brand-400">Rs. {cartTotal}</span>
                  </div>
                </div>

                <button
                  onClick={() => setCheckoutStep('checkout')}
                  className="w-full btn-primary py-3 justify-center text-sm font-bold shadow-brand-sm"
                >
                  Proceed to Checkout
                </button>
              </div>
            )}
          </>
        )}

        {checkoutStep === 'checkout' && (
          <form onSubmit={handleCheckoutSubmit} className="flex-grow flex flex-col h-full">
            {/* Scrollable details */}
            <div className="flex-grow overflow-y-auto p-6 space-y-5">
              <h3 className="text-base font-bold text-white mb-2">Order Details</h3>
              <p className="text-xs text-slate-500 leading-relaxed -mt-3">
                Please enter your shipping details. Since all Matoverse parts are printed custom, we will contact you directly to confirm the dimensions, colors, and delivery details.
              </p>

              {/* Name */}
              <div className="space-y-1.5 text-left">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Full Name</label>
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full bg-surface border border-surface-border rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                  placeholder="Enter your name"
                />
              </div>

              {/* Phone */}
              <div className="space-y-1.5 text-left">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Phone Number</label>
                <input
                  type="tel"
                  name="phone"
                  required
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full bg-surface border border-surface-border rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                  placeholder="e.g. 98XXXXXXXX"
                />
              </div>

              {/* Address */}
              <div className="space-y-1.5 text-left">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Delivery Address</label>
                <input
                  type="text"
                  name="address"
                  required
                  value={formData.address}
                  onChange={handleInputChange}
                  className="w-full bg-surface border border-surface-border rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                  placeholder="e.g. Putalisadak, Kathmandu"
                />
              </div>

              {/* Notes */}
              <div className="space-y-1.5 text-left">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Customization Notes (Optional)</label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full bg-surface border border-surface-border rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
                  placeholder="Specify material preference (PLA/PETG), colors, or model specifications..."
                />
              </div>
            </div>

            {/* Bottom buttons */}
            <div className="p-6 border-t border-surface-border bg-surface/50 space-y-3">
              <div className="flex justify-between text-xs text-slate-400 mb-2">
                <span>Order Total</span>
                <span className="font-bold text-brand-400">Rs. {cartTotal}</span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setCheckoutStep('cart')}
                  className="w-full btn-ghost py-3 justify-center text-xs font-bold"
                >
                  Back to Cart
                </button>
                <button
                  type="submit"
                  className="w-full btn-primary py-3 justify-center text-xs font-bold shadow-brand-sm"
                >
                  Confirm Order
                </button>
              </div>
            </div>
          </form>
        )}

        {checkoutStep === 'success' && (
          <div className="flex-grow p-8 flex flex-col items-center justify-center text-center space-y-6">
            <div className="w-20 h-20 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 text-4xl animate-bounce-slow">
              ✓
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-black text-white">Order Placed Successfully!</h3>
              <p className="text-xs text-slate-400 leading-relaxed max-w-sm mx-auto">
                Thank you for ordering, <span className="font-bold text-white">{formData.name}</span>! Since Matoverse parts are printed custom, our workshop team will call or message you at <span className="font-semibold text-white">{formData.phone}</span> to finalize color choices and slice specs before starting the print bed.
              </p>
            </div>
            <button
              onClick={finishCheckout}
              className="btn-primary py-3 px-8 text-xs shadow-brand-sm"
            >
              Continue Browsing
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
