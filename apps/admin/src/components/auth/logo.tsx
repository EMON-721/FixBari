interface LogoProps { className?: string; size?: "sm" | "md" | "lg"; }
export function Logo({ className = "", size = "md" }: LogoProps) {
  return <span className={`inline-flex items-center gap-2 font-extrabold tracking-tight text-slate-900 ${size === "lg" ? "text-3xl" : size === "sm" ? "text-lg" : "text-2xl"} ${className}`}><span aria-hidden className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500 text-white">FB</span><span>Fix<span className="text-amber-600">Bari</span></span></span>;
}
