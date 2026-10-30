"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { Button, Input } from "@local-services/ui";
import { registerSchema, type RegisterFormData } from "@/lib/validations/auth";
import { useAuth } from "@/contexts/auth-context";
import { PasswordInput } from "@/components/ui/password-input";
import { FormField } from "@/components/ui/form-field";

export function RegisterForm() {
  const [error, setError] = useState<string | null>(null);
  const { register: registerUser } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
      phone: "",
      acceptTerms: false,
    },
  });

  const onSubmit = async (data: RegisterFormData) => {
    try {
      setError(null);
      await registerUser({
        email: data.email,
        password: data.password,
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
      });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Registration failed. Please try again."
      );
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {error && (
        <div className="p-4 rounded-lg bg-destructive/10 text-destructive text-sm border border-destructive/20">
          {error}
        </div>
      )}

      <div className="p-4 rounded-xl bg-primary/10 border border-primary/20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
            <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <div>
            <p className="font-semibold text-gray-900">Join as a Technician</p>
            <p className="text-sm text-gray-600">Start earning by offering your services</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <FormField label="First Name" error={errors.firstName?.message}>
          <Input
            placeholder="First name"
            {...register("firstName")}
            className="h-12 bg-gray-50 border-gray-200"
          />
        </FormField>

        <FormField label="Last Name" error={errors.lastName?.message}>
          <Input
            placeholder="Last name"
            {...register("lastName")}
            className="h-12 bg-gray-50 border-gray-200"
          />
        </FormField>
      </div>

      <FormField label="Email" error={errors.email?.message}>
        <Input
          type="email"
          placeholder="Enter your email"
          {...register("email")}
          className="h-12 bg-gray-50 border-gray-200"
        />
      </FormField>

      <FormField label="Phone" error={errors.phone?.message}>
        <Input
          type="tel"
          placeholder="+880 1XXX-XXXXXX"
          {...register("phone")}
          className="h-12 bg-gray-50 border-gray-200"
        />
      </FormField>

      <FormField label="Password" error={errors.password?.message}>
        <PasswordInput
          placeholder="Create a password"
          {...register("password")}
          className="h-12 bg-gray-50 border-gray-200"
        />
      </FormField>

      <FormField label="Confirm Password" error={errors.confirmPassword?.message}>
        <PasswordInput
          placeholder="Confirm your password"
          {...register("confirmPassword")}
          className="h-12 bg-gray-50 border-gray-200"
        />
      </FormField>

      <div className="space-y-2">
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            {...register("acceptTerms")}
            className="mt-1 rounded border-gray-300 text-primary focus:ring-primary"
          />
          <span className="text-sm text-gray-600">
            I agree to the{" "}
            <Link href="/terms" className="text-primary font-semibold hover:underline">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="text-primary font-semibold hover:underline">
              Privacy Policy
            </Link>
          </span>
        </label>
        {errors.acceptTerms && (
          <p className="text-sm text-destructive">{errors.acceptTerms.message}</p>
        )}
      </div>

      <Button
        type="submit"
        className="w-full h-12 text-base font-semibold rounded-full"
        disabled={isSubmitting}
      >
        {isSubmitting ? "Creating account..." : "Join as Technician"}
      </Button>

      <p className="text-center text-sm text-gray-600">
        Already have an account?{" "}
        <Link href="/login" className="text-primary font-semibold hover:underline">
          Sign in
        </Link>
      </p>
    </form>
  );
}
