import { BookSearch, Grid2x2, House, UserStar } from "lucide-react";
import Link from "next/link";

export function MenuFloating() {
  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 w-full px-4 shadow-2xl">
      <div
        className="
        w-full max-w-md mx-auto

        bg-background/10 backdrop-blur-xl   rounded-full shadow-lg
        h-16 flex items-center justify-around px-2
      "
      >
        <MenuItem icon={<House className="size-5" />} label="Home" />

        <MenuItem
          icon={
            <div className="bg-primary/20 p-3 rounded-lg">
              <Grid2x2 className="size-5" />
            </div>
          }
          active
        />

        <MenuItem
          icon={<BookSearch className="size-5" />}
          label="admin"
          href="/admin"
        />
      </div>
    </div>
  );
}
function MenuItem({
  icon,
  label,
  active,
  href = "/",
}: {
  icon: React.ReactNode;
  label?: string;
  active?: boolean;
  href?: string;
}) {
  return (
    <Link href={href} className="flex justify-center items-center group">
      <div
        className={`
          flex flex-col items-center justify-center 
          p-2 cursor-pointer transition-all duration-200

          hover:bg-primary/10 rounded-full
          ${active ? "text-primary scale-110" : "opacity-70 hover:opacity-100"}
        `}
      >
        {icon}

        {label && (
          <span
            className="
              text-xs mt-1
              opacity-0 max-h-0
              group-hover:opacity-100 group-hover:max-h-10
              transition-all duration-200
            "
          >
            {label}
          </span>
        )}
      </div>
    </Link>
  );
}
