'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

export interface WhatsAppConfig {
  phone: string;
  message?: string;
  contactName?: string;
  contactRole?: string;
  headerText?: string;
}

const WHATSAPP_ICON = (
  <svg viewBox="0 0 32 32" fill="currentColor" className="w-7 h-7">
    <path d="M16.004 0C7.165 0 0 7.163 0 16.001c0 2.82.736 5.573 2.137 8.003L.073 32l8.17-2.14A15.93 15.93 0 0 0 16.004 32C24.837 32 32 24.837 32 16.001 32 7.163 24.837 0 16.004 0Zm0 29.19a13.14 13.14 0 0 1-6.707-1.838l-.48-.286-4.985 1.307 1.33-4.862-.312-.498A13.15 13.15 0 0 1 2.81 16.001c0-7.27 5.918-13.19 13.194-13.19 7.27 0 13.186 5.92 13.186 13.19 0 7.277-5.916 13.19-13.186 13.19Zm7.234-9.878c-.397-.199-2.35-1.16-2.715-1.293-.364-.132-.63-.199-.895.2-.265.397-1.029 1.293-1.261 1.559-.232.265-.464.298-.862.1-.397-.2-1.678-.619-3.197-1.972-1.182-1.053-1.98-2.353-2.212-2.75-.232-.398-.025-.613.174-.811.18-.178.398-.464.597-.696.199-.232.265-.398.398-.663.132-.265.066-.498-.034-.696-.1-.199-.895-2.156-1.228-2.952-.323-.776-.651-.67-.895-.683l-.762-.013c-.265 0-.696.1-1.061.498-.365.398-1.393 1.36-1.393 3.317 0 1.956 1.427 3.847 1.626 4.112.198.265 2.808 4.286 6.803 6.012.95.41 1.692.656 2.27.839.954.303 1.822.26 2.509.158.765-.114 2.35-.96 2.682-1.889.332-.928.332-1.724.232-1.889-.099-.166-.364-.265-.762-.464Z" />
  </svg>
);

export default function WhatsAppButton({ phone, message, contactName, contactRole, headerText }: WhatsAppConfig) {
  const [isOpen, setIsOpen] = useState(false);

  if (!phone) return null;

  const cleanPhone = phone.replace(/[^0-9]/g, '');
  const waUrl = `https://wa.me/${cleanPhone}${message ? `?text=${encodeURIComponent(message)}` : ''}`;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="mb-2 w-72 rounded-2xl shadow-2xl overflow-hidden border border-border bg-background"
          >
            {/* Header */}
            <div className="bg-[#075E54] px-4 py-3 flex items-center justify-between">
              <span className="text-white text-sm font-semibold">
                {headerText || 'Chat with us'}
              </span>
              <button
                onClick={() => setIsOpen(false)}
                className="text-white/80 hover:text-white transition-colors"
                aria-label="Close chat"
              >
                <X size={18} />
              </button>
            </div>

            {/* Body */}
            <div className="p-4">
              {/* Chat bubble */}
              <div className="bg-muted rounded-xl rounded-tl-sm px-4 py-3 mb-4 text-sm text-foreground">
                <p className="font-medium">{contactName || 'Felix'}</p>
                {contactRole && (
                  <p className="text-xs text-muted-foreground mt-0.5">{contactRole}</p>
                )}
                <p className="mt-2 text-muted-foreground">
                  {message || 'Hi! How can I help you? Send me a message and I\'ll respond as soon as possible.'}
                </p>
              </div>

              {/* CTA */}
              <a
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full bg-[#25D366] hover:bg-[#20BD5A] text-white font-semibold py-3 rounded-xl transition-colors text-sm"
              >
                {WHATSAPP_ICON}
                Start Chat
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Action Button */}
      <motion.button
        onClick={() => setIsOpen((o) => !o)}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
        className="w-14 h-14 rounded-full bg-[#25D366] text-white flex items-center justify-center shadow-lg hover:shadow-xl transition-shadow"
        aria-label={isOpen ? 'Close WhatsApp chat' : 'Open WhatsApp chat'}
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.span key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.15 }}>
              <X size={24} />
            </motion.span>
          ) : (
            <motion.span key="wa" initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.5, opacity: 0 }} transition={{ duration: 0.15 }}>
              {WHATSAPP_ICON}
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>
    </div>
  );
}
