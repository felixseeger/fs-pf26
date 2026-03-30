'use client';

import { useState, FormEvent, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, AlertCircle, Loader2, ArrowRight } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import gsap from 'gsap';

export interface NewsletterCollectProps {
  group?: 'blog' | 'course';
  source?: string;
  variant?: 'inline' | 'card' | 'banner';
  title?: string;
  description?: string;
  ctaText?: string;
  showName?: boolean;
  className?: string;
}

type Status = 'idle' | 'loading' | 'success' | 'error';

const MAILERLITE_API = 'https://connect.mailerlite.com/api/subscribers';

// Particle burst on success — brand lime dots scatter from checkmark
function useParticleBurst(ref: React.RefObject<HTMLDivElement | null>, trigger: boolean) {
  useEffect(() => {
    if (!trigger || !ref.current) return;
    const container = ref.current;
    const count = 18;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    for (let i = 0; i < count; i++) {
      const dot = document.createElement('div');
      const size = 4 + Math.random() * 4;
      dot.style.cssText = `
        position: absolute;
        left: 50%;
        top: 40%;
        width: ${size}px;
        height: ${size}px;
        border-radius: 50%;
        background: #a3e635;
        pointer-events: none;
        transform: translate(-50%, -50%);
        z-index: 10;
      `;
      container.appendChild(dot);

      const angle = (i / count) * 360 + Math.random() * 10;
      const distance = 48 + Math.random() * 36;
      const rad = (angle * Math.PI) / 180;

      gsap.fromTo(
        dot,
        { x: 0, y: 0, opacity: 1, scale: 1 },
        {
          x: Math.cos(rad) * distance,
          y: Math.sin(rad) * distance,
          opacity: 0,
          scale: 0.2,
          duration: 0.55 + Math.random() * 0.25,
          ease: 'power2.out',
          delay: i * 0.018,
          onComplete: () => dot.remove(),
        },
      );
    }
  }, [trigger, ref]);
}

