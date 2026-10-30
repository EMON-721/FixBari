"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  User,
  CalendarDays,
  Star,
  Settings,
  LogOut,
  ChevronLeft,
  Menu,
  X,
  Bell,
  HelpCircle,
  ClipboardList,
} from "lucide-react";
import { Logo } from "@/components/auth/logo";
import { useAuth } from "@/contexts/auth-context";

const navItems = [
  {
    label: "Overview",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Profile",
    href: "/dashboard/profile",
    icon: User,
  },
  {
    label: "My Bookings",
    href: "/dashboard/bookings",
    icon: CalendarDays,
  },
  {
    label: "Service Requests",
    href: "/dashboard/requests",
    icon: ClipboardList,
  },
  {
    label: "My Reviews",
    href: "/dashboard/reviews",
    icon: Star,
  },
  {
    label: "Settings",
    href: "/dashboard/settings",
    icon: Settings,
  },
];

const secondaryNavItems = [
  {
    label: "Notifications",
    href: "/dashboard/notifications",
    icon: Bell,
  },
  {
    label: "Help & Support",
    href: "/help",
    icon: HelpCircle,
  },
];

interface DashboardSidebarProps {
  user?: {
    firstName: string;
    lastName: string;
    email: string;
    avatar?: string;
  };
}

export function DashboardSidebar({ user }: DashboardSidebarProps) {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const { logout } = useAuth();

  const isActive = (href: string) => {
    if (href === "/dashboard") {
      return pathname === "/dashboard";
    }
    return pathname.startsWith(href);
  };

  const sidebarContent = (
    <>
      {/* Logo Section */}
      <div className={`p-4 border-b border-gray-100 ${isCollapsed ? "px-2" : ""}`}>
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <Link href="/">
              <Logo size="sm" />
            </Link>
          )}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden lg:flex p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <ChevronLeft
              className={`w-5 h-5 text-gray-500 transition-transform ${
                isCollapsed ? "rotate-180" : ""
              }`}
            />
          </button>
        </div>
      </div>

      {/* User Info */}
      <div className={`p-4 border-b border-gray-100 ${isCollapsed ? "px-2" : ""}`}>
        <div className={`flex items-center gap-3 ${isCollapsed ? "justify-center" : ""}`}>
          <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
            {user?.avatar ? (
              <img
                src={user.avatar}
                alt={`${user.firstName} ${user.lastName}`}
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              <span className="text-primary font-semibold text-sm">
                {user?.firstName?.[0] || "U"}
                {user?.lastName?.[0] || ""}
              </span>
            )}
          </div>
          {!isCollapsed && (
            <div className="min-w-0">
              <p className="font-semibold text-gray-900 truncate">
                {user?.firstName || "User"} {user?.lastName || ""}
              </p>
              <p className="text-sm text-gray-500 truncate">{user?.email || "user@example.com"}</p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        <div className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsMobileOpen(false)}
                className={`
                  flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all
                  ${isCollapsed ? "justify-center" : ""}
                  ${
                    active
                      ? "bg-primary text-white shadow-sm"
                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                  }
                `}
                title={isCollapsed ? item.label : undefined}
              >
                <Icon className={`w-5 h-5 flex-shrink-0 ${active ? "" : ""}`} />
                {!isCollapsed && <span className="font-medium">{item.label}</span>}
              </Link>
            );
          })}
        </div>

        {/* Divider */}
        <div className="pt-4 mt-4 border-t border-gray-100">
          {secondaryNavItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsMobileOpen(false)}
                className={`
                  flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all
                  ${isCollapsed ? "justify-center" : ""}
                  ${
                    active
                      ? "bg-primary text-white shadow-sm"
                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                  }
                `}
                title={isCollapsed ? item.label : undefined}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {!isCollapsed && <span className="font-medium">{item.label}</span>}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Logout Button */}
      <div className={`p-3 border-t border-gray-100 ${isCollapsed ? "px-2" : ""}`}>
        <button
          onClick={logout}
          className={`
            flex items-center gap-3 px-3 py-2.5 w-full rounded-xl
            text-red-600 hover:bg-red-50 transition-colors
            ${isCollapsed ? "justify-center" : ""}
          `}
          title={isCollapsed ? "Logout" : undefined}
        >
          <LogOut className="w-5 h-5" />
          {!isCollapsed && <span className="font-medium">Logout</span>}
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-xl shadow-lg border border-gray-100"
        aria-label="Open menu"
      >
        <Menu className="w-6 h-6 text-gray-700" />
      </button>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <aside
        className={`
          lg:hidden fixed inset-y-0 left-0 z-50 w-72 bg-white
          transform transition-transform duration-300 ease-in-out
          ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
          flex flex-col
        `}
      >
        <button
          onClick={() => setIsMobileOpen(false)}
          className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-lg"
          aria-label="Close menu"
        >
          <X className="w-5 h-5 text-gray-500" />
        </button>
        {sidebarContent}
      </aside>

      {/* Desktop Sidebar */}
      <aside
        className={`
          hidden lg:flex flex-col bg-white border-r border-gray-100
          transition-all duration-300
          ${isCollapsed ? "w-20" : "w-64"}
        `}
      >
        {sidebarContent}
      </aside>
    </>
  );
}
