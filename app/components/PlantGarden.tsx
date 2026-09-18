"use client";

import { memo, useEffect, useMemo, useState } from "react";

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

type Plant = PlantPlacement & {
  drawing: PlantDrawing;
  /** Position in the reveal sequence (0 = first). */
  order: number;
};

/*
|--------------------------------------------------------------------------
| Config
|--------------------------------------------------------------------------
*/

const MOBILE_BREAKPOINT = 768;

// Big drop from 325. Overlapping, blended, full-screen layers are what
// crash the tab, so fewer + slightly larger plants looks nearly the same.
const DESKTOP_PLANT_COUNT = 140;
const MOBILE_PLANT_COUNT = 50;

const DESKTOP_COLUMNS = 14;
const MOBILE_COLUMNS = 7;

// Delay between each plant's entrance (pure CSS, no React state ticking).
const PLANT_INTERVAL = 45;
// Number of plants visible immediately so the page never looks empty.
const INITIAL_VISIBLE = 10;
// How long a hovered plant stays hidden.
const PLANT_RETURN_DELAY = 700;
// Fade-back duration when a hovered plant returns.
const PLANT_RETURN_FADE = 350;

const DESKTOP_MAX_PLANT_WIDTH = 220;
const DESKTOP_MAX_PLANT_HEIGHT = 400;

const MOBILE_MAX_PLANT_WIDTH = 130;
const MOBILE_MAX_PLANT_HEIGHT = 240;

/*
 * multiply blending is the single most expensive thing here.
 * Leave it off if your drawings are dark ink on transparent
 * backgrounds (the look is the same on white). Turn it on only if
 * your images have opaque white backgrounds that must merge.
 */
const USE_MULTIPLY_BLEND = false;

