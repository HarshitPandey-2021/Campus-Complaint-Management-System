import React from 'react';

const ComplaintTimeline = ({ complaint }) => {
  if (!complaint) return null;

  // Safe destructure with default values
  const {
    timeline = [],
    submittedAt,
    status,
    resolvedAt,
    adminRemarks,
    assignedTo
  } = complaint;

  // Construct simple steps in timeline — customize as needed
  const steps = [];
  if (submittedAt) {
    steps.push({
      label: 'Submitted',
      date: new Date(submittedAt).toLocaleString('en-IN'),
    });
  }
  if (status === "Resolved" && resolvedAt) {
    steps.push({
      label: 'Resolved',
      date: new Date(resolvedAt).toLocaleString('en-IN'),
    });
  }
  if (adminRemarks) {
    steps.push({
      label: 'Admin Remark',
      date: '-', // add a date if available in data
      remark: adminRemarks
    });
  }
  if (assignedTo) {
    steps.push({
      label: 'Assigned To',
      date: '-', // add date if available in data
      remark: assignedTo.name || assignedTo
    });
  }
  // Add custom timeline steps if your data structure has more

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-4">
      <h2 className="font-bold text-lg mb-4 text-gray-800 dark:text-gray-200">Timeline</h2>
      <ul className="space-y-4">
        {steps.map((step, idx) => (
          <li key={idx} className="border-l-4 border-indigo-500 pl-4 relative">
            <span className="font-semibold">{step.label}:</span>{" "}
            {step.date && <span className="ml-2">{step.date}</span>}
            {step.remark && <div className="mt-1 text-gray-500 dark:text-gray-400">{step.remark}</div>}
          </li>
        ))}
        {steps.length === 0 &&
          <li className="text-gray-500 dark:text-gray-400">No timeline events.</li>
        }
      </ul>
    </div>
  );
};

export default ComplaintTimeline;
