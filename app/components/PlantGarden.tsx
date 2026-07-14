"use client";

import { useEffect, useMemo, useState } from "react";

type PlantDrawing = {
  url: string;
  alt?: string;
};

type PlantGardenProps = {
  drawings?: PlantDrawing[];
};

type PlantPlacement = {
  id: number;
  left: number;
  top: number;
  width: number;
  height: number;
  rotate: number;
  flip: number;
  zIndex: number;
  popOrder: number;
};

const PLANT_COUNT = 250;
const PLANT_INTERVAL = 100;

const MAX_PLANT_WIDTH = 130;
const MAX_PLANT_HEIGHT = 210;

function createSeededRandom(seed: number) {
  let value = seed;

  return () => {
    value = Math.sin(value) * 10000;
    return value - Math.floor(value);
  };
}

function createPlacements(count: number): PlantPlacement[] {
  const random = createSeededRandom(2847);

  const columns = 11;
  const rows = Math.ceil(count / columns);

  const cellWidth = 100 / columns;
  const cellHeight = 100 / rows;

  return Array.from({ length: count }, (_, index) => {
    const column = index % columns;
    const row = Math.floor(index / columns);

    const horizontalJitter = (random() - 0.5) * cellWidth * 1.6;
    const verticalJitter = (random() - 0.5) * cellHeight * 1.7;

    return {
      id: index,

      // Positions may reach or extend slightly beyond the viewport edges.
      left: column * cellWidth + cellWidth / 2 + horizontalJitter,

      top: row * cellHeight + cellHeight / 2 + verticalJitter,

      width: 75 + random() * 55,
      height: 160 + random() * 120,

      rotate: -16 + random() * 32,
      flip: random() > 0.5 ? -1 : 1,
      zIndex: Math.floor(random() * 5) + 1,
      popOrder: random(),
    };
  });
}

const placements = createPlacements(PLANT_COUNT);

export default function PlantGarden({ drawings = [] }: PlantGardenProps) {
  const [visibleCount, setVisibleCount] = useState(0);

  const [hiddenPlants, setHiddenPlants] = useState<Set<number>>(
    () => new Set()
  );

  const plants = useMemo(() => {
    if (!drawings.length) {
      return [];
    }

    return placements
      .map((placement, index) => ({
        ...placement,
        drawing: drawings[index % drawings.length],
      }))
      .sort((a, b) => a.popOrder - b.popOrder);
  }, [drawings]);

  useEffect(() => {
    setVisibleCount(0);
    setHiddenPlants(new Set());

    if (!plants.length) {
      return;
    }

    setVisibleCount(Math.min(12, plants.length));

    const interval = window.setInterval(() => {
      setVisibleCount((current) => {
        if (current >= plants.length) {
          window.clearInterval(interval);
          return current;
        }

        return current + 1;
      });
    }, PLANT_INTERVAL);

    return () => {
      window.clearInterval(interval);
    };
  }, [plants.length]);

  useEffect(() => {
    const handlePointerMove = (event: PointerEvent) => {
      const elements = document.elementsFromPoint(event.clientX, event.clientY);

      const hoveredPlant = elements.find((element) =>
        element.hasAttribute("data-plant-id")
      );

      if (!hoveredPlant) {
        return;
      }

      const plantId = Number(hoveredPlant.getAttribute("data-plant-id"));

      if (Number.isNaN(plantId)) {
        return;
      }

      setHiddenPlants((current) => {
        if (current.has(plantId)) {
          return current;
        }

        const updatedPlants = new Set(current);
        updatedPlants.add(plantId);

        return updatedPlants;
      });
    };

    window.addEventListener("pointermove", handlePointerMove);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
    };
  }, []);

  if (!plants.length) {
    return null;
  }

  return (
    <div
      aria-hidden="true"
      className="
        pointer-events-none
        fixed
        inset-0
        z-0
        h-[100svh]
        w-screen
        overflow-hidden
        bg-white
      "
    >
      {plants.map((plant, index) => {
        const hasAppeared = index < visibleCount;
        const hasDisappeared = hiddenPlants.has(plant.id);

        if (!hasAppeared || hasDisappeared) {
          return null;
        }

        return (
          <div
            key={`${plant.drawing.url}-${plant.id}`}
            className="
              pointer-events-none
              absolute
              flex
              items-center
              justify-center
            "
            style={{
              // No clamp: flowers can touch and extend past the edges.
              left: `${plant.left}%`,
              top: `${plant.top}%`,

              width: `${plant.width}px`,
              height: `${plant.height}px`,

              maxWidth: `${MAX_PLANT_WIDTH}px`,
              maxHeight: `${MAX_PLANT_HEIGHT}px`,

              zIndex: plant.zIndex,

              transform: `
                translate(-50%, -50%)
                rotate(${plant.rotate}deg)
                scaleX(${plant.flip})
              `,
            }}
          >
            <img
              src={plant.drawing.url}
              alt=""
              data-plant-id={plant.id}
              draggable={false}
              className="
                pointer-events-auto
                block
                h-full
                w-full
                select-none
                object-contain
              "
              style={{
                filter: "grayscale(1) contrast(1.15)",
                mixBlendMode: "multiply",
              }}
            />
          </div>
        );
      })}
    </div>
  );
}
