export interface NavLink {
  label: string;
  href: string;
  variant?: "default" | "primary";
}

export const NAVIGATION_LINKS: NavLink[] = [
  { label: "Home", href: "/" },
  { label: "Services", href: "/services" },
  { label: "About", href: "/about" },
  { label: "Login", href: "/login", variant: "primary" },
];
