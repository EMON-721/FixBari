import Link from "next/link";
import { Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin, ArrowRight } from "lucide-react";
import { Logo } from "@/components/auth/logo";
import {
  FOOTER_LINK_GROUPS,
  SOCIAL_LINKS,
  CONTACT_INFO,
} from "@/config/footer-links";

const socialIcons = {
  facebook: Facebook,
  twitter: Twitter,
  instagram: Instagram,
  linkedin: Linkedin,
};

const socialColors = {
  facebook: "hover:bg-blue-600",
  twitter: "hover:bg-sky-500",
  instagram: "hover:bg-pink-600",
  linkedin: "hover:bg-blue-700",
};

interface FooterProps {
  className?: string;
}

export function Footer({ className = "" }: FooterProps) {
  return (
    <footer
      className={`relative bg-gray-900 text-gray-300 ${className}`}
      role="contentinfo"
    >
      {/* Gradient accent line */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-amber-500 to-primary" />

      {/* Main footer content */}
      <div className="pt-16 sm:pt-20 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Top section: Logo + Link groups */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-12 gap-8 lg:gap-8 pb-12 border-b border-gray-800">
            {/* Brand column - wider */}
            <div className="col-span-2 md:col-span-3 lg:col-span-4 mb-4 lg:mb-0">
              <Logo className="[&_img]:brightness-0 [&_img]:invert" />
              <p className="mt-4 text-sm text-gray-400 max-w-xs leading-relaxed">
                A home-services booking and management project owned by Md. Emon Hossain.
                Quality work, verified professionals, guaranteed satisfaction.
              </p>

              {/* Do not publish placeholder phone numbers or unverified contact emails. */}
              {CONTACT_INFO.email && CONTACT_INFO.phone && <div className="mt-6 space-y-3">
                <a
                  href={`mailto:${CONTACT_INFO.email}`}
                  className="flex items-center gap-3 text-sm text-gray-400 hover:text-primary transition-colors group"
                >
                  <span className="w-8 h-8 rounded-lg bg-gray-800 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <Mail className="w-4 h-4" />
                  </span>
                  {CONTACT_INFO.email}
                </a>
                <a
                  href={`tel:${CONTACT_INFO.phone.replace(/\s/g, "")}`}
                  className="flex items-center gap-3 text-sm text-gray-400 hover:text-primary transition-colors group"
                >
                  <span className="w-8 h-8 rounded-lg bg-gray-800 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <Phone className="w-4 h-4" />
                  </span>
                  {CONTACT_INFO.phone}
                </a>
                <div className="flex items-center gap-3 text-sm text-gray-400">
                  <span className="w-8 h-8 rounded-lg bg-gray-800 flex items-center justify-center">
                    <MapPin className="w-4 h-4" />
                  </span>
                  Dhaka, Bangladesh
                </div>
              </div>

              }

              {/* Social links */}
              <div className="flex gap-3 mt-6">
                {SOCIAL_LINKS.map((social) => {
                  const Icon = socialIcons[social.platform];
                  const colorClass = socialColors[social.platform];
                  return (
                    <a
                      key={social.platform}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={social.ariaLabel}
                      className={`w-10 h-10 rounded-lg bg-gray-800 flex items-center justify-center text-gray-400 hover:text-white ${colorClass} transition-all duration-200`}
                    >
                      <Icon className="w-5 h-5" />
                    </a>
                  );
                })}
              </div>
            </div>

            {/* Link groups */}
            {FOOTER_LINK_GROUPS.map((group) => (
              <div key={group.title} className="lg:col-span-2">
                <h3 className="font-semibold text-white mb-4 text-sm uppercase tracking-wider">
                  {group.title}
                </h3>
                <ul className="space-y-3">
                  {group.links.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="text-sm text-gray-400 hover:text-primary transition-colors inline-flex items-center gap-1 group"
                      >
                        <span>{link.label}</span>
                        <ArrowRight className="w-3 h-3 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Bottom section: Copyright + badges */}
          <div className="pt-8 flex flex-col sm:flex-row justify-between items-center gap-6">
            <p className="text-sm text-gray-500 order-2 sm:order-1">
              &copy; {new Date().getFullYear()} FixBari. All rights reserved.
            </p>

            {/* Trust badges */}
            <div className="flex items-center gap-4 order-1 sm:order-2">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-800 text-xs text-gray-400">
                <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Verified Pros</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-800 text-xs text-gray-400">
                <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Secure</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
