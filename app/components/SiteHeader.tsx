"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";

type SiteHeaderProps = {
  title: string;
  href?: string;
  email: string;
  variant?: "fixed" | "inline";
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

const TITLE_CLASSES =
  "font-editorial text-[36px] font-thin leading-none tracking-[-0.07em] whitespace-nowrap sm:text-[48px] md:text-[58px] lg:text-[64px]";

const LINK_CLASSES =
  "transition-opacity duration-200 hover:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4";

export default function SiteHeader({
  title,
  href = "/",
  email,
  variant = "fixed",
}: SiteHeaderProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Work has been removed from the navigation.
  const navLinks = [
    { href: "/cv", label: "CV" },
    { href: "/digital-garden", label: "Digital Garden" },
  ];

  const titleParts = title.trim().split(/\s+/);

  // Lock body scrolling while the mobile menu is open.
  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  /* =====================================================
     INLINE VARIANT
     Used on the homepage.
     No hamburger menu.
     ===================================================== */

  if (variant === "inline") {
    return (
      <header className="px-4 pt-4 text-black md:px-10 md:pt-8">
        <Link
          href={href}
          aria-label={`${title} homepage`}
          className={`block ${LINK_CLASSES}`}
        >
          <h1 className={TITLE_CLASSES}>
            <span className="whitespace-nowrap">{title}</span>
          </h1>
        </Link>

        <nav
          aria-label="Primary navigation"
          className="mt-6 flex flex-wrap items-center gap-x-9 gap-y-3 font-sabon text-[11px] font-normal italic leading-none tracking-[0.12em]"
        >
          <Link href="/cv" className={LINK_CLASSES}>
            cv
          </Link>

          <a href={`mailto:${email}`} className={LINK_CLASSES}>
            contact
          </a>

          <Link href="/digital-garden" className={LINK_CLASSES}>
            digital garden
          </Link>
        </nav>
      </header>
    );
  }

  /* =====================================================
     FIXED VARIANT
     Used for sitewide pages.
     ===================================================== */

  return (
    <>
      {/* Blended title */}
      <div className="fixed left-4 top-4 z-[201] text-white mix-blend-difference md:left-10 md:top-8">
        <Link
          href={href}
          aria-label={`${title} homepage`}
          onClick={() => setIsOpen(false)}
          className={`block ${LINK_CLASSES}`}
        >
          <h1 className={TITLE_CLASSES}>
            {titleParts.map((part, index) => (
              <span key={`${part}-${index}`} className="block">
                {part}
              </span>
            ))}
          </h1>
        </Link>
      </div>

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
            {/* Invisible title spacer */}
            <div
              aria-hidden="true"
              className={`invisible block shrink-0 ${TITLE_CLASSES}`}
            >
              {titleParts.map((part, index) => (
                <span key={`${part}-${index}`} className="block">
                  {part}
                </span>
              ))}
            </div>

            {/* Mobile hamburger */}
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

          {/* Desktop navigation */}
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
              <Link key={link.href} href={link.href} className={LINK_CLASSES}>
                {link.label}
              </Link>
            ))}

            <a href={`mailto:${email}`} className={LINK_CLASSES}>
              Contact
            </a>
          </nav>
        </div>

        {/* Mobile navigation */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ y: "-100%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "-100%", opacity: 0 }}
              transition={{
                y: {
                  type: "spring",
                  stiffness: 120,
                  damping: 26,
                  mass: 1.4,
                },
                opacity: {
                  duration: 0.5,
                  ease: [0.22, 1, 0.36, 1],
                },
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

                {/* Contact */}
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
    </>
  );
}
