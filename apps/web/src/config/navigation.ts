export interface NavLink {
  label: string;
  href: string;
  variant?: "default" | "primary";
}

export const NAVIGATION_LINKS: NavLink[] = [
  { label: "Home", href: "/" },
  { label: "Services", href: "/services" },
  { label: "About", href: "/about" },
  { label: "Explore V3", href: "/preview" },
  { label: "Login", href: "/login", variant: "primary" },
];
