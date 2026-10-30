import Link from "next/link";
import { Logo } from "./logo";

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}

export function AuthLayout({
  children,
  title,
  subtitle,
}: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="mb-8 text-center">
            <Link href="/" className="inline-block">
              <Logo />
            </Link>
          </div>

          <div className="mb-8 text-center">
            <h1 className="text-2xl font-bold text-gray-900">
              {title}
            </h1>
            {subtitle && (
              <p className="mt-2 text-sm text-gray-600">{subtitle}</p>
            )}
          </div>

          {children}
        </div>

        <p className="mt-6 text-center text-sm text-gray-500">
          Admin access only. Unauthorized access is prohibited.
        </p>
      </div>
    </div>
  );
}
