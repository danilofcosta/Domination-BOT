export function Environment_validation(){


if (
  !process.env.BOT_TOKEN_WAIFU ||
  !process.env.BOT_TOKEN_HUSBANDO ||
  !process.env.TYPE_BOT||
  !process.env.DATABASE_TELEGREM_ID|| 
  !process.env.GROUP_ADM||
  !process.env.NODE_ENV

) {
  console.error("Missing environment variables");
  throw new Error("Missing environment variables");
}


console.log("env success");
}