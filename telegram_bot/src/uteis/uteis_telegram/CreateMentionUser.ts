// cria um mensão do user em Html recebendo o nome e o id do usuario
export function CreateMentionUser(
  {
    Nome,
    telegramiduser,
  }: {
    Nome: string;
    telegramiduser: number;
  }
) {
  return `<a href="tg://user?id=${telegramiduser}"><b>${Nome}</b></a>`;
}