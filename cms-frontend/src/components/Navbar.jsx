import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { BookOpen, User, LogOut, LayoutDashboard } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isAuthPage = ['/login', '/register'].includes(location.pathname);
  const isDashboard = location.pathname.startsWith('/dashboard');

  if (isDashboard) return null; // Dashboard has its own header/sidebar layout

  return (
    <nav className="navbar">
      <div className="container navbar-container">
        <Link to="/" className="logo">
          <BookOpen size={28} />
          <span>CMS</span>
        </Link>
        <div className="nav-links">
          {user ? (
            <>
              <Link to="/dashboard" className="nav-link flex items-center gap-1">
                <LayoutDashboard size={18} />
                <span>Dashboard</span>
              </Link>
              <div className="flex items-center gap-4">
                <span className="text-secondary text-sm hidden sm:inline">
                  {user.email} ({user.roles[0]})
                </span>
                <button onClick={handleLogout} className="btn btn-secondary btn-sm flex items-center gap-1">
                  <LogOut size={16} />
                  <span>Logout</span>
                </button>
              </div>
            </>
          ) : (
            !isAuthPage && (
              <>
                <Link to="/login" className="btn btn-secondary">
                  Login
                </Link>
                <Link to="/register" className="btn btn-primary">
                  Sign Up
                </Link>
              </>
            )
          )}
        </div>
      </div>
    </nav>
  );
}
