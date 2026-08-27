import { client } from "@/sanity/lib/client";

import WorkCanvas, { type WorkProject } from "../components/WorkCanvas";
import SiteHeader from "../components/SiteHeader";

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
      <SiteHeader
        title="Dean Hjerpyn"
        href="/"
        email="your-email@example.com"
      />

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
