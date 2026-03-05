// ═══════════════════════════════════════════════════════════════
// EXPERIENCE
// ═══════════════════════════════════════════════════════════════
import { Router, Request, Response, NextFunction } from "express";
import { prisma } from "../../config/database";
import { sendSuccess, paginationMeta } from "../../utils/response";
import { authenticate } from "../../middleware/auth";
import { uploadCompanyLogo } from "../../middleware/upload";
import { SkillCategory } from "@prisma/client";
import xss from "xss";

// ── Experience Service ──────────────────────────────────────────
export const experienceService = {
  async getAll(page = 1, limit = 20) {
    const [data, total] = await Promise.all([
      prisma.experience.findMany({ orderBy: { order: "asc" }, skip: (page - 1) * limit, take: limit }),
      prisma.experience.count(),
    ]);
    return { data, total };
  },
  async create(body: any, logoUrl?: string) {
    return prisma.experience.create({
      data: {
        company:     xss(body.company),
        role:        xss(body.role),
        description: xss(body.description),
        startDate:   new Date(body.startDate),
        endDate:     body.endDate ? new Date(body.endDate) : null,
        techUsed:    Array.isArray(body.techUsed) ? body.techUsed.map(xss) : [],
        companyLogo: logoUrl || body.companyLogo || null,
        order:       parseInt(body.order || "0", 10),
      },
    });
  },
  async update(id: string, body: any, logoUrl?: string) {
    return prisma.experience.update({
      where: { id },
      data: {
        ...(body.company     && { company:     xss(body.company) }),
        ...(body.role        && { role:        xss(body.role) }),
        ...(body.description && { description: xss(body.description) }),
        ...(body.startDate   && { startDate:   new Date(body.startDate) }),
        ...(body.endDate     !== undefined && { endDate: body.endDate ? new Date(body.endDate) : null }),
        ...(body.techUsed    && { techUsed: Array.isArray(body.techUsed) ? body.techUsed.map(xss) : [] }),
        ...(logoUrl          && { companyLogo: logoUrl }),
        ...(body.order       !== undefined && { order: parseInt(body.order, 10) }),
      },
    });
  },
  async delete(id: string) { return prisma.experience.delete({ where: { id } }); },
};

// ── Experience Router ───────────────────────────────────────────
export const experienceRouter = Router();

experienceRouter.get("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page = "1", limit = "20" } = req.query as Record<string, string>;
    const p = parseInt(page, 10), l = parseInt(limit, 10);
    const { data, total } = await experienceService.getAll(p, l);
    sendSuccess(res, data, 200, paginationMeta(p, l, total));
  } catch (e) { next(e); }
});

experienceRouter.post("/",    authenticate, uploadCompanyLogo.single("companyLogo"), async (req: Request, res: Response, next: NextFunction) => {
  try { sendSuccess(res, await experienceService.create(req.body, (req.file as any)?.path), 201); } catch (e) { next(e); }
});
experienceRouter.patch("/:id", authenticate, uploadCompanyLogo.single("companyLogo"), async (req: Request, res: Response, next: NextFunction) => {
  try { sendSuccess(res, await experienceService.update(req.params.id, req.body, (req.file as any)?.path)); } catch (e) { next(e); }
});
experienceRouter.delete("/:id", authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try { await experienceService.delete(req.params.id); sendSuccess(res, { message: "Deleted." }); } catch (e) { next(e); }
});


// ═══════════════════════════════════════════════════════════════
// SKILLS
// ═══════════════════════════════════════════════════════════════
export const skillsService = {
  async getAll() {
    const skills = await prisma.skill.findMany({ orderBy: { proficiency: "desc" } });
    // Group by category
    const grouped = skills.reduce((acc: Record<string, typeof skills>, skill) => {
      const key = skill.category;
      if (!acc[key]) acc[key] = [];
      acc[key].push(skill);
      return acc;
    }, {});
    return grouped;
  },
  async create(body: any) {
    return prisma.skill.create({
      data: {
        name:        xss(body.name),
        category:    body.category as SkillCategory,
        proficiency: parseInt(body.proficiency || "50", 10),
        icon:        body.icon || null,
      },
    });
  },
  async update(id: string, body: any) {
    return prisma.skill.update({
      where: { id },
      data: {
        ...(body.name        && { name: xss(body.name) }),
        ...(body.category    && { category: body.category as SkillCategory }),
        ...(body.proficiency !== undefined && { proficiency: parseInt(body.proficiency, 10) }),
        ...(body.icon        !== undefined && { icon: body.icon }),
      },
    });
  },
  async delete(id: string) { return prisma.skill.delete({ where: { id } }); },
};

export const skillsRouter = Router();

skillsRouter.get("/", async (_req: Request, res: Response, next: NextFunction) => {
  try { sendSuccess(res, await skillsService.getAll()); } catch (e) { next(e); }
});
skillsRouter.post("/",     authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try { sendSuccess(res, await skillsService.create(req.body), 201); } catch (e) { next(e); }
});
skillsRouter.patch("/:id", authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try { sendSuccess(res, await skillsService.update(req.params.id, req.body)); } catch (e) { next(e); }
});
skillsRouter.delete("/:id", authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try { await skillsService.delete(req.params.id); sendSuccess(res, { message: "Deleted." }); } catch (e) { next(e); }
});


// ═══════════════════════════════════════════════════════════════
// SITE CONFIG
// ═══════════════════════════════════════════════════════════════
export const configService = {
  async get(key: string)          { return prisma.siteConfig.findUniqueOrThrow({ where: { key } }); },
  async set(key: string, value: any) {
    return prisma.siteConfig.upsert({
      where:  { key },
      update: { value },
      create: { key, value },
    });
  },
};

export const configRouter = Router();

configRouter.get("/:key", async (req: Request, res: Response, next: NextFunction) => {
  try { sendSuccess(res, await configService.get(req.params.key)); } catch (e) { next(e); }
});
configRouter.put("/:key", authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try { sendSuccess(res, await configService.set(req.params.key, req.body.value)); } catch (e) { next(e); }
});
