// src/components/NavBar.tsx
"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";

type NavHref = "/" | "/products" | "/company" | "/contact" | "/portal";

const LINKS: { href: NavHref; label: string }[] = [
  { href: "/", label: "Home" },
  { href: "/products", label: "Products" },
  { href: "/company", label: "Company" },
  { href: "/contact", label: "Contact / Quote" },
  { href: "/portal", label: "Portal" },
];

export default function NavBar() {
  const pathname = usePathname();

  return (
    <header className="border-b border-slate-800 bg-black/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        {/* Logo → always goes Home (global rule) */}
        <Link href="/" className="flex items-center gap-2">
          <span className="h-8 w-8 rounded-full bg-slate-100 text-black flex items-center justify-center text-sm font-bold">
            FF
          </span>
          <span className="font-semibold tracking-wide text-sm sm:text-base">
            FLEX FOAM
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-2 md:flex">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={clsx(
                "px-3 py-1.5 rounded-xl text-sm transition-colors",
                pathname === l.href
                  ? "bg-white text-black"
                  : "text-slate-200 hover:bg-slate-800",
              )}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        {/* Mobile: simple compact menu (still includes Home) */}
        <nav className="flex items-center gap-2 md:hidden">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={clsx(
                "px-2 py-1 rounded-lg text-xs",
                pathname === l.href
                  ? "bg-white text-black"
                  : "text-slate-200 border border-slate-700",
              )}
            >
              {l.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}


