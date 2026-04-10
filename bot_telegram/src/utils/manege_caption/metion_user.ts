export function mentionUser(username: string, userId: number) {
  //<a href="tg://user?id=123456789">inline mention of a user</a>
  const userMention = `<a href="tg://user?id=${userId}"><b>${username}</b></a>`;
  //const userMention = '<a href="tg://user?id=123456789">inline mention of a user</a>'
  // console.log(userMention);
  return userMention;
}
