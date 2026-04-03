// comandos usados para o gerenciamento de comandos privados'

import { CommandGroup } from "@grammyjs/commands";
import type { MyContext } from "../utils/customTypes.js";
import { StartGreetings } from "../handlers/Comandos/globais/start.js";
import { options } from "./ini.js";
import { helpCommand } from "../handlers/Comandos/globais/help.js";

const privateCommands = new CommandGroup<MyContext>();
// O comando 'start' é um comando padrão em bots do Telegram que é acionado quando um usuário inicia uma conversa com o bot. Ele é registrado com o nome "start" para garantir que seja reconhecido corretamente, e utiliza a função StartGreetings para fornecer uma mensagem de boas-vindas personalizada ao usuário, explicando as funcionalidades do bot e como usá-lo.
privateCommands.command(
  "start",
  "Start the bot and get a greeting message",
  StartGreetings,
  options,
);
 // O comando 'help' é um comando comum em bots que fornece informações sobre os comandos disponíveis e como usá-los. Ele é registrado com o nome "help" para garantir que seja reconhecido corretamente, e utiliza a função helpCommand para fornecer uma mensagem detalhada sobre os comandos do bot, suas funcionalidades e como os usuários podem interagir com ele de forma eficaz.
privateCommands.command(
  "help",
  "Get help and information about the bot",
  helpCommand,
  options,
);







export { privateCommands };
