import { HTTP_STATUS, USER_ROLES } from "../../constants/httpStatus";
import { prisma } from "../../lib/prisma";
import { ApiError } from "../../utils/ApiError";
import { generateToken, hashPassword } from "../../utils/authUtils";
import { userResponseSchema } from "./auth.schema";
import { SignUpDTO, userResponseDTO } from "./auth.types";

export const authService  = {
    createUser : async(data : SignUpDTO) : Promise<{
        user : userResponseDTO
        accessToken : string,
        refreshToken : string
    }> => {
        const existingUser = await prisma.user.findUnique({
            where : {
                email : data.email
            }
        })

        if(existingUser){
            throw new ApiError(HTTP_STATUS.BAD_REQUEST, "User with this email already exists")
        }

        const hashedPassword = await hashPassword(data.password);

        const user = await prisma.user.create({
            data : {
                name : data.name,
                email : data.email,
                password : hashedPassword,
                role : USER_ROLES.USER,
                profile : {
                    create : {} 
                }
            }
        })

        const payload = {
            id : user.id,
            email : data.email,
            role : USER_ROLES.USER
        }

        const accessToken = generateToken(payload, "15m");
        const refreshToken = generateToken(payload, "7d");

        const userDTO = userResponseSchema.parse(user);

        return {
            user : userDTO,
            accessToken,
            refreshToken
        }
    }
}


// export const authService = {
//   createUser: async (
//     data: SignUpDTO
//   ): Promise<{
//     user: userResponseDTO;
//     accessToken: string;
//     refreshToken: string;
//   }> => {
//     console.log("🚀 createUser service started");
//     console.log("📥 Incoming data:", data);

//     console.log("🔍 Checking if user already exists...");
//     const existingUser = await prisma.user.findUnique({
//       where: {
//         email: data.email,
//       },
//     });

//     console.log("🔎 Existing user result:", existingUser);

//     if (existingUser) {
//       console.log("❌ User already exists");
//       throw new ApiError(
//         HTTP_STATUS.BAD_REQUEST,
//         "User with this email already exists"
//       );
//     }

//     console.log("🔐 Hashing password...");
//     const hashedPassword = await hashPassword(data.password);
//     console.log("✅ Password hashed");

//     console.log("🗄 Creating user in database...");
//     const user = await prisma.user.create({
//       data: {
//         name: data.name,
//         email: data.email,
//         password: hashedPassword,
//         role: USER_ROLES.USER,
//         profile: {
//           create: {},
//         },
//       },
//     });

//     console.log("✅ User created:", user);

//     console.log("🎟 Creating JWT payload...");
//     const payload = {
//       id: user.id,
//       email: data.email,
//       role: USER_ROLES.USER,
//     };

//     console.log("🔑 Generating access token...");
//     const accessToken = generateToken(payload, "15m");

//     console.log("🔑 Generating refresh token...");
//     const refreshToken = generateToken(payload, "7d");

//     console.log("📦 Parsing user DTO...");
//     const userDTO = userResponseSchema.parse(user);

//     console.log("✅ createUser service finished");

//     return {
//       user: userDTO,
//       accessToken,
//       refreshToken,
//     };
//   },
// };