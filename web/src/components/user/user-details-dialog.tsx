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
import { CharacterMedia } from "../character/character-media";
import { Badge } from "@/components/ui/badge";
import {
  deleteUser,
  updateUserProfileType,
  adjustUserCoins,
  reduceDuplicateCharacter,
  getUserCollectionDetails,
  setUserFavorite,
  removeUserFavorite,
} from "@/app/admin/actions";
import {
  Trash2Icon,
  ShieldX,
  MoreVertical,
  UserCog,
  AlertTriangle,
  CheckIcon,
  Loader2,
  MinusIcon,
  PlusIcon,
  HeartIcon,
  XIcon,
} from "lucide-react";
import { SessionPayload } from "@/lib/auth/auth";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

const PROFILE_TYPE = {
  USER: "USER",
  MODERATOR: "MODERATOR",
  ADMIN: "ADMIN",
  SUPER_ADMIN: "SUPER_ADMIN",
  SUPREME: "SUPREME",
} as const;

export const ProfileType = PROFILE_TYPE;
export type ProfileType = (typeof PROFILE_TYPE)[keyof typeof PROFILE_TYPE];

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

interface CollectionItem {
  id: number;
  characterId: number;
  count: number;
  Character: {
    id: number;
    name: string;
    media: string | null;
    mediaType?: string | null;
  };
}

