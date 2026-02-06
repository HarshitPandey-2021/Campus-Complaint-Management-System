// src/utils/exportUtils.js - PROFESSIONAL EXPORT SYSTEM

/**
 * Safely convert any value to string, handling null/undefined
 */
const safe = (value) => {
  if (value == null || value === undefined) return "";
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value).trim();
};

/**
 * Escape quotes for CSV format
 */
const escapeCSV = (value) => {
  const str = safe(value);
  // Remove any potential tokens or sensitive data patterns
  const cleaned = str
    .replace(/Bearer\s+[\w-]+\.[\w-]+\.[\w-]+/gi, '[TOKEN REMOVED]')
    .replace(/eyJ[\w-]+\.[\w-]+\.[\w-]+/g, '[TOKEN REMOVED]')
    .replace(/\r?\n/g, ' ') // Replace newlines with spaces
    .replace(/\s+/g, ' '); // Normalize whitespace
  
  return `"${cleaned.replace(/"/g, '""')}"`;
};

/**
 * Safely escape HTML to prevent XSS
 */
const escapeHTML = (value) => {
  const str = safe(value);
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
    .replace(/Bearer\s+[\w-]+\.[\w-]+\.[\w-]+/gi, '[TOKEN REMOVED]')
    .replace(/eyJ[\w-]+\.[\w-]+\.[\w-]+/g, '[TOKEN REMOVED]');
};

/**
 * Format date consistently
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
      hour12: true
    });
  } catch {
    return "Invalid Date";
  }
};

/**
 * Format date for CSV (compact)
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
      minute: "2-digit"
    });
  } catch {
    return "Invalid Date";
  }
};

/**
 * Get status badge class for print styling
 */
const getStatusClass = (status) => {
  const statusStr = safe(status).toLowerCase().replace(/\s+/g, '');
  switch (statusStr) {
    case 'pending':
      return 'status-pending';
    case 'inprogress':
      return 'status-inprogress';
    case 'resolved':
      return 'status-resolved';
    case 'rejected':
      return 'status-rejected';
    default:
      return 'status-default';
  }
};

/**
 * Get priority badge class for print styling
 */
const getPriorityClass = (priority) => {
  const priorityStr = safe(priority).toLowerCase();
  if (priorityStr.includes('high') || priorityStr.includes('urgent')) {
    return 'priority-high';
  } else if (priorityStr.includes('medium')) {
    return 'priority-medium';
  } else if (priorityStr.includes('low')) {
    return 'priority-low';
  }
  return 'priority-default';
};

/**
 * Export complaints to CSV
 */
export const exportToCSV = (complaints, filename = null) => {
  if (!Array.isArray(complaints) || complaints.length === 0) {
    alert("❌ No complaints to export");
    return;
  }

  // Generate filename with timestamp
  const timestamp = new Date().toISOString().split('T')[0];
  const finalFilename = filename || `CCMS_Complaints_${timestamp}.csv`;

  // CSV Headers
  const headers = [
    "Complaint ID",
    "Title/Subject",
    "Category",
    "Location",
    "Status",
    "Priority",
    "Submitted By",
    "Email",
    "Phone",
    "Is Anonymous",
    "Submitted Date",
    "Description",
    "Admin Remarks",
    "Last Updated"
  ];

  // CSV Rows
  const rows = complaints.map((complaint) => {
    return [
      safe(complaint._id || complaint.id || complaint.complaintId || "N/A"),
      escapeCSV(complaint.title || complaint.subject || "Untitled"),
      escapeCSV(complaint.category || "General"),
      escapeCSV(complaint.location || "Not Specified"),
      safe(complaint.status || "Pending"),
      safe(complaint.priority || "Medium"),
      escapeCSV(complaint.isAnonymous ? "Anonymous" : (complaint.submittedBy || complaint.name || "Unknown")),
      escapeCSV(complaint.isAnonymous ? "Hidden" : (complaint.email || "N/A")),
      escapeCSV(complaint.isAnonymous ? "Hidden" : (complaint.phone || "N/A")),
      safe(complaint.isAnonymous ? "Yes" : "No"),
      formatDateCompact(complaint.createdAt || complaint.submittedAt || complaint.date),
      escapeCSV(complaint.description || "No description provided"),
      escapeCSV(complaint.adminRemarks || complaint.remarks || "No remarks"),
      formatDateCompact(complaint.updatedAt || complaint.createdAt)
    ];
  });

  // Combine headers and rows
  const csvContent = [
    headers.join(","),
    ...rows.map((row) => row.join(","))
  ].join("\n");

  // Add BOM for Excel UTF-8 support
  const BOM = "\uFEFF";
  const blob = new Blob([BOM + csvContent], {
    type: "text/csv;charset=utf-8;"
  });

  // Create download link
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);

  link.setAttribute("href", url);
  link.setAttribute("download", finalFilename);
  link.style.visibility = "hidden";

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  console.log(`✅ Exported ${complaints.length} complaints to ${finalFilename}`);
};

