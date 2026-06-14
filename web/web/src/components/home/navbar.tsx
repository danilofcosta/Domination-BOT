import Link from "next/link";
import { Button } from "../ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

 function NavBarHome() {
  return (
    <nav className="w-full border rounded-full flex items-center justify-between px-4 py-2 ">
      {/* Lado esquerdo */}
      <div className="font-semibold text-lg">
        Home
      </div>

      {/* Lado direito */}
      <div className="flex items-center gap-3">
        <Link href="/admin">
          <Button variant="secondary" >Admin</Button>
        </Link>
        <UserAvatar />
      </div>
    </nav>
  );
}

function UserAvatar() {
  return (
    <Avatar className="cursor-pointer">
      <AvatarImage
        src="https://github.com/shadcn.png"
        alt="User avatar"
        className="grayscale"
      />
      <AvatarFallback>U</AvatarFallback>
    </Avatar>
  );
}