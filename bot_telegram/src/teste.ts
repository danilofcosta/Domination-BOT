import { LastRandomCharacter } from "./utils/randomCharacter.js";
import { ChatType } from "./utils/types.js";

const character = await LastRandomCharacter( process.env.TYPE_BOT as ChatType )
console.log(process.env.TYPE_BOT )
console.log('character', character?.slug);