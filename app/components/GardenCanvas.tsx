"use client";

import {
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
} from "react";

export type GardenDrawing = {
  url: string;
  alt?: string;
  width?: number;
  height?: number;
};

type Plant = {
  id: number;
  drawing: GardenDrawing;
  x: number; // percent of canvas width (center of the drawing)
  y: number; // percent of canvas height (center of the drawing)
  size: number; // vw
  rotate: number; // degrees
  flip: 1 | -1;
  delay: number; // ms
};

type PlantStyle = CSSProperties & {
  "--plant-rotate": string;
  "--plant-flip": string;
};

type DragState = {
  id: number;
  pointerId: number;
  startClientX: number;
  startClientY: number;
  originX: number;
  originY: number;
};

function clamp(value: number, minimum: number, maximum: number) {
  return Math.min(Math.max(value, minimum), maximum);
}

// Small seeded random number generator. A fixed seed means the server and
// the browser compute the same layout, so there is no hydration mismatch.
function mulberry32(seed: number) {
  let state = seed;

  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/*
  Jittered grid: split the canvas into cells, give each drawing its own
  cell, then nudge it off-center. Looks scattered but never piles up.
  Leaves the top strip clear for the title and nav.
*/
function scatter(drawings: GardenDrawing[]): Plant[] {
  if (drawings.length === 0) {
    return [];
  }

  const rand = mulberry32(20261125);

  const count = drawings.length;
  const columns = Math.max(2, Math.round(Math.sqrt(count * 1.6)));
  const rows = Math.max(2, Math.ceil(count / columns));

  const REGION = { left: 5, top: 22, width: 90, height: 74 };

  const cells = Array.from({ length: columns * rows }, (_, index) => index);

  // Shuffle the cells (Fisher-Yates), then take as many as we need.
  for (let i = cells.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rand() * (i + 1));
    [cells[i], cells[j]] = [cells[j], cells[i]];
  }

  return drawings.map((drawing, index) => {
    const cell = cells[index];
    const column = cell % columns;
    const row = Math.floor(cell / columns);

    const jitterX = (rand() - 0.5) * 0.7;
    const jitterY = (rand() - 0.5) * 0.7;

    return {
      id: index,
      drawing,
      x: REGION.left + ((column + 0.5 + jitterX) / columns) * REGION.width,
      y: REGION.top + ((row + 0.5 + jitterY) / rows) * REGION.height,
      size: 9 + rand() * 7,
      rotate: (rand() - 0.5) * 30,
      flip: rand() < 0.5 ? -1 : 1,
      delay: Math.min(index * 70, 1400),
    };
  });
}

export default function GardenCanvas({
  drawings,
}: {
  drawings: GardenDrawing[];
}) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const dragState = useRef<DragState | null>(null);

  const [plants, setPlants] = useState<Plant[]>(() => scatter(drawings));

  // Ids from back to front. Dragging a plant moves it to the end.
  const [stack, setStack] = useState<number[]>(() =>
    plants.map((plant) => plant.id)
  );

  function handlePointerDown(
    event: ReactPointerEvent<HTMLDivElement>,
    plant: Plant
  ) {
    dragState.current = {
      id: plant.id,
      pointerId: event.pointerId,
      startClientX: event.clientX,
      startClientY: event.clientY,
      originX: plant.x,
      originY: plant.y,
    };

    setStack((current) => [
      ...current.filter((id) => id !== plant.id),
      plant.id,
    ]);

    event.currentTarget.setPointerCapture(event.pointerId);
    event.preventDefault();
  }

  function handlePointerMove(
    event: ReactPointerEvent<HTMLDivElement>,
    plant: Plant
  ) {
    const drag = dragState.current;
    const canvas = canvasRef.current;

    if (
      !drag ||
      !canvas ||
      drag.id !== plant.id ||
      drag.pointerId !== event.pointerId
    ) {
      return;
    }

    const bounds = canvas.getBoundingClientRect();

    if (bounds.width <= 0 || bounds.height <= 0) {
      return;
    }

    const x = clamp(
      drag.originX + ((event.clientX - drag.startClientX) / bounds.width) * 100,
      0,
      100
    );

    const y = clamp(
      drag.originY +
        ((event.clientY - drag.startClientY) / bounds.height) * 100,
      0,
      100
    );

    setPlants((current) =>
      current.map((item) => (item.id === plant.id ? { ...item, x, y } : item))
    );
  }

  function handlePointerUp(
    event: ReactPointerEvent<HTMLDivElement>,
    plant: Plant
  ) {
    if (dragState.current?.id !== plant.id) {
      return;
    }

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }

    dragState.current = null;
  }

  if (plants.length === 0) {
    return (
      <div className="absolute inset-0 flex items-center justify-center px-4">
        <p className="font-mabrypro text-[10px] font-normal uppercase tracking-[0.16em]">
          No plant drawings yet. Add some in Site Settings.
        </p>
      </div>
    );
  }

  return (
    <div ref={canvasRef} className="absolute inset-0">
      {plants.map((plant) => {
        const style: PlantStyle = {
          left: `${plant.x}%`,
          top: `${plant.y}%`,
          width: `clamp(96px, ${plant.size}vw, 260px)`,
          zIndex: 10 + stack.indexOf(plant.id),
          touchAction: "none",

          "--plant-rotate": `${plant.rotate}deg`,
          "--plant-flip": String(plant.flip),

          // Matches the end state of the .plant-appear keyframes in globals.css.
          transform:
            "translate(-50%, -50%) rotate(var(--plant-rotate)) scaleX(var(--plant-flip))",
          animationDelay: `${plant.delay}ms`,
        };

        return (
          <div
            key={plant.id}
            style={style}
            className="plant-appear absolute cursor-grab select-none active:cursor-grabbing"
            onPointerDown={(event) => handlePointerDown(event, plant)}
            onPointerMove={(event) => handlePointerMove(event, plant)}
            onPointerUp={(event) => handlePointerUp(event, plant)}
            onPointerCancel={(event) => handlePointerUp(event, plant)}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={plant.drawing.url}
              alt={plant.drawing.alt ?? ""}
              width={plant.drawing.width}
              height={plant.drawing.height}
              draggable={false}
              className="pointer-events-none block h-auto w-full"
            />
          </div>
        );
      })}
    </div>
  );
}
