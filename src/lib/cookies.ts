// Cookie utility functions for DSGVO-compliant consent management

export interface ConsentSettings {
  essential: true; // Always required
  analytics: boolean;
  marketing: boolean;
  preferences: boolean;
  timestamp: number;
  version: string;
}

export const CONSENT_COOKIE_NAME = 'cookie_consent';
export const CONSENT_VERSION = '1.0';
export const CONSENT_EXPIRY_DAYS = 365;

export const defaultConsent: ConsentSettings = {
  essential: true,
  analytics: false,
  marketing: false,
  preferences: false,
  timestamp: 0,
  version: CONSENT_VERSION,
};

export function setCookie(name: string, value: string, days: number): void {
  if (typeof document === 'undefined') return;

  const date = new Date();
  date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
  const expires = `expires=${date.toUTCString()}`;
  document.cookie = `${name}=${value};${expires};path=/;SameSite=Lax;Secure`;
}

export function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;

  const nameEQ = `${name}=`;
  const cookies = document.cookie.split(';');

  for (let cookie of cookies) {
    cookie = cookie.trim();
    if (cookie.indexOf(nameEQ) === 0) {
      return cookie.substring(nameEQ.length);
    }
  }
  return null;
}

export function deleteCookie(name: string): void {
  if (typeof document === 'undefined') return;
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
}

export function getConsentSettings(): ConsentSettings | null {
  const cookie = getCookie(CONSENT_COOKIE_NAME);
  if (!cookie) return null;

  try {
    const settings = JSON.parse(decodeURIComponent(cookie)) as ConsentSettings;
    // Check if consent version matches
    if (settings.version !== CONSENT_VERSION) {
      return null; // Force re-consent on version change
    }
    return settings;
  } catch {
    return null;
  }
}

export function saveConsentSettings(settings: Omit<ConsentSettings, 'timestamp' | 'version' | 'essential'>): void {
  const fullSettings: ConsentSettings = {
    essential: true,
    ...settings,
    timestamp: Date.now(),
    version: CONSENT_VERSION,
  };

  setCookie(
    CONSENT_COOKIE_NAME,
    encodeURIComponent(JSON.stringify(fullSettings)),
    CONSENT_EXPIRY_DAYS
  );
}

export function hasConsent(category: keyof Omit<ConsentSettings, 'timestamp' | 'version'>): boolean {
  const settings = getConsentSettings();
  if (!settings) return category === 'essential';
  return settings[category];
}

export function clearAllNonEssentialCookies(): void {
  if (typeof document === 'undefined') return;

  // List of known analytics/marketing cookies to clear
  const cookiesToClear = [
    '_ga', '_gid', '_gat', // Google Analytics
    '_fbp', '_fbc', // Facebook
    '_gcl_au', // Google Ads
  ];

  cookiesToClear.forEach(deleteCookie);
}
