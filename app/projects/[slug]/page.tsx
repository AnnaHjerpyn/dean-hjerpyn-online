import Link from "next/link";
import { notFound } from "next/navigation";
import { PortableText } from "@portabletext/react";
import type { PortableTextBlock } from "@portabletext/types";
import { client } from "@/sanity/lib/client";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type GalleryImage = {
  url: string;
  width?: number;
  height?: number;
};

type Project = {
  title: string;
  location?: string;
  year?: string;
  firm?: string;
  role?: string;
  projectType?: string;
  slug?: string;
  description?: PortableTextBlock[];
  coverImageUrl?: string;
  gallery?: GalleryImage[];
};

type ProjectPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

async function getProject(slug: string): Promise<Project | null> {
  return client.fetch(
    `
      *[
        _type == "project" &&
        slug.current == $slug
      ][0] {
        title,
        location,
        year,
        firm,
        role,
        projectType,
        description,
        "slug": slug.current,
        "coverImageUrl": coverImage.asset->url,
        "gallery": gallery[] {
          "url": asset->url,
          "width": asset->metadata.dimensions.width,
          "height": asset->metadata.dimensions.height
        }
      }
    `,
    { slug },
    { cache: "no-store" }
  );
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { slug } = await params;
  const project = await getProject(slug);

  if (!project) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-white font-editorial font-normal text-[#1f1a13]">
      {/* Fixed site identity */}
      <Link
        href="/"
        aria-label="Return to homepage"
        className="fixed left-4 top-4 z-50 mix-blend-difference text-white md:left-8 md:top-8"
      >
        <span className="block text-[24px] font-normal uppercase leading-[0.86] tracking-[-0.05em] md:text-[2.2vw]">
          Dean
        </span>

        <span className="ml-[25px] block text-[24px] font-normal uppercase leading-[0.86] tracking-[-0.05em] md:ml-[1.8vw] md:text-[2.2vw]">
          Hjerpyn
        </span>
      </Link>

      {/* Navigation */}
      <nav className="fixed right-4 top-4 z-50 flex gap-4 text-[9px] font-normal uppercase tracking-[0.15em] mix-blend-difference text-white md:right-8 md:top-8 md:gap-7 md:text-[10px]">
        <Link href="/#work" className="transition-opacity hover:opacity-50">
          Index
        </Link>
      </nav>

      {/* Cover image */}
      {project.coverImageUrl && (
        <section className="h-[70svh] min-h-[500px] w-full md:h-screen">
          <img
            src={project.coverImageUrl}
            alt={project.title}
            className="h-full w-full object-cover"
          />
        </section>
      )}

      {/* Project information */}
      <section className="px-4 py-8 md:px-8 md:py-12">
        <div className="grid grid-cols-1 gap-10 border-t border-[#1f1a13] pt-5 md:grid-cols-12">
          <div className="md:col-span-7">
            <h1 className="text-[clamp(2.5rem,5vw,5.5rem)] font-normal uppercase leading-[0.9] tracking-[-0.055em]">
              {project.title}
            </h1>
          </div>

          <dl className="grid grid-cols-2 gap-x-6 gap-y-6 text-[9px] font-normal uppercase tracking-[0.12em] md:col-span-5 md:text-[10px]">
            {project.location && (
              <div>
                <dt className="mb-1 opacity-45">Location</dt>
                <dd className="font-normal">{project.location}</dd>
              </div>
            )}

            {project.year && (
              <div>
                <dt className="mb-1 opacity-45">Year</dt>
                <dd className="font-normal">{project.year}</dd>
              </div>
            )}

            {project.projectType && (
              <div>
                <dt className="mb-1 opacity-45">Project Type</dt>
                <dd className="font-normal">{project.projectType}</dd>
              </div>
            )}

            {project.firm && (
              <div>
                <dt className="mb-1 opacity-45">Firm</dt>
                <dd className="font-normal">{project.firm}</dd>
              </div>
            )}

            {project.role && (
              <div>
                <dt className="mb-1 opacity-45">Role</dt>
                <dd className="font-normal">{project.role}</dd>
              </div>
            )}
          </dl>
        </div>
      </section>

      {/* Description */}
      {project.description && project.description.length > 0 && (
        <section className="px-4 py-16 md:px-8 md:py-28">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-12">
            <p className="text-[9px] font-normal uppercase tracking-[0.15em] md:col-span-3 md:text-[10px]">
              Project
            </p>

            <div className="text-[clamp(1.5rem,2.25vw,2.5rem)] font-normal leading-[1.08] tracking-[-0.035em] md:col-span-7">
              <PortableText
                value={project.description}
                components={{
                  block: {
                    normal: ({ children }) => (
                      <p className="mb-8 font-normal last:mb-0">{children}</p>
                    ),

                    h1: ({ children }) => (
                      <h2 className="mb-6 mt-16 text-[clamp(2rem,3vw,3.5rem)] font-normal uppercase leading-[0.95] tracking-[-0.045em]">
                        {children}
                      </h2>
                    ),

                    h2: ({ children }) => (
                      <h2 className="mb-6 mt-16 text-[clamp(1.75rem,2.5vw,3rem)] font-normal uppercase leading-[0.95] tracking-[-0.04em]">
                        {children}
                      </h2>
                    ),

                    h3: ({ children }) => (
                      <h3 className="mb-5 mt-12 text-xl font-normal uppercase tracking-[-0.025em]">
                        {children}
                      </h3>
                    ),

                    blockquote: ({ children }) => (
                      <blockquote className="my-10 border-l border-[#1f1a13] pl-6 font-normal italic">
                        {children}
                      </blockquote>
                    ),
                  },

                  list: {
                    bullet: ({ children }) => (
                      <ul className="mb-8 list-disc space-y-2 pl-6">
                        {children}
                      </ul>
                    ),

                    number: ({ children }) => (
                      <ol className="mb-8 list-decimal space-y-2 pl-6">
                        {children}
                      </ol>
                    ),
                  },

                  marks: {
                    strong: ({ children }) => (
                      <span className="font-normal underline decoration-1 underline-offset-4">
                        {children}
                      </span>
                    ),

                    em: ({ children }) => (
                      <em className="font-normal italic">{children}</em>
                    ),

                    link: ({ children, value }) => (
                      <a
                        href={value?.href}
                        target="_blank"
                        rel="noreferrer"
                        className="font-normal underline decoration-1 underline-offset-4 transition-opacity hover:opacity-50"
                      >
                        {children}
                      </a>
                    ),
                  },
                }}
              />
            </div>
          </div>
        </section>
      )}

      {/* Gallery */}
      {project.gallery && project.gallery.length > 0 && (
        <section className="space-y-4 px-4 pb-20 md:space-y-8 md:px-8 md:pb-32">
          {project.gallery.map((image, index) => {
            const isPortrait =
              image.width !== undefined &&
              image.height !== undefined &&
              image.height > image.width;

            return (
              <figure
                key={`${image.url}-${index}`}
                className={isPortrait ? "mx-auto max-w-3xl" : "w-full"}
              >
                <img
                  src={image.url}
                  alt={`${project.title} — image ${index + 1}`}
                  className="h-auto w-full"
                  loading="lazy"
                />
              </figure>
            );
          })}
        </section>
      )}

      {/* Bottom navigation */}
      <footer className="px-4 pb-6 md:px-8 md:pb-8">
        <div className="flex items-center justify-between border-t border-[#1f1a13] pt-5 text-[9px] font-normal uppercase tracking-[0.15em] md:text-[10px]">
          <Link href="/work" className="transition-opacity hover:opacity-50">
            ← All projects
          </Link>

          <p className="font-normal">{project.year || "Dean Hjerpyn"}</p>
        </div>
      </footer>
    </main>
  );
}
