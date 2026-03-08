import bcrypt from "bcrypt";
import jwt, {SignOptions, Secret} from "jsonwebtoken";
import { JWT_KEY } from "../config/env";
import {z} from "zod";
import { TOKEN_EXPIRY, USER_ROLES } from "../constants/httpStatus";
import otpGenerator from "otp-generator";


const SALT_ROUNDS = 10;

const TokenPayloadSchema = z.object({
    id : z.number(),
    email : z.email(),
    role : z.enum([USER_ROLES.ADMIN, USER_ROLES.MODERATOR, USER_ROLES.USER])
})

type TokenPayload = z.infer<typeof TokenPayloadSchema>;

const DEFAULT_ACCESS_TOKEN_EXPIRY: SignOptions["expiresIn"] = TOKEN_EXPIRY.ACCESS_TOKEN;

export const hashPassword = async (password : string) : Promise<string> => {
    // const salts = await bcrypt.genSalt(SALT_ROUNDS);
    // const hash = await bcrypt.hash(password, salts);
    // return hash;
      return bcrypt.hash(password, SALT_ROUNDS);
}

export const comparePasswords = async(password : string, hash : string) : Promise<boolean> => {
    return await bcrypt.compare(password, hash);
}

export const generateToken = (data : TokenPayload, expiresIn : SignOptions["expiresIn"] = DEFAULT_ACCESS_TOKEN_EXPIRY) : string => {
    const secret : Secret = JWT_KEY;
    const token = jwt.sign(data, secret, {expiresIn});
    return token;
}

export const verifyToken = (token : string) : TokenPayload => {
    const secret : Secret = JWT_KEY;
    const decoded =  jwt.verify(token, secret);
    return TokenPayloadSchema.parse(decoded);
}

export const generateOTP = () : string => {
    const otp = otpGenerator.generate(6, {
        lowerCaseAlphabets : false,
        upperCaseAlphabets : false,
        digits : true,
        specialChars : false
    })  

    return otp;
}