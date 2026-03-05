import { Router, Request, Response, NextFunction } from "express";
import { z } from "zod";
import xss from "xss";
import { prisma } from "../../config/database";
import { sendSuccess, paginationMeta } from "../../utils/response";
import { sendEmail } from "../../utils/email";
import { authenticate } from "../../middleware/auth";
import { contactLimiter } from "../../middleware/rateLimiter";
import { validate } from "../../middleware/validate";
import { config } from "../../config/env";
import { AppError } from "../../middleware/errorHandler";

// ── Zod schema ──────────────────────────────────────────────────
export const contactSchema = z.object({
  name:    z.string().min(2, "Name must be at least 2 characters").max(100),
  email:   z.string().email("Please provide a valid email address"),
  message: z.string().min(10, "Message must be at least 10 characters").max(2000),
});

// ── Email template ──────────────────────────────────────────────
const contactEmailTemplate = (
  name: string,
  email: string,
  message: string,
  timestamp: string
): string => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1.0"/>
  <title>New Contact Message</title>
</head>
<body style="margin:0;padding:0;background:#0d0d14;font-family:'Segoe UI',system-ui,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0d0d14;padding:40px 20px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="
        background:#13131f;border-radius:16px;overflow:hidden;
        border:1px solid rgba(255,255,255,0.08);
        box-shadow:0 32px 80px rgba(0,0,0,0.5);
      ">
        <!-- Header -->
        <tr><td style="
          background:linear-gradient(135deg,#1a1030 0%,#0f0a20 100%);
          padding:32px 40px;border-bottom:1px solid rgba(255,255,255,0.06);
        ">
          <table width="100%">
            <tr>
              <td>
                <div style="font-size:11px;color:rgba(160,120,255,0.7);letter-spacing:0.2em;text-transform:uppercase;margin-bottom:8px;font-family:monospace;">
                  New Message
                </div>
                <div style="font-size:22px;font-weight:600;color:#ffffff;letter-spacing:-0.02em;">
                  Koustav Paul<span style="color:#9060e8;">.</span>
                </div>
                <div style="font-size:12px;color:rgba(255,255,255,0.35);margin-top:4px;font-family:monospace;">
                  portfolio contact form
                </div>
              </td>
              <td align="right">
                <div style="
                  width:44px;height:44px;border-radius:12px;
                  background:rgba(144,96,232,0.15);
                  border:1px solid rgba(144,96,232,0.3);
                  display:inline-flex;align-items:center;justify-content:center;
                  font-size:20px;
                ">✉</div>
              </td>
            </tr>
          </table>
        </td></tr>

        <!-- Sender info -->
        <tr><td style="padding:32px 40px 0;">
          <table width="100%" style="
            background:rgba(255,255,255,0.03);border-radius:12px;
            border:1px solid rgba(255,255,255,0.06);overflow:hidden;
          ">
            <tr>
              <td style="padding:16px 20px;border-bottom:1px solid rgba(255,255,255,0.05);">
                <div style="font-size:10px;color:rgba(255,255,255,0.3);text-transform:uppercase;letter-spacing:0.15em;margin-bottom:4px;font-family:monospace;">From</div>
                <div style="font-size:15px;color:#ffffff;font-weight:500;">${xss(name)}</div>
              </td>
            </tr>
            <tr>
              <td style="padding:16px 20px;">
                <div style="font-size:10px;color:rgba(255,255,255,0.3);text-transform:uppercase;letter-spacing:0.15em;margin-bottom:4px;font-family:monospace;">Email</div>
                <a href="mailto:${xss(email)}" style="font-size:15px;color:#9060e8;text-decoration:none;">${xss(email)}</a>
              </td>
            </tr>
          </table>
        </td></tr>

        <!-- Message -->
        <tr><td style="padding:24px 40px 0;">
          <div style="font-size:10px;color:rgba(255,255,255,0.3);text-transform:uppercase;letter-spacing:0.15em;margin-bottom:12px;font-family:monospace;">Message</div>
          <div style="
            background:rgba(255,255,255,0.03);border-radius:12px;
            border:1px solid rgba(255,255,255,0.06);padding:20px;
            font-size:14px;color:rgba(255,255,255,0.75);line-height:1.7;
            white-space:pre-wrap;
          ">${xss(message)}</div>
        </td></tr>

        <!-- Footer -->
        <tr><td style="padding:28px 40px 32px;">
          <table width="100%">
            <tr>
              <td>
                <div style="font-size:11px;color:rgba(255,255,255,0.2);font-family:monospace;">
                  Received: ${timestamp}
                </div>
              </td>
              <td align="right">
                <a href="mailto:${xss(email)}?subject=Re: Your message to Koustav Paul" style="
                  display:inline-block;padding:10px 20px;
                  background:linear-gradient(135deg,#6040b8,#9060e8);
                  border-radius:8px;color:#fff;font-size:12px;
                  text-decoration:none;font-weight:500;letter-spacing:0.02em;
                ">Reply →</a>
              </td>
            </tr>
          </table>
        </td></tr>

      </table>

      <div style="margin-top:24px;text-align:center;font-size:11px;color:rgba(255,255,255,0.15);font-family:monospace;">
        aura-motion · portfolio contact system
      </div>
    </td></tr>
  </table>
</body>
</html>
`;

// ── Service ─────────────────────────────────────────────────────
const contactService = {
  async submit(name: string, email: string, message: string) {
    const msg = await prisma.contactMessage.create({
      data: {
        name:    xss(name),
        email:   xss(email),
        message: xss(message),
      },
    });

    // Fire-and-forget email notification
    const timestamp = new Date().toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata", dateStyle: "medium", timeStyle: "short",
    });
    sendEmail({
      to:      config.admin.email,
      subject: `📬 New message from ${name} — Portfolio`,
      html:    contactEmailTemplate(name, email, message, timestamp),
    }).catch(console.error);

    return msg;
  },

  async getAll(read?: string, page = 1, limit = 20) {
    const where = read === "false" ? { read: false } : read === "true" ? { read: true } : {};
    const [data, total] = await Promise.all([
      prisma.contactMessage.findMany({
        where, orderBy: [{ starred: "desc" }, { createdAt: "desc" }],
        skip: (page - 1) * limit, take: limit,
      }),
      prisma.contactMessage.count({ where }),
    ]);
    return { data, total };
  },

  async patch(id: string, body: { read?: boolean; starred?: boolean }) {
    return prisma.contactMessage.update({
      where: { id },
      data:  {
        ...(body.read    !== undefined && { read:    body.read }),
        ...(body.starred !== undefined && { starred: body.starred }),
      },
    });
  },

  async delete(id: string) {
    return prisma.contactMessage.delete({ where: { id } });
  },
};

// ── Router ───────────────────────────────────────────────────────
export const contactRouter = Router();

// Public: submit
contactRouter.post(
  "/",
  contactLimiter,
  validate(contactSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { name, email, message } = req.body;
      await contactService.submit(name, email, message);
      sendSuccess(res, {
        message: "Your message has been received. I'll get back to you soon!",
      }, 201);
    } catch (e) { next(e); }
  }
);

// Admin: list
contactRouter.get("/", authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { read, page = "1", limit = "20" } = req.query as Record<string, string>;
    const p = parseInt(page, 10), l = parseInt(limit, 10);
    const { data, total } = await contactService.getAll(read, p, l);
    sendSuccess(res, data, 200, paginationMeta(p, l, total));
  } catch (e) { next(e); }
});

// Admin: patch
contactRouter.patch("/:id", authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (req.body.read === undefined && req.body.starred === undefined) {
      throw new AppError("Provide read or starred field.", 400);
    }
    sendSuccess(res, await contactService.patch(req.params.id, req.body));
  } catch (e) { next(e); }
});

// Admin: delete
contactRouter.delete("/:id", authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    await contactService.delete(req.params.id);
    sendSuccess(res, { message: "Message deleted." });
  } catch (e) { next(e); }
});
