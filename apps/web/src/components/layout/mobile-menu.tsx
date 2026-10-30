"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { X } from "lucide-react";
import { NAVIGATION_LINKS } from "@/config/navigation";
import { useAuth } from "@/contexts/auth-context";

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MobileMenu({ isOpen, onClose }: MobileMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Menu panel */}
      <div
        ref={menuRef}
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
        className="fixed right-0 top-0 h-full w-64 bg-white shadow-xl transform transition-transform duration-300 ease-in-out"
      >
        <div className="flex items-center justify-between p-4 border-b">
          <span className="font-semibold text-lg">Menu</span>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-md transition-colors"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="p-4" aria-label="Mobile navigation">
          <ul className="space-y-2">
            {NAVIGATION_LINKS.filter((link) => link.variant !== "primary").map(
              (link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    onClick={onClose}
                    className="block px-4 py-3 rounded-lg transition-colors hover:bg-gray-100 text-gray-700"
                  >
                    {link.label}
                  </Link>
                </li>
              )
            )}
            <li>
              <Link
                href={isAuthenticated ? "/dashboard" : "/login"}
                onClick={onClose}
                className="block px-4 py-3 rounded-lg transition-colors bg-primary text-white hover:bg-primary/90"
              >
                {isAuthenticated ? "Dashboard" : "Login"}
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  );
}
