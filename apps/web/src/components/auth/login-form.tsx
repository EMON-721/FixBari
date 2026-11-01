"use client";

import { useCallback, useRef, useState } from "react";
import Script from "next/script";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Button, Input } from "@local-services/ui";
import { loginSchema, type LoginFormData } from "@/lib/validations/auth";
import { useAuth } from "@/contexts/auth-context";
import { PasswordInput } from "@/components/ui/password-input";
import { FormField } from "@/components/ui/form-field";

export function LoginForm() {
  const [error, setError] = useState<string | null>(null);
  const { login, googleLogin } = useAuth();
  const redirect = useSearchParams().get("redirect");
  const googleButton = useRef<HTMLDivElement>(null);
  const [googleLoadError, setGoogleLoadError] = useState(false);
  // The OAuth Web client ID is public, but must be configured explicitly for this deployment.
  // No fallback client ID: Google requires the origin to be authorized in Google Cloud.
  const clientId = (process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "").trim();
  const googleEnabled = clientId.endsWith(".apps.googleusercontent.com");

  const initializeGoogle = useCallback(() => {
    type GoogleSdk = {
      accounts: { id: {
        initialize: (args: {
          client_id: string;
          auto_select: boolean;
          callback: (response: { credential?: string }) => void;
        }) => void;
        renderButton: (element: HTMLElement, options: Record<string, string>) => void;
      } };
    };
    const google = (window as typeof window & { google?: GoogleSdk }).google;
    if (!googleEnabled || !google || !googleButton.current) {
      if (googleEnabled) setGoogleLoadError(true);
      return;
    }
    try {
      googleButton.current.replaceChildren();
      google.accounts.id.initialize({
        client_id: clientId,
        auto_select: false,
        callback: ({ credential }) => {
          if (!credential) {
            setError("Google did not return a sign-in credential. Please try again.");
            return;
          }
          setError(null);
          void googleLogin(credential).catch((err) => {
            setError(err instanceof Error ? err.message : "Google sign-in failed. Please try again.");
          });
        },
      });
      google.accounts.id.renderButton(googleButton.current, {
        theme: "outline",
        size: "large",
        width: "320",
        text: "continue_with",
      });
      setGoogleLoadError(false);
    } catch {
      setGoogleLoadError(true);
    }
  }, [clientId, googleEnabled, googleLogin]);

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
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      setError(null);
      await login(data.email, data.password);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed. Please try again.");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {error && (
        <div className="p-4 rounded-lg bg-destructive/10 text-destructive text-sm border border-destructive/20">
          {error}
        </div>
      )}

      <FormField label="Email" error={errors.email?.message}>
        <Input
          type="email"
          placeholder="Enter your email"
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

      <Button
        type="submit"
        className="w-full h-12 text-base font-semibold rounded-full"
        disabled={isSubmitting}
      >
        {isSubmitting ? "Signing in..." : "Log in"}
      </Button>

      {googleEnabled && (
        <div className="space-y-3">
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-white px-4 text-gray-500">Or continue with</span>
            </div>
          </div>
          <Script
            src="https://accounts.google.com/gsi/client"
            strategy="afterInteractive"
            onReady={initializeGoogle}
            onError={() => setGoogleLoadError(true)}
          />
          <div ref={googleButton} className="flex min-h-11 justify-center" aria-label="Continue with Google" />
          {googleLoadError && (
            <p role="alert" className="text-center text-sm text-red-700">
              Google sign-in could not load. Please use email and password.
            </p>
          )}
        </div>
      )}

      <p className="text-center text-xs text-gray-500 mt-6">
        By logging in, I agree to the{" "}
        <Link href="/terms" className="text-primary font-semibold hover:underline">
          Terms & Conditions
        </Link>
      </p>

      <p className="text-center text-sm text-gray-600 mt-4">
        Don&apos;t have an account?{" "}
        <Link href={redirect ? `/register?redirect=${encodeURIComponent(redirect)}` : "/register"} className="text-primary font-semibold hover:underline">
          Sign Up Now
        </Link>
      </p>
    </form>
  );
}
