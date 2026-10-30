import { Metadata } from "next";
import { AuthLayout } from "@/components/auth/auth-layout";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";

export const metadata: Metadata = {
  title: "Forgot Password | FixBari Admin",
  description: "Reset your admin password",
};

export default function ForgotPasswordPage() {
  return (
    <AuthLayout title="Forgot Password" subtitle="Reset your admin password">
      <ForgotPasswordForm />
    </AuthLayout>
  );
}
