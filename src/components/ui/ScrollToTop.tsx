'use client';

import { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ScrollToTopProps {
  threshold?: number;
  className?: string;
}

export default function ScrollToTop({
  threshold = 400,
  className = ''
}: ScrollToTopProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      setIsVisible(window.scrollY > threshold);
    };

    window.addEventListener('scroll', toggleVisibility, { passive: true });
    toggleVisibility(); // Initial check

    return () => window.removeEventListener('scroll', toggleVisibility);
  }, [threshold]);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 20 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          onClick={scrollToTop}
          className={`fixed bottom-6 right-6 lg:bottom-10 lg:right-10 z-50 w-12 h-12 lg:w-14 lg:h-14 rounded-full glass flex items-center justify-center hover:bg-primary hover:text-black transition-colors duration-300 group ${className}`}
          aria-label="Scroll to top"
        >
          <ArrowUp className="w-5 h-5 lg:w-6 lg:h-6 text-zinc-900 dark:text-white group-hover:text-black transition-transform group-hover:-translate-y-1" />
        </motion.button>
      )}
    </AnimatePresence>
  );
}
