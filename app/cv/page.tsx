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

type ResumeListProps = {
  items: string[];
};

function ResumeList({ items }: ResumeListProps) {
  return (
    <div className="mt-3 space-y-2">
      {items.map((item) => (
        <div
          key={item}
          className="grid grid-cols-[18px_minmax(0,1fr)] items-start gap-1"
        >
          <span aria-hidden="true">//</span>
          <p>{item}</p>
        </div>
      ))}
    </div>
  );
}

export default async function CVPage() {
  const settings = await getSiteSettings();
  const email = settings?.email || "hello@example.com";

  const headingClass =
    "mb-6 border-b border-black/30 pb-2 font-editorial text-[13px] font-normal tracking-[-0.02em]";

  return (
    <main className="relative min-h-screen bg-white px-5 pb-24 pt-32 text-black md:px-8 md:pb-32 md:pt-40">
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

          <a
            href={`mailto:${email}`}
            className="transition-opacity hover:opacity-50"
          >
            Contact
          </a>
        </nav>
      </header>

      <div className="mx-auto grid w-full max-w-[1120px] gap-16 lg:grid-cols-[220px_minmax(0,430px)] lg:justify-center lg:gap-24">
        <aside className="lg:sticky lg:top-32 lg:h-fit">
          <h2 className={headingClass}>About Me</h2>

          <div className="max-w-[260px] space-y-4 font-sabon text-[11px] font-normal leading-[1.35] tracking-[-0.01em]">
            <p>
              Write a short introduction here about your approach to landscape
              architecture, ecological design, planting, research, and
              site-specific work.
            </p>

            <p>
              This area can also include your design interests, values,
              background, or the types of projects and collaborations you are
              interested in pursuing.
            </p>
          </div>
        </aside>

        <section className="w-full font-sabon text-[10px] font-normal leading-[1.2] tracking-[-0.01em]">
          <div className="mb-20">
            <h2 className={headingClass}>Education</h2>

            <div className="mb-8">
              <p>The Ohio State University in Columbus, Ohio</p>
              <p>Master of Landscape Architecture</p>
              <p className="mt-1 grid grid-cols-[18px_minmax(0,1fr)] gap-1">
                <span>//</span>
                <span>Expected Graduation: May 2027</span>
              </p>
            </div>

            <div>
              <p>The Ohio State University in Columbus, Ohio</p>
              <p>Bachelor of Science in Environmental Science</p>
              <p>Specialization in Ecosystem Restoration</p>
              <p>Minor in Studio Art</p>

              <div className="mt-2 space-y-1">
                <p className="grid grid-cols-[18px_minmax(0,1fr)] gap-1">
                  <span>//</span>
                  <span>Magna Cum Laude</span>
                </p>

                <p className="grid grid-cols-[18px_minmax(0,1fr)] gap-1">
                  <span>//</span>
                  <span>Graduated: May 2022</span>
                </p>
              </div>
            </div>
          </div>

          <div className="mb-20">
            <h2 className={headingClass}>Experience</h2>

            <div className="mb-12">
              <p>Graduate Research Associate | Fall of 2025 – present</p>
              <p>
                Marilyn Reish, Trott Distinguished Visiting Professor, The Ohio
                State University
              </p>

              <ResumeList
                items={[
                  "Conducted comprehensive literature reviews on peer-reviewed research and precedent projects to inform design strategies and academic publications",
                  "Identified gaps in existing research and proposed innovative questions to advance discourse on sustainable and resource-conscious design",
                  "Developed visual communication techniques, including conceptual and technical drawing styles, to enhance project presentations",
                ]}
              />
            </div>

            <div className="mb-12">
              <p>Externship | Fall of 2025</p>
              <p>
                TERREMOTO, Glimcher Distinguished Visiting Professorship, The
                Ohio State University
              </p>

              <ResumeList
                items={[
                  "Conducted an on-site visit and engaged with garden caretakers of Columbus Museum of Art’s Collection at The Pizzuti to understand existing conditions, goals, and long-term vision for the redesign project of its garden",
                  "Researched native Ohio plant species through a local nursery visit to inform sustainable planting strategies and ecological design decisions",
                  "Developed and executed a comprehensive design presentation for museum staff",
                  "Compiled a detailed plant order based on curated selections and prepared the site for installation",
                  "Led and coordinated volunteer efforts during garden planting and performed general site maintenance to ensure successful establishment",
                  "Documented the design-build process through video and produced an edited final presentation to showcase project outcomes and celebrate collaborative efforts",
                ]}
              />
            </div>

            <div className="mb-12">
              <p>Part-time Horticulturalist | April 2023 – August 2024</p>
              <p>Inniswood Metro Gardens, Westerville, Ohio</p>

              <ResumeList
                items={[
                  "Performed various gardening tasks including bed preparation, layout and planting, pruning, watering, weeding, and fertilizing",
                  "Assisted in the care and maintenance of plant materials and gardens on grounds, and in the greenhouse",
                  "Inspected plant materials for damage, disease, pests, etc.",
                  "Operated grounds maintenance equipment such as off-road vehicles, edgers, blowers, the bobcat, and a variety of gardening tools such as pruners, hoes, shovels, etc.",
                  "Led and supervised weekly volunteer work session events",
                ]}
              />
            </div>

            <div className="mb-12">
              <p>Research Assistant | Summer/Fall of 2022</p>
              <p>
                Streams, Rivers, and Estuaries Lab, The Ohio State University
              </p>

              <ResumeList
                items={[
                  "Assisted with fish community surveys and assessment of reintroduction of rare fish species; sampling methods included various forms of electro-fishing, seining, snorkeling, and benthic trawls",
                  "Took part in the reintroduction and translocation of rare and/or Ohio listed fish species; these projects have led to the down-listing of several species including the formerly Ohio Threatened Tippecanoe Darter",
                  "Worked alongside various organizations including USFWS, Ohio Division of Wildlife, Ohio Department of Natural Areas and Preserves, PA Fish and Boat Commission, IN Department of Natural Resources, and multiple County Metro Park systems",
                ]}
              />
            </div>

            <div className="mb-12">
              <p>Field Technician | Summer of 2021</p>
              <p>Clarke, Columbus, Ohio</p>

              <ResumeList
                items={[
                  "Collected and set mosquito traps and synthesized data for the Franklin County Public Health Department",
                  "Identified and counted mosquito samples by species and sex for recorded data collection in order to inform county-wide pesticide measures",
                  "Investigated sites in Franklin County, Ohio for mosquito larvae via water sampling and applied the appropriate measure of larvicide where necessary",
                  "Communicated and built relationships with residents of Franklin County and helped educate the community regarding the life cycle of mosquitoes for prevention, as well as on public health guidelines of pesticides",
                ]}
              />
            </div>

            <div className="mb-12">
              <p>Student Ecological Restorationist | Fall of 2021</p>
              <p>Chadwick Arboretum, The Ohio State University</p>

              <ResumeList
                items={[
                  "Performed topographical and vegetation surveys in order to create a comprehensive section drawing of a riparian zone located in the ecological restoration site",
                  "Utilized GPS and GIS technologies in order to delineate anthropogenic and natural features to capture the range of variability in the site’s ecological structure",
                  "Prepared the restoration site through the physical removal of invasive species and monocultures, as well as through the application of erosion control methods",
                  "Collected, processed, and planted native seeds in addition to out-planting woody vegetation to restore diversity of the site’s ecological structure and function",
                ]}
              />
            </div>

            <div>
              <p>Student Instructional Assistant | Fall of 2021</p>
              <p>Society and Natural Resources, The Ohio State University</p>

              <ResumeList
                items={[
                  "Graded student discussions and projects throughout the semester in a timely manner",
                  "Provided detailed feedback to students in order to support academic success through Office Hours and assignment comments",
                  "Led Student Assistant meetings with the course professor in order to improve class policies, grading methods, and communication with students",
                ]}
              />
            </div>
          </div>

          <div className="mb-20">
            <h2 className={headingClass}>Awards</h2>

            <div className="space-y-4">
              <div className="grid grid-cols-[52px_minmax(0,1fr)] gap-2">
                <span>2026 //</span>
                <p>
                  Katharine M. Grosscup Scholarships in Horticulture, The Garden
                  Club of America
                </p>
              </div>

              <div className="grid grid-cols-[52px_minmax(0,1fr)] gap-2">
                <span>2024 //</span>
                <p>Studio Award, Fall semester, Knowlton School</p>
              </div>
            </div>
          </div>

          <div>
            <h2 className={headingClass}>Special Skills</h2>

            <ResumeList
              items={[
                "Adobe Creative Cloud",
                "AutoCAD",
                "Rhino",
                "Grasshopper",
                "QGIS",
                "Site planning and analysis",
                "Ecological planting design",
                "Construction documentation",
                "Synthesizing and revising laboratory and research reports",
                "Written and verbal communication",
              ]}
            />
          </div>
        </section>
      </div>
    </main>
  );
}
