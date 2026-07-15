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
      <header className="fixed inset-x-0 top-0 z-[100]">
        {/* Logo */}
        <Link
          href="/"
          aria-label="Dean Hjerpyn homepage"
          className="fixed left-4 top-4 z-50 block text-black md:left-10 md:top-8"
        >
          <span className="block font-mabrypro text-[34px] font-normal uppercase leading-[0.86] tracking-[-0.05em] md:text-[3.1vw]">
            Dean
          </span>

          <span className="block font-mabrypro text-[34px] font-normal uppercase leading-[0.86] tracking-[-0.05em] md:text-[3.1vw]">
            Hjerpyn
          </span>
        </Link>

        {/* Navigation */}
        <nav className="fixed right-4 top-4 z-50 flex max-w-[65vw] flex-wrap justify-end gap-x-4 gap-y-2 font-mabrypro text-[8px] font-normal uppercase tracking-[0.1em] text-black md:right-10 md:top-8 md:max-w-none md:gap-x-8 md:text-[11px]">
          <Link
            href="/work"
            className="transition-opacity duration-200 hover:opacity-40"
          >
            Work
          </Link>

          <Link
            href="/field-journal"
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
