import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { config } from "./config/env";
import { globalLimiter } from "./middleware/rateLimiter";
import { errorHandler, notFound } from "./middleware/errorHandler";

// ── Routers ─────────────────────────────────────────────────────
import projectsRouter        from "./modules/projects/projects.routes";
import { experienceRouter }  from "./modules/experience/index";
import { skillsRouter }      from "./modules/experience/index";
import { configRouter }      from "./modules/experience/index";
import { contactRouter }     from "./modules/contact/contact";
import { adminRouter }       from "./modules/admin/admin.routes";

const app = express();

// ── Security ─────────────────────────────────────────────────────
app.use(helmet());
app.use(cors({
  origin:      config.cors.origin,
  credentials: true,
  methods:     ["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

// ── Logging ───────────────────────────────────────────────────────
app.use(morgan(config.isDev ? "dev" : "combined"));

// ── Body parsing ─────────────────────────────────────────────────
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// ── Global rate limit ────────────────────────────────────────────
app.use(globalLimiter);

// ── Health check ─────────────────────────────────────────────────
app.get("/health", (_req, res) => {
  res.json({
    success: true,
    data: {
      status:    "ok",
      timestamp: new Date().toISOString(),
      env:       config.nodeEnv,
      version:   "1.0.0",
    },
  });
});

// ── Public API routes ────────────────────────────────────────────
app.use("/api/projects",   projectsRouter);
app.use("/api/experience", experienceRouter);
app.use("/api/skills",     skillsRouter);
app.use("/api/config",     configRouter);
app.use("/api/contact",    contactRouter);

// ── Admin routes ─────────────────────────────────────────────────
app.use("/api/admin", adminRouter);

// ── 404 + error handler ──────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

export default app;
