"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

type ExpandableImageProps = {
  src: string;
  alt: string;
  width: number;
  height: number;
  sizes: string;
  lqip?: string;
};

export default function ExpandableImage({
  src,
  alt,
  width,
  height,
  sizes,
  lqip,
}: ExpandableImageProps) {
  const [isExpanded, setIsExpanded] = useState(false);

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
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isExpanded]);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsExpanded(true)}
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
          aria-label={`Expanded view of ${alt}`}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-white/95 p-4 md:p-8"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setIsExpanded(false);
            }
          }}
        >
          <button
            type="button"
            onClick={() => setIsExpanded(false)}
            aria-label="Close expanded image"
            className="fixed right-4 top-4 z-[110] font-mabrypro text-[11px] uppercase tracking-[0.08em] transition-opacity hover:opacity-40 md:right-8 md:top-7"
          >
            Close
          </button>

          <button
            type="button"
            onClick={() => setIsExpanded(false)}
            aria-label="Close expanded image"
            className="relative flex h-full w-full cursor-zoom-out items-center justify-center"
          >
            <Image
              src={src}
              alt={alt}
              width={width}
              height={height}
              sizes="100vw"
              priority
              className="max-h-[calc(100svh-4rem)] max-w-full object-contain"
            />
          </button>
        </div>
      )}
    </>
  );
}
