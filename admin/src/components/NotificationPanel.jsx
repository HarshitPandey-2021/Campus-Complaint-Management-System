import { useState, useRef, useEffect } from "react";
import {
  RiBellLine,
  RiCheckLine,
  RiTimeLine,
  RiErrorWarningLine,
  RiCloseLine,
} from "react-icons/ri";
import { getUnreadComplaints, markComplaintAsRead } from "../services/adminService";

export default function NotificationPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const panelRef = useRef(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const colorClasses = {
    blue: "bg-blue-500 text-white shadow-blue-200 dark:shadow-blue-900/50",
    green: "bg-green-500 text-white shadow-green-200 dark:shadow-green-900/50",
    red: "bg-red-500 text-white shadow-red-200 dark:shadow-red-900/50",
  };

  // Define the icon selection logic here
  const iconMap = {
    new: RiTimeLine,        // Clock icon for new complaints
    resolved: RiCheckLine,  // Check icon for resolved complaints
    urgent: RiErrorWarningLine, // Exclamation mark icon for urgent complaints
    rejected: RiErrorWarningLine, // Same icon for rejected complaints
  };

  /* =========================================================
     🧩 FETCH NOTIFICATIONS
  ========================================================= */
  useEffect(() => {
    const fetchNotifications = async () => {
      console.log("Fetching notifications...");
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          console.error("No token found in localStorage");
          return;
        }

        const res = await getUnreadComplaints(token);

        console.log("Raw Complaint Data:", res);  // Log raw response data

        if (!Array.isArray(res)) {
          console.error("Expected an array of complaints, but got:", res);
          return;
        }

        if (res.length === 0) {
          console.log("No notifications returned from the API.");
        }

        const formatted = res
          .map((c) => {
            console.log("Complaint Data:", c);  // Log individual complaint data

            let type = "new";
            let icon = RiTimeLine;
            let color = "blue";
            let title = "Complaint Pending";

            const status = c.status ? c.status.toLowerCase() : "pending";
            const priority = c.priority ? c.priority.toLowerCase() : "low";

            console.log("Status:", status, "Priority:", priority);

            // Logic based on priority and status
            if (status === "resolved") {
              type = "resolved";
              icon = RiCheckLine;
              color = "green";
              title = "Complaint Resolved";
            } else if (status === "rejected") {
              type = "rejected";
              icon = RiErrorWarningLine;
              color = "red";
              title = "Complaint Rejected";
            } else if (status === "pending") {
              if (priority === "high") {
                type = "urgent";
                icon = RiErrorWarningLine;
                color = "red";
                title = "Urgent Complaint Pending";
              } else {
                type = "new";
                icon = RiTimeLine;
                color = "blue";
                title = "Complaint Pending";
              }
            }

            const time = new Date(c.createdAt || c.submittedAt);
            if (isNaN(time)) {
              console.warn("Invalid date:", c.createdAt, c.submittedAt);
              return null;
            }

            return {
              id: c._id,
              type,
              icon,
              color,
              title,
              message: c.subject || c.description || "No description provided",
              time: time.toLocaleString(),
              read: c.readByAdmin || false,
            };
          })
          .filter(Boolean) // Filter out null values
          .sort((a, b) => new Date(b.time) - new Date(a.time));

        console.log("Formatted Notifications:", formatted); // Log formatted notifications

        setNotifications(formatted);
        setUnreadCount(formatted.filter((n) => !n.read).length);
      } catch (err) {
        console.error("Failed to load notifications:", err);
      }
    };

    fetchNotifications();
  }, []);

  /* =========================================================
     🧩 MARK READ
  ========================================================= */
  const markAsRead = async (id) => {
    try {
      await markComplaintAsRead(id);
      setNotifications((prev) => {
        const updated = prev.map((n) =>
          n.id === id ? { ...n, read: true } : n
        );
        setUnreadCount(updated.filter((n) => !n.read).length);
        return updated;
      });
    } catch (err) {
      console.error("Failed to mark as read:", err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await Promise.all(
        notifications.filter((n) => !n.read).map((n) => markComplaintAsRead(n.id))
      );
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error("Failed to mark all as read:", err);
    }
  };

  const clearAll = () => {
    if (window.confirm("Are you sure you want to clear all notifications?")) {
      setNotifications([]);
      setIsOpen(false);
      setUnreadCount(0);
    }
  };

  /* =========================================================
     🧩 CLOSE ON OUTSIDE CLICK / ESC
  ========================================================= */
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      return () => (document.body.style.overflow = "");
    }
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape" && isOpen) setIsOpen(false);
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen]);

  return (
    <div className="relative" ref={panelRef}>
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg hover:bg-indigo-600/20 dark:hover:bg-gray-700 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-400 dark:focus:ring-gray-500 group"
        aria-label="Notifications"
      >
        <RiBellLine className="h-6 w-6 text-white dark:text-gray-300 group-hover:scale-110 transition-transform" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1.5 bg-gradient-to-r from-red-500 to-red-600 text-white text-xs font-bold rounded-full flex items-center justify-center shadow-lg border-2 border-indigo-700 dark:border-gray-800 animate-bounce">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 dark:bg-black/40 z-[90] backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Notification Panel */}
      {isOpen && (
        <div
          className={`fixed lg:absolute top-16 lg:right-0 left-4 right-4 lg:left-auto w-auto lg:w-96 max-w-full lg:max-w-md bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 z-[100] animate-slideDown flex flex-col overflow-hidden`}
        >
          {/* Header */}
          <div className="sticky top-0 z-10 p-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 flex-shrink-0">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-indigo-600 rounded-lg shadow-sm">
                  <RiBellLine className="h-5 w-5 text-white" />
                </div>
                <h3 className="font-bold text-gray-800 dark:text-gray-200 text-lg">
                  Notifications
                </h3>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <RiCloseLine className="h-6 w-6 text-gray-500 dark:text-gray-400" />
              </button>
            </div>

            <div className="flex items-center justify-between gap-2 flex-wrap">
              {unreadCount > 0 ? (
                <span className="text-xs bg-indigo-600 text-white px-3 py-1 rounded-full font-semibold shadow-sm">
                  {unreadCount} new notification
                  {unreadCount > 1 ? "s" : ""}
                </span>
              ) : (
                <span className="text-xs text-gray-600 dark:text-gray-400 flex items-center gap-1">
                  <span className="text-green-500 font-bold">✓</span> All caught
                  up!
                </span>
              )}

              {notifications.length > 0 && (
                <div className="flex items-center gap-2 flex-wrap">
                  {unreadCount > 0 && (
                    <>
                      <button
                        onClick={markAllAsRead}
                        className="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-semibold hover:underline whitespace-nowrap"
                      >
                        Mark all read
                      </button>
                      <span className="text-gray-300 dark:text-gray-600 hidden sm:inline">
                        •
                      </span>
                    </>
                  )}
                  <button
                    onClick={clearAll}
                    className="text-xs text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 font-semibold hover:underline whitespace-nowrap"
                  >
                    Clear all
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Notifications List */}
          <div className="overflow-y-auto overflow-x-hidden max-h-[calc(100vh-16rem)] lg:max-h-[28rem] custom-scrollbar flex-1">
            {notifications.length === 0 ? (
              <div className="p-12 text-center">
                <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 rounded-full flex items-center justify-center shadow-inner">
                  <RiBellLine className="h-10 w-10 text-gray-400 dark:text-gray-500" />
                </div>
                <p className="text-gray-600 dark:text-gray-300 font-semibold mb-1">
                  No notifications yet
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  We'll notify you when something new arrives
                </p>
              </div>
            ) : (
              notifications.map((notif) => {
                const Icon = iconMap[notif.type]; // Dynamically select the icon
                return (
                  <div
                    key={notif.id}
                    onClick={() => markAsRead(notif.id)}
                    className={`p-4 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-all group ${
                      !notif.read
                        ? "bg-indigo-50 dark:bg-indigo-900/10 border-l-4 border-l-indigo-600"
                        : ""
                    }`}
                  >
                    <div className="flex gap-3">
                      <div
                        className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center shadow-md ${colorClasses[notif.color] || colorClasses.blue} transition-all duration-300`}
                      >
                        <Icon className="h-5 w-5" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors break-words">
                            {notif.title}
                          </p>
                          {!notif.read && (
                            <span className="w-2.5 h-2.5 bg-indigo-600 rounded-full flex-shrink-0 mt-1 shadow-lg ring-2 ring-indigo-100 dark:ring-indigo-900/30"></span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed line-clamp-2 break-words">
                          {notif.message}
                        </p>
                        <div className="flex items-center gap-2 mt-2 flex-wrap">
                          <p className="text-xs text-gray-500 dark:text-gray-500 whitespace-nowrap">
                            {notif.time}
                          </p>
                          {!notif.read && (
                            <span className="text-xs bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded-full font-semibold">
                              New
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="sticky bottom-0 p-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 flex-shrink-0">
              <button
                onClick={() => setIsOpen(false)}
                className="w-full text-center text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-semibold py-2 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all"
              >
                View all notifications →
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
