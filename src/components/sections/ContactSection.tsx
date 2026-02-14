'use client';

import { useState } from 'react';

interface ContactSectionProps {
  contact_title?: string;
  contact_content?: string;
  contact_privacy_policy_url?: string;
  contact_submit_button_text?: string;
}

export default function ContactSection({
  contact_title,
  contact_content,
  contact_privacy_policy_url,
  contact_submit_button_text
}: ContactSectionProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
    privacy: false
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate form submission - replace with actual API call
    try {
      // Example: await fetch('/api/contact', { method: 'POST', body: JSON.stringify(formData) });
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSubmitStatus('success');
      setFormData({ name: '', email: '', subject: '', message: '', privacy: false });
    } catch {
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  return (
    <section id="contact" className="mb-24 max-w-6xl mx-auto px-4" suppressHydrationWarning>
      {/* Section Header - Left aligned */}
      <header className="mb-12 text-left">
        <div className="flex items-center gap-3 mb-4" suppressHydrationWarning>
          <span className="w-2 h-2 rounded-full bg-primary" />
          <span className="text-xs uppercase tracking-widest font-bold text-zinc-500">Contact</span>
        </div>
        <h2 className="text-4xl md:text-5xl font-unbounded font-black text-black dark:text-white mb-4">
          {contact_title || "Let's Work Together"}
        </h2>
        {contact_content && (
          <p className="text-lg text-zinc-600 dark:text-zinc-400 max-w-2xl">
            {contact_content.replace(/<[^>]*>/g, '')}
          </p>
        )}
      </header>

      {/* Single Column - Contact Form */}
      <div className="max-w-2xl" suppressHydrationWarning>
        <div className="bg-zinc-50 dark:bg-zinc-900 p-6 md:p-8 rounded-2xl" suppressHydrationWarning>
          {submitStatus === 'success' ? (
            <div className="flex flex-col items-center justify-center h-full py-12 text-center">
              <div className="w-16 h-16 flex items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 mb-4">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="font-unbounded font-bold text-xl text-black dark:text-white mb-2">Message Sent!</h3>
              <p className="text-zinc-600 dark:text-zinc-400 mb-6">Thank you for reaching out. I&apos;ll get back to you soon.</p>
              <button
                onClick={() => setSubmitStatus('idle')}
                className="text-primary hover:underline font-medium"
              >
                Send another message
              </button>
            </div>
          ) : (
            <form className="space-y-5" onSubmit={handleSubmit}>
              {/* Name & Email Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5" suppressHydrationWarning>
                <div suppressHydrationWarning>
                  <label htmlFor="contact-name" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                    Name
                  </label>
                  <input
                    type="text"
                    id="contact-name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  />
                </div>
                <div suppressHydrationWarning>
                  <label htmlFor="contact-email" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    id="contact-email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  />
                </div>
              </div>

              {/* Subject */}
              <div suppressHydrationWarning>
                <label htmlFor="contact-subject" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                  Subject
                </label>
                <input
                  type="text"
                  id="contact-subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                />
              </div>

              {/* Message */}
              <div suppressHydrationWarning>
                <label htmlFor="contact-message" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                  Message
                </label>
                <textarea
                  id="contact-message"
                  name="message"
                  rows={5}
                  value={formData.message}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all resize-none"
                />
              </div>

              {/* Privacy Policy Checkbox */}
              <div className="flex items-start gap-3" suppressHydrationWarning>
                <input
                  type="checkbox"
                  id="contact-privacy"
                  name="privacy"
                  checked={formData.privacy}
                  onChange={handleChange}
                  required
                  className="mt-1 w-4 h-4 rounded border-zinc-300 dark:border-zinc-600 text-primary focus:ring-primary"
                />
                <label htmlFor="contact-privacy" className="text-sm text-zinc-600 dark:text-zinc-400">
                  By submitting this form, I agree to the{' '}
                  <a
                    href={contact_privacy_policy_url || '/privacy-policy'}
                    className="text-[#1e4ed8] hover:underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Privacy Policy
                  </a>
                  . I understand that my information will be treated responsibly.
                </label>
              </div>

              {/* Error Message */}
              {submitStatus === 'error' && (
                <div id="contact-form-error" className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg" role="alert">
                  <p className="text-red-800 dark:text-red-200 text-sm">
                    Something went wrong. Please try again.
                  </p>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                aria-busy={isSubmitting}
                aria-describedby={submitStatus === 'error' ? 'contact-form-error' : undefined}
                className="w-full py-4 bg-primary text-primary-foreground font-unbounded font-bold text-sm tracking-wide uppercase rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Sending...
                  </>
                ) : (
                  contact_submit_button_text || 'Send Message'
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
