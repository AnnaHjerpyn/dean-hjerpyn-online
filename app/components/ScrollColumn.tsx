/* eslint-disable @next/next/no-img-element */

type Img = { _key: string; url: string; alt?: string };

type ScrollColumnProps = {
  label: string;
  images: Img[];
};

export default function ScrollColumn({ label, images }: ScrollColumnProps) {
  return (
    <section className="relative m-0 p-0 md:h-[100svh] md:overflow-y-auto no-scrollbar">
      {/* Column label */}
      <h2 className="sticky top-0 z-10 h-0 overflow-visible px-4 font-editorial text-lg text-white mix-blend-difference">
        {label}
      </h2>

      <div className="m-0 p-0">
        {images.map((img) => (
          <img
            key={img._key}
            src={img.url}
            alt={img.alt ?? ""}
            loading="lazy"
            className="block w-full m-0 p-0"
          />
        ))}
      </div>
    </section>
  );
}
