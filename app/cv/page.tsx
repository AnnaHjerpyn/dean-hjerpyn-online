import Link from "next/link";
import { client } from "@/sanity/lib/client";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type CvImage = {
  url: string;
  alt?: string;
};

type SiteSettings = {
  cvFileUrl?: string;
  cvFileName?: string;
  cvImages?: CvImage[];
};

async function getSiteSettings(): Promise<SiteSettings | null> {
  return client.fetch(
    `
      *[_type == "siteSettings"][0] {
        "cvFileUrl": cvFile.asset->url,
        "cvFileName": cvFile.asset->originalFilename,
        "cvImages": cvImages[] {
          "url": asset->url,
          alt
        }
      }
    `,
    {},
    { cache: "no-store" }
  );
}

export default async function CVPage() {
  const settings = await getSiteSettings();
  const cvFileUrl = settings?.cvFileUrl;
  const cvImages = settings?.cvImages || [];

  return (
    <main className="min-h-screen bg-white px-4 pb-8 pt-28 text-[#1f1a13] md:px-8 md:pb-12 md:pt-36">
      <header>
        <Link
          href="/"
          aria-label="Dean Hjerpyn homepage"
          className="fixed left-4 top-4 z-50 block text-[#1f1a13] md:left-8 md:top-8"
        >
          <span className="block font-editorial text-[34px] font-normal uppercase leading-[0.86] tracking-[-0.05em] md:text-[3.2vw]">
            Dean
          </span>

          <span className="block font-editorial text-[34px] font-normal uppercase leading-[0.86] tracking-[-0.05em] md:text-[3.2vw]">
            Hjerpyn
          </span>
        </Link>

        <nav className="fixed right-4 top-4 z-50 flex max-w-[62vw] flex-wrap justify-end gap-x-4 gap-y-2 font-editorial text-[8px] font-normal uppercase tracking-[0.15em] text-[#1f1a13] md:right-8 md:top-8 md:max-w-none md:gap-x-7 md:text-[10px]">
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

      <section className="grid gap-8 md:grid-cols-12">
        <p className="font-editorial text-[9px] font-normal uppercase tracking-[0.16em] md:col-span-3">
          CV
        </p>

        <div className="md:col-span-7 md:col-start-4">
          {cvImages.length > 0 ? (
            <>
              <div className="space-y-8">
                {cvImages.map((image, index) => (
                  <img
                    key={image.url}
                    src={image.url}
                    alt={image.alt || `Dean Hjerpyn CV page ${index + 1}`}
                    className="block w-full bg-white"
                  />
                ))}
              </div>

              {cvFileUrl && (
                <div className="mt-6 flex gap-5 font-editorial text-[9px] font-normal uppercase tracking-[0.16em]">
                  <a
                    href={cvFileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="transition-opacity hover:opacity-50"
                  >
                    Open
                  </a>

                  <a
                    href={cvFileUrl}
                    download={settings?.cvFileName || "dean-hjerpyn-cv.pdf"}
                    className="transition-opacity hover:opacity-50"
                  >
                    Download
                  </a>
                </div>
              )}
            </>
          ) : (
            <p className="font-editorial text-[9px] font-normal uppercase tracking-[0.16em] opacity-60">
              CV coming soon.
            </p>
          )}
        </div>
      </section>
    </main>
  );
}
