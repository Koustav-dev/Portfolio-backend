import nodemailer from "nodemailer";
import { config } from "../config/env";

interface EmailOptions {
  to:      string;
  subject: string;
  html:    string;
}

const createTransporter = () =>
  nodemailer.createTransport({
    host:   config.email.smtpHost,
    port:   config.email.smtpPort,
    secure: config.email.smtpPort === 465,
    auth: {
      user: config.email.smtpUser,
      pass: config.email.smtpPass,
    },
  });

export const sendEmail = async (opts: EmailOptions): Promise<void> => {
  // If no SMTP configured, log in dev mode
  if (!config.email.smtpHost) {
    if (config.isDev) {
      console.log("📧 [DEV EMAIL — SMTP not configured]");
      console.log("   To:     ", opts.to);
      console.log("   Subject:", opts.subject);
    }
    return;
  }

  const transporter = createTransporter();
  await transporter.sendMail({
    from: `"Koustav Paul Portfolio" <${config.email.from}>`,
    to:   opts.to,
    subject: opts.subject,
    html: opts.html,
  });
};
