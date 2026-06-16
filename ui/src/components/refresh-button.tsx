"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { RefreshCwIcon } from "lucide-react";

export function RefreshButton() {
  const router = useRouter();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => router.refresh()}
    >
      <RefreshCwIcon className="size-4" />
    </Button>
  );
}
