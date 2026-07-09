import Link from "next/link";
import { client } from "@/sanity/lib/client";
import FieldJournalStack from "./FieldJournalStack";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type FieldJournalEntry = {
  _id: string;
  imageUrl?: string;
  alt?: string;
  caption?: string;
  date?: string;
};

async function getFieldJournalEntries(): Promise<FieldJournalEntry[]> {
  return client.fetch(
    `
      *[
        _type == "fieldJournalEntry" &&
        defined(image.asset)
      ] | order(coalesce(date, _createdAt) desc) {
        _id,
        alt,
        caption,
        date,
        "imageUrl": image.asset->url
      }
    `,
    {},
    { cache: "no-store" }
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
          className="fixed left-4 top-4 z-50 block mix-blend-difference text-white md:left-8 md:top-8"
        >
          <span className="block font-editorial text-[34px] font-normal uppercase leading-[0.86] tracking-[-0.05em] md:text-[3.2vw]">
            Dean
          </span>

          <span className="block font-editorial text-[34px] font-normal uppercase leading-[0.86] tracking-[-0.05em] md:text-[3.2vw]">
            Hjerpyn
          </span>
        </Link>

        <nav className="fixed right-4 top-4 z-50 flex max-w-[62vw] flex-wrap justify-end gap-x-4 gap-y-2 font-editorial text-[8px] font-normal uppercase tracking-[0.15em] mix-blend-difference text-white md:right-8 md:top-8 md:max-w-none md:gap-x-7 md:text-[10px]">
          <Link href="/work" className="transition-opacity hover:opacity-50">
            Work
          </Link>

          <Link href="/cv" className="transition-opacity hover:opacity-50">
            CV
          </Link>

          <Link
            href="/field-journal"
            className="transition-opacity hover:opacity-50"
          >
            Field Journal
          </Link>

          <Link
            href="/#contact"
            className="transition-opacity hover:opacity-50"
          >
            Contact
          </Link>
        </nav>
      </header>

      {entries.length > 0 ? (
        <FieldJournalStack entries={entries} />
      ) : (
        <section className="flex min-h-screen items-center justify-center px-4">
          <p className="max-w-sm text-center font-sabon text-[15px] leading-6 text-[#1f1a13]/70">
            No field journal images yet. Add entries in Sanity and they will
            appear here automatically.
          </p>
        </section>
      )}
    </main>
  );
}
