import bcrypt from "bcrypt-ts";
import jwt, {SignOptions, Secret} from "jsonwebtoken";
import { JWT_KEY } from "../config/env";

const SALT_ROUNDS = 19;

interface JwtPayload {
    id : number,
    email : string,
    role : string
}

const DEFAULT_ACCESS_TOKEN_EXPIRY: SignOptions["expiresIn"] = "15m";

export const hashedPassword = async (password : string) : Promise<string> => {
    const salts = await bcrypt.genSalt(SALT_ROUNDS);
    const hash = await bcrypt.hash(password, salts);
    return hash;
}

export const comparePasswords = async(password : string, hash : string) : Promise<boolean> => {
    return await bcrypt.compare(password, hash);
}

export const generateToken = (data : JwtPayload, expiresIn : SignOptions["expiresIn"] = DEFAULT_ACCESS_TOKEN_EXPIRY) : string => {
    const secret : Secret = JWT_KEY;
    const token = jwt.sign(data, secret, {expiresIn});
    return token;
}

export const verifyToken = (token : string) : JwtPayload => {
    const secret : Secret = JWT_KEY;
    return jwt.verify(token, secret) as JwtPayload;
}