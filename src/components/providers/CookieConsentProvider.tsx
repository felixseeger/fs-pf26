'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  ConsentSettings,
  defaultConsent,
  getConsentSettings,
  saveConsentSettings,
  clearAllNonEssentialCookies,
} from '@/lib/cookies';

interface CookieConsentContextType {
  consent: ConsentSettings;
  hasConsented: boolean;
  showBanner: boolean;
  showSettings: boolean;
  acceptAll: () => void;
  rejectAll: () => void;
  savePreferences: (settings: Partial<ConsentSettings>) => void;
  openSettings: () => void;
  closeSettings: () => void;
  resetConsent: () => void;
}

const CookieConsentContext = createContext<CookieConsentContextType | undefined>(undefined);

export function CookieConsentProvider({ children }: { children: React.ReactNode }) {
  const [consent, setConsent] = useState<ConsentSettings>(defaultConsent);
  const [hasConsented, setHasConsented] = useState(false);
  const [showBanner, setShowBanner] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Load consent on mount
  useEffect(() => {
    setMounted(true);
    const savedConsent = getConsentSettings();
    if (savedConsent) {
      setConsent(savedConsent);
      setHasConsented(true);
      setShowBanner(false);
    } else {
      setShowBanner(true);
    }
  }, []);

  const acceptAll = useCallback(() => {
    const newConsent = {
      analytics: true,
      marketing: true,
      preferences: true,
    };
    saveConsentSettings(newConsent);
    setConsent({ ...defaultConsent, ...newConsent, timestamp: Date.now() });
    setHasConsented(true);
    setShowBanner(false);
    setShowSettings(false);
  }, []);

  const rejectAll = useCallback(() => {
    const newConsent = {
      analytics: false,
      marketing: false,
      preferences: false,
    };
    saveConsentSettings(newConsent);
    setConsent({ ...defaultConsent, ...newConsent, timestamp: Date.now() });
    setHasConsented(true);
    setShowBanner(false);
    setShowSettings(false);
    clearAllNonEssentialCookies();
  }, []);

  const savePreferences = useCallback((settings: Partial<ConsentSettings>) => {
    const newConsent = {
      analytics: settings.analytics ?? false,
      marketing: settings.marketing ?? false,
      preferences: settings.preferences ?? false,
    };
    saveConsentSettings(newConsent);
    setConsent({ ...defaultConsent, ...newConsent, timestamp: Date.now() });
    setHasConsented(true);
    setShowBanner(false);
    setShowSettings(false);

    // Clear cookies for rejected categories
    if (!newConsent.analytics || !newConsent.marketing) {
      clearAllNonEssentialCookies();
    }
  }, []);

  const openSettings = useCallback(() => {
    setShowSettings(true);
  }, []);

  const closeSettings = useCallback(() => {
    setShowSettings(false);
  }, []);

  const resetConsent = useCallback(() => {
    setConsent(defaultConsent);
    setHasConsented(false);
    setShowBanner(true);
    setShowSettings(false);
  }, []);

  return (
    <CookieConsentContext.Provider
      value={{
        consent,
        hasConsented,
        showBanner: mounted && showBanner,
        showSettings: mounted && showSettings,
        acceptAll,
        rejectAll,
        savePreferences,
        openSettings,
        closeSettings,
        resetConsent,
      }}
    >
      {children}
    </CookieConsentContext.Provider>
  );
}

export function useCookieConsent() {
  const context = useContext(CookieConsentContext);
  if (context === undefined) {
    throw new Error('useCookieConsent must be used within a CookieConsentProvider');
  }
  return context;
}
