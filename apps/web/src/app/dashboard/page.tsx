import { DashboardHeader, DashboardContent } from "@/components/dashboard";

export const metadata = {
  title: "Dashboard | FixBari",
  description: "Manage your bookings, profile, and reviews",
};

export default function DashboardPage() {
  return (
    <>
      <DashboardHeader
        title="Dashboard"
        description="Welcome back! Here's an overview of your activity."
      />
      <DashboardContent />
    </>
  );
}
