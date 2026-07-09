import { client } from "@/sanity/lib/client";
import AnimatedHero from "./components/AnimatedHero";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type PlantDrawing = {
  url: string;
  alt?: string;
};

type SiteSettings = {
  name?: string;
  headline?: string;
  aboutHeading?: string;
  aboutBody?: string;
  email?: string;
  instagram?: string;
  plantDrawings?: PlantDrawing[];
};

async function getSiteSettings(): Promise<SiteSettings | null> {
  return client.fetch(
    `
      *[_type == "siteSettings"][0] {
        name,
        headline,
        aboutHeading,
        aboutBody,
        email,
        instagram,
        "plantDrawings": plantDrawings[] {
          "url": asset->url,
          alt
        }
      }
    `,
    {},
    { cache: "no-store" }
  );
}

export default async function Home() {
  const settings = await getSiteSettings();

  const email = settings?.email || "hello@example.com";
  const currentYear = new Date().getFullYear();

  const headline =
    settings?.headline ||
    "A portfolio of well built, site-specific landscapes that respond to client needs while simultaneously challenging historical and contemporary landscape construction methods, materials, and formal conventions. Our design approach is post-internet, critically-regionalist, and respectfully inflammatory.";

  return (
    <main className="min-h-screen overflow-x-hidden bg-white px-4 pb-5 text-[#1f1a13] md:px-8 md:pb-8">
      {/* Animated site identity, navigation, and introduction */}
      <AnimatedHero
        headline={headline}
        email={email}
        plantDrawings={settings?.plantDrawings || []}
      />

      {/* CMS-managed About */}
      <section
        id="about"
        className="mt-32 grid scroll-mt-24 gap-7 md:mt-48 md:grid-cols-12"
      >
        <p className="font-editorial text-[9px] font-normal uppercase tracking-[0.16em] md:col-span-3">
          About
        </p>

        <div className="space-y-8 md:col-span-9">
          <p className="max-w-4xl font-sabon text-[1.75rem] font-normal leading-[1.04] tracking-[-0.03em] md:text-[clamp(2.1rem,2.8vw,3rem)]">
            {settings?.aboutHeading ||
              "Dean Hjerpyn is a landscape designer working across planted spaces, ecological systems, and site-specific environments."}
          </p>

          <p className="max-w-xl font-sabon text-[15px] font-normal leading-6 text-[#1f1a13]/70 md:text-base">
            {settings?.aboutBody ||
              "Her work explores the relationship between people, plants, material, maintenance, and time. This portfolio gathers selected projects, field observations, design studies, and landscape research."}
          </p>

          <div
            id="contact"
            className="flex flex-wrap gap-6 font-editorial text-[9px] font-normal uppercase tracking-[0.14em]"
          >
            <a
              href={`mailto:${email}`}
              className="border-b border-current pb-1 transition-opacity hover:opacity-50"
            >
              Email Dean
            </a>

            {settings?.instagram && (
              <a
                href={settings.instagram}
                target="_blank"
                rel="noreferrer"
                className="border-b border-current pb-1 transition-opacity hover:opacity-50"
              >
                Instagram
              </a>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-32 flex items-end justify-between border-t border-[#1f1a13] pt-4 font-editorial text-[8px] font-normal uppercase tracking-[0.14em] md:mt-48 md:text-[9px]">
        <p>© {currentYear}</p>

        <p className="text-right">{settings?.name || "Dean Hjerpyn"}</p>
      </footer>
    </main>
  );
}
