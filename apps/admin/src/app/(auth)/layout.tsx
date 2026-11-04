// The login, password recovery, and other public authentication pages must
// always render. A cached ADMIN session may be stale or awaiting verification;
// redirecting from a public page before a fresh login can create a redirect
// loop between /login and the protected dashboard middleware.
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
