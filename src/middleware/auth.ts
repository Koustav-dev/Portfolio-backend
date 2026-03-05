import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { config } from "../config/env";
import { AppError } from "./errorHandler";

export interface AuthRequest extends Request {
  admin?: { id: string; email: string };
}

export const authenticate = (
  req: AuthRequest,
  _res: Response,
  next: NextFunction
) => {
  const auth = req.headers.authorization;
  if (!auth?.startsWith("Bearer ")) throw new AppError("No token provided.", 401);

  const token = auth.split(" ")[1];
  try {
    const payload = jwt.verify(token, config.jwt.secret) as { id: string; email: string };
    req.admin = payload;
    next();
  } catch {
    throw new AppError("Invalid or expired token.", 401);
  }
};
