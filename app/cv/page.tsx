import { client } from "@/sanity/lib/client";
import SiteHeader from "../components/SiteHeader";

export const dynamic = "force-dynamic";
export const revalidate = 0;

/* -------------------------------------------------------------------------- */
/* Types                                                                      */
/* -------------------------------------------------------------------------- */

type SiteSettings = {
  name?: string;
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
        name,
        email,
        aboutHeading,
        aboutBody
      }
    `,
    {},
    {
      cache: "no-store",
    }
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
    {
      cache: "no-store",
    }
  );
}

/* -------------------------------------------------------------------------- */
/* Reusable pieces                                                            */
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
    <div className="mt-4 space-y-2.5">
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

/* Path-style section label, e.g. "/education". Lowercased with CSS so the
   Sanity data is untouched. */
function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mb-6 flex items-baseline gap-0.5 border-b border-black/30 pb-2 font-editorial text-[13px] font-normal lowercase leading-none tracking-[-0.01em]">
      <span aria-hidden="true">/</span>
      {children}
    </h2>
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

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-white text-black">
      <SiteHeader
        variant="inline"
        title={settings?.name || "Dean Hjerpyn"}
        href="/"
        email={email}
      />

      <main className="px-4 pb-28 pt-10 md:px-10 md:pb-36 md:pt-24">
        <div className="grid w-full grid-cols-1 gap-y-16 lg:grid-cols-[340px_minmax(0,820px)] lg:gap-x-20 xl:grid-cols-[380px_minmax(0,900px)] xl:gap-x-28">
          {/* Left column */}
          <aside className="no-scrollbar w-full lg:sticky lg:top-8 lg:max-h-[calc(100svh-64px)] lg:self-start lg:overflow-y-auto">
            {(settings?.aboutHeading || settings?.aboutBody) && (
              <section>
                <div className="max-w-[360px] font-sabon text-[13px] font-normal leading-[1.45] tracking-[-0.01em] md:text-[14px]">
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
          <section className="w-full font-sabon text-[13px] font-normal leading-[1.38] tracking-[-0.012em] md:text-[14px] xl:text-[15px]">
            {/* Education */}
            {education.length > 0 && (
              <section className="mb-16 md:mb-20">
                <SectionHeading>
                  {cv?.educationHeading || "Education"}
                </SectionHeading>

                <div className="space-y-8">
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
              <section className="mb-16 md:mb-20">
                <SectionHeading>
                  {cv?.experienceHeading || "Experience"}
                </SectionHeading>

                <div className="space-y-10 md:space-y-12">
                  {experience.map((entry) => (
                    <article
                      key={entry._key}
                      className="grid grid-cols-1 gap-y-2 xl:grid-cols-[150px_minmax(0,1fr)] xl:gap-x-8"
                    >
                      <p className="font-editorial text-[13px] font-normal leading-[1.3]">
                        {entry.dates}
                      </p>

                      <div>
                        {entry.position && (
                          <p className="font-editorial text-[14px] font-normal leading-[1.3] md:text-[15px]">
                            {entry.position}
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
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            )}

            {/* Awards */}
            {awards.length > 0 && (
              <section className="mb-16 md:mb-20">
                <SectionHeading>{cv?.awardsHeading || "Awards"}</SectionHeading>

                <div className="space-y-5">
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
                <SectionHeading>
                  {cv?.skillsHeading || "Special Skills"}
                </SectionHeading>

                <ResumeList items={skills} />
              </section>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
