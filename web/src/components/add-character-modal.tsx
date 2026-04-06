"use client"

import * as React from "react"
import { createCharacter } from "@/app/admin/actions"
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { PlusIcon } from "lucide-react"
import { CharacterForm } from "./character-form"

export function AddCharacterModal({ onComplete, currentType = "waifu" }: { onComplete: () => void, currentType?: "waifu" | "husbando" }) {
  const [isOpen, setIsOpen] = React.useState(false)

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusIcon className="mr-2 h-5 w-5" />
          Inicializar Entrada
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-4xl w-[95vw] h-[95vh] flex flex-col overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-bold">
            <PlusIcon /> Criar Personagem
          </DialogTitle>
          <DialogDescription>
            Configure os dados do personagem
          </DialogDescription>
        </DialogHeader>

        <CharacterForm 
           currentType={currentType}
           onSubmit={createCharacter}
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