import { Metadata } from "next";
import { AccessDenied } from "@/components/auth/access-denied";

export const metadata: Metadata = {
  title: "Access Denied | Technician Portal",
  description: "You do not have permission to access the technician portal",
};

export default function AccessDeniedPage() {
  return <AccessDenied requiredRole="TECHNICIAN" />;
}
