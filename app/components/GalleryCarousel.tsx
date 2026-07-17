"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";

type GalleryImage = {
  _type: "image";
  _key: string;
  url: string;
  alt?: string;
  caption?: string;
  width?: number;
  height?: number;
  lqip?: string;
};

type GalleryVideo = {
  _type: "video";
  _key: string;
  url: string;
  caption?: string;
};

type GalleryPdf = {
  _type: "pdf";
  _key: string;
  url: string;
  title?: string;
  filename?: string;
};

type GalleryItem = GalleryImage | GalleryVideo | GalleryPdf;

type GalleryCarouselProps = {
  items: GalleryItem[];
  projectTitle: string;
};

const AUTOPLAY_DELAY = 6000;

/* -------------------------------------------------------------------------- */
/* Icons                                                                      */
/* -------------------------------------------------------------------------- */

function PreviousIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true" fill="none">
      <path
        d="M15 5L8 12L15 19"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function NextIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true" fill="none">
      <path
        d="M9 5L16 12L9 19"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true" fill="none">
      <path
        d="M6 6L18 18M18 6L6 18"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  );
}

function DownloadIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true" fill="none">
      <path
        d="M12 3V15M7.5 10.5L12 15L16.5 10.5"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      <path
        d="M5 16V20H19V16"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/* -------------------------------------------------------------------------- */
/* Video                                                                      */
/* -------------------------------------------------------------------------- */

type CarouselVideoProps = {
  item: GalleryVideo;
  isActive: boolean;
  onPlaybackChange: (paused: boolean) => void;
};

function CarouselVideo({
  item,
  isActive,
  onPlaybackChange,
}: CarouselVideoProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    const video = videoRef.current;

    if (!video) {
      return;
    }

    if (!isActive) {
      video.pause();
      video.currentTime = 0;
      setIsPaused(false);
      return;
    }

    video.currentTime = 0;

    const playPromise = video.play();

    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          setIsPaused(false);
          onPlaybackChange(false);
        })
        .catch(() => {
          setIsPaused(true);
          onPlaybackChange(true);
        });
    }
  }, [isActive, onPlaybackChange]);

  const togglePlayback = useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      event.stopPropagation();

      const video = videoRef.current;

      if (!video) {
        return;
      }

      if (video.paused) {
        video
          .play()
          .then(() => {
            setIsPaused(false);
            onPlaybackChange(false);
          })
          .catch(() => {
            setIsPaused(true);
            onPlaybackChange(true);
          });
      } else {
        video.pause();
        setIsPaused(true);
        onPlaybackChange(true);
      }
    },
    [onPlaybackChange]
  );

  return (
    <figure className="flex h-full w-full flex-col">
      <button
        type="button"
        onClick={togglePlayback}
        aria-label={isPaused ? "Play video" : "Pause video"}
        className="group relative flex min-h-0 flex-1 cursor-pointer items-center justify-center overflow-hidden bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-black"
      >
        <video
          ref={videoRef}
          src={item.url}
          muted
          playsInline
          loop
          preload="auto"
          controls={false}
          disablePictureInPicture
          className="h-full w-full object-contain object-center"
          onPlay={() => {
            setIsPaused(false);
            onPlaybackChange(false);
          }}
          onPause={() => {
            if (isActive) {
              setIsPaused(true);
            }
          }}
        />

        <span
          aria-hidden="true"
          className={`pointer-events-none absolute inset-0 flex items-center justify-center transition-opacity duration-200 ${
            isPaused ? "opacity-100" : "opacity-0"
          }`}
        >
          <span className="flex h-14 w-14 items-center justify-center rounded-full border border-white/60 bg-black/20 text-white backdrop-blur-sm">
            <span className="ml-1 block h-0 w-0 border-y-[8px] border-l-[13px] border-y-transparent border-l-white" />
          </span>
        </span>
      </button>

      {item.caption && (
        <figcaption className="pt-2 font-mabrypro text-[10px] leading-[1.25] text-black md:text-[11px]">
          {item.caption}
        </figcaption>
      )}
    </figure>
  );
}

/* -------------------------------------------------------------------------- */
/* Carousel                                                                   */
/* -------------------------------------------------------------------------- */

