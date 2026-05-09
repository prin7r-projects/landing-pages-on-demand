"use client";

import { useState } from "react";

export function BriefForm() {
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [briefId, setBriefId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    
    const data = new FormData(e.currentTarget);
    const payload = {
      businessName: data.get("business_name") as string,
      email: data.get("email") as string,
      audience: data.get("description") as string,
      valueProp: (data.get("description") as string).split(".")[0] || "",
      primaryCta: data.get("cta") as string,
      tone: "professional", // TODO: add tone selector
      customDomain: (data.get("domain") as string) || `${data.get("business_name")?.toString().toLowerCase().replace(/\s+/g, '-')}.drophouse.com`,
    };

    try {
      // Post to DropHouse API
      const response = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || ''}/api/briefs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("Failed to submit brief");
      }

      const result = await response.json();
      setBriefId(result.briefId);
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Submission failed");
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted && briefId) {
    return (
      <div className="border-2 border-ink bg-paper p-6 sm:p-8">
        <div className="font-mono text-[11px] uppercase tracking-[0.18em] text-accent">
          [ BRIEF / RECEIVED ]
        </div>
        <p className="mt-4 font-display text-[28px] uppercase leading-[0.95] tracking-tighter text-ink sm:text-[36px]">
          Brief submitted!
        </p>
        <p className="mt-4 max-w-prose text-sm leading-relaxed text-ink/80">
          Your brief ID is <code className="font-mono text-accent">{briefId}</code>.
          You can check the status at:
        </p>
        <a
          href={`/briefs/${briefId}`}
          className="mt-4 inline-flex items-center gap-2 bg-ink px-6 py-3 font-display text-[14px] uppercase tracking-wider text-paper transition-opacity hover:opacity-90"
        >
          Check Status
          <span aria-hidden className="font-mono text-[12px]">→</span>
        </a>
      </div>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      className="border-2 border-ink bg-paper p-6 sm:p-8"
      noValidate
    >
      <div className="font-mono text-[11px] uppercase tracking-[0.18em] text-mute">
        [ INTAKE / FIRST PAGE FREE ]
      </div>
      <h3 className="mt-3 font-display text-[28px] uppercase leading-[0.95] tracking-tighter text-ink sm:text-[36px]">
        Five fields. One live URL.
      </h3>

      {error ? (
        <div className="mt-4 font-mono text-[12px] uppercase tracking-[0.18em] text-red-500">
          Error: {error}
        </div>
      ) : null}

      <div className="mt-7 grid gap-5 sm:grid-cols-2">
        <Field label="Business name" name="business_name" required placeholder="Acme Plumbing" />
        <Field label="Email for delivery" name="email" type="email" required placeholder="you@acme.com" />
      </div>

      <Field
        className="mt-5"
        label="What do you sell, and to whom?"
        name="description"
        as="textarea"
        required
        rows={3}
        placeholder="One paragraph — what the offering is, who buys it, and why now."
      />

      <div className="mt-5 grid gap-5 sm:grid-cols-2">
        <Field label="Primary CTA" name="cta" placeholder="Book a free consult" />
        <Field
          label="Domain (if you have one)"
          name="domain"
          placeholder="acme.com"
          help="If blank, you'll get a drophouse.com subdomain to start."
        />
      </div>

      <div className="mt-7 flex flex-wrap items-center gap-4">
        <button
          type="submit"
          disabled={submitting}
          className="inline-flex items-center gap-3 bg-ink px-6 py-3 font-display text-[14px] uppercase tracking-wider text-paper transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {submitting ? "Sending…" : "Send the brief"}
          <span aria-hidden className="font-mono text-[12px] text-accent">→</span>
        </button>
        <a
          href="#talk"
          className="font-mono text-[12px] uppercase tracking-[0.18em] text-ink underline-offset-4 hover:underline"
        >
          Or talk to a human
        </a>
      </div>

      <p className="mt-6 font-mono text-[10.5px] uppercase tracking-[0.18em] text-mute">
        We'll never share the brief. The first page is on us. No upsell sequence.
      </p>
    </form>
  );
}

type FieldProps = {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  placeholder?: string;
  help?: string;
  className?: string;
  as?: "input" | "textarea";
  rows?: number;
};

function Field({
  label,
  name,
  type = "text",
  required,
  placeholder,
  help,
  className = "",
  as = "input",
  rows = 3,
}: FieldProps) {
  const id = `field-${name}`;
  const baseClasses =
    "mt-2 block w-full border-b-2 border-ink bg-transparent px-0 py-2 text-[15px] text-ink placeholder:text-ink/30 focus:border-accent focus:outline-none";
  return (
    <label htmlFor={id} className={`block ${className}`}>
      <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-mute">
        {label} {required ? <span className="text-accent">*</span> : null}
      </span>
      {as === "textarea" ? (
        <textarea
          id={id}
          name={name}
          required={required}
          placeholder={placeholder}
          rows={rows}
          className={baseClasses + " resize-none"}
        />
      ) : (
        <input
          id={id}
          name={name}
          type={type}
          required={required}
          placeholder={placeholder}
          className={baseClasses}
        />
      )}
      {help ? (
        <span className="mt-2 block font-mono text-[10.5px] uppercase tracking-[0.14em] text-mute">{help}</span>
      ) : null}
    </label>
  );
}