export function UserDetailsDialog({
  user,
  currentUser,
}: UserDetailsDialogProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [deleteError, setDeleteError] = React.useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = React.useState(false);
  const [typeUpdating, setTypeUpdating] = React.useState<string | null>(null);

  const [collectionDetails, setCollectionDetails] = React.useState<{
    waifus: CollectionItem[];
    husbandos: CollectionItem[];
  } | null>(null);
  const [loadingCollection, setLoadingCollection] = React.useState(false);
  const [adjustingCoins, setAdjustingCoins] = React.useState(false);
  const [reducingId, setReducingId] = React.useState<number | null>(null);

  const [settingFavorite, setSettingFavorite] = React.useState(false);

  const isOwner = currentUser?.profileType === ProfileType.SUPREME;
  const canDelete = isOwner && user.profileType !== ProfileType.SUPREME;
  const canEditType = isOwner && user.profileType !== ProfileType.SUPREME;
  const canAdjustCoins =
    currentUser?.profileType &&
    ["SUPREME", "SUPER_ADMIN", "ADMIN"].includes(currentUser.profileType);

  React.useEffect(() => {
    if (isOpen && user.telegramId) {
      setLoadingCollection(true);
      getUserCollectionDetails(user.telegramId).then((data) => {
        setCollectionDetails(data);
        setLoadingCollection(false);
      });
    }
  }, [isOpen, user.telegramId]);

  const handleDelete = async () => {
    if (
      !confirm(
        `Tem certeza que deseja excluir o usuário ${user.telegramData?.first_name || "este usuário"}? Isso não pode ser desfeito.`,
      )
    )
      return;

    setDeleteError("");
    setIsDeleting(true);
    const result = await deleteUser(
      String(user.telegramId),
      currentUser?.profileType,
      user.profileType,
    );

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
    const result = await updateUserProfileType(
      BigInt(user.telegramId),
      newType,
      currentUser?.profileType,
    );
    setTypeUpdating(null);

    if (result.success) {
      toast.success(`Perfil alterado para ${newType}`, {
        description: `${user.telegramData?.first_name || "Usuário"} agora é ${newType}`,
      });
      window.location.reload();
    } else {
      toast.error("Erro ao alterar perfil", {
        description:
          result.error || "Não foi possível alterar o tipo de perfil",
      });
    }
  };

  const handleAdjustCoins = async (
    operation: "add" | "subtract" | "set",
    amount: number,
  ) => {
    if (
      operation !== "set" &&
      !confirm(
        `Tem certeza que deseja ${operation === "add" ? "adicionar" : "remover"} ${amount} moedas?`,
      )
    )
      return;
    if (
      operation === "set" &&
      !confirm(`Tem certeza que deseja definir as moedas para ${amount}?`)
    )
      return;

    setAdjustingCoins(true);
    const result = await adjustUserCoins(
      user.telegramId,
      amount,
      operation,
      currentUser?.profileType,
    );
    setAdjustingCoins(false);

    if (result.success) {
      toast.success(
        operation === "add"
          ? "Moedas adicionadas"
          : operation === "subtract"
            ? "Moedas removidas"
            : "Moedas definidas",
        {
          description: `Novo saldo: ${result.newCoins?.toLocaleString()}`,
        },
      );
      window.location.reload();
    } else {
      toast.error("Erro ao ajustar moedas", {
        description: result.error,
      });
    }
  };

  const handleReduceDuplicate = async (
    characterId: number,
    type: "waifu" | "husbando",
    reduceBy: number,
    name: string,
  ) => {
    if (
      !confirm(
        `Tem certeza que deseja remover ${reduceBy} repetição(ões) de "${name}"? Isso não pode ser desfeito.`,
      )
    )
      return;

    setReducingId(characterId);
    const result = await reduceDuplicateCharacter(
      user.telegramId,
      characterId,
      type,
      reduceBy,
      currentUser?.profileType,
    );
    setReducingId(null);

    if (result.success) {
      toast.success("Repetição removida", {
        description: `Nova quantidade: ${result.newCount}`,
      });
      setCollectionDetails((prev) => {
        if (!prev) return prev;
        const key = type === "waifu" ? "waifus" : "husbandos";
        const updated = [...prev[key]];
        const idx = updated.findIndex((c) => c.characterId === characterId);
        if (idx >= 0) {
          if (result.newCount === 0) {
            updated.splice(idx, 1);
          } else {
            updated[idx] = { ...updated[idx], count: result.newCount! };
          }
        }
        return { ...prev, [key]: updated };
      });
    } else {
      toast.error("Erro ao reduzir repetição", {
        description: result.error,
      });
    }
  };

  const handleSetFavorite = async (
    type: "waifu" | "husbando",
    characterId: number,
    name: string,
  ) => {
    if (
      !confirm(
        `Tem certeza que deseja definir "${name}" como ${type === "waifu" ? "waifu" : "husbando"} favorito?`,
      )
    )
      return;
    setSettingFavorite(true);
    setUserFavorite(
      user.telegramId,
      characterId,
      type,
      currentUser?.profileType,
    ).then((result) => {
      setSettingFavorite(false);
      if (result.success) {
        toast.success("Favorito atualizado", {
          description: `${type === "waifu" ? "Waifu" : "Husbando"} favorito definido para ${name}`,
        });
        window.location.reload();
      } else {
        toast.error("Erro ao definir favorito", {
          description: result.error,
        });
      }
    });
  };

  const handleRemoveFavorite = async (type: "waifu" | "husbando") => {
    if (
      !confirm(
        `Tem certeza que deseja remover o favorito ${type === "waifu" ? "waifu" : "husbando"}?`,
      )
    )
      return;

    setSettingFavorite(true);
    const result = await removeUserFavorite(
      user.telegramId,
      type,
      currentUser?.profileType,
    );
    setSettingFavorite(false);

    if (result.success) {
      toast.success("Favorito removido");
      window.location.reload();
    } else {
      toast.error("Erro ao remover favorito", {
        description: result.error,
      });
    }
  };

  const getProfileBadgeVariant = (type: string) => {
    switch (type) {
      case ProfileType.SUPREME:
        return "default";
      case ProfileType.SUPER_ADMIN:
        return "destructive";
      case ProfileType.ADMIN:
        return "secondary";
      case ProfileType.MODERATOR:
        return "outline";
      default:
        return "outline";
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

      <DialogContent className="max-w-2xl sm:max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-4 border-b">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl sm:text-2xl font-bold">
              {user.telegramData?.first_name || "Usuário"}
            </DialogTitle>
            <div className="flex items-center gap-2">
              <Badge
                variant={getProfileBadgeVariant(user.profileType)}
                className="text-xs sm:text-sm"
              >
                {user.profileType}
              </Badge>
              {canEditType && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      disabled={!!typeUpdating}
                    >
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
                    {Object.values(ProfileType)
                      .filter((t) => t !== ProfileType.SUPREME)
                      .map((type) => {
                        const isLoading = typeUpdating === type;
                        const isCurrent = user.profileType === type;
                        return (
                          <DropdownMenuItem
                            key={type}
                            onClick={() => handleUpdateType(type)}
                            disabled={isLoading || isCurrent}
                            className="flex items-center justify-between cursor-pointer"
                          >
                            <span
                              className={
                                isCurrent ? "text-muted-foreground" : ""
                              }
                            >
                              {type}
                            </span>
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
            <p className="text-sm text-muted-foreground">
              @{user.telegramData.username}
            </p>
          )}
        </DialogHeader>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-4">
          <div className="bg-muted/30 p-4 rounded-xl space-y-3">
            <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
              Informações
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">ID Banco</span>
                <span className="font-mono font-medium">{user.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Telegram ID</span>
                <span className="font-mono font-medium text-xs">
                  {user.telegramId}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Moedas</span>
                <span className="font-medium">
                  💰 {user.coins.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Idioma</span>
                <span className="font-medium">{user.language}</span>
              </div>
              {canAdjustCoins && (
                <div className="flex gap-1 pt-2 border-t mt-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 h-7"
                    onClick={() => handleAdjustCoins("subtract", 100)}
                    disabled={adjustingCoins}
                  >
                    <MinusIcon className="h-3 w-3" />
                    100
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 h-7"
                    onClick={() => handleAdjustCoins("add", 100)}
                    disabled={adjustingCoins}
                  >
                    <PlusIcon className="h-3 w-3" />
                    100
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 h-7"
                    onClick={() => handleAdjustCoins("set", 0)}
                    disabled={adjustingCoins}
                  >
                    Reset
                  </Button>
                </div>
              )}
            </div>
          </div>

          <div className="bg-muted/30 p-4 rounded-xl space-y-3">
            <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
              Coleção
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Waifus</span>
                <span className="font-medium">
                  {user._count?.WaifuCollection || 0}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Husbandos</span>
                <span className="font-medium">
                  {user._count?.HusbandoCollection || 0}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
              Favoritos
            </h4>
            {canAdjustCoins && (
              <span className="text-xs text-muted-foreground">
                (ADMIN pode alterar)
              </span>
            )}
          </div>
          <div className="flex gap-3 justify-center min-h-[140px]">
            {user.CharacterHusbando ? (
              <div className="w-1/2 max-w-[140px] rounded-lg overflow-hidden relative">
                <Badge className="absolute top-2 left-2 z-10 bg-blue-500/90">
                  Husbando
                </Badge>
                <CharacterMedia
                  item={user.CharacterHusbando}
                  type={"husbando"}
                />
                {canAdjustCoins && (
                  <div className="absolute top-2 right-2 flex gap-1">
                    <Button
                      size="sm"
                      variant="destructive"
                      className="h-6 w-6 p-0"
                      onClick={() => handleRemoveFavorite("husbando")}
                    >
                      <XIcon className="h-3 w-3" />
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <div className="w-1/2 max-w-[140px] border-2 border-dashed border-primary/20 rounded-lg flex items-center justify-center text-muted-foreground text-xs">
                Sem Husbando
              </div>
            )}

            {user.CharacterWaifu ? (
              <div className="w-1/2 max-w-[140px] rounded-lg overflow-hidden relative">
                <Badge className="absolute top-2 left-2 z-10 bg-pink-500/90">
                  Waifu
                </Badge>
                <CharacterMedia item={user.CharacterWaifu} type={"waifu"} />
                {canAdjustCoins && (
                  <div className="absolute top-2 right-2 flex gap-1">
                    <Button
                      size="sm"
                      variant="destructive"
                      className="h-6 w-6 p-0"
                      onClick={() => handleRemoveFavorite("waifu")}
                    >
                      <XIcon className="h-3 w-3" />
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <div className="w-1/2 max-w-[140px] border-2 border-dashed border-primary/20 rounded-lg flex items-center justify-center text-muted-foreground text-xs">
                Sem Waifu
              </div>
            )}
          </div>
        </div>

        <Tabs defaultValue="waifus" className="w-full">
          <TabsList className="w-full">
            <TabsTrigger value="waifus" className="flex-1">
              Waifus ({collectionDetails?.waifus.length || 0})
            </TabsTrigger>
            <TabsTrigger value="husbandos" className="flex-1">
              Husbandos ({collectionDetails?.husbandos.length || 0})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="waifus" className="mt-4">
            {loadingCollection ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : collectionDetails?.waifus.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Nenhuma waifu na coleção
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 max-h-[400px] overflow-y-auto">
                {collectionDetails?.waifus.map((item) => {
                  const isFav = user.CharacterWaifu?.id === item.characterId;
                  return (
                    <div
                      key={item.id}
                      className={`relative bg-muted/30 p-2 rounded-lg ${isFav ? "ring-2 ring-red-500" : ""}`}
                    >
                      {isFav && (
                        <div className="absolute -top-1 -right-1 z-10">
                          <HeartIcon className="h-4 w-4 fill-red-500 text-red-500" />
                        </div>
                      )}
                      <div className="w-full h-24 rounded mb-2 overflow-hidden">
                        <CharacterMedia
                          item={item.Character}
                          type="waifu"
                          className="w-full h-full"
                        />
                      </div>
                      <p className="text-xs font-medium truncate">
                        {item.Character.name}
                      </p>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-xs bg-pink-500/20 px-1.5 py-0.5 rounded">
                          x{item.count}
                        </span>
                        <div className="flex gap-1">
                          {canAdjustCoins && item.count > 0 && (
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-6 px-1"
                              onClick={() =>
                                handleReduceDuplicate(
                                  item.characterId,
                                  "waifu",
                                  1,
                                  item.Character.name,
                                )
                              }
                              disabled={reducingId === item.characterId}
                            >
                              <MinusIcon className="h-3 w-3" />
                            </Button>
                          )}
                          {canAdjustCoins && !isFav && (
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-6 px-1 text-green-500"
                              onClick={() =>
                                handleSetFavorite(
                                  "waifu",
                                  item.characterId,
                                  item.Character.name,
                                )
                              }
                              disabled={settingFavorite}
                              title="Definir como favorito"
                            >
                              <HeartIcon className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </TabsContent>

          <TabsContent value="husbandos" className="mt-4">
            {loadingCollection ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : collectionDetails?.husbandos.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Nenhum husbando na coleção
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 max-h-[400px] overflow-y-auto">
                {collectionDetails?.husbandos.map((item) => {
                  const isFav = user.CharacterHusbando?.id === item.characterId;
                  return (
                    <div
                      key={item.id}
                      className={`relative bg-muted/30 p-2 rounded-lg ${isFav ? "ring-2 ring-red-500" : ""}`}
                    >
                      {isFav && (
                        <div className="absolute -top-1 -right-1 z-10">
                          <HeartIcon className="h-4 w-4 fill-red-500 text-red-500" />
                        </div>
                      )}
                      <div className="w-full h-24 rounded mb-2 overflow-hidden">
                        <CharacterMedia
                          item={item.Character}
                          type="husbando"
                          className="w-full h-full"
                        />
                      </div>
                      <p className="text-xs font-medium truncate">
                        {item.Character.name}
                      </p>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-xs bg-blue-500/20 px-1.5 py-0.5 rounded">
                          x{item.count}
                        </span>
                        <div className="flex gap-1">
                          {canAdjustCoins && item.count > 0 && (
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-6 px-1"
                              onClick={() =>
                                handleReduceDuplicate(
                                  item.characterId,
                                  "husbando",
                                  1,
                                  item.Character.name,
                                )
                              }
                              disabled={reducingId === item.characterId}
                            >
                              <MinusIcon className="h-3 w-3" />
                            </Button>
                          )}
                          {canAdjustCoins && !isFav && (
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-6 px-1 text-green-500"
                              onClick={() =>
                                handleSetFavorite(
                                  "husbando",
                                  item.characterId,
                                  item.Character.name,
                                )
                              }
                              disabled={settingFavorite}
                              title="Definir como favorito"
                            >
                              <HeartIcon className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>

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
                {!currentUser
                  ? "Faça login para gerenciar"
                  : user.profileType === ProfileType.SUPREME
                    ? "Proprietário do sistema"
                    : "Apenas o Dono pode gerenciar"}
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
          <Button
            variant="secondary"
            onClick={() => setIsOpen(false)}
            className="w-full sm:w-auto"
          >
            Fechar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