export default function GalleryCarousel({
  items,
  projectTitle,
}: GalleryCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [showControls, setShowControls] = useState(false);
  const [isVideoPaused, setIsVideoPaused] = useState(false);

  const touchStartX = useRef<number | null>(null);

  const itemCount = items.length;
  const activeItem = items[activeIndex];

  const imageIndexes = items.reduce<number[]>((indexes, item, index) => {
    if (item._type === "image") {
      indexes.push(index);
    }

    return indexes;
  }, []);

  const goToPrevious = useCallback(() => {
    setActiveIndex((current) => (current === 0 ? itemCount - 1 : current - 1));

    setIsVideoPaused(false);
  }, [itemCount]);

  const goToNext = useCallback(() => {
    setActiveIndex((current) => (current === itemCount - 1 ? 0 : current + 1));

    setIsVideoPaused(false);
  }, [itemCount]);

  const goToSlide = useCallback((index: number) => {
    setActiveIndex(index);
    setIsVideoPaused(false);
  }, []);

  const closeLightbox = useCallback(() => {
    setLightboxIndex(null);
    setShowControls(false);
  }, []);

  const goToPreviousLightboxImage = useCallback(() => {
    setLightboxIndex((current) => {
      if (current === null || imageIndexes.length === 0) {
        return null;
      }

      const position = imageIndexes.indexOf(current);

      const previousPosition =
        position <= 0 ? imageIndexes.length - 1 : position - 1;

      return imageIndexes[previousPosition];
    });
  }, [imageIndexes]);

  const goToNextLightboxImage = useCallback(() => {
    setLightboxIndex((current) => {
      if (current === null || imageIndexes.length === 0) {
        return null;
      }

      const position = imageIndexes.indexOf(current);

      const nextPosition =
        position === imageIndexes.length - 1 ? 0 : position + 1;

      return imageIndexes[nextPosition];
    });
  }, [imageIndexes]);

  /* ------------------------------------------------------------------------ */
  /* Autoplay                                                                 */
  /* ------------------------------------------------------------------------ */

  useEffect(() => {
    if (itemCount <= 1 || lightboxIndex !== null || isVideoPaused) {
      return;
    }

    const timer = window.setTimeout(() => {
      goToNext();
    }, AUTOPLAY_DELAY);

    return () => {
      window.clearTimeout(timer);
    };
  }, [activeIndex, itemCount, lightboxIndex, isVideoPaused, goToNext]);

  /* ------------------------------------------------------------------------ */
  /* Keyboard controls                                                        */
  /* ------------------------------------------------------------------------ */

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (lightboxIndex !== null) {
        if (event.key === "Escape") {
          closeLightbox();
        }

        if (event.key === "ArrowLeft") {
          goToPreviousLightboxImage();
        }

        if (event.key === "ArrowRight") {
          goToNextLightboxImage();
        }

        return;
      }

      if (event.key === "ArrowLeft") {
        setShowControls(true);
        goToPrevious();
      }

      if (event.key === "ArrowRight") {
        setShowControls(true);
        goToNext();
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [
    lightboxIndex,
    goToPrevious,
    goToNext,
    goToPreviousLightboxImage,
    goToNextLightboxImage,
    closeLightbox,
  ]);

  /* ------------------------------------------------------------------------ */
  /* Lock page while lightbox is open                                         */
  /* ------------------------------------------------------------------------ */

  useEffect(() => {
    if (lightboxIndex === null) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [lightboxIndex]);

  /* ------------------------------------------------------------------------ */
  /* Touch swipe                                                              */
  /* ------------------------------------------------------------------------ */

  function handleTouchStart(event: React.TouchEvent<HTMLDivElement>) {
    touchStartX.current = event.touches[0].clientX;
    setShowControls(true);
  }

  function handleTouchEnd(event: React.TouchEvent<HTMLDivElement>) {
    if (touchStartX.current === null) {
      return;
    }

    const difference = touchStartX.current - event.changedTouches[0].clientX;

    if (Math.abs(difference) > 50) {
      if (difference > 0) {
        goToNext();
      } else {
        goToPrevious();
      }
    }

    touchStartX.current = null;
  }

  if (itemCount === 0 || !activeItem) {
    return null;
  }

  const lightboxItem = lightboxIndex !== null ? items[lightboxIndex] : null;

  const lightboxPosition =
    lightboxIndex !== null ? imageIndexes.indexOf(lightboxIndex) : -1;

  return (
    <>
      <div
        className="relative w-full"
        onClick={() => setShowControls(true)}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* Main media */}
        <div className="relative h-[55vh] min-h-[360px] max-h-[850px] w-full overflow-hidden bg-white md:h-[75vh] md:min-h-[540px]">
          {items.map((item, index) => {
            const isActive = index === activeIndex;

            return (
              <div
                key={item._key}
                aria-hidden={!isActive}
                className={`absolute inset-0 transition-opacity duration-500 ease-out ${
                  isActive
                    ? "z-10 opacity-100"
                    : "pointer-events-none z-0 opacity-0"
                }`}
              >
                {/* Image */}
                {item._type === "image" && (
                  <figure className="flex h-full w-full flex-col">
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        setLightboxIndex(index);
                      }}
                      aria-label={`Enlarge ${
                        item.alt || `${projectTitle} project image ${index + 1}`
                      }`}
                      className="relative min-h-0 flex-1 cursor-zoom-in focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-black"
                    >
                      <Image
                        src={item.url}
                        alt={
                          item.alt ||
                          `${projectTitle} project image ${index + 1}`
                        }
                        fill
                        sizes="100vw"
                        priority={index === 0}
                        placeholder={item.lqip ? "blur" : "empty"}
                        blurDataURL={item.lqip}
                        className="object-contain object-center"
                      />
                    </button>

                    {item.caption && (
                      <figcaption className="pt-2 font-mabrypro text-[10px] leading-[1.25] text-black md:text-[11px]">
                        {item.caption}
                      </figcaption>
                    )}
                  </figure>
                )}

                {/* Video */}
                {item._type === "video" && (
                  <CarouselVideo
                    item={item}
                    isActive={isActive}
                    onPlaybackChange={setIsVideoPaused}
                  />
                )}

                {/* PDF */}
                {item._type === "pdf" && (
                  <div className="flex h-full w-full items-center justify-center bg-[#f3f3f1] px-6">
                    <div className="flex max-w-md flex-col items-center text-center">
                      <p className="font-mabrypro text-[18px] leading-tight tracking-[-0.025em] md:text-[24px]">
                        {item.title || item.filename || "Project document"}
                      </p>

                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(event) => event.stopPropagation()}
                        aria-label={`Open ${
                          item.title || item.filename || "project document"
                        }`}
                        className="mt-6 flex h-11 w-11 items-center justify-center rounded-full border border-black/20 transition-colors hover:bg-black hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4"
                      >
                        <DownloadIcon />
                      </a>
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {/* Controls */}
          {itemCount > 1 && (
            <div
              className={`transition-opacity duration-300 ${
                showControls
                  ? "pointer-events-auto opacity-100"
                  : "pointer-events-none opacity-0"
              }`}
            >
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  goToPrevious();
                }}
                aria-label="Previous gallery item"
                className="absolute left-3 top-1/2 z-20 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-black/15 bg-white/85 text-black backdrop-blur-sm transition-colors hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 md:left-5"
              >
                <PreviousIcon />
              </button>

              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  goToNext();
                }}
                aria-label="Next gallery item"
                className="absolute right-3 top-1/2 z-20 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-black/15 bg-white/85 text-black backdrop-blur-sm transition-colors hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 md:right-5"
              >
                <NextIcon />
              </button>
            </div>
          )}
        </div>

        {/* Minimal count and indicators */}
        {itemCount > 1 && (
          <div
            className={`mt-3 flex items-center justify-between font-mabrypro text-[9px] uppercase tracking-[0.06em] transition-opacity duration-300 md:text-[10px] ${
              showControls
                ? "pointer-events-auto opacity-100"
                : "pointer-events-none opacity-0"
            }`}
          >
            <span>
              {String(activeIndex + 1).padStart(2, "0")} /{" "}
              {String(itemCount).padStart(2, "0")}
            </span>

            <div
              className="flex items-center gap-2"
              aria-label="Choose gallery item"
            >
              {items.map((item, index) => (
                <button
                  key={item._key}
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    goToSlide(index);
                  }}
                  aria-label={`Go to gallery item ${index + 1}`}
                  aria-current={index === activeIndex ? "true" : undefined}
                  className={`h-1 rounded-full transition-all duration-300 ${
                    index === activeIndex
                      ? "w-6 bg-black"
                      : "w-1 bg-black/25 hover:bg-black/50"
                  }`}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Image lightbox                                                     */}
      {/* ------------------------------------------------------------------ */}

      {lightboxItem && lightboxItem._type === "image" && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Enlarged project image"
          className="fixed inset-0 z-[100] bg-[#f5f5f2]/98 text-black"
        >
          <button
            type="button"
            onClick={closeLightbox}
            aria-label="Close enlarged image"
            className="absolute right-4 top-4 z-30 flex h-10 w-10 items-center justify-center rounded-full border border-black/15 bg-white/85 backdrop-blur-sm transition-colors hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 md:right-6 md:top-6"
          >
            <CloseIcon />
          </button>

          <div className="relative flex h-full w-full items-center justify-center px-14 py-16 md:px-24 md:py-20">
            <div className="relative h-full w-full">
              <Image
                src={lightboxItem.url}
                alt={
                  lightboxItem.alt || `${projectTitle} enlarged project image`
                }
                fill
                sizes="100vw"
                priority
                placeholder={lightboxItem.lqip ? "blur" : "empty"}
                blurDataURL={lightboxItem.lqip}
                className="object-contain object-center"
              />
            </div>
          </div>

          {imageIndexes.length > 1 && (
            <>
              <button
                type="button"
                onClick={goToPreviousLightboxImage}
                aria-label="Previous enlarged image"
                className="absolute left-3 top-1/2 z-30 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-black/15 bg-white/85 backdrop-blur-sm transition-colors hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 md:left-6"
              >
                <PreviousIcon />
              </button>

              <button
                type="button"
                onClick={goToNextLightboxImage}
                aria-label="Next enlarged image"
                className="absolute right-3 top-1/2 z-30 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-black/15 bg-white/85 backdrop-blur-sm transition-colors hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 md:right-6"
              >
                <NextIcon />
              </button>
            </>
          )}

          <div className="absolute bottom-5 left-1/2 z-30 -translate-x-1/2 font-mabrypro text-[9px] uppercase tracking-[0.08em] md:bottom-6 md:text-[10px]">
            {String(lightboxPosition + 1).padStart(2, "0")} /{" "}
            {String(imageIndexes.length).padStart(2, "0")}
          </div>
        </div>
      )}
    </>
  );
}
