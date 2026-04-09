"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Character, User } from "@/lib/types";
import { CharacterMedia } from "../character-media";
import { Badge } from "@/components/ui/badge";
import { deleteUser, updateUserProfileType } from "@/app/admin/actions";
import { Trash2Icon, ShieldX, MoreVertical, UserCog, AlertTriangle, CheckIcon, Loader2 } from "lucide-react";
import { SessionPayload } from "@/lib/auth";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ProfileType } from "../../../generated/prisma/client";

const PROFILE_TYPES = ["USER", "MOD", "ADMIN", "OWNER"] as const;

export interface UserDetailsDialogProps {
  user: User & {
    CharacterHusbando?: Character | null;
    CharacterWaifu?: Character | null;
    _count?: {
      WaifuCollection: number;
      HusbandoCollection: number;
    };
  };
  currentUser?: SessionPayload | null;
}

export function UserDetailsDialog({ user, currentUser }: UserDetailsDialogProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [deleteError, setDeleteError] = React.useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = React.useState(false);
  const [typeUpdating, setTypeUpdating] = React.useState<string | null>(null);

  const isOwner = currentUser?.profileType === ProfileType.SUPREME;
  const canDelete = isOwner && user.profileType !==  ProfileType.SUPREME;
  const canEditType = isOwner && user.profileType !==  ProfileType.SUPREME

  const handleDelete = async () => {
    setDeleteError("");
    setIsDeleting(true);
    const result = await deleteUser(user.id, currentUser?.profileType, user.profileType);
    
    if (!result.success) {
      setDeleteError(result.error || "Erro ao excluir usuário");
      setIsDeleting(false);
      return;
    }
    
    setIsDeleting(false);
    setShowDeleteConfirm(false);
    setIsOpen(false);
    window.location.reload();
  };

  const handleUpdateType = async (newType: string) => {
    setTypeUpdating(newType);
    const result = await updateUserProfileType(user.id, newType, currentUser?.profileType);
    setTypeUpdating(null);
    
    if (result.success) {
      toast.success(`Perfil alterado para ${newType}`, {
        description: `${user.telegramData?.first_name || "Usuário"} agora é ${newType}`,
      });
      window.location.reload();
    } else {
      toast.error("Erro ao alterar perfil", {
        description: result.error || "Não foi possível alterar o tipo de perfil",
      });
    }
  };

  const getProfileBadgeVariant = (type: string) => {
    switch (type) {
      case "OWNER": return "default";
      case "ADMIN": return "secondary";
      case "MOD": return "outline";
      default: return "outline";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <Button 
        variant="ghost" 
        size="sm" 
        className="h-8 w-8 p-0 hover:bg-primary/10"
        onClick={() => setIsOpen(true)}
      >
        <MoreVertical className="h-4 w-4" />
      </Button>

      <DialogContent className="max-w-lg sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-4 border-b">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl sm:text-2xl font-bold">
              {user.telegramData?.first_name || "Usuário"}
            </DialogTitle>
            <div className="flex items-center gap-2">
              <Badge variant={getProfileBadgeVariant(user.profileType)} className="text-xs sm:text-sm">
                {user.profileType}
              </Badge>
              {canEditType && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8" disabled={!!typeUpdating}>
                      {typeUpdating ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <UserCog className="h-4 w-4" />
                      )}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DialogDescription className="px-2 py-1.5 text-xs text-muted-foreground">
                      Alterar tipo de perfil
                    </DialogDescription>
                    <DropdownMenuSeparator />
                    {PROFILE_TYPES.filter(t => t !== "OWNER").map((type) => {
                      const isLoading = typeUpdating === type;
                      const isCurrent = user.profileType === type;
                      return (
                        <DropdownMenuItem
                          key={type}
                          onClick={() => handleUpdateType(type)}
                          disabled={isLoading || isCurrent}
                          className="flex items-center justify-between cursor-pointer"
                        >
                          <span className={isCurrent ? "text-muted-foreground" : ""}>{type}</span>
                          {isLoading ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : isCurrent ? (
                            <CheckIcon className="h-4 w-4 text-green-500" />
                          ) : null}
                        </DropdownMenuItem>
                      );
                    })}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>
          {user.telegramData?.username && (
            <p className="text-sm text-muted-foreground">@{user.telegramData.username}</p>
          )}
        </DialogHeader>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-4">
          <div className="bg-muted/30 p-4 rounded-xl space-y-3">
            <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Informações</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">ID Banco</span>
                <span className="font-mono font-medium">{user.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Telegram ID</span>
                <span className="font-mono font-medium text-xs">{user.telegramId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Moedas</span>
                <span className="font-medium">💰 {user.coins.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Idioma</span>
                <span className="font-medium">{user.language}</span>
              </div>
            </div>
          </div>
          
          <div className="bg-muted/30 p-4 rounded-xl space-y-3">
            <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Coleção</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Waifus</span>
                <span className="font-medium">{user._count?.WaifuCollection || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Husbandos</span>
                <span className="font-medium">{user._count?.HusbandoCollection || 0}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Favoritos</h4>
          <div className="flex gap-3 justify-center min-h-[140px]">
            {user.CharacterHusbando ? (
              <div className="w-1/2 max-w-[140px] rounded-lg overflow-hidden relative">
                <Badge className="absolute top-2 left-2 z-10 bg-blue-500/90">Husbando</Badge>
                <CharacterMedia item={user.CharacterHusbando} type={"husbando"} />
              </div>
            ) : (
              <div className="w-1/2 max-w-[140px] border-2 border-dashed border-primary/20 rounded-lg flex items-center justify-center text-muted-foreground text-xs">
                Sem Husbando
              </div>
            )}

            {user.CharacterWaifu ? (
              <div className="w-1/2 max-w-[140px] rounded-lg overflow-hidden relative">
                <Badge className="absolute top-2 left-2 z-10 bg-pink-500/90">Waifu</Badge>
                <CharacterMedia item={user.CharacterWaifu} type={"waifu"} />
              </div>
            ) : (
              <div className="w-1/2 max-w-[140px] border-2 border-dashed border-primary/20 rounded-lg flex items-center justify-center text-muted-foreground text-xs">
                Sem Waifu
              </div>
            )}
          </div>
        </div>

        {deleteError && (
          <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            {deleteError}
          </div>
        )}

        <DialogFooter className="flex-col sm:flex-row gap-2 pt-4 border-t">
          {!canDelete ? (
            <div className="flex items-center gap-2 text-xs text-muted-foreground w-full sm:w-auto">
              <ShieldX className="w-4 h-4 shrink-0" />
              <span>
                {!currentUser ? "Faça login para gerenciar" : 
                 user.profileType === ProfileType.SUPREME  ? "Proprietário do sistema" :
                 "Apenas o Dono pode gerenciar"}
              </span>
            </div>
          ) : (
            <>
              {showDeleteConfirm ? (
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowDeleteConfirm(false)}
                    disabled={isDeleting}
                    className="flex-1 sm:flex-none"
                  >
                    Cancelar
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="flex-1 sm:flex-none"
                  >
                    {isDeleting ? "Apagando..." : "Confirmar"}
                  </Button>
                </div>
              ) : (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => setShowDeleteConfirm(true)}
                  className="w-full sm:w-auto"
                >
                  <Trash2Icon className="w-4 h-4 mr-2" />
                  Excluir Usuário
                </Button>
              )}
            </>
          )}
          <Button variant="secondary" onClick={() => setIsOpen(false)} className="w-full sm:w-auto">
            Fechar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
