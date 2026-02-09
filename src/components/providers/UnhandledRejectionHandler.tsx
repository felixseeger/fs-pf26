'use client';

import { useEffect } from 'react';

/**
 * Suppresses unhandled promise rejections where the reason is an Event.
 * Common with Next.js navigation abort (e.g. rapid Link clicks or hash anchors)
 * and Lenis/smooth-scroll, which can reject with the native Event.
 */
export default function UnhandledRejectionHandler() {
  useEffect(() => {
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const reason = event.reason;
      const isEvent =
        reason instanceof Event ||
        reason?.constructor?.name === 'Event' ||
        (reason instanceof Error && reason.message === '[object Event]');
      if (isEvent) {
        event.preventDefault();
      }
    };

    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    return () => window.removeEventListener('unhandledrejection', handleUnhandledRejection);
  }, []);

  return null;
}
