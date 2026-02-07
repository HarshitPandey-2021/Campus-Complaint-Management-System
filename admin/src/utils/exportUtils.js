// src/utils/exportUtils.js - PROFESSIONAL EXPORT SYSTEM

/**
 * Safely convert any value to string, handling null/undefined
 */
const safe = (value) => {
  if (value == null || value === undefined) return "";
  if (typeof value === "object") return JSON.stringify(value);
  return String(value).trim();
};

/**
 * Safely escape HTML to prevent XSS
 */
const escapeHTML = (value) => {
  const str = safe(value);

  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;")
    .replace(/Bearer\s+[\w-]+\.[\w-]+\.[\w-]+/gi, "[TOKEN REMOVED]")
    .replace(/eyJ[\w-]+\.[\w-]+\.[\w-]+/g, "[TOKEN REMOVED]");
};

/**
 * Format date for UI (readable)
 */
const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "Invalid Date";

    return date.toLocaleString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  } catch {
    return "Invalid Date";
  }
};

/**
 * Format date for Excel (YYYY-MM-DD HH:mm)
 */
const formatDateExcel = (dateString) => {
  if (!dateString) return "";
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "";
    return (
      date.toISOString().slice(0, 10) +
      " " +
      date.toTimeString().slice(0, 5)
    );
  } catch {
    return "";
  }
};

/**
 * Old compact format (if needed somewhere else)
 */
const formatDateCompact = (dateString) => {
  if (!dateString) return "N/A";
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "Invalid Date";

    return date.toLocaleString("en-IN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "Invalid Date";
  }
};

/**
 * Get status badge class for print styling
 */
const getStatusClass = (status) => {
  const statusStr = safe(status).toLowerCase().replace(/\s+/g, "");
  switch (statusStr) {
    case "pending":
      return "status-pending";
    case "inprogress":
      return "status-inprogress";
    case "resolved":
      return "status-resolved";
    case "rejected":
      return "status-rejected";
    default:
      return "status-default";
  }
};

/**
 * Get priority badge class for print styling
 */
const getPriorityClass = (priority) => {
  const priorityStr = safe(priority).toLowerCase();

  if (priorityStr.includes("high") || priorityStr.includes("urgent")) {
    return "priority-high";
  } else if (priorityStr.includes("medium")) {
    return "priority-medium";
  } else if (priorityStr.includes("low")) {
    return "priority-low";
  }

  return "priority-default";
};

/* ================================================================== */
/*   EXPORT TO EXCEL AS TABLE (PROPER SPACING)                        */
/* ================================================================== */

/**
 * Lazy-load SheetJS XLSX from CDN
 */
const ensureXLSX = () =>
  new Promise((resolve, reject) => {
    if (typeof XLSX !== "undefined") return resolve();
    const script = document.createElement("script");
    script.src =
      "https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js";
    script.onload = () => resolve();
    script.onerror = () =>
      reject(new Error("Failed to load XLSX library from CDN"));
    document.head.appendChild(script);
  });

/**
 * Export complaints to Excel with proper column spacing
 */
