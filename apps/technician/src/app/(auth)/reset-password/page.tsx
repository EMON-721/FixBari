import { Metadata } from "next";
import { AuthLayout } from "@/components/auth/auth-layout";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";

export const metadata: Metadata = {
  title: "Reset Password | FixBari Technician",
  description: "Set a new password for your technician account",
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
