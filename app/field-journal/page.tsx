import Link from "next/link";
import { client } from "@/sanity/lib/client";

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
    <main className="min-h-screen bg-white px-4 pb-5 pt-28 text-[#1f1a13] md:px-8 md:pb-8 md:pt-36">
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

          <Link href="/#about" className="transition-opacity hover:opacity-50">
            About
          </Link>

          <Link
            href="/#contact"
            className="transition-opacity hover:opacity-50"
          >
            Contact
          </Link>
        </nav>
      </header>

      <section className="mb-16 grid gap-8 md:grid-cols-12"></section>

      {entries.length > 0 ? (
        <section className="columns-1 gap-4 sm:columns-2 md:columns-3 xl:columns-4">
          {entries.map((entry) => (
            <article key={entry._id} className="mb-4 break-inside-avoid">
              {entry.imageUrl && (
                <img
                  src={entry.imageUrl}
                  alt={entry.alt || entry.caption || "Field journal image"}
                  loading="lazy"
                  className="block w-full"
                />
              )}

              {entry.caption && (
                <p className="mt-2 max-w-sm font-sabon text-[13px] leading-5 text-[#1f1a13]/65">
                  {entry.caption}
                </p>
              )}
            </article>
          ))}
        </section>
      ) : (
        <section className="grid gap-8 md:grid-cols-12">
          <div className="md:col-start-4 md:col-span-6">
            <p className="font-sabon text-[15px] leading-6 text-[#1f1a13]/70 md:text-base"></p>
          </div>
        </section>
      )}
    </main>
  );
}
