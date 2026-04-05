"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";

import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Character, User } from "@/lib/types";
import { CharacterMedia } from "../character-media";

export interface UserDetailsDialogProps {
  user: User & {
    CharacterHusbando?: Character | null;
    CharacterWaifu?: Character | null;
  };
}

export function UserDetailsDialog({ user }: UserDetailsDialogProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          Abrir
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {" "}
            User : {user.telegramData?.first_name || "Desconhecido"}
          </DialogTitle>
        </DialogHeader>

        

        <div className="bg-blue-500/20 flex gap-2 h-screen w-screen  max-h-30 max-w-50 ">
          <CharacterMedia item={user.CharacterHusbando} type={"husbando"} />
          <CharacterMedia item={user.CharacterWaifu} type={"waifu"} />
        </div>
        <p>{JSON.stringify(user.CharacterHusbando, null, 4)}</p>
      </DialogContent>
    </Dialog>
  );
}
