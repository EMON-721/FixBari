"use client";

import { DashboardSidebar } from "@/components/dashboard";
import { ProtectedRoute } from "@/components/auth/route-guards";
import { LoadingScreen } from "@/components/auth/loading-screen";
import { useAuth } from "@/contexts/auth-context";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen flex bg-gray-50">
        <DashboardSidebar user={user || undefined} />
        <main className="flex-1 flex flex-col min-h-screen overflow-x-hidden">
          {children}
        </main>
      </div>
    </ProtectedRoute>
  );
}
