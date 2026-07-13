import Link from "next/link";
import { client } from "@/sanity/lib/client";

export const dynamic = "force-dynamic";
export const revalidate = 0;

/* -------------------------------------------------------------------------- */
/* Types                                                                      */
/* -------------------------------------------------------------------------- */

type SiteSettings = {
  email?: string;
  aboutHeading?: string;
  aboutBody?: string;
};

type EducationEntry = {
  _key: string;
  institution?: string;
  location?: string;
  degree?: string;
  specialization?: string;
  minor?: string;
  details?: string[];
};

type ExperienceEntry = {
  _key: string;
  position?: string;
  dates?: string;
  organization?: string;
  location?: string;
  bullets?: string[];
};

type AwardEntry = {
  _key: string;
  year?: string;
  title?: string;
};

type CVPageData = {
  educationHeading?: string;
  education?: EducationEntry[];

  experienceHeading?: string;
  experience?: ExperienceEntry[];

  awardsHeading?: string;
  awards?: AwardEntry[];

  skillsHeading?: string;
  skills?: string[];
};

/* -------------------------------------------------------------------------- */
/* Sanity queries                                                             */
/* -------------------------------------------------------------------------- */

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

async function getCVPage(): Promise<CVPageData | null> {
  return client.fetch(
    `
      *[_type == "cvPage"][0] {
        educationHeading,

        education[] {
          _key,
          institution,
          location,
          degree,
          specialization,
          minor,
          details
        },

        experienceHeading,

        experience[] {
          _key,
          position,
          dates,
          organization,
          location,
          bullets
        },

        awardsHeading,

        awards[] {
          _key,
          year,
          title
        },

        skillsHeading,
        skills
      }
    `,
    {},
    { cache: "no-store" }
  );
}

/* -------------------------------------------------------------------------- */
/* Reusable list                                                              */
/* -------------------------------------------------------------------------- */

type ResumeListProps = {
  items?: string[];
};

function ResumeList({ items = [] }: ResumeListProps) {
  const validItems = items.filter(
    (item): item is string => typeof item === "string" && item.trim().length > 0
  );

  if (validItems.length === 0) {
    return null;
  }

  return (
    <div className="mt-5 space-y-3">
      {validItems.map((item, index) => (
        <div
          key={`${item}-${index}`}
          className="grid grid-cols-[28px_minmax(0,1fr)] items-start gap-x-2"
        >
          <span aria-hidden="true" className="font-editorial">
            //
          </span>

          <p className="whitespace-pre-line">{item}</p>
        </div>
      ))}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* CV page                                                                    */
/* -------------------------------------------------------------------------- */

export default async function CVPage() {
  const [settings, cv] = await Promise.all([getSiteSettings(), getCVPage()]);

  const email = settings?.email || "hello@example.com";

  const education = cv?.education || [];
  const experience = cv?.experience || [];
  const awards = cv?.awards || [];
  const skills = cv?.skills || [];

  const headingClass =
    "mb-8 border-b border-black/30 pb-3 font-editorial text-[18px] font-normal leading-none tracking-[-0.025em] md:text-[20px]";

  return (
    <main className="min-h-screen bg-white px-5 pb-28 pt-8 text-black md:px-10 md:pb-36 md:pt-12 lg:px-14 xl:px-20">
      <div className="mx-auto grid w-full max-w-[1500px] grid-cols-1 gap-y-20 lg:grid-cols-[340px_minmax(0,820px)] lg:gap-x-20 xl:grid-cols-[380px_minmax(0,900px)] xl:gap-x-28">
        {/* Left column */}
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

          {(settings?.aboutHeading || settings?.aboutBody) && (
            <section className="mt-12 pt-5 md:mt-14">
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
          )}
        </aside>

        {/* Right column */}
        <section className="w-full font-sabon text-[13px] font-normal leading-[1.38] tracking-[-0.012em] md:text-[14px] lg:pt-[100px] xl:text-[15px]">
          {/* Education */}
          {education.length > 0 && (
            <section className="mb-24 md:mb-32">
              <h2 className={headingClass}>
                {cv?.educationHeading || "Education"}
              </h2>

              <div className="space-y-12">
                {education.map((entry) => (
                  <article key={entry._key}>
                    {entry.institution && (
                      <p>
                        {entry.institution}
                        {entry.location ? ` in ${entry.location}` : ""}
                      </p>
                    )}

                    {entry.degree && <p>{entry.degree}</p>}

                    {entry.specialization && <p>{entry.specialization}</p>}

                    {entry.minor && <p>{entry.minor}</p>}

                    <ResumeList items={entry.details} />
                  </article>
                ))}
              </div>
            </section>
          )}

          {/* Experience */}
          {experience.length > 0 && (
            <section className="mb-24 md:mb-32">
              <h2 className={headingClass}>
                {cv?.experienceHeading || "Experience"}
              </h2>

              <div className="space-y-16 md:space-y-20">
                {experience.map((entry) => (
                  <article key={entry._key}>
                    {(entry.position || entry.dates) && (
                      <p className="font-editorial text-[14px] font-normal leading-[1.3] md:text-[15px]">
                        {entry.position}

                        {entry.position && entry.dates ? " | " : ""}

                        {entry.dates}
                      </p>
                    )}

                    {(entry.organization || entry.location) && (
                      <p className="mt-1">
                        {entry.organization}

                        {entry.organization && entry.location ? ", " : ""}

                        {entry.location}
                      </p>
                    )}

                    <ResumeList items={entry.bullets} />
                  </article>
                ))}
              </div>
            </section>
          )}

          {/* Awards */}
          {awards.length > 0 && (
            <section className="mb-24 md:mb-32">
              <h2 className={headingClass}>{cv?.awardsHeading || "Awards"}</h2>

              <div className="space-y-6">
                {awards.map((award) => (
                  <article
                    key={award._key}
                    className="grid grid-cols-[72px_minmax(0,1fr)] gap-x-4"
                  >
                    <span className="font-editorial">
                      {award.year ? `${award.year} //` : "//"}
                    </span>

                    {award.title && <p>{award.title}</p>}
                  </article>
                ))}
              </div>
            </section>
          )}

          {/* Special skills */}
          {skills.length > 0 && (
            <section>
              <h2 className={headingClass}>
                {cv?.skillsHeading || "Special Skills"}
              </h2>

              <ResumeList items={skills} />
            </section>
          )}
        </section>
      </div>
    </main>
  );
}
