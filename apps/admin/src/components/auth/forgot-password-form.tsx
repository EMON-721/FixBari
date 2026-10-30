"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { Button, Input } from "@local-services/ui";
import {
  forgotPasswordSchema,
  type ForgotPasswordFormData,
} from "@/lib/validations/auth";
import { authApi } from "@/lib/api";
import { FormField } from "@/components/ui/form-field";

export function ForgotPasswordForm() {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    try {
      setError(null);
      await authApi.forgotPassword(data.email);
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    }
  };

  if (success) {
    return (
      <div className="space-y-6">
        <div className="p-6 rounded-xl bg-green-50 border border-green-200">
          <h3 className="font-semibold text-green-800 mb-2">Check your email</h3>
          <p className="text-sm text-green-700">
            If an account exists with that email, we&apos;ve sent a password
            reset link.
          </p>
        </div>
        <Link
          href="/login"
          className="block text-center text-primary font-semibold hover:underline"
        >
          Back to Sign in
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

      <p className="text-gray-600 text-sm">
        Enter your admin email address and we&apos;ll send you a link to reset your
        password.
      </p>

      <FormField label="Email" error={errors.email?.message}>
        <Input
          type="email"
          placeholder="admin@example.com"
          {...register("email")}
          className="h-12 bg-gray-50 border-gray-200"
        />
      </FormField>

      <Button
        type="submit"
        className="w-full h-12 text-base font-semibold"
        disabled={isSubmitting}
      >
        {isSubmitting ? "Sending..." : "Send reset link"}
      </Button>

      <Link
        href="/login"
        className="flex items-center justify-center gap-2 text-sm text-gray-600 hover:text-gray-800"
      >
        <svg
          className="w-4 h-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M10 19l-7-7m0 0l7-7m-7 7h18"
          />
        </svg>
        Back to Sign in
      </Link>
    </form>
  );
}
