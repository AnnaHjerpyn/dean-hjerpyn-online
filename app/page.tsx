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
    <main className="relative min-h-[100svh] overflow-x-hidden bg-white">
      {/* Animated site identity, navigation, and introduction */}
      <AnimatedHero
        headline={headline}
        email={email}
        plantDrawings={settings?.plantDrawings || []}
      />
      {/* Footer */}
      <footer className="mt-32 flex items-end justify-between border-t border-[#1f1a13] pt-4 font-editorial text-[8px] font-normal uppercase tracking-[0.14em] md:mt-48 md:text-[9px]">
        <p>© {currentYear}</p>

        <p className="text-right">{settings?.name || "Dean Hjerpyn"}</p>
      </footer>
    </main>
  );
}
