"use client";

import { UserCollectionDialog } from "@/components/user-collection-dialog";

const LABELS: Record<string, string> = {
  SUPREME: "Supremo",
  SUPER_ADMIN: "Super Admin",
  ADMIN: "Admin",
  MODERATOR: "Moderador",
  USER: "Usuário",
  BANNED: "Banido",
};

const COLORS: Record<string, string> = {
  SUPREME: "text-yellow-400",
  SUPER_ADMIN: "text-red-400",
  ADMIN: "text-orange-400",
  MODERATOR: "text-blue-400",
  USER: "text-muted-foreground",
  BANNED: "text-red-600",
};

type Props = {
  id: number;
  telegramId: string;
  name: string;
  username: string;
  profileType: string;
  coins: number;
  language: string;
  favoriteWaifuId: number | null;
  favoriteHusbandoId: number | null;
  canManage: boolean;
};

export function UserTableRow({
  id,
  telegramId,
  name,
  username,
  profileType,
  coins,
  language,
  favoriteWaifuId,
  favoriteHusbandoId,
  canManage,
}: Props) {
  return (
    <tr className="border-b border-border/30 transition-colors hover:bg-border/20">
      <td className="px-2 py-2.5 text-center text-xs text-muted-foreground">
        {id}
      </td>
      <td className="px-2 py-2.5">
        <UserCollectionDialog
          telegramId={telegramId}
          name={name}
          profileType={profileType}
          canManage={canManage}
        />
      </td>
      <td className="px-2 py-2.5 text-xs">
        {username ? (
          <span className="text-muted-foreground">@{username}</span>
        ) : (
          <span className="text-muted-foreground">—</span>
        )}
      </td>
      <td className={`px-2 py-2.5 text-center text-xs font-semibold ${COLORS[profileType] ?? "text-muted-foreground"}`}>
        {LABELS[profileType] ?? profileType}
      </td>
      <td className="px-2 py-2.5 text-center">{coins}</td>
      <td className="px-2 py-2.5 text-center text-xs">{language}</td>
      <td className="px-2 py-2.5 text-center text-xs">
        {favoriteWaifuId ?? "—"}
      </td>
      <td className="px-2 py-2.5 text-center text-xs">
        {favoriteHusbandoId ?? "—"}
      </td>
    </tr>
  );
}
