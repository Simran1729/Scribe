import pinoHttp from "pino-http";
import { logger } from "../utils/logger";
import { randomUUID } from "crypto";

export const httpLogger = pinoHttp({
  logger,
  quietReqLogger: true,
  customAttributeKeys: {
    reqId: "requestId",
  },
  genReqId: (req, res) => {
    const incomingId = req.headers["x-request-id"];
    if (typeof incomingId === "string" && incomingId.length > 0) {
      res.setHeader("x-request-id", incomingId);
      return incomingId;
    }

    const id = randomUUID();
    res.setHeader("x-request-id", id);
    return id;
  },
  customLogLevel: (_req, res, err) => {
    if (err || res.statusCode >= 500) return "error";
    if (res.statusCode >= 400) return "warn";
    return "info";
  },
  serializers: {
    req(req) {
      const originalUrl = (req as any).originalUrl || req.url;
      const path = typeof originalUrl === "string" ? originalUrl.split("?")[0] : req.url;

      return {
        id: (req as any).id,
        method: req.method,
        path,
        remoteAddress: req.socket?.remoteAddress,
        userAgent: req.headers["user-agent"],
      };
    },
    res(res) {
      return {
        statusCode: res.statusCode,
      };
    },
  },
  customProps: (req) => ({
    userId: (req as any).user?.id,
  }),
  customSuccessMessage: (req, res) =>
    `${req.method} ${(req as any).originalUrl || req.url} ${res.statusCode}`,
  customErrorMessage: (req, res) =>
    `${req.method} ${(req as any).originalUrl || req.url} ${res.statusCode}`,
});
