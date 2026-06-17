const nodemailer = require("nodemailer");

const BREVO_API_URL = "https://api.brevo.com/v3/smtp/email";
const DEFAULT_BREVO_SMTP_HOST = "smtp-relay.brevo.com";

const EMAIL_NOTIFY_STATUSES = ["In Progress", "Resolved", "Rejected"];

function getFromEmail() {
  return process.env.MAIL_FROM || "";
}

function getFromName() {
  return process.env.MAIL_FROM_NAME || "CCMS";
}

function isSmtpConfigured() {
  return !!(process.env.SMTP_USER && process.env.SMTP_PASS);
}

function isBrevoApiConfigured() {
  return !!process.env.BREVO_API_KEY;
}

function getSmtpHost() {
  return process.env.SMTP_HOST || DEFAULT_BREVO_SMTP_HOST;
}

function getEmailConfigStatus() {
  const issues = [];
  const providers = [];

  if (!getFromEmail()) {
    issues.push("MAIL_FROM is not set (must be a verified Brevo sender)");
  }

  if (isBrevoApiConfigured()) {
    providers.push("brevo-api");
  }

  if (isSmtpConfigured()) {
    providers.push("smtp");
  }

  if (providers.length === 0) {
    issues.push(
      "Set BREVO_API_KEY and/or SMTP_USER + SMTP_PASS on Render",
    );
  }

  return {
    ready: issues.length === 0 && providers.length > 0,
    providers,
    mailFrom: getFromEmail() || null,
    hasBrevoApiKey: isBrevoApiConfigured(),
    hasSmtp: isSmtpConfigured(),
    smtpHost: isSmtpConfigured() ? getSmtpHost() : null,
    issues,
  };
}

function logEmailConfigOnStartup() {
  const status = getEmailConfigStatus();

  if (process.env.NODE_ENV !== "production") {
    if (status.ready) {
      console.log(
        `[email] Configured (${status.providers.join(", ")}) from ${status.mailFrom}`,
      );
    } else {
      console.warn("[email] Dev mode — email issues:", status.issues.join("; "));
    }
    return;
  }

  if (status.ready) {
    console.log(
      `[email] Production ready via ${status.providers.join(" + ")} | from: ${status.mailFrom}`,
    );
    return;
  }

  console.error("[email] PRODUCTION EMAIL NOT CONFIGURED — OTP and notifications will fail:");
  status.issues.forEach((issue) => console.error(`  - ${issue}`));
  console.error(
    "  - In Brevo: disable API IP blocking (Security → Authorized IPs) for Render",
  );
}

