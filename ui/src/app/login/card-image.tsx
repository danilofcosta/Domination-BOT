export function CardImage() {
  return (
    <div className="relative overflow-hidden">
      {/* eslint-disable-next-line @next/next/no-img-element */}
 <video
 src="./login/video.mp4"
 autoPlay
 loop
 muted
 poster="poster.jpg"
 playsInline
        className="relative z-20 aspect-video w-full object-cover brightness-50 grayscale dark:brightness-35"

 ></video>
      <div className="absolute inset-0 z-30 bg-linear-to-t from-card via-card/40 to-transparent" />
    </div>
  );
}
