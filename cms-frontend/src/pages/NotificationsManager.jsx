import React from 'react';
import { useNotifications } from '../context/NotificationContext';
import { Bell, Check, CheckSquare, Calendar, ShieldAlert } from 'lucide-react';

export default function NotificationsManager() {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();

  const formatDate = (dateString) => {
    if (!dateString) return 'Just now';
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '16px' }}>
      {/* Title Bar */}
      <div className="dashboard-title-bar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 className="dashboard-view-title" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Bell size={28} className="text-primary" />
            <span>Notifications Hub</span>
          </h2>
          <p style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>
            You have <strong style={{ color: 'var(--primary)' }}>{unreadCount}</strong> unread updates.
          </p>
        </div>

        {unreadCount > 0 && (
          <button 
            onClick={markAllAsRead} 
            className="btn btn-secondary btn-sm flex items-center gap-1"
            style={{ 
              display: 'inline-flex', 
              alignItems: 'center',
              backgroundColor: 'var(--bg-card)',
              borderColor: 'var(--border)',
              cursor: 'pointer'
            }}
          >
            <CheckSquare size={16} />
            <span>Mark all as read</span>
          </button>
        )}
      </div>

      {/* Notifications List */}
      {notifications.length === 0 ? (
        <div style={{ 
          padding: '60px 24px', 
          textAlign: 'center', 
          backgroundColor: 'var(--bg-card)', 
          border: '1px solid var(--border)', 
          borderRadius: 'var(--radius-md)',
          boxShadow: 'var(--shadow-sm)'
        }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            backgroundColor: 'var(--primary-glow)',
            color: 'var(--primary)',
            marginBottom: '16px'
          }}>
            <Bell size={32} />
          </div>
          <h3 style={{ fontFamily: 'var(--font-title)', fontSize: '18px', fontWeight: 700, marginBottom: '8px' }}>All caught up!</h3>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '400px', margin: '0 auto' }}>
            No new notifications. Subscribe to your favorite authors to get real-time updates when they publish new articles.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {notifications.map((notification) => (
            <div 
              key={notification.id}
              style={{
                backgroundColor: 'var(--bg-card)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-md)',
                boxShadow: notification.readFlag ? 'var(--shadow-sm)' : 'var(--shadow-md)',
                padding: '20px',
                transition: 'all 0.2s ease',
                position: 'relative',
                display: 'flex',
                gap: '16px',
                alignItems: 'flex-start',
                background: !notification.readFlag ? 'linear-gradient(to right, var(--primary-glow) 0%, var(--bg-card) 100%)' : 'var(--bg-card)'
              }}
            >
              {/* Unread indicator bar */}
              {!notification.readFlag && (
                <div style={{
                  position: 'absolute',
                  left: 0,
                  top: 0,
                  bottom: 0,
                  width: '4px',
                  backgroundColor: 'var(--primary)',
                  borderRadius: 'var(--radius-sm) 0 0 var(--radius-sm)'
                }} />
              )}

              {/* Icon */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                backgroundColor: !notification.readFlag ? 'rgba(255,255,255,0.8)' : 'var(--bg-secondary)',
                color: !notification.readFlag ? 'var(--primary)' : 'var(--text-secondary)',
                flexShrink: 0
              }}>
                {notification.type === 'ALERT' ? <ShieldAlert size={20} /> : <Bell size={20} />}
              </div>

              {/* Body */}
              <div style={{ flexGrow: 1 }}>
                <p style={{ 
                  margin: 0, 
                  fontSize: '14px', 
                  color: 'var(--text-primary)',
                  fontWeight: !notification.readFlag ? '600' : '400',
                  lineHeight: '1.5'
                }}>
                  {notification.message}
                </p>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '6px', 
                  fontSize: '12px', 
                  color: 'var(--text-muted)',
                  marginTop: '8px'
                }}>
                  <Calendar size={12} />
                  <span>{formatDate(notification.createdAt)}</span>
                </div>
              </div>

              {/* Actions */}
              {!notification.readFlag && (
                <button
                  onClick={() => markAsRead(notification.id)}
                  title="Mark as read"
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--primary)',
                    cursor: 'pointer',
                    padding: '8px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: 'rgba(255,255,255,0.8)',
                    transition: 'all 0.2s',
                    boxShadow: 'var(--shadow-sm)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--primary)';
                    e.currentTarget.style.color = '#fff';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.8)';
                    e.currentTarget.style.color = 'var(--primary)';
                  }}
                >
                  <Check size={16} />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
