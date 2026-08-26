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

/*
  Breakpoint used to decide whether we render the
  dense desktop composition or the lighter mobile one.
*/
const MOBILE_BREAKPOINT = 768;

/*
  Desktop: dense botanical wall.
  Mobile: fewer flowers so the layout stays readable
  and lightweight on small screens.
*/
const DESKTOP_PLANT_COUNT = 160;
const MOBILE_PLANT_COUNT = 55;

/*
  Column count drives horizontal density. Fewer columns
  on mobile spreads flowers out instead of cramming them.
*/
const DESKTOP_COLUMNS = 20;
const MOBILE_COLUMNS = 8;

/*
  Fast entrance animation.
*/
const PLANT_INTERVAL = 35;

/*
  How long a flower disappears after the cursor
  touches it.
*/
const PLANT_RETURN_DELAY = 700;

/*
  Larger flowers on desktop; smaller on mobile so the
  lighter count doesn't leave oversized gaps.
*/
const DESKTOP_MAX_PLANT_WIDTH = 190;
const DESKTOP_MAX_PLANT_HEIGHT = 360;

const MOBILE_MAX_PLANT_WIDTH = 130;
const MOBILE_MAX_PLANT_HEIGHT = 240;

/*
  Seeded random generator.

  Keeps the composition consistent between renders.
*/
function createSeededRandom(seed: number) {
  let value = seed;

  return () => {
    value = Math.sin(value) * 10000;
    return value - Math.floor(value);
  };
}

/*
  Create the botanical composition.

  The layout intentionally has:

  - many columns (desktop) or fewer (mobile)
  - strong overlap
  - flowers near every edge
  - flowers behind the center content
  - large vertical variation
  - random rotations
  - random scales
*/
function createPlacements(
  count: number,
  columns: number,
  seed: number,
  sizeConfig: {
    minWidth: number;
    widthRange: number;
    minHeight: number;
    heightRange: number;
  }
): PlantPlacement[] {
  const random = createSeededRandom(seed);

  const rows = Math.ceil(count / columns);

  /*
    Use the full viewport vertically.
  */
  const gardenHeight = 100;

  const cellWidth = 100 / columns;

  const cellHeight = gardenHeight / rows;

  return Array.from({ length: count }, (_, index) => {
    const column = index % columns;

    const row = Math.floor(index / columns);

    /*
        Strong horizontal overlap.
      */
    const horizontalJitter = (random() - 0.5) * cellWidth * 2.5;

    /*
        Strong vertical overlap.
      */
    const verticalJitter = (random() - 0.5) * cellHeight * 2.5;

    /*
        Some flowers are intentionally
        pushed toward the edges.
      */
    let left = column * cellWidth + cellWidth / 2 + horizontalJitter;

    let top = row * cellHeight + cellHeight / 2 + verticalJitter;

    /*
        Allow a small number of flowers
        to extend beyond the viewport.

        This prevents obvious hard edges.
      */
    left += (random() - 0.5) * 8;

    top += (random() - 0.5) * 8;

    /*
        Large variation in plant sizes.

        Some are delicate.
        Some dominate the composition.
      */
    const width = sizeConfig.minWidth + random() * sizeConfig.widthRange;

    const height = sizeConfig.minHeight + random() * sizeConfig.heightRange;

    return {
      id: index,

      left,
      top,

      width,
      height,

      /*
          More dramatic rotation.
        */
      rotate: -22 + random() * 44,

      /*
          Random horizontal flip.
        */
      flip: random() > 0.5 ? -1 : 1,

      /*
          More layering variation.
        */
      zIndex: Math.floor(random() * 9) + 1,

      /*
          Random appearance order.
        */
      popOrder: random(),
    };
  });
}

/*
  Same seed for both compositions so the "feel" of the
  layout (clustering, rotation bias) stays consistent
  between desktop and mobile.
*/
const COMPOSITION_SEED = 2847;

const desktopPlacements = createPlacements(
  DESKTOP_PLANT_COUNT,
  DESKTOP_COLUMNS,
  COMPOSITION_SEED,
  { minWidth: 65, widthRange: 125, minHeight: 150, heightRange: 210 }
);

