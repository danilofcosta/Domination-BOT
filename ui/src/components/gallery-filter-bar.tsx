"use client";

import { useState, useRef, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FilterIcon, XIcon } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SourceType } from "../../generated/prisma/enums";

const SOURCE_TYPES = ["all", ...Object.keys(SourceType)] as const;
const MEDIA_TYPES_FILTER = ["all", "IMAGE", "VIDEO"] as const;

interface GalleryFilterBarProps {
  search: string;
  typeFilter: string;
  sourceType: string;
  mediaType: string;
  rarityId: string;
  eventId: string;
  sort: string;
  rarities: { id: number; code: string; name: string; emoji: string }[];
  events: { id: number; code: string; name: string; emoji: string }[];
}

type Option = { value: string; label: string };

const typeOptions: Option[] = [
  { value: "all", label: "Tipo" },
  { value: "waifu", label: "Waifu" },
  { value: "husbando", label: "Husbando" },
];

const sourceOptions: Option[] = [
  { value: "all", label: "Fonte" },
  ...SOURCE_TYPES.filter((t) => t !== "all").map((t) => ({ value: t, label: t })),
];

const mediaOptions: Option[] = [
  { value: "all", label: "Tipo de midia" },
  { value: "IMAGE", label: "Fotos" },
  { value: "VIDEO", label: "Videos" },
];

const sortOptions: Option[] = [
  { value: "recent", label: "Recentes" },
  { value: "name_asc", label: "Nome A-Z" },
  { value: "name_desc", label: "Nome Z-A" },
  { value: "popularity", label: "Popularidade" },
];

function FilterSelect({
  name,
  options,
  defaultValue,
}: {
  name: string;
  options: Option[];
  defaultValue: string;
}) {
  const [value, setValue] = useState(defaultValue);
  const hiddenRef = useRef<HTMLInputElement>(null);

  const handleChange = useCallback(
    (v: string) => {
      setValue(v);
      if (hiddenRef.current) hiddenRef.current.value = v;
    },
    [],
  );

  return (
    <>
      <input type="hidden" name={name} ref={hiddenRef} defaultValue={defaultValue} />
      <Select value={value} onValueChange={handleChange}>
        <SelectTrigger className="w-full">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </>
  );
}

export function GalleryFilterBar({
  search,
  typeFilter,
  sourceType,
  mediaType,
  rarityId,
  eventId,
  sort,
  rarities,
  events,
}: GalleryFilterBarProps) {
  const [showFilters, setShowFilters] = useState(false);

  const rarityOptions: Option[] = [
    { value: "all", label: "Raridade" },
    ...rarities.map((r) => ({
      value: String(r.id),
      label: `${r.emoji} ${r.name}`,
    })),
  ];

  const eventOptions: Option[] = [
    { value: "all", label: "Evento" },
    ...events.map((e) => ({
      value: String(e.id),
      label: `${e.emoji} ${e.name}`,
    })),
  ];

  return (
    <form action="/gallery/recent" method="get" className="mt-4">
      <div className="flex gap-2">
        <div className="flex-1">
          <label htmlFor="search" className="sr-only">
            Buscar
          </label>
          <Input
            id="search"
            name="search"
            defaultValue={search}
            placeholder="Buscar por nome, anime ou ID"
          />
        </div>
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="lg:hidden shrink-0"
          onClick={() => setShowFilters(!showFilters)}
          aria-label="Filtrar"
        >
          {showFilters ? <XIcon className="size-4" /> : <FilterIcon className="size-4" />}
        </Button>
        <Button type="submit" className="shrink-0">
          Buscar
        </Button>
      </div>

      <div
        className={`mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3 ${
          showFilters ? "" : "hidden sm:grid"
        }`}
      >
        <FilterSelect
          name="type"
          options={typeOptions}
          defaultValue={typeFilter}
        />
        <FilterSelect
          name="sourceType"
          options={sourceOptions}
          defaultValue={sourceType}
        />
        <FilterSelect
          name="mediaType"
          options={mediaOptions}
          defaultValue={mediaType}
        />
        <FilterSelect
          name="rarityId"
          options={rarityOptions}
          defaultValue={rarityId}
        />
        <FilterSelect
          name="eventId"
          options={eventOptions}
          defaultValue={eventId}
        />
        <FilterSelect
          name="sort"
          options={sortOptions}
          defaultValue={sort}
        />
      </div>
    </form>
  );
}
