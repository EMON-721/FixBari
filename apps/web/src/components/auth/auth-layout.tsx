import Link from "next/link";
import Image from "next/image";
import { Logo } from "./logo";

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  showImage?: boolean;
}

export function AuthLayout({
  children,
  title,
  subtitle,
  showImage = true,
}: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex">
      {/* Left side - Form */}
      <div className="flex-1 flex flex-col justify-center px-4 sm:px-6 lg:px-20 xl:px-24 py-12">
        <div className="mx-auto w-full max-w-sm lg:max-w-md">
          <div className="mb-10">
            <Link href="/" className="inline-block">
              <Logo />
            </Link>
          </div>

          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              <span className="text-primary">{title.split(" ")[0]}</span>{" "}
              {title.split(" ").slice(1).join(" ")}
            </h1>
            {subtitle && (
              <p className="mt-2 text-base text-gray-600">{subtitle}</p>
            )}
          </div>

          {children}
        </div>
      </div>

      {/* Right side - Image */}
      {showImage && (
        <div className="hidden lg:flex lg:flex-1 bg-primary items-center justify-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-teal-950 via-teal-800 to-cyan-700" />
          <div className="relative z-10 p-12 text-center">
            <div className="w-full max-w-md mx-auto">
              <div className="relative mx-auto h-96 w-80 overflow-hidden rounded-2xl border border-white/20 bg-white/10 shadow-2xl">
                <Image src="/images/auth-worker.png" alt="FixBari home service professional" fill sizes="320px" className="object-cover" priority />
              </div>
            </div>
            <div className="mt-8 text-white">
              <h2 className="text-2xl font-bold mb-2">
                Professional Services at Your Doorstep
              </h2>
              <p className="text-white/80">
                Connect with skilled technicians for all your home services
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
