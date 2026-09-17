import Link from "next/link";
import { client } from "@/sanity/lib/client";
import FieldJournalStack, { type FieldJournalEntry } from "./FieldJournalStack";
import SiteHeader from "@/app/components/SiteHeader";

export const dynamic = "force-dynamic";
export const revalidate = 0;

async function getFieldJournalEntries(): Promise<FieldJournalEntry[]> {
  return client.fetch(
    `
      *[_type == "fieldJournalEntry"] | order(date desc) {
        _id,
        mediaType,
        alt,
        caption,
        writing,
        date,
        "imageUrl": image.asset->url,
        "videoUrl": video.asset->url,
        "videoMimeType": video.asset->mimeType,
        "pdfUrl": pdf.asset->url,
        "pdfFilename": pdf.asset->originalFilename
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
      <SiteHeader title="Dean Hjerpyn" email="hello@deanhjerpyn.com" />

      <FieldJournalStack entries={entries} />
    </main>
  );
}
