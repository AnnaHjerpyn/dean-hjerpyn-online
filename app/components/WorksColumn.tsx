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

function EyeIcon() {
  return (
    <svg {...ICON_PROPS}>
      <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg {...ICON_PROPS}>
      <path d="m3 3 18 18" />
      <path d="M10.6 6.2A11 11 0 0 1 12 6c6.5 0 10 6 10 6a18 18 0 0 1-2.1 2.8" />
      <path d="M6.6 6.6C3.6 8.4 2 12 2 12s3.5 6 10 6a10.8 10.8 0 0 0 4.1-.8" />
      <path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" />
    </svg>
  );
}

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

/* ------------------------------ Component -------------------------------- */

export default function WorksColumn({ works, header }: WorksColumnProps) {
  const imagesRef = useRef<HTMLDivElement>(null);
  const resizeState = useRef<ResizeState | null>(null);

  const [layouts, setLayouts] = useState<Record<string, Layout>>({});
  const [hiddenIds, setHiddenIds] = useState<Record<string, boolean>>({});
  const [activeId, setActiveId] = useState<string | null>(null);

  const getLayout = (id: string): Layout => layouts[id] ?? DEFAULT_LAYOUT;

  const visibleWorks = works.filter((work) => !hiddenIds[work._id]);

  function toggleVisibility(id: string) {
    setHiddenIds((current) => ({ ...current, [id]: !current[id] }));
  }

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
      {/* Name + nav, with the Selected Works list beside it on wide screens */}
      <div className="xl:flex xl:items-start xl:justify-between xl:gap-10 xl:pr-10">
        <div className="shrink-0">{header}</div>

        <aside className="px-4 pt-8 md:px-10 xl:mt-8 xl:max-w-[380px] xl:flex-1 xl:px-0 xl:pt-0">
          <h2 className="mb-2 font-mabrypro text-[clamp(16px,1.3vw,22px)] font-normal leading-none tracking-[-0.03em]">
            Selected Works
          </h2>

          <div className="text-pretty">
            {works.map((work) => {
              const layout = getLayout(work._id);
              const isHidden = Boolean(hiddenIds[work._id]);
              const isActive = activeId === work._id && !isHidden;

              // Icons appear on hover, and stay visible when they show a
              // non-default state (hidden / locked) and on touch screens.
              const iconVisibility = (alwaysOn: boolean) =>
                alwaysOn
                  ? "opacity-100"
                  : "opacity-0 group-hover:opacity-100 focus-visible:opacity-100 [@media(hover:none)]:opacity-100";

              // Same padding on every title so the highlight never changes
              // the text's width or where it wraps.
              const titleClasses = `-mx-1 box-decoration-clone px-1 transition-[color,background-color,opacity] duration-150 ${
                isActive ? "bg-[#2f6cff] text-white" : "hover:opacity-45"
              }`;

              return (
                <div
                  key={work._id}
                  onPointerEnter={() => setActiveId(work._id)}
                  onPointerLeave={() => setActiveId(null)}
                  className="group grid min-w-0 grid-cols-[1em_1em_minmax(0,1fr)] items-start gap-x-2 py-[3px] font-mabrypro text-[clamp(13px,1vw,16px)] font-normal leading-[1.25] tracking-[-0.02em]"
                >
                  <button
                    type="button"
                    aria-label={
                      isHidden
                        ? `Show ${work.title} image`
                        : `Hide ${work.title} image`
                    }
                    aria-pressed={!isHidden}
                    title={
                      isHidden ? "Show project image" : "Hide project image"
                    }
                    className={`flex h-[1.25em] w-[1em] items-center justify-center transition-opacity duration-200 hover:!opacity-40 ${iconVisibility(
                      isHidden
                    )}`}
                    onClick={() => toggleVisibility(work._id)}
                  >
                    {isHidden ? <EyeOffIcon /> : <EyeIcon />}
                  </button>

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
                    className={`flex h-[1.25em] w-[1em] items-center justify-center transition-opacity duration-200 hover:!opacity-40 ${
                      layout.locked ? "" : "text-[#2f6cff]"
                    } ${iconVisibility(layout.locked)}`}
                    onClick={() => toggleLock(work._id)}
                  >
                    {layout.locked ? <LockedIcon /> : <UnlockedIcon />}
                  </button>

                  {work.slug ? (
                    <Link
                      href={`/projects/${encodeURIComponent(work.slug)}`}
                      aria-label={`Open ${work.title} project`}
                      className="min-w-0"
                    >
                      <span className={titleClasses}>{work.title}</span>
                    </Link>
                  ) : (
                    <span className="min-w-0">
                      <span className={titleClasses}>{work.title}</span>
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </aside>
      </div>

      {/* Images: each can be resized from its corner markers unless locked */}
      <div ref={imagesRef} className="mt-10 flex flex-col gap-6 px-4 md:px-10">
        {visibleWorks.map((work) => {
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
              className="relative"
              style={{
                marginLeft: `${layout.x}%`,
                width: `${layout.width}%`,
              }}
              onPointerEnter={() => setActiveId(work._id)}
              onPointerLeave={() => setActiveId(null)}
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
            </div>
          );
        })}
      </div>
    </section>
  );
}
