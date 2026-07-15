"use client";

import Image, { type ImageLoaderProps } from "next/image";
import Link from "next/link";
import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
} from "react";

export type WorkProject = {
  _id: string;
  title: string;
  slug?: string;
  coverImageUrl?: string;
  coverImageAlt?: string;
  imageWidth?: number;
  imageHeight?: number;
};

type WorkCanvasProps = {
  projects: WorkProject[];
};

type ProjectLayout = {
  x: number;
  y: number;
  width: number;
  visible: boolean;
  locked: boolean;
};

type DragState = {
  projectId: string;
  pointerId: number;
  startClientX: number;
  startClientY: number;
  startX: number;
  startY: number;
  cardWidth: number;
  cardHeight: number;
};

type WorkCardStyle = CSSProperties & {
  "--desktop-x": string;
  "--desktop-y": string;
  "--desktop-width": string;
  "--mobile-x": string;
  "--mobile-y": string;
  "--mobile-width": string;
};

type CanvasStyle = CSSProperties & {
  "--desktop-height": string;
  "--mobile-height": string;
};

type CanvasMetrics = {
  width: number;
  availableHeight: number;
};

const BLUE = "#2f6cff";

/*
  x and width are percentages of the left image canvas.

  y is measured in pixels.

  Increase width to make an image larger.
  Decrease y to move an image higher.
*/
const STARTING_POSITIONS = [
  {
    x: 1,
    y: 0,
    width: 34,
  },
  {
    x: 35,
    y: 0,
    width: 31,
  },
  {
    x: 27,
    y: 0,
    width: 39,
  },
  {
    x: 0,
    y: 40,
    width: 36,
  },
  {
    x: 39,
    y: 10,
    width: 33,
  },
  {
    x: 1,
    y: 110,
    width: 32,
  },
  {
    x: 50,
    y: 65,
    width: 47,
  },
];

function clamp(value: number, minimum: number, maximum: number) {
  return Math.min(Math.max(value, minimum), maximum);
}

/*
  This sends each requested responsive width directly to Sanity.

  The image no longer has to pass through your website's
  /_next/image optimization route.
*/
function sanityImageLoader({ src, width, quality }: ImageLoaderProps): string {
  const url = new URL(src);

  url.searchParams.set("w", width.toString());
  url.searchParams.set("q", String(quality ?? 80));
  url.searchParams.set("fit", "max");
  url.searchParams.set("auto", "format");

  return url.toString();
}

function createInitialLayouts(projects: WorkProject[]) {
  const layouts: Record<string, ProjectLayout> = {};

  projects.forEach((project, index) => {
    const position = STARTING_POSITIONS[index % STARTING_POSITIONS.length];

    const group = Math.floor(index / STARTING_POSITIONS.length);

    layouts[project._id] = {
      x: position.x,
      y: position.y + group * 900,
      width: position.width,
      visible: true,
      locked: true,
    };
  });

  return layouts;
}

function EyeIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-[1em] w-[1em]"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-[1em] w-[1em]"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="m3 3 18 18" />

      <path d="M10.6 6.2A11 11 0 0 1 12 6c6.5 0 10 6 10 6a18 18 0 0 1-2.1 2.8" />

      <path d="M6.6 6.6C3.6 8.4 2 12 2 12s3.5 6 10 6a10.8 10.8 0 0 0 4.1-.8" />

      <path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" />
    </svg>
  );
}

function LockedIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-[1em] w-[1em]"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <rect x="5" y="10" width="14" height="11" rx="1" />
      <path d="M8 10V7a4 4 0 0 1 8 0v3" />
    </svg>
  );
}

function UnlockedIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-[1em] w-[1em]"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <rect x="5" y="10" width="14" height="11" rx="1" />
      <path d="M8 10V7a4 4 0 0 1 7.5-2" />
    </svg>
  );
}

function SelectionFrame() {
  const handles = [
    "left-[-4px] top-[-4px]",
    "right-[-4px] top-[-4px]",
    "bottom-[-4px] left-[-4px]",
    "bottom-[-4px] right-[-4px]",
  ];

  return (
    <div className="pointer-events-none absolute inset-0 z-20 border border-[#2f6cff]">
      <svg
        aria-hidden="true"
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

      {handles.map((position) => (
        <span
          key={position}
          className={`absolute h-[8px] w-[8px] border border-[#2f6cff] bg-white ${position}`}
        />
      ))}
    </div>
  );
}

