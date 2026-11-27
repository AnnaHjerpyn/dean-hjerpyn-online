"use client";

/* eslint-disable @next/next/no-img-element */

import { useEffect, useRef, useState } from "react";

type Img = { _key: string; url: string; alt?: string };

type ScrollColumnProps = {
  label: string;
  images: Img[];
  /** Optional short line shown in the header's right-hand column. */
  description?: string;
};

// 7 -> "007", numbered from 000 like the clippings index on ground-cover.com
const pad = (value: number) => String(value).padStart(3, "0");

// How many entries the index list shows at once.
const WINDOW_SIZE = 3;

export default function ScrollColumn({
  label,
  images,
  description,
}: ScrollColumnProps) {
  const scrollerRef = useRef<HTMLElement>(null);
  const [current, setCurrent] = useState(0);

  const lastIndex = images.length - 1;

  // The index list shows a window of entries around the current image,
  // newest-number-first, with "..." where more entries exist.
  const windowStart = Math.min(
    Math.max(current - 1, 0),
    Math.max(images.length - WINDOW_SIZE, 0)
  );
  const windowEnd = Math.min(windowStart + WINDOW_SIZE - 1, lastIndex);

  const visibleIndexes: number[] = [];
  for (let index = windowEnd; index >= windowStart; index -= 1) {
    visibleIndexes.push(index);
  }

  function scrollToImage(index: number) {
    scrollerRef.current
      ?.querySelector(`[data-index="${index}"]`)
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  // Keep the header's number in step with whichever image crosses the middle
  // of the column (desktop: the column scrolls; mobile: the page scrolls).
  useEffect(() => {
    const scroller = scrollerRef.current;

    if (!scroller || images.length === 0) {
      return;
    }

    const query = window.matchMedia("(min-width: 768px)");
    let observer: IntersectionObserver | null = null;

    const setup = () => {
      observer?.disconnect();

      const next = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) {
              return;
            }

            const index = Number((entry.target as HTMLElement).dataset.index);

            if (!Number.isNaN(index)) {
              setCurrent(index);
            }
          });
        },
        {
          root: query.matches ? scroller : null,
          rootMargin: "-45% 0px -45% 0px",
          threshold: 0,
        }
      );

      scroller
        .querySelectorAll<HTMLElement>("[data-index]")
        .forEach((element) => next.observe(element));

      observer = next;
    };

    setup();
    query.addEventListener("change", setup);

    return () => {
      observer?.disconnect();
      query.removeEventListener("change", setup);
    };
  }, [images]);

  return (
    <section
      ref={scrollerRef}
      className="no-scrollbar relative md:h-[100svh] md:overflow-y-auto"
    >
      {/* Sticky header: your original overlaid serif label, with the
          ground-cover touches (bullet, live number, clickable index).
          It has no height of its own, so the first image starts at the top
          of the column, and the blend keeps the white text readable. */}
      <header className="pointer-events-none sticky top-0 z-20 h-0 overflow-visible font-sabon italic text-[16px] font-normal leading-[1.35] text-white">
        <div className="px-4 pt-3">
          <div className="flex items-baseline justify-between gap-4">
            <h2 className="font-[inherit] text-[length:inherit] font-normal">
              {label}
            </h2>

            <span
              className="tabular-nums"
              aria-label={`Image ${current + 1} of ${images.length}`}
            >
              {pad(current)}
            </span>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-x-4 text-[14px]">
            {images.length > 0 && (
              <ul aria-label={`${label} index`} className="leading-[1.4]">
                {windowEnd < lastIndex && (
                  <li aria-hidden="true" className="leading-[0.9]">
                    ...
                  </li>
                )}

                {visibleIndexes.map((index) => (
                  <li key={index}>
                    <button
                      type="button"
                      aria-label={`Go to image ${index + 1}`}
                      aria-current={index === current ? "true" : undefined}
                      onClick={() => scrollToImage(index)}
                      className={`pointer-events-auto tabular-nums transition-opacity duration-200 hover:opacity-50 ${
                        index === current ? "underline underline-offset-4" : ""
                      }`}
                    >
                      {pad(index)}
                    </button>
                  </li>
                ))}

                {windowStart > 0 && (
                  <li aria-hidden="true" className="leading-[0.9]">
                    ...
                  </li>
                )}
              </ul>
            )}

            {description && <p className="text-right">{description}</p>}
          </div>
        </div>
      </header>

      {images.map((img, index) => (
        <img
          key={img._key}
          data-index={index}
          src={img.url}
          alt={img.alt ?? ""}
          loading="lazy"
          className="block w-full"
        />
      ))}
    </section>
  );
}
