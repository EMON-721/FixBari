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
      <div className="flex flex-col items-center justify-center py-8">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="mt-4 text-gray-600 text-sm">Validating your reset link...</p>
      </div>
    );
  }

  if (isInvalidToken) {
    return (
      <div className="space-y-6">
        <div className="p-6 rounded-xl bg-destructive/10 border border-destructive/20">
          <h3 className="font-semibold text-destructive mb-2">Invalid Link</h3>
          <p className="text-sm text-destructive/80">
            This password reset link is invalid or has expired.
          </p>
        </div>
        <Link href="/forgot-password">
          <Button className="w-full h-12 text-base font-semibold">
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
          <h3 className="font-semibold text-green-800 mb-2">Password Reset</h3>
          <p className="text-sm text-green-700">
            Your password has been reset. Redirecting to login...
          </p>
        </div>
        <Link href="/login">
          <Button className="w-full h-12 text-base font-semibold">
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

      <FormField label="New Password" error={errors.password?.message}>
        <PasswordInput
          placeholder="Enter new password"
          {...register("password")}
          className="h-12 bg-gray-50 border-gray-200"
        />
      </FormField>

      <FormField
        label="Confirm Password"
        error={errors.confirmPassword?.message}
      >
        <PasswordInput
          placeholder="Confirm new password"
          {...register("confirmPassword")}
          className="h-12 bg-gray-50 border-gray-200"
        />
      </FormField>

      <Button
        type="submit"
        className="w-full h-12 text-base font-semibold"
        disabled={isSubmitting}
      >
        {isSubmitting ? "Resetting..." : "Reset password"}
      </Button>
    </form>
  );
}
