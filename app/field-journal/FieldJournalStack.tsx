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
  if (!date) {
    return "";
  }

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
        <div className="absolute inset-0 flex items-center justify-center px-4 md:px-8">
          <div className="relative h-[84vh] w-full">
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

              const resolvedMediaType =
                entry.mediaType ||
                (entry.videoUrl ? "video" : entry.pdfUrl ? "pdf" : "image");

              return (
                <article
                  key={entry._id}
                  className="absolute left-1/2 top-1/2 grid w-[92vw] max-w-[1280px] grid-cols-1 items-center gap-4 transition-[transform,opacity] duration-500 ease-out md:grid-cols-[150px_minmax(0,760px)_220px] md:gap-8"
                  style={style}
                >
                  {/* Date — left side on desktop */}
                  <div className="order-2 md:order-1 md:self-center md:text-right"></div>

                  {/* Media */}
                  <div className="order-2 flex h-[58vh] min-h-0 w-full items-center justify-center md:order-2 md:h-[68vh]">
                    {resolvedMediaType === "image" && entry.imageUrl && (
                      <div className="relative h-full w-full">
                        <Image
                          loader={sanityImageLoader}
                          src={entry.imageUrl}
                          alt={
                            entry.alt || entry.caption || "Field journal image"
                          }
                          fill
                          sizes="(max-width: 768px) 92vw, 60vw"
                          className="object-contain"
                        />
                      </div>
                    )}

                    {resolvedMediaType === "video" && entry.videoUrl && (
                      <video
                        src={entry.videoUrl}
                        autoPlay
                        muted
                        loop
                        playsInline
                        preload="metadata"
                        className="block max-h-full max-w-full object-contain"
                      >
                        Your browser does not support video playback.
                      </video>
                    )}

                    {resolvedMediaType === "pdf" && entry.pdfUrl && (
                      <div className="flex h-full w-full items-center justify-center border border-black bg-white p-8">
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
                  </div>

                  {/* Writing — right side on desktop */}
                  <div className="order-3 font-dean md:self-center">
                    {entry.date && (
                      <time
                        dateTime={entry.date}
                        className="block font-mabrypro text-[12px] uppercase leading-relaxed tracking-[0.12em]"
                      >
                        {formatDate(entry.date)}
                      </time>
                    )}
                    {entry.caption && (
                      <h2 className="mb-2 text-[25px] uppercase tracking-[0.12em]">
                        {entry.caption}
                      </h2>
                    )}

                    {entry.writing?.length ? (
                      <div className="text-[35px] leading-relaxed">
                        <PortableText value={entry.writing} />
                      </div>
                    ) : null}
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
