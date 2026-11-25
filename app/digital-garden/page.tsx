import { client } from "@/sanity/lib/client";
import PlantGarden from "../components/PlantGarden";
import SiteHeader from "../components/SiteHeader";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type PlantDrawing = {
  url: string;
  alt?: string;
};

type GardenSettings = {
  name?: string;
  email?: string;
  plantDrawings?: PlantDrawing[];
};

async function getSettings(): Promise<GardenSettings | null> {
  return client.fetch(
    `
      *[_type == "siteSettings"][0] {
        name,
        email,
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

export default async function DigitalGardenPage() {
  const settings = await getSettings();
  const drawings = settings?.plantDrawings ?? [];

  return (
    // No z-index or isolation on <main>: the fixed title's blend mode needs
    // to share a stacking context with the plant layer to see it.
    <main className="relative min-h-[100svh] overflow-x-hidden bg-white text-black">
      <SiteHeader
        title={settings?.name || "Dean Hjerpyn"}
        href="/"
        email={settings?.email || "hello@example.com"}
      />

      <PlantGarden drawings={drawings} />

      {drawings.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center px-4">
          <p className="font-mabrypro text-[10px] font-normal uppercase tracking-[0.16em]">
            No plant drawings yet. Add some in Site Settings.
          </p>
        </div>
      )}
    </main>
  );
}
