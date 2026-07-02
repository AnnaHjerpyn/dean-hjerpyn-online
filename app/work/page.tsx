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

export default async function WorkPage() {
  const projects = await getProjects();

  return (
    <main className="min-h-screen bg-white px-4 pb-5 pt-28 text-[#1f1a13] md:px-8 md:pb-8 md:pt-32">
      <header className="fixed left-4 right-4 top-4 z-50 flex items-start justify-between mix-blend-difference text-white md:left-8 md:right-8 md:top-8">
        <Link
          href="/"
          className="font-editorial text-[34px] font-normal uppercase leading-[0.86] tracking-[-0.05em] md:text-[3.2vw]"
        >
          <span className="block">Dean</span>
          <span className="block">Hjerpyn</span>
        </Link>

        <nav className="flex gap-4 font-editorial text-[9px] font-normal uppercase tracking-[0.15em] md:gap-7 md:text-[10px]">
          <Link href="/work" className="transition-opacity hover:opacity-50">
            Work
          </Link>

          <Link href="/#about" className="transition-opacity hover:opacity-50">
            About
          </Link>

          <Link
            href="/#contact"
            className="transition-opacity hover:opacity-50"
          >
            Contact
          </Link>
        </nav>
      </header>

      <section>
        <div className="mb-4 flex items-end justify-between border-b border-[#1f1a13] pb-3 font-editorial text-[8px] font-normal uppercase tracking-[0.16em] md:text-[9px]">
          <p>Selected Work</p>
          <p>Archive / 2024—2026</p>
        </div>

        {projects.length === 0 ? (
          <p className="py-7 font-editorial text-[9px] font-normal uppercase tracking-[0.16em]">
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
    </main>
  );
}
