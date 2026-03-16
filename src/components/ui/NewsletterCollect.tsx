'use client';

import { useState, FormEvent, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Check, AlertCircle, Loader2, ArrowRight } from 'lucide-react';
import { Link } from '@/i18n/navigation';

export interface NewsletterCollectProps {
  /** Which MailerLite group to subscribe to */
  group?: 'blog' | 'course';
  /** UTM source tag for segmentation */
  source?: string;
  /** Visual variant */
  variant?: 'inline' | 'card' | 'banner';
  /** Heading text */
  title?: string;
  /** Description text */
  description?: string;
  /** CTA button text */
  ctaText?: string;
  /** Show name field alongside email */
  showName?: boolean;
  /** Custom class for the wrapper */
  className?: string;
}

type Status = 'idle' | 'loading' | 'success' | 'error';

const MAILERLITE_API = 'https://connect.mailerlite.com/api/subscribers';

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
          fields: {
            name: name.trim() || undefined,
            source,
          },
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
        setErrorMsg(
          data?.message || 'Something went wrong. Please try again.'
        );
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

  /* ── Success state ─────────────────────────────────── */
  const successContent = (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-3 py-3"
    >
      <div className="p-2 bg-green-500/10 rounded-full">
        <Check size={20} className="text-green-500" />
      </div>
      <div>
        <p className="text-sm font-semibold text-foreground">
          You&apos;re in!
        </p>
        <p className="text-xs text-muted-foreground">
          Check your inbox to confirm your subscription.
        </p>
      </div>
    </motion.div>
  );

  /* ── Error state ───────────────────────────────────── */
  const errorContent = (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-3 py-2"
    >
      <div className="p-2 bg-red-500/10 rounded-full">
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
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      className={`flex gap-2 ${
        variant === 'banner' ? 'flex-row' : 'flex-col sm:flex-row'
      }`}
    >
      {showName && (
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="First name"
          className="flex-1 min-w-0 px-4 py-2.5 rounded-xl bg-muted text-foreground
                     border border-border text-sm placeholder:text-muted-foreground
                     focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary
                     transition-all"
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
                   focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary
                   transition-all"
        disabled={status === 'loading'}
        aria-label="Email address"
      />
      <button
        type="submit"
        disabled={status === 'loading'}
        className="inline-flex items-center justify-center gap-2 px-5 py-2.5
                   bg-primary text-primary-foreground rounded-xl text-sm font-semibold
                   hover:bg-primary/90 transition-colors disabled:opacity-50
                   shrink-0 cursor-pointer disabled:cursor-not-allowed"
      >
        {status === 'loading' ? (
          <Loader2 size={16} className="animate-spin" />
        ) : (
          <>
            {ctaText}
            <ArrowRight size={14} />
          </>
        )}
      </button>
    </form>
  );

  /* ── GDPR consent note ─────────────────────────────── */
  const gdprNote = (
    <p className="text-[11px] text-muted-foreground mt-2 leading-relaxed">
      By subscribing you agree to receive emails. You can unsubscribe at any
      time.{' '}
      <Link
        href="/privacy-policy"
        className="text-primary hover:underline"
      >
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
            <div key="success">{successContent}</div>
          ) : (
            <div key="form">
              {formFields}
              {status === 'error' && errorContent}
              {gdprNote}
            </div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  /* ── Banner variant ────────────────────────────────── */
  if (variant === 'banner') {
    return (
      <div
        className={`w-full bg-primary/5 border border-primary/10 rounded-2xl px-6 py-5 ${className}`}
      >
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row md:items-center gap-4">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="p-2.5 bg-primary/10 rounded-xl shrink-0">
              <Mail size={20} className="text-primary" />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-bold text-foreground truncate">
                {title}
              </h3>
              <p className="text-xs text-muted-foreground line-clamp-1">
                {description}
              </p>
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <AnimatePresence mode="wait">
              {status === 'success' ? (
                <div key="success">{successContent}</div>
              ) : (
                <div key="form">
                  {formFields}
                  {status === 'error' && errorContent}
                </div>
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
    <div
      className={`bg-background/80 backdrop-blur-sm border border-border rounded-2xl p-6 ${className}`}
    >
      <div className="flex items-start gap-3 mb-4">
        <div className="p-2.5 bg-primary/10 rounded-xl shrink-0">
          <Mail size={20} className="text-primary" />
        </div>
        <div>
          <h3 className="text-base font-bold text-foreground">{title}</h3>
          <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
            {description}
          </p>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {status === 'success' ? (
          <div key="success">{successContent}</div>
        ) : (
          <div key="form">
            {formFields}
            {status === 'error' && errorContent}
            {gdprNote}
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
