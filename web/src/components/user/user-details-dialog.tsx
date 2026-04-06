"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";

import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Character, User } from "@/lib/types";
import { CharacterMedia } from "../character-media";
import { Badge } from "@/components/ui/badge";
import { deleteUser } from "@/app/admin/actions";
import { Trash2Icon } from "lucide-react";

export interface UserDetailsDialogProps {
  user: User & {
    CharacterHusbando?: Character | null;
    CharacterWaifu?: Character | null;
    _count?: {
      WaifuCollection: number;
      HusbandoCollection: number;
    };
  };
}

export function UserDetailsDialog({ user }: UserDetailsDialogProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState(false);

  const handleDelete = async () => {
    if (confirm("Tem certeza que deseja apagar este usuário?")) {
      setIsDeleting(true);
      await deleteUser(user.id);
      setIsDeleting(false);
      setIsOpen(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          Abrir
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center justify-between">
            <span>Perfil: {user.telegramData?.first_name || "Desconhecido"}</span>
            <Badge variant="outline" className="text-sm">
              {user.profileType}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-4">
          <div className="space-y-4">
            <div className="bg-card p-4 rounded-xl border border-primary/20 space-y-2">
              <h3 className="font-semibold text-lg border-b border-primary/10 pb-2 mb-2">Estatísticas</h3>
              <p><strong>ID do Banco:</strong> {user.id}</p>
              <p><strong>ID do Telegram:</strong> {user.telegramId.toString()}</p>
              <p><strong>Moedas:</strong> 💰 {user.coins}</p>
              <p><strong>Idioma:</strong> {user.language}</p>
              <p><strong>Waifus na Coleção:</strong> {user._count?.WaifuCollection || 0}</p>
              <p><strong>Husbandos na Coleção:</strong> {user._count?.HusbandoCollection || 0}</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="bg-card p-4 rounded-xl border border-primary/20 h-full">
              <h3 className="font-semibold text-lg border-b border-primary/10 pb-2 mb-2">Favoritos</h3>
              <div className="flex gap-2 justify-center h-48">
                {user.CharacterHusbando ? (
                   <div className="w-1/2 rounded-md overflow-hidden relative group">
                      <div className="absolute top-2 left-2 z-10">
                        <Badge className="bg-blue-500/80">Husbando</Badge>
                      </div>
                      <CharacterMedia item={user.CharacterHusbando} type={"husbando"} />
                   </div>
                ) : (
                  <div className="flex-1 border-dashed border-2 border-primary/20 rounded-md flex items-center justify-center text-muted-foreground text-sm">Sem Husbando</div>
                )}

                {user.CharacterWaifu ? (
                   <div className="w-1/2 rounded-md overflow-hidden relative group">
                      <div className="absolute top-2 left-2 z-10">
                        <Badge className="bg-pink-500/80">Waifu</Badge>
                      </div>
                      <CharacterMedia item={user.CharacterWaifu} type={"waifu"} />
                   </div>
                ) : (
                  <div className="flex-1 border-dashed border-2 border-primary/20 rounded-md flex items-center justify-center text-muted-foreground text-sm">Sem Waifu</div>
                )}
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="mt-6 flex justify-between sm:justify-between items-center">
          <Button variant="destructive" size="sm" onClick={handleDelete} disabled={isDeleting}>
            <Trash2Icon className="w-4 h-4 mr-2" />
            {isDeleting ? "Apagando..." : "Apagar Usuário"}
          </Button>
          <Button variant="secondary" onClick={() => setIsOpen(false)}>
            Fechar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
