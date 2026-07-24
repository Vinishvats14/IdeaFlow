import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { Client } from '@stomp/stompjs';
import { useAuth } from './AuthContext';
import { api } from '../services/api';

const NotificationContext = createContext(null);

export function NotificationProvider({ children }) {
  const { token, user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [toasts, setToasts] = useState([]);
  const stompClientRef = useRef(null);

  // Fetch notifications history from DB
  const fetchNotifications = async () => {
    if (!token) return;
    try {
      const list = await api.notifications.list();
      setNotifications(list || []);
      setUnreadCount(list ? list.filter(n => !n.readFlag).length : 0);
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    }
  };

  // Add toast helper
  const addToast = (message) => {
    const id = Date.now() + Math.random().toString();
    setToasts(prev => [...prev, { id, message }]);
    setTimeout(() => {
      removeToast(id);
    }, 6000); // 6 seconds auto-remove
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const markAsRead = async (id) => {
    try {
      await api.notifications.markAsRead(id);
      setNotifications(prev =>
        prev.map(n => (n.id === id ? { ...n, readFlag: true } : n))
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.notifications.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, readFlag: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Failed to mark all as read:', err);
    }
  };

  // Sync subscriptions and start WebSocket
  useEffect(() => {
    if (!token || !user) {
      // Clean up WebSocket on logout
      if (stompClientRef.current) {
        stompClientRef.current.deactivate();
        stompClientRef.current = null;
      }
      setNotifications([]);
      setUnreadCount(0);
      return;
    }

    fetchNotifications();

    let activeSubscriptions = [];

    const setupWebSocket = async () => {
      try {
        // Fetch current subscriptions to know which topics to listen to
        const subs = await api.users.getSubscriptions();
        
        // Determine the broker WebSocket URL (standard ws:// or wss:// depending on environment)
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        // We connect to host port 8080 as our backend resides there
        const brokerURL = `${protocol}//localhost:8080/ws`;

        const client = new Client({
          brokerURL,
          connectHeaders: {
            Authorization: `Bearer ${token}`,
          },
          reconnectDelay: 5000,
          heartbeatIncoming: 4000,
          heartbeatOutgoing: 4000,
          onConnect: () => {
            console.log('Connected to WebSocket Securely!');

            // Subscribe to all authors the user follows
            subs.forEach(author => {
              const topic = `/topic/author/${author.id}`;
              console.log(`Subscribing to author topic: ${topic}`);
              const sub = client.subscribe(topic, (message) => {
                console.log('New message received from WebSocket topic:', message.body);
                // Prepend/Refresh list from database
                fetchNotifications();
                // Add animated toast popup
                addToast(message.body);
              });
              activeSubscriptions.push(sub);
            });
          },
          onStompError: (frame) => {
            console.error('Broker reported error: ' + frame.headers['message']);
            console.error('Additional details: ' + frame.body);
          },
          onWebSocketClose: () => {
            console.log('WebSocket connection closed');
          }
        });

        client.activate();
        stompClientRef.current = client;
      } catch (err) {
        console.error('Failed to initialize WebSocket client:', err);
      }
    };

    setupWebSocket();

    return () => {
      console.log('Cleaning up WebSocket connection...');
      activeSubscriptions.forEach(sub => sub.unsubscribe());
      if (stompClientRef.current) {
        stompClientRef.current.deactivate();
        stompClientRef.current = null;
      }
    };
  }, [token, user]);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        toasts,
        removeToast,
        markAsRead,
        markAllAsRead,
        refresh: fetchNotifications,
      }}
    >
      {children}

      {/* Floating Animated Toasts Layer */}
      <div className="toast-container" style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        pointerEvents: 'none'
      }}>
        {toasts.map(toast => (
          <div
            key={toast.id}
            className="toast-alert"
            style={{
              pointerEvents: 'auto',
              background: 'rgba(255, 255, 255, 0.9)',
              backdropFilter: 'blur(12px)',
              border: '1px solid var(--primary)',
              borderRadius: 'var(--radius-md)',
              boxShadow: 'var(--shadow-lg)',
              padding: '16px 20px',
              maxWidth: '360px',
              animation: 'slideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '12px',
              color: 'var(--text-primary)',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            {/* Left color bar */}
            <div style={{
              position: 'absolute',
              left: 0,
              top: 0,
              bottom: 0,
              width: '4px',
              backgroundColor: 'var(--primary)'
            }} />
            
            <div style={{ flexGrow: 1 }}>
              <h4 style={{ margin: '0 0 4px', fontSize: '14px', fontWeight: 700, color: 'var(--primary)' }}>New Article!</h4>
              <p style={{ margin: 0, fontSize: '13px', lineHeight: 1.4, color: 'var(--text-secondary)' }}>{toast.message}</p>
            </div>
            
            <button
              onClick={() => removeToast(toast.id)}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--text-secondary)',
                fontSize: '16px',
                cursor: 'pointer',
                padding: '0 4px',
                fontWeight: 'bold',
                lineHeight: 1
              }}
            >
              &times;
            </button>

            <style>{`
              @keyframes slideIn {
                from {
                  transform: translateY(20px) scale(0.95);
                  opacity: 0;
                }
                to {
                  transform: translateY(0) scale(1);
                  opacity: 1;
                }
              }
            `}</style>
          </div>
        ))}
      </div>
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}
