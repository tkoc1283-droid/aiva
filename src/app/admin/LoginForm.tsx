"use client";

import React, { useActionState } from "react";
import { login } from "./actions";

export default function LoginForm() {
  const [state, formAction, isPending] = useActionState(login, null);

  // If successful, reload page to refresh auth status
  if (state?.success) {
    if (typeof window !== "undefined") {
      window.location.reload();
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-bone px-6 py-12">
      <div className="w-full max-w-md bg-cream border border-line rounded-2xl p-8 shadow-kx-lg space-y-6">
        <div className="text-center space-y-2 select-none">
          <span className="font-display text-4xl font-bold tracking-tight text-ink">
            AIVA
          </span>
          <p className="eyebrow text-xs text-stone-soft">YÖNETİM PANELİ</p>
        </div>

        <form action={formAction} className="space-y-4">
          <div>
            <label
              htmlFor="password-input"
              className="block text-xs font-semibold uppercase tracking-wider text-stone mb-2"
            >
              Parola
            </label>
            <input
              id="password-input"
              type="password"
              name="password"
              autoFocus
              disabled={isPending}
              className="w-full rounded-xl border border-line bg-bone px-4 py-3 text-ink placeholder-stone-soft transition-colors focus:border-clay focus:outline-none"
              placeholder="••••••••"
            />
          </div>

          {state?.error && (
            <p className="text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-200/40 p-3 rounded-lg">
              {state.error}
            </p>
          )}

          <button
            type="submit"
            disabled={isPending}
            className="w-full rounded-xl bg-ink text-cream py-3.5 text-sm font-semibold tracking-wide shadow transition-colors hover:bg-ink-soft active:scale-[0.98] disabled:opacity-60"
          >
            {isPending ? "Giriş Yapılıyor..." : "Giriş Yap"}
          </button>
        </form>
      </div>
    </div>
  );
}
