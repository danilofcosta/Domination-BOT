const JIKAN_API = "https://api.jikan.moe/v4";

export interface MalVoiceActor {
  person: { mal_id: number; url: string; images: { jpg: { image_url: string } }; name: string };
  language: string;
}

export interface MalCharacterData {
  malId: number;
  name: string;
  nameKanji: string;
  about: string | null;
  imageUrl: string | null;
  favorites: number | null;
  url: string | null;
  voices: MalVoiceActor[];
  anime: { mal_id: number; title: string; imageUrl: string; role: string }[];
  manga: { mal_id: number; title: string; imageUrl: string; role: string }[];
}

async function jikanFetch(path: string): Promise<any> {
  const res = await fetch(`${JIKAN_API}${path}`, {
    headers: { "Accept": "application/json" },
    next: { revalidate: 86400 },
  });
  if (!res.ok) return null;
  return res.json();
}

export async function searchMalCharacter(name: string, origem: string): Promise<number | null> {
  try {
    const query = encodeURIComponent(origem && origem !== name ? `${name} ${origem}` : name);
    const result = await jikanFetch(`/characters?q=${query}&limit=1&order_by=mal_id&sort=asc`);
    const data = result?.data;
    if (data && data.length > 0) {
      return data[0].mal_id;
    }
    return null;
  } catch {
    return null;
  }
}

export async function fetchMalCharacterFull(malId: number): Promise<MalCharacterData | null> {
  try {
    const full = await jikanFetch(`/characters/${malId}/full`);
    const d = full?.data;
    if (!d) return null;

    const voices: MalVoiceActor[] = (d.voices || []).map((v: any) => ({
      person: v.person,
      language: v.language || "Japanese",
    }));

    const anime = (d.anime || []).map((a: any) => ({
      mal_id: a.anime?.mal_id,
      title: a.anime?.title || "",
      imageUrl: a.anime?.images?.jpg?.image_url || "",
      role: a.role || "",
    })).filter((a: any) => a.mal_id);

    const manga = (d.manga || []).map((m: any) => ({
      mal_id: m.manga?.mal_id,
      title: m.manga?.title || "",
      imageUrl: m.manga?.images?.jpg?.image_url || "",
      role: m.role || "",
    })).filter((m: any) => m.mal_id);

    return {
      malId: d.mal_id,
      name: d.name,
      nameKanji: d.name_kanji || "",
      about: d.about || null,
      imageUrl: d.images?.jpg?.image_url || null,
      favorites: d.favorites ?? null,
      url: d.url || null,
      voices,
      anime,
      manga,
    };
  } catch {
    return null;
  }
}

export interface MalExtras {
  mal?: {
    malId: number;
    data: MalCharacterData;
    fetchedAt: string;
  };
}

export async function getOrFetchMalData(
  currentExtras: Record<string, unknown> | null | undefined,
  name: string,
  origem: string,
): Promise<{ extras: MalExtras; malData: MalCharacterData | null }> {
  const extras = (currentExtras as MalExtras) || {};

  if (extras.mal?.data) {
    return { extras, malData: extras.mal.data };
  }

  const malId = await searchMalCharacter(name, origem);
  if (!malId) {
    extras.mal = { malId: 0, data: null as any, fetchedAt: new Date().toISOString() };
    return { extras, malData: null };
  }

  const malData = await fetchMalCharacterFull(malId);
  if (!malData) {
    extras.mal = { malId, data: null as any, fetchedAt: new Date().toISOString() };
    return { extras, malData: null };
  }

  extras.mal = {
    malId,
    data: malData,
    fetchedAt: new Date().toISOString(),
  };

  return { extras, malData };
}
