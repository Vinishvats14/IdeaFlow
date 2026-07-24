import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { 
  LayoutDashboard, 
  FileText, 
  FolderOpen, 
  Tag, 
  Image, 
  Users, 
  ArrowLeft, 
  LogOut,
  BookOpen,
  Bell
} from 'lucide-react';

export default function Sidebar() {
  const { user, logout, hasRole } = useAuth();
  const { unreadCount } = useNotifications();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Define sidebar menu items with required roles
  const menuItems = [
    {
      path: '/dashboard',
      label: 'Overview',
      icon: <LayoutDashboard size={20} />,
      exact: true,
      roles: ['SUPER_ADMIN', 'ADMIN', 'EDITOR', 'AUTHOR', 'VIEWER']
    },
    {
      path: '/dashboard/articles',
      label: 'Articles',
      icon: <FileText size={20} />,
      roles: ['SUPER_ADMIN', 'ADMIN', 'EDITOR', 'AUTHOR']
    },
    {
      path: '/dashboard/categories',
      label: 'Categories',
      icon: <FolderOpen size={20} />,
      roles: ['SUPER_ADMIN', 'ADMIN', 'EDITOR']
    },
    {
      path: '/dashboard/tags',
      label: 'Tags',
      icon: <Tag size={20} />,
      roles: ['SUPER_ADMIN', 'ADMIN', 'EDITOR', 'AUTHOR']
    },
    {
      path: '/dashboard/media',
      label: 'Media Library',
      icon: <Image size={20} />,
      roles: ['SUPER_ADMIN', 'ADMIN', 'EDITOR', 'AUTHOR']
    },
    {
      path: '/dashboard/users',
      label: 'Users Control',
      icon: <Users size={20} />,
      roles: ['SUPER_ADMIN', 'ADMIN']
    },
    {
      path: '/dashboard/notifications',
      label: 'Notifications',
      icon: (
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          <Bell size={20} />
          {unreadCount > 0 && (
            <span style={{
              position: 'absolute',
              top: '-8px',
              right: '-8px',
              backgroundColor: 'var(--danger)',
              color: '#fff',
              fontSize: '10px',
              fontWeight: '700',
              borderRadius: '50%',
              width: '16px',
              height: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
            }}>
              {unreadCount}
            </span>
          )}
        </div>
      ),
      roles: ['SUPER_ADMIN', 'ADMIN', 'EDITOR', 'AUTHOR', 'VIEWER']
    }
  ];

  return (
    <aside className="dashboard-sidebar">
      <div className="dashboard-sidebar-header">
        <NavLink to="/" className="logo">
          <BookOpen size={24} />
          <span>CMS</span>
        </NavLink>
      </div>

      <nav className="dashboard-sidebar-menu">
        {menuItems.map((item) => {
          if (!hasRole(item.roles)) return null;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.exact}
              className={({ isActive }) => 
                `dashboard-menu-item ${isActive ? 'active' : ''}`
              }
            >
              {item.icon}
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="dashboard-sidebar-footer">
        <NavLink to="/" className="dashboard-menu-item">
          <ArrowLeft size={20} />
          <span>View Blog</span>
        </NavLink>
        <button 
          onClick={handleLogout} 
          className="dashboard-menu-item" 
          style={{ background: 'none', border: 'none', width: '100%', textAlign: 'left', cursor: 'pointer' }}
        >
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
