import { CheckCircle, X } from 'lucide-react';

export default function SuccessModal({ onDismiss }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
      onClick={onDismiss}
    >
      <div
        className="relative bg-surface-card border border-surface-border rounded-3xl p-8 max-w-md w-full shadow-card animate-fade-in-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Glow */}
        <div className="absolute -top-12 -right-12 w-40 h-40 orb orb-primary opacity-50 pointer-events-none" />

        {/* Close button */}
        <button
          onClick={onDismiss}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-surface-600 hover:text-surface-900 hover:bg-black/10 transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-[0_0_40px_rgba(16,185,129,0.4)]">
            <CheckCircle className="w-10 h-10 text-surface-900" />
          </div>
        </div>

        {/* Content */}
        <div className="text-center space-y-3">
          <h3 className="text-2xl font-bold text-surface-900">Message Sent!</h3>
          <p className="text-surface-600 leading-relaxed">
            Thanks for reaching out. Our team will review your message and get back to you within <span className="text-brand-300 font-semibold">24 hours</span>.
          </p>
        </div>

        {/* CTA */}
        <button
          onClick={onDismiss}
          className="mt-6 w-full btn-primary justify-center"
        >
          Back to Site
        </button>
      </div>
    </div>
  );
}

