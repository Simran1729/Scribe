import { TokenPayload } from "../modules/auth/auth.utils";
import type { Logger } from "pino";

declare global {
    namespace Express { 
        interface Request {
            user ?: TokenPayload
            id?: string
            log: Logger
        }
    }
}

export {};
