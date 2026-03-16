'use client';

import { useMemo, useState } from 'react';
import { Link } from '@/i18n/navigation';
import ShopCartSummary from '@/components/shop/ShopCartSummary';
import { useShopCart } from '@/components/providers/ShopCartProvider';

type CheckoutStep = 1 | 2 | 3;
type AccountMode = 'login' | 'register' | 'guest';
type PaymentMethod = 'paypal' | 'invoice';

interface CheckoutFormState {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
}

const ACCOUNT_OPTIONS: Array<{ id: AccountMode; title: string; description: string }> = [
  {
    id: 'login',
    title: 'Einloggen',
    description: 'Mit bestehendem Kundenkonto bestellen.',
  },
  {
    id: 'register',
    title: 'Registrieren',
    description: 'Neues Konto anlegen und Bestellungen speichern.',
  },
  {
    id: 'guest',
    title: 'Ohne Konto fortfahren',
    description: 'Als Gast bestellen, ohne Registrierung.',
  },
];

interface PaymentOption {
  id: PaymentMethod;
  title: string;
  description: string;
  enabled: boolean;
}

const PAYMENT_OPTIONS: PaymentOption[] = [
  {
    id: 'paypal',
    title: 'PayPal',
    description: 'Schnell und sicher mit deinem PayPal-Konto bezahlen.',
    enabled: true,
  },
  {
    id: 'invoice',
    title: 'Rechnung',
    description: 'Derzeit nicht verfügbar.',
    enabled: false,
  },
];

