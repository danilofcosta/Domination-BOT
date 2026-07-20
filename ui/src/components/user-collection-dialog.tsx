"use client";

import { useState, startTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { getUserCollection, clearUserCollection, deleteUser, updateUserProfileType } from "@/actions/users";
import { useRouter } from "next/navigation";

const PROFILE_OPTIONS = [
  { value: "USER", label: "Usuário" },
  { value: "MODERATOR", label: "Moderador" },
  { value: "ADMIN", label: "Admin" },
  { value: "SUPER_ADMIN", label: "Super Admin" },
  { value: "SUPREME", label: "Supremo" },
  { value: "BANNED", label: "Banido" },
];

type Props = {
  telegramId: string;
  name: string;
  profileType: string;
  canManage?: boolean;
};

export function UserCollectionDialog({ telegramId, name, profileType: initialProfileType, canManage = false }: Props) {
  const router = useRouter();
  const [data, setData] = useState<Awaited<ReturnType<typeof getUserCollection>> | null>(null);
  const [pending, setPending] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [profileType, setProfileType] = useState(initialProfileType);
  const [savingType, setSavingType] = useState(false);

  function load() {
    setPending(true);
    setConfirmClear(false);
    setConfirmDelete(false);
    startTransition(async () => {
      const result = await getUserCollection(telegramId);
      setData(result);
      setPending(false);
    });
  }

  function handleClear() {
    setConfirmClear(false);
    startTransition(async () => {
      const result = await clearUserCollection(telegramId);
      if (result.success) {
        toast.success(result.message);
        setData({ waifuCount: 0, husbandoCount: 0, total: 0 });
      }
    });
  }

  function handleProfileTypeChange(value: string) {
    setProfileType(value);
    setSavingType(true);
    startTransition(async () => {
      const result = await updateUserProfileType(telegramId, value);
      if (result.success) toast.success(result.message);
      setSavingType(false);
    });
  }

  function handleDelete() {
    setConfirmDelete(false);
    startTransition(async () => {
      const result = await deleteUser(telegramId);
      if (result.success) {
        toast.success(result.message);
        router.refresh();
      }
    });
  }

  return (
    <Dialog onOpenChange={(open) => { if (open) load(); }}>
      <DialogTrigger asChild>
        <button type="button" className="w-full text-left focus:outline-none underline decoration-dotted underline-offset-2 decoration-muted-foreground/40 hover:decoration-foreground/60">
          {name || "—"}
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Coleção de {name}</DialogTitle>
        </DialogHeader>
        {pending && <p className="text-muted-foreground text-sm">Carregando...</p>}
        {data && (
          <div className="space-y-4">
            <div className="flex items-center justify-between rounded-lg border border-border/30 bg-border/10 px-4 py-3">
              <span className="text-sm">Waifus</span>
              <span className="text-lg font-bold">{data.waifuCount}</span>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-border/30 bg-border/10 px-4 py-3">
              <span className="text-sm">Husbandos</span>
              <span className="text-lg font-bold">{data.husbandoCount}</span>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-border/30 bg-card/80 px-4 py-3">
              <span className="text-sm font-semibold">Total</span>
              <span className="text-lg font-bold">{data.total}</span>
            </div>

            {canManage && (
              <div className="flex items-center justify-between rounded-lg border border-border/30 bg-border/10 px-4 py-3">
                <label htmlFor="profileType" className="text-sm">Tipo de perfil</label>
                <div className="flex items-center gap-2">
                  <select
                    id="profileType"
                    value={profileType}
                    onChange={(e) => handleProfileTypeChange(e.target.value)}
                    className="rounded-lg border border-border/70 bg-card/60 px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-border"
                  >
                    {PROFILE_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                  {savingType && <span className="text-muted-foreground text-xs">Salvando...</span>}
                </div>
              </div>
            )}

            {canManage && (
              <>
                {confirmClear ? (
                  <div className="flex items-center gap-2 rounded-lg border border-red-400/50 bg-red-400/10 px-4 py-3">
                    <p className="flex-1 text-xs text-red-400">Tem certeza? Esta ação não pode ser desfeita.</p>
                    <Button size="sm" variant="destructive" onClick={handleClear}>Sim, limpar</Button>
                    <Button size="sm" variant="outline" onClick={() => setConfirmClear(false)}>Cancelar</Button>
                  </div>
                ) : data.total > 0 ? (
                  <Button variant="outline" className="w-full border-red-400/30 text-red-400 hover:bg-red-400/10" onClick={() => setConfirmClear(true)}>
                    Limpar coleção
                  </Button>
                ) : null}

                {confirmDelete ? (
                  <div className="flex items-center gap-2 rounded-lg border border-red-500/50 bg-red-500/10 px-4 py-3">
                    <p className="flex-1 text-xs text-red-500">Isso apagará o perfil e todos os dados. Tem certeza?</p>
                    <Button size="sm" variant="destructive" onClick={handleDelete}>Sim, apagar</Button>
                    <Button size="sm" variant="outline" onClick={() => setConfirmDelete(false)}>Cancelar</Button>
                  </div>
                ) : (
                  <Button variant="outline" className="w-full border-red-500/30 text-red-500 hover:bg-red-500/10" onClick={() => setConfirmDelete(true)}>
                    Apagar perfil
                  </Button>
                )}
              </>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
