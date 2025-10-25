// src/utils/exportUtils.js

export const exportToCSV = (complaints, filename = 'complaints.csv') => {
  // Define CSV headers
  const headers = [
    'ID',
    'Subject',
    'Category',
    'Location',
    'Status',
    'Priority',
    'Submitted By',
    'Email',
    'Submitted At',
    'Description',
    'Admin Remarks',
    'Updated At'
  ];

  // Convert complaints to CSV rows
  const rows = complaints.map(complaint => [
    complaint.id,
    `"${complaint.subject.replace(/"/g, '""')}"`, // Escape quotes
    complaint.category,
    `"${complaint.location.replace(/"/g, '""')}"`,
    complaint.status,
    complaint.priority,
    complaint.submittedBy,
    complaint.email,
    new Date(complaint.submittedAt).toLocaleString(),
    `"${complaint.description.replace(/"/g, '""')}"`,
    complaint.adminRemarks ? `"${complaint.adminRemarks.replace(/"/g, '""')}"` : '',
    new Date(complaint.updatedAt).toLocaleString()
  ]);

  // Combine headers and rows
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n');

  // Create blob and download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const exportToPrint = (complaints) => {
  const printWindow = window.open('', '_blank');
  
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
          .badge-progress { background-color: #F59E0B; color: black; }
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
            ${complaints.map(c => `
              <tr>
                <td>#${c.id}</td>
                <td>${c.subject}</td>
                <td>${c.category}</td>
                <td>
                  <span class="badge badge-${c.status.toLowerCase().replace(' ', '')}">${c.status}</span>
                </td>
                <td>${c.priority}</td>
                <td>${new Date(c.submittedAt).toLocaleDateString()}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </body>
    </html>
  `;
  
  printWindow.document.write(htmlContent);
  printWindow.document.close();
};