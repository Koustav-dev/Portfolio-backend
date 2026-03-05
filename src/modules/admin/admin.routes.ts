import { Router, Request, Response, NextFunction } from "express";
import { z } from "zod";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "../../config/database";
import { sendSuccess } from "../../utils/response";
import { AppError } from "../../middleware/errorHandler";
import { authLimiter } from "../../middleware/rateLimiter";
import { validate } from "../../middleware/validate";
import { authenticate, AuthRequest } from "../../middleware/auth";
import { config } from "../../config/env";

const loginSchema = z.object({
  email:    z.string().email(),
  password: z.string().min(6),
});

const refreshSchema = z.object({
  refreshToken: z.string(),
});

const makeTokens = (id: string, email: string) => ({
  accessToken: jwt.sign({ id, email }, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn as any,
  }),
  refreshToken: jwt.sign({ id, email }, config.jwt.refreshSecret, {
    expiresIn: config.jwt.refreshExpires as any,
  }),
});

export const adminRouter = Router();

// POST /api/admin/login
adminRouter.post(
  "/login",
  authLimiter,
  validate(loginSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, password } = req.body;
      const admin = await prisma.admin.findUnique({ where: { email } });
      if (!admin) throw new AppError("Invalid credentials.", 401);

      const valid = await bcrypt.compare(password, admin.passwordHash);
      if (!valid) throw new AppError("Invalid credentials.", 401);

      const tokens = makeTokens(admin.id, admin.email);
      sendSuccess(res, {
        admin:  { id: admin.id, email: admin.email, name: admin.name },
        ...tokens,
      });
    } catch (e) { next(e); }
  }
);

// POST /api/admin/refresh
adminRouter.post(
  "/refresh",
  validate(refreshSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { refreshToken } = req.body;
      const payload = jwt.verify(refreshToken, config.jwt.refreshSecret) as { id: string; email: string };
      const tokens = makeTokens(payload.id, payload.email);
      sendSuccess(res, tokens);
    } catch {
      next(new AppError("Invalid or expired refresh token.", 401));
    }
  }
);

// GET /api/admin/me
adminRouter.get(
  "/me",
  authenticate,
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const admin = await prisma.admin.findUniqueOrThrow({
        where: { id: req.admin!.id },
        select: { id: true, email: true, name: true, createdAt: true },
      });
      sendSuccess(res, admin);
    } catch (e) { next(e); }
  }
);

// PATCH /api/admin/password
adminRouter.patch(
  "/password",
  authenticate,
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { currentPassword, newPassword } = req.body;
      if (!currentPassword || !newPassword) throw new AppError("Both passwords required.", 400);
      if (newPassword.length < 8) throw new AppError("New password must be at least 8 characters.", 400);

      const admin = await prisma.admin.findUniqueOrThrow({ where: { id: req.admin!.id } });
      const valid = await bcrypt.compare(currentPassword, admin.passwordHash);
      if (!valid) throw new AppError("Current password is incorrect.", 401);

      const passwordHash = await bcrypt.hash(newPassword, 12);
      await prisma.admin.update({ where: { id: admin.id }, data: { passwordHash } });
      sendSuccess(res, { message: "Password updated successfully." });
    } catch (e) { next(e); }
  }
);
