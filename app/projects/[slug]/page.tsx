import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PortableText } from "@portabletext/react";
import type { PortableTextBlock } from "@portabletext/types";
import { client } from "@/sanity/lib/client";
import ExpandableImage from "@/app/components/ExpandableImage";

export const dynamic = "force-dynamic";
export const revalidate = 0;

/* -------------------------------------------------------------------------- */
/* Types                                                                      */
/* -------------------------------------------------------------------------- */

type SanityImage = {
  url: string;
  alt?: string;
  width?: number;
  height?: number;
  lqip?: string;
};

type GalleryImage = {
  _type: "image";
  _key: string;
  url: string;
  alt?: string;
  caption?: string;
  width?: number;
  height?: number;
  lqip?: string;
};

type GalleryVideo = {
  _type: "video";
  _key: string;
  url: string;
  caption?: string;
};

type GalleryPdf = {
  _type: "pdf";
  _key: string;
  url: string;
  title?: string;
  filename?: string;
};

type GalleryItem = GalleryImage | GalleryVideo | GalleryPdf;

type Project = {
  title: string;
  location?: string;
  year?: string;
  firm?: string;
  role?: string;
  projectType?: string;
  professor?: string;
  collaborators?: string[];
  slug?: string;
  description?: PortableTextBlock[];
  coverImage?: SanityImage;
  gallery?: GalleryItem[];
};

type SiteSettings = {
  email?: string;
};

type ProjectPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

