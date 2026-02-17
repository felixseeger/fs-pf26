"use client";

import React, { useState } from "react";
import { Lock, Loader2 } from "lucide-react";

interface CourseSignupFormProps {
  courseSlug: string;
}

export function CourseSignupForm({ courseSlug }: CourseSignupFormProps) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseSlug, email }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong. Please try again.");
        return;
      }

      if (data.url) {
        window.location.href = data.url;
      } else {
        setError("No checkout URL returned. Please try again.");
      }
    } catch {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  const inputClasses =
    "w-full px-4 py-2.5 rounded-xl bg-muted text-foreground border border-border text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all";

  return (
    <div className="bg-background border border-border p-8 rounded-2xl shadow-md max-w-lg mx-auto">
      <h2 className="text-2xl font-bold text-foreground mb-6">
        Enter Your Email to Continue
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-foreground mb-1">
            Email Address
          </label>
          <input
            id="email"
            type="email"
            placeholder="your@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading}
            className={inputClasses}
          />
        </div>

        {error && (
          <div className="rounded-xl border border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-950 p-3 text-sm text-red-700 dark:text-red-300">
            {error}
          </div>
        )}

        <p className="text-sm text-muted-foreground flex items-center mt-2">
          <Lock className="w-4 h-4 mr-1 text-green-500" /> 256-bit Secure SSL Connection
        </p>

        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center justify-center w-full py-3 text-lg mt-6
                     bg-primary text-primary-foreground rounded-xl font-semibold
                     hover:bg-primary/90 transition-colors cursor-pointer
                     disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Redirecting to Checkout…
            </>
          ) : (
            "Continue to Payment"
          )}
        </button>
        <p className="text-sm text-center text-muted-foreground mt-2">
          You&apos;ll be redirected to Stripe&apos;s secure checkout.
        </p>
      </form>
    </div>
  );
}
