"use client";

import Link from "next/link";
import { useLayoutEffect, useRef, useState } from "react";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "motion/react";

import PlantGarden from "./PlantGarden";

type PlantDrawing = {
  url: string;
  alt?: string;
};

type AnimatedHeroProps = {
  headline: string;
  email: string;
  plantDrawings?: PlantDrawing[];
};

const wordsContainer = {
  hidden: {},
  visible: {
    transition: {
      delayChildren: 0.2,
      staggerChildren: 0.025,
    },
  },
};

const wordAnimation = {
  hidden: {
    y: "110%",
    opacity: 0,
  },
  visible: {
    y: "0%",
    opacity: 1,
    transition: {
      duration: 0.75,
      ease: [0.22, 1, 0.36, 1] as const,
    },
  },
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

const navLinks = [
  { href: "/work", label: "Work" },
  { href: "/field-journal", label: "Field Journal" },
  { href: "/cv", label: "CV" },
];

export default function AnimatedHero({
  headline,
  email,
  plantDrawings = [],
}: AnimatedHeroProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const deanRef = useRef<HTMLSpanElement>(null);

  const [deanWidth, setDeanWidth] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const shouldReduceMotion = useReducedMotion();

  useLayoutEffect(() => {
    const measureDean = () => {
      if (!deanRef.current) return;

      setDeanWidth(deanRef.current.getBoundingClientRect().width);
    };

    measureDean();

    const resizeObserver = new ResizeObserver(measureDean);

    if (deanRef.current) {
      resizeObserver.observe(deanRef.current);
    }

    window.addEventListener("resize", measureDean);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", measureDean);
    };
  }, []);

  // Lock body scroll while the mobile menu is open.
  useLayoutEffect(() => {
    if (isMenuOpen) {
      const previousOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";

      return () => {
        document.body.style.overflow = previousOverflow;
      };
    }
  }, [isMenuOpen]);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 110,
    damping: 28,
    mass: 0.3,
  });

  const hjerpynX = useTransform(
    smoothProgress,
    [0, 1],
    [0, shouldReduceMotion ? 0 : deanWidth]
  );

  const headlineY = useTransform(
    smoothProgress,
    [0, 1],
    [0, shouldReduceMotion ? 0 : -90]
  );

  const headlineScale = useTransform(
    smoothProgress,
    [0, 1],
    [1, shouldReduceMotion ? 1 : 0.97]
  );

  const headlineOpacity = useTransform(
    smoothProgress,
    [0, 0.75, 1],
    [1, 0.82, 0.35]
  );

  const words = headline.trim().split(/\s+/);

  return (
    <section
      ref={sectionRef}
      className="
        relative
        min-h-[100svh]
        overflow-hidden
        bg-white
        text-black
      "
    >
      {/* =====================================================
          BOTANICAL BACKGROUND
          ===================================================== */}
      <PlantGarden drawings={plantDrawings} />

      {/* =====================================================
          SITE IDENTITY + NAV
          ===================================================== */}
      <header
        className="
          fixed
          inset-x-0
          top-0
          z-[200]
          text-white
          mix-blend-exclusion
        "
      >
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
              href="/"
              aria-label="Dean Hjerpyn homepage"
              onClick={() => setIsMenuOpen(false)}
              className="
                relative
                z-[201]
                block
                min-w-0
                shrink-0
                transition-opacity
                duration-200
                hover:opacity-40
                focus-visible:outline
                focus-visible:outline-2
                focus-visible:outline-offset-4
              "
            >
              <h1 className="font-mabrypro text-[54px] font-normal uppercase leading-[0.78] tracking-[-0.075em] md:text-[72px] lg:text-[76px]">
                <span ref={deanRef} className="inline-block">
                  Dean
                </span>

                <motion.span
                  style={{ x: hjerpynX }}
                  className="
                    block
                    will-change-transform
                  "
                >
                  Hjerpyn
                </motion.span>
              </h1>
            </Link>

            {/* Hamburger / close toggle — mobile only */}
            <button
              type="button"
              onClick={() => setIsMenuOpen((prev) => !prev)}
              aria-label={isMenuOpen ? "Close menu" : "Open menu"}
              aria-expanded={isMenuOpen}
              className="relative z-[201] shrink-0 md:hidden"
            >
              <div className="flex h-4 w-7 flex-col justify-between">
                <span
                  className={`block h-[1.5px] w-full bg-white transition-transform duration-200 ${
                    isMenuOpen ? "translate-y-[7px] rotate-45" : ""
                  }`}
                />
                <span
                  className={`block h-[1.5px] w-full bg-white transition-opacity duration-200 ${
                    isMenuOpen ? "opacity-0" : "opacity-100"
                  }`}
                />
                <span
                  className={`block h-[1.5px] w-full bg-white transition-transform duration-200 ${
                    isMenuOpen ? "-translate-y-[7px] -rotate-45" : ""
                  }`}
                />
              </div>
            </button>
          </div>

          {/* Desktop nav — always visible at md and up */}
          <motion.nav
            aria-label="Primary navigation"
            initial={shouldReduceMotion ? false : { opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: shouldReduceMotion ? 0 : 0.75,
              delay: shouldReduceMotion ? 0 : 0.45,
              ease: [0.22, 1, 0.36, 1],
            }}
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
                className="
                  transition-opacity
                  duration-200
                  hover:opacity-40
                  focus-visible:outline
                  focus-visible:outline-2
                  focus-visible:outline-offset-4
                "
              >
                {link.label}
              </Link>
            ))}

            <a
              href={`mailto:${email}`}
              className="
                transition-opacity
                duration-200
                hover:opacity-40
                focus-visible:outline
                focus-visible:outline-2
                focus-visible:outline-offset-4
              "
            >
              Contact
            </a>
          </motion.nav>
        </div>
      </header>

      {/* =====================================================
          MOBILE FULL-SCREEN MENU
          Sits directly over the plant garden with no opaque
          backdrop, so the illustrations stay fully visible.
          ===================================================== */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={shouldReduceMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="
              fixed
              inset-0
              z-[190]
              flex
              flex-col
              justify-start
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
                    onClick={() => setIsMenuOpen(false)}
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
                  onClick={() => setIsMenuOpen(false)}
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

      {/* =====================================================
          CENTER CONTENT
          ===================================================== */}
      <div
        className="
          relative
          z-20
          flex
          min-h-[100svh]
          items-center
          justify-center
          px-6
          md:px-10
        "
      >
        <motion.div
          style={{
            y: headlineY,
            scale: headlineScale,
            opacity: headlineOpacity,
          }}
          className="
            w-full
            max-w-[820px]
            translate-y-[2vh]
            will-change-transform
            md:translate-x-[7vw]
            md:translate-y-[4vh]
            lg:max-w-[860px]
          "
        >
          <motion.p
            variants={wordsContainer}
            initial={shouldReduceMotion ? "visible" : "hidden"}
            animate="visible"
            className="
              font-sabon
              text-[27px]
              font-normal
              leading-[1.05]
              tracking-[-0.035em]
              sm:text-[30px]
              md:text-[35px]
              lg:text-[37px]
            "
          >
            {words.map((word, index) => (
              <span
                key={`${word}-${index}`}
                className="
                  mr-[0.24em]
                  inline-block
                  overflow-hidden
                  align-bottom
                "
              >
                <motion.span variants={wordAnimation} className="inline-block">
                  {word}
                </motion.span>
              </span>
            ))}
          </motion.p>
        </motion.div>
      </div>
    </section>
  );
}
