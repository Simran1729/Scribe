import { TokenPayload } from "../utils/authUtils";

declare global {
    namespace Express { 
        interface Request {
            user ?: TokenPayload
        }
    }
}

export {};