"use client";

import Image, { type ImageLoaderProps } from "next/image";
import { useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";
import { PortableText } from "@portabletext/react";
import type { PortableTextBlock } from "@portabletext/types";

function sanityImageLoader({ src, width, quality }: ImageLoaderProps): string {
  const url = new URL(src);
  url.searchParams.set("w", String(width));
  url.searchParams.set("fit", "max");
  url.searchParams.set("auto", "format");
  url.searchParams.set("q", String(quality ?? 80));
  return url.toString();
}

export type FieldJournalEntry = {
  _id: string;
  mediaType?: "image" | "video" | "pdf";
  imageUrl?: string;
  videoUrl?: string;
  videoMimeType?: string;
  pdfUrl?: string;
  pdfFilename?: string;
  alt?: string;
  caption?: string;
  writing?: PortableTextBlock[];
  date?: string;
};

type FieldJournalStackProps = {
  entries: FieldJournalEntry[];
};

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function formatDate(date?: string) {
  if (!date) return "";
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${date}T00:00:00Z`));
}

export default function FieldJournalStack({ entries }: FieldJournalStackProps) {
  const sectionRef = useRef<HTMLElement | null>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let frame: number | null = null;

    function updateProgress() {
      if (!sectionRef.current || entries.length === 0) return;

      const sectionTop =
        sectionRef.current.getBoundingClientRect().top + window.scrollY;
      const y = window.scrollY - sectionTop;
      const rawProgress = y / window.innerHeight;

      setProgress(clamp(rawProgress, 0, Math.max(entries.length - 1, 0)));
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
      if (frame !== null) window.cancelAnimationFrame(frame);
    };
  }, [entries.length]);

  if (entries.length === 0) return null;

  const lastIndex = entries.length - 1;
  const windowStart = Math.max(0, Math.floor(progress) - 1);
  const windowEnd = Math.min(lastIndex, Math.floor(progress) + 2);

  return (
    <section
      ref={sectionRef}
      className="relative bg-white"
      style={{ height: `${entries.length * 100}vh` }}
    >
      <div className="sticky top-0 h-screen overflow-hidden bg-white">
        {/* Scroll indicator */}
        <div
          className="pointer-events-none absolute bottom-8 left-1/2 z-[60] flex -translate-x-1/2 flex-col items-center gap-2 transition-opacity duration-300"
          style={{ opacity: clamp(1 - progress * 4, 0, 1) }}
        >
          <span className="font-mabrypro text-[11px] uppercase tracking-[0.14em] text-black/50">
            Scroll
          </span>
          <span className="h-8 w-px animate-scroll-line bg-black/30" />
        </div>

        {entries.map((entry, index) => {
          if (index < windowStart || index > windowEnd) return null;

          // -1 = fully faded out before its turn, 0 = fully in view, 1 = fully faded out after its turn
          const delta = clamp(progress - index, -1, 1);

          const imageOnRight = index % 2 === 0;

          const resolvedMediaType =
            entry.mediaType ||
            (entry.videoUrl ? "video" : entry.pdfUrl ? "pdf" : "image");

          const notesBlock = (
            <div className="flex h-full w-full flex-col justify-end p-6 font-dean text-black md:p-10 lg:p-14">
              {entry.date && (
                <time
                  dateTime={entry.date}
                  className="block font-mabrypro text-[10px] uppercase leading-relaxed tracking-[0.14em] text-black/60 md:text-[11px]"
                >
                  {formatDate(entry.date)}
                </time>
              )}

              {entry.caption && (
                <h2 className="mb-3 mt-1 text-[28px] uppercase leading-tight tracking-[0.08em] md:text-[26px]">
                  {entry.caption}
                </h2>
              )}

              {entry.writing?.length ? (
                <div className="max-w-[52ch] text-[15px] leading-[1.65] text-black md:text-[16px]">
                  <PortableText
                    value={entry.writing}
                    components={{
                      block: {
                        normal: ({ children }) => (
                          <p className="mb-4 last:mb-0">{children}</p>
                        ),
                      },
                      marks: {
                        em: ({ children }) => (
                          <em className="italic">{children}</em>
                        ),
                        strong: ({ children }) => (
                          <strong className="font-semibold">{children}</strong>
                        ),
                      },
                    }}
                  />
                </div>
              ) : null}
            </div>
          );

          const mediaBlock = (
            <div className="relative h-full w-full bg-[#fffff]">
              {resolvedMediaType === "image" && entry.imageUrl && (
                <Image
                  loader={sanityImageLoader}
                  src={entry.imageUrl}
                  alt={entry.alt || entry.caption || "Field journal image"}
                  fill
                  sizes="(max-width: 767px) 100vw, 50vw"
                  priority={index === 0}
                  className="object-contain"
                />
              )}

              {resolvedMediaType === "video" && entry.videoUrl && (
                <video
                  src={entry.videoUrl}
                  autoPlay
                  muted
                  loop
                  playsInline
                  preload="metadata"
                  className="absolute inset-0 h-full w-full object-contain"
                >
                  Your browser does not support video playback.
                </video>
              )}

              {resolvedMediaType === "pdf" && entry.pdfUrl && (
                <div className="flex h-full w-full items-center justify-center p-8 text-[#1f1a13]">
                  <a
                    href={entry.pdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-center font-mabrypro text-[11px] uppercase tracking-[0.12em] underline underline-offset-4 transition-opacity hover:opacity-50"
                  >
                    Open {entry.pdfFilename || "PDF"}
                  </a>
                </div>
              )}
            </div>
          );

          return (
            <article
              key={entry._id}
              className="absolute inset-0 transition-opacity duration-500 ease-out"
              style={
                {
                  zIndex: entries.length - Math.abs(index - progress),
                  opacity: clamp(1 - Math.abs(delta) * 1.4, 0, 1),
                  pointerEvents: Math.abs(delta) < 0.5 ? "auto" : "none",
                } as CSSProperties
              }
            >
              <div className="relative flex h-full w-full flex-col bg-white md:flex-row">
                {imageOnRight ? (
                  <>
                    <div className="h-1/2 w-full md:h-full md:w-1/2">
                      {notesBlock}
                    </div>
                    <div className="h-1/2 w-full md:h-full md:w-1/2">
                      {mediaBlock}
                    </div>
                  </>
                ) : (
                  <>
                    <div className="h-1/2 w-full md:h-full md:w-1/2">
                      {mediaBlock}
                    </div>
                    <div className="h-1/2 w-full md:h-full md:w-1/2">
                      {notesBlock}
                    </div>
                  </>
                )}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
