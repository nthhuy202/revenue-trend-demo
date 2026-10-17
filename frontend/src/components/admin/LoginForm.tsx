"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api, getErrorMessage } from "@/lib/api";

type LoginFields = { email: string; password: string };

const INPUT_CLASS = "mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 outline-none focus:border-neutral-900";

export default function LoginForm() {
  const router = useRouter();
  const [fields, setFields] = useState<LoginFields>({ email: "", password: "" });
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      await api("/api/auth/login", { method: "POST", body: JSON.stringify(fields) });
      router.replace("/admin");
      router.refresh();
    } catch (loginError) {
      setError(getErrorMessage(loginError));
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4 rounded-2xl border border-neutral-200 bg-white p-6">
      <div>
        <h1 className="text-xl font-medium">Admin login</h1>
        <p className="mt-1 text-sm text-neutral-500">Manage the revenue trend data.</p>
      </div>
      <label className="block text-sm">
        <span className="text-neutral-700">Email</span>
        <input
          type="email"
          required
          autoComplete="username"
          value={fields.email}
          onChange={(event) => setFields({ ...fields, email: event.target.value })}
          className={INPUT_CLASS}
        />
      </label>
      <label className="block text-sm">
        <span className="text-neutral-700">Password</span>
        <input
          type="password"
          required
          autoComplete="current-password"
          value={fields.password}
          onChange={(event) => setFields({ ...fields, password: event.target.value })}
          className={INPUT_CLASS}
        />
      </label>
      {error && (
        <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-lg bg-neutral-900 py-2 text-sm font-medium text-white hover:bg-neutral-700 disabled:opacity-50"
      >
        {isSubmitting ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
