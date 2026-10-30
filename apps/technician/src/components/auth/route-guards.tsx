"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { LoadingScreen } from "./loading-screen";
import { AccessDenied } from "./access-denied";

interface RouteGuardProps {
  children: React.ReactNode;
  redirectTo?: string;
}

const ALLOWED_ROLE = "TECHNICIAN";

export function ProtectedRoute({
  children,
  redirectTo = "/login",
}: RouteGuardProps) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace(redirectTo);
    }
  }, [isLoading, isAuthenticated, router, redirectTo]);

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (!isAuthenticated) {
    return <LoadingScreen />;
  }

  if (user?.role !== ALLOWED_ROLE) {
    return <AccessDenied userRole={user?.role} requiredRole={ALLOWED_ROLE} />;
  }

  return <>{children}</>;
}

export function PublicOnlyRoute({
  children,
  redirectTo = "/dashboard",
}: RouteGuardProps) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && isAuthenticated && user?.role === ALLOWED_ROLE) {
      router.replace(redirectTo);
    }
  }, [isLoading, isAuthenticated, user, router, redirectTo]);

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (isAuthenticated && user?.role === ALLOWED_ROLE) {
    return <LoadingScreen />;
  }

  return <>{children}</>;
}
