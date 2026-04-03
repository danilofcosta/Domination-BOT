export function LinkMsg(idchat:number,idmsg:number){
    if (idchat.toString().startsWith('-100')){
        return `https://t.me/c/${idchat.toString().replace('-100','')}/${idmsg}`
    }
    return `https://t.me/c/${idchat}/${idmsg}`
}   
