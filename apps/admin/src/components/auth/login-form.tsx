"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { Button, Input } from "@local-services/ui";
import { loginSchema, type LoginFormData } from "@/lib/validations/auth";
import { useAuth } from "@/contexts/auth-context";
import { PasswordInput } from "@/components/ui/password-input";
import { FormField } from "@/components/ui/form-field";

export function LoginForm() {
  const [error, setError] = useState<string | null>(null);
  const [health, setHealth] = useState<"checking" | "ready" | "unavailable">("checking");
  const [healthDetails, setHealthDetails] = useState("");
  const [retryHealth, setRetryHealth] = useState(0);

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

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
      otpCode: "",
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    if (health !== "ready") {
      setError("Sign-in is not ready yet. Please retry the authentication connection.");
      return;
    }
    try {
      setError(null);
      await login(data.email, data.password, data.otpCode);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed. Please try again.");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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

      <FormField label="Email" error={errors.email?.message}>
        <Input
          type="email"
          placeholder="admin@example.com"
          {...register("email")}
          className="h-12 bg-gray-50 border-gray-200"
        />
      </FormField>

      <FormField label="Password" error={errors.password?.message}>
        <PasswordInput
          placeholder="Enter your password"
          {...register("password")}
          className="h-12 bg-gray-50 border-gray-200"
        />
      </FormField>

      <FormField label="Authenticator code (if 2FA enabled)" error={errors.otpCode?.message}>
        <Input inputMode="numeric" autoComplete="one-time-code" maxLength={6} placeholder="6-digit code" {...register("otpCode")} className="h-12 bg-gray-50 border-gray-200" />
      </FormField>

      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <input
            type="checkbox"
            {...register("rememberMe")}
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
        disabled={isSubmitting || health !== "ready"}
      >
        {isSubmitting ? "Signing in..." : health === "checking" ? "Connecting to authentication..." : health === "unavailable" ? "Authentication unavailable" : "Sign in to Admin"}
      </Button>
    </form>
  );
}
