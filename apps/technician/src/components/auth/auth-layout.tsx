import Link from "next/link";
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
          <div className="absolute inset-0 bg-gradient-to-br from-primary to-amber-500" />
          <div className="relative z-10 p-12 text-center">
            <div className="w-full max-w-md mx-auto">
              <div className="w-80 h-96 mx-auto bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                <div className="text-white/60 text-center p-8">
                  <svg
                    className="w-24 h-24 mx-auto mb-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  <p className="text-sm">Add your technician image at:</p>
                  <p className="text-xs mt-1 font-mono">/public/images/auth-worker.png</p>
                </div>
              </div>
            </div>
            <div className="mt-8 text-white">
              <h2 className="text-2xl font-bold mb-2">
                Join Our Technician Network
              </h2>
              <p className="text-white/80">
                Earn money by helping people with home services
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
