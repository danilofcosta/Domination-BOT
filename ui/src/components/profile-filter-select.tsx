"use client";

import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const ALL_VALUE = "__all__";

export function ProfileFilterSelect({
  defaultValue,
  options,
}: {
  defaultValue: string;
  options: { value: string; label: string }[];
}) {
  const [value, setValue] = useState(defaultValue || ALL_VALUE);

  return (
    <>
      <input type="hidden" name="profileType" value={value === ALL_VALUE ? "" : value} readOnly />
      <Select
        value={value}
        onValueChange={(v) => setValue(v)}
      >
        <SelectTrigger className="w-40">
          <SelectValue placeholder="Todos" />
        </SelectTrigger>
        <SelectContent>
          {options.map((o) => (
            <SelectItem key={o.value} value={o.value}>
              {o.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </>
  );
}