export default function ShopCheckoutContent() {
  const { items, itemCount, total } = useShopCart();
  const [currentStep, setCurrentStep] = useState<CheckoutStep>(1);
  const [accountMode, setAccountMode] = useState<AccountMode>('guest');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('paypal');
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [form, setForm] = useState<CheckoutFormState>({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });

  const accountStepValid = useMemo(() => {
    const hasContact = form.fullName.trim().length > 1 && form.email.trim().length > 3;

    if (accountMode === 'login') {
      return form.email.trim().length > 3 && form.password.trim().length >= 6;
    }

    if (accountMode === 'register') {
      return (
        hasContact &&
        form.password.trim().length >= 6 &&
        form.password === form.confirmPassword
      );
    }

    return hasContact;
  }, [accountMode, form]);

  const paymentLabel = PAYMENT_OPTIONS.find((option) => option.id === paymentMethod)?.title ?? '';
  const accountLabel = ACCOUNT_OPTIONS.find((option) => option.id === accountMode)?.title ?? '';

  const updateField = (field: keyof CheckoutFormState, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleContinue = () => {
    if (currentStep === 1 && accountStepValid) {
      setCurrentStep(2);
      return;
    }

    if (currentStep === 2) {
      setCurrentStep(3);
    }
  };

  const handlePlaceOrder = async () => {
    setIsSubmittingOrder(true);
    setSubmitError(null);

    try {
      const response = await fetch('/api/shop/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          accountMode,
          paymentMethod,
          customer: {
            fullName: form.fullName,
            email: form.email,
            phone: form.phone,
          },
          items: items.map((item) => ({
            id: item.id,
            productId: item.productId,
            variationId: item.variationId,
            quantity: item.quantity,
          })),
        }),
      });

      const data = (await response.json()) as { error?: string; redirectUrl?: string };

      if (!response.ok || !data.redirectUrl) {
        throw new Error(data.error || 'Checkout redirect could not be created.');
      }

      window.location.href = data.redirectUrl;
    } catch (error) {
      setSubmitError(
        error instanceof Error
          ? error.message
          : 'Die Weiterleitung zum WooCommerce-Checkout ist fehlgeschlagen.'
      );
    } finally {
      setIsSubmittingOrder(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_380px] gap-10 items-start">
      <section className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-950/70 p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-400 dark:text-zinc-500">
          Checkout
        </p>
        <h1 className="mt-3 text-4xl font-unbounded font-black text-zinc-900 dark:text-white">
          Kasse
        </h1>

        {items.length === 0 ? (
          <div className="mt-8 space-y-4">
            <p className="text-zinc-600 dark:text-zinc-400">
              Dein Warenkorb ist leer. Fuge zuerst Produkte hinzu, bevor du zur Kasse gehst.
            </p>
            <Link
              href="/shop"
              className="inline-flex items-center rounded-xl bg-zinc-900 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-zinc-700 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100"
            >
              Zuruck zum Shop
            </Link>
          </div>
        ) : (
          <div className="mt-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[1, 2, 3].map((stepNumber) => {
                const isActive = currentStep === stepNumber;
                const isComplete = currentStep > stepNumber;
                return (
                  <div
                    key={stepNumber}
                    className={`rounded-xl border p-4 transition-colors ${
                      isActive
                        ? 'border-zinc-900 bg-zinc-900 text-white dark:border-white dark:bg-white dark:text-zinc-900'
                        : isComplete
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-700 dark:border-emerald-500 dark:bg-emerald-950/30 dark:text-emerald-300'
                        : 'border-zinc-200 bg-transparent text-zinc-500 dark:border-zinc-800 dark:text-zinc-400'
                    }`}
                  >
                    <p className="text-xs font-semibold uppercase tracking-[0.2em]">
                      Schritt {stepNumber}
                    </p>
                    <p className="mt-2 text-sm font-bold">
                      {stepNumber === 1 && 'Konto'}
                      {stepNumber === 2 && 'Zahlung'}
                      {stepNumber === 3 && 'Bestatigung'}
                    </p>
                  </div>
                );
              })}
            </div>

            {currentStep === 1 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">
                    1. Login, Registrierung oder Gast-Checkout
                  </h2>
                  <p className="mt-2 text-zinc-600 dark:text-zinc-400">
                    Wale aus, wie du bestellen mochtest, und hinterlege deine Kontaktdaten.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {ACCOUNT_OPTIONS.map((option) => (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => setAccountMode(option.id)}
                      className={`rounded-xl border p-5 text-left transition-colors ${
                        accountMode === option.id
                          ? 'border-zinc-900 bg-zinc-900 text-white dark:border-white dark:bg-white dark:text-zinc-900'
                          : 'border-zinc-200 bg-transparent text-zinc-700 hover:border-zinc-900 dark:border-zinc-800 dark:text-zinc-300 dark:hover:border-white'
                      }`}
                    >
                      <p className="text-sm font-bold">{option.title}</p>
                      <p className={`mt-2 text-xs ${accountMode === option.id ? 'text-white/80 dark:text-zinc-600' : 'text-zinc-500 dark:text-zinc-400'}`}>
                        {option.description}
                      </p>
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {(accountMode === 'guest' || accountMode === 'register') && (
                    <label className="space-y-2">
                      <span className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                        Vollstandiger Name
                      </span>
                      <input
                        value={form.fullName}
                        onChange={(event) => updateField('fullName', event.target.value)}
                        className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 outline-none transition-colors focus:border-zinc-900 dark:border-zinc-800 dark:bg-zinc-950 dark:text-white dark:focus:border-white"
                        placeholder="Max Mustermann"
                      />
                    </label>
                  )}

                  <label className="space-y-2">
                    <span className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                      E-Mail
                    </span>
                    <input
                      type="email"
                      value={form.email}
                      onChange={(event) => updateField('email', event.target.value)}
                      className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 outline-none transition-colors focus:border-zinc-900 dark:border-zinc-800 dark:bg-zinc-950 dark:text-white dark:focus:border-white"
                      placeholder="name@example.com"
                    />
                  </label>

                  {(accountMode === 'guest' || accountMode === 'register') && (
                    <label className="space-y-2">
                      <span className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                        Telefon
                      </span>
                      <input
                        value={form.phone}
                        onChange={(event) => updateField('phone', event.target.value)}
                        className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 outline-none transition-colors focus:border-zinc-900 dark:border-zinc-800 dark:bg-zinc-950 dark:text-white dark:focus:border-white"
                        placeholder="+49 123 456789"
                      />
                    </label>
                  )}

                  {(accountMode === 'login' || accountMode === 'register') && (
                    <label className="space-y-2">
                      <span className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                        Passwort
                      </span>
                      <input
                        type="password"
                        value={form.password}
                        onChange={(event) => updateField('password', event.target.value)}
                        className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 outline-none transition-colors focus:border-zinc-900 dark:border-zinc-800 dark:bg-zinc-950 dark:text-white dark:focus:border-white"
                        placeholder="Mindestens 6 Zeichen"
                      />
                    </label>
                  )}

                  {accountMode === 'register' && (
                    <label className="space-y-2">
                      <span className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                        Passwort bestatigen
                      </span>
                      <input
                        type="password"
                        value={form.confirmPassword}
                        onChange={(event) => updateField('confirmPassword', event.target.value)}
                        className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 outline-none transition-colors focus:border-zinc-900 dark:border-zinc-800 dark:bg-zinc-950 dark:text-white dark:focus:border-white"
                        placeholder="Passwort wiederholen"
                      />
                    </label>
                  )}
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">
                    2. Zahlungsoption auswahlen
                  </h2>
                  <p className="mt-2 text-zinc-600 dark:text-zinc-400">
                    Wale die bevorzugte Zahlungsart fur diese Bestellung.
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  {PAYMENT_OPTIONS.map((option) => (
                    <button
                      key={option.id}
                      type="button"
                      disabled={!option.enabled}
                      onClick={() => option.enabled && setPaymentMethod(option.id)}
                      className={`rounded-xl border p-5 text-left transition-colors ${
                        !option.enabled
                          ? 'cursor-not-allowed border-zinc-100 bg-zinc-50 text-zinc-400 dark:border-zinc-800 dark:bg-zinc-900/40 dark:text-zinc-600'
                          : paymentMethod === option.id
                          ? 'border-zinc-900 bg-zinc-900 text-white dark:border-white dark:bg-white dark:text-zinc-900'
                          : 'border-zinc-200 bg-transparent text-zinc-700 hover:border-zinc-900 dark:border-zinc-800 dark:text-zinc-300 dark:hover:border-white'
                      }`}
                    >
                      <p className="text-sm font-bold">{option.title}</p>
                      <p className={`mt-2 text-xs ${
                        !option.enabled
                          ? 'text-zinc-400 dark:text-zinc-600'
                          : paymentMethod === option.id
                          ? 'text-white/80 dark:text-zinc-600'
                          : 'text-zinc-500 dark:text-zinc-400'
                      }`}>
                        {option.description}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">
                    3. Bestellung prufen und bezahlen
                  </h2>
                  <p className="mt-2 text-zinc-600 dark:text-zinc-400">
                    Prufe alle Orderdetails und bestatige anschliessend die kostenpflichtige Bestellung.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 p-5">
                    <h3 className="text-lg font-bold text-zinc-900 dark:text-white">
                      Kundendaten
                    </h3>
                    <div className="mt-4 space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
                      <p>
                        <span className="font-semibold text-zinc-900 dark:text-white">Checkout-Modus:</span> {accountLabel}
                      </p>
                      {form.fullName && (
                        <p>
                          <span className="font-semibold text-zinc-900 dark:text-white">Name:</span> {form.fullName}
                        </p>
                      )}
                      <p>
                        <span className="font-semibold text-zinc-900 dark:text-white">E-Mail:</span> {form.email}
                      </p>
                      {form.phone && (
                        <p>
                          <span className="font-semibold text-zinc-900 dark:text-white">Telefon:</span> {form.phone}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 p-5">
                    <h3 className="text-lg font-bold text-zinc-900 dark:text-white">
                      Zahlung
                    </h3>
                    <div className="mt-4 space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
                      <p>
                        <span className="font-semibold text-zinc-900 dark:text-white">Zahlungsmethode:</span> {paymentLabel}
                      </p>
                      <p>
                        <span className="font-semibold text-zinc-900 dark:text-white">Positionen:</span> {itemCount} Artikel
                      </p>
                      <p>
                        <span className="font-semibold text-zinc-900 dark:text-white">Gesamtsumme:</span> {new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(total)}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 p-5">
                  <h3 className="text-lg font-bold text-zinc-900 dark:text-white">
                    Orderdetails
                  </h3>
                  <div className="mt-4 space-y-4">
                    {items.map((item) => (
                      <div key={item.id} className="flex items-start justify-between gap-4 border-b border-zinc-100 pb-4 last:border-b-0 last:pb-0 dark:border-zinc-900">
                        <div>
                          <p className="text-sm font-bold text-zinc-900 dark:text-white">
                            {item.name}
                          </p>
                          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                            Menge {item.quantity}
                          </p>
                          {item.selectedOptions.map((option) => (
                            <p key={`${item.id}-${option.name}`} className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                              {option.name}: {option.value}
                            </p>
                          ))}
                        </div>
                        <p className="text-sm font-bold text-zinc-900 dark:text-white">
                          {new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(item.price * item.quantity)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div className="flex flex-wrap gap-3 pt-2">
              {currentStep > 1 && (
                <button
                  type="button"
                  onClick={() => setCurrentStep((currentStep - 1) as CheckoutStep)}
                  className="inline-flex items-center rounded-xl border border-zinc-300 px-4 py-3 text-sm font-semibold text-zinc-700 transition-colors hover:border-zinc-900 hover:text-zinc-900 dark:border-zinc-700 dark:text-zinc-300 dark:hover:border-white dark:hover:text-white"
                >
                  Zurück
                </button>
              )}

              {currentStep < 3 && (
                <button
                  type="button"
                  onClick={handleContinue}
                  disabled={currentStep === 1 && !accountStepValid}
                  className="inline-flex items-center rounded-xl bg-zinc-900 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-zinc-700 disabled:cursor-not-allowed disabled:bg-zinc-300 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100 dark:disabled:bg-zinc-700 dark:disabled:text-zinc-400"
                >
                  Weiter
                </button>
              )}

              {currentStep === 3 && (
                <>
                  <button
                    type="button"
                    onClick={handlePlaceOrder}
                    disabled={isSubmittingOrder}
                    className="inline-flex items-center rounded-xl bg-zinc-900 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-zinc-700 disabled:cursor-wait disabled:bg-zinc-400 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100 dark:disabled:bg-zinc-700 dark:disabled:text-zinc-300"
                  >
                    {isSubmittingOrder ? 'Weiterleitung zum Checkout...' : 'Jetzt kostenpflichtig bestellen'}
                  </button>
                  {submitError && (
                    <p className="w-full text-sm text-red-600 dark:text-red-400">
                      {submitError}
                    </p>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </section>

      <ShopCartSummary mode="page" />
    </div>
  );
}
