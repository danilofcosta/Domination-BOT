let slugCounter = Date.now();

export function generateSlug(name: string, origem: string): string {
  slugCounter++;
  const base = (name + "-" + origem)
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  return base + "-" + Date.now() + "-" + slugCounter;
}
