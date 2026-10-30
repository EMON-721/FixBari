"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@local-services/ui";
import {
  resetPasswordSchema,
  type ResetPasswordFormData,
} from "@/lib/validations/auth";
import { authApi } from "@/lib/api";
import { PasswordInput } from "@/components/ui/password-input";
import { FormField } from "@/components/ui/form-field";

export function ResetPasswordForm() {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isValidating, setIsValidating] = useState(true);
  const [isInvalidToken, setIsInvalidToken] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  useEffect(() => {
    const validateToken = async () => {
      if (!token) {
        setIsInvalidToken(true);
        setIsValidating(false);
        return;
      }

      try {
        const result = await authApi.validateResetToken(token);
        if (!result.valid) {
          setIsInvalidToken(true);
        }
      } catch {
        setIsInvalidToken(true);
      }
      setIsValidating(false);
    };

    validateToken();
  }, [token]);

  const onSubmit = async (data: ResetPasswordFormData) => {
    if (!token) return;

    try {
      setError(null);
      await authApi.resetPassword(token, data.password);
      setSuccess(true);
      setTimeout(() => router.push("/login"), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to reset password");
    }
  };

  if (isValidating) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="mt-4 text-gray-600">Validating your reset link...</p>
      </div>
    );
  }

  if (isInvalidToken) {
    return (
      <div className="space-y-6">
        <div className="p-6 rounded-xl bg-destructive/10 border border-destructive/20">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-destructive/20 flex items-center justify-center">
              <svg
                className="w-5 h-5 text-destructive"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
            <h3 className="font-semibold text-destructive">
              Invalid or Expired Link
            </h3>
          </div>
          <p className="text-sm text-destructive/80">
            This password reset link is invalid or has expired. Please request a
            new one.
          </p>
        </div>
        <Link href="/forgot-password">
          <Button className="w-full h-12 text-base font-semibold rounded-full">
            Request new link
          </Button>
        </Link>
      </div>
    );
  }

  if (success) {
    return (
      <div className="space-y-6">
        <div className="p-6 rounded-xl bg-green-50 border border-green-200">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
              <svg
                className="w-5 h-5 text-green-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h3 className="font-semibold text-green-800">
              Password Reset Successful
            </h3>
          </div>
          <p className="text-sm text-green-700">
            Your password has been reset. You&apos;ll be redirected to the login
            page shortly.
          </p>
        </div>
        <Link href="/login">
          <Button className="w-full h-12 text-base font-semibold rounded-full">
            Go to Sign in
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {error && (
        <div className="p-4 rounded-lg bg-destructive/10 text-destructive text-sm border border-destructive/20">
          {error}
        </div>
      )}

      <p className="text-gray-600">Enter your new password below.</p>

      <FormField label="New Password" error={errors.password?.message}>
        <PasswordInput
          placeholder="Enter new password"
          {...register("password")}
          className="h-12 bg-gray-50 border-gray-200"
        />
      </FormField>

      <FormField
        label="Confirm New Password"
        error={errors.confirmPassword?.message}
      >
        <PasswordInput
          placeholder="Confirm new password"
          {...register("confirmPassword")}
          className="h-12 bg-gray-50 border-gray-200"
        />
      </FormField>

      <div className="text-sm text-gray-500 space-y-1">
        <p>Password must:</p>
        <ul className="list-disc list-inside space-y-1 ml-2">
          <li>Be at least 8 characters long</li>
          <li>Contain at least one uppercase letter</li>
          <li>Contain at least one lowercase letter</li>
          <li>Contain at least one number</li>
        </ul>
      </div>

      <Button
        type="submit"
        className="w-full h-12 text-base font-semibold rounded-full"
        disabled={isSubmitting}
      >
        {isSubmitting ? "Resetting..." : "Reset password"}
      </Button>
    </form>
  );
}
