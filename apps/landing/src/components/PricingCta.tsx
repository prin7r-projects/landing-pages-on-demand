"use client";

import { useState } from "react";

// [NOWPAYMENTS_INTEGRATION] components/PricingCta.tsx
// Wires the four pricing tier CTAs to POST /api/checkout/nowpayments and
// redirects the user to the hosted invoice URL. Falls back to the brief-form
// anchor when:
//  - the plan has price 0 (Free tier), or
//  - the server reports `missing_env` (no API key configured yet).

type PricingCtaProps = {
  plan: "free" | "self-serve" | "team" | "concierge";
  fallbackHref: string;
  featured: boolean;
  label: string;
};

export function PricingCta({
  plan,
  fallbackHref,
  featured,
  label,
}: PricingCtaProps) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handle = async () => {
    if (pending) return;
    if (plan === "free" || plan === "concierge") {
      // Free tier and concierge plan keep their existing destinations
      // (brief form / cal.com link). Only paid self-serve & team route through
      // NOWPayments hosted invoices.
      window.location.href = fallbackHref;
      return;
    }

    setPending(true);
    setError(null);
    try {
      const res = await fetch("/api/checkout/nowpayments", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ plan }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        invoice_url?: string;
        error?: string;
        message?: string;
      };

      if (res.ok && data.invoice_url) {
        window.location.href = data.invoice_url;
        return;
      }

      if (data.error === "missing_env") {
        // [NOWPAYMENTS_INTEGRATION] graceful fallback when server is missing keys
        window.location.href = fallbackHref;
        return;
      }

      setError(data.message ?? data.error ?? "Could not start checkout.");
    } catch (err) {
      setError((err as Error).message ?? "Network error.");
    } finally {
      setPending(false);
    }
  };

  const className =
    "mt-auto inline-flex items-center gap-3 px-5 py-3 font-display text-[12px] uppercase tracking-wider2 disabled:opacity-60 " +
    (featured
      ? "bg-accent text-paper hover:bg-ink"
      : "border-2 border-ink text-ink hover:bg-ink hover:text-paper");

  return (
    <>
      <button
        type="button"
        onClick={handle}
        disabled={pending}
        className={className}
        aria-label={`${label} — ${plan} plan checkout`}
      >
        {pending ? "Opening checkout…" : label}
        <span aria-hidden className="font-mono text-[11px]">
          →
        </span>
      </button>
      {error ? (
        <p
          role="alert"
          className="mt-3 font-mono text-[11px] uppercase tracking-[0.18em] text-accent"
        >
          {error}
        </p>
      ) : null}
    </>
  );
}
