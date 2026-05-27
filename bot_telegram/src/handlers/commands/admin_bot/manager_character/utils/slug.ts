let slugCounter = 0;

export function generateSlug(nome: string, anime: string): string {
  slugCounter++;
  const base = (nome + "-" + anime)
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  return base + "-" + Date.now() + "-" + slugCounter;
}
