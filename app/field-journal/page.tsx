import Link from "next/link";
import { client } from "@/sanity/lib/client";
import FieldJournalStack, { type FieldJournalEntry } from "./FieldJournalStack";

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
      <header className="fixed inset-x-0 top-0 z-[100] pointer-events-none">
        <Link
          href="/"
          aria-label="Dean Hjerpyn homepage"
          className="pointer-events-auto fixed left-4 top-4 z-50 block text-black mix-blend-exclusion md:left-10 md:top-8"
        >
          <span className="block font-mabrypro text-[34px] font-normal uppercase leading-[0.86] tracking-[-0.05em] md:text-[3.1vw]">
            Dean
          </span>

          <span className="block font-mabrypro text-[34px] font-normal uppercase leading-[0.86] tracking-[-0.05em] md:text-[3.1vw]">
            Hjerpyn
          </span>
        </Link>

        <nav
          aria-label="Primary navigation"
          className="pointer-events-auto fixed right-4 top-4 z-50 flex max-w-[65vw] flex-wrap justify-end gap-x-4 gap-y-2 font-mabrypro text-[8px] font-normal uppercase tracking-[0.1em] text-black mix-blend-difference md:right-10 md:top-8 md:max-w-none md:gap-x-8 md:text-[11px]"
        >
          <Link
            href="/work"
            className="transition-opacity duration-200 hover:opacity-40"
          >
            Work
          </Link>

          <Link
            href="/field-journal"
            aria-current="page"
            className="transition-opacity duration-200 hover:opacity-40"
          >
            Field Journal
          </Link>

          <Link
            href="/cv"
            className="transition-opacity duration-200 hover:opacity-40"
          >
            CV
          </Link>

          <Link
            href="/#contact"
            className="transition-opacity duration-200 hover:opacity-40"
          >
            Contact
          </Link>
        </nav>
      </header>

      <FieldJournalStack entries={entries} />
    </main>
  );
}
