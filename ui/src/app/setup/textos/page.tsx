import { getTextos } from "@/actions/textos";
import { TextosEditor } from "@/components/textos-editor";

export const dynamic = "force-dynamic";

export default async function TextosPage() {
  const entries = await getTextos();

  const grouped = new Map<string, typeof entries>();
  for (const entry of entries) {
    const type = entry.key.split("_")[0].toLowerCase();
    if (!grouped.has(type)) grouped.set(type, []);
    grouped.get(type)!.push(entry);
  }

  const groups = [...grouped.entries()]
    .map(([type, items]) => ({ type, items }))
    .sort((a, b) => a.type.localeCompare(b.type));

  return <TextosEditor groups={groups} />;
}
