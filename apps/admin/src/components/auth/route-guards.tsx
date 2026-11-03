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

const ALLOWED_ROLE = "ADMIN";

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
  redirectTo = "/",
}: RouteGuardProps) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && isAuthenticated && user?.role === ALLOWED_ROLE) {
      router.replace(redirectTo);
    }
  }, [isLoading, isAuthenticated, user, router, redirectTo]);

  // The login form is public: never block it behind an asynchronous session
  // revalidation, which can take time on a sleeping backend or stale token.
  if (isLoading) {
    return <>{children}</>;
  }

  if (isAuthenticated && user?.role === ALLOWED_ROLE) {
    return <LoadingScreen />;
  }

  return <>{children}</>;
}
