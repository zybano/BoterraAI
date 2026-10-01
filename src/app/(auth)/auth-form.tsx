"use client";

import { useActionState } from "react";
import type { AuthState } from "./actions";

export function AuthForm({
  action,
  mode,
}: {
  action: (state: AuthState, form: FormData) => Promise<AuthState>;
  mode: "login" | "signup";
}) {
  const [state, formAction, pending] = useActionState(action, {});
  return (
    <form action={formAction} className="space-y-4">
      {mode === "signup" && (
        <div>
          <label htmlFor="name" className="label">Your name</label>
          <input id="name" name="name" className="input" autoComplete="name" required />
        </div>
      )}
      <div>
        <label htmlFor="email" className="label">Work email</label>
        <input id="email" name="email" type="email" className="input" autoComplete="email" required />
      </div>
      <div>
        <label htmlFor="password" className="label">Password</label>
        <input
          id="password"
          name="password"
          type="password"
          className="input"
          autoComplete={mode === "signup" ? "new-password" : "current-password"}
          minLength={mode === "signup" ? 8 : undefined}
          required
        />
      </div>
      {state.error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">{state.error}</p>}
      <button type="submit" className="btn-primary w-full py-3" disabled={pending}>
        {pending ? "Please wait…" : mode === "signup" ? "Create free account" : "Log in"}
      </button>
    </form>
  );
}
