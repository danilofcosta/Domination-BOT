import { Suspense } from "react";

export function CardImage() {
  return (
    <Suspense
      fallback={
        <div className="aspect-video w-full animate-pulse bg-muted" />
      }
    >
      <Video />
    </Suspense>
    //  <div className="aspect-video w-full animate-glow bg-muted" />
  );
}

function Video() {
  return (
    <div className="relative overflow-hidden">
      <video
        src="/login/video.mp4"
        autoPlay
        loop
        muted
        poster="/login/video-poster.jpg"
        playsInline
        className="relative z-20 aspect-video w-full object-cover brightness-50 grayscale dark:brightness-35"
      />

      <div className="absolute inset-0 z-30 bg-linear-to-t from-card via-card/40 to-transparent" />
    </div>
  );
}