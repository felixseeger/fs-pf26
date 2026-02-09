'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { MapPin, Mail, Phone, ArrowRight, Star, LucideIcon } from 'lucide-react';

interface ContactData {
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

// Contact Card Component
function ContactCard({
    icon: Icon,
    title,
    children,
    action,
    href,
}: {
    icon: LucideIcon;
    title: string;
    children: React.ReactNode;
    action: string;
    href: string;
}) {
    return (
        <div className="flex flex-col items-center text-center p-6 md:p-8">
            <div className="w-14 h-14 flex items-center justify-center rounded-full bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 mb-4">
                <Icon size={24} />
            </div>
            <h3 className="font-unbounded font-bold text-lg text-zinc-900 dark:text-white mb-2">
                {title}
            </h3>
            <div className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">{children}</div>
            <Link
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-xs font-bold tracking-wider uppercase text-zinc-900 dark:text-white hover:text-primary dark:hover:text-primary transition-colors"
            >
                {action}
                <ArrowRight size={14} />
            </Link>
        </div>
    );
}

export default function ContactPageClient({ contactData }: ContactPageClientProps) {
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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            // Simulate form submission - replace with actual API call
            await new Promise((resolve) => setTimeout(resolve, 1000));
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
        } catch {
            setSubmitStatus('error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
        const { name, value, type } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
        }));
    };

    // Parse heading for line breaks
    const headingLines = contactData.form.heading.split('\n');

    return (
        <div className="min-h-screen bg-white dark:bg-black" suppressHydrationWarning>
            {/* Contact Info Cards Section */}
            <section className="pt-28 pb-12 px-6 lg:px-10">
                <div className="max-w-6xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-0 md:divide-x divide-zinc-200 dark:divide-zinc-800">
                        {/* Headquarters */}
                        <ContactCard
                            icon={MapPin}
                            title={contactData.headquarters.title}
                            action="GET DIRECTION"
                            href={contactData.headquarters.mapUrl}
                        >
                            <p>{contactData.headquarters.address}</p>
                        </ContactCard>

                        {/* Email */}
                        <ContactCard
                            icon={Mail}
                            title={contactData.email.title}
                            action="SEND MESSAGE"
                            href={`mailto:${contactData.email.addresses[0]}`}
                        >
                            {contactData.email.addresses.map((email, i) => (
                                <p key={i}>{email}</p>
                            ))}
                        </ContactCard>

                        {/* Phone */}
                        <ContactCard
                            icon={Phone}
                            title={contactData.phone.title}
                            action="CALL ANYTIME"
                            href={`tel:${contactData.phone.numbers[0].replace(/\s/g, '')}`}
                        >
                            {contactData.phone.numbers.map((phone, i) => (
                                <p key={i}>{phone}</p>
                            ))}
                        </ContactCard>
                    </div>
                </div>
            </section>

            {/* Form Section with Image */}
            <section className="pb-16">
                <div className="max-w-6xl mx-auto px-6 lg:px-10">
                    <div className="grid grid-cols-1 lg:grid-cols-2 overflow-hidden rounded-2xl">
                        {/* Left - Image */}
                        <div className="relative h-64 lg:h-auto min-h-[400px]">
                            <Image
                                src={contactData.form.image}
                                alt="Contact"
                                fill
                                className="object-cover"
                                sizes="(max-width: 1024px) 100vw, 50vw"
                            />
                            {/* Optional overlay icon */}
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="w-12 h-12 rounded-full bg-orange-500 flex items-center justify-center">
                                    <svg
                                        className="w-6 h-6 text-white"
                                        fill="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        {/* Right - Form */}
                        <div className="bg-[#d4e542] p-8 lg:p-12">
                            <h2 className="font-unbounded font-black text-3xl lg:text-4xl text-zinc-900 mb-3">
                                {headingLines.map((line, i) => (
                                    <span key={i}>
                                        {line}
                                        {i < headingLines.length - 1 && <br />}
                                    </span>
                                ))}
                            </h2>
                            <p className="text-zinc-700 mb-8">{contactData.form.subheading}</p>

                            {submitStatus === 'success' ? (
                                <div className="text-center py-12">
                                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-zinc-900 text-white flex items-center justify-center">
                                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                    </div>
                                    <h3 className="font-unbounded font-bold text-xl text-zinc-900 mb-2">Message Sent!</h3>
                                    <p className="text-zinc-700 mb-6">Thank you for reaching out. I&apos;ll get back to you soon.</p>
                                    <button
                                        onClick={() => setSubmitStatus('idle')}
                                        className="text-zinc-900 underline font-medium"
                                    >
                                        Send another message
                                    </button>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    {/* Name & Email Row */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <input
                                                type="text"
                                                name="fullName"
                                                placeholder="Full Name *"
                                                value={formData.fullName}
                                                onChange={handleChange}
                                                required
                                                className="w-full px-0 py-3 bg-transparent border-b-2 border-zinc-900/30 text-zinc-900 placeholder-zinc-600 focus:outline-none focus:border-zinc-900 transition-colors"
                                            />
                                        </div>
                                        <div>
                                            <input
                                                type="email"
                                                name="email"
                                                placeholder="Email Address *"
                                                value={formData.email}
                                                onChange={handleChange}
                                                required
                                                className="w-full px-0 py-3 bg-transparent border-b-2 border-zinc-900/30 text-zinc-900 placeholder-zinc-600 focus:outline-none focus:border-zinc-900 transition-colors"
                                            />
                                        </div>
                                    </div>

                                    {/* Subject & Service Row */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <input
                                                type="text"
                                                name="subject"
                                                placeholder="Subject *"
                                                value={formData.subject}
                                                onChange={handleChange}
                                                required
                                                className="w-full px-0 py-3 bg-transparent border-b-2 border-zinc-900/30 text-zinc-900 placeholder-zinc-600 focus:outline-none focus:border-zinc-900 transition-colors"
                                            />
                                        </div>
                                        <div>
                                            <select
                                                name="service"
                                                value={formData.service}
                                                onChange={handleChange}
                                                required
                                                className="w-full px-0 py-3 bg-transparent border-b-2 border-zinc-900/30 text-zinc-900 focus:outline-none focus:border-zinc-900 transition-colors appearance-none cursor-pointer"
                                            >
                                                <option value="" disabled>
                                                    Subject with Service *
                                                </option>
                                                {contactData.serviceOptions.map((option) => (
                                                    <option key={option.value} value={option.value}>
                                                        {option.label}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    {/* Message */}
                                    <div>
                                        <textarea
                                            name="message"
                                            placeholder="How can we help you? *"
                                            rows={3}
                                            value={formData.message}
                                            onChange={handleChange}
                                            required
                                            className="w-full px-0 py-3 bg-transparent border-b-2 border-zinc-900/30 text-zinc-900 placeholder-zinc-600 focus:outline-none focus:border-zinc-900 transition-colors resize-none"
                                        />
                                    </div>

                                    {/* How did you hear about us */}
                                    <div className="pt-4">
                                        <p className="text-sm font-medium text-zinc-900 mb-3">
                                            How did you hear about us? *
                                        </p>
                                        <div className="space-y-2">
                                            {contactData.heardFromOptions.map((option, index) => (
                                                <label key={index} className="flex items-center gap-3 cursor-pointer">
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

                                    {/* Privacy Checkbox */}
                                    <div className="flex items-start gap-3 pt-2">
                                        <input
                                            type="checkbox"
                                            id="privacy"
                                            name="privacy"
                                            checked={formData.privacy}
                                            onChange={handleChange}
                                            required
                                            className="mt-1 w-4 h-4 accent-zinc-900"
                                        />
                                        <label htmlFor="privacy" className="text-xs text-zinc-700">
                                            By submitting this form, I agree to the{' '}
                                            <Link href={contactData.privacyPolicyUrl} className="underline">
                                                Privacy Policy
                                            </Link>
                                            . I understand that my information will be treated responsibly.
                                        </label>
                                    </div>

                                    {/* Error Message */}
                                    {submitStatus === 'error' && (
                                        <div className="p-3 bg-red-100 border border-red-300 rounded text-red-800 text-sm">
                                            Something went wrong. Please try again.
                                        </div>
                                    )}

                                    {/* Submit Button */}
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="mt-4 px-8 py-4 bg-zinc-900 text-white font-unbounded font-bold text-sm tracking-wider uppercase rounded hover:bg-zinc-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2"
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                                                    <circle
                                                        className="opacity-25"
                                                        cx="12"
                                                        cy="12"
                                                        r="10"
                                                        stroke="currentColor"
                                                        strokeWidth="4"
                                                    />
                                                    <path
                                                        className="opacity-75"
                                                        fill="currentColor"
                                                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                                    />
                                                </svg>
                                                Sending...
                                            </>
                                        ) : (
                                            contactData.submitButtonText
                                        )}
                                    </button>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            {/* Yellow Banner Section */}
            {contactData.showFeatureBanner && contactData.features.length > 0 && (
                <section className="bg-[#d4e542] py-6 overflow-hidden">
                    <div className="flex items-center justify-center gap-8 md:gap-16 flex-wrap">
                        {contactData.features.map((feature, index) => (
                            <div key={index} className="flex items-center gap-3 px-4">
                                <Star size={20} className="text-zinc-900 fill-zinc-900" />
                                <span className="font-unbounded font-bold text-sm md:text-base text-zinc-900 whitespace-nowrap">
                                    {feature}
                                </span>
                            </div>
                        ))}
                    </div>
                </section>
            )}
        </div>
    );
}
