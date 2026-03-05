import dotenv from "dotenv";
dotenv.config();

const required = (key: string): string => {
  const val = process.env[key];
  if (!val) throw new Error(`Missing required env var: ${key}`);
  return val;
};

export const config = {
  port: parseInt(process.env.PORT || "3001", 10),
  nodeEnv: process.env.NODE_ENV || "development",
  isDev: process.env.NODE_ENV !== "production",

  database: {
    url: required("DATABASE_URL"),
  },

  jwt: {
    secret:         required("JWT_SECRET"),
    refreshSecret:  required("JWT_REFRESH_SECRET"),
    expiresIn:      "15m",
    refreshExpires: "7d",
  },

  cors: {
    origin: [process.env.FRONTEND_URL || "http://localhost:5173",
              process.env.ADMIN_URL    || "http://localhost:5174"
    ]
  },

  email: {
    from:     process.env.ADMIN_EMAIL || "hello@eraf.dev",
    smtpHost: process.env.SMTP_HOST   || "",
    smtpPort: parseInt(process.env.SMTP_PORT || "587", 10),
    smtpUser: process.env.SMTP_USER   || "",
    smtpPass: process.env.SMTP_PASS   || "",
    resendKey: process.env.RESEND_API_KEY || "",
  },

  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME || "",
    apiKey:    process.env.CLOUDINARY_API_KEY    || "",
    apiSecret: process.env.CLOUDINARY_API_SECRET || "",
  },

  admin: {
    email: process.env.ADMIN_EMAIL || "hello@eraf.dev",
  },
};
