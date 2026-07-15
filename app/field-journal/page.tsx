import Link from "next/link";
import { client } from "@/sanity/lib/client";
import FieldJournalStack from "./FieldJournalStack";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type FieldJournalEntry = {
  _id: string;
  mediaType?: "image" | "video" | "pdf";
  imageUrl?: string;
  videoUrl?: string;
  pdfUrl?: string;
  alt?: string;
  caption?: string;
  date?: string;
};

async function getFieldJournalEntries(): Promise<FieldJournalEntry[]> {
  return client.fetch(
    `
      *[_type == "fieldJournalEntry"] | order(date desc) {
        _id,
        mediaType,
        alt,
        caption,
        date,
        "imageUrl": image.asset->url,
        "videoUrl": video.asset->url,
        "pdfUrl": pdf.asset->url
      }
    `,
    {},
    {
      cache: "no-store",
    }
  );
}

export default async function FieldJournalPage() {
  const entries = await getFieldJournalEntries();

  return (
    <main className="min-h-screen bg-white text-[#1f1a13]">
      <header>
        <Link
          href="/"
          aria-label="Dean Hjerpyn homepage"
          className="fixed left-4 top-4 z-50 block md:left-8 md:top-8"
        >
          <span className="block font-editorial text-[34px] uppercase leading-[0.86] tracking-[-0.05em] md:text-[3.2vw]">
            Dean
          </span>

          <span className="block font-editorial text-[34px] uppercase leading-[0.86] tracking-[-0.05em] md:text-[3.2vw]">
            Hjerpyn
          </span>
        </Link>
      </header>

      <FieldJournalStack entries={entries} />
    </main>
  );
}
