// src/utils/exportUtils.js
// Export complaints to CSV and print view (no sensitive token usage)

export const exportToCSV = (complaints, filename = "complaints.csv") => {
  if (!Array.isArray(complaints) || complaints.length === 0) {
    alert("No complaints to export");
    return;
  }

  const safe = (value) => (value == null ? "" : String(value));
  const escapeQuotes = (value) =>
    `"${safe(value).replace(/"/g, '""')}"`;

  const headers = [
    "ID",
    "Subject",
    "Category",
    "Location",
    "Status",
    "Priority",
    "Submitted By",
    "Email",
    "Submitted At",
    "Description",
    "Admin Remarks",
    "Updated At",
  ];

  const rows = complaints.map((complaint) => {
    const submittedAt = complaint.submittedAt
      ? new Date(complaint.submittedAt).toLocaleString()
      : "";
    const updatedAt = complaint.updatedAt
      ? new Date(complaint.updatedAt).toLocaleString()
      : "";

    return [
      safe(complaint.id || complaint.complaintId),
      escapeQuotes(complaint.subject || complaint.title),
      safe(complaint.category),
      escapeQuotes(complaint.location),
      safe(complaint.status),
      safe(complaint.priority),
      safe(complaint.submittedBy),
      safe(complaint.email),
      submittedAt,
      escapeQuotes(complaint.description),
      complaint.adminRemarks ? escapeQuotes(complaint.adminRemarks) : "",
      updatedAt,
    ];
  });

  const csvContent = [
    headers.join(","),
    ...rows.map((row) => row.join(",")),
  ].join("\n");

  const blob = new Blob([csvContent], {
    type: "text/csv;charset=utf-8;",
  });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);

  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.style.visibility = "hidden";

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const exportToPrint = (complaints) => {
  if (!Array.isArray(complaints) || complaints.length === 0) {
    alert("No complaints to print");
    return;
  }

  const safe = (value) => (value == null ? "" : String(value));
  const safeStatusClass = (status) =>
    safe(status).toLowerCase().replace(/\s+/g, "");

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>CCMS Complaints Report</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            padding: 20px;
          }
          h1 {
            color: #4F46E5;
            border-bottom: 2px solid #4F46E5;
            padding-bottom: 10px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
          }
          th, td {
            border: 1px solid #ddd;
            padding: 12px;
            text-align: left;
          }
          th {
            background-color: #4F46E5;
            color: white;
          }
          tr:nth-child(even) {
            background-color: #f9fafb;
          }
          .badge {
            display: inline-block;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 12px;
            font-weight: bold;
          }
          .badge-pending { background-color: #60A5FA; color: white; }
          .badge-inprogress { background-color: #F59E0B; color: black; }
          .badge-resolved { background-color: #10B981; color: white; }
          .badge-rejected { background-color: #EF4444; color: white; }
          @media print {
            button { display: none; }
          }
        </style>
      </head>
      <body>
        <h1>CCMS Complaints Report</h1>
        <p>Generated on: ${new Date().toLocaleString()}</p>
        <p>Total Complaints: ${complaints.length}</p>
        
        <button onclick="window.print()" style="padding: 10px 20px; background: #4F46E5; color: white; border: none; border-radius: 5px; cursor: pointer; margin-bottom: 20px;">
          Print Report
        </button>
        
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Subject</th>
              <th>Category</th>
              <th>Status</th>
              <th>Priority</th>
              <th>Submitted</th>
            </tr>
          </thead>
          <tbody>
            ${complaints
              .map((c) => {
                const status = safe(c.status);
                const statusClass = safeStatusClass(status);
                const submittedDate = c.submittedAt
                  ? new Date(c.submittedAt).toLocaleDateString()
                  : "";
                return `
                  <tr>
                    <td>#${safe(c.id || c.complaintId)}</td>
                    <td>${safe(c.subject || c.title)}</td>
                    <td>${safe(c.category)}</td>
                    <td>
                      <span class="badge badge-${statusClass}">${status}</span>
                    </td>
                    <td>${safe(c.priority)}</td>
                    <td>${submittedDate}</td>
                  </tr>
                `;
              })
              .join("")}
          </tbody>
        </table>
      </body>
    </html>
  `;

  const printWindow = window.open("", "_blank");
  if (!printWindow) {
    alert("Popup blocked. Please allow popups for this site.");
    return;
  }

  printWindow.document.write(htmlContent);
  printWindow.document.close();
};
