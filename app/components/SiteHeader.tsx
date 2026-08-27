"use client";

import { useState } from "react";
import Link from "next/link";

type SiteHeaderProps = {
  title: string;
  href?: string;
  email: string;
};

export default function SiteHeader({
  title,
  href = "/",
  email,
}: SiteHeaderProps) {
  const [isOpen, setIsOpen] = useState(false);

  const navLinks = [
    { href: "/work", label: "Work" },
    { href: "/field-journal", label: "Field Journal" },
    { href: "/cv", label: "CV" },
  ];

  // Split the title into words so "Dean Hjerpyn"
  // automatically becomes two stacked lines.
  const titleParts = title.trim().split(/\s+/);

  return (
    <header className="fixed inset-x-0 top-0 z-[200] text-white mix-blend-exclusion">
      <div className="grid grid-cols-1 gap-5 px-4 pb-8 pt-4 md:grid-cols-[minmax(0,1fr)_auto] md:items-start md:gap-12 md:px-10 md:pb-10 md:pt-8">
        <div className="flex min-w-0 items-start justify-between gap-4">
          <Link
            href={href}
            aria-label={`${title} homepage`}
            className="relative z-[201] block shrink-0 transition-opacity duration-200 hover:opacity-40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4"
          >
            <h1 className="font-mabrypro text-[32px] font-normal uppercase leading-[0.82] tracking-[-0.055em] md:text-[3.1vw]">
              {titleParts.map((part, index) => (
                <span key={`${part}-${index}`} className="block">
                  {part}
                </span>
              ))}
            </h1>
          </Link>

          {/* Hamburger toggle — mobile only */}
          <button
            type="button"
            onClick={() => setIsOpen((prev) => !prev)}
            aria-label={isOpen ? "Close menu" : "Open menu"}
            aria-expanded={isOpen}
            className="mt-4 shrink-0 md:hidden"
          >
            <div className="flex h-4 w-7 flex-col justify-between">
              <span
                className={`block h-[1.5px] w-full bg-white transition-transform duration-200 ${
                  isOpen ? "translate-y-[7px] rotate-45" : ""
                }`}
              />
              <span
                className={`block h-[1.5px] w-full bg-white transition-opacity duration-200 ${
                  isOpen ? "opacity-0" : "opacity-100"
                }`}
              />
              <span
                className={`block h-[1.5px] w-full bg-white transition-transform duration-200 ${
                  isOpen ? "-translate-y-[7px] -rotate-45" : ""
                }`}
              />
            </div>
          </button>
        </div>

        <nav
          aria-label="Primary navigation"
          className={`${
            isOpen ? "flex" : "hidden"
          } flex-col items-start gap-y-5 pt-5 font-mabrypro text-[10px] font-normal uppercase leading-none tracking-[0.12em] md:mt-3 md:flex md:flex-row md:items-center md:justify-end md:gap-x-9 md:pt-0 md:text-[11px]`}
        >
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setIsOpen(false)}
              className="transition-opacity duration-200 hover:opacity-40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4"
            >
              {link.label}
            </Link>
          ))}

          <a
            href={`mailto:${email}`}
            onClick={() => setIsOpen(false)}
            className="transition-opacity duration-200 hover:opacity-40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4"
          >
            Contact
          </a>
        </nav>
      </div>
    </header>
  );
}
