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

          <div className="mb-12">
            <p>Graduate Research Associate | Fall of 2025 – present</p>
            <p>
              Marilyn Reish, Trott Distinguished Visiting Professor, The Ohio
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
                questions to advance discourse on sustainable and
                resource-conscious design
              </li>
              <li>
                Developed visual communication techniques, including conceptual
                and technical drawing styles, to enhance project presentations
              </li>
            </ul>
          </div>

          <div className="mb-12">
            <p>Externship | Fall of 2025</p>
            <p>
              TERREMOTO, Glimcher Distinguished Visiting Professorship, The Ohio
              State University
            </p>

            <ul className="mt-3 list-disc space-y-1 pl-8">
              <li>
                Conducted an on-site visit and engaged with garden caretakers of
                Columbus Museum of Art’s Collection at The Pizzuti to understand
                existing conditions, goals, and long-term vision for the
                redesign project of its garden
              </li>
              <li>
                Researched native Ohio plant species through a local nursery
                visit to inform sustainable planting strategies and ecological
                design decisions
              </li>
              <li>
                Developed and executed a comprehensive design presentation for
                museum staff
              </li>
              <li>
                Compiled a detailed plant order based on curated selections and
                prepared the site for installation
              </li>
              <li>
                Led and coordinated volunteer efforts during garden planting and
                performed general site maintenance to ensure successful
                establishment
              </li>
              <li>
                Documented the design-build process through video and produced
                an edited final presentation to showcase project outcomes and
                celebrate collaborative efforts
              </li>
            </ul>
          </div>

          <div className="mb-12">
            <p>Part-time Horticulturalist | April 2023 – August 2024</p>
            <p>Inniswood Metro Gardens, Westerville, Ohio</p>

            <ul className="mt-3 list-disc space-y-1 pl-8">
              <li>
                Performed various gardening tasks including bed preparation,
                layout and planting, pruning, watering, weeding, and fertilizing
              </li>
              <li>
                Assisted in the care and maintenance of plant materials and
                gardens on grounds, and in the greenhouse
              </li>
              <li>
                Inspected plant materials for damage, disease, pests, etc.
              </li>
              <li>
                Operated grounds maintenance equipment such as off-road
                vehicles, edgers, blowers, the bobcat, and a variety of
                gardening tools such as pruners, hoes, shovels, etc.
              </li>
              <li>Led and supervised weekly volunteer work session events</li>
            </ul>
          </div>

          <div className="mb-12">
            <p>Research Assistant | Summer/Fall of 2022</p>
            <p>Streams, Rivers, and Estuaries Lab, The Ohio State University</p>

            <ul className="mt-3 list-disc space-y-1 pl-8">
              <li>
                Assisted with fish community surveys and assessment of
                reintroduction of rare fish species; sampling methods included
                various forms of electro-fishing, seining, snorkeling, and
                benthic trawls
              </li>
              <li>
                Took part in the reintroduction and translocation of rare and/or
                Ohio listed fish species; these projects have led to the
                down-listing of several species including the formerly Ohio
                Threatened Tippecanoe Darter
              </li>
              <li>
                Worked alongside various organizations including USFWS, Ohio
                Division of Wildlife, Ohio Department of Natural Areas and
                Preserves, PA Fish and Boat Commission, IN Department of Natural
                Resources, and multiple County Metro Park systems
              </li>
            </ul>
          </div>

          <div className="mb-12">
            <p>Field Technician | Summer of 2021</p>
            <p>Clarke, Columbus, Ohio</p>

            <ul className="mt-3 list-disc space-y-1 pl-8">
              <li>
                Collected and set mosquito traps and synthesized data for the
                Franklin County Public Health Department
              </li>
              <li>
                Identified and counted mosquito samples by species and sex for
                recorded data collection in order to inform county-wide
                pesticide measures
              </li>
              <li>
                Investigated sites in Franklin County, Ohio for mosquito larvae
                via water sampling and applied the appropriate measure of
                larvicide where necessary
              </li>
              <li>
                Communicated and built relationships with residents of Franklin
                County and helped educate the community regarding the life cycle
                of mosquitoes for prevention, as well as on public health
                guidelines of pesticides
              </li>
            </ul>
          </div>

          <div className="mb-12">
            <p>Student Ecological Restorationist | Fall of 2021</p>
            <p>Chadwick Arboretum, The Ohio State University</p>

            <ul className="mt-3 list-disc space-y-1 pl-8">
              <li>
                Performed topographical and vegetation surveys in order to
                create a comprehensive section drawing of a riparian zone
                located in the ecological restoration site
              </li>
              <li>
                Utilized GPS and GIS technologies in order to delineate
                anthropogenic and natural features to capture the range of
                variability in the site’s ecological structure
              </li>
              <li>
                Prepared the restoration site through the physical removal of
                invasive species and monocultures, as well as through the
                application of erosion control methods
              </li>
              <li>
                Collected, processed, and planted native seeds in addition to
                out-planting woody vegetation to restore diversity of the site’s
                ecological structure and function
              </li>
            </ul>
          </div>

          <div>
            <p>Student Instructional Assistant | Fall of 2021</p>
            <p>Society and Natural Resources, The Ohio State University</p>

            <ul className="mt-3 list-disc space-y-1 pl-8">
              <li>
                Graded student discussions and projects throughout the semester
                in a timely manner
              </li>
              <li>
                Provided detailed feedback to students in order to support
                academic success through Office Hours and assignment comments
              </li>
              <li>
                Led Student Assistant meetings with the course professor in
                order to improve class policies, grading methods, and
                communication with students
              </li>
            </ul>
          </div>
        </div>

        <div className="mb-20">
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

        <div>
          <h2 className="mb-6 font-editorial text-[13px] font-normal tracking-[-0.02em]">
            Special Skills
          </h2>

          <ul className="list-disc space-y-1 pl-8">
            <li>Adobe Creative Cloud</li>
            <li>AutoCAD</li>
            <li>Rhino</li>
            <li>Grasshopper</li>
            <li>QGIS</li>
            <li>Site planning and analysis</li>
            <li>Ecological planting design</li>
            <li>Construction documentation</li>
            <li>Synthesizing and revising laboratory and research reports</li>
            <li>Written and verbal communication</li>
          </ul>
        </div>
      </section>
    </main>
  );
}
