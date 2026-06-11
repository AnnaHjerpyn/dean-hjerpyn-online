import Link from "next/link";
import { client } from "@/sanity/lib/client";

export const dynamic = "force-dynamic";
export const revalidate = 0;

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

type SiteSettings = {
  name?: string;
  headline?: string;
  aboutHeading?: string;
  aboutBody?: string;
  email?: string;
  instagram?: string;
};

async function getProjects(): Promise<Project[]> {
  return client.fetch(
    `
      *[_type == "project"] | order(year desc) {
        title,
        location,
        year,
        firm,
        role,
        projectType,
        "slug": slug.current,
        "coverImageUrl": coverImage.asset->url
      }
    `,
    {},
    { cache: "no-store" }
  );
}

async function getSiteSettings(): Promise<SiteSettings | null> {
  return client.fetch(
    `
      *[_type == "siteSettings"][0] {
        name,
        headline,
        aboutHeading,
        aboutBody,
        email,
        instagram
      }
    `,
    {},
    { cache: "no-store" }
  );
}

export default async function Home() {
  const [projects, settings] = await Promise.all([
    getProjects(),
    getSiteSettings(),
  ]);

  const email = settings?.email || "hello@example.com";
  const currentYear = new Date().getFullYear();

  return (
    <main className="min-h-screen overflow-x-hidden bg-white px-4 pb-5 text-[#1f1a13] md:px-8 md:pb-8">
      {/* Fixed site identity */}
      <header>
        <Link
          href="/"
          aria-label="Dean Hjerpyn homepage"
          className="fixed left-4 top-4 z-50 mix-blend-difference text-white md:left-8 md:top-8"
        >
          <span className="block font-editorial text-[24px] font-normal uppercase leading-[0.86] tracking-[-0.05em] md:text-[2.2vw]">
            Dean
          </span>

          <span className="ml-[25px] block font-editorial text-[24px] font-normal uppercase leading-[0.86] tracking-[-0.05em] md:ml-[1.8vw] md:text-[2.2vw]">
            Hjerpyn
          </span>
        </Link>

        <nav className="fixed right-4 top-4 z-50 flex gap-4 font-editorial text-[9px] font-normal uppercase tracking-[0.15em] mix-blend-difference text-white md:right-8 md:top-8 md:gap-7 md:text-[10px]">
          <a href="#work" className="transition-opacity hover:opacity-50">
            Work
          </a>

          <a href="#about" className="transition-opacity hover:opacity-50">
            About
          </a>

          <a
            href={`mailto:${email}`}
            className="transition-opacity hover:opacity-50"
          >
            Contact
          </a>
        </nav>
      </header>

      {/* Introduction */}
      <section className="flex min-h-screen items-end pb-10 pt-36 md:pb-14 md:pt-48">
        <div className="ml-auto w-full md:w-[68%]">
          <p className="font-editorial text-[clamp(1.65rem,2.65vw,3.1rem)] font-normal leading-[1.02] tracking-[-0.04em]">
            {settings?.headline ||
              "A portfolio of well built, site-specific landscapes that respond to client needs while simultaneously challenging historical and contemporary landscape construction methods, materials, and formal conventions. Our design approach is post-internet, critically-regionalist, and respectfully inflammatory."}
          </p>

          <p className="mt-9 font-editorial text-[8px] font-normal uppercase tracking-[0.17em] md:mt-12 md:text-[9px]">
            Columbus, Ohio / Landscape Architecture
          </p>
        </div>
      </section>

      {/* Practice statement */}
      <section className="mt-24 grid gap-7 md:mt-40 md:grid-cols-12">
        <p className="font-editorial text-[9px] font-normal uppercase tracking-[0.16em] md:col-span-3">
          Practice
        </p>

        <p className="font-sabon text-[1.75rem] font-normal leading-[1.02] tracking-[-0.035em] md:col-span-9 md:text-[clamp(2.25rem,3.25vw,3.5rem)]">
          Site, soil, water, plants, time, maintenance, and human use are
          treated as one connected design language.
        </p>
      </section>

      {/* Work */}
      <section id="work" className="mt-32 scroll-mt-24 md:mt-48">
        <div className="mb-4 flex items-end justify-between font-editorial text-[8px] font-normal uppercase tracking-[0.16em] md:text-[9px]">
          <p>Selected Work</p>
          <p>Archive / 2024—2026</p>
        </div>

        {projects.length === 0 ? (
          <p className="border-t border-[#1f1a13] py-7 font-editorial text-[9px] font-normal uppercase tracking-[0.16em]">
            No projects found.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-x-5 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
              <Link
                key={project.slug || project.title}
                href={project.slug ? `/projects/${project.slug}` : "#"}
                className="group block"
              >
                <div className="aspect-[4/3] w-full overflow-hidden bg-[#ecece8]">
                  {project.coverImageUrl ? (
                    <img
                      src={project.coverImageUrl}
                      alt={project.title}
                      className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.015]"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center font-editorial text-[8px] font-normal uppercase tracking-[0.16em] opacity-50">
                      No image
                    </div>
                  )}
                </div>

                <div className="mt-2.5 flex items-start justify-between gap-5 font-editorial text-[9px] font-normal uppercase tracking-[0.08em] md:text-[10px]">
                  <h2 className="font-normal leading-tight">{project.title}</h2>

                  {project.year && (
                    <p className="shrink-0 font-normal">{project.year}</p>
                  )}
                </div>

                {(project.location || project.projectType) && (
                  <p className="mt-1 font-sabon text-xs font-normal leading-4 text-[#1f1a13]/65">
                    {project.location}

                    {project.location && project.projectType ? " / " : ""}

                    {project.projectType}
                  </p>
                )}
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* CMS-managed About */}
      <section
        id="about"
        className="mt-32 grid scroll-mt-24 gap-7 md:mt-48 md:grid-cols-12"
      >
        <p className="font-editorial text-[9px] font-normal uppercase tracking-[0.16em] md:col-span-3">
          About
        </p>

        <div className="space-y-8 md:col-span-9">
          <p className="max-w-4xl font-sabon text-[1.75rem] font-normal leading-[1.04] tracking-[-0.03em] md:text-[clamp(2.1rem,2.8vw,3rem)]">
            {settings?.aboutHeading ||
              "Dean Hjerpyn is a landscape designer working across planted spaces, ecological systems, and site-specific environments."}
          </p>

          <p className="max-w-xl font-sabon text-[15px] font-normal leading-6 text-[#1f1a13]/70 md:text-base">
            {settings?.aboutBody ||
              "Her work explores the relationship between people, plants, material, maintenance, and time. This portfolio gathers selected projects, field observations, design studies, and landscape research."}
          </p>

          <div className="flex flex-wrap gap-6 font-editorial text-[9px] font-normal uppercase tracking-[0.14em]">
            <a
              href={`mailto:${email}`}
              className="border-b border-current pb-1 transition-opacity hover:opacity-50"
            >
              Email Dean
            </a>

            {settings?.instagram && (
              <a
                href={settings.instagram}
                target="_blank"
                rel="noreferrer"
                className="border-b border-current pb-1 transition-opacity hover:opacity-50"
              >
                Instagram
              </a>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-32 flex items-end justify-between border-t border-[#1f1a13] pt-4 font-editorial text-[8px] font-normal uppercase tracking-[0.14em] md:mt-48 md:text-[9px]">
        <p>© {currentYear}</p>

        <p className="text-right">
          {settings?.name || "Dean Hjerpyn"} / Landscape Architecture
        </p>
      </footer>
    </main>
  );
}
