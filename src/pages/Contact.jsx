import { Mail, MapPin, Phone, Clock, Send, Loader2, CheckCircle2, Paperclip } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { useContactForm } from '../hooks/useContactForm';
import SuccessModal from '../components/ui/SuccessModal';
import { motion, AnimatePresence } from 'framer-motion';

const subjects = [
  'General Inquiry',
  'Custom PLA Print Order',
  'Custom PETG Print Order',
  'STL File Review & Quote',
  'Bulk / Batch Order',
  'Partnership Opportunity',
  'Support',
];

const contactInfo = [
  {
    icon: MapPin,
    label: 'Workshop',
    value: 'Kathmandu, Nepal',
    color: 'from-brand-600 to-brand-700',
  },
  {
    icon: Mail,
    label: 'Email',
    value: 'hello@matoverse.io',
    color: 'from-neon-500 to-neon-600',
  },
  {
    icon: Phone,
    label: 'Phone',
    value: '+977 98XXXXXXXX',
    color: 'from-cyan-600 to-teal-700',
  },
  {
    icon: Clock,
    label: 'Hours',
    value: 'Sun – Fri, 10 AM – 6 PM NPT',
    color: 'from-slate-600 to-slate-700',
  },
];

function InputField({ label, id, error, children }) {
  return (
    <div className="space-y-1.5 text-left">
      <label htmlFor={id} className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
        {label}
      </label>
      {children}
      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -4, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -4, height: 0 }}
            className="text-neon-500 text-xs flex items-center gap-1.5 mt-1"
            role="alert"
          >
            <span>⚠</span> {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

const inputBase =
  `w-full bg-surface-card/60 backdrop-blur-sm border rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600
   focus:outline-none focus:ring-2 focus:ring-brand-500/60 focus:border-brand-500/50
   transition-all duration-200`;

const inputClass = (error) =>
  `${inputBase} ${
    error
      ? 'border-neon-500/50 bg-neon-950/10'
      : 'border-white/8 hover:border-white/15 focus:bg-surface-card/80'
  }`;

export default function Contact() {
  const {
    values, errors, isSubmitting, isSuccess, submitError,
    handleChange, handleSubmit, dismissSuccess,
  } = useContactForm();

  const location = useLocation();

  // Pre-fill subject if directed from catalog
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const subjectParam = params.get('subject');
    if (subjectParam) {
      const event = {
        target: {
          name: 'subject',
          value: subjects.includes(subjectParam) ? subjectParam : 'STL File Review & Quote',
        },
      };
      handleChange(event);
      if (subjectParam.startsWith('Order Inquiry: ')) {
        const prodName = subjectParam.replace('Order Inquiry: ', '');
        const messageEvent = {
          target: {
            name: 'message',
            value: `Hello Matoverse Team,\n\nI would like to request a custom print quote for the "${prodName}". Please let me know material options, pricing details, and lead times for shipping to my location.`,
          },
        };
        handleChange(messageEvent);
      }
    }
  }, [location, handleChange]);

  return (
    <div className="relative overflow-hidden pt-16 min-h-screen">

      {/* Background */}
      <div className="fixed inset-0 -z-10 mesh-bg" />
      <div className="orb orb-primary w-[500px] h-[500px] top-[12%] right-[-100px] opacity-20 pointer-events-none" />
      <div className="orb orb-secondary w-[400px] h-[400px] bottom-[15%] left-[-150px] opacity-12 pointer-events-none" />

      {/* ─────────────────────────────────────────────────────────
         HERO SECTION
         ───────────────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-12 sm:pt-20 sm:pb-14">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="space-y-4 text-left max-w-2xl"
        >
          <span className="section-label">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-500" />
            Get in Touch
          </span>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.05] font-display">
            Let's Build Your<br />
            <span className="gradient-text">Custom Parts</span>
          </h1>
          <p className="text-slate-400 text-base sm:text-lg leading-relaxed">
            Fill out the request form below to submit a custom print order, ask for material recommendations, or send your STL models for file review.
          </p>
        </motion.div>
      </section>

      {/* ─────────────────────────────────────────────────────────
         MAIN CONTENT GRID
         ───────────────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">

          {/* ── Contact Info Sidebar ── */}
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-4 space-y-4"
          >
            {contactInfo.map((info, i) => {
              const Icon = info.icon;
              return (
                <motion.div
                  key={info.label}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.15 + i * 0.07 }}
                  className="card-glass p-5 flex items-center gap-4 group hover:border-brand-500/20 transition-all duration-300"
                >
                  <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${info.color} flex items-center justify-center text-white flex-shrink-0 shadow-brand-sm group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="w-4.5 h-4.5" />
                  </div>
                  <div className="space-y-0.5 text-left min-w-0">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                      {info.label}
                    </span>
                    <p className="text-sm font-semibold text-white truncate">
                      {info.value}
                    </p>
                  </div>
                </motion.div>
              );
            })}

            {/* Quick Tip Card */}
            <motion.div
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="card-glass p-5 bg-brand-950/30 border-brand-900/30 text-left"
            >
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 rounded-lg bg-brand-500/20 flex items-center justify-center">
                  <CheckCircle2 className="w-3.5 h-3.5 text-brand-400" />
                </div>
                <h4 className="text-sm font-bold text-white">Quick Printing Tip</h4>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                When uploading STL files for a quote, please specify your desired infill % (e.g., 20% grid) and layer height (0.2mm speed / 0.12mm detail) in the message area.
              </p>
            </motion.div>
          </motion.div>

          {/* ── Contact Form Card ── */}
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-8 card-glass p-7 sm:p-10 carbon-texture"
          >
            <div className="mb-7">
              <h2 className="text-xl font-bold text-white font-display">Request a Print Quote</h2>
              <p className="text-slate-500 text-sm mt-1">We'll get back to you within 24 hours.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5" noValidate>

              {/* Name & Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <InputField label="Your Name" id="name" error={errors.name}>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={values.name}
                    onChange={handleChange}
                    placeholder="e.g. Prabesh KC"
                    disabled={isSubmitting}
                    className={inputClass(errors.name)}
                    autoComplete="name"
                  />
                </InputField>

                <InputField label="Email Address" id="email" error={errors.email}>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={values.email}
                    onChange={handleChange}
                    placeholder="e.g. prabesh@example.com"
                    disabled={isSubmitting}
                    className={inputClass(errors.email)}
                    autoComplete="email"
                  />
                </InputField>
              </div>

              {/* Subject */}
              <InputField label="Subject / Topic" id="subject" error={errors.subject}>
                <div className="relative">
                  <select
                    id="subject"
                    name="subject"
                    value={values.subject}
                    onChange={handleChange}
                    disabled={isSubmitting}
                    className={`${inputClass(errors.subject)} appearance-none pr-10 cursor-pointer`}
                  >
                    <option value="" disabled className="bg-surface-card text-slate-500">
                      Select inquiry topic
                    </option>
                    {subjects.map((subj) => (
                      <option key={subj} value={subj} className="bg-surface-card text-white">
                        {subj}
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-500">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </InputField>

              {/* Message */}
              <InputField label="Detailed Message" id="message" error={errors.message}>
                <textarea
                  id="message"
                  name="message"
                  rows="6"
                  value={values.message}
                  onChange={handleChange}
                  placeholder="Tell us about the parts — dimensions, target car/bike models, materials (PLA, PETG), links to STL files..."
                  disabled={isSubmitting}
                  className={`${inputClass(errors.message)} resize-none`}
                />
              </InputField>

              {/* File Attachment */}
              <div className="space-y-1.5 text-left">
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Attachment (Optional)
                </label>
                <div
                  className={`relative flex flex-col items-center justify-center border border-dashed rounded-xl p-5 text-center transition-all duration-200 ${
                    values.file
                      ? 'border-brand-500 bg-brand-950/10'
                      : 'border-white/10 hover:border-white/20 bg-surface-card/30'
                  }`}
                >
                  <input
                    type="file"
                    id="file"
                    name="file"
                    onChange={handleChange}
                    disabled={isSubmitting}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  />
                  <div className="flex flex-col items-center gap-2">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      values.file ? 'bg-brand-500/20 text-brand-400' : 'bg-white/5 text-slate-400'
                    }`}>
                      <Paperclip className="w-4.5 h-4.5" />
                    </div>
                    {values.file ? (
                      <div className="space-y-1">
                        <p className="text-sm font-semibold text-brand-400 truncate max-w-[280px] sm:max-w-[400px]">
                          {values.file.name}
                        </p>
                        <p className="text-xs text-slate-500">
                          {(values.file.size / (1024 * 1024)).toFixed(2)} MB
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-slate-300">
                          Click to upload file
                        </p>
                        <p className="text-xs text-slate-500">
                          STL, OBJ, STEP, images, or PDFs (max. 50MB)
                        </p>
                      </div>
                    )}
                  </div>
                  {values.file && (
                    <button
                      type="button"
                      onClick={() => {
                        const event = {
                          target: {
                            name: 'file',
                            type: 'file',
                            files: null,
                          },
                        };
                        handleChange(event);
                      }}
                      className="absolute right-4 top-1/2 -translate-y-1/2 z-25 p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>

              {submitError && (
                <div className="p-3 bg-neon-950/20 border border-neon-500/30 rounded-xl text-xs text-neon-400 text-left flex items-start gap-2 animate-pulse">
                  <span>⚠</span>
                  <span>{submitError}</span>
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-primary w-full justify-center py-3.5 text-sm disabled:opacity-50 disabled:scale-100 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Processing STL Specs...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Submit Quote Request</span>
                  </>
                )}
              </button>

            </form>
          </motion.div>

        </div>
      </section>

      {/* Success Modal */}
      {isSuccess && <SuccessModal onDismiss={dismissSuccess} />}

    </div>
  );
}
