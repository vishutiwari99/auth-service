import { NextFunction, Request, Response } from "express";
import { HttpError } from "http-errors";
import { v4 as uuidv4 } from "uuid";
import logger from "../config/logger";
export const globalErrorHandler = (
  err: HttpError,
  req: Request,
  res: Response,

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction,
) => {
  const errorId = uuidv4();
  const isUnauthorized = err.name === "UnauthorizedError";
  const isHttp = err instanceof HttpError;

  const statusCode = isUnauthorized ? 401 : isHttp ? err.statusCode : 500;
  const isProduction = process.env.NODE_ENV === "production";
  const message = isProduction
    ? isUnauthorized
      ? "Unauthorized"
      : "Internal Server Error"
    : err.message || "Unexpected error";

  logger[isUnauthorized ? "warn" : "error"](message, {
    id: errorId,
    stack: err.stack,
    path: req.path,
    method: req.method,
    statusCode,
  });
  res.status(statusCode).json({
    errors: [
      {
        ref: errorId,
        type: err.name || "Error",
        msg: message,
        path: req.path,
        method: req.method,
        location: "server",
        stack: isProduction ? null : err.stack,
      },
    ],
  });
};
