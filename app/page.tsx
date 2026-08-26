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

  const headline =
    settings?.headline ||
    "A portfolio of well built, site-specific landscapes that respond to client needs while simultaneously challenging historical and contemporary landscape construction methods, materials, and formal conventions. Our design approach is post-internet, critically-regionalist, and respectfully inflammatory.";

  return (
    <main className="relative min-h-[100svh] overflow-x-hidden bg-white text-black">
      <AnimatedHero
        headline={headline}
        email={email}
        plantDrawings={settings?.plantDrawings || []}
      />
    </main>
  );
}