function formatDate(date) {
  if (!date) return "N/A";
  return new Date(date).toLocaleString("en-IN", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function buildStatusEmailContent(complaint, status) {
  const studentName = complaint.submittedBy || "Student";
  const complaintRef =
    complaint.complaintId || (complaint._id ? String(complaint._id) : "N/A");
  const remarks = complaint.adminRemarks || "No remarks provided.";

  const statusConfig = {
    Resolved: {
      subject: "Your Complaint Has Been Resolved - CCMS",
      headline: "Your complaint has been successfully resolved!",
      statusLabel: "Resolved",
      dateLabel: "Resolved On",
      dateValue: formatDate(complaint.resolvedAt || new Date()),
    },
    Rejected: {
      subject: "Update on Your Complaint - CCMS",
      headline: "Your complaint has been reviewed and rejected.",
      statusLabel: "Rejected",
      dateLabel: "Updated On",
      dateValue: formatDate(new Date()),
    },
    "In Progress": {
      subject: "Your Complaint Is In Progress - CCMS",
      headline: "Work has started on your complaint.",
      statusLabel: "In Progress",
      dateLabel: "Updated On",
      dateValue: formatDate(new Date()),
    },
  };

  const config = statusConfig[status];
  if (!config) return null;

  const textContent = [
    `Dear ${studentName},`,
    "",
    config.headline,
    "",
    "Complaint Details:",
    `- ID: ${complaintRef}`,
    `- Subject: ${complaint.subject}`,
    `- Category: ${complaint.category}`,
    `- Location: ${complaint.location}`,
    `- Submitted: ${formatDate(complaint.submittedAt)}`,
    "",
    "Update Details:",
    `- Status: ${config.statusLabel}`,
    `- ${config.dateLabel}: ${config.dateValue}`,
    `- Admin Remarks: ${remarks}`,
    "",
    "Thank you for using the Campus Complaint Management System.",
    "",
    "Best regards,",
    "University of Lucknow",
    "CCMS Team",
  ].join("\n");

  const htmlContent =
    '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1f2937;">' +
    '<h2 style="color: #4338ca;">Campus Complaint Management System</h2>' +
    `<p>Dear ${studentName},</p>` +
    `<p><strong>${config.headline}</strong></p>` +
    '<h3>Complaint Details</h3><ul>' +
    `<li><strong>ID:</strong> ${complaintRef}</li>` +
    `<li><strong>Subject:</strong> ${complaint.subject}</li>` +
    `<li><strong>Category:</strong> ${complaint.category}</li>` +
    `<li><strong>Location:</strong> ${complaint.location}</li>` +
    `<li><strong>Submitted:</strong> ${formatDate(complaint.submittedAt)}</li>` +
    "</ul><h3>Update Details</h3><ul>" +
    `<li><strong>Status:</strong> ${config.statusLabel}</li>` +
    `<li><strong>${config.dateLabel}:</strong> ${config.dateValue}</li>` +
    `<li><strong>Admin Remarks:</strong> ${remarks}</li>` +
    "</ul>" +
    "<p>Thank you for using the Campus Complaint Management System.</p>" +
    "<p>Best regards,<br/>University of Lucknow<br/>CCMS Team</p></div>";

  return {
    subject: config.subject,
    textContent,
    htmlContent,
  };
}

function shouldFallbackToSmtp(error) {
  const msg = (error && error.message ? error.message : "").toLowerCase();
  return (
    msg.includes("(401)") ||
    msg.includes("(403)") ||
    msg.includes("unauthorized") ||
    msg.includes("not authorized") ||
    msg.includes("ip address") ||
    msg.includes("forbidden")
  );
}

async function sendViaBrevoApi({ to, toName, subject, textContent, htmlContent }) {
  const fromEmail = getFromEmail();
  if (!fromEmail) {
    throw new Error("MAIL_FROM is not set");
  }

  const res = await fetch(BREVO_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "api-key": process.env.BREVO_API_KEY,
    },
    body: JSON.stringify({
      sender: { email: fromEmail, name: getFromName() },
      to: [{ email: to, name: toName || to }],
      subject,
      textContent,
      htmlContent: htmlContent || undefined,
    }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Brevo API failed (${res.status}): ${text}`);
  }

  return { success: true, provider: "brevo-api" };
}

async function sendViaSmtp({ to, subject, textContent, htmlContent }) {
  if (!isSmtpConfigured()) {
    throw new Error("SMTP not configured");
  }

  const fromEmail = getFromEmail();
  if (!fromEmail) {
    throw new Error("MAIL_FROM is not set");
  }

  const transporter = nodemailer.createTransport({
    host: getSmtpHost(),
    port: Number(process.env.SMTP_PORT || 587),
    secure: Number(process.env.SMTP_PORT) === 465,
    family: 4,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  await transporter.sendMail({
    from: `"${getFromName()}" <${fromEmail}>`,
    to,
    subject,
    text: textContent,
    html: htmlContent,
  });

  return { success: true, provider: "smtp" };
}

async function sendEmail({ to, toName, subject, textContent, htmlContent }) {
  const status = getEmailConfigStatus();
  const isProd = process.env.NODE_ENV === "production";

  if (!status.ready) {
    if (isProd) {
      throw new Error(
        `Email not configured: ${status.issues.join("; ")}`,
      );
    }
    console.warn("[email] Skipping send in dev — not configured");
    return { skipped: true, reason: "not_configured" };
  }

  if (isBrevoApiConfigured()) {
    try {
      return await sendViaBrevoApi({
        to,
        toName,
        subject,
        textContent,
        htmlContent,
      });
    } catch (apiError) {
      console.error("[email] Brevo API error:", apiError.message);

      if (isSmtpConfigured() && shouldFallbackToSmtp(apiError)) {
        console.warn(
          "[email] Brevo API blocked (likely IP restriction) — retrying via SMTP",
        );
        return sendViaSmtp({ to, subject, textContent, htmlContent });
      }

      throw apiError;
    }
  }

  return sendViaSmtp({ to, subject, textContent, htmlContent });
}

async function sendComplaintStatusEmail(complaint, status) {
  if (!complaint || !complaint.email) {
    console.warn("[email] Complaint has no recipient email — skipping");
    return { skipped: true, reason: "missing_recipient" };
  }

  if (complaint.isAnonymous) {
    console.info("[email] Anonymous complaint — skipping notification");
    return { skipped: true, reason: "anonymous_complaint" };
  }

  if (!EMAIL_NOTIFY_STATUSES.includes(status)) {
    return { skipped: true, reason: "unsupported_status" };
  }

  const content = buildStatusEmailContent(complaint, status);
  if (!content) {
    return { skipped: true, reason: "unsupported_status" };
  }

  return sendEmail({
    to: complaint.email,
    toName: complaint.submittedBy,
    subject: content.subject,
    textContent: content.textContent,
    htmlContent: content.htmlContent,
  });
}

function notifyComplaintStatusChange(complaint, status) {
  sendComplaintStatusEmail(complaint, status)
    .then((result) => {
      if (result?.success) {
        console.info(
          `[email] Sent ${status} notification to ${complaint.email} via ${result.provider}`,
        );
      }
    })
    .catch((error) => {
      console.error(
        `[email] Failed to send ${status} notification:`,
        error.message,
      );
    });
}

module.exports = {
  EMAIL_NOTIFY_STATUSES,
  getEmailConfigStatus,
  logEmailConfigOnStartup,
  isEmailReady: () => getEmailConfigStatus().ready,
  sendEmail,
  sendComplaintStatusEmail,
  notifyComplaintStatusChange,
};
