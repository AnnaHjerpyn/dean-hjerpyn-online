"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

const BLUE = "#2f6cff";

type CoverImageSelectionProps = {
  src: string;
  alt: string;
  lqip?: string;
};

export default function CoverImageSelection({
  src,
  alt,
  lqip,
}: CoverImageSelectionProps) {
  const [showSelection, setShowSelection] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShowSelection(false), 2000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="relative mx-auto aspect-[16/10] w-full max-w-[800px] md:aspect-[16/9]">
      <div className="absolute inset-0 overflow-hidden">
        <Image
          src={src}
          alt={alt}
          fill
          priority
          sizes="(min-width: 768px) 800px, 100vw"
          placeholder={lqip ? "blur" : undefined}
          blurDataURL={lqip}
          className="object-contain"
        />
      </div>

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
  );
}
