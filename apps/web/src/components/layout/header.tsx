"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, Phone } from "lucide-react";
import { Logo } from "@/components/auth/logo";
import { MobileMenu } from "./mobile-menu";
import { NAVIGATION_LINKS } from "@/config/navigation";
import { useAuth } from "@/contexts/auth-context";

interface HeaderProps {
  className?: string;
}

export function Header({ className = "" }: HeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <header
        className={`
          sticky top-0 z-40 transition-all duration-300
          ${isScrolled
            ? "bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-100"
            : "bg-white border-b border-gray-100"
          }
          ${className}
        `}
        role="banner"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Logo */}
            <Link href="/" className="flex-shrink-0">
              <Logo />
            </Link>

            {/* Desktop Navigation */}
            <nav
              className="hidden lg:flex items-center gap-1"
              aria-label="Main navigation"
            >
              {NAVIGATION_LINKS.filter(link => link.variant !== "primary").map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 font-medium rounded-lg transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Right Actions */}
            <div className="flex items-center gap-3">
              {/* Login/Dashboard Button */}
              {!isLoading && (
                <Link
                  href={isAuthenticated ? "/dashboard" : "/login"}
                  className="hidden sm:inline-flex px-5 py-2.5 bg-primary text-white font-medium rounded-xl hover:bg-primary/90 transition-all duration-200 shadow-sm hover:shadow-md"
                >
                  {isAuthenticated ? "Dashboard" : "Login"}
                </Link>
              )}

              {/* Mobile Menu Button */}
              <button
                className="lg:hidden p-2.5 hover:bg-gray-100 rounded-xl transition-colors"
                onClick={() => setIsMobileMenuOpen(true)}
                aria-label="Open menu"
                aria-expanded={isMobileMenuOpen}
              >
                <Menu className="w-6 h-6 text-gray-700" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <MobileMenu
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
      />
    </>
  );
}
