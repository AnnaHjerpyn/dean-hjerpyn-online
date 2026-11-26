import type { PointerEvent as ReactPointerEvent } from "react";

/*
  Blue selection box: thin border, corner-to-corner diagonals, and square
  corner markers. Drop it inside any `relative` wrapper around an image.

  The frame ignores the pointer so links underneath still work. If resize
  handlers are passed, the corner markers become draggable handles.
*/

export type ResizeCorner =
  | "top-left"
  | "top-right"
  | "bottom-left"
  | "bottom-right";

type SelectionFrameProps = {
  resizable?: boolean;
  onResizePointerDown?: (
    event: ReactPointerEvent<HTMLButtonElement>,
    corner: ResizeCorner
  ) => void;
  onResizePointerMove?: (event: ReactPointerEvent<HTMLButtonElement>) => void;
  onResizePointerUp?: (event: ReactPointerEvent<HTMLButtonElement>) => void;
};

const HANDLES: Array<{
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

const MARKER = "absolute h-[10px] w-[10px] border border-[#2f6cff] bg-white";

export default function SelectionFrame({
  resizable = false,
  onResizePointerDown,
  onResizePointerMove,
  onResizePointerUp,
}: SelectionFrameProps) {
  const interactive = Boolean(onResizePointerDown);

  return (
    <div
      aria-hidden={interactive ? undefined : true}
      className="pointer-events-none absolute inset-0 z-10 border border-[#2f6cff]"
    >
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
          stroke="#2f6cff"
          strokeWidth="1"
          vectorEffect="non-scaling-stroke"
        />
        <line
          x1="100"
          y1="0"
          x2="0"
          y2="100"
          stroke="#2f6cff"
          strokeWidth="1"
          vectorEffect="non-scaling-stroke"
        />
      </svg>

      {HANDLES.map(({ corner, position, cursor }) =>
        interactive ? (
          <button
            key={corner}
            type="button"
            aria-label={`Resize image from ${corner.replace("-", " ")}`}
            disabled={!resizable}
            style={{ touchAction: "none" }}
            className={`${MARKER} ${position} before:absolute before:-inset-2 before:content-[''] ${
              resizable
                ? `pointer-events-auto ${cursor}`
                : "pointer-events-none opacity-40"
            }`}
            onPointerDown={(event) => onResizePointerDown?.(event, corner)}
            onPointerMove={onResizePointerMove}
            onPointerUp={onResizePointerUp}
            onPointerCancel={onResizePointerUp}
          />
        ) : (
          <span key={corner} className={`${MARKER} ${position}`} />
        )
      )}
    </div>
  );
}
