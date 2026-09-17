"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";

type SiteHeaderProps = {
  title: string;
  href?: string;
  email: string;
};

const menuContainer = {
  hidden: {},
  visible: {
    transition: {
      delayChildren: 0.1,
      staggerChildren: 0.06,
    },
  },
};

const menuItem = {
  hidden: {
    y: 24,
    opacity: 0,
  },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.5,
      ease: [0.22, 1, 0.36, 1] as const,
    },
  },
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

  // Lock body scroll while the mobile menu is open.
  useEffect(() => {
    if (isOpen) {
      const previousOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";

      return () => {
        document.body.style.overflow = previousOverflow;
      };
    }
  }, [isOpen]);

  return (
    <header className="fixed inset-x-0 top-0 z-[200] text-black">
      <div
        className="
          grid
          grid-cols-1
          gap-5
          px-4
          pb-8
          pt-4
          md:grid-cols-[minmax(0,1fr)_auto]
          md:items-start
          md:gap-12
          md:px-10
          md:pb-10
          md:pt-8
        "
      >
        <div className="flex min-w-0 items-center justify-between gap-4">
          <Link
            href={href}
            aria-label={`${title} homepage`}
            onClick={() => setIsOpen(false)}
            className="relative z-[201] block shrink-0 transition-opacity duration-200 hover:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4"
          >
            <h1 className="font-mabrypro text-[54px] font-normal uppercase leading-[0.78] tracking-[-0.075em] md:text-[72px] lg:text-[76px]">
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
            className="relative z-[201] shrink-0 md:hidden"
          >
            <div className="flex h-4 w-7 flex-col justify-between">
              <span
                className={`block h-[1.5px] w-full bg-black transition-transform duration-200 ${
                  isOpen ? "translate-y-[7px] rotate-45" : ""
                }`}
              />
              <span
                className={`block h-[1.5px] w-full bg-black transition-opacity duration-200 ${
                  isOpen ? "opacity-0" : "opacity-100"
                }`}
              />
              <span
                className={`block h-[1.5px] w-full bg-black transition-transform duration-200 ${
                  isOpen ? "-translate-y-[7px] -rotate-45" : ""
                }`}
              />
            </div>
          </button>
        </div>

        {/* Desktop nav — always visible at md and up */}
        <nav
          aria-label="Primary navigation"
          className="
            hidden
            md:mt-3
            md:flex
            md:items-center
            md:justify-end
            md:gap-x-9
            font-editorial
            text-[11px]
            font-normal
            uppercase
            leading-none
            tracking-[0.12em]
          "
        >
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="transition-opacity duration-200 hover:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4"
            >
              {link.label}
            </Link>
          ))}

          <a
            href={`mailto:${email}`}
            className="transition-opacity duration-200 hover:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4"
          >
            Contact
          </a>
        </nav>
      </div>

      {/* =====================================================
          MOBILE SLIDE-DOWN NAVIGATION
          Same visual language as AnimatedHero's mobile menu:
          large stacked links, hairline dividers, email footer.
          ===================================================== */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ y: "-100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "-100%", opacity: 0 }}
            transition={{
              y: { type: "spring", stiffness: 120, damping: 26, mass: 1.4 },
              opacity: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
            }}
            className="
              fixed
              inset-0
              z-[190]
              flex
              flex-col
              justify-start
              bg-white
              px-4
              pt-[350px]
              text-black
              md:hidden
            "
          >
            <motion.nav
              aria-label="Mobile navigation"
              variants={menuContainer}
              initial="hidden"
              animate="visible"
              className="
                flex
                flex-col
                border-t
                border-black/15
                font-mabrypro
                uppercase
              "
            >
              {navLinks.map((link) => (
                <motion.div
                  key={link.href}
                  variants={menuItem}
                  className="border-b border-black/15"
                >
                  <Link
                    href={link.href}
                    onClick={() => setIsOpen(false)}
                    className="
                      block
                      py-5
                      text-[10vw]
                      font-normal
                      leading-[0.95]
                      tracking-[-0.03em]
                      transition-opacity
                      duration-200
                      hover:opacity-50
                      focus-visible:outline
                      focus-visible:outline-2
                      focus-visible:outline-offset-4
                    "
                  >
                    {link.label}
                  </Link>
                </motion.div>
              ))}

              <motion.div
                variants={menuItem}
                className="border-b border-black/15"
              >
                <a
                  href={`mailto:${email}`}
                  onClick={() => setIsOpen(false)}
                  className="
                    block
                    py-5
                    text-[10vw]
                    font-normal
                    leading-[0.95]
                    tracking-[-0.03em]
                    transition-opacity
                    duration-200
                    hover:opacity-50
                    focus-visible:outline
                    focus-visible:outline-2
                    focus-visible:outline-offset-4
                  "
                >
                  Contact
                </a>
              </motion.div>
            </motion.nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
