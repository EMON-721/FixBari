"use client";

import { useEffect, useRef, useState } from "react";
import Script from "next/script";
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
  const { login, googleLogin } = useAuth();
  const googleButton = useRef<HTMLDivElement>(null);
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  const initializeGoogle = () => {
    const google = (window as unknown as { google?: { accounts: { id: { initialize: (args: { client_id: string; callback: (resp: { credential: string }) => void }) => void; renderButton: (element: HTMLElement, args: Record<string, string>) => void } } } }).google;
    if (!google || !clientId || !googleButton.current) return;
    google.accounts.id.initialize({ client_id: clientId, callback: ({ credential }) => {
      setError(null);
      void googleLogin(credential).catch((err) => setError(err instanceof Error ? err.message : "Google sign-in failed"));
    } });
    google.accounts.id.renderButton(googleButton.current, { theme: "outline", size: "large", width: "320" });
  };
  useEffect(() => { if (clientId) initializeGoogle(); }, [clientId]);

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

      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-200" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-4 bg-white text-gray-500">Or login with</span>
        </div>
      </div>

      {clientId ? (
        <>
          <Script src="https://accounts.google.com/gsi/client" strategy="afterInteractive" onLoad={initializeGoogle} />
          <div ref={googleButton} className="flex justify-center min-h-11" aria-label="Sign in with Google" />
        </>
      ) : (
        <p className="text-center text-xs text-gray-500">Google sign-in requires the website owner to configure GOOGLE_CLIENT_ID.</p>
      )}

      <p className="text-center text-xs text-gray-500 mt-6">
        By logging in i agree to the{" "}
        <Link href="/terms" className="text-primary font-semibold hover:underline">
          Terms & Condition
        </Link>
      </p>

      <p className="text-center text-sm text-gray-600 mt-4">
        Don&apos;t have an account?{" "}
        <Link href="/register" className="text-primary font-semibold hover:underline">
          Sign Up Now
        </Link>
      </p>
    </form>
  );
}

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}
