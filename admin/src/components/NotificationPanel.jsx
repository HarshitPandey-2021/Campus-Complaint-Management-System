// src/components/NotificationPanel.jsx

import { useState, useRef, useEffect } from 'react';
import { RiBellLine, RiCheckLine, RiTimeLine, RiErrorWarningLine, RiCloseLine } from 'react-icons/ri';

export default function NotificationPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const panelRef = useRef(null);

  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: 'new',
      icon: RiTimeLine,
      color: 'blue',
      title: 'New Complaint Submitted',
      message: 'Broken ceiling fan in Room 101',
      time: '2 minutes ago',
      read: false
    },
    {
      id: 2,
      type: 'resolved',
      icon: RiCheckLine,
      color: 'green',
      title: 'Complaint Resolved',
      message: 'Projector issue has been fixed',
      time: '1 hour ago',
      read: false
    },
    {
      id: 3,
      type: 'urgent',
      icon: RiErrorWarningLine,
      color: 'red',
      title: 'Urgent: Water Leakage',
      message: 'High priority complaint requires immediate attention',
      time: '3 hours ago',
      read: true
    },
    {
      id: 4,
      type: 'new',
      icon: RiTimeLine,
      color: 'blue',
      title: 'New Complaint',
      message: 'Flickering lights in Library',
      time: '5 hours ago',
      read: true
    },
    {
      id: 5,
      type: 'resolved',
      icon: RiCheckLine,
      color: 'green',
      title: 'Maintenance Complete',
      message: 'Water cooler fixed in Building A',
      time: '6 hours ago',
      read: true
    },
    {
      id: 6,
      type: 'new',
      icon: RiTimeLine,
      color: 'blue',
      title: 'New Request',
      message: 'AC not working in Conference Room',
      time: '8 hours ago',
      read: true
    }
  ]);

  const unreadCount = notifications.filter(n => !n.read).length;

  // Prevent body scroll when panel is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = '';
      };
    }
  }, [isOpen]);

  // Close panel when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (panelRef.current && !panelRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen]);

  const markAsRead = (id) => {
    setNotifications(prev =>
      prev.map(notif =>
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(notif => ({ ...notif, read: true }))
    );
  };

  const clearAll = () => {
    if (window.confirm('Are you sure you want to clear all notifications?')) {
      setNotifications([]);
      setIsOpen(false);
    }
  };

  return (
    <div className="relative" ref={panelRef}>
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg hover:bg-indigo-600/20 dark:hover:bg-gray-700 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-400 dark:focus:ring-gray-500 group"
        aria-label="Notifications"
      >
        <RiBellLine className="h-6 w-6 text-white dark:text-gray-300 group-hover:scale-110 transition-transform" />
        
        {/* Unread Badge */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1.5 bg-gradient-to-r from-red-500 to-red-600 text-white text-xs font-bold rounded-full flex items-center justify-center shadow-lg border-2 border-indigo-700 dark:border-gray-800 animate-bounce">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Backdrop Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/20 dark:bg-black/40 z-[90] backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* ✅ FIXED: Notification Panel with Mobile Responsive Width */}
      {isOpen && (
        <div className={`
          /* Position */
          fixed lg:absolute
          top-16 lg:top-auto lg:right-0 lg:mt-3
          left-4 right-4 lg:left-auto
          
          /* Width - MOBILE FIX */
          w-auto lg:w-96
          max-w-full lg:max-w-md
          
          /* Styling */
          bg-white dark:bg-gray-800 
          rounded-xl shadow-2xl 
          border border-gray-200 dark:border-gray-700 
          
          /* Z-index */
          z-[100]
          
          /* Animation */
          animate-slideDown
          
          /* Layout */
          overflow-hidden
          flex flex-col
        `}>
          
          {/* Header - Sticky */}
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
              
              {/* Close Button */}
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
                aria-label="Close notifications"
              >
                <RiCloseLine className="h-6 w-6 text-gray-500 dark:text-gray-400" />
              </button>
            </div>
            
            {/* Action Buttons - Mobile Responsive */}
            <div className="flex items-center justify-between gap-2 flex-wrap">
              {unreadCount > 0 ? (
                <span className="text-xs bg-indigo-600 text-white px-3 py-1 rounded-full font-semibold shadow-sm">
                  {unreadCount} new notification{unreadCount > 1 ? 's' : ''}
                </span>
              ) : (
                <span className="text-xs text-gray-600 dark:text-gray-400 flex items-center gap-1">
                  <span className="text-green-500 font-bold">✓</span> All caught up!
                </span>
              )}
              
              {notifications.length > 0 && (
                <div className="flex items-center gap-2 flex-wrap">
                  {unreadCount > 0 && (
                    <>
                      <button
                        onClick={markAllAsRead}
                        className="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-semibold transition-colors hover:underline whitespace-nowrap"
                      >
                        Mark all read
                      </button>
                      <span className="text-gray-300 dark:text-gray-600 hidden sm:inline">•</span>
                    </>
                  )}
                  <button
                    onClick={clearAll}
                    className="text-xs text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 font-semibold transition-colors hover:underline whitespace-nowrap"
                  >
                    Clear all
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* ✅ FIXED: Scrollable List - Mobile Height Fix */}
          <div className="
            overflow-y-auto overflow-x-hidden 
            max-h-[calc(100vh-16rem)] lg:max-h-[28rem]
            custom-scrollbar
            flex-1
          ">
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
                const Icon = notif.icon;
                const colorClasses = {
                  blue: 'bg-blue-500 text-white shadow-blue-200 dark:shadow-blue-900/50',
                  green: 'bg-green-500 text-white shadow-green-200 dark:shadow-green-900/50',
                  red: 'bg-red-500 text-white shadow-red-200 dark:shadow-red-900/50',
                  yellow: 'bg-yellow-500 text-white shadow-yellow-200 dark:shadow-yellow-900/50'
                };

                return (
                  <div
                    key={notif.id}
                    onClick={() => markAsRead(notif.id)}
                    className={`p-4 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-all group ${
                      !notif.read ? 'bg-indigo-50 dark:bg-indigo-900/10 border-l-4 border-l-indigo-600' : ''
                    }`}
                  >
                    <div className="flex gap-3">
                      <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center shadow-md ${colorClasses[notif.color]}`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      
                      {/* ✅ FIXED: Text Container with min-w-0 to prevent overflow */}
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

          {/* Footer - Sticky */}
          {notifications.length > 0 && (
            <div className="sticky bottom-0 p-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 flex-shrink-0">
              <button 
                onClick={() => {
                  setIsOpen(false);
                }}
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