export const exportToExcel = async (complaints, filename = null) => {
  if (!Array.isArray(complaints) || complaints.length === 0) {
    alert("❌ No complaints to export");
    return;
  }

  await ensureXLSX();

  const timestamp = new Date().toISOString().split("T")[0];
  const finalFilename = filename || `CCMS_Complaints_${timestamp}.xlsx`;

  const now = new Date();
  const reportDate = now.toLocaleString("en-IN", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const stats = {
    total: complaints.length,
    pending: complaints.filter(
      (c) => (c.status || "").toLowerCase() === "pending"
    ).length,
    inProgress: complaints.filter(
      (c) => (c.status || "").toLowerCase().includes("progress")
    ).length,
    resolved: complaints.filter(
      (c) => (c.status || "").toLowerCase() === "resolved"
    ).length,
    rejected: complaints.filter(
      (c) => (c.status || "").toLowerCase() === "rejected"
    ).length,
  };

  // Title + stats rows
  const worksheet = XLSX.utils.aoa_to_sheet([
    [`CCMS Complaints Report - ${reportDate}`, "", "", "", "", "", ""],
    [],
    [
      `Total: ${stats.total} | Pending: ${stats.pending} | In Progress: ${stats.inProgress} | Resolved: ${stats.resolved} | Rejected: ${stats.rejected}`,
      "",
      "",
      "",
      "",
      "",
      "",
    ],
    [],
  ]);

  // Merge cells for title + stats
  worksheet["!merges"] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: 6 } },
    { s: { r: 2, c: 0 }, e: { r: 2, c: 6 } },
  ];

  // Table headers (7 columns – same as sheetAdd below)
  const headers = [
    "ID",
    "Title",
    "Category",
    "Status",
    "Priority",
    "Submitted By",
    "Date",
  ];

  XLSX.utils.sheet_add_aoa(worksheet, [headers], { origin: "A5" });

  // Data rows
  complaints.forEach((complaint, index) => {
    const id =
      safe(
        complaint._id || complaint.id || complaint.complaintId || ""
      ) || index + 1;
    const title = safe(complaint.title || complaint.subject || "Untitled");
    const category = safe(complaint.category || "General");
    const status = safe(complaint.status || "Pending");
    const priority = safe(complaint.priority || "Medium");
    const submittedBy = safe(
      complaint.isAnonymous
        ? "Anonymous"
        : complaint.submittedBy || complaint.name || "Unknown"
    );
    const date = formatDateExcel(
      complaint.createdAt || complaint.submittedAt || complaint.date
    );

    const rowData = [id, title, category, status, priority, submittedBy, date];

    XLSX.utils.sheet_add_aoa(worksheet, [rowData], {
      origin: `A${index + 6}`,
    });
  });

  // Column widths (for better spacing in Excel)
  worksheet["!cols"] = [
    { wch: 10 }, // ID
    { wch: 30 }, // Title
    { wch: 18 }, // Category
    { wch: 14 }, // Status
    { wch: 12 }, // Priority
    { wch: 20 }, // Submitted By
    { wch: 20 }, // Date
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Complaints");
  XLSX.writeFile(workbook, finalFilename);

  console.log(`✅ Exported ${complaints.length} complaints to ${finalFilename}`);
};

/* ================================================================== */
/*   PROFESSIONAL PRINT VIEW (WITH BEAUTIFUL STYLING)                 */
/* ================================================================== */