const mobilePlacements = createPlacements(
  MOBILE_PLANT_COUNT,
  MOBILE_COLUMNS,
  COMPOSITION_SEED,
  { minWidth: 55, widthRange: 90, minHeight: 110, heightRange: 150 }
);

/*
  Detect mobile viewport via matchMedia so we only
  recompute when crossing the breakpoint, not on every
  resize pixel.
*/
function useIsMobile() {
  const [isMobile, setIsMobile] = useState<boolean | null>(null);

  useEffect(() => {
    const mediaQuery = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT}px)`);

    setIsMobile(mediaQuery.matches);

    const handleChange = (event: MediaQueryListEvent) => {
      setIsMobile(event.matches);
    };

    mediaQuery.addEventListener("change", handleChange);

    return () => {
      mediaQuery.removeEventListener("change", handleChange);
    };
  }, []);

  return isMobile;
}

export default function PlantGarden({ drawings = [] }: PlantGardenProps) {
  const isMobile = useIsMobile();

  const [visibleCount, setVisibleCount] = useState(0);

  const [hiddenPlants, setHiddenPlants] = useState<Set<number>>(
    () => new Set()
  );

  const returnTimers = useRef<Map<number, number>>(new Map());

  const placements = isMobile ? mobilePlacements : desktopPlacements;

  const maxPlantWidth = isMobile
    ? MOBILE_MAX_PLANT_WIDTH
    : DESKTOP_MAX_PLANT_WIDTH;
  const maxPlantHeight = isMobile
    ? MOBILE_MAX_PLANT_HEIGHT
    : DESKTOP_MAX_PLANT_HEIGHT;

  /*
    Connect every generated position
    with one of the Sanity plant drawings.

    Waits until we know the viewport (isMobile !== null)
    so we don't briefly render the wrong density before
    hydration settles.
  */
  const plants = useMemo(() => {
    if (!drawings.length || isMobile === null) {
      return [];
    }

    return placements
      .map((placement, index) => ({
        ...placement,
        drawing: drawings[index % drawings.length],
      }))
      .sort((a, b) => a.popOrder - b.popOrder);
  }, [drawings, placements, isMobile]);

  /*
    Progressive entrance animation.
  */
  useEffect(() => {
    setVisibleCount(0);
    setHiddenPlants(new Set());

    /*
      Clear existing timers.
    */
    returnTimers.current.forEach((timer) => {
      window.clearTimeout(timer);
    });

    returnTimers.current.clear();

    if (!plants.length) {
      return;
    }

    /*
      Start with a large cluster already visible.

      This prevents the first few seconds from
      looking too sparse.
    */
    setVisibleCount(Math.min(35, plants.length));

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

  /*
    Flower hover interaction.
  */
  useEffect(() => {
    const hidePlantTemporarily = (plantId: number) => {
      /*
        Don't create multiple timers
        for the same flower.
      */
      if (returnTimers.current.has(plantId)) {
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

      /*
        Restore the flower after
        the configured delay.
      */
      const returnTimer = window.setTimeout(() => {
        setHiddenPlants((current) => {
          if (!current.has(plantId)) {
            return current;
          }

          const updatedPlants = new Set(current);

          updatedPlants.delete(plantId);

          return updatedPlants;
        });

        returnTimers.current.delete(plantId);
      }, PLANT_RETURN_DELAY);

      returnTimers.current.set(plantId, returnTimer);
    };

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

      hidePlantTemporarily(plantId);
    };

    window.addEventListener("pointermove", handlePointerMove);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);

      returnTimers.current.forEach((timer) => {
        window.clearTimeout(timer);
      });

      returnTimers.current.clear();
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
              left: `${plant.left}%`,
              top: `${plant.top}%`,

              width: `${plant.width}px`,
              height: `${plant.height}px`,

              maxWidth: `${maxPlantWidth}px`,

              maxHeight: `${maxPlantHeight}px`,

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
              alt={plant.drawing.alt || ""}
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
