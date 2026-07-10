"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";

type FieldJournalEntry = {
  _id: string;
  imageUrl?: string;
  alt?: string;
  caption?: string;
  date?: string;
};

type FieldJournalStackProps = {
  entries: FieldJournalEntry[];
};

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

export default function FieldJournalStack({ entries }: FieldJournalStackProps) {
  const sectionRef = useRef<HTMLElement | null>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let frame: number | null = null;

    function updateProgress() {
      if (!sectionRef.current || entries.length === 0) {
        return;
      }

      const sectionTop =
        sectionRef.current.getBoundingClientRect().top + window.scrollY;

      const y = window.scrollY - sectionTop;
      const rawProgress = y / window.innerHeight;

      setProgress(clamp(rawProgress, 0, entries.length - 1));
      frame = null;
    }

    function onScroll() {
      if (frame !== null) {
        return;
      }

      frame = window.requestAnimationFrame(updateProgress);
    }

    updateProgress();

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", updateProgress);

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", updateProgress);

      if (frame !== null) {
        window.cancelAnimationFrame(frame);
      }
    };
  }, [entries.length]);

  if (entries.length === 0) {
    return null;
  }

  const activeIndex = Math.round(progress);

  return (
    <section
      ref={sectionRef}
      className="relative bg-white"
      style={{ height: `${entries.length * 100}vh` }}
    >
      <div className="sticky top-0 h-screen overflow-hidden bg-white">
        <div className="absolute inset-0 flex items-center justify-center px-4">
          <div className="relative h-[80vh] w-full">
            {entries.map((entry, index) => {
              /*
               * Keep only nearby images mounted:
               * one image behind and three images ahead.
               */
              const shouldRender =
                index >= activeIndex - 1 && index <= activeIndex + 3;

              if (!shouldRender) {
                return null;
              }

              const delta = index - progress;
              const isPast = delta < -0.75;
              const isTooFarAhead = delta > 5;

              const scale =
                delta < 0 ? 1.08 + Math.abs(delta) * 0.035 : 1 - delta * 0.075;

              const y = delta < 0 ? 160 + Math.abs(delta) * 90 : -delta * 40;

              const opacity = isPast || isTooFarAhead ? 0 : 1;
              const zIndex = Math.round(100 - Math.abs(delta) * 10);

              const style: CSSProperties = {
                transform: `translate(-50%, calc(-50% + ${y}px)) scale(${scale})`,
                zIndex,
                opacity,
                pointerEvents: opacity === 0 ? "none" : "auto",
              };

              return (
                <article
                  key={entry._id}
                  className="absolute left-1/2 top-1/2 flex w-[78vw] max-w-[860px] justify-center transition-[transform,opacity] duration-500 ease-out md:w-[64vw]"
                  style={style}
                >
                  {entry.imageUrl && (
                    <div className="relative mx-auto h-[65vh] w-full max-w-[760px]">
                      <Image
                        src={entry.imageUrl}
                        alt={
                          entry.alt || entry.caption || "Field journal image"
                        }
                        fill
                        sizes="(max-width: 767px) 92vw, (max-width: 1200px) 65vw, 760px"
                        quality={75}
                        preload={index === 0}
                        loading={index === 0 ? "eager" : "lazy"}
                        className="object-contain grayscale-0 transition duration-500 hover:grayscale"
                      />
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
