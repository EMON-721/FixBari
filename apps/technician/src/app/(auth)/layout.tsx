"use client";

import { Suspense } from "react";
import { PublicOnlyRoute } from "@/components/auth/route-guards";
import { LoadingScreen } from "@/components/auth/loading-screen";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <PublicOnlyRoute redirectTo="/">{children}</PublicOnlyRoute>
    </Suspense>
  );
}
