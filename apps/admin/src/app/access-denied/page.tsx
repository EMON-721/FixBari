import { Metadata } from "next";
import { AccessDenied } from "@/components/auth/access-denied";

export const metadata: Metadata = {
  title: "Access Denied | Admin Panel",
  description: "You do not have permission to access the admin panel",
};

export default function AccessDeniedPage() {
  return <AccessDenied requiredRole="ADMIN" />;
}
