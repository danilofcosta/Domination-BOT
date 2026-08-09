type AdminSetupAction =
  | "edit_nome"
  | "edit_anime"
  | "edit_events"
  | "edit_rarities"
  | "edit_media"
  | `setrarity_${string}`
  | `setevent_${string}`
  | null;

interface AdminSetup {
  action: AdminSetupAction;
  targetId: string | null;
  messageId?: number;
}

interface RarityEditCache {
  name?: string;
  emoji?: string;
  emoji_id?: string | undefined;
  description?: string;
}

interface EventEditCache {
  name?: string;
  emoji?: string;
  emoji_id?: string | undefined;
  description?: string;
}

interface BackupState {
  action: "create" | "restore" | "change";
}

const adminSetupMap = new Map<number, AdminSetup>();
const rarityEditMap = new Map<string, RarityEditCache>();
const eventEditMap = new Map<string, EventEditCache>();
const backupStateMap = new Map<number, BackupState>();

function getScope(ctx: { chat?: { id?: number }; from?: { id?: number } }): number {
  return ctx.chat?.id ?? ctx.from?.id ?? 0;
}

export function getAdminSetup(ctx: { chat?: { id?: number }; from?: { id?: number } }): AdminSetup | undefined {
  return adminSetupMap.get(getScope(ctx));
}

export function setAdminSetup(ctx: { chat?: { id?: number }; from?: { id?: number } }, setup: AdminSetup): void {
  adminSetupMap.set(getScope(ctx), setup);
}

export function clearAdminSetup(ctx: { chat?: { id?: number }; from?: { id?: number } }): void {
  adminSetupMap.delete(getScope(ctx));
}

function editKey(ctx: { chat?: { id?: number }; from?: { id?: number } }, code: string): string {
  return `${getScope(ctx)}:${code}`;
}

export function getRarityEditCache(ctx: { chat?: { id?: number }; from?: { id?: number } }, rarityCode: string): RarityEditCache {
  const key = editKey(ctx, rarityCode);
  if (!rarityEditMap.has(key)) {
    rarityEditMap.set(key, {});
  }
  return rarityEditMap.get(key)!;
}

export function clearRarityEditCache(ctx: { chat?: { id?: number }; from?: { id?: number } }, rarityCode: string): void {
  const key = editKey(ctx, rarityCode);
  rarityEditMap.delete(key);
}

export function getEventEditCache(ctx: { chat?: { id?: number }; from?: { id?: number } }, eventCode: string): EventEditCache {
  const key = editKey(ctx, eventCode);
  if (!eventEditMap.has(key)) {
    eventEditMap.set(key, {});
  }
  return eventEditMap.get(key)!;
}

export function clearEventEditCache(ctx: { chat?: { id?: number }; from?: { id?: number } }, eventCode: string): void {
  const key = editKey(ctx, eventCode);
  eventEditMap.delete(key);
}

export function getBackupState(userId: number): BackupState | undefined {
  return backupStateMap.get(userId);
}

export function setBackupState(userId: number, state: BackupState): void {
  backupStateMap.set(userId, state);
}

export function clearBackupState(userId: number): void {
  backupStateMap.delete(userId);
}

export function clearAllWorkflowState(): void {
  adminSetupMap.clear();
  rarityEditMap.clear();
  eventEditMap.clear();
  backupStateMap.clear();
}
