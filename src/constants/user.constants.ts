import { Role } from "@prisma/client";

export const ROLE_TRANSITIONS : Record<string , {FROM : Role , TO : Role}> =  {
    "PROMOTE" : { FROM : Role.USER , TO : Role.MODERATOR},
    "DEMOTE" : {FROM : Role.MODERATOR, TO : Role.USER}
}

//casting as tuple to pass to zod
export const VALID_ACTIONS = Object.keys(ROLE_TRANSITIONS) as [string, ...string[]];