"use client";

import { useEffect, useState } from "react";
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
  const [authAvailability, setAuthAvailability] = useState<"checking" | "ready" | "offline">("checking");

  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/auth/health", { cache: "no-store", signal: controller.signal })
      .then(response => {
        if (!controller.signal.aborted) {
          setAuthAvailability(response.ok ? "ready" : "offline");
        }
      })
      .catch(() => {
        if (!controller.signal.aborted) setAuthAvailability("offline");
      });
    return () => controller.abort();
  }, []);

  const { register: registerUser } = useAuth();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
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
      role: "CUSTOMER",
      acceptTerms: false,
    },
  });

  const selectedRole = watch("role");
  useEffect(() => {
    if (new URLSearchParams(window.location.search).get("role") === "technician") {
      setValue("role", "TECHNICIAN");
    }
  }, [setValue]);

  const onSubmit = async (data: RegisterFormData) => {
    if (authAvailability !== "ready") {
      setError("Registration is unavailable because the account service is not connected. Your details were not submitted.");
      return;
    }
    try {
      setError(null);
      await registerUser({
        email: data.email,
        password: data.password,
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
        role: data.role,
        serviceAreas: data.role === "TECHNICIAN" ? (data.serviceAreas || "").split(",").map(x => x.trim()).filter(Boolean) : undefined,
        specializations: data.role === "TECHNICIAN" ? (data.specializations || "").split(",").map(x => x.trim()).filter(Boolean) : undefined,
        experience: data.role === "TECHNICIAN" ? data.experience : undefined,
      });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Registration failed. Please try again."
      );
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {authAvailability === "offline" && (
        <div role="alert" className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          Account creation is temporarily unavailable because the authentication service is not connected.
          No account has been created and no password has been saved. Please try again once the service is restored.
        </div>
      )}
      {authAvailability === "checking" && (
        <p role="status" className="text-sm text-gray-500">Checking account service availability...</p>
      )}
      {error && (
        <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          {error.toLowerCase().includes("reserved for administrative onboarding") ? (
            <div className="space-y-2">
              <p className="font-semibold">This email is reserved for the FixBari Owner Admin account.</p>
              <p>Admin accounts cannot be created from Customer or Technician signup. Select the separate secure Admin setup instead.</p>
              <Link href="/admin-access" className="inline-block font-semibold text-teal-800 underline underline-offset-2">
                Go to Admin Access
              </Link>
            </div>
          ) : (
            error
          )}
        </div>
      )}

      <fieldset className="space-y-3">
        <legend className="font-semibold">Choose your account type</legend>
        <div className="grid gap-3 sm:grid-cols-3">
          <button type="button" aria-pressed={selectedRole === "CUSTOMER"} onClick={() => { setValue("role", "CUSTOMER"); setError(null); }} className={`rounded-xl border-2 p-3 text-left text-sm ${selectedRole === "CUSTOMER" ? "border-teal-600 bg-teal-50" : "border-gray-200"}`}>
            <strong className="block">Customer</strong><span>Book services</span>
          </button>
          <button type="button" aria-pressed={selectedRole === "TECHNICIAN"} onClick={() => { setValue("role", "TECHNICIAN"); setError(null); }} className={`rounded-xl border-2 p-3 text-left text-sm ${selectedRole === "TECHNICIAN" ? "border-teal-600 bg-teal-50" : "border-gray-200"}`}>
            <strong className="block">Technician</strong><span>Apply for approval</span>
          </button>
          <Link href="/admin-access" className="rounded-xl border-2 border-gray-200 p-3 text-left text-sm hover:border-teal-600"><strong className="block">Admin</strong><span>Secure owner setup</span></Link>
        </div>
      </fieldset>

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

      <FormField label="Mobile Number (Required)" error={errors.phone?.message}>
        <Input
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          placeholder="01XXXXXXXXX"
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

      {selectedRole === "TECHNICIAN" && (
        <div className="space-y-4 rounded-xl border border-teal-200 bg-teal-50/40 p-4">
          <p className="font-semibold">Technician Application — Admin approval required</p>
          <FormField label="Service Areas (comma separated)" error={errors.serviceAreas?.message}>
            <Input {...register("serviceAreas")} placeholder="Dhaka, Uttara, Mirpur" className="h-12 bg-white" />
          </FormField>
          <FormField label="Skills (comma separated)" error={errors.specializations?.message}>
            <Input {...register("specializations")} placeholder="Electrician, Plumbing" className="h-12 bg-white" />
          </FormField>
          <FormField label="Experience" error={errors.experience?.message}>
            <textarea {...register("experience")} rows={3} maxLength={1000}
              className="w-full rounded-xl border border-gray-200 bg-white p-3"
              placeholder="Describe relevant work experience and qualifications" />
          </FormField>
          <p className="text-xs text-gray-600">An administrator must approve your application before you get technician privileges.</p>
        </div>
      )}
      <input type="hidden" {...register("role")} />
      <p className="rounded-xl bg-teal-50 p-3 text-sm text-teal-900">
        No Google account needed. Technician applicants need administrator approval; Admin accounts are invitation-only.
      </p>

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
        disabled={isSubmitting || authAvailability !== "ready"}
      >
        {isSubmitting ? "Creating account..." : authAvailability === "checking" ? "Checking service..." : selectedRole === "TECHNICIAN" ? "Submit technician application" : "Create customer account"}
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
