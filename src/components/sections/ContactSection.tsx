'use client';

import { useState } from 'react';
import TiltCard from '@/components/ui/TiltCard';

interface ContactSectionProps {
  contact_title?: string;
  contact_content?: string;
  contact_email?: string;
  contact_phone?: string;
  contact_office_city?: string;
  contact_office_country?: string;
  contact_cta_title?: string;
  contact_cta_description?: string;
  contact_cta_badge?: string;
  contact_privacy_policy_url?: string;
  contact_submit_button_text?: string;
}

export default function ContactSection({
  contact_title,
  contact_content,
  contact_email,
  contact_phone,
  contact_office_city,
  contact_office_country,
  contact_cta_title,
  contact_cta_description,
  contact_cta_badge,
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
      {/* Section Header - Centered */}
      <header className="mb-12 text-center">
        <div className="flex items-center justify-center gap-3 mb-4" suppressHydrationWarning>
          <span className="w-2 h-2 rounded-full bg-primary" />
          <span className="text-xs uppercase tracking-widest font-bold text-zinc-500">Contact</span>
        </div>
        <h2 className="text-4xl md:text-5xl font-unbounded font-black text-black dark:text-white mb-4">
          {contact_title || "Let's Work Together"}
        </h2>
        {contact_content && (
          <p className="text-lg text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto">
            {contact_content.replace(/<[^>]*>/g, '')}
          </p>
        )}
      </header>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16" suppressHydrationWarning>
        {/* Left Column - Contact Info */}
        <div className="space-y-6" suppressHydrationWarning>
          {/* Email Card */}
          {contact_email && (
            <TiltCard className="flex items-start gap-4 p-4 rounded-xl bg-zinc-100/50 dark:bg-zinc-800/50">
              <div className="w-12 h-12 flex items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800 text-[#1d4ed8]" suppressHydrationWarning>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div suppressHydrationWarning>
                <h3 className="font-unbounded font-bold text-black dark:text-white">Email</h3>
                <a href={`mailto:${contact_email}`} className="text-zinc-600 dark:text-zinc-400 hover:text-primary transition-colors">
                  {contact_email}
                </a>
              </div>
            </TiltCard>
          )}

          {/* Phone Card */}
          {contact_phone && (
            <TiltCard className="flex items-start gap-4 p-4 rounded-xl bg-zinc-100/50 dark:bg-zinc-800/50">
              <div className="w-12 h-12 flex items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800 text-[#1d4ed8]" suppressHydrationWarning>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </div>
              <div suppressHydrationWarning>
                <h3 className="font-unbounded font-bold text-black dark:text-white">Phone</h3>
                <a href={`tel:${contact_phone.replace(/\s/g, '')}`} className="text-zinc-600 dark:text-zinc-400 hover:text-primary transition-colors">
                  {contact_phone}
                </a>
              </div>
            </TiltCard>
          )}

          {/* Office Card */}
          {(contact_office_city || contact_office_country) && (
            <TiltCard className="flex items-start gap-4 p-4 rounded-xl bg-zinc-100/50 dark:bg-zinc-800/50">
              <div className="w-12 h-12 flex items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800 text-[#1d4ed8]" suppressHydrationWarning>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div suppressHydrationWarning>
                <h3 className="font-unbounded font-bold text-black dark:text-white">Office</h3>
                <p className="text-zinc-600 dark:text-zinc-400">
                  {contact_office_city && <span>{contact_office_city},<br /></span>}
                  {contact_office_country}
                </p>
              </div>
            </TiltCard>
          )}

          {/* CTA Card */}
          {(contact_cta_title || contact_cta_description) && (
            <TiltCard className="mt-8 p-6 border-2 border-[#1e4ed8] rounded-xl bg-white dark:bg-zinc-900">
              {contact_cta_title && (
                <h3 className="font-unbounded font-bold text-xl text-black dark:text-white mb-2">
                  {contact_cta_title}
                </h3>
              )}
              {contact_cta_description && (
                <p className="text-zinc-600 dark:text-zinc-400 mb-4">
                  {contact_cta_description}
                </p>
              )}
              {contact_cta_badge && (
                <div className="flex items-center gap-2 text-[#1e4ed8] font-medium" suppressHydrationWarning>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {contact_cta_badge}
                </div>
              )}
            </TiltCard>
          )}
        </div>

        {/* Right Column - Contact Form */}
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
                <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <p className="text-red-800 dark:text-red-200 text-sm">
                    Something went wrong. Please try again.
                  </p>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
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
