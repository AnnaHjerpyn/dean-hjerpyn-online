"use client";

import Link from "next/link";
import { useLayoutEffect, useRef, useState } from "react";
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

const linkContainer = {
  hidden: {},
  visible: {
    transition: {
      delayChildren: 0.8,
      staggerChildren: 0.12,
    },
  },
};

const linkAnimation = {
  hidden: {
    opacity: 0,
    y: 10,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.65,
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
  const deanRef = useRef<HTMLSpanElement>(null);

  const [deanWidth, setDeanWidth] = useState(0);
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
      className="relative min-h-screen overflow-hidden bg-white text-black"
    >
      {/* Botanical background */}
      <PlantGarden drawings={plantDrawings} />

      {/* Left identity / navigation */}
      <header className="fixed left-8 top-8 z-50 md:left-20 md:top-16">
        <Link href="/" aria-label="Dean Hjerpyn homepage" className="block">
          <span className="block overflow-visible font-editorial text-[54px] font-normal uppercase leading-[0.78] tracking-[-0.075em] md:text-[76px]">
            <span ref={deanRef} className="inline-block">
              Dean
            </span>
          </span>

          <motion.span
            style={{ x: hjerpynX }}
            className="block font-editorial text-[54px] font-normal uppercase leading-[0.78] tracking-[-0.075em] will-change-transform md:text-[76px]"
          >
            Hjerpyn
          </motion.span>
        </Link>

        <motion.nav
          initial={shouldReduceMotion ? false : { opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: shouldReduceMotion ? 0 : 0.75,
            delay: shouldReduceMotion ? 0 : 0.45,
            ease: [0.22, 1, 0.36, 1],
          }}
          className="mt-4 flex flex-col gap-8 font-editorial text-[16px] font-normal uppercase leading-none tracking-[0.02em] md:text-[18px]"
        >
          <a
            href="#about"
            className="w-fit transition-opacity hover:opacity-50"
          >
            About
          </a>

          <a
            href={`mailto:${email}`}
            className="w-fit transition-opacity hover:opacity-50"
          >
            Contact
          </a>
        </motion.nav>
      </header>

      {/* Center headline / page navigation */}
      <div className="relative z-10 flex min-h-screen items-center justify-center px-6">
        <motion.div
          style={{
            y: headlineY,
            scale: headlineScale,
            opacity: headlineOpacity,
          }}
          className="w-full max-w-[760px] translate-y-[12vh] will-change-transform md:translate-x-[8vw] md:translate-y-[14vh]"
        >
          <motion.p
            variants={wordsContainer}
            initial={shouldReduceMotion ? "visible" : "hidden"}
            animate="visible"
            className="font-sabon text-[27px] font-normal leading-[1.05] tracking-[-0.035em] md:text-[36px]"
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

          <motion.nav
            variants={linkContainer}
            initial={shouldReduceMotion ? "visible" : "hidden"}
            animate="visible"
            className="mt-6 flex flex-col gap-5 font-editorial text-[16px] font-normal uppercase leading-none tracking-[0.02em] md:text-[18px]"
          >
            <motion.div variants={linkAnimation}>
              <Link
                href="/work"
                className="w-fit transition-opacity hover:opacity-50"
              >
                Work
              </Link>
            </motion.div>

            <motion.div variants={linkAnimation}>
              <Link
                href="/field-journal"
                className="w-fit transition-opacity hover:opacity-50"
              >
                Field Journal
              </Link>
            </motion.div>

            <motion.div variants={linkAnimation}>
              <Link
                href="/cv"
                className="w-fit transition-opacity hover:opacity-50"
              >
                CV
              </Link>
            </motion.div>
          </motion.nav>
        </motion.div>
      </div>
    </section>
  );
}
