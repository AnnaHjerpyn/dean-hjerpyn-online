/* eslint-disable @next/next/no-img-element */

type Img = { _key: string; url: string; alt?: string };

type ScrollColumnProps = {
  label: string;
  images: Img[];
};

export default function ScrollColumn({ label, images }: ScrollColumnProps) {
  return (
    <section className="relative md:h-[100svh] md:overflow-y-auto no-scrollbar">
      {/* Label pinned to the top of the column. h-0 keeps it from
          pushing the first image down; the blend keeps it legible
          over light and dark images. */}
      <h2 className="sticky top-0 z-10 h-0 overflow-visible px-4 pt-2 font-editorial text-lg text-white mix-blend-difference">
        {label}
      </h2>

      {images.map((img) => (
        <img
          key={img._key}
          src={img.url}
          alt={img.alt ?? ""}
          loading="lazy"
          className="block w-full"
        />
      ))}
    </section>
  );
}
