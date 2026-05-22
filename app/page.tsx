import Link from "next/link";
import { client } from "@/sanity/lib/client";

type Project = {
  title: string;
  location?: string;
  year?: string;
  firm?: string;
  role?: string;
  projectType?: string;
  slug?: string;
};

async function getProjects(): Promise<Project[]> {
  return client.fetch(`
    *[_type == "project"] | order(year desc) {
      title,
      location,
      year,
      firm,
      role,
      projectType,
      "slug": slug.current
    }
  `);
}

export default async function Home() {
  const projects = await getProjects();

  return (
    <main className="font-sabon min-h-screen bg-[#e7dfcf] text-[#1f1a13] px-5 py-5 md:px-10 md:py-8">
      <header className="font-narkiss flex items-start justify-between text-xs md:text-sm uppercase tracking-[0.1em]">
        <Link href="/" className="hover:opacity-50 transition">
          Dean Hjerpyn
        </Link>

        <nav className="flex gap-5 md:gap-8">
          <a href="#work" className="hover:opacity-50 transition">
            Work
          </a>
          <a href="#info" className="hover:opacity-50 transition">
            Info
          </a>
          <a
            href="mailto:hello@example.com"
            className="hover:opacity-50 transition"
          >
            Contact
          </a>
        </nav>
      </header>

      <section className="mt-20 md:mt-32">
        <div className="grid md:grid-cols-12 gap-6">
          <h1 className="font-narkiss md:col-span-8 text-6xl md:text-[10vw] leading-[0.85] tracking-[-0.07em] uppercase">
            Landscape as living system.
          </h1>

          <div className="md:col-span-4 flex flex-col justify-between gap-12">
            <p className="font-sabon text-lg md:text-2xl leading-tight">
              A portfolio of landscape architecture work focused on ecology,
              materiality, public space, and planted atmospheres.
            </p>

            <p className="font-narkiss text-xs uppercase tracking-[0.12em]">
              Columbus, Ohio / Landscape Architecture
            </p>
          </div>
        </div>
      </section>

      <section className="mt-24 md:mt-36 grid md:grid-cols-12 gap-8">
        <p className="font-narkiss md:col-span-3 text-sm uppercase tracking-[0.1em]">
          Practice
        </p>

        <p className="font-sabon md:col-span-9 text-3xl md:text-6xl leading-[0.95] tracking-[-0.05em]">
          Site, soil, water, plants, time, maintenance, and human use are
          treated as one connected design language.
        </p>
      </section>

      <section id="work" className="mt-28 md:mt-40">
        <div className="font-narkiss mb-4 flex justify-between text-xs uppercase tracking-[0.12em]">
          <p>Selected Work</p>
          <p>Archive / 2024—2026</p>
        </div>

        <div className="border-t-2 border-[#1f1a13]">
          {projects.map((project) => (
            <article
              key={project.slug || project.title}
              className="grid grid-cols-12 gap-4 border-b-2 border-[#1f1a13] py-7 md:py-9 hover:bg-[#d8cbb5] transition"
            >
              <h2 className="font-narkiss col-span-12 md:col-span-5 text-3xl md:text-5xl tracking-[-0.05em] uppercase">
                {project.title}
              </h2>

              <p className="font-narkiss col-span-6 md:col-span-2 text-sm uppercase">
                {project.location}
              </p>

              <p className="font-narkiss col-span-6 md:col-span-2 text-sm uppercase">
                {project.projectType}
              </p>

              <p className="font-narkiss col-span-6 md:col-span-2 text-sm uppercase">
                {project.role}
              </p>

              <p className="font-narkiss col-span-6 md:col-span-1 text-right text-sm">
                {project.year}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section id="info" className="mt-28 md:mt-40 grid md:grid-cols-12 gap-8">
        <p className="font-narkiss md:col-span-3 text-sm uppercase tracking-[0.1em]">
          Information
        </p>

        <div className="md:col-span-9 space-y-8">
          <p className="font-sabon text-2xl md:text-4xl leading-tight tracking-[-0.03em]">
            This portfolio documents work across ecological restoration, public
            landscapes, planting systems, residential gardens, and spatial
            research.
          </p>

          <p className="font-sabon max-w-2xl text-base md:text-lg leading-7 text-[#1f1a13]/75">
            The work is organized as a living archive of drawings, field
            observations, project narratives, material studies, and design
            proposals. Project pages are managed through Sanity CMS.
          </p>
        </div>
      </section>

      <footer className="font-narkiss mt-28 md:mt-40 pt-5 border-t-2 border-[#1f1a13] flex justify-between text-xs md:text-sm uppercase tracking-[0.1em]">
        <p>© 2026</p>
        <p>Landscape Architecture Portfolio</p>
      </footer>
    </main>
  );
}
