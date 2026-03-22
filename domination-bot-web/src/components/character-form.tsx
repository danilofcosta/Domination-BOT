"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2 } from "lucide-react";

const formSchema = z.object({
  name: z.string().min(2, "O nome deve ter pelo menos 2 caracteres."),
  origem: z.string().min(2, "A origem deve ter pelo menos 2 caracteres."),
  sourceType: z.enum(["ANIME", "GAME", "MANGA", "MOVIE"]),
  mediaType: z.enum(["IMAGE_URL", "IMAGE_FILEID", "VIDEO_URL", "VIDEO_FILEID"]),
  media: z.string().optional(),
  eventIds: z.array(z.number()),
  rarityIds: z.array(z.number()),
});

interface CharacterFormProps {
  type: "waifu" | "husbando";
  initialData?: any;
  events: { id: number; name: string; emoji: string }[];
  rarities: { id: number; name: string; emoji: string }[];
  onSubmit: (data: any) => Promise<void>;
}

export function CharacterForm({
  type,
  initialData,
  events,
  rarities,
  onSubmit,
}: CharacterFormProps) {
  const [loading, setLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData
      ? {
          name: initialData.name,
          origem: initialData.origem,
          sourceType: initialData.sourceType,
          mediaType: initialData.mediaType || "IMAGE_URL",
          media: initialData.media || "",
          eventIds: initialData.events?.map((e: any) => e.eventId) || [],
          rarityIds: initialData.rarities?.map((r: any) => r.rarityId) || [],
        }
      : {
          name: "",
          origem: "",
          sourceType: "ANIME",
          mediaType: "IMAGE_URL",
          media: "",
          eventIds: [],
          rarityIds: [],
        },
  });

  const mediaValue = form.watch("media");
  const mediaType = form.watch("mediaType");

  async function handleSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true);
    try {
      await onSubmit(values);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="bg-zinc-900 border-zinc-800 shadow-2xl max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex flex-row justify-around items-center">
          <CardTitle className="text-2xl font-bold text-white">
            {initialData ? "Editar" : "Novo"} {type}
          </CardTitle>

          {/* Preview da Imagem */}
          {mediaType === "IMAGE_URL" && mediaValue && (
            <img
              src={mediaValue}
              alt="preview"
              className="max-h-40 max-w-50 rounded-full mt-2 object-cover"
              onError={(e) => (e.currentTarget.style.display = "none")}
            />
          )}
        </div>
      </CardHeader>

      <CardContent>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-8 text-zinc-100"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Lado Esquerdo: Info Básica */}
              <div className="space-y-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Ex: Mikasa Ackerman"
                          {...field}
                          className="bg-zinc-950 border-zinc-800"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="origem"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Origem (Anime/Obra)</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Ex: Shingeki no Kyojin"
                          {...field}
                          className="bg-zinc-950 border-zinc-800"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="sourceType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tipo de Origem</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="bg-zinc-950 border-zinc-800">
                              <SelectValue placeholder="Tipo" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="bg-zinc-900 border-zinc-800 text-amber-50">
                            <SelectItem value="ANIME">Anime</SelectItem>
                            <SelectItem value="GAME">Game</SelectItem>
                            <SelectItem value="MANGA">Mangá</SelectItem>
                            <SelectItem value="MOVIE">Filme</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="mediaType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tipo de Mídia</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="bg-zinc-950 border-zinc-800">
                              <SelectValue placeholder="Mídia" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="bg-zinc-900 border-zinc-800">
                            <SelectItem value="IMAGE_URL">
                              Imagem (URL)
                            </SelectItem>
                            <SelectItem value="IMAGE_FILEID">
                              Imagem (Telegram)
                            </SelectItem>
                            <SelectItem value="VIDEO_URL">Vídeo (URL)</SelectItem>
                            <SelectItem value="VIDEO_FILEID">
                              Vídeo (Telegram)
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="media"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Media ID/URL</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="..."
                          {...field}
                          className="bg-zinc-950 border-zinc-800"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Lado Direito: Eventos e Raridades */}
              <div className="space-y-8">
                <div className="space-y-4">
                  <FormLabel>Eventos Disponíveis</FormLabel>
                  <ScrollArea className="h-40 w-full border border-zinc-800 bg-zinc-950 p-4">
                    <div className="space-y-2">
                      {events.map((event) => (
                        <FormField
                          key={event.id}
                          control={form.control}
                          name="eventIds"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes(event.id)}
                                  onCheckedChange={(checked) =>
                                    checked
                                      ? field.onChange([...field.value, event.id])
                                      : field.onChange(
                                          field.value?.filter(
                                            (v: any) => v !== event.id
                                          )
                                        )
                                  }
                                />
                              </FormControl>
                              <FormLabel className="font-normal cursor-pointer">
                                {event.emoji} {event.name}
                              </FormLabel>
                            </FormItem>
                          )}
                        />
                      ))}
                    </div>
                  </ScrollArea>
                </div>

                <div className="space-y-4">
                  <FormLabel>Raridades Disponíveis</FormLabel>
                  <ScrollArea className="h-40 w-full border border-zinc-800 bg-zinc-950 p-4">
                    <div className="space-y-2">
                      {rarities.map((rarity) => (
                        <FormField
                          key={rarity.id}
                          control={form.control}
                          name="rarityIds"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes(rarity.id)}
                                  onCheckedChange={(checked) =>
                                    checked
                                      ? field.onChange([...field.value, rarity.id])
                                      : field.onChange(
                                          field.value?.filter(
                                            (v: any) => v !== rarity.id
                                          )
                                        )
                                  }
                                />
                              </FormControl>
                              <FormLabel className="font-normal cursor-pointer">
                                {rarity.emoji} {rarity.name}
                              </FormLabel>
                            </FormItem>
                          )}
                        />
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              </div>
            </div>

            {/* Botões */}
            <div className="pt-6 flex justify-end gap-3 border-t border-zinc-800">
              <Button
                type="button"
                variant="ghost"
                className="text-zinc-400 hover:text-white"
                onClick={() => window.history.back()}
                disabled={loading}
              >
                Cancelar
              </Button>

              <Button
                type="submit"
                className={
                  type === "waifu"
                    ? "bg-pink-600 hover:bg-pink-500"
                    : "bg-blue-600 hover:bg-blue-500"
                }
                disabled={loading}
              >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {initialData ? "Atualizar" : "Salvar"} {type}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}