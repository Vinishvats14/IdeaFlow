import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  FileText, 
  FolderOpen, 
  Tag, 
  Image, 
  Users, 
  ArrowLeft, 
  LogOut,
  BookOpen
} from 'lucide-react';

export default function Sidebar() {
  const { user, logout, hasRole } = useAuth();
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
