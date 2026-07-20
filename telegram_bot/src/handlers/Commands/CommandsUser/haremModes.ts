export interface HaremMode {
  id: string;
  labelKey: string;
  default?: boolean;
}

export const haremModes: HaremMode[] = [
  { id: "default", labelKey: "haremmode-default", default: true },
  { id: "latest", labelKey: "haremmode-recent" },
  { id: "rarity", labelKey: "haremmode-rarity" },
  { id: "event", labelKey: "haremmode-event" },
];

export function getDefaultHaremMode(): string {
  return haremModes.find((m) => m.default)?.id ?? "default";
}
