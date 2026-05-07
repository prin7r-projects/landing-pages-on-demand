"use client";

import { useState } from "react";

export function BriefForm() {
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    const data = new FormData(e.currentTarget);
    const payload = Object.fromEntries(data.entries());

    // Best-effort post to a configured webhook; otherwise just acknowledge.
    try {
      const url = process.env.NEXT_PUBLIC_LEAD_WEBHOOK_URL;
      if (url) {
        await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ source: "landing", ...payload }),
        });
      } else {
        await new Promise((r) => setTimeout(r, 600));
      }
      setSubmitted(true);
    } catch {
      setSubmitted(true);
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div className="border border-ink/15 bg-paper p-6 sm:p-8">
        <div className="font-mono text-[11px] uppercase tracking-[0.14em] text-accent">
          Brief received
        </div>
        <p className="mt-3 font-display text-2xl font-semibold leading-tight text-ink">
          We&rsquo;ll have your page on a preview URL shortly.
        </p>
        <p className="mt-3 max-w-prose text-sm leading-relaxed text-ink/80">
          A real human reads every brief during the early-access period. You&rsquo;ll
          get an email within the hour with the preview URL and a link to map your
          domain. No card on file, no fine print.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      className="border border-ink/15 bg-paper p-6 sm:p-8"
      noValidate
    >
      <div className="font-mono text-[11px] uppercase tracking-[0.14em] text-mute">
        Send a brief — first page free
      </div>
      <h3 className="mt-3 font-display text-2xl font-semibold leading-tight text-ink">
        Five fields. One live URL.
      </h3>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <Field label="Business name" name="business_name" required placeholder="Acme Plumbing" />
        <Field label="Email for delivery" name="email" type="email" required placeholder="you@acme.com" />
      </div>

      <Field
        className="mt-4"
        label="What do you sell, and to whom?"
        name="description"
        as="textarea"
        required
        rows={3}
        placeholder="One paragraph — what the offering is, who buys it, and why now."
      />

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <Field label="Primary CTA" name="cta" placeholder="Book a free consult" />
        <Field
          label="Domain (if you have one)"
          name="domain"
          placeholder="acme.com"
          help="If blank, you'll get a render.so subdomain to start."
        />
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={submitting}
          className="inline-flex items-center gap-2 bg-ink px-5 py-3 font-medium text-paper transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {submitting ? "Sending…" : "Send the brief"}
          <span aria-hidden className="font-mono text-[12px] text-accent">→</span>
        </button>
        <a
          href="#talk"
          className="font-medium text-ink underline-offset-4 hover:underline"
        >
          Or talk to a human
        </a>
      </div>

      <p className="mt-5 text-[12px] leading-relaxed text-mute">
        We&rsquo;ll never share the brief. The first page is on us. There is no upsell
        sequence in your inbox.
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
    "mt-1 block w-full border-b border-ink/15 bg-transparent px-0 py-2 text-[15px] text-ink placeholder:text-ink/30 focus:border-ink focus:outline-none";
  return (
    <label htmlFor={id} className={`block ${className}`}>
      <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-mute">
        {label} {required ? <span className="text-accent">·</span> : null}
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
        <span className="mt-1 block text-[12px] text-mute">{help}</span>
      ) : null}
    </label>
  );
}
