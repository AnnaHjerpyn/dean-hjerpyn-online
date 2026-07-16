import Link from "next/link";
import { client } from "@/sanity/lib/client";

import WorkCanvas, { type WorkProject } from "../components/WorkCanvas";

export const dynamic = "force-dynamic";
export const revalidate = 0;

async function getProjects(): Promise<WorkProject[]> {
  return client.fetch(
    `
      *[_type == "project"] | order(year desc) {
        _id,
        title,
        "slug": slug.current,
        "coverImageUrl": coverImage.asset->url,
        "coverImageAlt": coalesce(coverImage.alt, title),
        "imageWidth": coverImage.asset->metadata.dimensions.width,
        "imageHeight": coverImage.asset->metadata.dimensions.height
      }
    `,
    {},
    {
      cache: "no-store",
    }
  );
}

export default async function WorkPage() {
  const projects = await getProjects();

  return (
    <main className="min-h-screen overflow-x-hidden bg-white pb-16 text-black">
      {/* Fixed site header */}
      <header className="fixed inset-x-0 top-0 z-[200] isolate">
        <div className="flex min-h-[112px] items-start justify-between gap-4 px-4 pb-4 pt-4 md:min-h-[128px] md:px-10 md:pb-5 md:pt-8">
          <Link
            href="/"
            aria-label="Dean Hjerpyn homepage"
            className="relative z-[201] block shrink-0 transition-opacity duration-200 hover:opacity-40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4"
          >
            <span className="block font-mabrypro text-[32px] font-normal uppercase leading-[0.82] tracking-[-0.055em] md:text-[3.1vw]">
              Dean
            </span>

            <span className="block font-mabrypro text-[32px] font-normal uppercase leading-[0.82] tracking-[-0.055em] md:text-[3.1vw]">
              Hjerpyn
            </span>
          </Link>

          <nav
            aria-label="Primary navigation"
            className="relative z-[201] flex max-w-[62vw] flex-wrap justify-end gap-x-4 gap-y-2 pt-1 text-right font-mabrypro text-[8px] font-normal uppercase leading-none tracking-[0.1em] md:max-w-none md:gap-x-8 md:text-[11px]"
          >
            <Link
              href="/work"
              aria-current="page"
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

            <Link
              href="/#contact"
              className="transition-opacity duration-200 hover:opacity-40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4"
            >
              Contact
            </Link>
          </nav>
        </div>
      </header>

      {/* Matches the fixed header height */}
      <div className="relative z-0 px-4 pt-[75px] md:px-10 md:pt-[75px]">
        {projects.length === 0 ? (
          <section className="flex min-h-[60vh] items-end">
            <p className="font-mabrypro text-[10px] font-normal uppercase tracking-[0.16em]">
              No projects found.
            </p>
          </section>
        ) : (
          <WorkCanvas projects={projects} />
        )}
      </div>
    </main>
  );
}
