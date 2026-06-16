const nodemailer = require("nodemailer");

const BREVO_API_URL = "https://api.brevo.com/v3/smtp/email";

const EMAIL_NOTIFY_STATUSES = ["In Progress", "Resolved", "Rejected"];

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
  const complaintRef = complaint.complaintId || complaint._id?.toString() || "N/A";
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

async function sendEmail({ to, toName, subject, textContent, htmlContent }) {
  const {
    BREVO_API_KEY,
    SMTP_HOST,
    SMTP_PORT,
    SMTP_USER,
    SMTP_PASS,
    MAIL_FROM,
    NODE_ENV,
  } = process.env;

  const fromEmail = MAIL_FROM || "no-reply@ccms.com";
  const fromName = process.env.MAIL_FROM_NAME || "CCMS";

  if (BREVO_API_KEY) {
    const res = await fetch(BREVO_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": BREVO_API_KEY,
      },
      body: JSON.stringify({
        sender: { email: fromEmail, name: fromName },
        to: [{ email: to, name: toName || to }],
        subject,
        textContent,
        htmlContent: htmlContent || undefined,
      }),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(`Brevo email send failed (${res.status}): ${text}`);
    }

    return { success: true, provider: "brevo" };
  }

  const smtpConfigured = SMTP_HOST && SMTP_USER && SMTP_PASS;
  if (!smtpConfigured) {
    if (NODE_ENV === "production") {
      throw new Error("No email provider configured (BREVO_API_KEY or SMTP)");
    }
    console.warn("[email] No provider configured — skipping send (dev only)");
    return { skipped: true, reason: "no_provider" };
  }

  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT || 587),
    secure: Number(SMTP_PORT) === 465,
    family: 4,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });

  await transporter.sendMail({
    from: fromEmail,
    to,
    subject,
    text: textContent,
    html: htmlContent,
  });

  return { success: true, provider: "smtp" };
}

async function sendComplaintStatusEmail(complaint, status) {
  if (!complaint?.email) {
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
  sendEmail,
  sendComplaintStatusEmail,
  notifyComplaintStatusChange,
};
