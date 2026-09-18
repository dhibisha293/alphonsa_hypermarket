import React, { useState, useEffect } from 'react';
import { getNotifications, markNotificationAsRead, markAllNotificationsAsRead } from '../../../services/api';
import { Bell, Check, Circle, Trash2, CheckCircle2, ChevronLeft, ChevronRight } from 'lucide-react';

export default function AccountNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const pageSize = 20;

  useEffect(() => {
    fetchNotifications(page);
  }, [page]);

  const fetchNotifications = async (p) => {
    setLoading(true);
    try {
      const res = await getNotifications(p, pageSize);
      if (res.success) {
        setNotifications(res.data.items);
        setTotal(res.data.total);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      const res = await markNotificationAsRead(id);
      if (res.success) {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const res = await markAllNotificationsAsRead();
      if (res.success) {
        setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Bell className="w-6 h-6 text-primary" />
            Notifications
          </h2>
          <p className="text-gray-500 mt-1">Stay updated on your orders and offers.</p>
        </div>
        
        <button
          onClick={handleMarkAllAsRead}
          className="flex items-center gap-2 text-sm font-medium text-primary bg-primary/10 hover:bg-primary/20 px-4 py-2 rounded-lg transition-colors"
        >
          <CheckCircle2 className="w-4 h-4" />
          Mark all as read
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-400">Loading notifications...</div>
        ) : notifications.length === 0 ? (
          <div className="p-16 text-center text-gray-500 flex flex-col items-center">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
              <Bell className="w-8 h-8 text-gray-300" />
            </div>
            <p className="text-lg font-medium text-gray-700">No notifications found</p>
            <p className="text-sm mt-1">You're all caught up!</p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {notifications.map((notif) => (
              <li 
                key={notif.id} 
                className={`p-4 sm:p-6 transition-colors flex flex-col sm:flex-row gap-4 sm:items-center justify-between ${
                  !notif.is_read ? 'bg-blue-50/20' : 'hover:bg-gray-50'
                }`}
              >
                <div className="flex gap-4 items-start">
                  <div className="mt-1">
                    {!notif.is_read ? (
                      <Circle className="w-3 h-3 text-primary fill-primary" />
                    ) : (
                      <Circle className="w-3 h-3 text-gray-200" />
                    )}
                  </div>
                  <div>
                    <h4 className={`text-base font-medium ${!notif.is_read ? 'text-gray-900' : 'text-gray-700'}`}>
                      {notif.title}
                    </h4>
                    <p className={`text-sm mt-1 ${!notif.is_read ? 'text-gray-700' : 'text-gray-500'}`}>
                      {notif.message}
                    </p>
                    <span className="text-xs text-gray-400 mt-2 block font-medium">
                      {new Date(notif.created_at).toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end sm:self-auto shrink-0 pl-7 sm:pl-0">
                  {notif.link && (
                    <a
                      href={notif.link}
                      className="text-sm font-medium text-primary hover:text-primary-dark transition-colors"
                    >
                      View Details
                    </a>
                  )}
                  
                  {!notif.is_read && (
                    <button
                      onClick={() => handleMarkAsRead(notif.id)}
                      className="text-gray-400 hover:text-primary p-2 rounded-lg hover:bg-gray-100 transition-colors"
                      title="Mark as read"
                    >
                      <Check className="w-5 h-5" />
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-6">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="text-sm font-medium text-gray-700 px-4">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );
}
