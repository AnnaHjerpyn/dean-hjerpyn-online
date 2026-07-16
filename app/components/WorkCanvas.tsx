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

type ResizeCorner = "top-left" | "top-right" | "bottom-left" | "bottom-right";

type ResizeState = {
  projectId: string;
  pointerId: number;
  corner: ResizeCorner;

  startClientX: number;
  startClientY: number;

  startX: number;
  startY: number;
  startWidthPercent: number;

  startWidthPixels: number;
  startHeightPixels: number;

  canvasWidth: number;
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

type Rect = {
  left: number;
  top: number;
  width: number;
  height: number;
};

type ExclusionZone = {
  left: number;
  top: number;
  right: number;
  bottom: number;
};

type SelectionFrameProps = {
  resizable: boolean;

  onResizePointerDown: (
    event: ReactPointerEvent<HTMLButtonElement>,
    corner: ResizeCorner
  ) => void;

  onResizePointerMove: (event: ReactPointerEvent<HTMLButtonElement>) => void;

  onResizePointerUp: (event: ReactPointerEvent<HTMLButtonElement>) => void;
};

const BLUE = "#2f6cff";

const EXCLUSION_PADDING = 32;

const MIN_IMAGE_WIDTH_PERCENT = 14;
const MAX_IMAGE_WIDTH_PERCENT = 65;

/*
  x and width are percentages of the image canvas.
  y is measured in pixels.

  Increase width to make an image larger.
  Decrease y to move an image higher.
*/
const STARTING_POSITIONS = [
  {
    x: 3,
    y: 105,
    width: 31,
    zIndex: 1,
  },
  {
    x: 2,
    y: 640,
    width: 38,
    zIndex: 2,
  },
  {
    x: 30,
    y: 145,
    width: 32,
    zIndex: 3,
  },
  {
    x: 4,
    y: 405,
    width: 33,
    zIndex: 4,
  },
  {
    x: 24,
    y: 395,
    width: 38,
    zIndex: 5,
  },
  {
    x: 37,
    y: 315,
    width: 31,
    zIndex: 8,
  },
  {
    x: 39,
    y: 585,
    width: 38,
    zIndex: 6,
  },
];

function clamp(value: number, minimum: number, maximum: number) {
  return Math.min(Math.max(value, minimum), maximum);
}

function getAspectRatio(project: WorkProject) {
  return project.imageWidth && project.imageHeight
    ? project.imageWidth / project.imageHeight
    : 4 / 3;
}

/*
  If a card overlaps the Selected Works block, move it outside the
  padded exclusion zone using the shortest movement.
*/
function resolveExclusion(
  rect: Rect,
  zone: ExclusionZone | null,
  padding: number,
  canvasWidth: number
): Rect {
  if (!zone) {
    return rect;
  }

  const paddedZone = {
    left: zone.left - padding,
    top: zone.top - padding,
    right: zone.right + padding,
    bottom: zone.bottom + padding,
  };

  const rectRight = rect.left + rect.width;
  const rectBottom = rect.top + rect.height;

  const overlaps =
    rect.left < paddedZone.right &&
    rectRight > paddedZone.left &&
    rect.top < paddedZone.bottom &&
    rectBottom > paddedZone.top;

  if (!overlaps) {
    return rect;
  }

  const pushLeft = rectRight - paddedZone.left;
  const pushRight = paddedZone.right - rect.left;
  const pushUp = rectBottom - paddedZone.top;
  const pushDown = paddedZone.bottom - rect.top;

  const smallest = Math.min(pushLeft, pushRight, pushUp, pushDown);

  let nextLeft = rect.left;
  let nextTop = rect.top;

  if (smallest === pushLeft) {
    nextLeft = rect.left - pushLeft;
  } else if (smallest === pushRight) {
    nextLeft = rect.left + pushRight;
  } else if (smallest === pushUp) {
    nextTop = rect.top - pushUp;
  } else {
    nextTop = rect.top + pushDown;
  }

  const maxLeft = Math.max(0, canvasWidth - rect.width);

  return {
    ...rect,
    left: clamp(nextLeft, 0, maxLeft),
    top: Math.max(0, nextTop),
  };
}

function getResolvedDesktopRect(
  project: WorkProject,
  layout: ProjectLayout,
  canvasWidth: number,
  exclusionZone: ExclusionZone | null
): Rect {
  const width = canvasWidth * (layout.width / 100);
  const height = width / getAspectRatio(project);
  const left = (layout.x / 100) * canvasWidth;
  const top = layout.y;

  return resolveExclusion(
    {
      left,
      top,
      width,
      height,
    },
    exclusionZone,
    EXCLUSION_PADDING,
    canvasWidth
  );
}

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

function SelectionFrame({
  resizable,
  onResizePointerDown,
  onResizePointerMove,
  onResizePointerUp,
}: SelectionFrameProps) {
  const handles: Array<{
    corner: ResizeCorner;
    position: string;
    cursor: string;
  }> = [
    {
      corner: "top-left",
      position: "left-[-5px] top-[-5px]",
      cursor: "cursor-nwse-resize",
    },
    {
      corner: "top-right",
      position: "right-[-5px] top-[-5px]",
      cursor: "cursor-nesw-resize",
    },
    {
      corner: "bottom-left",
      position: "bottom-[-5px] left-[-5px]",
      cursor: "cursor-nesw-resize",
    },
    {
      corner: "bottom-right",
      position: "bottom-[-5px] right-[-5px]",
      cursor: "cursor-nwse-resize",
    },
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

      {handles.map(({ corner, position, cursor }) => (
        <button
          key={corner}
          type="button"
          aria-label={`Resize image from ${corner.replace("-", " ")}`}
          disabled={!resizable}
          className={`absolute h-[10px] w-[10px] border border-[#2f6cff] bg-white ${position} ${
            resizable ? `pointer-events-auto ${cursor}` : "pointer-events-none"
          }`}
          onPointerDown={(event) => onResizePointerDown(event, corner)}
          onPointerMove={onResizePointerMove}
          onPointerUp={onResizePointerUp}
          onPointerCancel={onResizePointerUp}
        />
      ))}
    </div>
  );
}

export default function WorkCanvas({ projects }: WorkCanvasProps) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const asideRef = useRef<HTMLElement>(null);

  const dragState = useRef<DragState | null>(null);
  const resizeState = useRef<ResizeState | null>(null);

  const [layouts, setLayouts] = useState<Record<string, ProjectLayout>>(() =>
    createInitialLayouts(projects)
  );

  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);

  const [canvasMetrics, setCanvasMetrics] = useState<CanvasMetrics>({
    width: 0,
    availableHeight: 0,
  });

  const [exclusionZone, setExclusionZone] = useState<ExclusionZone | null>(
    null
  );

  useEffect(() => {
    setLayouts((currentLayouts) => {
      const nextLayouts = {
        ...currentLayouts,
      };

      projects.forEach((project, index) => {
        if (nextLayouts[project._id]) {
          return;
        }

        const position = STARTING_POSITIONS[index % STARTING_POSITIONS.length];

        const group = Math.floor(index / STARTING_POSITIONS.length);

        nextLayouts[project._id] = {
          x: position.x,
          y: position.y + group * 900,
          width: position.width,
          visible: true,
          locked: true,
        };
      });

      return nextLayouts;
    });
  }, [projects]);

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

  useEffect(() => {
    const aside = asideRef.current;
    const canvas = canvasRef.current;

    if (!aside || !canvas) {
      return;
    }

    const updateExclusionZone = () => {
      const isDesktop = window.innerWidth >= 768;

      if (!isDesktop) {
        setExclusionZone((current) => (current === null ? current : null));

        return;
      }

      const asideBounds = aside.getBoundingClientRect();

      const canvasBounds = canvas.getBoundingClientRect();

      const left = asideBounds.left - canvasBounds.left;

      const top = asideBounds.top - canvasBounds.top;

      const next: ExclusionZone = {
        left,
        top,
        right: left + asideBounds.width,
        bottom: top + asideBounds.height,
      };

      setExclusionZone((current) => {
        if (
          current &&
          Math.abs(current.left - next.left) < 0.5 &&
          Math.abs(current.top - next.top) < 0.5 &&
          Math.abs(current.right - next.right) < 0.5 &&
          Math.abs(current.bottom - next.bottom) < 0.5
        ) {
          return current;
        }

        return next;
      });
    };

    updateExclusionZone();

    const resizeObserver = new ResizeObserver(updateExclusionZone);

    resizeObserver.observe(aside);
    resizeObserver.observe(canvas);

    window.addEventListener("resize", updateExclusionZone);

    return () => {
      resizeObserver.disconnect();

      window.removeEventListener("resize", updateExclusionZone);
    };
  }, []);

  const hasMeasuredWidth = canvasMetrics.width > 0;

  const desktopContentBottom = projects.reduce((lowestPoint, project) => {
    const layout = layouts[project._id];

    if (
      !layout ||
      !layout.visible ||
      !project.coverImageUrl ||
      !hasMeasuredWidth
    ) {
      return lowestPoint;
    }

    const rect = getResolvedDesktopRect(
      project,
      layout,
      canvasMetrics.width,
      exclusionZone
    );

    return Math.max(lowestPoint, rect.top + rect.height);
  }, 0);

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

    const mobileY = index * 340;

    const cardWidth = canvasMetrics.width;

    const cardHeight = cardWidth / getAspectRatio(project);

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

    dragState.current = null;
    resizeState.current = null;

    setLayouts((currentLayouts) => ({
      ...currentLayouts,

      [projectId]: {
        ...currentLayouts[projectId],
        locked: !currentLayouts[projectId].locked,
      },
    }));

    setActiveProjectId(projectId);
  }

  function handleResizePointerDown(
    event: ReactPointerEvent<HTMLButtonElement>,
    projectId: string,
    corner: ResizeCorner
  ) {
    event.stopPropagation();
    event.preventDefault();

    const layout = layouts[projectId];
    const canvas = canvasRef.current;

    if (!layout || !canvas || layout.locked || window.innerWidth < 768) {
      return;
    }

    const card = event.currentTarget.closest<HTMLElement>(".work-card");

    if (!card) {
      return;
    }

    const canvasBounds = canvas.getBoundingClientRect();

    const cardBounds = card.getBoundingClientRect();

    if (canvasBounds.width <= 0) {
      return;
    }

    dragState.current = null;

    resizeState.current = {
      projectId,
      pointerId: event.pointerId,
      corner,

      startClientX: event.clientX,
      startClientY: event.clientY,

      startX: layout.x,
      startY: layout.y,
      startWidthPercent: layout.width,

      startWidthPixels: cardBounds.width,
      startHeightPixels: cardBounds.height,

      canvasWidth: canvasBounds.width,
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

    event.stopPropagation();
    event.preventDefault();

    const movementX = event.clientX - resize.startClientX;

    const resizingFromLeft =
      resize.corner === "top-left" || resize.corner === "bottom-left";

    const resizingFromTop =
      resize.corner === "top-left" || resize.corner === "top-right";

    const horizontalResize = resizingFromLeft ? -movementX : movementX;

    const proposedWidthPixels = resize.startWidthPixels + horizontalResize;

    const proposedWidthPercent =
      (proposedWidthPixels / resize.canvasWidth) * 100;

    let nextWidthPercent = clamp(
      proposedWidthPercent,
      MIN_IMAGE_WIDTH_PERCENT,
      MAX_IMAGE_WIDTH_PERCENT
    );

    const aspectRatio = resize.startWidthPixels / resize.startHeightPixels;

    let nextWidthPixels = resize.canvasWidth * (nextWidthPercent / 100);

    let nextHeightPixels = nextWidthPixels / aspectRatio;

    let widthDifferencePixels = nextWidthPixels - resize.startWidthPixels;

    let heightDifferencePixels = nextHeightPixels - resize.startHeightPixels;

    let nextX = resize.startX;
    let nextY = resize.startY;

    if (resizingFromLeft) {
      const startLeftPixels = resize.canvasWidth * (resize.startX / 100);

      const maximumWidthFromLeft = startLeftPixels + resize.startWidthPixels;

      const maximumWidthFromLeftPercent =
        (maximumWidthFromLeft / resize.canvasWidth) * 100;

      nextWidthPercent = Math.min(
        nextWidthPercent,
        maximumWidthFromLeftPercent
      );

      nextWidthPixels = resize.canvasWidth * (nextWidthPercent / 100);

      nextHeightPixels = nextWidthPixels / aspectRatio;

      widthDifferencePixels = nextWidthPixels - resize.startWidthPixels;

      heightDifferencePixels = nextHeightPixels - resize.startHeightPixels;

      const nextLeftPixels = startLeftPixels - widthDifferencePixels;

      nextX =
        (clamp(nextLeftPixels, 0, resize.canvasWidth - nextWidthPixels) /
          resize.canvasWidth) *
        100;
    } else {
      const currentLeftPixels = resize.canvasWidth * (resize.startX / 100);

      const maximumWidthPixels = resize.canvasWidth - currentLeftPixels;

      const maximumWidthPercent =
        (maximumWidthPixels / resize.canvasWidth) * 100;

      nextWidthPercent = Math.min(nextWidthPercent, maximumWidthPercent);

      nextWidthPixels = resize.canvasWidth * (nextWidthPercent / 100);

      nextHeightPixels = nextWidthPixels / aspectRatio;

      heightDifferencePixels = nextHeightPixels - resize.startHeightPixels;
    }

    if (resizingFromTop) {
      nextY = Math.max(0, resize.startY - heightDifferencePixels);
    }

    setLayouts((currentLayouts) => {
      const current = currentLayouts[resize.projectId];

      if (!current) {
        return currentLayouts;
      }

      return {
        ...currentLayouts,

        [resize.projectId]: {
          ...current,
          x: nextX,
          y: nextY,
          width: nextWidthPercent,
        },
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

  function handlePointerDown(
    event: ReactPointerEvent<HTMLElement>,
    projectId: string
  ) {
    event.stopPropagation();

    if (resizeState.current) {
      return;
    }

    const layout = layouts[projectId];

    if (!layout) {
      return;
    }

    setActiveProjectId(projectId);

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
    if (resizeState.current) {
      return;
    }

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

    const nextTop = Math.max(0, drag.startY + movementY);

    const nextX = (nextLeftPixels / canvasBounds.width) * 100;

    setLayouts((currentLayouts) => {
      const current = currentLayouts[projectId];

      if (!current) {
        return currentLayouts;
      }

      return {
        ...currentLayouts,

        [projectId]: {
          ...current,
          x: nextX,
          y: nextTop,
        },
      };
    });
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
    <section className="relative z-0 w-full">
      {/* Selected Works list */}
      <aside
        ref={asideRef}
        className="relative z-20 mb-10 w-full bg-white md:absolute md:right-[3.5%] md:top-16 md:mb-0 md:w-[34%] md:max-w-[540px] md:px-5 md:py-4"
      >
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
                      ? "Unlock image to move or resize it"
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

      {/* Image canvas */}
      <div
        ref={canvasRef}
        className="work-canvas relative z-0 w-full"
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

          const mobileX = 0;

          const mobileY = index * 340;

          const resolvedDesktopRect = hasMeasuredWidth
            ? getResolvedDesktopRect(
                project,
                layout,
                canvasMetrics.width,
                exclusionZone
              )
            : null;

          const desktopX = resolvedDesktopRect
            ? `${resolvedDesktopRect.left}px`
            : `${layout.x}%`;

          const desktopY = resolvedDesktopRect
            ? `${resolvedDesktopRect.top}px`
            : `${layout.y}px`;

          const desktopWidth = resolvedDesktopRect
            ? `${resolvedDesktopRect.width}px`
            : `${layout.width}%`;

          const style: WorkCardStyle = {
            "--desktop-x": desktopX,
            "--desktop-y": desktopY,
            "--desktop-width": desktopWidth,

            "--mobile-x": `${mobileX}%`,
            "--mobile-y": `${mobileY}px`,
            "--mobile-width": "100%",

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
                  sizes="(max-width: 767px) 100vw, 32vw"
                  loading={index < 2 ? "eager" : "lazy"}
                  draggable={false}
                  className={`pointer-events-none object-contain transition-[filter] duration-300 ${
                    isActive ? "grayscale" : ""
                  }`}
                />

                {isActive && (
                  <SelectionFrame
                    resizable={!layout.locked}
                    onResizePointerDown={(event, corner) =>
                      handleResizePointerDown(event, project._id, corner)
                    }
                    onResizePointerMove={handleResizePointerMove}
                    onResizePointerUp={handleResizePointerUp}
                  />
                )}
              </div>
            </article>
          );
        })}
      </div>

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
