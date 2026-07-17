"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";

type GalleryImage = {
  _type: "image";
  _key: string;
  url: string;
  alt?: string;
  caption?: string;
  lqip?: string;
};

type GalleryVideo = {
  _type: "video";
  _key: string;
  url: string;
  caption?: string;
};

type GalleryPdf = {
  _type: "pdf";
  _key: string;
  url: string;
  title?: string;
  filename?: string;
};

type GalleryItem = GalleryImage | GalleryVideo | GalleryPdf;

type GalleryCarouselProps = {
  items: GalleryItem[];
  projectTitle: string;
  intervalMs?: number;
};

export default function GalleryCarousel({
  items,
  projectTitle,
  intervalMs = 2000,
}: GalleryCarouselProps) {
  const total = items.length;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  const touchStartX = useRef<number | null>(null);

  const goTo = useCallback(
    (index: number) => {
      if (total === 0) return;

      setCurrentIndex(((index % total) + total) % total);
    },
    [total]
  );

  const goNext = useCallback(() => {
    setCurrentIndex((previous) => (total > 0 ? (previous + 1) % total : 0));
  }, [total]);

  const goPrev = useCallback(() => {
    setCurrentIndex((previous) =>
      total > 0 ? (previous - 1 + total) % total : 0
    );
  }, [total]);

  /*
   * Keep the current index valid if the gallery contents change.
   */
  useEffect(() => {
    if (total === 0) {
      setCurrentIndex(0);
      return;
    }

    setCurrentIndex((previous) => Math.min(previous, total - 1));
  }, [total]);

  /*
   * Autoplay.
   *
   * Pauses while:
   * - The pointer is over the carousel
   * - A carousel control is focused
   * - The lightbox is open
   */
  useEffect(() => {
    if (total <= 1 || isPaused || isLightboxOpen || intervalMs <= 0) {
      return;
    }

    const timer = window.setInterval(() => {
      setCurrentIndex((previous) => (previous + 1) % total);
    }, intervalMs);

    return () => window.clearInterval(timer);
  }, [total, intervalMs, isPaused, isLightboxOpen]);

  /*
   * Lightbox keyboard navigation and body scroll lock.
   */
  useEffect(() => {
    if (!isLightboxOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsLightboxOpen(false);
      }

      if (event.key === "ArrowRight") {
        goNext();
      }

      if (event.key === "ArrowLeft") {
        goPrev();
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isLightboxOpen, goNext, goPrev]);

  function handleTouchStart(event: React.TouchEvent) {
    touchStartX.current = event.touches[0]?.clientX ?? null;
  }

  function handleTouchEnd(event: React.TouchEvent) {
    if (touchStartX.current === null) return;

    const endX = event.changedTouches[0]?.clientX;

    if (endX === undefined) return;

    const distance = endX - touchStartX.current;

    if (distance > 50) {
      goPrev();
    }

    if (distance < -50) {
      goNext();
    }

    touchStartX.current = null;
  }

  if (total === 0) {
    return null;
  }

  const currentItem = items[currentIndex];

  function renderSlide(item: GalleryItem, isLightbox = false) {
    if (item._type === "image") {
      return (
        <Image
          src={item.url}
          alt={item.alt || `${projectTitle} project image`}
          fill
          sizes="100vw"
          placeholder={item.lqip ? "blur" : undefined}
          blurDataURL={item.lqip}
          priority={!isLightbox && currentIndex === 0}
          className="object-contain"
        />
      );
    }

    if (item._type === "video") {
      return (
        <video
          src={item.url}
          controls
          playsInline
          preload="metadata"
          className="h-full w-full object-contain"
        />
      );
    }

    return (
      <div className="flex h-full w-full items-center justify-center">
        <a
          href={item.url}
          target="_blank"
          rel="noopener noreferrer"
          className="font-mabrypro text-[10px] uppercase tracking-[0.06em] underline underline-offset-4 transition-opacity hover:opacity-40"
        >
          {item.title || item.filename || "View document"}
        </a>
      </div>
    );
  }

  return (
    <>
      <section
        aria-label={`${projectTitle} gallery`}
        className="mx-auto w-full px-4 pb-8 md:px-8 md:pb-12"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onFocusCapture={() => setIsPaused(true)}
        onBlurCapture={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget)) {
            setIsPaused(false);
          }
        }}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div className="relative mx-auto h-[68svh] min-h-[420px] w-full max-w-[1600px] md:h-[76svh]">
          {items.map((item, index) => (
            <div
              key={item._key}
              aria-hidden={index !== currentIndex}
              className={`absolute inset-0 transition-opacity duration-500 ease-out ${
                index === currentIndex
                  ? "z-10 opacity-100"
                  : "pointer-events-none z-0 opacity-0"
              }`}
            >
              {renderSlide(item)}
            </div>
          ))}

          {currentItem._type === "image" && (
            <button
              type="button"
              aria-label={`Open expanded view of ${
                currentItem.alt || projectTitle
              }`}
              onClick={() => setIsLightboxOpen(true)}
              className="absolute inset-0 z-20 cursor-zoom-in focus-visible:outline focus-visible:outline-1 focus-visible:outline-black"
            />
          )}

          {total > 1 && (
            <>
              <button
                type="button"
                aria-label="Previous gallery item"
                onClick={goPrev}
                className="absolute bottom-0 left-0 top-0 z-30 w-[18%] cursor-w-resize focus-visible:outline focus-visible:outline-1 focus-visible:outline-black"
              />

              <button
                type="button"
                aria-label="Next gallery item"
                onClick={goNext}
                className="absolute bottom-0 right-0 top-0 z-30 w-[18%] cursor-e-resize focus-visible:outline focus-visible:outline-1 focus-visible:outline-black"
              />
            </>
          )}
        </div>

        <div className="mx-auto mt-3 flex w-full max-w-[1600px] items-start justify-between gap-6 font-mabrypro text-[9px] uppercase tracking-[0.05em] md:text-[10px]">
          <div className="min-h-4 max-w-[70%] text-neutral-500">
            {currentItem._type !== "pdf" && currentItem.caption
              ? currentItem.caption
              : ""}
          </div>

          {total > 1 && (
            <div
              className="shrink-0 tabular-nums text-neutral-500"
              aria-live="polite"
            >
              {currentIndex + 1} / {total}
            </div>
          )}
        </div>
      </section>

      {isLightboxOpen && currentItem._type === "image" && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`Expanded view of ${currentItem.alt || projectTitle}`}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-white/95 p-4 md:p-8"
          onClick={() => setIsLightboxOpen(false)}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <button
            type="button"
            aria-label="Close expanded image"
            onClick={() => setIsLightboxOpen(false)}
            className="fixed right-4 top-4 z-[120] font-mabrypro text-[10px] uppercase tracking-[0.06em] text-black transition-opacity hover:opacity-40 md:right-8 md:top-7"
          >
            Close
          </button>

          <div
            className="relative h-[calc(100svh-5rem)] w-full max-w-[1600px]"
            onClick={(event) => event.stopPropagation()}
          >
            <Image
              src={currentItem.url}
              alt={currentItem.alt || `${projectTitle} project image`}
              fill
              sizes="100vw"
              priority
              className="object-contain"
            />
          </div>

          {total > 1 && (
            <>
              <button
                type="button"
                aria-label="Previous gallery item"
                onClick={(event) => {
                  event.stopPropagation();
                  goPrev();
                }}
                className="fixed bottom-0 left-0 top-0 z-[110] w-[16%] cursor-w-resize focus-visible:outline focus-visible:outline-1 focus-visible:outline-black"
              />

              <button
                type="button"
                aria-label="Next gallery item"
                onClick={(event) => {
                  event.stopPropagation();
                  goNext();
                }}
                className="fixed bottom-0 right-0 top-0 z-[110] w-[16%] cursor-e-resize focus-visible:outline focus-visible:outline-1 focus-visible:outline-black"
              />

              <div className="fixed bottom-4 left-1/2 z-[120] -translate-x-1/2 font-mabrypro text-[9px] uppercase tracking-[0.06em] text-neutral-500 md:bottom-7 md:text-[10px]">
                {currentIndex + 1} / {total}
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
}
