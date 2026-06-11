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
  const projects = await getProjects();
  const settings = await getSiteSettings();

  return (
    <main className="min-h-screen bg-white text-[#1f1a13] px-4 py-4 md:px-8 md:py-8">
      <header>
        <div className="fixed top-8 left-8 z-50 pointer-events-none mix-blend-difference text-white">
          <div className="font-narkiss uppercase leading-[0.82] tracking-[-0.06em]">
            <div className="text-[48px] md:text-[4vw]">DEAN</div>

            <div className="ml-[40px] md:ml-[2.5vw] text-[48px] md:text-[4vw]">
              HJERPYN
            </div>
          </div>
        </div>

        <nav className="fixed top-6 right-6 md:top-8 md:right-8 z-50 flex gap-6 md:gap-8 font-mabrypro text-xs uppercase tracking-[0.15em]">
          <a href="#work" className="hover:opacity-50 transition">
            Work
          </a>
          <a href="#about" className="hover:opacity-50 transition">
            About
          </a>
          <a
            href="mailto:hello@example.com"
            className="hover:opacity-50 transition"
          >
            Contact
          </a>
        </nav>
      </header>

      <section className="pt-[320px] md:pt-[420px]">
        <div className="max-w-[1120px] ml-0 md:ml-[28vw]">
          <p className="font-sabon text-[1.8rem] md:text-[2.35rem] leading-[1.08] tracking-[-0.02em]">
            A portfolio of well built, site-specific landscapes that respond to
            client needs while simultaneously challenging historical and
            contemporary landscape construction methods, materials, and formal
            conventions. Our design approach is post-internet,
            critically-regionalist, and respectfully inflammatory.
          </p>

          <p className="font-mabrypro mt-16 text-xs uppercase tracking-[0.15em]">
            Columbus, Ohio / Landscape Architecture
          </p>
        </div>
      </section>

      <section className="mt-40 md:mt-56">
        <div className="grid md:grid-cols-12 gap-8">
          <p className="font-mabrypro md:col-span-3 text-sm uppercase tracking-[0.12em]">
            Practice
          </p>

          <p className="font-sabon md:col-span-9 text-3xl md:text-6xl leading-[0.95] tracking-[-0.05em]">
            Site, soil, water, plants, time, maintenance, and human use are
            treated as one connected design language.
          </p>
        </div>
      </section>

      <section id="work" className="mt-40 md:mt-56 scroll-mt-24">
        <div className="mb-6 flex justify-between font-mabrypro text-xs uppercase tracking-[0.12em]">
          <p>Selected Work</p>
          <p>Archive / 2024—2026</p>
        </div>

        {projects.length === 0 ? (
          <p className="font-mabrypro border-t border-[#1f1a13] py-8 text-sm uppercase tracking-[0.12em]">
            No projects found.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-x-5 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
              <Link
                key={project.slug || project.title}
                href={project.slug ? `/projects/${project.slug}` : "#"}
                className="group block"
              >
                <div className="aspect-[4/3] w-full overflow-hidden bg-[#e7dfcf]">
                  {project.coverImageUrl ? (
                    <img
                      src={project.coverImageUrl}
                      alt={project.title}
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center font-narkiss text-xs uppercase tracking-[0.12em] opacity-50">
                      No Image
                    </div>
                  )}
                </div>

                <div className="mt-3 flex items-start justify-between gap-4 font-narkiss text-s uppercase tracking-[0.08em]">
                  <h2>{project.title}</h2>
                  {/* <p>{project.year}</p> */}
                </div>

                {/* <p className="mt-1 font-sabon text-sm text-[#1f1a13]/70">
                  {project.location}
                  {project.projectType ? ` / ${project.projectType}` : ""}
                </p> */}
              </Link>
            ))}
          </div>
        )}
      </section>

      <section
        id="about"
        className="mt-40 md:mt-56 grid md:grid-cols-12 gap-8 scroll-mt-24"
      >
        <p className="font-mabrypro md:col-span-3 text-sm uppercase tracking-[0.12em]">
          About
        </p>

        <div className="md:col-span-9 space-y-8">
          <p className="font-sabon text-2xl md:text-4xl leading-tight tracking-[-0.03em]">
            {settings?.aboutHeading ||
              "Dean Hjerpyn is a landscape designer working across planted spaces, ecological systems, and site-specific environments."}
          </p>

          <p className="font-sabon max-w-2xl text-base md:text-lg leading-7 text-[#1f1a13]/75">
            {settings?.aboutBody ||
              "Her work explores the relationship between people, plants, material, maintenance, and time. This portfolio gathers selected projects, field observations, design studies, and landscape research."}
          </p>

          {settings?.email && (
            <a
              href={`mailto:${settings.email}`}
              className="font-mabrypro inline-block text-sm uppercase tracking-[0.12em] hover:opacity-50 transition"
            >
              Contact Dean
            </a>
          )}
        </div>
      </section>

      <footer className="font-mabrypro mt-40 md:mt-56 pt-5 border-t-2 border-[#1f1a13] flex justify-between text-xs md:text-sm uppercase tracking-[0.1em]">
        <p>© 2026</p>
        <p>Dean Hjerpyn</p>
      </footer>
    </main>
  );
}
