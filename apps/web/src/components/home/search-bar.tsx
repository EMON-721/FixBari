"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Search, ArrowRight } from "lucide-react";

interface SearchBarProps {
  placeholder?: string;
  className?: string;
}

export function SearchBar({ placeholder = "Search services", className = "" }: SearchBarProps) {
  const [query, setQuery] = useState("");
  const router = useRouter();
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const term = query.trim();
    if (term) router.push(`/search?q=${encodeURIComponent(term)}`);
    else router.push("/services");
  };

  return (
    <form onSubmit={handleSubmit} role="search" aria-label="Search services" className={className}>
      <div className="flex w-full max-w-xl items-center gap-2 rounded-2xl border border-white/20 bg-white p-2 shadow-xl shadow-slate-950/15">
        <Search className="ml-3 h-5 w-5 shrink-0 text-slate-500" aria-hidden="true" />
        <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder={placeholder}
          className="min-w-0 flex-1 bg-transparent px-2 py-3 text-slate-900 placeholder:text-slate-500 outline-none"
          aria-label="Search for a service" />
        <button type="submit" className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-amber-500 px-5 py-3 font-semibold text-slate-950 transition hover:bg-amber-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-700">
          Explore <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </form>
  );
}
