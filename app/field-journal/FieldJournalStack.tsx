"use client";

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
      if (!sectionRef.current) return;

      const sectionTop =
        sectionRef.current.getBoundingClientRect().top + window.scrollY;

      const y = window.scrollY - sectionTop;
      const rawProgress = y / window.innerHeight;

      setProgress(clamp(rawProgress, 0, entries.length - 1));
      frame = null;
    }

    function onScroll() {
      if (frame !== null) return;
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
              const delta = index - progress;

              const isPast = delta < -0.75;
              const isTooFarAhead = delta > 5;

              const scale =
                delta < 0 ? 1.08 + Math.abs(delta) * 0.035 : 1 - delta * 0.075;

              const y = delta < 0 ? 160 + Math.abs(delta) * 90 : 0 - delta * 40;

              const opacity = isPast || isTooFarAhead ? 0 : 1;

              const zIndex = Math.round(100 - Math.abs(delta) * 10);

              const style: CSSProperties = {
                transform: `translate(-50%, calc(-50% + ${y}px)) scale(${scale})`,
                zIndex,
                opacity,
              };

              return (
                <article
                  key={entry._id}
                  className="absolute left-1/2 top-1/2 flex w-[78vw] max-w-[860px] justify-center transition-all duration-500 ease-out md:w-[64vw]"
                  style={style}
                >
                  {entry.imageUrl && (
                    <img
                      src={entry.imageUrl}
                      alt={entry.alt || entry.caption || "Field journal image"}
                      loading="lazy"
                      className="block h-auto max-h-[68vh] w-auto max-w-full object-contain transition duration-500 hover:grayscale"
                    />
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
