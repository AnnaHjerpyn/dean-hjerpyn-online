"use client";

import Image, { type ImageLoaderProps } from "next/image";

function sanityImageLoader({ src, width, quality }: ImageLoaderProps): string {
  const url = new URL(src);

  url.searchParams.set("w", String(width));
  url.searchParams.set("fit", "max");
  url.searchParams.set("auto", "format");
  url.searchParams.set("q", String(quality ?? 80));

  return url.toString();
}

import { useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";

type FieldJournalEntry = {
  _id: string;
  mediaType?: "image" | "video" | "pdf";

  imageUrl?: string;

  videoUrl?: string;
  videoMimeType?: string;

  pdfUrl?: string;
  pdfFilename?: string;

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

    window.addEventListener("scroll", onScroll, {
      passive: true,
    });

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
      style={{
        height: `${entries.length * 100}vh`,
      }}
    >
      <div className="sticky top-0 h-screen overflow-hidden bg-white">
        <div className="absolute inset-0 flex items-center justify-center px-4">
          <div className="relative h-[80vh] w-full">
            {entries.map((entry, index) => {
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

              /*
               * Existing entries without mediaType are treated as images.
               * The URL checks also provide a fallback if mediaType is missing.
               */
              const resolvedMediaType =
                entry.mediaType ||
                (entry.videoUrl ? "video" : entry.pdfUrl ? "pdf" : "image");

              return (
                <article
                  key={entry._id}
                  className="absolute left-1/2 top-1/2 flex w-[78vw] max-w-[860px] justify-center transition-[transform,opacity] duration-500 ease-out md:w-[64vw]"
                  style={style}
                >
                  {/* Image */}
                  {resolvedMediaType === "image" && entry.imageUrl && (
                    <div className="relative mx-auto h-[65vh] w-full max-w-[760px]">
                      <Image
                        loader={sanityImageLoader}
                        src={entry.imageUrl}
                        alt={
                          entry.alt || entry.caption || "Field journal image"
                        }
                        fill
                        sizes="(max-width: 768px) 90vw, 58vw"
                        className="object-contain"
                      />
                    </div>
                  )}

                  {/* Video */}
                  {resolvedMediaType === "video" && entry.videoUrl && (
                    <div className="flex h-[65vh] w-full max-w-[760px] items-center justify-center">
                      <video
                        key={entry.videoUrl}
                        controls
                        playsInline
                        preload="metadata"
                        className="max-h-[65vh] w-full object-contain"
                      >
                        <source
                          src={entry.videoUrl}
                          type={entry.videoMimeType || "video/mp4"}
                        />
                        Your browser does not support video playback.
                      </video>
                    </div>
                  )}

                  {/* PDF */}
                  {resolvedMediaType === "pdf" && entry.pdfUrl && (
                    <div className="flex h-[65vh] w-full max-w-[760px] items-center justify-center border border-black bg-white p-8">
                      <a
                        href={entry.pdfUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-center text-[11px] uppercase tracking-[0.12em] underline underline-offset-4 transition-opacity hover:opacity-50"
                      >
                        Open {entry.pdfFilename || "PDF"}
                      </a>
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
