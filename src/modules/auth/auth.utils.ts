import bcrypt from "bcrypt";
import jwt, {SignOptions, Secret} from "jsonwebtoken";
import { JWT_KEY } from "../../config/env";
import {uuid, z} from "zod";
import { TOKEN_EXPIRY, USER_ROLES } from "../../constants/httpStatus";
import otpGenerator from "otp-generator";
import { Request } from "express";
import { prisma } from "../../lib/prisma";
import { randomUUID } from "crypto";

// ─── constants 
const BASE_MAX_LENGTH = 12   // leaves room for suffix within 20 chars
const SALT_ROUNDS = 10;

export const TokenPayloadSchema = z.object({
    id : z.number(),
    email : z.email(),
    role : z.enum([USER_ROLES.ADMIN, USER_ROLES.MODERATOR, USER_ROLES.USER])
})

export type TokenPayload = z.infer<typeof TokenPayloadSchema>;

const DEFAULT_ACCESS_TOKEN_EXPIRY: SignOptions["expiresIn"] = TOKEN_EXPIRY.ACCESS_TOKEN;

export const hashPassword = async (password : string) : Promise<string> => {
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

export const validateRole = (role : string, req : Request) : boolean => {
    return req.user!.role === role
}

// ─── sanitize 
const sanitizeBase = (name: string): string => {
  const cleaned = name
    .toLowerCase()
    .replace(/\s+/g, "_")          // spaces → underscores (arjun_singh)
    .replace(/[^a-z0-9_]/g, "")   // strip everything else
    .replace(/^_+|_+$/g, "")      // trim leading/trailing underscores
    .replace(/_+/g, "_")          // collapse multiple underscores
    .slice(0, BASE_MAX_LENGTH)     // 12 chars max — leaves 8 for suffix

    return cleaned
}

// ─── shared validator 
export const isValidUsername = (username: string): boolean =>
  /^[a-z0-9_]{3,20}$/.test(username)

const uuidSuffix = (): string =>
  randomUUID().replace(/-/g, "").slice(0, 7) 

// ─── core generation 
export const generateUniqueUsername = async (name: string): Promise<string> => {
  const base = sanitizeBase(name)

  if (!base) {
    return `user_${uuidSuffix()}` 
  }

  // 1. try bare base first
  const baseExists = await prisma.user.findUnique({
    where : { username: base },
    select: { id: true }
  })
  if (!baseExists) return base

  // 2. generate diverse candidates — all guaranteed within 20 chars
  const candidates = Array.from({ length: 10 }, () => {
    const suffix = uuidSuffix() 
    return `${base}_${suffix}`
  })

  const takenRows = await prisma.user.findMany({
    where : { username: { in: candidates } },
    select: { username: true }
  })

  const takenSet  = new Set(takenRows.map(u => u.username))
  const available = candidates.find(c => !takenSet.has(c))

  return available ?? `user_${uuidSuffix()}`

}


// ─── suggestions 
export const generateUsernameSuggestions = async (
  input: string,
  count: number = 3
): Promise<string[]> => {
  const base = sanitizeBase(input)

  if (!base) return []

  const pool = Array.from({ length: 20 }, () => {
    const suffix = uuidSuffix()
    return `${base}_${suffix}`        
  })

  const takenRows = await prisma.user.findMany({
    where : { username: { in: pool } },
    select: { username: true }
  })

  const takenSet   = new Set(takenRows.map(u => u.username))
  return pool
    .filter(c => !takenSet.has(c))
    .slice(0, count)
}