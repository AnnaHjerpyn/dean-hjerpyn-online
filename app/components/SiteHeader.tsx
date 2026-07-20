"use client";

import { useState } from "react";
import Link from "next/link";

type SiteHeaderProps = {
  title: string;
  email: string;
};

export default function SiteHeader({ title, email }: SiteHeaderProps) {
  const [isOpen, setIsOpen] = useState(false);

  const navLinks = [
    { href: "/work", label: "Work" },
    { href: "/field-journal", label: "Field Journal" },
    { href: "/cv", label: "CV" },
  ];

  return (
    <header className="fixed inset-x-0 top-0 z-30 text-white mix-blend-exclusion">
      <div className="grid grid-cols-1 gap-5 px-4 pb-8 pt-4 md:grid-cols-[minmax(0,1fr)_auto] md:items-start md:gap-12 md:px-8 md:pb-10 md:pt-5">
        <div className="flex items-start justify-between gap-4 min-w-0">
          <Link
            href="/work"
            aria-label="Return to selected works"
            className="min-w-0 transition-opacity hover:opacity-45"
          >
            <h1
              title={title}
              className="max-w-[900px] font-mabrypro text-[clamp(2.8rem,8vw,5rem)] font-semibold lowercase leading-[0.84] tracking-[-0.06em] md:text-[clamp(3.6rem,5vw,6rem)]"
            >
              {title}
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

        {/* Nav links — always visible on desktop, toggled on mobile */}
        <nav
          aria-label="Primary navigation"
          className={`${
            isOpen ? "flex" : "hidden"
          } flex-col items-start gap-y-5 pt-5 font-mabrypro text-[10px] font-normal uppercase leading-none tracking-[0.12em] md:mt-3 md:flex md:flex-row md:items-center md:justify-end md:gap-x-9 md:pt-0 md:text-[11px]`}
        >
          <Link
            href="/work"
            onClick={() => setIsOpen(false)}
            className="transition-opacity duration-200 hover:opacity-40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4"
          >
            Work
          </Link>

          <Link
            href="/field-journal"
            onClick={() => setIsOpen(false)}
            className="transition-opacity duration-200 hover:opacity-40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4"
          >
            Field Journal
          </Link>

          <Link
            href="/cv"
            onClick={() => setIsOpen(false)}
            className="transition-opacity duration-200 hover:opacity-40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4"
          >
            CV
          </Link>

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
