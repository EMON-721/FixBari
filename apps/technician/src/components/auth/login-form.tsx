"use client";

import { useState } from "react";
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
        {isSubmitting ? "Signing in..." : "Sign in"}
      </Button>

      <p className="text-center text-sm text-gray-600 mt-4">
        Don&apos;t have an account?{" "}
        <Link href="/register" className="text-primary font-semibold hover:underline">
          Join as Technician
        </Link>
      </p>
    </form>
  );
}