export const exportToPrint = (complaints) => {
  if (!Array.isArray(complaints) || complaints.length === 0) {
    alert("❌ No complaints to print");
    return;
  }

  const now = new Date();
  const reportDate = now.toLocaleString("en-IN", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const stats = {
    total: complaints.length,
    pending: complaints.filter(
      (c) => (c.status || "").toLowerCase() === "pending"
    ).length,
    inProgress: complaints.filter(
      (c) => (c.status || "").toLowerCase().includes("progress")
    ).length,
    resolved: complaints.filter(
      (c) => (c.status || "").toLowerCase() === "resolved"
    ).length,
    rejected: complaints.filter(
      (c) => (c.status || "").toLowerCase() === "rejected"
    ).length,
  };

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>CCMS Complaints Report - ${reportDate}</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        body {
          font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
          padding: 30px;
          background: #f9fafb;
          color: #1f2937;
          line-height: 1.6;
        }
        .container {
          max-width: 1200px;
          margin: 0 auto;
          background: #ffffff;
          padding: 40px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          border-radius: 8px;
        }
        .header {
          border-bottom: 3px solid #4f46e5;
          padding-bottom: 20px;
          margin-bottom: 30px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .header-left h1 {
          color: #4f46e5;
          font-size: 28px;
          font-weight: bold;
          margin-bottom: 5px;
        }
        .header-left p {
          color: #6b7280;
          font-size: 14px;
        }
        .header-right {
          text-align: right;
        }
        .logo {
          width: 60px;
          height: 60px;
          background: linear-gradient(135deg, #4f46e5, #7c3aed);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #ffffff;
          font-weight: bold;
          font-size: 24px;
          margin-left: auto;
        }
        .meta-info {
          background: #f3f4f6;
          padding: 20px;
          border-radius: 8px;
          margin-bottom: 30px;
        }
        .meta-info p {
          margin-bottom: 5px;
          font-size: 14px;
        }
        .meta-info strong {
          color: #1f2937;
        }
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 15px;
          margin-bottom: 30px;
        }
        .stat-card {
          padding: 15px;
          border-radius: 8px;
          text-align: center;
          border: 2px solid #e5e7eb;
        }
        .stat-card.total {
          background: #ede9fe;
          border-color: #a78bfa;
        }
        .stat-card.pending {
          background: #fef3c7;
          border-color: #fbbf24;
        }
        .stat-card.inprogress {
          background: #dbeafe;
          border-color: #60a5fa;
        }
        .stat-card.resolved {
          background: #d1fae5;
          border-color: #34d399;
        }
        .stat-card.rejected {
          background: #fee2e2;
          border-color: #f87171;
        }
        .stat-card h3 {
          font-size: 12px;
          text-transform: uppercase;
          color: #6b7280;
          margin-bottom: 5px;
        }
        .stat-card .number {
          font-size: 28px;
          font-weight: bold;
          color: #1f2937;
        }
        .print-button {
          padding: 12px 24px;
          background: #4f46e5;
          color: #ffffff;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-size: 16px;
          font-weight: 600;
          margin-bottom: 20px;
          transition: background 0.2s;
        }
        .print-button:hover {
          background: #4338ca;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 20px;
          font-size: 13px;
        }
        thead {
          background: #4f46e5;
          color: #ffffff;
        }
        th {
          padding: 14px 12px;
          text-align: left;
          font-weight: 600;
          text-transform: uppercase;
          font-size: 11px;
          letter-spacing: 0.5px;
        }
        td {
          padding: 12px;
          border-bottom: 1px solid #e5e7eb;
          vertical-align: top;
        }
        tbody tr:hover {
          background: #f9fafb;
        }
        .badge {
          display: inline-block;
          padding: 4px 10px;
          border-radius: 12px;
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.3px;
        }
        .status-pending {
          background: #fef3c7;
          color: #92400e;
        }
        .status-inprogress {
          background: #dbeafe;
          color: #1e40af;
        }
        .status-resolved {
          background: #d1fae5;
          color: #065f46;
        }
        .status-rejected {
          background: #fee2e2;
          color: #991b1b;
        }
        .status-default {
          background: #f3f4f6;
          color: #4b5563;
        }
        .priority-high {
          background: #fee2e2;
          color: #991b1b;
        }
        .priority-medium {
          background: #fef3c7;
          color: #92400e;
        }
        .priority-low {
          background: #d1fae5;
          color: #065f46;
        }
        .priority-default {
          background: #f3f4f6;
          color: #4b5563;
        }
        .text-truncate {
          max-width: 250px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .footer {
          margin-top: 40px;
          padding-top: 20px;
          border-top: 2px solid #e5e7eb;
          text-align: center;
          color: #6b7280;
          font-size: 12px;
        }
        @media print {
          body {
            background: #ffffff;
            padding: 0;
          }
          .container {
            box-shadow: none;
            padding: 20px;
          }
          .print-button {
            display: none;
          }
          .stats-grid {
            page-break-inside: avoid;
          }
          table {
            page-break-inside: auto;
          }
          tr {
            page-break-inside: avoid;
            page-break-after: auto;
          }
          thead {
            display: table-header-group;
          }
          .footer {
            page-break-before: avoid;
          }
          @page {
            margin: 1cm;
          }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <!-- Header -->
        <div class="header">
          <div class="header-left">
            <h1>CCMS Complaints Report</h1>
            <p>Campus Complaint Management System - University of Lucknow</p>
          </div>
          <div class="header-right">
            <div class="logo">UL</div>
          </div>
        </div>

        <!-- Meta Info -->
        <div class="meta-info">
          <p><strong>Report Generated:</strong> ${reportDate}</p>
          <p><strong>Total Complaints:</strong> ${stats.total}</p>
          <p><strong>Generated By:</strong> Admin Panel Export</p>
        </div>

        <!-- Statistics -->
        <div class="stats-grid">
          <div class="stat-card total">
            <h3>Total</h3>
            <div class="number">${stats.total}</div>
          </div>
          <div class="stat-card pending">
            <h3>Pending</h3>
            <div class="number">${stats.pending}</div>
          </div>
          <div class="stat-card inprogress">
            <h3>In Progress</h3>
            <div class="number">${stats.inProgress}</div>
          </div>
          <div class="stat-card resolved">
            <h3>Resolved</h3>
            <div class="number">${stats.resolved}</div>
          </div>
          <div class="stat-card rejected">
            <h3>Rejected</h3>
            <div class="number">${stats.rejected}</div>
          </div>
        </div>

        <!-- Print Button -->
        <button class="print-button" onclick="window.print()">Print Report</button>

        <!-- Complaints Table -->
        <table>
          <thead>
            <tr>
              <th style="width: 80px;">ID</th>
              <th style="width: 250px;">Title</th>
              <th style="width: 120px;">Category</th>
              <th style="width: 100px;">Status</th>
              <th style="width: 100px;">Priority</th>
              <th style="width: 120px;">Submitted By</th>
              <th style="width: 150px;">Date</th>
            </tr>
          </thead>
          <tbody>
            ${complaints
              .map((complaint, index) => {
                const id =
                  safe(
                    complaint._id ||
                      complaint.id ||
                      complaint.complaintId ||
                      ""
                  ) || index + 1;
                const title = escapeHTML(
                  complaint.title ||
                    complaint.subject ||
                    "Untitled"
                );
                const category = escapeHTML(
                  complaint.category || "General"
                );
                const status = safe(complaint.status || "Pending");
                const priority = safe(
                  complaint.priority || "Medium"
                );
                const submittedBy = escapeHTML(
                  complaint.isAnonymous
                    ? "Anonymous"
                    : complaint.submittedBy ||
                        complaint.name ||
                        "Unknown"
                );
                const date = formatDate(
                  complaint.createdAt ||
                    complaint.submittedAt ||
                    complaint.date
                );

                return `
                  <tr>
                    <td><strong>#${id}</strong></td>
                    <td>
                      <div class="text-truncate" title="${title}">
                        ${title}
                      </div>
                    </td>
                    <td>${category}</td>
                    <td>
                      <span class="badge ${getStatusClass(
                        status
                      )}">${status}</span>
                    </td>
                    <td>
                      <span class="badge ${getPriorityClass(
                        priority
                      )}">${priority}</span>
                    </td>
                    <td>${submittedBy}</td>
                    <td style="font-size: 11px;">${date}</td>
                  </tr>
                `;
              })
              .join("")}
          </tbody>
        </table>

        <!-- Footer -->
        <div class="footer">
          <p><strong>Campus Complaint Management System (CCMS)</strong></p>
          <p>University of Lucknow - Admin Panel Confidential Report</p>
          <p>
            This document is generated electronically and contains
            ${stats.total} complaint records.
          </p>
        </div>
      </div>
      <script>
        document.querySelector(".print-button")?.focus();
      </script>
    </body>
    </html>
  `;

  const printWindow = window.open("", "_blank", "width=1200,height=800");
  if (!printWindow) {
    alert(
      "Popup blocked! Please allow popups for this site to print reports."
    );
    return;
  }

  printWindow.document.write(htmlContent);
  printWindow.document.close();

  printWindow.onload = () => {
    printWindow.focus();
  };

  console.log(
    `🖨️ Print preview opened with ${complaints.length} complaints`
  );
};