export default function NewsletterCollect({
  group = 'blog',
  source = 'website',
  variant = 'card',
  title = 'Stay in the loop',
  description = 'Get weekly insights on AI, web development, and building digital products. No spam, unsubscribe anytime.',
  ctaText = 'Subscribe',
  showName = false,
  className = '',
}: NewsletterCollectProps) {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const formRef = useRef<HTMLFormElement>(null);
  const successRef = useRef<HTMLDivElement>(null);

  useParticleBurst(successRef, status === 'success');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setErrorMsg('');

    const apiKey = process.env.NEXT_PUBLIC_MAILERLITE_API_KEY;
    const groupId =
      group === 'course'
        ? process.env.NEXT_PUBLIC_ML_GROUP_COURSE
        : process.env.NEXT_PUBLIC_ML_GROUP_BLOG;

    if (!apiKey || !groupId) {
      setStatus('error');
      setErrorMsg('Newsletter service is not configured yet.');
      return;
    }

    try {
      const res = await fetch(MAILERLITE_API, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          email: email.trim(),
          fields: { name: name.trim() || undefined, source },
          groups: [groupId],
        }),
      });

      if (res.ok || res.status === 200 || res.status === 201) {
        setStatus('success');
        setEmail('');
        setName('');
      } else {
        const data = await res.json().catch(() => null);
        setStatus('error');
        setErrorMsg(data?.message || 'Something went wrong. Please try again.');
      }
    } catch {
      setStatus('error');
      setErrorMsg('Network error. Please check your connection.');
    }
  };

  const resetForm = () => {
    setStatus('idle');
    setErrorMsg('');
  };

  /* ── Success state — the delight moment ─────────────── */
  const successContent = (
    <motion.div
      ref={successRef}
      key="success"
      className="relative flex flex-col items-center py-6 text-center overflow-visible"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.25 }}
    >
      {/* Checkmark circle — spring scales in, then path draws */}
      <div className="relative mb-5">
        <motion.div
          className="w-14 h-14 rounded-full bg-primary/15 flex items-center justify-center"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 380, damping: 18, delay: 0.05 }}
        >
          <svg
            className="w-7 h-7 text-primary"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            overflow="visible"
          >
            <motion.path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2.5}
              d="M5 13l4 4L19 7"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.45, ease: [0.25, 1, 0.5, 1], delay: 0.28 }}
            />
          </svg>
        </motion.div>

        {/* Outer ring pulse */}
        <motion.div
          className="absolute inset-0 rounded-full border-2 border-primary/40"
          initial={{ scale: 1, opacity: 0.6 }}
          animate={{ scale: 1.7, opacity: 0 }}
          transition={{ duration: 0.6, ease: [0.25, 1, 0.5, 1], delay: 0.3 }}
        />
      </div>

      {/* Brand-voice headline */}
      <motion.p
        className="font-unbounded font-black text-base text-foreground tracking-tight leading-snug"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.25, 1, 0.5, 1], delay: 0.45 }}
      >
        Signal received.
      </motion.p>

      {/* Sub-copy */}
      <motion.p
        className="text-sm text-muted-foreground mt-2 max-w-[240px] leading-relaxed"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.25, 1, 0.5, 1], delay: 0.58 }}
      >
        Confirmation email en route — click the link to lock in your spot.
      </motion.p>

      {/* Reset link */}
      <motion.button
        onClick={resetForm}
        className="mt-4 text-[11px] text-muted-foreground/60 hover:text-primary transition-colors underline underline-offset-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.8 }}
      >
        Subscribe with a different address
      </motion.button>
    </motion.div>
  );

  /* ── Error state ───────────────────────────────────── */
  const errorContent = (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-3 py-2"
    >
      <div className="p-2 bg-red-500/10 rounded-full shrink-0">
        <AlertCircle size={18} className="text-red-500" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-red-500">{errorMsg}</p>
      </div>
      <button
        onClick={resetForm}
        className="text-xs text-primary hover:underline shrink-0"
      >
        Try again
      </button>
    </motion.div>
  );

  /* ── Form fields ───────────────────────────────────── */
  const formFields = (
    <motion.form
      ref={formRef}
      onSubmit={handleSubmit}
      className={`flex gap-2 ${variant === 'banner' ? 'flex-row' : 'flex-col sm:flex-row'}`}
      animate={status === 'error' ? { x: [0, -8, 8, -5, 5, -2, 2, 0] } : { x: 0 }}
      transition={status === 'error' ? { duration: 0.45, ease: 'easeInOut' } : undefined}
    >
      {showName && (
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="First name"
          className="flex-1 min-w-0 px-4 py-2.5 rounded-xl bg-muted text-foreground
                     border border-border text-sm placeholder:text-muted-foreground
                     focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary
                     transition-all duration-200"
          disabled={status === 'loading'}
        />
      )}
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="your@email.com"
        className="flex-1 min-w-0 px-4 py-2.5 rounded-xl bg-muted text-foreground
                   border border-border text-sm placeholder:text-muted-foreground
                   focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary
                   transition-all duration-200"
        disabled={status === 'loading'}
        aria-label="Email address"
      />
      <button
        type="submit"
        disabled={status === 'loading'}
        className={`
          group inline-flex items-center justify-center gap-2 px-5 py-2.5
          bg-primary text-primary-foreground rounded-xl text-sm font-semibold
          hover:bg-primary/90 active:scale-[0.97] transition-all duration-150
          disabled:opacity-50 shrink-0 cursor-pointer disabled:cursor-not-allowed
          ${status === 'loading' ? 'ring-2 ring-primary/30 ring-offset-1 ring-offset-background' : ''}
        `}
      >
        {status === 'loading' ? (
          <Loader2 size={16} className="animate-spin" />
        ) : (
          <>
            {ctaText}
            <ArrowRight
              size={14}
              className="transition-transform duration-200 group-hover:translate-x-1"
            />
          </>
        )}
      </button>
    </motion.form>
  );

  /* ── GDPR consent note ─────────────────────────────── */
  const gdprNote = (
    <p className="text-[11px] text-muted-foreground mt-2 leading-relaxed">
      By subscribing you agree to receive emails. You can unsubscribe at any time.{' '}
      <Link href="/privacy-policy" className="text-primary hover:underline">
        Privacy Policy
      </Link>
    </p>
  );

  /* ── Inline variant ────────────────────────────────── */
  if (variant === 'inline') {
    return (
      <div className={className}>
        <AnimatePresence mode="wait">
          {status === 'success' ? (
            successContent
          ) : (
            <motion.div
              key="form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              {formFields}
              {status === 'error' && errorContent}
              {gdprNote}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  /* ── Banner variant ────────────────────────────────── */
  if (variant === 'banner') {
    return (
      <div className={`w-full bg-primary/5 border border-primary/10 rounded-2xl px-6 py-5 ${className}`}>
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row md:items-center gap-4">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="p-2.5 bg-primary/10 rounded-xl shrink-0">
              <Mail size={20} className="text-primary" />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-bold text-foreground truncate">{title}</h3>
              <p className="text-xs text-muted-foreground line-clamp-1">{description}</p>
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <AnimatePresence mode="wait">
              {status === 'success' ? (
                successContent
              ) : (
                <motion.div
                  key="form"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  {formFields}
                  {status === 'error' && errorContent}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
        {status !== 'success' && gdprNote}
      </div>
    );
  }

  /* ── Card variant (default) ────────────────────────── */
  return (
    <div className={`bg-background/80 backdrop-blur-sm border border-border rounded-2xl p-6 ${className}`}>
      <div className="flex items-start gap-3 mb-4">
        <div className="p-2.5 bg-primary/10 rounded-xl shrink-0">
          <Mail size={20} className="text-primary" />
        </div>
        <div>
          <h3 className="text-base font-bold text-foreground">{title}</h3>
          <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{description}</p>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {status === 'success' ? (
          successContent
        ) : (
          <motion.div
            key="form"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {formFields}
            {status === 'error' && errorContent}
            {gdprNote}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
