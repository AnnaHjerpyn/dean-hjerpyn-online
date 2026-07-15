import type { ImageLoaderProps } from "next/image";

export default function sanityImageLoader({
  src,
  width,
  quality,
}: ImageLoaderProps): string {
  if (src.startsWith("/")) {
    return src;
  }

  const url = new URL(src);

  url.searchParams.set("w", width.toString());
  url.searchParams.set("q", String(quality ?? 80));
  url.searchParams.set("fit", "max");
  url.searchParams.set("auto", "format");

  return url.toString();
}
