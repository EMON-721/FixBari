import type { FooterLinkGroup, SocialLink } from "@/types/home";
export const FOOTER_LINK_GROUPS: FooterLinkGroup[] = [
  { title: "Services", links: [
    { label: "Home Repair", href: "/services/home-repair" },
    { label: "Cleaning", href: "/services/cleaning" },
    { label: "Electrical", href: "/services/electrical" },
    { label: "Plumbing", href: "/services/plumbing" },
    { label: "Painting", href: "/services/painting" },
    { label: "Transport", href: "/services/transport" },
  ] },
  { title: "Platform", links: [
    { label: "About", href: "/about" },
    { label: "Interactive Preview", href: "/preview" },
    { label: "View Services", href: "/services" },
  ] },
];
export const SOCIAL_LINKS: SocialLink[] = [];
export const CONTACT_INFO = { email: "", phone: "", address: "Dhaka, Bangladesh" };
