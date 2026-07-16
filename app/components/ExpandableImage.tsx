"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";

type GalleryImageData = {
  src: string;
  alt: string;
  width: number;
  height: number;
  lqip?: string;
};

type ExpandableImageProps = {
  src: string;
  alt: string;
  width: number;
  height: number;
  sizes: string;
  lqip?: string;
  /** Full set of images in this project's gallery, for lightbox navigation */
  images?: GalleryImageData[];
  /** This image's position within `images` */
  index?: number;
};

export default function ExpandableImage({
  src,
  alt,
  width,
  height,
  sizes,
  lqip,
  images,
  index = 0,
}: ExpandableImageProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(index);

  const gallery =
    images && images.length > 0 ? images : [{ src, alt, width, height, lqip }];
  const current = gallery[currentIndex] ?? gallery[0];
  const hasMultiple = gallery.length > 1;

  const goPrev = useCallback(() => {
    setCurrentIndex((i) => (i - 1 + gallery.length) % gallery.length);
  }, [gallery.length]);

  const goNext = useCallback(() => {
    setCurrentIndex((i) => (i + 1) % gallery.length);
  }, [gallery.length]);

  useEffect(() => {
    if (!isExpanded) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsExpanded(false);
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
  }, [isExpanded, goNext, goPrev]);

  const touchStartX = useRef<number | null>(null);

  function handleTouchStart(event: React.TouchEvent) {
    touchStartX.current = event.touches[0].clientX;
  }

  function handleTouchEnd(event: React.TouchEvent) {
    if (touchStartX.current === null) return;
    const delta = event.changedTouches[0].clientX - touchStartX.current;
    if (delta > 50) goPrev();
    else if (delta < -50) goNext();
    touchStartX.current = null;
  }

  function handleOpen() {
    setCurrentIndex(index);
    setIsExpanded(true);
  }

  return (
    <>
      <button
        type="button"
        onClick={handleOpen}
        aria-label={`Expand ${alt}`}
        className="group block w-full cursor-zoom-in text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4"
      >
        <Image
          src={src}
          alt={alt}
          width={width}
          height={height}
          sizes={sizes}
          placeholder={lqip ? "blur" : undefined}
          blurDataURL={lqip}
          className="h-auto w-full transition-opacity duration-200 group-hover:opacity-90"
        />
      </button>

      {isExpanded && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`Expanded view of ${current.alt}`}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-white/95 p-4 md:p-8"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setIsExpanded(false);
            }
          }}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <button
            type="button"
            onClick={() => setIsExpanded(false)}
            aria-label="Close expanded image"
            className="fixed right-4 top-4 z-[110] font-mabrypro text-[11px] uppercase tracking-[0.08em] transition-opacity hover:opacity-40 md:right-8 md:top-7"
          >
            Close
          </button>

          {hasMultiple && (
            <>
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  goPrev();
                }}
                aria-label="Previous image"
                className="fixed left-2 top-1/2 z-[110] -translate-y-1/2 px-3 py-6 font-mabrypro text-2xl transition-opacity hover:opacity-40 md:left-6"
              >
                ‹
              </button>

              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  goNext();
                }}
                aria-label="Next image"
                className="fixed right-2 top-1/2 z-[110] -translate-y-1/2 px-3 py-6 font-mabrypro text-2xl transition-opacity hover:opacity-40 md:right-6"
              >
                ›
              </button>

              <div className="fixed bottom-4 left-1/2 z-[110] -translate-x-1/2 font-mabrypro text-[10px] uppercase tracking-[0.08em] text-neutral-500 md:bottom-7">
                {currentIndex + 1} / {gallery.length}
              </div>
            </>
          )}

          <div className="relative flex h-full w-full items-center justify-center">
            <Image
              src={current.src}
              alt={current.alt}
              width={current.width}
              height={current.height}
              sizes="100vw"
              priority
              className="max-h-[calc(100svh-4rem)] max-w-full object-contain"
            />
          </div>
        </div>
      )}
    </>
  );
}
