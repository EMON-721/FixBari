"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";

export default function OwnerSetupPage() {
  const [completed, setCompleted] = useState(false);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (completed || saving) return;

    // Capture the DOM element before await. React's currentTarget is null
    // after the asynchronous event handler resumes.
    const formElement = event.currentTarget;
    const payload = Object.fromEntries(new FormData(formElement).entries());
    setError("");
    setSaving(true);

    try {
      const response = await fetch("/api/auth/owner/initialize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
        body: JSON.stringify(payload),
      });
      const data: { message?: string | string[] } = await response.json().catch(() => ({}));
      if (!response.ok) {
        const reason = Array.isArray(data.message) ? data.message.join(", ") : data.message;
        throw new Error(reason || "Owner setup is unavailable.");
      }

      formElement.reset();
      setCompleted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Owner setup failed.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="mx-auto max-w-xl px-6 py-14">
      <h1 className="text-3xl font-bold">Owner account initialization</h1>
      {completed ? (
        <section role="status" className="mt-6 space-y-4 rounded-xl border border-green-200 bg-green-50 p-5 text-green-900">
          <h2 className="text-lg font-semibold">Owner account created successfully</h2>
          <p className="text-sm">You can now sign in to the separate FixBari Admin Portal with your owner email and the admin password you created. Enable two-factor authentication after your first sign-in.</p>
          <a className="inline-block rounded-lg bg-teal-700 px-5 py-3 font-semibold text-white" href="https://fixbari-admin.vercel.app/login">Go to Admin Login</a>
        </section>
      ) : (
        <>
          <p className="my-5 text-sm text-gray-600">
            This secure one-time setup is available only before the first Admin account exists.
            Your backend must have OWNER_ADMIN_EMAIL and a private OWNER_SETUP_SECRET configured.
          </p>
          {error && (
            <p role="alert" className="my-4 rounded-lg border border-red-200 bg-red-50 p-4 text-red-800">{error}</p>
          )}
          <form onSubmit={submit} className="space-y-4">
            {(["firstName", "lastName", "email", "password", "setupSecret"] as const).map(key => (
              <label key={key} className="block text-sm font-medium">
                {({
                  firstName: "First name",
                  lastName: "Last name",
                  email: "Owner email",
                  password: "Admin password",
                  setupSecret: "Private one-time setup secret",
                })[key]}
                <input
                  required
                  name={key}
                  autoComplete={key === "password" || key === "setupSecret" ? "new-password" : "off"}
                  type={key === "password" || key === "setupSecret" ? "password" : key === "email" ? "email" : "text"}
                  minLength={key === "setupSecret" ? 32 : key === "password" ? 8 : 2}
                  className="mt-1 w-full rounded-xl border p-3"
                />
              </label>
            ))}
            <button disabled={saving} className="rounded-xl bg-teal-700 px-6 py-3 font-semibold text-white disabled:opacity-50" type="submit">
              {saving ? "Initializing..." : "Initialize owner once"}
            </button>
          </form>
        </>
      )}
      <p className="mt-7 text-sm text-gray-600">
        Already initialized? <Link href="/admin-access" className="font-semibold text-teal-800 underline">Admin access instructions</Link>
        {" · "}
        <a href="https://fixbari-admin.vercel.app/login" className="font-semibold text-teal-800 underline">Admin Login</a>
      </p>
    </main>
  );
}
