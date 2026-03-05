import { Router } from "express";
import { projectsController } from "./projects.controller";
import { authenticate } from "../../middleware/auth";
import { uploadProjectImage } from "../../middleware/upload";

const router = Router();

// Public
router.get("/",      projectsController.getAll);
router.get("/:slug", projectsController.getBySlug);

// Admin
router.post(  "/",    authenticate, uploadProjectImage.single("coverImage"), projectsController.create);
router.patch( "/:id", authenticate, uploadProjectImage.single("coverImage"), projectsController.update);
router.delete("/:id", authenticate, projectsController.delete);

export default router;
