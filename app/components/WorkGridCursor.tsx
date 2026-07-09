"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
} from "motion/react";

type Project = {
  title: string;
  location?: string;
  year?: string;
  firm?: string;
  role?: string;
  projectType?: string;
  slug?: string;
  coverImageUrl?: string;
};

type WorkGridCursorProps = {
  projects: Project[];
};

export default function WorkGridCursor({ projects }: WorkGridCursorProps) {
  const [isHoveringImage, setIsHoveringImage] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  const mouseX = useMotionValue(-100);
  const mouseY = useMotionValue(-100);

  const smoothX = useSpring(mouseX, {
    stiffness: 700,
    damping: 45,
    mass: 0.25,
  });

  const smoothY = useSpring(mouseY, {
    stiffness: 700,
    damping: 45,
    mass: 0.25,
  });

  useEffect(() => {
    function handlePointerMove(event: PointerEvent) {
      mouseX.set(event.clientX - 42);
      mouseY.set(event.clientY - 42);
    }

    window.addEventListener("pointermove", handlePointerMove);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
    };
  }, [mouseX, mouseY]);

  return (
    <>
      <motion.div
        aria-hidden="true"
        className="pointer-events-none fixed left-0 top-0 z-[100] hidden h-[84px] w-[84px] items-center justify-center rounded-full border border-white/70 bg-white/10 font-editorial text-[9px] font-normal uppercase tracking-[0.16em] text-white mix-blend-difference backdrop-blur-sm md:flex"
        style={{
          x: smoothX,
          y: smoothY,
        }}
        animate={{
          opacity: isHoveringImage && !prefersReducedMotion ? 1 : 0,
          scale: isHoveringImage && !prefersReducedMotion ? 1 : 0.55,
        }}
        transition={{
          duration: 0.18,
          ease: "easeOut",
        }}
      >
        View
      </motion.div>

      <div className="grid gap-x-4 gap-y-8 md:grid-cols-2 lg:grid-cols-3">
        {projects.map((project) => {
          const href = project.slug ? `/projects/${project.slug}` : "/work";

          return (
            <article key={project.title} className="group">
              <Link href={href} className="block">
                <div
                  onPointerEnter={() => setIsHoveringImage(true)}
                  onPointerLeave={() => setIsHoveringImage(false)}
                  className="aspect-[4/3] overflow-hidden bg-[#f4f2ed] md:cursor-none"
                >
                  {project.coverImageUrl ? (
                    <img
                      src={project.coverImageUrl}
                      alt={project.title}
                      className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.035]"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center font-editorial text-[9px] uppercase tracking-[0.16em] opacity-40">
                      No image
                    </div>
                  )}
                </div>

                <div className="mt-2 flex justify-between gap-4 font-editorial text-[9px] font-normal uppercase leading-tight tracking-[0.16em]">
                  <h2>{project.title}</h2>
                  {project.year && <p>{project.year}</p>}
                </div>

                {(project.location || project.projectType) && (
                  <div className="mt-1 flex justify-between gap-4 font-sabon text-sm leading-tight opacity-70">
                    {project.location && <p>{project.location}</p>}
                    {project.projectType && <p>{project.projectType}</p>}
                  </div>
                )}
              </Link>
            </article>
          );
        })}
      </div>
    </>
  );
}
