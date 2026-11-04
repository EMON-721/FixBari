"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { Button, Input } from "@local-services/ui";
import { loginSchema } from "@/lib/validations/auth";
import { useAuth } from "@/contexts/auth-context";
import { PasswordInput } from "@/components/ui/password-input";
import { FormField } from "@/components/ui/form-field";

export function LoginForm() {
  const [error, setError] = useState<string | null>(null);
  const [health, setHealth] = useState<"checking" | "ready" | "unavailable">("checking");
  const [healthDetails, setHealthDetails] = useState("");
  const [retryHealth, setRetryHealth] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string,string>>({});

  useEffect(() => {
    let active = true;
    const cancel = new AbortController();

    const warmAuthService = async () => {
      setHealth("checking");
      setHealthDetails("Checking the secure authentication service...");
      for (let attempt = 0; attempt < 7 && active; attempt++) {
        try {
          const timeout = AbortSignal.timeout(22000);
          const signal = AbortSignal.any([cancel.signal, timeout]);
          const response = await fetch("/api/auth/health", {
            cache: "no-store",
            signal,
          });
          if (!active) return;
          if (response.ok) {
            setHealth("ready");
            setHealthDetails("");
            return;
          }
          const failure: { code?: string; message?: string } = await response.json().catch(() => ({}));
          if (failure.code === "AUTH_NOT_CONFIGURED") {
            setHealth("unavailable");
            setHealthDetails("Authentication is not configured for this website. Contact the administrator.");
            return;
          }
        } catch {
          if (!active) return;
        }
        if (attempt < 6 && active) {
          setHealthDetails("Preparing secure sign-in. Free hosting may need about a minute to start...");
          await new Promise(resolve => setTimeout(resolve, 1200));
        }
      }
      if (active) {
        setHealth("unavailable");
        setHealthDetails("The authentication server did not respond. Please retry the connection.");
      }
    };
    void warmAuthService();
    return () => {
      active = false;
      cancel.abort();
    };
  }, [retryHealth]);

  const { login } = useAuth();

  // Native FormData reads actual browser input values, including Brave/Chrome
  // autofill that does not dispatch React onChange events.
  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSubmitting) return;
    const values = new FormData(event.currentTarget);
    const candidate = {
      email: String(values.get("email") || "").trim(),
      password: String(values.get("password") || ""),
      otpCode: String(values.get("otpCode") || "").trim(),
      rememberMe: values.get("rememberMe") === "on",
    };
    const parsed = loginSchema.safeParse(candidate);
    if (!parsed.success) {
      const issues: Record<string,string> = {};
      for (const issue of parsed.error.issues) {
        const key = String(issue.path[0] || "form");
        issues[key] ||= issue.message;
      }
      setFieldErrors(issues);
      setError("Please correct the highlighted fields and try again.");
      return;
    }
    setFieldErrors({});
    setError(null);
    setIsSubmitting(true);
    try {
      // A health check should never block the actual sign-in attempt.
      // The live login request itself is authoritative.
      await login(parsed.data.email, parsed.data.password, parsed.data.otpCode);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-6" autoComplete="on">
      {health === "checking" && (
        <div role="status" className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900" aria-live="polite">
          {healthDetails}
        </div>
      )}
      {health === "unavailable" && (
        <div role="alert" className="space-y-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          <p>{healthDetails}</p>
          <button type="button" className="font-semibold underline underline-offset-2"
            onClick={() => { setError(null); setRetryHealth(value => value + 1); }}>
            Retry connection
          </button>
        </div>
      )}
      {error && (
        <div className="p-4 rounded-lg bg-destructive/10 text-destructive text-sm border border-destructive/20">
          {error}
        </div>
      )}

      <FormField label="Email" error={fieldErrors.email}>
        <Input
          type="email"
          placeholder="admin@example.com"
          name="email"
          autoComplete="username"
          required
          className="h-12 bg-gray-50 border-gray-200"
        />
      </FormField>

      <FormField label="Password" error={fieldErrors.password}>
        <PasswordInput
          placeholder="Enter your password"
          name="password"
          autoComplete="current-password"
          required
          className="h-12 bg-gray-50 border-gray-200"
        />
      </FormField>

      <FormField label="Authenticator code (if 2FA enabled)" error={fieldErrors.otpCode}>
        <Input inputMode="numeric" autoComplete="one-time-code" maxLength={6} placeholder="6-digit code" name="otpCode" pattern="[0-9]{6}" className="h-12 bg-gray-50 border-gray-200" />
      </FormField>

      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <input
            type="checkbox"
            name="rememberMe"
            className="rounded border-gray-300 text-primary focus:ring-primary"
          />
          <span className="text-gray-600">Remember me</span>
        </label>
        <Link
          href="/forgot-password"
          className="text-sm text-primary hover:underline font-medium"
        >
          Forgot password?
        </Link>
      </div>

      <p className="text-xs leading-5 text-gray-600" role="note">
        Admin access is invitation-only. Use the email and password of an account
        explicitly assigned the ADMIN role; a customer signup does not grant admin
        permissions. If you forgot your password, use the secure reset link above.
        Never share your password or authenticator code with anyone.
      </p>

      <Button
        type="submit"
        className="w-full h-12 text-base font-semibold"
        disabled={isSubmitting}
      >
        {isSubmitting ? "Signing in..." : "Sign in to Admin"}
      </Button>
    </form>
  );
}
