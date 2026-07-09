import Link from "next/link";
import { client } from "@/sanity/lib/client";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type SiteSettings = {
  email?: string;
};

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

export default async function CVPage() {
  const settings = await getSiteSettings();
  const email = settings?.email || "hello@example.com";

  return (
    <main className="relative min-h-screen bg-white px-6 py-20 text-black">
      <header className="fixed left-8 top-8 z-50 md:left-20 md:top-16">
        <Link href="/" aria-label="Dean Hjerpyn homepage" className="block">
          <h1 className="font-editorial text-[54px] font-normal uppercase leading-[0.78] tracking-[-0.075em] md:text-[72px]">
            <span className="block">Dean</span>
            <span className="block">Hjerpyn</span>
          </h1>
        </Link>

        <nav className="mt-4 flex flex-col gap-7 font-editorial text-[16px] font-normal uppercase leading-none tracking-[0.02em] md:text-[18px]">
          <a href={`mailto:${email}`} className="w-fit hover:opacity-50">
            Contact
          </a>
        </nav>
      </header>

      <section className="mx-auto mt-[8vh] w-full max-w-[430px] font-sabon text-[10px] font-normal leading-[1.12] tracking-[-0.01em] md:mt-[10vh]">
        <div className="mb-20">
          <h2 className="mb-6 font-editorial text-[13px] font-normal tracking-[-0.02em]">
            Education
          </h2>

          <div className="mb-8">
            <p>The Ohio State University in Columbus, Ohio</p>
            <p>Master of Landscape Architecture</p>
            <p className="pl-6">*Expected Graduation: May 2027</p>
          </div>

          <div>
            <p>The Ohio State University in Columbus, Ohio</p>
            <p>Bachelor of Science in Environmental Science</p>
            <p>Specialization in Ecosystem Restoration</p>
            <p>Minor in Studio Art</p>
            <p className="pl-6">Magna Cum Laude</p>
            <p className="pl-6">Graduated: May 2022</p>
          </div>
        </div>

        <div className="mb-20">
          <h2 className="mb-6 font-editorial text-[13px] font-normal tracking-[-0.02em]">
            Experience
          </h2>

          <div>
            <p>Graduate Research Associate | Fall of 2025 – present</p>
            <p>
              Marilyn Reis, Trott Distinguished Visiting Professor, The Ohio
              State University
            </p>

            <ul className="mt-3 list-disc space-y-1 pl-8">
              <li>
                Conducted comprehensive literature reviews on peer-reviewed
                research and precedent projects to inform design strategies and
                academic publications
              </li>
              <li>
                Identified gaps in existing research and proposed innovative
                questions to advance discourse on sustainable and secure
                conscious design
              </li>
              <li>
                Developed visual communication techniques, including conceptual
                and technical drawing styles, to enhance project presentations
              </li>
            </ul>
          </div>
        </div>

        <div>
          <h2 className="mb-6 font-editorial text-[13px] font-normal tracking-[-0.02em]">
            Awards
          </h2>

          <div className="space-y-4">
            <p>
              <span className="mr-6">2026:</span>
              Katharine M. Grosscup Scholarships in Horticulture, The Garden
              Club of America
            </p>

            <p>
              <span className="mr-6">2024:</span>
              Studio Award, Fall semester, Knowlton School
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
