import { RiCheckLine, RiTimeLine, RiLoader4Line, RiCloseLine, RiFileAddLine } from 'react-icons/ri';

export default function ComplaintTimeline({ complaint }) {
  // Generate timeline events based on complaint status
  const getTimelineEvents = () => {
    const events = [
      {
        status: 'Submitted',
        icon: RiFileAddLine,
        color: 'blue',
        date: complaint.submittedAt,
        description: `Complaint submitted by ${complaint.submittedBy}`,
        completed: true
      }
    ];

    // Add status progression events
    if (complaint.status === 'Pending') {
      events.push({
        status: 'Pending Review',
        icon: RiTimeLine,
        color: 'blue',
        date: complaint.submittedAt,
        description: 'Waiting for admin action',
        completed: false,
        current: true
      });
    }

    if (complaint.status === 'In Progress' || complaint.status === 'Resolved') {
      events.push({
        status: 'In Progress',
        icon: RiLoader4Line,
        color: 'yellow',
        date: complaint.updatedAt,
        description: complaint.assignedTo ? `Assigned to ${complaint.assignedTo}` : 'Work in progress',
        completed: true
      });
    }

    if (complaint.status === 'Resolved') {
      events.push({
        status: 'Resolved',
        icon: RiCheckLine,
        color: 'green',
        date: complaint.updatedAt,
        description: complaint.adminRemarks || 'Issue resolved',
        completed: true
      });
    }

    if (complaint.status === 'Rejected') {
      events.push({
        status: 'Rejected',
        icon: RiCloseLine,
        color: 'red',
        date: complaint.updatedAt,
        description: complaint.adminRemarks || 'Complaint rejected',
        completed: true
      });
    }

    return events;
  };

  const events = getTimelineEvents();

  const getColorClasses = (color, completed, current) => {
    const colors = {
      blue: completed || current
        ? 'bg-blue-500 text-white'
        : 'bg-gray-200 dark:bg-gray-700 text-gray-400',
      yellow: completed || current
        ? 'bg-yellow-500 text-white'
        : 'bg-gray-200 dark:bg-gray-700 text-gray-400',
      green: completed || current
        ? 'bg-green-500 text-white'
        : 'bg-gray-200 dark:bg-gray-700 text-gray-400',
      red: completed || current
        ? 'bg-red-500 text-white'
        : 'bg-gray-200 dark:bg-gray-700 text-gray-400'
    };
    return colors[color];
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="py-4">
      <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
        Complaint Timeline
      </h4>

      <div className="relative">
        {/* Vertical Line */}
        <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700"></div>

        {/* Timeline Events */}
        <div className="space-y-6">
          {events.map((event, index) => {
            const Icon = event.icon;
            return (
              <div key={index} className="relative flex items-start gap-4">
                {/* Icon Circle */}
                <div
                  className={`relative z-10 flex items-center justify-center w-8 h-8 rounded-full ${getColorClasses(
                    event.color,
                    event.completed,
                    event.current
                  )} ${event.current ? 'ring-4 ring-blue-100 dark:ring-blue-900/30 animate-pulse' : ''}`}
                >
                  <Icon className={`h-4 w-4 ${event.icon === RiLoader4Line && event.current ? 'animate-spin' : ''}`} />
                </div>

                {/* Event Content */}
                <div className="flex-1 pt-0.5">
                  <div className="flex items-center justify-between mb-1">
                    <h5 className={`font-semibold ${
                      event.completed || event.current
                        ? 'text-gray-800 dark:text-gray-200'
                        : 'text-gray-400 dark:text-gray-600'
                    }`}>
                      {event.status}
                      {event.current && (
                        <span className="ml-2 text-xs font-normal text-blue-600 dark:text-blue-400">
                          (Current)
                        </span>
                      )}
                    </h5>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {formatDate(event.date)}
                    </span>
                  </div>
                  <p className={`text-sm ${
                    event.completed || event.current
                      ? 'text-gray-600 dark:text-gray-400'
                      : 'text-gray-400 dark:text-gray-600'
                  }`}>
                    {event.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}