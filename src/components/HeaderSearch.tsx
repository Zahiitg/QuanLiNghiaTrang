"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

export default function HeaderSearch() {
  const [searchTerm, setSearchTerm] = useState("");
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchTerm.trim();
    if (query) {
      router.push(`/?q=${encodeURIComponent(query)}`);
    } else {
      router.push("/");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full flex items-center bg-white/15 backdrop-blur-md border border-white/30 rounded-full px-2.5 py-1 hover:bg-white/20 transition-colors shadow-inner"
    >
      <svg
        className="w-3.5 h-3.5 text-white/70 flex-shrink-0"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
        />
      </svg>
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="flex-1 bg-transparent text-white text-[11.5px] font-medium outline-none mx-2 min-w-0"
      />
      <button
        type="submit"
        className="bg-white/20 hover:bg-white/30 text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full transition-colors flex-shrink-0 border border-white/25 cursor-pointer"
      >
        Tìm
      </button>
    </form>
  );
}
