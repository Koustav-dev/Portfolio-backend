import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import { cloudinary } from "../config/cloudinary";

const makeStorage = (folder: string) =>
  new CloudinaryStorage({
    cloudinary,
    params: {
      folder:         `portfolio/${folder}`,
      allowed_formats: ["jpg", "jpeg", "png", "webp", "svg"],
      transformation: [{ width: 1200, crop: "limit", quality: "auto" }],
    } as any,
  });

export const uploadProjectImage  = multer({ storage: makeStorage("projects") });
export const uploadCompanyLogo   = multer({ storage: makeStorage("logos") });
export const uploadMemory        = multer({ storage: multer.memoryStorage() });
