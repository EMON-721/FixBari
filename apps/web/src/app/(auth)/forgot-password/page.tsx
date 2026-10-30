import { Metadata } from "next";
import { AuthLayout } from "@/components/auth/auth-layout";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";

export const metadata: Metadata = {
  title: "Forgot Password | FixBari",
  description: "Reset your FixBari password",
};

export default function ForgotPasswordPage() {
  return (
    <AuthLayout
      title="Forgot Password?"
      subtitle="No worries, we'll send you reset instructions"
      showImage={false}
    >
      <ForgotPasswordForm />
    </AuthLayout>
  );
}
