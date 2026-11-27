"use client";

/* eslint-disable @next/next/no-img-element */

import Link from "next/link";
import {
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from "react";

import SelectionFrame, { type ResizeCorner } from "./SelectionFrame";

export type Work = {
  _id: string;
  title: string;
  slug?: string;
  url: string;
  alt?: string;
  width?: number;
  height?: number;
};

type WorksColumnProps = {
  works: Work[];
  /** The site header (name + nav), rendered at the top of the column. */
  header: ReactNode;
};

type Layout = {
  x: number; // left offset, % of the column's content width
  width: number; // image width, % of the column's content width
  locked: boolean;
};

type ResizeState = {
  id: string;
  pointerId: number;
  corner: ResizeCorner;
  startClientX: number;
  startX: number;
  startWidth: number;
  containerWidth: number;
};

const DEFAULT_LAYOUT: Layout = { x: 0, width: 100, locked: false };
const MIN_WIDTH_PERCENT = 20;

function clamp(value: number, minimum: number, maximum: number) {
  return Math.min(Math.max(value, minimum), maximum);
}

/* ------------------------------- Icons ---------------------------------- */

const ICON_PROPS = {
  "aria-hidden": true,
  viewBox: "0 0 24 24",
  className: "h-[1em] w-[1em]",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
} as const;

function LockedIcon() {
  return (
    <svg {...ICON_PROPS}>
      <rect x="5" y="10" width="14" height="11" rx="1" />
      <path d="M8 10V7a4 4 0 0 1 8 0v3" />
    </svg>
  );
}

function UnlockedIcon() {
  return (
    <svg {...ICON_PROPS}>
      <rect x="5" y="10" width="14" height="11" rx="1" />
      <path d="M8 10V7a4 4 0 0 1 7.5-2" />
    </svg>
  );
}

// Shown on hover or keyboard focus, and always on touch screens.
const SHOW_ON_HOVER =
  "opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 [@media(hover:none)]:opacity-100";

/* ------------------------------ Component -------------------------------- */

export default function WorksColumn({ works, header }: WorksColumnProps) {
  const imagesRef = useRef<HTMLDivElement>(null);
  const resizeState = useRef<ResizeState | null>(null);

  const [layouts, setLayouts] = useState<Record<string, Layout>>({});

  const getLayout = (id: string): Layout => layouts[id] ?? DEFAULT_LAYOUT;

  function toggleLock(id: string) {
    resizeState.current = null;

    setLayouts((current) => {
      const layout = current[id] ?? DEFAULT_LAYOUT;
      return { ...current, [id]: { ...layout, locked: !layout.locked } };
    });
  }

  /* ------------------------------- Resize -------------------------------- */

  function handleResizePointerDown(
    event: ReactPointerEvent<HTMLButtonElement>,
    id: string,
    corner: ResizeCorner
  ) {
    event.stopPropagation();
    event.preventDefault();

    const layout = getLayout(id);
    const container = imagesRef.current;

    if (!container || layout.locked) {
      return;
    }

    const containerWidth = container.getBoundingClientRect().width;

    if (containerWidth <= 0) {
      return;
    }

    resizeState.current = {
      id,
      pointerId: event.pointerId,
      corner,
      startClientX: event.clientX,
      startX: layout.x,
      startWidth: layout.width,
      containerWidth,
    };

    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function handleResizePointerMove(
    event: ReactPointerEvent<HTMLButtonElement>
  ) {
    const resize = resizeState.current;

    if (!resize || resize.pointerId !== event.pointerId) {
      return;
    }

    event.preventDefault();

    const fromLeft =
      resize.corner === "top-left" || resize.corner === "bottom-left";

    const movement = event.clientX - resize.startClientX;
    const change =
      ((fromLeft ? -movement : movement) / resize.containerWidth) * 100;

    let nextWidth = resize.startWidth + change;
    let nextX = resize.startX;

    if (fromLeft) {
      // The right edge stays put; the left edge moves, but never past x = 0.
      const rightEdge = resize.startX + resize.startWidth;
      nextWidth = clamp(nextWidth, MIN_WIDTH_PERCENT, rightEdge);
      nextX = rightEdge - nextWidth;
    } else {
      // The left edge stays put; the right edge can't pass the column's edge.
      nextWidth = clamp(nextWidth, MIN_WIDTH_PERCENT, 100 - resize.startX);
    }

    setLayouts((current) => {
      const layout = current[resize.id] ?? DEFAULT_LAYOUT;
      return {
        ...current,
        [resize.id]: { ...layout, x: nextX, width: nextWidth },
      };
    });
  }

  function handleResizePointerUp(event: ReactPointerEvent<HTMLButtonElement>) {
    const resize = resizeState.current;

    if (!resize || resize.pointerId !== event.pointerId) {
      return;
    }

    event.stopPropagation();

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }

    resizeState.current = null;
  }

  /* -------------------------------- Render ------------------------------- */

  return (
    <section className="no-scrollbar pb-12 md:h-[100svh] md:overflow-y-auto">
      {header}

      {/* Images: titles show on hover, corner markers resize unless locked */}
      <div ref={imagesRef} className="mt-10 flex flex-col gap-6 px-4 md:px-10">
        {works.map((work) => {
          const layout = getLayout(work._id);

          const image = (
            <img
              src={work.url}
              alt={work.alt ?? work.title}
              width={work.width}
              height={work.height}
              draggable={false}
              className="block h-auto w-full select-none"
            />
          );

          return (
            <div
              key={work._id}
              className="group relative"
              style={{
                marginLeft: `${layout.x}%`,
                width: `${layout.width}%`,
              }}
            >
              {work.slug ? (
                <Link
                  href={`/projects/${encodeURIComponent(work.slug)}`}
                  aria-label={`Open ${work.title} project`}
                  className="block"
                >
                  {image}
                </Link>
              ) : (
                image
              )}

              <SelectionFrame
                resizable={!layout.locked}
                onResizePointerDown={(event, corner) =>
                  handleResizePointerDown(event, work._id, corner)
                }
                onResizePointerMove={handleResizePointerMove}
                onResizePointerUp={handleResizePointerUp}
              />

              {/* Title (and lock) over the image's top-left corner */}
              <div className="pointer-events-none absolute left-3 top-3 z-20 flex max-w-[calc(100%-1.5rem)] items-start gap-1.5 font-mabrypro text-[clamp(13px,1.1vw,17px)] font-normal leading-[1.2] tracking-[-0.02em]">
                <span
                  className={`min-w-0 bg-[#2f6cff] px-1.5 py-0.5 text-white transition-opacity duration-200 ${SHOW_ON_HOVER}`}
                >
                  {work.title}
                </span>

                <button
                  type="button"
                  aria-label={
                    layout.locked
                      ? `Unlock ${work.title} image`
                      : `Lock ${work.title} image`
                  }
                  aria-pressed={layout.locked}
                  title={
                    layout.locked
                      ? "Unlock image to resize it"
                      : "Lock image size"
                  }
                  className={`pointer-events-auto flex h-6 w-6 shrink-0 items-center justify-center border border-[#2f6cff] text-[14px] transition-opacity duration-200 ${
                    layout.locked
                      ? "bg-[#2f6cff] text-white opacity-100"
                      : `bg-white text-[#2f6cff] ${SHOW_ON_HOVER}`
                  }`}
                  onClick={() => toggleLock(work._id)}
                >
                  {layout.locked ? <LockedIcon /> : <UnlockedIcon />}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
