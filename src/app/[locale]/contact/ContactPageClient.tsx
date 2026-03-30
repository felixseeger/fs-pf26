'use client';

import { useState, useRef, useMemo } from 'react';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { useTranslations } from 'next-intl';
import PropertyMap from '@/components/contact/PropertyMap';
import type { Property } from '@/types/property';

gsap.registerPlugin(ScrollTrigger);

interface ContactData {
    contactTitle?: string;
    pageTitle?: string;
    headquarters: {
        title: string;
        address: string;
        mapUrl: string;
    };
    email: {
        title: string;
        addresses: string[];
    };
    phone: {
        title: string;
        numbers: string[];
    };
    form: {
        heading: string;
        subheading: string;
        image: string;
    };
    serviceOptions: { value: string; label: string }[];
    heardFromOptions: string[];
    privacyPolicyUrl: string;
    submitButtonText: string;
    features: string[];
    showFeatureBanner: boolean;
    cta?: {
        title: string;
        description: string;
        badge: string;
    };
}

interface ContactPageClientProps {
    contactData: ContactData;
}

export default function ContactPageClient({ contactData }: ContactPageClientProps) {
    const t = useTranslations('contact');

    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        subject: '',
        service: '',
        message: '',
        heardFrom: '',
        privacy: false,
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [errorMessage, setErrorMessage] = useState('');

    const heroRef = useRef<HTMLDivElement>(null);
    const formSectionRef = useRef<HTMLElement>(null);
    const imageRef = useRef<HTMLDivElement>(null);
    const formPanelRef = useRef<HTMLDivElement>(null);
    const contactStripRef = useRef<HTMLElement>(null);

    useGSAP(() => {
        // Page title clip-path wipe
        if (heroRef.current) {
            const heading = heroRef.current.querySelector('h1');
            if (heading) {
                gsap.set(heading, { clipPath: 'inset(0 100% 0 0)' });
                gsap.to(heading, {
                    clipPath: 'inset(0 0% 0 0)',
                    duration: 1,
                    ease: 'power2.out',
                    scrollTrigger: {
                        trigger: heroRef.current,
                        start: 'top 85%',
                        end: 'top 50%',
                        scrub: 1.2,
                    },
                });
            }
        }

        // Image + form panel staggered entrance
        const imageEl = imageRef.current;
        const formEl = formPanelRef.current;
        if (imageEl && formEl) {
            gsap.set([imageEl, formEl], { opacity: 0, y: 48 });
            gsap.to([imageEl, formEl], {
                opacity: 1,
                y: 0,
                duration: 0.7,
                ease: 'power2.out',
                stagger: 0.12,
                scrollTrigger: {
                    trigger: formSectionRef.current,
                    start: 'top 80%',
                    once: true,
                },
            });
        }

        // Contact strip items reveal
        if (contactStripRef.current) {
            const items = contactStripRef.current.querySelectorAll('[data-contact-item]');
            gsap.set(items, { opacity: 0, y: 32 });
            gsap.to(items, {
                opacity: 1,
                y: 0,
                duration: 0.65,
                ease: 'power2.out',
                stagger: 0.1,
                scrollTrigger: {
                    trigger: contactStripRef.current,
                    start: 'top 80%',
                    once: true,
                },
            });
        }
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (isSubmitting) return;
        setIsSubmitting(true);
        setSubmitStatus('idle');
        setErrorMessage('');

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000);

        try {
            const res = await fetch('/api/contact', {
                signal: controller.signal,
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    fullName: formData.fullName,
                    email: formData.email,
                    subject: formData.subject,
                    service: formData.service,
                    message: formData.message,
                    heardFrom: formData.heardFrom,
                }),
            });

            const data = await res.json().catch(() => ({})) as {
                status?: string;
                message?: string;
                invalid_fields?: { field: string }[];
            };

            if (res.ok && data.status === 'mail_sent') {
                setSubmitStatus('success');
                setFormData({
                    fullName: '',
                    email: '',
                    subject: '',
                    service: '',
                    message: '',
                    heardFrom: '',
                    privacy: false,
                });
            } else {
                setSubmitStatus('error');
                let msg = data.message || `Request failed (${res.status})`;
                if (data.invalid_fields && Array.isArray(data.invalid_fields)) {
                    const fields = data.invalid_fields.map((f) => f.field).filter(Boolean);
                    if (fields.length) msg += ` — invalid: ${fields.join(', ')}`;
                }
                setErrorMessage(msg);
            }
        } catch (err) {
            setSubmitStatus('error');
            if (err instanceof Error && err.name === 'AbortError') {
                setErrorMessage('Request timed out. Please check your connection and try again.');
            } else {
                setErrorMessage(err instanceof Error ? err.message : 'Network error. Please try again.');
            }
        } finally {
            clearTimeout(timeoutId);
            setIsSubmitting(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
        }));
    };

    const headingLines = contactData.form.heading ? contactData.form.heading.split('\n') : [];
    const inputClass = 'w-full px-0 py-3 bg-transparent border-b-2 border-zinc-900/30 text-zinc-900 placeholder-zinc-600 focus:outline-none focus:border-zinc-900 transition-colors';
    return (
        <>
            {/* ── Page Title ──────────────────────────────────── */}
            {(contactData.contactTitle || contactData.pageTitle) ? (
                <header ref={heroRef} className="pb-8">
                    <div className="flex items-center gap-4 mb-6">
                        <span className="w-12 h-px bg-zinc-300 dark:bg-zinc-800" />
                        <span className="text-xs uppercase tracking-widest font-bold text-zinc-500">{t('badge')}</span>
                    </div>
                    <h1
                        className="text-5xl md:text-6xl lg:text-7xl font-unbounded font-black text-zinc-900 dark:text-white will-change-[clip-path] wrap-break-word"
                        style={{ clipPath: 'inset(0 100% 0 0)' }}
                    >
                        {contactData.contactTitle || contactData.pageTitle}
                    </h1>
                </header>
            ) : null}

            {/* ── Two-panel: Image | Form ──────────────────────── */}
            <section ref={formSectionRef} className="pb-16">
                <div className="max-w-6xl mx-auto px-6 lg:px-10">
                    <div className="grid grid-cols-1 lg:grid-cols-2 overflow-hidden rounded-2xl">
                        {/* Left — Map */}
                        <div ref={imageRef} className="relative h-64 lg:h-auto min-h-[400px]">
                            {(() => {
                                const myLocation: Property = {
                                    id: 'my-location',
                                    title: contactData.headquarters.title,
                                    address: contactData.headquarters.address,
                                    lat: 51.2352,
                                    lng: 6.7385,
                                    status: 'For Sale',
                                    price: 0,
                                    type: 'Commercial',
                                    sqft: 0,
                                    mainImage: contactData.form.image,
                                    images: [],
                                    features: []
                                };
                                return (
                                    <PropertyMap 
                                        properties={[myLocation]} 
                                        isDarkMode={true}
                                        t={t}
                                    />
                                );
                            })()}
                            
                            {/* Brand lime availability badge */}
                            <div className="absolute bottom-6 left-6 z-10">
                                <span className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground text-xs font-mono uppercase tracking-wider font-bold rounded-sm">
                                    <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
                                    {t('availableForProjects')}
                                </span>
                            </div>
                        </div>

                        {/* Right — Form */}
                        <div ref={formPanelRef} className="bg-[#d4e542] p-8 lg:p-12">
                            {headingLines.length > 0 && (
                                <h2 className="font-unbounded font-black text-4xl lg:text-5xl xl:text-6xl text-zinc-900 mb-3 leading-[0.95] wrap-break-word">
                                    {headingLines.map((line, i) => (
                                        <span key={i}>
                                            {line}
                                            {i < headingLines.length - 1 && <br />}
                                        </span>
                                    ))}
                                </h2>
                            )}
                            <p className="text-zinc-700 mb-8 text-sm leading-relaxed">
                                {contactData.form.subheading}
                            </p>

                            <AnimatePresence mode="wait">
                                {submitStatus === 'success' ? (
                                    <motion.div
                                        key="success"
                                        initial={{ opacity: 0, y: 16 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -16 }}
                                        transition={{ duration: 0.4, ease: [0.25, 1, 0.5, 1] }}
                                        className="flex flex-col items-center justify-center py-12 text-center"
                                    >
                                        {/* Spring checkmark */}
                                        <div className="relative mb-5">
                                            <motion.div
                                                className="w-16 h-16 flex items-center justify-center rounded-full bg-zinc-900 text-white"
                                                initial={{ scale: 0, opacity: 0 }}
                                                animate={{ scale: 1, opacity: 1 }}
                                                transition={{ type: 'spring', stiffness: 380, damping: 18, delay: 0.05 }}
                                            >
                                                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" overflow="visible">
                                                    <motion.path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M5 13l4 4L19 7"
                                                        initial={{ pathLength: 0 }}
                                                        animate={{ pathLength: 1 }}
                                                        transition={{ duration: 0.6, ease: [0.25, 1, 0.5, 1], delay: 0.28 }}
                                                    />
                                                </svg>
                                            </motion.div>
                                            {/* Outer ring pulse */}
                                            <motion.div
                                                className="absolute inset-0 rounded-full border-2 border-zinc-900/40"
                                                initial={{ scale: 1, opacity: 0.6 }}
                                                animate={{ scale: 1.7, opacity: 0 }}
                                                transition={{ duration: 0.6, ease: [0.25, 1, 0.5, 1], delay: 0.3 }}
                                            />
                                        </div>

                                        <motion.h3
                                            className="font-unbounded font-bold text-xl text-zinc-900 mb-2"
                                            initial={{ opacity: 0, y: 8 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ duration: 0.35, ease: [0.25, 1, 0.5, 1], delay: 0.45 }}
                                        >
                                            {t('messageReceivedTitle')}
                                        </motion.h3>
                                        <motion.p
                                            className="text-zinc-700 mb-6 text-sm"
                                            initial={{ opacity: 0, y: 8 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ duration: 0.35, ease: [0.25, 1, 0.5, 1], delay: 0.58 }}
                                        >
                                            {t('messageReceivedBody')}
                                        </motion.p>
                                        <motion.button
                                            onClick={() => setSubmitStatus('idle')}
                                            className="text-zinc-900 underline font-medium text-sm"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ duration: 0.3, delay: 0.75 }}
                                        >
                                            {t('sendAnotherMessage')}
                                        </motion.button>
                                    </motion.div>
                                ) : (
                                    <motion.form
                                        key="form"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        transition={{ duration: 0.25 }}
                                        onSubmit={handleSubmit}
                                        className="space-y-4"
                                    >
                                        {/* Name & Email */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <input
                                                type="text"
                                                name="fullName"
                                                placeholder={t('fullNamePlaceholder')}
                                                value={formData.fullName}
                                                onChange={handleChange}
                                                required
                                                maxLength={100}
                                                aria-required="true"
                                                autoComplete="name"
                                                className={inputClass}
                                            />
                                            <input
                                                type="email"
                                                name="email"
                                                placeholder={t('emailAddressPlaceholder')}
                                                value={formData.email}
                                                onChange={handleChange}
                                                required
                                                maxLength={254}
                                                aria-required="true"
                                                autoComplete="email"
                                                className={inputClass}
                                            />
                                        </div>

                                        {/* Subject & Service */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <input
                                                type="text"
                                                name="subject"
                                                placeholder={t('subjectPlaceholder')}
                                                value={formData.subject}
                                                onChange={handleChange}
                                                required
                                                maxLength={200}
                                                aria-required="true"
                                                className={inputClass}
                                            />
                                            <select
                                                name="service"
                                                value={formData.service}
                                                onChange={handleChange}
                                                required
                                                aria-required="true"
                                                className={`${inputClass} appearance-none cursor-pointer`}
                                            >
                                                <option value="" disabled>
                                                    {t('serviceTypePlaceholder')}
                                                </option>
                                                {contactData.serviceOptions.map((option) => (
                                                    <option key={option.value} value={option.value}>
                                                        {option.label}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        {/* Message */}
                                        <textarea
                                            name="message"
                                            placeholder={t('projectPlaceholder')}
                                            rows={3}
                                            value={formData.message}
                                            onChange={handleChange}
                                            required
                                            maxLength={5000}
                                            aria-required="true"
                                            className={`${inputClass} resize-none`}
                                        />

                                        {/* How did you find me — optional */}
                                        {contactData.heardFromOptions.length > 0 && (
                                            <div className="pt-2">
                                                <p className="text-sm font-medium text-zinc-900 mb-3">
                                                    {t('heardFromLabel')}
                                                </p>
                                                <div className="flex flex-wrap gap-x-6 gap-y-2">
                                                    {contactData.heardFromOptions.map((option, index) => (
                                                        <label key={`${option}-${index}`} className="flex items-center gap-2 cursor-pointer">
                                                            <input
                                                                type="radio"
                                                                name="heardFrom"
                                                                value={option.toLowerCase().replace(/\s/g, '-')}
                                                                checked={formData.heardFrom === option.toLowerCase().replace(/\s/g, '-')}
                                                                onChange={handleChange}
                                                                className="w-4 h-4 accent-zinc-900"
                                                            />
                                                            <span className="text-sm text-zinc-700">{option}</span>
                                                        </label>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Privacy */}
                                        <div className="flex items-start gap-3 pt-2">
                                            <input
                                                type="checkbox"
                                                id="privacy"
                                                name="privacy"
                                                checked={formData.privacy}
                                                onChange={handleChange}
                                                required
                                                className="mt-1 w-4 h-4 accent-zinc-900 shrink-0"
                                            />
                                            <label htmlFor="privacy" className="text-xs text-zinc-700 leading-relaxed">
                                                {t('privacyConsentPrefix')}
                                                <a href={contactData.privacyPolicyUrl} className="underline">
                                                    {t('privacyPolicyLabel')}
                                                </a>
                                                {t('privacyConsentSuffix')}
                                            </label>
                                        </div>

                                        {/* Error */}
                                        {submitStatus === 'error' && (
                                            <div role="alert" className="p-3 bg-red-100 border border-red-300 rounded text-red-800 text-sm">
                                                {errorMessage || t('genericError')}
                                            </div>
                                        )}

                                        {/* Submit */}
                                        <button
                                            type="submit"
                                            disabled={isSubmitting}
                                            className="mt-4 group inline-flex items-center gap-2 px-8 py-4 bg-zinc-900 text-white font-unbounded font-bold text-sm tracking-wider uppercase rounded hover:bg-zinc-800 active:scale-[0.97] transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {isSubmitting ? (
                                                <>
                                                    <svg className="animate-spin h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24">
                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                                    </svg>
                                                    {t('sending')}
                                                </>
                                            ) : (
                                                <>
                                                    {contactData.submitButtonText}
                                                    <ArrowRight size={14} className="transition-transform duration-200 group-hover:translate-x-1" />
                                                </>
                                            )}
                                        </button>
                                    </motion.form>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── Editorial Contact Strip ─────────────────────── */}
            <section ref={contactStripRef} className="bg-[#011627] mt-16 py-16 px-6 lg:px-10">
                <div className="max-w-6xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-white/10">

                        {/* Location */}
                        <div data-contact-item className="py-10 md:pr-12">
                            <p className="text-xs uppercase tracking-[0.2em] text-white/40 mb-5 font-mono">
                                {contactData.headquarters.title}
                            </p>
                            <p className="font-unbounded font-black text-xl lg:text-2xl text-white leading-snug mb-6 wrap-break-word">
                                {contactData.headquarters.address}
                            </p>
                            <a
                                href={contactData.headquarters.mapUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group inline-flex items-center gap-2 text-[#a3e635] text-xs uppercase tracking-widest font-bold hover:gap-3 transition-all duration-200"
                            >
                                {t('getDirections')}
                                <ArrowRight size={12} className="transition-transform duration-200 group-hover:translate-x-0.5" />
                            </a>
                        </div>

                        {/* Email */}
                        <div data-contact-item className="py-10 md:pl-12">
                            <p className="text-xs uppercase tracking-[0.2em] text-white/40 mb-5 font-mono">
                                {contactData.email.title}
                            </p>
                            <div className="font-unbounded font-black text-xl lg:text-2xl text-white leading-snug mb-6 break-all">
                                {contactData.email.addresses.map((address, i) => (
                                    <p key={address || i}>{address}</p>
                                ))}
                            </div>
                            <a
                                href={
                                    contactData.email.addresses[0] &&
                                    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactData.email.addresses[0])
                                        ? `mailto:${contactData.email.addresses[0]}`
                                        : '#'
                                }
                                className="group inline-flex items-center gap-2 text-[#a3e635] text-xs uppercase tracking-widest font-bold hover:gap-3 transition-all duration-200"
                            >
                                {t('sendMessageCta')}
                                <ArrowRight size={12} className="transition-transform duration-200 group-hover:translate-x-0.5" />
                            </a>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
}
