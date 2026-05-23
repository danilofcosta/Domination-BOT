import type { ChatType } from "../utils/customTypes.js";

export interface SessionData {
  settings: {
    genero: ChatType;
  };
  locale: string;
  grupo: {
    directMessagesTopicId: number | null | undefined;
  };
  adminSetup?: {
    action:
      | "edit_nome"
      | "edit_anime"
      | "edit_events"
      | "edit_rarities"
      | `setrarity_${string}`
      | `setevent_${string}`
      | null;
    targetId: string | null;
  };
  rarityEdits?: Record<
    string,
    {
      name?: string;
      emoji?: string;
      emoji_id?: string;
      description?: string;
    }
  >;
  eventEdits?: Record<
    string,
    {
      name?: string;
      emoji?: string;
      emoji_id?: string;
      description?: string;
    }
  >;
  rarityListPage?: number;
  eventListPage?: number;
  backupState?: {
    action: "create" | "restore" | "change";
  };
}

