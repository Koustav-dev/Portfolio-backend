import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import { config } from "../config/env";

export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number = 500,
    public isOperational: boolean = true
  ) {
    super(message);
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  // Zod validation errors
  if (err instanceof ZodError) {
    const messages = err.errors.map((e) => `${e.path.join(".")}: ${e.message}`).join(", ");
    return res.status(400).json({ success: false, error: `Validation failed: ${messages}` });
  }

  // Known operational errors
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({ success: false, error: err.message });
  }

  // Prisma unique constraint
  if ((err as any).code === "P2002") {
    return res.status(409).json({ success: false, error: "A record with this value already exists." });
  }

  // Prisma not found
  if ((err as any).code === "P2025") {
    return res.status(404).json({ success: false, error: "Record not found." });
  }

  // Unknown errors
  if (config.isDev) console.error("Unhandled error:", err);
  return res.status(500).json({
    success: false,
    error: config.isDev ? err.message : "Something went wrong.",
  });
};

export const notFound = (_req: Request, res: Response) => {
  res.status(404).json({ success: false, error: "Route not found." });
};
