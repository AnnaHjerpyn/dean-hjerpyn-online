import Link from "next/link";
import { client } from "@/sanity/lib/client";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type Project = {
  _id: string;
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
        _id,
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

function getImageSizeClass(index: number) {
  const pattern = [
    "md:col-span-5",
    "md:col-span-3",
    "md:col-span-4",
    "md:col-span-4",
    "md:col-span-5",
    "md:col-span-3",
    "md:col-span-3",
    "md:col-span-4",
    "md:col-span-5",
  ];

  return pattern[index % pattern.length];
}

function getImageRatioClass(index: number) {
  const pattern = [
    "aspect-[4/5]",
    "aspect-[3/4]",
    "aspect-[5/4]",
    "aspect-square",
    "aspect-[4/3]",
    "aspect-[3/4]",
    "aspect-[4/5]",
    "aspect-[5/4]",
    "aspect-square",
  ];

  return pattern[index % pattern.length];
}

function ProjectImage({ project }: { project: Project }) {
  return project.coverImageUrl ? (
    <img
      src={project.coverImageUrl}
      alt={project.title}
      className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.025]"
    />
  ) : (
    <div className="flex h-full w-full items-center justify-center font-editorial text-[8px] font-normal uppercase tracking-[0.16em] opacity-50">
      No image
    </div>
  );
}

function ProjectInformation({ project }: { project: Project }) {
  return (
    <div className="min-h-[58px] pt-2">
      <div className="translate-y-0 opacity-100 transition-all duration-300 ease-out md:translate-y-2 md:opacity-0 md:group-hover:translate-y-0 md:group-hover:opacity-100">
        <div className="flex items-start justify-between gap-4 font-editorial text-[8px] font-normal uppercase tracking-[0.14em] md:text-[9px]">
          <p>{project.title}</p>

          {project.year && <p className="shrink-0">{project.year}</p>}
        </div>

        {(project.location || project.projectType) && (
          <p className="mt-1 font-sabon text-[12px] normal-case leading-4 tracking-normal text-[#1f1a13]/65">
            {project.location}
            {project.location && project.projectType ? " / " : ""}
            {project.projectType}
          </p>
        )}
      </div>
    </div>
  );
}

export default async function WorkPage() {
  const projects = await getProjects();

  return (
    <main className="min-h-screen overflow-x-hidden bg-white px-4 pb-5 pt-28 text-[#1f1a13] md:px-8 md:pb-8 md:pt-36">
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
        <section className="relative z-0 grid grid-cols-1 items-start gap-x-5 gap-y-5 md:grid-cols-12 md:gap-x-6 md:gap-y-6">
          {projects.map((project, index) => {
            const columnClass = getImageSizeClass(index);
            const ratioClass = getImageRatioClass(index);

            if (!project.slug) {
              return (
                <div
                  key={project._id}
                  className={`group relative ${columnClass}`}
                  title="Generate and publish a slug for this project in Sanity"
                >
                  <div
                    className={`relative overflow-hidden bg-[#ecece8] ${ratioClass}`}
                  >
                    <ProjectImage project={project} />

                    <div className="pointer-events-none absolute inset-x-3 top-3 z-20">
                      <p className="inline-block bg-white px-2 py-1 font-editorial text-[8px] font-normal uppercase tracking-[0.14em] text-[#1f1a13]">
                        Missing project slug
                      </p>
                    </div>
                  </div>

                  <ProjectInformation project={project} />
                </div>
              );
            }

            return (
              <Link
                key={project._id}
                href={`/projects/${encodeURIComponent(project.slug)}`}
                aria-label={`Open ${project.title} project`}
                className={`group block ${columnClass}`}
              >
                <div className={`overflow-hidden bg-[#ecece8] ${ratioClass}`}>
                  <ProjectImage project={project} />
                </div>

                <ProjectInformation project={project} />
              </Link>
            );
          })}
        </section>
      )}
    </main>
  );
}
