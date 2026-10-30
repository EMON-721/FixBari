import { Metadata } from "next";
import { AuthLayout } from "@/components/auth/auth-layout";
import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = {
  title: "Technician Login | FixBari",
  description: "Sign in to your technician account",
};

export default function LoginPage() {
  return (
    <AuthLayout title="Welcome Back" subtitle="Sign in to your technician account">
      <LoginForm />
    </AuthLayout>
  );
}
