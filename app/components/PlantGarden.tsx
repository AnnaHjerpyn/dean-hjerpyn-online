"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type PlantDrawing = {
  url: string;
  alt?: string;
};

type PlantGardenProps = {
  drawings?: PlantDrawing[];
};

type PlantPlacement = {
  left?: string;
  right?: string;
  top?: string;
  bottom?: string;
  width: string;
  rotate: string;
};

const placements: PlantPlacement[] = [
  { left: "-6vw", top: "-9vh", width: "25vw", rotate: "-8deg" },
  { left: "8vw", top: "-7vh", width: "18vw", rotate: "6deg" },
  { left: "21vw", top: "-8vh", width: "28vw", rotate: "-3deg" },
  { left: "43vw", top: "-9vh", width: "23vw", rotate: "9deg" },
  { right: "10vw", top: "-8vh", width: "27vw", rotate: "-5deg" },
  { right: "-5vw", top: "-8vh", width: "25vw", rotate: "8deg" },

  { left: "-8vw", top: "14vh", width: "30vw", rotate: "7deg" },
  { left: "9vw", top: "16vh", width: "22vw", rotate: "-10deg" },
  { left: "27vw", top: "12vh", width: "26vw", rotate: "4deg" },
  { right: "22vw", top: "13vh", width: "27vw", rotate: "-7deg" },
  { right: "3vw", top: "14vh", width: "24vw", rotate: "10deg" },
  { right: "-8vw", top: "16vh", width: "30vw", rotate: "-4deg" },

  { left: "-7vw", top: "38vh", width: "31vw", rotate: "-6deg" },
  { left: "13vw", top: "36vh", width: "28vw", rotate: "7deg" },
  { left: "34vw", top: "34vh", width: "30vw", rotate: "-3deg" },
  { right: "12vw", top: "36vh", width: "27vw", rotate: "5deg" },
  { right: "-7vw", top: "37vh", width: "32vw", rotate: "-9deg" },

  { left: "-8vw", bottom: "-10vh", width: "32vw", rotate: "5deg" },
  { left: "12vw", bottom: "-12vh", width: "31vw", rotate: "-8deg" },
  { left: "35vw", bottom: "-13vh", width: "34vw", rotate: "4deg" },
  { right: "8vw", bottom: "-10vh", width: "29vw", rotate: "-5deg" },
  { right: "-8vw", bottom: "-11vh", width: "32vw", rotate: "8deg" },
];

export default function PlantGarden({ drawings = [] }: PlantGardenProps) {
  const imageRefs = useRef<(HTMLImageElement | null)[]>([]);
  const [hiddenPlants, setHiddenPlants] = useState<Set<number>>(new Set());

  const visibleDrawings = useMemo(() => {
    if (drawings.length === 0) return [];

    return placements.map((_, index) => drawings[index % drawings.length]);
  }, [drawings]);

  useEffect(() => {
    const handlePointerMove = (event: PointerEvent) => {
      const nextHiddenPlants = new Set<number>();

      imageRefs.current.forEach((image, index) => {
        if (!image) return;

        const rect = image.getBoundingClientRect();

        const isInside =
          event.clientX >= rect.left &&
          event.clientX <= rect.right &&
          event.clientY >= rect.top &&
          event.clientY <= rect.bottom;

        if (isInside) {
          nextHiddenPlants.add(index);
        }
      });

      setHiddenPlants(nextHiddenPlants);
    };

    const handlePointerLeave = () => {
      setHiddenPlants(new Set());
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerleave", handlePointerLeave);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerleave", handlePointerLeave);
    };
  }, []);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden bg-white"
    >
      {visibleDrawings.length > 0 ? (
        <div className="relative h-full w-full">
          {visibleDrawings.map((drawing, index) => {
            const placement = placements[index];
            const isHidden = hiddenPlants.has(index);

            return (
              <img
                key={`${drawing.url}-${index}`}
                ref={(element) => {
                  imageRefs.current[index] = element;
                }}
                src={drawing.url}
                alt={drawing.alt || ""}
                draggable={false}
                className="pointer-events-none absolute max-w-none select-none object-contain grayscale transition-opacity duration-150"
                style={{
                  left: placement.left,
                  right: placement.right,
                  top: placement.top,
                  bottom: placement.bottom,
                  width: placement.width,
                  transform: `rotate(${placement.rotate})`,
                  opacity: isHidden ? 0 : 1,
                  filter: "grayscale(1) contrast(1.45) brightness(0.55)",
                  mixBlendMode: "multiply",
                }}
              />
            );
          })}
        </div>
      ) : (
        <div className="h-full w-full bg-[url('/botanical-bg.png')] bg-cover bg-center bg-no-repeat grayscale" />
      )}
    </div>
  );
}