/* -------------------------------------------------------------------------- */
/* Queries                                                                    */
/* -------------------------------------------------------------------------- */

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
        professor,
        collaborators,
        description,

        "slug": slug.current,

        "coverImage": coverImage {
          alt,
          "url": asset->url,
          "width": asset->metadata.dimensions.width,
          "height": asset->metadata.dimensions.height,
          "lqip": asset->metadata.lqip
        },

        "gallery": gallery[] {
          _key,
          _type,

          ...select(
            _type == "image" => {
              alt,
              caption,
              "url": asset->url,
              "width": asset->metadata.dimensions.width,
              "height": asset->metadata.dimensions.height,
              "lqip": asset->metadata.lqip
            },

            _type == "video" => {
              caption,
              "url": file.asset->url
            },

            _type == "pdf" => {
              "title": title,
              "url": file.asset->url,
              "filename": file.asset->originalFilename
            }
          )
        }
      }
    `,
    { slug },
    { cache: "no-store" }
  );
}

async function getSiteSettings(): Promise<SiteSettings | null> {
  return client.fetch(
    `
      *[_type == "siteSettings"][0] {
        email
      }
    `,
    {},
    { cache: "no-store" }
  );
}

/* -------------------------------------------------------------------------- */
/* Page                                                                       */
/* -------------------------------------------------------------------------- */

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { slug } = await params;

  const [project, settings] = await Promise.all([
    getProject(slug),
    getSiteSettings(),
  ]);

  if (!project) {
    notFound();
  }

  const email = settings?.email || "hello@example.com";

  const projectDetails = [
    {
      label: "Location",
      value: project.location,
    },
    {
      label: "Year",
      value: project.year,
    },
    {
      label: "Firm",
      value: project.firm,
    },
    {
      label: "Role",
      value: project.role,
    },
    {
      label: "Type",
      value: project.projectType,
    },
    {
      label: "Professor",
      value: project.professor,
    },
    {
      label: "Collaborators",
      value:
        project.collaborators && project.collaborators.length > 0
          ? project.collaborators.join(", ")
          : undefined,
    },
  ].filter((detail) => detail.value);

  const galleryItems = (project.gallery || []).filter((item) => item.url);

  const galleryCount = galleryItems.length;
  const useLargeGallery = galleryCount <= 3;

  return (
    <main className="min-h-screen overflow-x-hidden bg-white text-black">
      {/* ------------------------------------------------------------------ */}
      {/* Sticky header                                                      */}
      {/* ------------------------------------------------------------------ */}

      <header className="sticky inset-x-0 top-0 z-50 bg-white text-black">
        <div className="flex flex-col gap-3 px-4 py-4 md:min-h-[106px] md:flex-row md:items-end md:justify-between md:gap-6 md:px-8 md:py-6">
          <Link
            href="/work"
            aria-label="Return to selected works"
            className="min-w-0 transition-opacity hover:opacity-45 md:max-w-[calc(100vw-480px)]"
          >
            <h1
              title={project.title}
              className="break-words font-mabrypro text-[clamp(1.4rem,7vw,4.5rem)] font-semibold lowercase leading-[0.86] tracking-[-0.055em] md:text-[clamp(1.8rem,4vw,4.5rem)]"
              style={{
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }}
            >
              {project.title}
            </h1>
          </Link>

          <nav
            aria-label="Primary navigation"
            className="flex shrink-0 items-center justify-between gap-x-5 border-t border-black pt-3 font-mabrypro text-[11px] font-normal uppercase leading-none tracking-[0.1em] md:justify-normal md:gap-x-8 md:border-t-0 md:pt-0"
          >
            <Link
              href="/work"
              className="transition-opacity duration-200 hover:opacity-40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4"
            >
              Work
            </Link>

            <Link
              href="/field-journal"
              className="transition-opacity duration-200 hover:opacity-40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4"
            >
              Field Journal
            </Link>

            <Link
              href="/cv"
              className="transition-opacity duration-200 hover:opacity-40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4"
            >
              CV
            </Link>

            <a
              href={`mailto:${email}`}
              className="transition-opacity duration-200 hover:opacity-40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4"
            >
              Contact
            </a>
          </nav>
        </div>
      </header>

      {/* ------------------------------------------------------------------ */}
      {/* Cover image                                                        */}
      {/* ------------------------------------------------------------------ */}

      {project.coverImage?.url ? (
        <section className="relative min-h-[55svh] w-full bg-neutral-100 md:min-h-[60svh]">
          <Image
            src={project.coverImage.url}
            alt={project.coverImage.alt || project.title}
            fill
            priority
            loading="eager"
            sizes="100vw"
            placeholder={project.coverImage.lqip ? "blur" : undefined}
            blurDataURL={project.coverImage.lqip}
            className="object-cover"
          />
        </section>
      ) : (
        <section className="min-h-[40svh] bg-neutral-100 md:min-h-[55svh]" />
      )}

      {/* ------------------------------------------------------------------ */}
      {/* Description and project details                                    */}
      {/* ------------------------------------------------------------------ */}

      <section className="px-5 py-20 md:px-8 md:py-28 lg:py-32">
        <div className="grid grid-cols-1 gap-14 md:grid-cols-12 md:gap-x-8">
          {/* Project description */}

          <div className="md:col-span-6 md:col-start-2 lg:col-span-5 lg:col-start-3">
            {project.description && project.description.length > 0 ? (
              <div className="font-mabrypro text-[16px] font-normal leading-[1.22] tracking-[-0.018em] md:text-[18px] lg:text-[20px]">
                <PortableText
                  value={project.description}
                  components={{
                    block: {
                      normal: ({ children }) => (
                        <p className="mb-5 last:mb-0">{children}</p>
                      ),

                      h2: ({ children }) => (
                        <h2 className="mb-5 mt-10 text-[1.25em] font-semibold leading-[0.95] tracking-[-0.025em]">
                          {children}
                        </h2>
                      ),

                      h3: ({ children }) => (
                        <h3 className="mb-4 mt-8 text-[1.05em] font-semibold leading-none">
                          {children}
                        </h3>
                      ),
                    },

                    list: {
                      bullet: ({ children }) => (
                        <div className="my-5 space-y-2">{children}</div>
                      ),

                      number: ({ children }) => (
                        <div className="my-5 space-y-2">{children}</div>
                      ),
                    },

                    listItem: {
                      bullet: ({ children }) => (
                        <div className="grid grid-cols-[22px_1fr] gap-1">
                          <span aria-hidden="true">//</span>
                          <span>{children}</span>
                        </div>
                      ),

                      number: ({ children, value }) => (
                        <div className="grid grid-cols-[28px_1fr] gap-1">
                          <span>{value.level}.</span>
                          <span>{children}</span>
                        </div>
                      ),
                    },
                  }}
                />
              </div>
            ) : (
              <p className="font-mabrypro text-[16px] leading-[1.2] md:text-[18px]">
                Project description coming soon.
              </p>
            )}
          </div>

          {/* Project metadata */}

          {projectDetails.length > 0 && (
            <aside className="md:col-span-3 md:col-start-9">
              <dl className="grid grid-cols-2 gap-x-7 gap-y-7 font-mabrypro md:grid-cols-1 lg:grid-cols-2">
                {projectDetails.map((detail) => (
                  <div key={detail.label}>
                    <dt className="mb-1.5 text-[9px] font-normal uppercase leading-none tracking-[0.06em] text-neutral-500 md:text-[10px]">
                      {detail.label}
                    </dt>

                    <dd className="text-[11px] font-medium uppercase leading-[1.25] tracking-[0.015em] md:text-[12px]">
                      {detail.value}
                    </dd>
                  </div>
                ))}
              </dl>
            </aside>
          )}
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* Additional project gallery                                         */}
      {/* ------------------------------------------------------------------ */}

      {galleryItems.length > 0 && (
        <section className="px-4 py-10 md:px-8 md:py-16">
          {useLargeGallery ? (
            <div
              className={
                galleryCount === 1
                  ? "mx-auto grid max-w-[1500px] grid-cols-1 gap-5 md:gap-8"
                  : "grid grid-cols-1 gap-5 md:grid-cols-2 md:gap-8"
              }
            >
              {galleryItems.map((item, index) => {
                const makeLastItemFullWidth = galleryCount === 3 && index === 2;

                const itemClassName = makeLastItemFullWidth
                  ? "md:col-span-2"
                  : "";

                if (item._type === "image") {
                  const width = item.width || 1800;
                  const height = item.height || 1200;

                  const imageAlt =
                    item.alt || `${project.title} project image ${index + 1}`;

                  const imageSizes =
                    galleryCount === 1 || makeLastItemFullWidth
                      ? "100vw"
                      : "(max-width: 767px) 100vw, 50vw";

                  return (
                    <figure key={item._key} className={itemClassName}>
                      <ExpandableImage
                        src={item.url}
                        alt={imageAlt}
                        width={width}
                        height={height}
                        sizes={imageSizes}
                        lqip={item.lqip}
                      />

                      {item.caption && (
                        <figcaption className="mt-2 font-mabrypro text-[9px] uppercase tracking-[0.04em] text-neutral-500 md:text-[10px]">
                          {item.caption}
                        </figcaption>
                      )}
                    </figure>
                  );
                }

                if (item._type === "video") {
                  return (
                    <figure key={item._key} className={itemClassName}>
                      {/*
                        eslint-disable-next-line jsx-a11y/media-has-caption --
                        source videos are not captioned in Sanity yet
                      */}
                      <video
                        src={item.url}
                        controls
                        playsInline
                        preload="metadata"
                        className="h-auto max-h-[92svh] w-full bg-black object-contain"
                      />

                      {item.caption && (
                        <figcaption className="mt-2 font-mabrypro text-[9px] uppercase tracking-[0.04em] text-neutral-500 md:text-[10px]">
                          {item.caption}
                        </figcaption>
                      )}
                    </figure>
                  );
                }

                return (
                  <div
                    key={item._key}
                    className={`flex min-h-[240px] items-center justify-center border border-black px-6 py-10 md:min-h-[360px] ${itemClassName}`}
                  >
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-mabrypro text-[12px] font-medium uppercase tracking-[0.04em] transition-opacity hover:opacity-45 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 md:text-[14px]"
                    >
                      View PDF — {item.title || item.filename || "Document"}
                    </a>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3 md:gap-6 lg:grid-cols-4">
              {galleryItems.map((item, index) => {
                if (item._type === "image") {
                  const width = item.width || 1800;
                  const height = item.height || 1200;

                  const imageAlt =
                    item.alt || `${project.title} project image ${index + 1}`;

                  return (
                    <figure
                      key={item._key}
                      className="mb-5 break-inside-avoid md:mb-6"
                    >
                      <ExpandableImage
                        src={item.url}
                        alt={imageAlt}
                        width={width}
                        height={height}
                        sizes="(max-width: 639px) 100vw, (max-width: 767px) 50vw, (max-width: 1023px) 33vw, 25vw"
                        lqip={item.lqip}
                      />

                      {item.caption && (
                        <figcaption className="mt-2 font-mabrypro text-[9px] uppercase tracking-[0.04em] text-neutral-500 md:text-[10px]">
                          {item.caption}
                        </figcaption>
                      )}
                    </figure>
                  );
                }

                if (item._type === "video") {
                  return (
                    <figure
                      key={item._key}
                      className="mb-5 break-inside-avoid md:mb-6"
                    >
                      {/*
                        eslint-disable-next-line jsx-a11y/media-has-caption --
                        source videos are not captioned in Sanity yet
                      */}
                      <video
                        src={item.url}
                        controls
                        playsInline
                        preload="metadata"
                        className="h-auto w-full bg-black"
                      />

                      {item.caption && (
                        <figcaption className="mt-2 font-mabrypro text-[9px] uppercase tracking-[0.04em] text-neutral-500 md:text-[10px]">
                          {item.caption}
                        </figcaption>
                      )}
                    </figure>
                  );
                }

                return (
                  <div
                    key={item._key}
                    className="mb-5 break-inside-avoid border border-black px-4 py-6 md:mb-6"
                  >
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 font-mabrypro text-[10px] font-medium uppercase tracking-[0.04em] transition-opacity hover:opacity-45 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 md:text-[11px]"
                    >
                      View PDF — {item.title || item.filename || "Document"}
                    </a>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* Bottom navigation                                                  */}
      {/* ------------------------------------------------------------------ */}

      <footer className="px-5 py-8 md:px-8 md:py-10">
        <div className="flex items-center justify-between border-t border-black pt-4 font-mabrypro text-[9px] font-normal uppercase tracking-[0.05em] md:text-[10px]">
          <Link
            href="/work"
            className="transition-opacity hover:opacity-45 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4"
          >
            ← All projects
          </Link>

          <span>{project.year || "Dean Hjerpyn"}</span>
        </div>
      </footer>
    </main>
  );
}
