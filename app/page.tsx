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
        "plantDrawings": plantDrawings[defined(asset)] {
          // Resized, WebP, desaturated by Sanity's image CDN so the
          // browser never decodes the full-size originals.
          "url": asset->url + "?w=400&fm=webp&q=80&sat=-100",
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

  const headline = settings?.headline || "";
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
