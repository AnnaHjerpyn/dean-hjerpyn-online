import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PortableText } from "@portabletext/react";
import type { PortableTextBlock } from "@portabletext/types";
import { client } from "@/sanity/lib/client";

export const dynamic = "force-dynamic";
export const revalidate = 0;

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

  return (
    <main className="min-h-screen bg-white text-black">
      {/* Project heading and navigation */}
      {/* Sticky project title */}
      {project.coverImage?.url && (
        <section className="relative min-h-[72vh] w-full overflow-hidden bg-neutral-100 md:min-h-screen">
          <Image
            src={project.coverImage.url}
            alt={project.coverImage.alt || project.title}
            fill
            priority
            sizes="100vw"
            placeholder={project.coverImage.lqip ? "blur" : undefined}
            blurDataURL={project.coverImage.lqip}
            className="object-cover"
          />

          <h1 className="fixed left-4 top-7 z-40 max-w-[calc(100vw-145px)] font-mabrypro text-[clamp(2rem,4vw,4.25rem)] font-semibold lowercase leading-[0.9] tracking-[-0.045em] mix-blend-difference text-white md:left-5 md:top-10">
            {project.title}
          </h1>

          <nav className="fixed right-4 top-7 z-50 min-w-[96px] font-mabrypro text-[9px] font-normal uppercase leading-[1.55] tracking-[0.01em] mix-blend-difference text-white md:right-5 md:top-10 md:min-w-[112px] md:text-[10px]">
            <Link
              href="/"
              className="block lowercase transition-opacity hover:opacity-45"
            >
              dean hjerpyn
            </Link>

            <Link
              href="/work"
              className="block transition-opacity hover:opacity-45"
            >
              Work
            </Link>

            <Link
              href="/field-journal"
              className="block transition-opacity hover:opacity-45"
            >
              Field Journal
            </Link>

            <Link
              href="/cv"
              className="block transition-opacity hover:opacity-45"
            >
              CV
            </Link>

            <a
              href={`mailto:${email}`}
              className="block transition-opacity hover:opacity-45"
            >
              Contact
            </a>
          </nav>
        </section>
      )}

      {/* Description and project information */}
      <section className="px-5 py-20 md:px-8 md:py-28 lg:py-32">
        <div className="grid grid-cols-1 gap-14 md:grid-cols-12 md:gap-x-6">
          {/* Empty columns create the large left margin from the reference */}
          <div className="md:col-start-4 md:col-span-5">
            {project.description && project.description.length > 0 ? (
              <div className="font-mabrypro text-[12px] font-medium leading-[1.08] tracking-[-0.015em] md:text-[13px] lg:text-[14px]">
                <PortableText
                  value={project.description}
                  components={{
                    block: {
                      normal: ({ children }) => (
                        <p className="mb-3 last:mb-0">{children}</p>
                      ),

                      h2: ({ children }) => (
                        <h2 className="mb-4 mt-8 text-[1.15em] font-semibold leading-none">
                          {children}
                        </h2>
                      ),

                      h3: ({ children }) => (
                        <h3 className="mb-3 mt-6 text-[1em] font-semibold leading-none">
                          {children}
                        </h3>
                      ),
                    },

                    list: {
                      bullet: ({ children }) => (
                        <div className="my-3 space-y-1">{children}</div>
                      ),

                      number: ({ children }) => (
                        <div className="my-3 space-y-1">{children}</div>
                      ),
                    },

                    listItem: {
                      bullet: ({ children }) => (
                        <div className="grid grid-cols-[12px_1fr] gap-1">
                          <span>//</span>
                          <span>{children}</span>
                        </div>
                      ),

                      number: ({ children, value }) => (
                        <div className="grid grid-cols-[18px_1fr] gap-1">
                          <span>{value.level}.</span>
                          <span>{children}</span>
                        </div>
                      ),
                    },
                  }}
                />
              </div>
            ) : (
              <p className="font-mabrypro text-[12px] leading-[1.1] md:text-[13px]">
                Project description coming soon.
              </p>
            )}
          </div>

          {/* Project metadata */}
          {projectDetails.length > 0 && (
            <aside className="md:col-start-10 md:col-span-3">
              <dl className="grid grid-cols-2 gap-x-7 gap-y-5 font-mabrypro">
                {projectDetails.map((detail) => (
                  <div key={detail.label}>
                    <dt className="mb-1 text-[7px] font-normal uppercase leading-none tracking-[0.03em] md:text-[8px]">
                      {detail.label}
                    </dt>

                    <dd className="text-[8px] font-medium uppercase leading-[1.15] tracking-[0.01em] md:text-[9px]">
                      {detail.value}
                    </dd>
                  </div>
                ))}
              </dl>
            </aside>
          )}
        </div>
      </section>

      {/* Additional project gallery */}
      {galleryItems.length > 0 && (
        <section className="px-4 py-10 md:px-8 md:py-16">
          <div className="columns-2 gap-3 sm:columns-3 md:columns-4 md:gap-4">
            {galleryItems.map((item, index) => {
              if (item._type === "image") {
                const width = item.width || 1800;
                const height = item.height || 1200;

                return (
                  <figure
                    key={item._key}
                    className="mb-3 break-inside-avoid md:mb-4"
                  >
                    <Image
                      src={item.url}
                      alt={
                        item.alt ||
                        `${project.title} project image ${index + 1}`
                      }
                      width={width}
                      height={height}
                      sizes="(max-width: 639px) 50vw, (max-width: 767px) 33vw, 25vw"
                      placeholder={item.lqip ? "blur" : undefined}
                      blurDataURL={item.lqip}
                      className="h-auto w-full"
                    />

                    {item.caption && (
                      <figcaption className="mt-1 font-mabrypro text-[7px] uppercase tracking-[0.03em] text-neutral-500 md:text-[8px]">
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
                    className="mb-3 break-inside-avoid md:mb-4"
                  >
                    {/*
                      eslint-disable-next-line jsx-a11y/media-has-caption --
                      source videos aren't captioned in Sanity yet
                    */}
                    <video
                      src={item.url}
                      controls
                      playsInline
                      preload="metadata"
                      className="h-auto w-full"
                    />

                    {item.caption && (
                      <figcaption className="mt-1 font-mabrypro text-[7px] uppercase tracking-[0.03em] text-neutral-500 md:text-[8px]">
                        {item.caption}
                      </figcaption>
                    )}
                  </figure>
                );
              }

              // PDF
              return (
                <div
                  key={item._key}
                  className="mb-3 break-inside-avoid border border-black px-3 py-4 md:mb-4"
                >
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 font-mabrypro text-[8px] font-medium uppercase tracking-[0.03em] transition-opacity hover:opacity-45 md:text-[9px]"
                  >
                    View PDF — {item.title || item.filename || "Document"}
                  </a>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Bottom navigation */}
      <footer className="px-5 py-8 md:px-8 md:py-10">
        <div className="flex items-center justify-between border-t border-black pt-4 font-mabrypro text-[8px] font-normal uppercase tracking-[0.04em] md:text-[9px]">
          <Link href="/work" className="transition-opacity hover:opacity-45">
            ← All projects
          </Link>

          <span>{project.year || "Dean Hjerpyn"}</span>
        </div>
      </footer>
    </main>
  );
}
