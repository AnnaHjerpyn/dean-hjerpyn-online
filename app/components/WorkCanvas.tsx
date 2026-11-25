"use client";

import Image, { type ImageLoaderProps } from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

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

function sanityImageLoader({ src, width, quality }: ImageLoaderProps): string {
  const url = new URL(src);

  url.searchParams.set("w", width.toString());
  url.searchParams.set("q", String(quality ?? 80));
  url.searchParams.set("fit", "max");
  url.searchParams.set("auto", "format");

  return url.toString();
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

/* Static selection box (frame, diagonals, corner squares) shown on
   whichever image is currently centered in the scroll column. */
function SelectionFrame() {
  const corners = [
    "left-[-5px] top-[-5px]",
    "right-[-5px] top-[-5px]",
    "bottom-[-5px] left-[-5px]",
    "bottom-[-5px] right-[-5px]",
  ];

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-10 border border-[#2f6cff]"
    >
      <svg
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

      {corners.map((position) => (
        <span
          key={position}
          className={`absolute h-[10px] w-[10px] border border-[#2f6cff] bg-white ${position}`}
        />
      ))}
    </div>
  );
}

export default function WorkCanvas({ projects }: WorkCanvasProps) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const pendingScrollId = useRef<string | null>(null);

  const [hiddenIds, setHiddenIds] = useState<Record<string, boolean>>({});
  const [activeProjectId, setActiveProjectId] = useState<string | null>(
    () => projects.find((project) => project.coverImageUrl)?._id ?? null
  );

  const visibleProjects = projects.filter(
    (project) => project.coverImageUrl && !hiddenIds[project._id]
  );

  // Changes whenever an image is shown or hidden.
  const visibleKey = visibleProjects.map((project) => project._id).join(",");

  function toggleVisibility(projectId: string) {
    const willHide = !hiddenIds[projectId];

    setHiddenIds((current) => ({ ...current, [projectId]: willHide }));

    if (willHide) {
      if (activeProjectId === projectId) {
        setActiveProjectId(null);
      }
    } else {
      setActiveProjectId(projectId);
      pendingScrollId.current = projectId;
    }
  }

  // After an image is shown again, scroll the column to it.
  useEffect(() => {
    const id = pendingScrollId.current;

    if (!id) {
      return;
    }

    pendingScrollId.current = null;

    scrollerRef.current
      ?.querySelector(`[data-project-id="${id}"]`)
      ?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [visibleKey]);

  // Desktop: highlight the project whose image crosses the middle of the
  // scroll column, and mirror that in the list on the right.
  useEffect(() => {
    const scroller = scrollerRef.current;

    if (!scroller) {
      return;
    }

    const query = window.matchMedia("(min-width: 768px)");
    let observer: IntersectionObserver | null = null;

    const setup = () => {
      observer?.disconnect();
      observer = null;

      if (!query.matches) {
        return;
      }

      const next = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) {
              return;
            }

            const id = (entry.target as HTMLElement).dataset.projectId;

            if (id) {
              setActiveProjectId(id);
            }
          });
        },
        { root: scroller, rootMargin: "-45% 0px -45% 0px", threshold: 0 }
      );

      scroller
        .querySelectorAll<HTMLElement>("[data-project-id]")
        .forEach((element) => next.observe(element));

      observer = next;
    };

    setup();
    query.addEventListener("change", setup);

    return () => {
      observer?.disconnect();
      query.removeEventListener("change", setup);
    };
  }, [visibleKey]);

  return (
    <section className="md:grid md:h-[100svh] md:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
      {/* Selected Works list (right column on desktop, first on mobile) */}
      <aside className="no-scrollbar px-4 pt-[130px] md:col-start-2 md:row-start-1 md:h-[100svh] md:overflow-y-auto md:px-10 md:pb-24 md:pt-[120px]">
        <h1 className="mb-3 font-mabrypro text-[clamp(25px,2.3vw,39px)] font-normal leading-none tracking-[-0.035em]">
          Selected Works
        </h1>

        <div>
          {projects.map((project) => {
            const hasImage = Boolean(project.coverImageUrl);
            const isHidden = Boolean(hiddenIds[project._id]);
            const isActive = activeProjectId === project._id && !isHidden;

            return (
              <div
                key={project._id}
                className={`flex min-w-0 items-start gap-2 py-[3px] font-mabrypro text-[clamp(18px,1.75vw,30px)] font-normal leading-[1.08] tracking-[-0.025em] ${
                  hasImage ? "" : "opacity-35"
                }`}
              >
                <button
                  type="button"
                  disabled={!hasImage}
                  aria-label={
                    isHidden
                      ? `Show ${project.title} image`
                      : `Hide ${project.title} image`
                  }
                  aria-pressed={!isHidden}
                  title={isHidden ? "Show project image" : "Hide project image"}
                  className="mt-[0.06em] flex shrink-0 items-center justify-center transition-opacity duration-200 hover:opacity-40 disabled:cursor-not-allowed"
                  onClick={() => toggleVisibility(project._id)}
                >
                  {isHidden ? <EyeOffIcon /> : <EyeIcon />}
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

      {/* Image scroll column (left on desktop) */}
      <div
        ref={scrollerRef}
        className="no-scrollbar flex flex-col gap-12 px-4 pb-24 pt-10 md:col-start-1 md:row-start-1 md:h-[100svh] md:gap-16 md:overflow-y-auto md:px-10 md:pt-[200px]"
      >
        {visibleProjects.map((project, index) => {
          const isActive = activeProjectId === project._id;

          const image = (
            <Image
              loader={sanityImageLoader}
              src={project.coverImageUrl as string}
              alt={project.coverImageAlt || project.title}
              width={project.imageWidth || 1600}
              height={project.imageHeight || 1200}
              sizes="(max-width: 767px) 100vw, 55vw"
              loading={index < 2 ? "eager" : "lazy"}
              draggable={false}
              className="block h-auto w-full"
            />
          );

          return (
            <div
              key={project._id}
              data-project-id={project._id}
              className="relative"
            >
              {project.slug ? (
                <Link
                  href={`/projects/${encodeURIComponent(project.slug)}`}
                  aria-label={`Open ${project.title} project`}
                  className="block"
                >
                  {image}
                </Link>
              ) : (
                image
              )}

              {isActive && <SelectionFrame />}
            </div>
          );
        })}
      </div>
    </section>
  );
}
