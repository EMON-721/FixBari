import { Metadata } from "next";
import { AuthLayout } from "@/components/auth/auth-layout";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";

export const metadata: Metadata = {
  title: "Reset Password | FixBari",
  description: "Reset your FixBari password",
};

export default function ResetPasswordPage() {
  return (
    <AuthLayout
      title="Reset Password"
      subtitle="Enter your new password below"
      showImage={false}
    >
      <ResetPasswordForm />
    </AuthLayout>
  );
}
