"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";

interface SearchBarProps {
  placeholder?: string;
  className?: string;
}

export function SearchBar({
  placeholder = "Search",
  className = "",
}: SearchBarProps) {
  const [query, setQuery] = useState("");
  const router = useRouter();

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      role="search"
      aria-label="Search services"
      className={className}
    >
      <div className="relative max-w-md">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className="w-full pl-12 pr-4 py-3.5 rounded-lg bg-white border-0 shadow-lg text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-white/50"
          aria-label="Search for a service"
        />
      </div>
    </form>
  );
}
