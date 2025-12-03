// src/lib/mailer.ts
import nodemailer, { Transporter } from "nodemailer";
import { IS_TEST, SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, NOTIFY_FROM } from "@lib/env";

let cached: Transporter | null = null;

/**
 * TEST mode: in-memory stream transport (no external service).
 * LIVE mode: SMTP (supply SMTP_* envs).
 */
export function getTransport(): Transporter {
  if (cached) return cached;
  if (IS_TEST || !SMTP_HOST) {
    cached = nodemailer.createTransport({
      streamTransport: true,
      buffer: true,
      newline: "unix",
    } as any);
  } else {
    cached = nodemailer.createTransport({
      host: SMTP_HOST,
      port: SMTP_PORT,
      secure: SMTP_PORT === 465,
      auth: SMTP_USER ? { user: SMTP_USER, pass: SMTP_PASS } : undefined,
    });
  }
  return cached!;
}

export async function sendMail(opts: {
  to: string;
  subject: string;
  html: string;
  attachments?: { filename: string; content: Buffer; contentType?: string }[];
}) {
  const t = getTransport();
  const info = await t.sendMail({
    from: NOTIFY_FROM,
    to: opts.to,
    subject: opts.subject,
    html: opts.html,
    attachments: opts.attachments,
  });

  // For TEST transport we return a base64 preview for /api/dev-notify
  const previewBase64 =
    (info as any).message && Buffer.isBuffer((info as any).message)
      ? (info as any).message.toString("base64")
      : undefined;

  return { messageId: info.messageId, previewBase64 };
}
