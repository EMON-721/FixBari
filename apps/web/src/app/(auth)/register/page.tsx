import { Metadata } from "next";
import { AuthLayout } from "@/components/auth/auth-layout";
import { RegisterForm } from "@/components/auth/register-form";

export const metadata: Metadata = {
  title: "Create Account | FixBari",
  description: "Create your FixBari account",
};

export default function RegisterPage() {
  return (
    <AuthLayout title="Create Account" subtitle="Join FixBari to get started">
      <RegisterForm />
    </AuthLayout>
  );
}
