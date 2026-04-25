import { TokenPayload } from "../utils/authUtils";
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
