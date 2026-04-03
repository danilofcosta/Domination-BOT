import { CommandGroup } from "@grammyjs/commands";
import type { MyContext } from "../utils/customTypes.js";
import { CapturarCharacter } from "../handlers/Comandos/users/dominar.js";
import { botPrefix, options, typeBot } from "./ini.js";
import { HaremHandler } from "../handlers/Comandos/users/harem.js";
import { favCharacter } from "../handlers/Comandos/users/fav.js";
import { Myinfos } from "../handlers/Comandos/users/myinfos.js";
import { giftHandler } from "../handlers/Comandos/users/gift.js";
import { Ramdon_Character_Handler } from "../handlers/Comandos/globais/random_character.js";
import { topHandler } from "../handlers/Comandos/users/top.js";

const botCommands = new CommandGroup<MyContext>();

// dominar' é um comando que permite aos usuários dominar um personagem específico. Ele é registrado com o nome "dominar" para garantir que seja reconhecido corretamente, e utiliza a função CapturarCharacter para processar a lógica de dominação, como verificar o personagem a ser dominado, atualizar as informações do usuário e fornecer feedback sobre o sucesso ou falha da ação.
botCommands.command(
  "dominar",
  "Dominate a character",
  CapturarCharacter,
  options,
);




//harem busca a coleção de personagens dominados e favoritos do usuário, mostrando informações como nome, imagem, nível de dominação, etc. O comando é personalizado para cada tipo de bot (waifu ou husbando) usando a variável typeBot para diferenciar as mensagens e informações exibidas.
botCommands.command(
  `my${typeBot}s`,
  "Get information about the Harem feature",
  HaremHandler,
  options,
);

//define o comando para mostrar o personagem favorito do usuário, utilizando a função favCharacter para buscar e exibir as informações do personagem favorito. O comando é personalizado com o prefixo do bot para garantir que seja reconhecido corretamente.
botCommands.command(
  `${botPrefix}fav`,
  "Show your favorite character",
  favCharacter,
  options,
);
//giftHandler é um comando que permite aos usuários presentear um personagem para outro usuário. Ele é registrado com o prefixo do bot para garantir que seja reconhecido corretamente, e utiliza a função giftHandler para processar a lógica de presenteação, como verificar o personagem a ser presenteado, o destinatário e atualizar as informações do usuário.
botCommands.command(
  `${botPrefix}gift`,
  "Gift a character to another user",
  giftHandler,
  options,
);
//Myinfos é um comando que permite aos usuários visualizar suas informações pessoais, como nome, nível de dominação, personagens dominados, etc. Ele é registrado com o prefixo do bot para garantir que seja reconhecido corretamente, e utiliza a função Myinfos para buscar e exibir as informações do usuário de forma personalizada.
botCommands.command(
  `myinfo${botPrefix}`,
  "Show your information",
  Myinfos,
  options,
);
//Ramdon_Character_Handler é um comando que traz um personagem aleatório do banco de dados. Ele é registrado com o nome do tipo de bot (waifu ou husbando) para garantir que seja reconhecido corretamente, e utiliza a função Ramdon_Character_Handler para buscar e exibir as informações do personagem aleatório de forma personalizada.
botCommands.command(
  typeBot || "random",
  "traz um personagem aleatorio do db",
  Ramdon_Character_Handler,
  options,
);

// top é um comando que exibe os melhores jogadores do jogo, mostrando informações como nome, nível de dominação, número de personagens dominados, etc. Ele é registrado com o prefixo do bot para garantir que seja reconhecido corretamente, e utiliza a função topHandler para buscar e exibir as informações dos melhores jogadores de forma personalizada. 
botCommands.command(
  `${botPrefix}top`,
  "Show the top players",
  topHandler,
  options,
);

export { botCommands };