"use client"

import * as React from "react"
import { updateCharacter } from "@/app/admin/actions"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { EditIcon } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { CharacterForm } from "./character-form"

export function EditCharacterModal({ character, type, onComplete }: { character: any, type: "waifu" | "husbando", onComplete: () => void }) {
  const [isOpen, setIsOpen] = React.useState(false)

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="rounded-full h-8 w-8 text-primary/40 hover:text-primary transition-colors">
          <EditIcon className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-4xl w-[95vw] h-[95vh] flex flex-col overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex flex-wrap items-center gap-2 text-xl font-bold">
            <EditIcon className="size-5" />
            <span>Editar Personagem</span>
            <Badge variant="outline" className={cn("ml-auto text-xs font-bold", type === "waifu" ? "text-pink-500 border-pink-500 bg-pink-500/10" : "text-blue-500 border-blue-500 bg-blue-500/10")}>
              {type === "waifu" ? "WAIFU" : "HUSBANDO"}
            </Badge>
          </DialogTitle>
          <DialogDescription>
            Alteração nos dados do personagem.
          </DialogDescription>
        </DialogHeader>

        <CharacterForm
          character={character}
          currentType={type}
          onSubmit={async (formData) => updateCharacter(character.id, type, formData)}
          onComplete={() => {
            setIsOpen(false);
            onComplete();
          }}
          onCancel={() => setIsOpen(false)}
        />
      </DialogContent>
    </Dialog>
  )
}
