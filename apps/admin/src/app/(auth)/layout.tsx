"use client";

import { Suspense } from "react";

// Always render public authentication routes without attempting a session
// redirect. Suspense is retained for password-reset pages using useSearchParams;
// the old PublicOnlyRoute was able to create a login/dashboard redirect loop.
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={
      <main role="status" className="min-h-screen flex items-center justify-center text-sm text-gray-600">
        Opening authentication form...
      </main>
    }>
      {children}
    </Suspense>
  );
}
