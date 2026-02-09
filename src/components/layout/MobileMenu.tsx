'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import ThemeLogo from './ThemeLogo';
import ThemeToggle from '@/components/ui/ThemeToggle';
import { WPMenuItem } from '@/lib/wordpress';

interface MobileMenuProps {
    menuItems: WPMenuItem[];
}

export default function MobileMenu({ menuItems }: MobileMenuProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [mounted, setMounted] = useState(false);
    const pathname = usePathname();

    useEffect(() => {
        setMounted(true);
    }, []);

    // Close menu when route changes
    useEffect(() => {
        setIsOpen(false);
    }, [pathname]);

    // Prevent body scroll when menu is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    // Close menu on escape key
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
            return () => document.removeEventListener('keydown', handleEscape);
        }
    }, [isOpen]);

    const fallbackItems = [
        { ID: 1, title: 'Home', url: '/', target: '', classes: [], menu_order: 0, parent: 0, object: '', object_id: 0, type: '', type_label: '' },
        { ID: 2, title: 'About', url: '/about', target: '', classes: [], menu_order: 1, parent: 0, object: '', object_id: 0, type: '', type_label: '' },
        { ID: 3, title: 'Contact', url: '/contact', target: '', classes: [], menu_order: 2, parent: 0, object: '', object_id: 0, type: '', type_label: '' },
    ];

    const items = menuItems.length > 0 ? menuItems : fallbackItems;

    const menuContent = (
        <>
            {/* Mobile Menu Overlay with Animated Background */}
            <div
                className={`fixed inset-0 z-[100] md:hidden transition-all duration-500 ease-out ${isOpen
                    ? 'opacity-100 backdrop-blur-md'
                    : 'opacity-0 pointer-events-none backdrop-blur-none'
                    }`}
                onClick={() => setIsOpen(false)}
                aria-hidden="true"
            >
                {/* Animated gradient background */}
                <div
                    className={`absolute inset-0 bg-gradient-to-br from-black/70 via-black/60 to-zinc-900/70 transition-all duration-700 ease-out ${isOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
                        }`}
                />

                {/* Animated overlay pattern */}
                <div
                    className={`absolute inset-0 opacity-10 transition-all duration-1000 ease-out ${isOpen ? 'opacity-10 rotate-0' : 'opacity-0 rotate-12'
                        }`}
                    style={{
                        backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
                        backgroundSize: '32px 32px',
                    }}
                />
            </div>

            {/* Mobile Menu Panel */}
            <div
                className={`fixed top-0 right-0 h-full w-80 max-w-[85vw] bg-white dark:bg-zinc-900 shadow-2xl z-[101] transform transition-all duration-500 ease-out md:hidden ${isOpen ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
                    }`}
            >
                {/* Menu Header */}
                <div
                    className={`flex items-center justify-between px-6 py-5 border-b border-zinc-200 dark:border-zinc-800 transition-all duration-500 delay-100 ${isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
                        }`}
                >
                    <Link href="/" onClick={() => setIsOpen(false)}>
                        <ThemeLogo />
                    </Link>

                    <div className="flex items-center gap-2">
                        <ThemeToggle />
                        <button
                            onClick={() => setIsOpen(false)}
                            className="p-2 -mr-2 text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white transition-colors rounded-md focus:outline-none focus:ring-2 focus:ring-zinc-400 dark:focus:ring-zinc-600"
                            aria-label="Close menu"
                        >
                            <svg
                                className="w-5 h-5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M6 18L18 6M6 6l12 12"
                                />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Navigation Links with Staggered Animation */}
                <nav className="flex flex-col py-4 overflow-y-auto max-h-[calc(100vh-73px)]">
                    {items.map((item, index) => {
                        // Convert WordPress URL to relative path if it's from the same site
                        const isExternal = item.url.startsWith('http') && !item.url.includes(process.env.NEXT_PUBLIC_WORDPRESS_API_URL || '');
                        let href = item.url;

                        try {
                            href = isExternal ? item.url : new URL(item.url).pathname;
                        } catch {
                            // If URL parsing fails, use the original URL
                            href = item.url;
                        }

                        const isActive = pathname === href;

                        // Staggered animation delay for each item
                        const animationDelay = `${150 + (index * 50)}ms`;

                        return (
                            <Link
                                key={item.ID}
                                href={href}
                                onClick={() => setIsOpen(false)}
                                className={`group relative px-6 py-4 text-base font-medium transition-all duration-300 ${isActive
                                    ? 'text-black dark:text-white bg-zinc-100 dark:bg-zinc-800'
                                    : 'text-zinc-700 dark:text-zinc-300 hover:text-black dark:hover:text-white hover:bg-zinc-50 dark:hover:bg-zinc-800/50'
                                    } ${isOpen
                                        ? 'opacity-100 translate-x-0'
                                        : 'opacity-0 translate-x-8'
                                    }`}
                                style={{
                                    transitionDelay: isOpen ? animationDelay : '0ms',
                                }}
                                target={item.target || '_self'}
                            >
                                <span className="flex items-center justify-between">
                                    <span className="flex items-center gap-3">
                                        {/* Active indicator */}
                                        {isActive && (
                                            <span
                                                className={`w-1 h-6 bg-black dark:bg-white rounded-full transition-all duration-500 ${isOpen ? 'scale-100 opacity-100' : 'scale-0 opacity-0'
                                                    }`}
                                                style={{
                                                    transitionDelay: isOpen ? `${200 + (index * 50)}ms` : '0ms',
                                                }}
                                            />
                                        )}
                                        <span>{item.title}</span>
                                    </span>

                                    {/* Arrow icon */}
                                    <svg
                                        className={`w-4 h-4 transition-all duration-300 ${isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                                            } group-hover:translate-x-1`}
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M9 5l7 7-7 7"
                                        />
                                    </svg>
                                </span>
                            </Link>
                        );
                    })}
                </nav>
            </div>
        </>
    );

    return (
        <>
            {/* Hamburger Button - Stays in Header */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="md:hidden relative z-50 p-2 -mr-2 text-zinc-700 dark:text-zinc-300 hover:text-black dark:hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-zinc-400 dark:focus:ring-zinc-600 rounded-md"
                aria-label="Toggle menu"
                aria-expanded={isOpen}
            >
                <div className="w-6 h-5 flex flex-col justify-between">
                    <span
                        className={`block h-0.5 w-full bg-current transform transition-all duration-300 ease-in-out ${isOpen ? 'rotate-45 translate-y-2' : ''
                            }`}
                    />
                    <span
                        className={`block h-0.5 w-full bg-current transition-all duration-300 ease-in-out ${isOpen ? 'opacity-0' : 'opacity-100'
                            }`}
                    />
                    <span
                        className={`block h-0.5 w-full bg-current transform transition-all duration-300 ease-in-out ${isOpen ? '-rotate-45 -translate-y-2' : ''
                            }`}
                    />
                </div>
            </button>

            {/* Render Menu Content via Portal to Body */}
            {mounted && createPortal(menuContent, document.body)}
        </>
    );
}
