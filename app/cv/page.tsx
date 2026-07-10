import Link from "next/link";
import { client } from "@/sanity/lib/client";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type SiteSettings = {
  email?: string;
  aboutHeading?: string;
  aboutBody?: string;
};

async function getSiteSettings(): Promise<SiteSettings | null> {
  return client.fetch(
    `
      *[_type == "siteSettings"][0] {
        email,
        aboutHeading,
        aboutBody
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
    <div className="mt-5 space-y-3">
      {items.map((item) => (
        <div
          key={item}
          className="grid grid-cols-[28px_minmax(0,1fr)] items-start gap-x-2"
        >
          <span aria-hidden="true" className="font-editorial">
            //
          </span>

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
    "mb-8 border-b border-black/30 pb-3 font-editorial text-[18px] font-normal leading-none tracking-[-0.025em] md:text-[20px]";

  return (
    <main className="min-h-screen bg-white px-5 pb-28 pt-8 text-black md:px-10 md:pb-36 md:pt-12 lg:px-14 xl:px-20">
      <div className="mx-auto grid w-full max-w-[1500px] grid-cols-1 gap-y-20 lg:grid-cols-[340px_minmax(0,820px)] lg:gap-x-20 xl:grid-cols-[380px_minmax(0,900px)] xl:gap-x-28">
        <aside className="w-full lg:sticky lg:top-12 lg:self-start">
          <Link
            href="/"
            aria-label="Dean Hjerpyn homepage"
            className="block w-fit"
          >
            <h1 className="font-editorial text-[62px] font-normal uppercase leading-[0.77] tracking-[-0.075em] sm:text-[72px] md:text-[82px] lg:text-[86px] xl:text-[94px]">
              <span className="block">Dean</span>
              <span className="block">Hjerpyn</span>
            </h1>
          </Link>

          <nav className="mt-6 flex flex-col font-editorial text-[17px] font-normal uppercase leading-none tracking-[0.015em] md:text-[19px]">
            <a
              href={`mailto:${email}`}
              className="w-fit transition-opacity duration-200 hover:opacity-50"
            >
              Contact
            </a>
          </nav>

          <section className="mt-12 pt-5 md:mt-14">
            <h2 className="font-editorial text-[14px] font-normal uppercase tracking-[0.06em] md:text-[15px]">
              About Me
            </h2>

            <div className="mt-6 max-w-[360px] font-sabon text-[13px] font-normal leading-[1.45] tracking-[-0.01em] md:text-[14px]">
              {settings?.aboutHeading && (
                <p className="mb-5 font-editorial text-[16px] font-normal leading-[1.25] tracking-[-0.025em] md:text-[17px]">
                  {settings.aboutHeading}
                </p>
              )}

              {settings?.aboutBody && (
                <p className="whitespace-pre-line">{settings.aboutBody}</p>
              )}
            </div>
          </section>
        </aside>

        <section className="w-full font-sabon text-[13px] font-normal leading-[1.38] tracking-[-0.012em] md:text-[14px] lg:pt-[100px] xl:text-[15px]">
          <section className="mb-24 md:mb-32">
            <h2 className={headingClass}>Education</h2>

            <div className="space-y-12">
              <div>
                <p>The Ohio State University in Columbus, Ohio</p>
                <p>Master of Landscape Architecture</p>

                <p className="mt-2 grid grid-cols-[28px_minmax(0,1fr)] gap-x-2">
                  <span className="font-editorial">//</span>
                  <span>Expected Graduation: May 2027</span>
                </p>
              </div>

              <div>
                <p>The Ohio State University in Columbus, Ohio</p>
                <p>Bachelor of Science in Environmental Science</p>
                <p>Specialization in Ecosystem Restoration</p>
                <p>Minor in Studio Art</p>

                <div className="mt-3 space-y-2">
                  <p className="grid grid-cols-[28px_minmax(0,1fr)] gap-x-2">
                    <span className="font-editorial">//</span>
                    <span>Magna Cum Laude</span>
                  </p>

                  <p className="grid grid-cols-[28px_minmax(0,1fr)] gap-x-2">
                    <span className="font-editorial">//</span>
                    <span>Graduated: May 2022</span>
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section className="mb-24 md:mb-32">
            <h2 className={headingClass}>Experience</h2>

            <div className="space-y-16 md:space-y-20">
              <article>
                <p className="font-editorial text-[14px] leading-[1.3] md:text-[15px]">
                  Graduate Research Associate | Fall of 2025 – Present
                </p>

                <p className="mt-1">
                  Marilyn Reish, Trott Distinguished Visiting Professor, The
                  Ohio State University
                </p>

                <ResumeList
                  items={[
                    "Conducted comprehensive literature reviews on peer-reviewed research and precedent projects to inform design strategies and academic publications",
                    "Identified gaps in existing research and proposed innovative questions to advance discourse on sustainable and resource-conscious design",
                    "Developed visual communication techniques, including conceptual and technical drawing styles, to enhance project presentations",
                  ]}
                />
              </article>

              <article>
                <p className="font-editorial text-[14px] leading-[1.3] md:text-[15px]">
                  Externship | Fall of 2025
                </p>

                <p className="mt-1">
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
              </article>

              <article>
                <p className="font-editorial text-[14px] leading-[1.3] md:text-[15px]">
                  Part-time Horticulturalist | April 2023 – August 2024
                </p>

                <p className="mt-1">
                  Inniswood Metro Gardens, Westerville, Ohio
                </p>

                <ResumeList
                  items={[
                    "Performed various gardening tasks including bed preparation, layout and planting, pruning, watering, weeding, and fertilizing",
                    "Assisted in the care and maintenance of plant materials and gardens on grounds, and in the greenhouse",
                    "Inspected plant materials for damage, disease, pests, etc.",
                    "Operated grounds maintenance equipment such as off-road vehicles, edgers, blowers, the bobcat, and a variety of gardening tools such as pruners, hoes, shovels, etc.",
                    "Led and supervised weekly volunteer work session events",
                  ]}
                />
              </article>

              <article>
                <p className="font-editorial text-[14px] leading-[1.3] md:text-[15px]">
                  Research Assistant | Summer/Fall of 2022
                </p>

                <p className="mt-1">
                  Streams, Rivers, and Estuaries Lab, The Ohio State University
                </p>

                <ResumeList
                  items={[
                    "Assisted with fish community surveys and assessment of reintroduction of rare fish species; sampling methods included various forms of electro-fishing, seining, snorkeling, and benthic trawls",
                    "Took part in the reintroduction and translocation of rare and/or Ohio listed fish species; these projects have led to the down-listing of several species including the formerly Ohio Threatened Tippecanoe Darter",
                    "Worked alongside various organizations including USFWS, Ohio Division of Wildlife, Ohio Department of Natural Areas and Preserves, PA Fish and Boat Commission, IN Department of Natural Resources, and multiple County Metro Park systems",
                  ]}
                />
              </article>

              <article>
                <p className="font-editorial text-[14px] leading-[1.3] md:text-[15px]">
                  Field Technician | Summer of 2021
                </p>

                <p className="mt-1">Clarke, Columbus, Ohio</p>

                <ResumeList
                  items={[
                    "Collected and set mosquito traps and synthesized data for the Franklin County Public Health Department",
                    "Identified and counted mosquito samples by species and sex for recorded data collection in order to inform county-wide pesticide measures",
                    "Investigated sites in Franklin County, Ohio for mosquito larvae via water sampling and applied the appropriate measure of larvicide where necessary",
                    "Communicated and built relationships with residents of Franklin County and helped educate the community regarding the life cycle of mosquitoes for prevention, as well as on public health guidelines of pesticides",
                  ]}
                />
              </article>

              <article>
                <p className="font-editorial text-[14px] leading-[1.3] md:text-[15px]">
                  Student Ecological Restorationist | Fall of 2021
                </p>

                <p className="mt-1">
                  Chadwick Arboretum, The Ohio State University
                </p>

                <ResumeList
                  items={[
                    "Performed topographical and vegetation surveys in order to create a comprehensive section drawing of a riparian zone located in the ecological restoration site",
                    "Utilized GPS and GIS technologies in order to delineate anthropogenic and natural features to capture the range of variability in the site’s ecological structure",
                    "Prepared the restoration site through the physical removal of invasive species and monocultures, as well as through the application of erosion control methods",
                    "Collected, processed, and planted native seeds in addition to out-planting woody vegetation to restore diversity of the site’s ecological structure and function",
                  ]}
                />
              </article>

              <article>
                <p className="font-editorial text-[14px] leading-[1.3] md:text-[15px]">
                  Student Instructional Assistant | Fall of 2021
                </p>

                <p className="mt-1">
                  Society and Natural Resources, The Ohio State University
                </p>

                <ResumeList
                  items={[
                    "Graded student discussions and projects throughout the semester in a timely manner",
                    "Provided detailed feedback to students in order to support academic success through Office Hours and assignment comments",
                    "Led Student Assistant meetings with the course professor in order to improve class policies, grading methods, and communication with students",
                  ]}
                />
              </article>
            </div>
          </section>

          <section className="mb-24 md:mb-32">
            <h2 className={headingClass}>Awards</h2>

            <div className="space-y-6">
              <div className="grid grid-cols-[72px_minmax(0,1fr)] gap-x-4">
                <span className="font-editorial">2026 //</span>

                <p>
                  Katharine M. Grosscup Scholarships in Horticulture, The Garden
                  Club of America
                </p>
              </div>

              <div className="grid grid-cols-[72px_minmax(0,1fr)] gap-x-4">
                <span className="font-editorial">2024 //</span>

                <p>Studio Award, Fall semester, Knowlton School</p>
              </div>
            </div>
          </section>

          <section>
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
          </section>
        </section>
      </div>
    </main>
  );
}
