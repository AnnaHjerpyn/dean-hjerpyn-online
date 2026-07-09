"use client";

import { useEffect, useMemo, useState } from "react";

type PlantDrawing = {
  url: string;
  alt?: string;
};

type PlantGardenProps = {
  drawings?: PlantDrawing[];
};

export default function PlantGarden({ drawings = [] }: PlantGardenProps) {
  const [mouse, setMouse] = useState({
    x: 0,
    y: 0,
    active: false,
  });

  useEffect(() => {
    const handlePointerMove = (event: PointerEvent) => {
      setMouse({
        x: event.clientX,
        y: event.clientY,
        active: true,
      });
    };

    const handlePointerLeave = () => {
      setMouse((current) => ({
        ...current,
        active: false,
      }));
    };

    window.addEventListener("pointermove", handlePointerMove);
    document.documentElement.addEventListener("mouseleave", handlePointerLeave);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      document.documentElement.removeEventListener(
        "mouseleave",
        handlePointerLeave
      );
    };
  }, []);

  const eraseMask = useMemo(() => {
    if (!mouse.active) {
      return "none";
    }

    return `radial-gradient(circle 145px at ${mouse.x}px ${mouse.y}px, transparent 0%, transparent 42%, black 72%, black 100%)`;
  }, [mouse.x, mouse.y, mouse.active]);

  const maskStyle = {
    WebkitMaskImage: eraseMask,
    maskImage: eraseMask,
  };

  const positions = [
    "left-[-4vw] top-[-6vh] w-[34vw]",
    "left-[15vw] top-[-4vh] w-[30vw]",
    "left-[40vw] top-[-8vh] w-[32vw]",
    "right-[-4vw] top-[-4vh] w-[34vw]",

    "left-[-6vw] top-[25vh] w-[34vw]",
    "left-[18vw] top-[24vh] w-[35vw]",
    "right-[22vw] top-[22vh] w-[35vw]",
    "right-[-5vw] top-[25vh] w-[34vw]",

    "left-[-2vw] bottom-[-8vh] w-[36vw]",
    "left-[28vw] bottom-[-11vh] w-[37vw]",
    "right-[-4vw] bottom-[-8vh] w-[36vw]",
  ];

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
      style={maskStyle}
    >
      {drawings.length > 0 ? (
        <div className="relative h-full w-full">
          {drawings.map((drawing, index) => (
            <img
              key={`${drawing.url}-${index}`}
              src={drawing.url}
              alt={drawing.alt || ""}
              className={`absolute ${
                positions[index % positions.length]
              } max-w-none select-none object-contain opacity-[0.38] grayscale`}
              draggable={false}
            />
          ))}
        </div>
      ) : (
        <div className="h-full w-full bg-[url('/botanical-bg.png')] bg-cover bg-center bg-no-repeat opacity-100 grayscale" />
      )}
    </div>
  );
}
