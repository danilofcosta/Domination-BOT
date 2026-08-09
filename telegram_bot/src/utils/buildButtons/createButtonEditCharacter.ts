import { InlineKeyboard } from "grammy";
export interface BuildHaremButtonsParams {
  cacheid: number|string;
  action: "edit" | "add";
}
export function createButtonEditCharacter({
  cacheid,
  action,
}: BuildHaremButtonsParams) {
  const btn = new InlineKeyboard();

  btn.text("Nome", `add-${action}_${cacheid}_name`);
  btn.text("Anime", `add-${action}_${cacheid}_anime`);
  btn.row();
  btn.text(
    "Alterar mídia",
    `add-${action}_${cacheid}_media`,
  );
  btn.text(
    "fonte",
    `add-${action}_${cacheid}_source_type`,
  );
  btn.row();
  btn.text(
    "Raridades",
    `add-${action}_${cacheid}_rarities`,
  );
  btn.text(
    "Eventos",
    `add-${action}_${cacheid}_events`,
  );
  btn.row();
  btn
    .text("Salvar", `add-${action}_${cacheid}_save`)
    .style("success");
  btn
    .text("Cancelar", `add-${action}_${cacheid}_cancelfull`)
    .style("danger");

  return btn;
}
