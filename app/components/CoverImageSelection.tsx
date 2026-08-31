"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

const BLUE = "#2f6cff";

type CoverImageSelectionProps = {
  src: string;
  alt: string;
  lqip?: string;
  width?: number;
  height?: number;
};

export default function CoverImageSelection({
  src,
  alt,
  lqip,
  width,
  height,
}: CoverImageSelectionProps) {
  const [showSelection, setShowSelection] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShowSelection(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  // Fall back to a sane default ratio if metadata is missing
  const ratio = width && height ? width / height : 16 / 9;

  return (
    <div
      className="
        mx-auto w-full max-w-[1400px]
        px-6 sm:px-12 md:px-20 lg:px-28 xl:px-36
        pt-2 sm:pt-3 md:pt-4 lg:pt-5
        "
    >
      <div className="relative w-full" style={{ aspectRatio: ratio }}>
        <div className="absolute inset-0 overflow-hidden">
          <Image
            src={src}
            alt={alt}
            fill
            priority
            sizes="(min-width: 1400px) 1272px, 100vw"
            placeholder={lqip ? "blur" : undefined}
            blurDataURL={lqip}
            className="object-contain"
          />
        </div>

        {/* selection overlay unchanged */}
        <div
          aria-hidden="true"
          className={`pointer-events-none absolute inset-0 z-10 border transition-opacity duration-700 ease-out ${
            showSelection ? "opacity-100" : "opacity-0"
          }`}
          style={{ borderColor: BLUE }}
        >
          <svg
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            className="absolute inset-0 h-full w-full"
          >
            <line
              x1="0"
              y1="0"
              x2="100"
              y2="100"
              stroke={BLUE}
              strokeWidth="1"
              vectorEffect="non-scaling-stroke"
            />
            <line
              x1="100"
              y1="0"
              x2="0"
              y2="100"
              stroke={BLUE}
              strokeWidth="1"
              vectorEffect="non-scaling-stroke"
            />
          </svg>
          {[
            "left-[-5px] top-[-5px]",
            "right-[-5px] top-[-5px]",
            "bottom-[-5px] left-[-5px]",
            "bottom-[-5px] right-[-5px]",
          ].map((position) => (
            <span
              key={position}
              className={`absolute h-[10px] w-[10px] border bg-white ${position}`}
              style={{ borderColor: BLUE }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
