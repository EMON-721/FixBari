"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  CalendarDays,
  Users,
  Wrench,
  Settings,
  LogOut,
  ChevronLeft,
  Menu,
  X,
  Package,
  BarChart3,
  Bell,
  HelpCircle,
  FileText,
  CreditCard,
  ClipboardList,
  FilePenLine,
} from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { storage } from "@/lib/storage";
import { fetchApi } from "@/lib/api";

const mainNavItems = [
  {
    label: "Overview",
    href: "/",
    icon: LayoutDashboard,
  },
  {
    label: "Bookings",
    href: "/bookings",
    icon: CalendarDays,
  },
  {
    label: "Users",
    href: "/users",
    icon: Users,
  },
  {
    label: "Technicians",
    href: "/technicians",
    icon: Wrench,
  },
  {
    label: "Requests",
    href: "/requests",
    icon: ClipboardList,
  },
  {
    label: "Services",
    href: "/services",
    icon: Package,
  },
];

const secondaryNavItems = [
  {
    label: "Analytics",
    href: "/analytics",
    icon: BarChart3,
  },
  {
    label: "Transactions",
    href: "/transactions",
    icon: CreditCard,
  },
  {
    label: "Reports",
    href: "/reports",
    icon: FileText,
  },
];

const bottomNavItems = [
  {
    label: "Notifications",
    href: "/notifications",
    icon: Bell,
  },
  {
    label: "Content Manager",
    href: "/content-manager",
    icon: FilePenLine,
  },
  {
    label: "Settings",
    href: "/settings",
    icon: Settings,
  },
  {
    label: "Help",
    href: "/help",
    icon: HelpCircle,
  },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const { logout, user } = useAuth();
  const [customNav,setCustomNav]=useState<Array<{label:string;href:string}>>([]);
  useEffect(()=>{
    let active=true;
    const token=storage.getAccessToken();
    if(token){
      void fetchApi<{success:boolean;data:Array<{role:string;label:string;href:string;isVisible:boolean}>}>(
        "/auth/site/navigation",{token}
      ).then(r=>{
        if(active&&r.success)setCustomNav(r.data.filter(x=>
          x.role==="ADMIN"&&x.isVisible&&x.href.startsWith("/content/")
        ).map(x=>({label:x.label,href:x.href})));
      }).catch(()=>{ /* Core admin navigation remains available when CMS is offline. */ });
    }
    return ()=>{active=false};
  },[]);


  const isActive = (href: string) => {
    if (href === "/") {
      return pathname === "/";
    }
    return pathname.startsWith(href);
  };

  const NavLink = ({ item }: { item: typeof mainNavItems[0] }) => {
    const Icon = item.icon;
    const active = isActive(item.href);
    return (
      <Link
        href={item.href}
        onClick={() => setIsMobileOpen(false)}
        className={`
          flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all relative
          ${isCollapsed ? "justify-center" : ""}
          ${
            active
              ? "bg-primary text-white shadow-lg shadow-primary/25"
              : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
          }
        `}
        title={isCollapsed ? item.label : undefined}
      >
        <Icon className="w-5 h-5 flex-shrink-0" />
        {!isCollapsed && (
          <>
            <span className="font-medium flex-1">{item.label}</span>
          </>
        )}
      </Link>
    );
  };

  const sidebarContent = (
    <>
      {/* Logo Section */}
      <div className={`p-4 border-b border-gray-200 ${isCollapsed ? "px-2" : ""}`}>
        <div className="flex items-center justify-between">
          {!isCollapsed ? (
            <div className="flex items-center gap-3">
              <span aria-hidden="true" className="w-10 h-10 rounded-xl bg-amber-500 text-white font-bold inline-flex items-center justify-center">FB</span>
              <div>
                <h1 className="font-bold text-gray-900">FixBari</h1>
                <p className="text-xs text-gray-500">Admin Panel</p>
              </div>
            </div>
          ) : (
            <span aria-label="FixBari" className="w-10 h-10 rounded-xl bg-amber-500 text-white font-bold inline-flex items-center justify-center">FB</span>
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

      {/* Main Navigation */}
      <nav className="flex-1 p-3 space-y-6 overflow-y-auto">
        {/* Main */}
        <div className="space-y-1">
          {!isCollapsed && (
            <p className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
              Main
            </p>
          )}
          {mainNavItems.map((item) => (
            <NavLink key={item.href} item={item} />
          ))}
        </div>

        {/* Management */}
        <div className="space-y-1">
          {!isCollapsed && (
            <p className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
              Management
            </p>
          )}
          {secondaryNavItems.map((item) => (
            <NavLink key={item.href} item={item} />
          ))}
        </div>

        {/* System */}
        <div className="space-y-1">
          {!isCollapsed && (
            <p className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
              System
            </p>
          )}
          {bottomNavItems.map((item) => (
            <NavLink key={item.href} item={item} />
          ))}
          {customNav.map(item=>(
            <NavLink key={item.href} item={{...item,icon:FileText}} />
          ))}
        </div>
      </nav>

      {/* Admin Profile */}
      <div className={`p-3 border-t border-gray-200 ${isCollapsed ? "px-2" : ""}`}>
        <div className={`flex items-center gap-3 p-2 rounded-xl hover:bg-gray-100 transition-colors ${isCollapsed ? "justify-center" : ""}`}>
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center flex-shrink-0">
            <span className="text-white font-semibold text-sm">{user?.firstName?.[0] || "A"}{user?.lastName?.[0] || "D"}</span>
          </div>
          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-900 text-sm truncate">{user ? `${user.firstName} ${user.lastName}` : "Admin"}</p>
              <p className="text-xs text-gray-500 truncate">{user?.email || "Admin account"}</p>
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
        className="lg:hidden fixed top-4 left-4 z-50 p-2.5 bg-white rounded-xl shadow-lg border border-gray-200"
        aria-label="Open menu"
      >
        <Menu className="w-6 h-6 text-gray-700" />
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
          hidden lg:flex flex-col bg-white border-r border-gray-200
          transition-all duration-300 sticky top-0 h-screen
          ${isCollapsed ? "w-20" : "w-64"}
        `}
      >
        {sidebarContent}
      </aside>
    </>
  );
}
