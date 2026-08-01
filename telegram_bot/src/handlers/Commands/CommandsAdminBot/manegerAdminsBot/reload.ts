import { prisma } from "../../../../lib/prisma.js";
import type { MyContext } from "../../../../uteis/CustomTypes.js";

export async function reload(ctx:MyContext) {


   const  ChatAdministrators = await ctx.api.getChatAdministrators(ctx.chat?.id)



    const ChatAdministratorsnew: await prisma.telegramUser.findMany(
        {where:{
            telegramId:{in:[ChatAdministrators.id lista de id]}
            ,profileType:"USER"
        }}
    )

    if (ChatAdministratorsnew){

        

    }




        
    }