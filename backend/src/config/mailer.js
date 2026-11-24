// =============================================================================
// mailer.js — sends emails (currently: password reset links).
//
// Uses SMTP settings from .env (SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS,
// MAIL_FROM). For Gmail: SMTP_HOST=smtp.gmail.com, SMTP_PORT=465, and an
// "App password" (Google Account -> Security -> App passwords) as SMTP_PASS.
//
// If SMTP isn't configured, the email is printed in the server console
// instead, so the forgot-password flow can still be tested locally.
// =============================================================================

import nodemailer from 'nodemailer'

let transporter = null

function isConfigured() {
  const { SMTP_HOST, SMTP_USER, SMTP_PASS } = process.env
  return Boolean(SMTP_HOST && SMTP_USER && SMTP_PASS && !SMTP_PASS.startsWith('['))
}

function getTransporter() {
  if (!transporter) {
    const port = Number(process.env.SMTP_PORT) || 465
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port,
      secure: port === 465, // 465 = TLS from the start; 587 upgrades with STARTTLS
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    })
  }
  return transporter
}

export async function sendMail({ to, subject, text, html }) {
  if (!isConfigured()) {
    console.log(`\n[mailer] SMTP not configured. Email to ${to} not sent:\n--- ${subject} ---\n${text}\n`)
    return
  }
  await getTransporter().sendMail({
    from: process.env.MAIL_FROM || process.env.SMTP_USER,
    to,
    subject,
    text,
    html,
  })
}

// Escape text before putting it in an HTML email
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`)

export function sendPasswordResetEmail(user, link, minutes) {
  const text =
    `Hi ${user.name},\n\n` +
    `Someone (hopefully you) asked to reset the password for your RehabVision account.\n` +
    `Open this link to choose a new password. It works once and expires in ${minutes} minutes:\n\n` +
    `${link}\n\n` +
    `If you didn't ask for this, you can ignore this email. Your password won't change.\n`
  const html = `
    <div style="font-family:system-ui,sans-serif;max-width:480px;color:#0f172a">
      <h2 style="margin:0 0 16px">Reset your RehabVision password</h2>
      <p>Hi ${esc(user.name)},</p>
      <p>Someone (hopefully you) asked to reset the password for your account.
         This link works once and expires in ${minutes} minutes.</p>
      <p style="margin:24px 0">
        <a href="${esc(link)}" style="background:#10b981;color:#fff;padding:12px 20px;border-radius:8px;text-decoration:none;font-weight:600">Choose a new password</a>
      </p>
      <p style="font-size:13px;color:#64748b">Or paste this into your browser:<br>${esc(link)}</p>
      <p style="font-size:13px;color:#64748b">If you didn't ask for this, ignore this email. Your password won't change.</p>
    </div>`
  return sendMail({ to: user.email, subject: 'Reset your RehabVision password', text, html })
}
