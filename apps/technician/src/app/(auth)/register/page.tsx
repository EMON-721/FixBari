import { redirect } from "next/navigation";
export default function TechnicianRegistrationRedirect() {
  // All new applications use the unified public enrollment form. The user
  // remains CUSTOMER until explicit approval by an administrator.
  redirect("https://fix-bari.vercel.app/register?role=technician");
}
