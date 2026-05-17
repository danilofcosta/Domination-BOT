import console from "node:console";
import {
  getAllButtons,
  Harem_setup_dict,
  type HaremSetupDict,
} from "./build.js";

export async function Harem_setup(bot: any) {
  const buttons = getAllButtons(Harem_setup_dict);

  for (const btn of buttons) {
    if (!btn.run) {
      console.log(btn.text, " não tem fução atribuida");
      continue;
    }

    bot.hears(btn.text, btn.run);
  }
}