/**
 * Export complaints to professional print view
 */
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
    minute: "2-digit"
  });

  // Count statistics
  const stats = {
    total: complaints.length,
    pending: complaints.filter(c => (c.status || '').toLowerCase() === 'pending').length,
    inProgress: complaints.filter(c => (c.status || '').toLowerCase().includes('progress')).length,
    resolved: complaints.filter(c => (c.status || '').toLowerCase() === 'resolved').length,
    rejected: complaints.filter(c => (c.status || '').toLowerCase() === 'rejected').length
  };

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>CCMS Complaints Report - ${reportDate}</title>
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }

          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            padding: 30px;
            background: #f9fafb;
            color: #1f2937;
            line-height: 1.6;
          }

          .container {
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            padding: 40px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            border-radius: 8px;
          }

          .header {
            border-bottom: 3px solid #4F46E5;
            padding-bottom: 20px;
            margin-bottom: 30px;
            display: flex;
            justify-content: space-between;
            align-items: center;
          }

          .header-left h1 {
            color: #4F46E5;
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
            background: linear-gradient(135deg, #4F46E5, #7C3AED);
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: bold;
            font-size: 24px;
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
            background: #4F46E5;
            color: white;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            font-size: 16px;
            font-weight: 600;
            margin-bottom: 20px;
            transition: background 0.2s;
          }

          .print-button:hover {
            background: #4338CA;
          }

          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
            font-size: 13px;
          }

          thead {
            background: #4F46E5;
            color: white;
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
              background: white;
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
          }

          @page {
            margin: 1cm;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <!-- Header -->
          <div class="header">
            <div class="header-left">
              <h1>🎓 CCMS Complaints Report</h1>
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
          <button class="print-button" onclick="window.print()">
            🖨️ Print Report
          </button>

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
                  const id = safe(complaint._id || complaint.id || complaint.complaintId || index + 1).slice(-8);
                  const title = escapeHTML(complaint.title || complaint.subject || "Untitled");
                  const category = escapeHTML(complaint.category || "General");
                  const status = safe(complaint.status || "Pending");
                  const priority = safe(complaint.priority || "Medium");
                  const submittedBy = escapeHTML(
                    complaint.isAnonymous 
                      ? "Anonymous 🕵️" 
                      : (complaint.submittedBy || complaint.name || "Unknown")
                  );
                  const date = formatDate(complaint.createdAt || complaint.submittedAt || complaint.date);

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
                        <span class="badge ${getStatusClass(status)}">${status}</span>
                      </td>
                      <td>
                        <span class="badge ${getPriorityClass(priority)}">${priority}</span>
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
            <p>University of Lucknow | Admin Panel | Confidential Report</p>
            <p>This document is generated electronically and contains ${stats.total} complaint records.</p>
          </div>
        </div>

        <script>
          // Auto-focus print button
          document.querySelector('.print-button').focus();
        </script>
      </body>
    </html>
  `;

  const printWindow = window.open("", "_blank", "width=1200,height=800");
  
  if (!printWindow) {
    alert("⚠️ Popup blocked! Please allow popups for this site to print reports.");
    return;
  }

  printWindow.document.write(htmlContent);
  printWindow.document.close();
  
  // Wait for content to load before focusing
  printWindow.onload = () => {
    printWindow.focus();
  };

  console.log(`✅ Print preview opened with ${complaints.length} complaints`);
};

/**
 * Export activity logs to CSV
 */
export const exportActivityLogsToCSV = (logs, filename = null) => {
  if (!Array.isArray(logs) || logs.length === 0) {
    alert("❌ No activity logs to export");
    return;
  }

  const timestamp = new Date().toISOString().split('T')[0];
  const finalFilename = filename || `CCMS_Activity_Logs_${timestamp}.csv`;

  const headers = [
    "Log ID",
    "Timestamp",
    "Activity Type",
    "Admin Name",
    "Admin Email",
    "Action",
    "Page",
    "Session ID",
    "Platform",
    "Screen Size"
  ];

  const rows = logs.map((log) => {
    return [
      safe(log.id || "N/A"),
      formatDateCompact(log.timestamp),
      safe(log.type || "UNKNOWN"),
      escapeCSV(log.admin?.name || "Unknown"),
      escapeCSV(log.admin?.email || "N/A"),
      escapeCSV(log.details?.action || "N/A"),
      escapeCSV(log.details?.page || "N/A"),
      safe(log.sessionId || "N/A"),
      safe(log.device?.platform || "N/A"),
      safe(log.device?.screenSize || "N/A")
    ];
  });

  const csvContent = [
    headers.join(","),
    ...rows.map((row) => row.join(","))
  ].join("\n");

  const BOM = "\uFEFF";
  const blob = new Blob([BOM + csvContent], {
    type: "text/csv;charset=utf-8;"
  });

  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);

  link.setAttribute("href", url);
  link.setAttribute("download", finalFilename);
  link.style.visibility = "hidden";

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  console.log(`✅ Exported ${logs.length} activity logs to ${finalFilename}`);
};