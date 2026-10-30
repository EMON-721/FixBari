"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  CalendarDays,
  Clock,
  User,
  Settings,
  LogOut,
  ChevronLeft,
  Menu,
  X,
  Star,
  Wallet,
  MapPin,
  Bell,
  HelpCircle,
  CheckCircle,
  ClipboardList,
} from "lucide-react";
import { useAuth } from "@/contexts/auth-context";

const mainNavItems = [
  {
    label: "Overview",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "My Bookings",
    href: "/dashboard/bookings",
    icon: CalendarDays,
    badge: 3,
  },
  {
    label: "Quotations",
    href: "/dashboard/quotations",
    icon: ClipboardList,
  },
  {
    label: "Schedule",
    href: "/dashboard/schedule",
    icon: Clock,
  },
  {
    label: "Job History",
    href: "/dashboard/history",
    icon: CheckCircle,
  },
];

const secondaryNavItems = [
  {
    label: "Earnings",
    href: "/dashboard/earnings",
    icon: Wallet,
  },
  {
    label: "Reviews",
    href: "/dashboard/reviews",
    icon: Star,
  },
  {
    label: "Service Area",
    href: "/dashboard/service-area",
    icon: MapPin,
  },
];

const bottomNavItems = [
  {
    label: "Notifications",
    href: "/dashboard/notifications",
    icon: Bell,
  },
  {
    label: "Profile",
    href: "/dashboard/profile",
    icon: User,
  },
  {
    label: "Settings",
    href: "/dashboard/settings",
    icon: Settings,
  },
  {
    label: "Help",
    href: "/dashboard/help",
    icon: HelpCircle,
  },
];

export function TechnicianSidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const userInitials = user
    ? `${user.firstName?.[0] || ""}${user.lastName?.[0] || ""}`.toUpperCase()
    : "?";
  const userName = user ? `${user.firstName} ${user.lastName}` : "Technician";

  const isActive = (href: string) => {
    if (href === "/dashboard") {
      return pathname === "/dashboard";
    }
    return pathname.startsWith(href);
  };

  const NavLink = ({ item }: { item: (typeof mainNavItems)[0] }) => {
    const Icon = item.icon;
    const active = isActive(item.href);
    return (
      <Link
        href={item.href}
        onClick={() => setIsMobileOpen(false)}
        className={`
          flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 relative group
          ${isCollapsed ? "justify-center" : ""}
          ${
            active
              ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/25"
              : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
          }
        `}
        title={isCollapsed ? item.label : undefined}
      >
        <Icon
          className={`w-5 h-5 flex-shrink-0 transition-transform duration-200 ${
            !active ? "group-hover:scale-110" : ""
          }`}
        />
        {!isCollapsed && (
          <>
            <span className="font-medium flex-1">{item.label}</span>
            {"badge" in item && item.badge && (
              <span
                className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                  active
                    ? "bg-white/20 text-white"
                    : "bg-emerald-100 text-emerald-600"
                }`}
              >
                {item.badge}
              </span>
            )}
          </>
        )}
        {isCollapsed && "badge" in item && item.badge && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center animate-pulse">
            {item.badge}
          </span>
        )}
      </Link>
    );
  };

  const sidebarContent = (
    <>
      {/* Logo Section */}
      <div
        className={`p-4 border-b border-slate-200 ${isCollapsed ? "px-2" : ""}`}
      >
        <div className="flex items-center justify-between">
          {!isCollapsed ? (
            <div className="flex items-center gap-3">
              <span aria-hidden="true" className="w-10 h-10 rounded-xl bg-amber-500 text-white font-bold inline-flex items-center justify-center">FB</span>
              <div>
                <h1 className="font-bold text-slate-900">FixBari</h1>
                <p className="text-xs text-slate-500">Technician Portal</p>
              </div>
            </div>
          ) : (
            <span aria-label="FixBari" className="w-10 h-10 rounded-xl bg-amber-500 text-white font-bold inline-flex items-center justify-center">FB</span>
          )}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden lg:flex p-2 hover:bg-slate-100 rounded-lg transition-colors"
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <ChevronLeft
              className={`w-5 h-5 text-slate-500 transition-transform duration-300 ${
                isCollapsed ? "rotate-180" : ""
              }`}
            />
          </button>
        </div>
      </div>

      {/* Availability Toggle */}
      {!isCollapsed && (
        <div className="px-4 py-3 border-b border-slate-200">
          <div className="flex items-center justify-between p-3 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              <span className="text-sm font-medium text-slate-700">
                Available
              </span>
            </div>
            <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-emerald-500 transition-colors">
              <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-6 shadow-sm" />
            </button>
          </div>
        </div>
      )}

      {/* Main Navigation */}
      <nav className="flex-1 p-3 space-y-6 overflow-y-auto">
        {/* Main */}
        <div className="space-y-1">
          {!isCollapsed && (
            <p className="px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Main
            </p>
          )}
          {mainNavItems.map((item) => (
            <NavLink key={item.href} item={item} />
          ))}
        </div>

        {/* Work */}
        <div className="space-y-1">
          {!isCollapsed && (
            <p className="px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Work
            </p>
          )}
          {secondaryNavItems.map((item) => (
            <NavLink key={item.href} item={item} />
          ))}
        </div>

        {/* Account */}
        <div className="space-y-1">
          {!isCollapsed && (
            <p className="px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Account
            </p>
          )}
          {bottomNavItems.map((item) => (
            <NavLink key={item.href} item={item} />
          ))}
        </div>
      </nav>

      {/* Technician Profile */}
      <div
        className={`p-3 border-t border-slate-200 bg-slate-50/50 ${isCollapsed ? "px-2" : ""}`}
      >
        <div
          className={`flex items-center gap-3 p-2 rounded-xl hover:bg-white transition-colors cursor-pointer ${isCollapsed ? "justify-center" : ""}`}
        >
          <div className="relative">
            <div className="w-10 h-10 bg-gradient-to-br from-slate-600 to-slate-800 rounded-xl flex items-center justify-center flex-shrink-0">
              <span className="text-white font-semibold text-sm">{userInitials}</span>
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-white" />
          </div>
          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-slate-900 text-sm truncate">
                {userName}
              </p>
              <div className="flex items-center gap-1">
                <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                <span className="text-xs text-slate-500">4.9 Rating</span>
              </div>
            </div>
          )}
        </div>

        <button
          onClick={logout}
          className={`
            flex items-center gap-3 px-3 py-2.5 w-full rounded-xl mt-2
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
        className="lg:hidden fixed top-4 left-4 z-50 p-2.5 bg-white rounded-xl shadow-lg border border-slate-200 hover:shadow-xl transition-shadow"
        aria-label="Open menu"
      >
        <Menu className="w-6 h-6 text-slate-700" />
      </button>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <aside
        className={`
          lg:hidden fixed inset-y-0 left-0 z-50 w-72 bg-white
          transform transition-transform duration-300 ease-in-out
          ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
          flex flex-col shadow-2xl
        `}
      >
        <button
          onClick={() => setIsMobileOpen(false)}
          className="absolute top-4 right-4 p-2 hover:bg-slate-100 rounded-lg transition-colors"
          aria-label="Close menu"
        >
          <X className="w-5 h-5 text-slate-500" />
        </button>
        {sidebarContent}
      </aside>

      {/* Desktop Sidebar */}
      <aside
        className={`
          hidden lg:flex flex-col bg-white border-r border-slate-200
          transition-all duration-300 sticky top-0 h-screen
          ${isCollapsed ? "w-20" : "w-64"}
        `}
      >
        {sidebarContent}
      </aside>
    </>
  );
}
