"use client";

import React, { useState } from "react";

interface ContactFormProps {
  translations: {
    name: string;
    email: string;
    phone: string;
    message: string;
    submit: string;
    sending: string;
    success: string;
    error: string;
  };
}

export default function ContactForm({ translations }: ContactFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      setStatus("error");
      return;
    }

    setStatus("sending");
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setStatus("success");
        setFormData({ name: "", email: "", phone: "", message: "" });
      } else {
        setStatus("error");
      }
    } catch (err) {
      setStatus("error");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="form-name" className="block text-xs font-semibold uppercase tracking-wider text-stone mb-2">
          {translations.name} *
        </label>
        <input
          id="form-name"
          type="text"
          name="name"
          required
          value={formData.name}
          onChange={handleChange}
          disabled={status === "sending"}
          className="w-full rounded-xl border border-line bg-cream px-4 py-3 text-ink placeholder-stone-soft transition-colors focus:border-clay focus:outline-none disabled:opacity-60"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div>
          <label htmlFor="form-email" className="block text-xs font-semibold uppercase tracking-wider text-stone mb-2">
            {translations.email} *
          </label>
          <input
            id="form-email"
            type="email"
            name="email"
            required
            value={formData.email}
            onChange={handleChange}
            disabled={status === "sending"}
            className="w-full rounded-xl border border-line bg-cream px-4 py-3 text-ink placeholder-stone-soft transition-colors focus:border-clay focus:outline-none disabled:opacity-60"
          />
        </div>

        <div>
          <label htmlFor="form-phone" className="block text-xs font-semibold uppercase tracking-wider text-stone mb-2">
            {translations.phone}
          </label>
          <input
            id="form-phone"
            type="text"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            disabled={status === "sending"}
            className="w-full rounded-xl border border-line bg-cream px-4 py-3 text-ink placeholder-stone-soft transition-colors focus:border-clay focus:outline-none disabled:opacity-60"
          />
        </div>
      </div>

      <div>
        <label htmlFor="form-message" className="block text-xs font-semibold uppercase tracking-wider text-stone mb-2">
          {translations.message} *
        </label>
        <textarea
          id="form-message"
          name="message"
          rows={5}
          required
          value={formData.message}
          onChange={handleChange}
          disabled={status === "sending"}
          className="w-full rounded-xl border border-line bg-cream px-4 py-3 text-ink placeholder-stone-soft transition-colors focus:border-clay focus:outline-none resize-none disabled:opacity-60"
        />
      </div>

      {status === "success" && (
        <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-4 text-sm text-emerald-800">
          {translations.success}
        </div>
      )}

      {status === "error" && (
        <div className="rounded-xl bg-rose-500/10 border border-rose-500/20 p-4 text-sm text-rose-800">
          {translations.error}
        </div>
      )}

      <button
        type="submit"
        disabled={status === "sending"}
        className="w-full rounded-xl bg-clay px-6 py-4 text-center text-sm font-semibold tracking-wide text-cream shadow-kx transition-all hover:bg-clay-deep hover:shadow-kx-lg active:scale-[0.98] disabled:opacity-60"
      >
        {status === "sending" ? translations.sending : translations.submit}
      </button>
    </form>
  );
}
