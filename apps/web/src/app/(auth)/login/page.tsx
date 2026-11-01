import { Metadata } from "next";
import { Suspense } from "react";
import { AuthLayout } from "@/components/auth/auth-layout";
import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = {
  title: "Sign In | FixBari",
  description: "Sign in to your FixBari account",
};

export default function LoginPage() {
  return (
    <AuthLayout title="Welcome Back" subtitle="Enter your email and password to access your account">
      <Suspense fallback={<p>Loading sign-in form...</p>}><LoginForm /></Suspense>
    </AuthLayout>
  );
}
