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

const MOBILE_BREAKPOINT = 768;

const DESKTOP_PLANT_COUNT = 325;
const MOBILE_PLANT_COUNT = 65;

const DESKTOP_COLUMNS = 20;
const MOBILE_COLUMNS = 8;

const PLANT_INTERVAL = 35;
const PLANT_RETURN_DELAY = 700;

// Animation timing
const PLANT_APPEAR_DURATION = 450;

const DESKTOP_MAX_PLANT_WIDTH = 190;
const DESKTOP_MAX_PLANT_HEIGHT = 360;

const MOBILE_MAX_PLANT_WIDTH = 130;
const MOBILE_MAX_PLANT_HEIGHT = 240;

/*
|--------------------------------------------------------------------------
| Seeded random
|--------------------------------------------------------------------------
*/

function createSeededRandom(seed: number) {
  let value = seed;

  return () => {
    value = Math.sin(value) * 10000;
    return value - Math.floor(value);
  };
}

/*
|--------------------------------------------------------------------------
| Create placements
|--------------------------------------------------------------------------
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

  const gardenHeight = 100;

  const cellWidth = 100 / columns;
  const cellHeight = gardenHeight / rows;

  return Array.from({ length: count }, (_, index) => {
    const column = index % columns;
    const row = Math.floor(index / columns);

    /*
     * Strong horizontal overlap.
     */
    const horizontalJitter = (random() - 0.5) * cellWidth * 2.5;

    /*
     * Strong vertical overlap.
     */
    const verticalJitter = (random() - 0.5) * cellHeight * 2.5;

    /*
     * Position.
     */
    let left = column * cellWidth + cellWidth / 2 + horizontalJitter;

    let top = row * cellHeight + cellHeight / 2 + verticalJitter;

    /*
     * Allow flowers to extend beyond
     * the viewport.
     */
    left += (random() - 0.5) * 8;
    top += (random() - 0.5) * 8;

    /*
     * Large variation in sizes.
     */
    const width = sizeConfig.minWidth + random() * sizeConfig.widthRange;

    const height = sizeConfig.minHeight + random() * sizeConfig.heightRange;

    return {
      id: index,

      left,
      top,

      width,
      height,

      rotate: -22 + random() * 44,

      flip: random() > 0.5 ? -1 : 1,

      zIndex: Math.floor(random() * 9) + 1,

      popOrder: random(),
    };
  });
}

/*
|--------------------------------------------------------------------------
| Composition
|--------------------------------------------------------------------------
*/

const COMPOSITION_SEED = 2847;

const desktopPlacements = createPlacements(
  DESKTOP_PLANT_COUNT,
  DESKTOP_COLUMNS,
  COMPOSITION_SEED,
  {
    minWidth: 65,
    widthRange: 125,
    minHeight: 150,
    heightRange: 210,
  }
);

const mobilePlacements = createPlacements(
  MOBILE_PLANT_COUNT,
  MOBILE_COLUMNS,
  COMPOSITION_SEED,
  {
    minWidth: 55,
    widthRange: 90,
    minHeight: 110,
    heightRange: 150,
  }
);

/*
|--------------------------------------------------------------------------
| Mobile detection
|--------------------------------------------------------------------------
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

/*
|--------------------------------------------------------------------------
| Plant Garden
|--------------------------------------------------------------------------
*/

