import { Metadata } from "next";
import { AccessDenied } from "@/components/auth/access-denied";

export const metadata: Metadata = {
  title: "Access Denied | FixBari",
  description: "You do not have permission to access this page",
};

export default function AccessDeniedPage() {
  return <AccessDenied requiredRole="CUSTOMER" />;
}