const COMPOSITION_SEED = 2847;

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

  const cellWidth = 100 / columns;
  const cellHeight = 100 / rows;

  return Array.from({ length: count }, (_, index) => {
    const column = index % columns;
    const row = Math.floor(index / columns);

    const horizontalJitter = (random() - 0.5) * cellWidth * 2.5;
    const verticalJitter = (random() - 0.5) * cellHeight * 2.5;

    let left = column * cellWidth + cellWidth / 2 + horizontalJitter;
    let top = row * cellHeight + cellHeight / 2 + verticalJitter;

    // Allow flowers to extend beyond the viewport.
    left += (random() - 0.5) * 8;
    top += (random() - 0.5) * 8;

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

const desktopPlacements = createPlacements(
  DESKTOP_PLANT_COUNT,
  DESKTOP_COLUMNS,
  COMPOSITION_SEED,
  {
    minWidth: 85,
    widthRange: 135,
    minHeight: 170,
    heightRange: 230,
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
| Media query hooks
|--------------------------------------------------------------------------
*/

function useMediaQuery(query: string): boolean | null {
  const [matches, setMatches] = useState<boolean | null>(null);

  useEffect(() => {
    const mediaQuery = window.matchMedia(query);

    setMatches(mediaQuery.matches);

    const handleChange = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };

    mediaQuery.addEventListener("change", handleChange);

    return () => {
      mediaQuery.removeEventListener("change", handleChange);
    };
  }, [query]);

  return matches;
}

/*
|--------------------------------------------------------------------------
| Single plant (memoized)
|
| Props never change after mount, so React renders each plant once and
| never touches it again. Hover hiding is done directly on the <img>
| element (see the effect in PlantGarden), so there is no React state
| involved in the hover interaction at all.
|--------------------------------------------------------------------------
*/

type PlantItemProps = {
  plant: Plant;
  maxWidth: number;
  maxHeight: number;
  reducedMotion: boolean;
};

const PlantItem = memo(function PlantItem({
  plant,
  maxWidth,
  maxHeight,
  reducedMotion,
}: PlantItemProps) {
  const delay = reducedMotion
    ? 0
    : Math.max(0, plant.order - INITIAL_VISIBLE) * PLANT_INTERVAL;

  return (
    <div
      className="plant-appear pointer-events-none absolute flex items-center justify-center"
      style={
        {
          left: `${plant.left}%`,
          top: `${plant.top}%`,
          width: `${plant.width}px`,
          height: `${plant.height}px`,
          maxWidth: `${maxWidth}px`,
          maxHeight: `${maxHeight}px`,
          zIndex: plant.zIndex,

          transform: `translate(-50%, -50%) rotate(${plant.rotate}deg) scaleX(${plant.flip})`,

          // Read by the .plant-appear keyframes.
          "--plant-rotate": `${plant.rotate}deg`,
          "--plant-flip": `${plant.flip}`,

          // Staggered reveal driven by CSS instead of a 70ms state tick.
          animationDelay: `${delay}ms`,
          animationFillMode: "backwards",
          animationDuration: reducedMotion ? "0ms" : undefined,
        } as React.CSSProperties
      }
    >
      <img
        src={plant.drawing.url}
        alt={plant.drawing.alt || ""}
        data-plant-id={plant.id}
        draggable={false}
        decoding="async"
        className="pointer-events-auto block h-full w-full select-none object-contain"
        style={{
          mixBlendMode: USE_MULTIPLY_BLEND ? "multiply" : undefined,
          transition: `opacity ${PLANT_RETURN_FADE}ms ease`,
        }}
      />
    </div>
  );
});

/*
|--------------------------------------------------------------------------
| Plant Garden
|--------------------------------------------------------------------------
*/

export default function PlantGarden({ drawings = [] }: PlantGardenProps) {
  const isMobile = useMediaQuery(`(max-width: ${MOBILE_BREAKPOINT}px)`);
  const prefersReducedMotion =
    useMediaQuery("(prefers-reduced-motion: reduce)") ?? false;

  const placements = isMobile ? mobilePlacements : desktopPlacements;

  const maxPlantWidth = isMobile
    ? MOBILE_MAX_PLANT_WIDTH
    : DESKTOP_MAX_PLANT_WIDTH;

  const maxPlantHeight = isMobile
    ? MOBILE_MAX_PLANT_HEIGHT
    : DESKTOP_MAX_PLANT_HEIGHT;

  /*
   * Attach drawings, work out the reveal order, then sort by z-index so
   * DOM order matches stacking (cheaper for the compositor).
   */
  const plants = useMemo<Plant[]>(() => {
    // Ignore any entries that somehow have no URL.
    const usable = drawings.filter((drawing) => Boolean(drawing?.url));

    if (!usable.length || isMobile === null) {
      return [];
    }

    const withDrawings = placements.map((placement, index) => ({
      ...placement,
      drawing: usable[index % usable.length],
    }));

    const revealOrder = [...withDrawings]
      .sort((a, b) => a.popOrder - b.popOrder)
      .map((plant) => plant.id);

    const orderById = new Map<number, number>();
    revealOrder.forEach((id, order) => orderById.set(id, order));

    return withDrawings
      .map((plant) => ({ ...plant, order: orderById.get(plant.id) ?? 0 }))
      .sort((a, b) => a.zIndex - b.zIndex);
  }, [drawings, placements, isMobile]);

  /*
  |--------------------------------------------------------------------------
  | Hover interaction
  |
  | Hidden plants are made transparent with pointer-events: none directly
  | on the DOM node. elementsFromPoint() skips them, so the plant
  | underneath becomes hoverable, exactly like before, but with zero React
  | re-renders and no unmount/remount (which would replay the entrance
  | animation and re-decode the image).
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    if (!plants.length) {
      return;
    }

    const timers = new Map<HTMLElement, number>();

    const hidePlantTemporarily = (image: HTMLElement) => {
      if (timers.has(image)) {
        return;
      }

      image.style.opacity = "0";
      image.style.pointerEvents = "none";

      const timer = window.setTimeout(() => {
        image.style.opacity = "";
        image.style.pointerEvents = "";
        timers.delete(image);
      }, PLANT_RETURN_DELAY);

      timers.set(image, timer);
    };

    let lastX = 0;
    let lastY = 0;
    let frameId: number | null = null;

    const handlePointerMove = (event: PointerEvent) => {
      lastX = event.clientX;
      lastY = event.clientY;

      if (frameId !== null) {
        return;
      }

      frameId = window.requestAnimationFrame(() => {
        frameId = null;

        const elements = document.elementsFromPoint(lastX, lastY);

        const hoveredPlant = elements.find((element) =>
          element.hasAttribute("data-plant-id")
        ) as HTMLElement | undefined;

        if (hoveredPlant) {
          hidePlantTemporarily(hoveredPlant);
        }
      });
    };

    window.addEventListener("pointermove", handlePointerMove, {
      passive: true,
    });

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);

      if (frameId !== null) {
        window.cancelAnimationFrame(frameId);
      }

      timers.forEach((timer, image) => {
        window.clearTimeout(timer);
        image.style.opacity = "";
        image.style.pointerEvents = "";
      });

      timers.clear();
    };
    // Re-bind when the set of plants changes (e.g. crossing the breakpoint).
  }, [plants]);

  if (!plants.length) {
    return null;
  }

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 h-[100svh] w-screen overflow-hidden bg-white"
      style={{ contain: "layout style paint" }}
    >
      {plants.map((plant) => (
        <PlantItem
          key={`${plant.drawing.url}-${plant.id}`}
          plant={plant}
          maxWidth={maxPlantWidth}
          maxHeight={maxPlantHeight}
          reducedMotion={prefersReducedMotion}
        />
      ))}
    </div>
  );
}
