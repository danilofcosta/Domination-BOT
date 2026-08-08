export function CardImage() {
  return (
    <div className="relative overflow-hidden">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="https://i.pinimg.com/736x/10/0c/49/100c49274a481b136bbd3aa8ea0f2989.jpg"
        alt=""
        className="relative z-20 aspect-video w-full object-cover brightness-60 grayscale dark:brightness-40"
      />
    </div>
  );
}
