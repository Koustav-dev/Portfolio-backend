import { Request, Response, NextFunction } from "express";
import { projectsService } from "./projects.service";
import { sendSuccess, paginationMeta } from "../../utils/response";

export const projectsController = {
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const { category, page = "1", limit = "10" } = req.query as Record<string, string>;
      const p = parseInt(page, 10);
      const l = parseInt(limit, 10);
      const { data, total } = await projectsService.getAll(category, p, l);
      sendSuccess(res, data, 200, paginationMeta(p, l, total));
    } catch (e) { next(e); }
  },

  async getBySlug(req: Request, res: Response, next: NextFunction) {
    try {
      const project = await projectsService.getBySlug(req.params.slug);
      sendSuccess(res, project);
    } catch (e) { next(e); }
  },

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const imageUrl = (req.file as any)?.path;
      const project = await projectsService.create(req.body, imageUrl);
      sendSuccess(res, project, 201);
    } catch (e) { next(e); }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const imageUrl = (req.file as any)?.path;
      const project = await projectsService.update(req.params.id, req.body, imageUrl);
      sendSuccess(res, project);
    } catch (e) { next(e); }
  },

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await projectsService.delete(req.params.id);
      sendSuccess(res, { message: "Project deleted." });
    } catch (e) { next(e); }
  },
};
