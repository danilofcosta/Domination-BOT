import type { Character, ChatType } from "./customTypes.js";

export interface SessionData {
  settings: {
    genero: ChatType;
  };
  locale: string;
  grupo: {
    cont: number;
    dropId: number | null;
    data: number | null;
    character: Character | null;
    title: string | null | undefined;
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
  lock?: {
    userId: number;
    timestamp: number;
  };
}

