import pino from "pino";

const isProd = process.env.NODE_ENV === "production";
const isPretty = !isProd && process.env.LOG_PRETTY !== "false";

export const logger = pino({
  level: process.env.LOG_LEVEL || "info",
  base: null,
  redact: {
    paths: [
      "req.headers.authorization",
      "req.headers.cookie",
      "req.headers['set-cookie']",
      "req.headers['x-api-key']",
      "req.body.password",
      "req.body.oldPassword",
      "req.body.newPassword",
      "req.body.refreshToken",
      "req.body.token",
      "res.headers['set-cookie']",
    ],
    remove: true,
  },
  transport: isPretty
    ? {
        target: "pino-pretty",
        options: {
          colorize: true,
          translateTime: "SYS:standard",
          ignore: "pid,hostname",
        },
      }
    : undefined,
});
