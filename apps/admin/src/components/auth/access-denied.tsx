"use client";

import Link from "next/link";
import { ShieldX, ArrowLeft, LogOut } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";

interface AccessDeniedProps {
  userRole?: string;
  requiredRole?: string;
}

const roleDisplayNames: Record<string, string> = {
  CUSTOMER: "Customer",
  TECHNICIAN: "Technician",
  ADMIN: "Administrator",
};

export function AccessDenied({
  userRole,
  requiredRole = "ADMIN",
}: AccessDeniedProps) {
  const { logout } = useAuth();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <div className="mx-auto w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-6">
            <ShieldX className="w-10 h-10 text-red-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Access Denied
          </h1>
          <p className="text-gray-600 text-lg">
            You don&apos;t have permission to access the admin panel.
          </p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-8">
          <div className="space-y-3 text-left">
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-gray-500">Your Role</span>
              <span className="font-medium text-gray-900">
                {roleDisplayNames[userRole || ""] || userRole || "Unknown"}
              </span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-gray-500">Required Role</span>
              <span className="font-medium text-red-600">
                {roleDisplayNames[requiredRole] || requiredRole}
              </span>
            </div>
          </div>
        </div>

        <p className="text-gray-500 text-sm mb-8">
          This area is restricted to administrators only. Please contact your
          system administrator if you need access.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/login"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Login
          </Link>
          <button
            onClick={logout}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
          >
            <LogOut className="w-4 h-4" />
            Switch Account
          </button>
        </div>
      </div>
    </div>
  );
}
