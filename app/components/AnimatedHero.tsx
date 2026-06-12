"use client";

import Link from "next/link";
import { useRef } from "react";
import {
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
      delayChildren: 0.15,
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
      duration: 0.7,
      ease: [0.22, 1, 0.36, 1] as const,
    },
  },
};

export default function AnimatedHero({
  headline,
  email,
  plantDrawings = [],
}: AnimatedHeroProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const shouldReduceMotion = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 110,
    damping: 28,
    mass: 0.3,
  });

  const deanX = useTransform(
    smoothProgress,
    [0, 1],
    [0, shouldReduceMotion ? 0 : 70]
  );

  const hjerpynX = useTransform(
    smoothProgress,
    [0, 1],
    [0, shouldReduceMotion ? 0 : -55]
  );

  const introY = useTransform(
    smoothProgress,
    [0, 1],
    [0, shouldReduceMotion ? 0 : -90]
  );

  const introScale = useTransform(
    smoothProgress,
    [0, 1],
    [1, shouldReduceMotion ? 1 : 0.97]
  );

  const introOpacity = useTransform(
    smoothProgress,
    [0, 0.75, 1],
    [1, 0.85, 0.35]
  );

  const locationX = useTransform(
    smoothProgress,
    [0, 1],
    [0, shouldReduceMotion ? 0 : 35]
  );

  const words = headline.trim().split(/\s+/);

  return (
    <>
      <header>
        <Link
          href="/"
          aria-label="Dean Hjerpyn homepage"
          className="fixed left-4 top-4 z-50 mix-blend-difference text-white md:left-8 md:top-8"
        >
          <motion.span
            style={{ x: deanX }}
            className="block font-editorial text-[24px] font-normal uppercase leading-[0.86] tracking-[-0.05em] will-change-transform md:text-[2.2vw]"
          >
            Dean
          </motion.span>

          <motion.span
            style={{ x: hjerpynX }}
            className="ml-[25px] block font-editorial text-[24px] font-normal uppercase leading-[0.86] tracking-[-0.05em] will-change-transform md:ml-[1.8vw] md:text-[2.2vw]"
          >
            Hjerpyn
          </motion.span>
        </Link>

        <motion.nav
          initial={shouldReduceMotion ? false : { opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: shouldReduceMotion ? 0 : 0.7,
            delay: shouldReduceMotion ? 0 : 0.45,
            ease: [0.22, 1, 0.36, 1],
          }}
          className="fixed right-4 top-4 z-50 flex gap-4 font-editorial text-[9px] font-normal uppercase tracking-[0.15em] mix-blend-difference text-white md:right-8 md:top-8 md:gap-7 md:text-[10px]"
        >
          <a href="#work" className="transition-opacity hover:opacity-50">
            Work
          </a>

          <a href="#about" className="transition-opacity hover:opacity-50">
            About
          </a>

          <a
            href={`mailto:${email}`}
            className="transition-opacity hover:opacity-50"
          >
            Contact
          </a>
        </motion.nav>
      </header>

      <section
        ref={sectionRef}
        className="relative min-h-[82svh] overflow-hidden pb-10 pt-28 md:pb-14 md:pt-36"
      >
        {/* Animated plant drawings behind the text */}
        <PlantGarden drawings={plantDrawings} />

        {/* Animated introduction */}
        <motion.div
          style={{
            y: introY,
            scale: introScale,
            opacity: introOpacity,
          }}
          className="relative z-10 ml-auto flex min-h-[62svh] w-full origin-bottom-right flex-col justify-end will-change-transform md:w-[68%]"
        >
          <motion.p
            variants={wordsContainer}
            initial={shouldReduceMotion ? "visible" : "hidden"}
            animate="visible"
            className="font-editorial text-[clamp(1.65rem,2.65vw,3.1rem)] font-normal leading-[1.02] tracking-[-0.04em]"
          >
            {words.map((word, index) => (
              <span
                key={`${word}-${index}`}
                className="mr-[0.24em] inline-block overflow-hidden align-bottom"
              >
                <motion.span variants={wordAnimation} className="inline-block">
                  {word}
                </motion.span>
              </span>
            ))}
          </motion.p>

          <motion.p
            style={{ x: locationX }}
            initial={shouldReduceMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{
              duration: shouldReduceMotion ? 0 : 0.7,
              delay: shouldReduceMotion ? 0 : 1,
              ease: "easeOut",
            }}
            className="mt-9 font-editorial text-[8px] font-normal uppercase tracking-[0.17em] will-change-transform md:mt-12 md:text-[9px]"
          >
            Columbus, Ohio / Landscape Architecture
          </motion.p>
        </motion.div>
      </section>
    </>
  );
}
