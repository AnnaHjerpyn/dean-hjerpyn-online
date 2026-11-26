import { client } from "@/sanity/lib/client";
import SiteHeader from "./components/SiteHeader";
import ScrollColumn from "./components/ScrollColumn";
import WorksColumn, { type Work } from "./components/WorksColumn";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type Img = {
  _key: string;
  url: string;
  alt?: string;
};

type HomeData = {
  name?: string;
  email?: string;
  works: Work[];
  papermaking: Img[];
  fieldJournal: Img[];
};

async function getHomeData(): Promise<HomeData> {
  return client.fetch(
    `{
      "name": *[_type == "siteSettings"][0].name,
      "email": *[_type == "siteSettings"][0].email,

      "works": *[_type == "project" && defined(coverImage.asset)] | order(year desc) {
        _id,
        title,
        "slug": slug.current,
        "url": coverImage.asset->url + "?w=1400&fm=webp&q=85",
        "alt": coalesce(coverImage.alt, title),
        "width": coverImage.asset->metadata.dimensions.width,
        "height": coverImage.asset->metadata.dimensions.height
      },

      "papermaking": *[_type == "siteSettings"][0].papermakingImages[defined(asset)] {
        _key,
        "url": asset->url + "?w=900&fm=webp&q=80",
        alt
      },

      "fieldJournal": *[_type == "fieldJournalEntry" && defined(image.asset)] | order(date desc) {
        "_key": _id,
        "url": image.asset->url + "?w=900&fm=webp&q=80",
        "alt": image.alt
      }
    }`,
    {},
    { cache: "no-store" }
  );
}

export default async function Home() {
  const { name, email, works, papermaking, fieldJournal } = await getHomeData();

  return (
    <main className="grid min-h-[100svh] grid-cols-1 bg-white text-black md:h-[100svh] md:grid-cols-[2.1fr_1fr_1fr] md:overflow-hidden">
      {/* Column 1: Name, navigation, Selected Works */}
      <WorksColumn
        works={works ?? []}
        header={
          <SiteHeader
            variant="inline"
            title={name || "Dean Hjerpyn"}
            email={email || "hello@example.com"}
          />
        }
      />

      {/* Column 2: Papermaking */}
      <ScrollColumn label="papermaking" images={papermaking ?? []} />

      {/* Column 3: Field Journal */}
      <ScrollColumn label="field journal" images={fieldJournal ?? []} />
    </main>
  );
}
