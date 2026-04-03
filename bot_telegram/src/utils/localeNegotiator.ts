// import GroupRepository from "db/group/group.repository";
// import { MyContext } from "./customTypes";
// import UserRepository from "db/user/user.repository";

export default async function localeNegotiator(ctx: any) {

  if (!ctx.chat) {
    console.warn("No chat information available for locale negotiation.");
    return "pt"; // default to Portuguese if no chat info
  }
  const chatType = ctx.chat.type || "unknown";

  if (chatType == "group" || chatType == "supergroup") {
    // // const groupRepository = new GroupRepository();
    // // const group = await groupRepository.getGroup(ctx.chat.id.toString());
    // const group = await ctx.db.group.findUnique({
    //     where: {
    //         id: ctx.chat.id.toString()
    //     }
    // });

    // if(group)
    //     return group.lang;
    // else
    return "pt";
  }

  if (chatType == "private") {
    // const userRepository = new UserRepository();
    // const user = await userRepository.getUser(ctx.from.id.toString());
    // if(user)
    //     return user.lang;
    // else
    return "pt";
  }


}
