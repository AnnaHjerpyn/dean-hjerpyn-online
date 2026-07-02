import Link from "next/link";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function CVPage() {
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

      <section className="grid gap-8 md:grid-cols-12">
        <p className="font-editorial text-[9px] font-normal uppercase tracking-[0.16em] md:col-span-3">
          CV
        </p>
      </section>
    </main>
  );
}
