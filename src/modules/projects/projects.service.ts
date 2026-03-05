// ── SERVICE ────────────────────────────────────────────────────
import { prisma } from "../../config/database";
import { ProjectCategory } from "@prisma/client";
import xss from "xss";

export const projectsService = {
  async getAll(category?: string, page = 1, limit = 10) {
    const where = category
      ? { category: category.toUpperCase() as ProjectCategory }
      : {};
    const [data, total] = await Promise.all([
      prisma.project.findMany({
        where,
        orderBy: [{ featured: "desc" }, { order: "asc" }],
        skip:  (page - 1) * limit,
        take:  limit,
      }),
      prisma.project.count({ where }),
    ]);
    return { data, total };
  },

  async getBySlug(slug: string) {
    return prisma.project.findUniqueOrThrow({ where: { slug } });
  },

  async create(body: any, imageUrl?: string) {
    return prisma.project.create({
      data: {
        title:           xss(body.title),
        slug:            xss(body.slug),
        description:     xss(body.description),
        longDescription: body.longDescription ? xss(body.longDescription) : null,
        coverImage:      imageUrl || body.coverImage || null,
        liveUrl:         body.liveUrl   || null,
        githubUrl:       body.githubUrl || null,
        techStack:       Array.isArray(body.techStack) ? body.techStack.map(xss) : [],
        category:        (body.category || "WEB") as ProjectCategory,
        featured:        body.featured === true || body.featured === "true",
        order:           parseInt(body.order || "0", 10),
      },
    });
  },

  async update(id: string, body: any, imageUrl?: string) {
    return prisma.project.update({
      where: { id },
      data: {
        ...(body.title           && { title: xss(body.title) }),
        ...(body.slug            && { slug: xss(body.slug) }),
        ...(body.description     && { description: xss(body.description) }),
        ...(body.longDescription && { longDescription: xss(body.longDescription) }),
        ...(imageUrl             && { coverImage: imageUrl }),
        ...(body.liveUrl         && { liveUrl: body.liveUrl }),
        ...(body.githubUrl       && { githubUrl: body.githubUrl }),
        ...(body.techStack       && { techStack: Array.isArray(body.techStack) ? body.techStack.map(xss) : [] }),
        ...(body.category        && { category: body.category as ProjectCategory }),
        ...(body.featured        !== undefined && { featured: body.featured === true || body.featured === "true" }),
        ...(body.order           !== undefined && { order: parseInt(body.order, 10) }),
      },
    });
  },

  async delete(id: string) {
    return prisma.project.delete({ where: { id } });
  },
};
