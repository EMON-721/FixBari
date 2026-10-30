"use client";

import { Bell, Search, ChevronDown } from "lucide-react";

interface AdminHeaderProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
}

export function AdminHeader({ title, description, actions }: AdminHeaderProps) {
  return (
    <header className="bg-white border-b border-gray-200 px-4 sm:px-6 lg:px-8 py-4 sticky top-0 z-30">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="pl-14 lg:pl-0">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">{title}</h1>
          {description && (
            <p className="text-sm text-gray-500 mt-0.5">{description}</p>
          )}
        </div>

        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search anything..."
              className="w-64 pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
          </div>

          {/* Notifications */}
          <button className="relative p-2.5 hover:bg-gray-100 rounded-xl transition-colors">
            <Bell className="w-5 h-5 text-gray-600" />
            <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white" />
          </button>

          {/* Quick Actions */}
          {actions && <div className="flex items-center gap-2">{actions}</div>}

          {/* Profile Dropdown */}
          <button className="flex items-center gap-2 p-1.5 pr-3 hover:bg-gray-100 rounded-xl transition-colors">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-semibold text-xs">AD</span>
            </div>
            <ChevronDown className="w-4 h-4 text-gray-500" />
          </button>
        </div>
      </div>
    </header>
  );
}