export default function WorkCanvas({ projects }: WorkCanvasProps) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const dragState = useRef<DragState | null>(null);

  const [layouts, setLayouts] = useState<Record<string, ProjectLayout>>(() =>
    createInitialLayouts(projects)
  );

  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);

  const [canvasMetrics, setCanvasMetrics] = useState<CanvasMetrics>({
    width: 0,
    availableHeight: 0,
  });

  /*
    Measure the amount of viewport space remaining beneath the canvas.

    The canvas fills that remaining space without creating unnecessary
    page scrolling. It becomes taller when an image extends past it.
  */
  useEffect(() => {
    const canvas = canvasRef.current;

    if (!canvas) {
      return;
    }

    const updateCanvasMetrics = () => {
      const bounds = canvas.getBoundingClientRect();

      const canvasTopOnPage = bounds.top + window.scrollY;
      const nextWidth = bounds.width;

      const nextAvailableHeight = Math.max(
        0,
        window.innerHeight - canvasTopOnPage
      );

      setCanvasMetrics((currentMetrics) => {
        const widthChanged = Math.abs(currentMetrics.width - nextWidth) > 0.5;

        const heightChanged =
          Math.abs(currentMetrics.availableHeight - nextAvailableHeight) > 0.5;

        if (!widthChanged && !heightChanged) {
          return currentMetrics;
        }

        return {
          width: nextWidth,
          availableHeight: nextAvailableHeight,
        };
      });
    };

    updateCanvasMetrics();

    const resizeObserver = new ResizeObserver(updateCanvasMetrics);

    resizeObserver.observe(canvas);
    window.addEventListener("resize", updateCanvasMetrics);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", updateCanvasMetrics);
    };
  }, []);

  /*
    Find the lowest visible desktop image.

    The canvas height is based on that image instead of always being
    forced to a fixed height.
  */
  const desktopContentBottom = projects.reduce((lowestPoint, project) => {
    const layout = layouts[project._id];

    if (
      !layout ||
      !layout.visible ||
      !project.coverImageUrl ||
      canvasMetrics.width <= 0
    ) {
      return lowestPoint;
    }

    const cardWidth = canvasMetrics.width * (layout.width / 100);

    const aspectRatio =
      project.imageWidth && project.imageHeight
        ? project.imageWidth / project.imageHeight
        : 4 / 3;

    const cardHeight = cardWidth / aspectRatio;
    const cardBottom = layout.y + cardHeight;

    return Math.max(lowestPoint, cardBottom);
  }, 0);

  /*
    Find the lowest visible mobile image using the same mobile
    positions used by the cards below.
  */
  const mobileContentBottom = projects.reduce((lowestPoint, project, index) => {
    const layout = layouts[project._id];

    if (
      !layout ||
      !layout.visible ||
      !project.coverImageUrl ||
      canvasMetrics.width <= 0
    ) {
      return lowestPoint;
    }

    const mobileColumn = index % 2;
    const mobileRow = Math.floor(index / 2);

    const mobileY = mobileRow * 250 + (mobileColumn === 0 ? 0 : 0);

    const cardWidth = canvasMetrics.width * 0.49;

    const aspectRatio =
      project.imageWidth && project.imageHeight
        ? project.imageWidth / project.imageHeight
        : 4 / 3;

    const cardHeight = cardWidth / aspectRatio;
    const cardBottom = mobileY + cardHeight;

    return Math.max(lowestPoint, cardBottom);
  }, 0);

  const desktopCanvasHeight = Math.ceil(
    Math.max(canvasMetrics.availableHeight, desktopContentBottom + 24)
  );

  const mobileCanvasHeight = Math.ceil(
    Math.max(canvasMetrics.availableHeight, mobileContentBottom + 24)
  );

  function toggleVisibility(projectId: string) {
    const currentLayout = layouts[projectId];

    if (!currentLayout) {
      return;
    }

    const nextVisible = !currentLayout.visible;

    setLayouts((currentLayouts) => ({
      ...currentLayouts,
      [projectId]: {
        ...currentLayouts[projectId],
        visible: nextVisible,
      },
    }));

    if (!nextVisible && activeProjectId === projectId) {
      setActiveProjectId(null);
    }

    if (nextVisible) {
      setActiveProjectId(projectId);
    }
  }

  function toggleLock(projectId: string) {
    const currentLayout = layouts[projectId];

    if (!currentLayout) {
      return;
    }

    setLayouts((currentLayouts) => ({
      ...currentLayouts,
      [projectId]: {
        ...currentLayouts[projectId],
        locked: !currentLayouts[projectId].locked,
      },
    }));

    setActiveProjectId(projectId);
  }

  function handlePointerDown(
    event: ReactPointerEvent<HTMLElement>,
    projectId: string
  ) {
    event.stopPropagation();

    const layout = layouts[projectId];

    if (!layout) {
      return;
    }

    setActiveProjectId(projectId);

    /*
      Images can be selected on mobile, but dragging only works
      on desktop.
    */
    if (window.innerWidth < 768 || layout.locked) {
      return;
    }

    const cardBounds = event.currentTarget.getBoundingClientRect();

    dragState.current = {
      projectId,
      pointerId: event.pointerId,
      startClientX: event.clientX,
      startClientY: event.clientY,
      startX: layout.x,
      startY: layout.y,
      cardWidth: cardBounds.width,
      cardHeight: cardBounds.height,
    };

    event.currentTarget.setPointerCapture(event.pointerId);
    event.preventDefault();
  }

  function handlePointerMove(
    event: ReactPointerEvent<HTMLElement>,
    projectId: string
  ) {
    const drag = dragState.current;
    const canvas = canvasRef.current;

    if (
      !drag ||
      !canvas ||
      drag.projectId !== projectId ||
      drag.pointerId !== event.pointerId
    ) {
      return;
    }

    const canvasBounds = canvas.getBoundingClientRect();

    if (canvasBounds.width <= 0) {
      return;
    }

    const movementX = event.clientX - drag.startClientX;
    const movementY = event.clientY - drag.startClientY;

    const startingLeftPixels = (drag.startX / 100) * canvasBounds.width;

    const maximumLeft = Math.max(0, canvasBounds.width - drag.cardWidth);

    const nextLeftPixels = clamp(
      startingLeftPixels + movementX,
      0,
      maximumLeft
    );

    /*
      There is no fixed maximum Y position.

      Dragging an image lower automatically increases the canvas
      height, and the page becomes scrollable when the image extends
      past the viewport.
    */
    const nextTop = Math.max(0, drag.startY + movementY);

    const nextX = (nextLeftPixels / canvasBounds.width) * 100;

    setLayouts((currentLayouts) => ({
      ...currentLayouts,
      [projectId]: {
        ...currentLayouts[projectId],
        x: nextX,
        y: nextTop,
      },
    }));
  }

  function handlePointerUp(
    event: ReactPointerEvent<HTMLElement>,
    projectId: string
  ) {
    const drag = dragState.current;

    if (!drag || drag.projectId !== projectId) {
      return;
    }

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }

    dragState.current = null;
  }

  return (
    <section className="-mt-6 grid w-full gap-12 md:-mt-12 md:grid-cols-[minmax(0,1.65fr)_minmax(340px,0.95fr)] md:gap-10">
      <div
        ref={canvasRef}
        className="work-canvas relative order-2 w-full md:order-1"
        style={
          {
            "--desktop-height": `${desktopCanvasHeight}px`,
            "--mobile-height": `${mobileCanvasHeight}px`,
          } as CanvasStyle
        }
        onPointerDown={(event) => {
          if (event.target === event.currentTarget) {
            setActiveProjectId(null);
          }
        }}
      >
        {projects.map((project, index) => {
          const layout = layouts[project._id];

          if (!layout || !layout.visible || !project.coverImageUrl) {
            return null;
          }

          const isActive = activeProjectId === project._id;

          const imageAspectRatio =
            project.imageWidth && project.imageHeight
              ? `${project.imageWidth} / ${project.imageHeight}`
              : "4 / 3";

          const mobileColumn = index % 2;
          const mobileRow = Math.floor(index / 2);

          const mobileX = mobileColumn === 0 ? 0 : 51;

          const mobileY = mobileRow * 250 + (mobileColumn === 0 ? 0 : 0);

          const style: WorkCardStyle = {
            "--desktop-x": `${layout.x}%`,
            "--desktop-y": `${layout.y}px`,
            "--desktop-width": `${layout.width}%`,
            "--mobile-x": `${mobileX}%`,
            "--mobile-y": `${mobileY}px`,
            "--mobile-width": "49%",
            aspectRatio: imageAspectRatio,
            zIndex: isActive ? 40 : index + 1,
            touchAction: layout.locked ? "auto" : "none",
          };

          return (
            <article
              key={project._id}
              style={style}
              className={`work-card absolute select-none ${
                layout.locked
                  ? "cursor-pointer"
                  : "cursor-grab active:cursor-grabbing"
              }`}
              onPointerDown={(event) => handlePointerDown(event, project._id)}
              onPointerMove={(event) => handlePointerMove(event, project._id)}
              onPointerUp={(event) => handlePointerUp(event, project._id)}
              onPointerCancel={(event) => handlePointerUp(event, project._id)}
            >
              <div className="relative h-full w-full overflow-visible bg-[#eeeeee]">
                <Image
                  loader={sanityImageLoader}
                  src={project.coverImageUrl}
                  alt={project.coverImageAlt || project.title}
                  fill
                  sizes="(max-width: 767px) 49vw, 32vw"
                  loading={index < 2 ? "eager" : "lazy"}
                  draggable={false}
                  className="object-contain"
                />

                {isActive && <SelectionFrame />}
              </div>
            </article>
          );
        })}
      </div>

      <aside className="order-1 self-start md:order-2 md:sticky md:top-24">
        <h1 className="mb-3 font-mabrypro text-[clamp(25px,2.3vw,39px)] font-semibold leading-none tracking-[-0.035em]">
          Selected Works
        </h1>

        <div>
          {projects.map((project) => {
            const layout = layouts[project._id];

            if (!layout) {
              return null;
            }

            const hasImage = Boolean(project.coverImageUrl);

            const isActive = activeProjectId === project._id;

            return (
              <div
                key={project._id}
                className={`flex min-w-0 items-start gap-2 py-[3px] font-mabrypro text-[clamp(18px,1.75vw,30px)] font-semibold leading-[1.08] tracking-[-0.025em] ${
                  hasImage ? "" : "opacity-35"
                }`}
              >
                <button
                  type="button"
                  disabled={!hasImage}
                  aria-label={
                    layout.visible
                      ? `Hide ${project.title} image`
                      : `Show ${project.title} image`
                  }
                  aria-pressed={layout.visible}
                  title={
                    layout.visible ? "Hide project image" : "Show project image"
                  }
                  className="mt-[0.06em] flex shrink-0 items-center justify-center transition-opacity duration-200 hover:opacity-40 disabled:cursor-not-allowed"
                  onClick={() => toggleVisibility(project._id)}
                >
                  {layout.visible ? <EyeIcon /> : <EyeOffIcon />}
                </button>

                <button
                  type="button"
                  disabled={!hasImage}
                  aria-label={
                    layout.locked
                      ? `Unlock ${project.title} image`
                      : `Lock ${project.title} image`
                  }
                  aria-pressed={!layout.locked}
                  title={
                    layout.locked
                      ? "Unlock image to drag it"
                      : "Lock image in place"
                  }
                  className={`mt-[0.06em] flex shrink-0 items-center justify-center transition-opacity duration-200 hover:opacity-40 disabled:cursor-not-allowed ${
                    layout.locked ? "" : "text-[#2f6cff]"
                  }`}
                  onClick={() => toggleLock(project._id)}
                >
                  {layout.locked ? <LockedIcon /> : <UnlockedIcon />}
                </button>

                {project.slug ? (
                  <Link
                    href={`/projects/${encodeURIComponent(project.slug)}`}
                    aria-label={`Open ${project.title} project`}
                    className="min-w-0"
                  >
                    <span
                      className={`box-decoration-clone transition-[color,background-color,opacity] duration-150 ${
                        isActive
                          ? "bg-[#2f6cff] px-1 text-white"
                          : "hover:opacity-45"
                      }`}
                    >
                      {project.title}
                    </span>
                  </Link>
                ) : (
                  <span
                    title="Generate and publish a slug for this project in Sanity"
                    className={isActive ? "bg-[#2f6cff] px-1 text-white" : ""}
                  >
                    {project.title}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </aside>

      <style jsx>{`
        .work-canvas {
          height: var(--mobile-height);
        }

        .work-card {
          left: var(--mobile-x);
          top: var(--mobile-y);
          width: var(--mobile-width);
        }

        @media (min-width: 768px) {
          .work-canvas {
            height: var(--desktop-height);
          }

          .work-card {
            left: var(--desktop-x);
            top: var(--desktop-y);
            width: var(--desktop-width);
          }
        }
      `}</style>
    </section>
  );
}
