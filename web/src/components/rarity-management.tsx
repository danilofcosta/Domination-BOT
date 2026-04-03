"use client"

import * as React from "react"
import { getRarities, createRarity, deleteRarity } from "@/app/admin/actions"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { SearchIcon, Loader2Icon, PlusIcon, Trash2Icon, RefreshCwIcon, StarIcon } from "lucide-react"
import { toast } from "sonner"

export function RarityManagement() {
  const [rarities, setRarities] = React.useState<any[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  const fetchData = React.useCallback(async () => {
    setIsLoading(true)
    const data = await getRarities()
    setRarities(data)
    setIsLoading(false)
  }, [])

  React.useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    const formData = new FormData(e.currentTarget)
    const res = await createRarity(formData)
    if (res.success) {
      toast.success("Raridade criada com sucesso!")
      e.currentTarget.reset()
      fetchData()
    } else {
      toast.error("Erro ao criar raridade: " + res.error)
    }
    setIsSubmitting(false)
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Tem certeza que deseja excluir esta raridade? Isso afetará personagens vinculados.")) return
    const res = await deleteRarity(id)
    if (res.success) {
      toast.success("Raridade excluída!")
      fetchData()
    } else {
      toast.error("Erro ao excluir: " + res.error)
    }
  }

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 px-4 lg:px-6">
      {/* FORMULÁRIO */}
      <div className="xl:col-span-1">
        <Card className="bg-card/50 backdrop-blur-md border-primary/10">
          <CardHeader>
            <CardTitle className="text-xl font-black uppercase tracking-tighter italic text-primary">Nova Raridade</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid gap-2">
                <Label htmlFor="name">Nome da Raridade</Label>
                <Input name="name" required placeholder="Ex: Lendário" className="bg-muted/20 border-primary/5 rounded-xl" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="code">Código Único</Label>
                <Input name="code" required placeholder="Ex: legendary" className="bg-muted/20 border-primary/5 rounded-xl" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="emoji">Emoji</Label>
                <Input name="emoji" required placeholder="Ex: ✨" className="bg-muted/20 border-primary/5 rounded-xl" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Descrição</Label>
                <Input name="description" placeholder="Opcional..." className="bg-muted/20 border-primary/5 rounded-xl" />
              </div>
              <Button type="submit" disabled={isSubmitting} className="w-full rounded-xl font-bold uppercase tracking-widest ">
                {isSubmitting ? <Loader2Icon className="h-4 w-4 animate-spin" /> : <><PlusIcon className="mr-2 h-4 w-4" /> Criar Raridade</>}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* LISTA */}
      <div className="xl:col-span-2">
        <div className="rounded-2xl border border-primary/10 bg-card/20 backdrop-blur-md overflow-hidden">
          <div className="p-4 border-b border-primary/10 flex justify-between items-center bg-muted/20">
             <h3 className="font-black uppercase tracking-widest text-xs flex items-center gap-2">
                <StarIcon className="h-4 w-4 text-primary" /> Raridades Disponíveis
             </h3>
             <Button variant="ghost" size="icon" onClick={fetchData} className="rounded-full h-8 w-8">
                <RefreshCwIcon className={`h-4 w-4 ${isLoading ? 'animate-spin text-primary' : ''}`} />
             </Button>
          </div>
          <Table>
            <TableHeader className="bg-muted/40">
              <TableRow className="border-primary/5 hover:bg-transparent">
                <TableHead>Emoji</TableHead>
                <TableHead>Nome</TableHead>
                <TableHead>Código</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                 <TableRow><TableCell colSpan={4} className="h-64 text-center">Carregando...</TableCell></TableRow>
              ) : rarities.length === 0 ? (
                 <TableRow><TableCell colSpan={4} className="h-64 text-center text-muted-foreground">Nenhuma raridade registrada.</TableCell></TableRow>
              ) : (
                rarities.map((rarity) => (
                  <TableRow key={rarity.id} className="border-primary/5 hover:bg-primary/[0.03]">
                    <TableCell className="text-2xl">{rarity.emoji}</TableCell>
                    <TableCell className="font-bold">{rarity.name}</TableCell>
                    <TableCell className="font-mono text-xs opacity-60 uppercase">{rarity.code}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" className="text-destructive/40 hover:text-destructive hover:bg-destructive/10 rounded-full" onClick={() => handleDelete(rarity.id)}>
                        <Trash2Icon className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  )
}
