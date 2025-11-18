// src/components/user/ComplaintTimeline.jsx

import React from 'react';
import { 
  RiCheckboxCircleLine, 
  RiTimeLine, 
  RiLoader4Line, 
  RiCloseLine,
  RiSendPlaneFill 
} from 'react-icons/ri';

const ComplaintTimeline = ({ complaint }) => {
  const getTimelineSteps = () => {
    const steps = [
      {
        status: 'Submitted',
        icon: RiSendPlaneFill,
        color: 'blue',
        date: complaint.submittedAt,
        completed: true,
        description: 'Complaint submitted successfully'
      }
    ];

    if (complaint.status === 'Pending') {
      steps.push({
        status: 'Pending Review',
        icon: RiTimeLine,
        color: 'yellow',
        date: null,
        completed: false,
        current: true,
        description: 'Waiting for admin to review and assign'
      });
    }

    if (complaint.status === 'In Progress' || complaint.status === 'Resolved') {
      steps.push({
        status: 'In Progress',
        icon: RiLoader4Line,
        color: 'orange',
        date: complaint.assignedAt || new Date(),
        completed: complaint.status === 'Resolved',
        current: complaint.status === 'In Progress',
        description: complaint.assignedTo ? `Assigned to ${complaint.assignedTo}` : 'Being worked on'
      });
    }

    if (complaint.status === 'Resolved') {
      steps.push({
        status: 'Resolved',
        icon: RiCheckboxCircleLine,
        color: 'green',
        date: complaint.resolvedAt || new Date(),
        completed: true,
        description: 'Complaint resolved successfully'
      });
    }

    if (complaint.status === 'Rejected') {
      steps.push({
        status: 'Rejected',
        icon: RiCloseLine,
        color: 'red',
        date: complaint.rejectedAt || new Date(),
        completed: true,
        description: complaint.adminRemarks || 'Complaint was rejected'
      });
    }

    return steps;
  };

  const steps = getTimelineSteps();

  const getColorClasses = (color, completed, current) => {
    if (completed) {
      const colors = {
        blue: 'bg-blue-500 text-white',
        yellow: 'bg-yellow-500 text-white',
        orange: 'bg-orange-500 text-white',
        green: 'bg-green-500 text-white',
        red: 'bg-red-500 text-white'
      };
      return colors[color];
    }
    if (current) {
      const colors = {
        yellow: 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400 animate-pulse',
        orange: 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400 animate-pulse'
      };
      return colors[color];
    }
    return 'bg-gray-200 text-gray-400 dark:bg-gray-700 dark:text-gray-500';
  };

  return (
    <div className="space-y-6">
      {steps.map((step, index) => {
        const Icon = step.icon;
        const isLast = index === steps.length - 1;

        return (
          <div key={index} className="relative flex gap-4 animate-slideDown" style={{ animationDelay: `${index * 0.1}s` }}>
            {/* Timeline Line */}
            {!isLast && (
              <div className={`absolute left-6 top-14 bottom-0 w-0.5 ${
                steps[index + 1].completed || steps[index + 1].current
                  ? 'bg-gradient-to-b from-indigo-500 to-purple-500'
                  : 'bg-gray-300 dark:bg-gray-600'
              }`} />
            )}

            {/* Icon */}
            <div className={`relative z-10 flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${
              getColorClasses(step.color, step.completed, step.current)
            } shadow-lg transition-all duration-300 ${
              step.current ? 'ring-4 ring-yellow-200 dark:ring-yellow-900/50 scale-110' : ''
            }`}>
              <Icon className={`h-6 w-6 ${step.icon === RiLoader4Line && step.current ? 'animate-spin' : ''}`} />
            </div>

            {/* Content */}
            <div className="flex-1 pb-8">
              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all">
                <div className="flex items-start justify-between mb-2">
                  <h3 className={`font-bold text-lg ${
                    step.completed
                      ? 'text-gray-800 dark:text-gray-200'
                      : step.current
                      ? 'text-yellow-600 dark:text-yellow-400'
                      : 'text-gray-400 dark:text-gray-500'
                  }`}>
                    {step.status}
                  </h3>
                  {step.date && (
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date(step.date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {step.description}
                </p>
                {step.current && (
                  <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                    <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                      <RiTimeLine className="h-4 w-4 animate-pulse" />
                      Current status
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ComplaintTimeline;