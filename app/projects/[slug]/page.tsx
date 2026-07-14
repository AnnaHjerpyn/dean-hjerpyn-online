import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PortableText } from "@portabletext/react";
import type { PortableTextBlock } from "@portabletext/types";
import { client } from "@/sanity/lib/client";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type SanityImage = {
  _key?: string;
  url: string;
  alt?: string;
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
  coverImage?: SanityImage;
  gallery?: SanityImage[];
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
        description,

        "slug": slug.current,

        "coverImage": coverImage {
          alt,
          "url": asset->url,
          "width": asset->metadata.dimensions.width,
          "height": asset->metadata.dimensions.height
        },

        "gallery": gallery[] {
          _key,
          alt,
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
  ].filter((detail) => detail.value);

  return (
    <main className="min-h-screen bg-white text-black">
      {/* Project heading and navigation */}
      {/* Sticky project title */}
      <div className="pointer-events-none sticky top-0 z-40 h-[120px] md:h-[138px]">
        <div className="px-4 pt-8 md:px-5 md:pt-10">
          <h1 className="pointer-events-auto w-fit max-w-[calc(100vw-140px)] bg-white pr-3 font-mabrypro text-[clamp(2rem,4vw,4.25rem)] font-semibold lowercase leading-[0.9] tracking-[-0.045em]">
            {project.title}
          </h1>
        </div>
      </div>

      {/* Navigation */}
      <header className="relative -mt-[120px] h-[120px] md:-mt-[138px] md:h-[138px]">
        <nav className="absolute right-4 top-8 z-50 min-w-[96px] bg-white font-mabrypro text-[9px] font-normal uppercase leading-[1.55] tracking-[0.01em] md:right-5 md:top-10 md:min-w-[112px] md:text-[10px]">
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
      </header>

      {/* Full-width project cover */}
      {project.coverImage?.url && (
        <section className="relative aspect-[1.45/1] w-full overflow-hidden bg-neutral-100 sm:aspect-[1.65/1] md:aspect-[1.85/1]">
          <Image
            src={project.coverImage.url}
            alt={project.coverImage.alt || project.title}
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
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
      {project.gallery && project.gallery.length > 0 && (
        <section>
          {project.gallery
            .filter((image) => image.url)
            .map((image, index) => {
              const width = image.width || 1800;
              const height = image.height || 1200;

              return (
                <figure
                  key={image._key || `${image.url}-${index}`}
                  className="w-full"
                >
                  <Image
                    src={image.url}
                    alt={
                      image.alt || `${project.title} project image ${index + 1}`
                    }
                    width={width}
                    height={height}
                    sizes="100vw"
                    className="h-auto w-full"
                  />
                </figure>
              );
            })}
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
