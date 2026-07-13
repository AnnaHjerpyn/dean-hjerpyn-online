import Link from "next/link";
import { client } from "@/sanity/lib/client";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type Project = {
  _id: string;
  title: string;
  slug?: string;
};

async function getProjects(): Promise<Project[]> {
  return client.fetch(
    `
      *[_type == "project"] | order(year desc) {
        _id,
        title,
        "slug": slug.current
      }
    `,
    {},
    { cache: "no-store" }
  );
}

export default async function WorkPage() {
  const projects = await getProjects();

  return (
    <main className="min-h-screen overflow-x-hidden bg-white px-4 pb-12 pt-32 text-[#1f1a13] md:px-8 md:pb-16 md:pt-44">
      <header>
        <Link
          href="/"
          aria-label="Dean Hjerpyn homepage"
          className="fixed left-4 top-4 z-50 block mix-blend-difference text-white md:left-8 md:top-8"
        >
          <span className="block font-editorial text-[34px] font-normal uppercase leading-[0.86] tracking-[-0.05em] md:text-[3.2vw]">
            Dean
          </span>

          <span className="block font-editorial text-[34px] font-normal uppercase leading-[0.86] tracking-[-0.05em] md:text-[3.2vw]">
            Hjerpyn
          </span>
        </Link>

        <nav className="fixed right-4 top-4 z-50 flex max-w-[62vw] flex-wrap justify-end gap-x-4 gap-y-2 font-editorial text-[8px] font-normal uppercase tracking-[0.15em] mix-blend-difference text-white md:right-8 md:top-8 md:max-w-none md:gap-x-7 md:text-[10px]">
          <Link href="/work" className="transition-opacity hover:opacity-50">
            Work
          </Link>

          <Link href="/cv" className="transition-opacity hover:opacity-50">
            CV
          </Link>

          <Link
            href="/field-journal"
            className="transition-opacity hover:opacity-50"
          >
            Field Journal
          </Link>

          <Link
            href="/#contact"
            className="transition-opacity hover:opacity-50"
          >
            Contact
          </Link>
        </nav>
      </header>

      {projects.length === 0 ? (
        <section className="flex min-h-[60vh] items-end">
          <p className="font-editorial text-[9px] font-normal uppercase tracking-[0.16em]">
            No projects found.
          </p>
        </section>
      ) : (
        <section className="mx-auto flex w-full max-w-screen-2xl flex-col">
          {projects.map((project) => {
            if (!project.slug) {
              return (
                <div
                  key={project._id}
                  title="Generate and publish a slug for this project in Sanity"
                  className="border-b border-[#1f1a13]/30 py-3 opacity-40 md:py-4"
                >
                  <h2 className="font-editorial text-[26px] font-normal uppercase leading-none tracking-[-0.035em] md:text-[4vw]">
                    {project.title}
                  </h2>
                </div>
              );
            }

            return (
              <Link
                key={project._id}
                href={`/projects/${encodeURIComponent(project.slug)}`}
                aria-label={`Open ${project.title} project`}
                className="group block border-b border-[#1f1a13]/30 py-3 md:py-4"
              >
                <h2 className="font-editorial text-[26px] font-normal uppercase leading-none tracking-[-0.035em] transition-opacity duration-300 group-hover:opacity-40 md:text-[4vw]">
                  {project.title}
                </h2>
              </Link>
            );
          })}
        </section>
      )}
    </main>
  );
}