export default function PlantGarden({ drawings = [] }: PlantGardenProps) {
  const isMobile = useIsMobile();

  const [visibleCount, setVisibleCount] = useState(0);

  const [hiddenPlants, setHiddenPlants] = useState<Set<number>>(
    () => new Set()
  );

  /*
   * Timers used to bring flowers back.
   */
  const returnTimers = useRef<Map<number, number>>(new Map());

  /*
   * Track whether reduced motion
   * is preferred.
   */
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  /*
   * Detect reduced motion.
   */
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches);
    };

    mediaQuery.addEventListener("change", handleChange);

    return () => {
      mediaQuery.removeEventListener("change", handleChange);
    };
  }, []);

  /*
  |--------------------------------------------------------------------------
  | Select composition
  |--------------------------------------------------------------------------
  */

  const placements = isMobile ? mobilePlacements : desktopPlacements;

  const maxPlantWidth = isMobile
    ? MOBILE_MAX_PLANT_WIDTH
    : DESKTOP_MAX_PLANT_WIDTH;

  const maxPlantHeight = isMobile
    ? MOBILE_MAX_PLANT_HEIGHT
    : DESKTOP_MAX_PLANT_HEIGHT;

  /*
  |--------------------------------------------------------------------------
  | Connect drawings to placements
  |--------------------------------------------------------------------------
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
  |--------------------------------------------------------------------------
  | Progressive entrance
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    setVisibleCount(0);

    setHiddenPlants(new Set());

    /*
     * Clear existing timers.
     */
    returnTimers.current.forEach((timer) => {
      window.clearTimeout(timer);
    });

    returnTimers.current.clear();

    if (!plants.length) {
      return;
    }

    /*
     * Start with a large cluster already
     * visible so the page doesn't look empty.
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
  |--------------------------------------------------------------------------
  | Hover interaction
  |
  | IMPORTANT:
  |
  | We keep the original elementsFromPoint
  | behavior because the flowers overlap.
  |
  | The requestAnimationFrame throttle prevents
  | Safari from running an expensive hit-test
  | for every single pointer event.
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    const hidePlantTemporarily = (plantId: number) => {
      /*
       * Don't create multiple timers
       * for the same flower.
       */
      if (returnTimers.current.has(plantId)) {
        return;
      }

      /*
       * Hide the flower.
       *
       * It is removed from the DOM so the
       * flower underneath becomes interactive.
       */
      setHiddenPlants((current) => {
        if (current.has(plantId)) {
          return current;
        }

        const updatedPlants = new Set(current);

        updatedPlants.add(plantId);

        return updatedPlants;
      });

      /*
       * Bring it back after the delay.
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

    /*
     * Store the latest pointer position.
     */
    let lastX = 0;
    let lastY = 0;

    /*
     * Only perform one expensive hit test
     * per animation frame.
     */
    let frameId: number | null = null;

    const handlePointerMove = (event: PointerEvent) => {
      lastX = event.clientX;

      lastY = event.clientY;

      /*
       * A frame is already scheduled.
       * Just use the latest coordinates.
       */
      if (frameId !== null) {
        return;
      }

      frameId = window.requestAnimationFrame(() => {
        frameId = null;

        /*
         * Find everything underneath
         * the cursor.
         *
         * This is what allows the next
         * flower underneath to become
         * interactive when the first one
         * disappears.
         */
        const elements = document.elementsFromPoint(lastX, lastY);

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
      });
    };

    window.addEventListener("pointermove", handlePointerMove, {
      passive: true,
    });

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);

      /*
       * Cancel pending frame.
       */
      if (frameId !== null) {
        window.cancelAnimationFrame(frameId);
      }

      /*
       * Clear all return timers.
       */
      returnTimers.current.forEach((timer) => {
        window.clearTimeout(timer);
      });

      returnTimers.current.clear();
    };
  }, []);

  /*
  |--------------------------------------------------------------------------
  | Nothing to render
  |--------------------------------------------------------------------------
  */

  if (!plants.length) {
    return null;
  }

  /*
  |--------------------------------------------------------------------------
  | Render
  |--------------------------------------------------------------------------
  */

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
      style={{
        contain: "layout style paint",
      }}
    >
      {plants.map((plant, index) => {
        const hasAppeared = index < visibleCount;

        const hasDisappeared = hiddenPlants.has(plant.id);

        /*
         * Keep the original behavior:
         * hidden flowers are removed.
         *
         * This is important because it allows
         * elementsFromPoint() to discover the
         * flower underneath.
         */
        if (!hasAppeared || hasDisappeared) {
          return null;
        }

        return (
          <div
            key={`${plant.drawing.url}-${plant.id}`}
            className="
                plant-appear
                pointer-events-none
                absolute
                flex
                items-center
                justify-center
              "
            style={
              {
                left: `${plant.left}%`,

                top: `${plant.top}%`,

                width: `${plant.width}px`,

                height: `${plant.height}px`,

                maxWidth: `${maxPlantWidth}px`,

                maxHeight: `${maxPlantHeight}px`,

                zIndex: plant.zIndex,

                /*
                 * Keep the original transform.
                 */
                transform: `
                  translate(-50%, -50%)
                  rotate(${plant.rotate}deg)
                  scaleX(${plant.flip})
                `,

                /*
                 * Pass the values to CSS so the
                 * appearance animation can preserve
                 * the flower's actual rotation.
                 */
                "--plant-rotate": `${plant.rotate}deg`,

                "--plant-flip": `${plant.flip}`,
              } as React.CSSProperties
            }
          >
            <img
              src={plant.drawing.url}
              alt={plant.drawing.alt || ""}
              data-plant-id={plant.id}
              draggable={false}
              decoding="async"
              loading="lazy"
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
