'use client';

import { useEffect, useState, useCallback } from 'react';
import AppLayout from '@/components/AppLayout';

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  link: string | null;
  isRead: boolean;
  createdAt: string;
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:3001/api/notifications', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setNotifications(data);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const markAsRead = async (id: string) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`http://localhost:3001/api/notifications/${id}/read`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications(notifications.map(n => n.id === id ? { ...n, isRead: true } : n));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const token = localStorage.getItem('token');
      await fetch('http://localhost:3001/api/notifications/read/all', {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications(notifications.map(n => ({ ...n, isRead: true })));
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const deleteNotification = async (id: string) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`http://localhost:3001/api/notifications/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications(notifications.filter(n => n.id !== id));
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'RFQ_RECEIVED': return '📋';
      case 'QUOTE_SUBMITTED': return '📄';
      case 'QUOTE_APPROVED': return '✅';
      case 'PO_SENT': return '📤';
      case 'PO_ACKNOWLEDGED': return '👍';
      case 'DELIVERY_UPDATE': return '🚚';
      case 'PAYMENT_DUE': return '💳';
      case 'MANDATE_SIGNED': return '✍️';
      case 'AI_INSIGHT': return '🧠';
      case 'PRICE_ALERT': return '📊';
      case 'SYSTEM': return '⚙️';
      default: return '🔔';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'QUOTE_APPROVED':
      case 'PO_ACKNOWLEDGED':
      case 'MANDATE_SIGNED':
        return 'bg-green-500/20 border-green-500/50';
      case 'PAYMENT_DUE':
      case 'PRICE_ALERT':
        return 'bg-orange-500/20 border-orange-500/50';
      case 'AI_INSIGHT':
        return 'bg-purple-500/20 border-purple-500/50';
      case 'DELIVERY_UPDATE':
        return 'bg-blue-500/20 border-blue-500/50';
      default:
        return 'bg-slate-500/20 border-slate-500/50';
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString('en-IN');
  };

  const filteredNotifications = filter === 'unread' 
    ? notifications.filter(n => !n.isRead)
    : notifications;

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Notifications</h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1">
              Stay updated on your procurement activities
            </p>
          </div>
          <div className="flex items-center gap-3">
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="px-4 py-2 text-sm font-medium text-blue-500 hover:text-blue-600 transition-colors"
              >
                Mark all as read
              </button>
            )}
            <div className="flex bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  filter === 'all'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilter('unread')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${
                  filter === 'unread'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                Unread
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 text-xs bg-blue-500 text-white rounded-full">
                    {unreadCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Notifications List */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="text-center py-16 bg-slate-50 dark:bg-slate-800/50 rounded-2xl">
            <div className="text-6xl mb-4">🔔</div>
            <h3 className="text-xl font-semibold text-slate-700 dark:text-slate-300 mb-2">
              {filter === 'unread' ? 'No unread notifications' : 'No notifications yet'}
            </h3>
            <p className="text-slate-500">
              {filter === 'unread' 
                ? "You're all caught up!"
                : 'Notifications about your procurement activities will appear here'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`group p-4 rounded-xl border transition-all cursor-pointer ${
                  notification.isRead
                    ? 'bg-slate-50 dark:bg-slate-800/30 border-slate-200 dark:border-slate-700'
                    : `bg-white dark:bg-slate-800 ${getTypeColor(notification.type)} shadow-md`
                }`}
                onClick={() => {
                  if (!notification.isRead) markAsRead(notification.id);
                  if (notification.link) window.location.href = notification.link;
                }}
              >
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${
                    notification.isRead ? 'bg-slate-100 dark:bg-slate-700' : 'bg-white dark:bg-slate-700'
                  }`}>
                    {getTypeIcon(notification.type)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className={`font-semibold ${
                        notification.isRead 
                          ? 'text-slate-700 dark:text-slate-300' 
                          : 'text-slate-900 dark:text-white'
                      }`}>
                        {notification.title}
                      </h3>
                      {!notification.isRead && (
                        <span className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></span>
                      )}
                    </div>
                    <p className={`text-sm ${
                      notification.isRead 
                        ? 'text-slate-500 dark:text-slate-500' 
                        : 'text-slate-600 dark:text-slate-400'
                    }`}>
                      {notification.message}
                    </p>
                    <p className="text-xs text-slate-400 mt-2">
                      {formatTime(notification.createdAt)}
                    </p>
                  </div>
                  
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteNotification(notification.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
                    title="Delete notification"
                  >
                    <svg className="w-4 h-4 text-slate-400 hover:text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Notification Settings Link */}
        <div className="bg-gradient-to-r from-slate-100 to-slate-50 dark:from-slate-800/50 dark:to-slate-800/30 border border-slate-200 dark:border-slate-700 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl">⚙️</span>
              <div>
                <p className="font-medium text-slate-900 dark:text-white">Notification Settings</p>
                <p className="text-sm text-slate-500">Customize which notifications you receive</p>
              </div>
            </div>
            <button className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
              Configure →
            </button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
