import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Layouts & Nav
import Navbar from './components/Navbar';
import DashboardLayout from './components/DashboardLayout';

// Public Pages
import Home from './pages/Home';
import ArticleDetail from './pages/ArticleDetail';
import Login from './pages/Login';
import Register from './pages/Register';

// Dashboard Pages
import DashboardHome from './pages/DashboardHome';
import ArticleList from './pages/ArticleList';
import ArticleForm from './pages/ArticleForm';
import CategoriesManager from './pages/CategoriesManager';
import TagsManager from './pages/TagsManager';
import MediaManager from './pages/MediaManager';
import UsersManager from './pages/UsersManager';
import NotificationsManager from './pages/NotificationsManager';

// Role Guard Component
function RoleGuard({ allowedRoles, children }) {
  const { user, loading, hasRole } = useAuth();

  if (loading) {
    return <div style={{ padding: '40px', color: 'var(--text-secondary)' }}>Verifying access rules...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!hasRole(allowedRoles)) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)' }}>
        <h3 style={{ color: 'var(--danger)', fontSize: '20px', marginBottom: '8px' }}>Access Denied</h3>
        <p style={{ color: 'var(--text-secondary)' }}>You do not have the required permissions to view this panel.</p>
        <Link to="/dashboard" className="btn btn-primary btn-sm" style={{ marginTop: '16px' }}>Return to Overview</Link>
      </div>
    );
  }

  return children;
}

export default function App() {
  return (
    <Router>
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        {/* Render Navbar on public pages */}
        <Navbar />
        
        <div style={{ flexGrow: 1 }}>
          <Routes>
            {/* Public Blog routes */}
            <Route path="/" element={<Home />} />
            <Route path="/article/:slug" element={<ArticleDetail />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Dashboard Protected Routes */}
            <Route path="/dashboard" element={<DashboardLayout />}>
              <Route index element={<DashboardHome />} />
              
              <Route path="articles" element={
                <RoleGuard allowedRoles={['SUPER_ADMIN', 'ADMIN', 'EDITOR', 'AUTHOR']}>
                  <ArticleList />
                </RoleGuard>
              } />
              
              <Route path="articles/new" element={
                <RoleGuard allowedRoles={['SUPER_ADMIN', 'ADMIN', 'EDITOR', 'AUTHOR']}>
                  <ArticleForm />
                </RoleGuard>
              } />
              
              <Route path="articles/edit/:id" element={
                <RoleGuard allowedRoles={['SUPER_ADMIN', 'ADMIN', 'EDITOR', 'AUTHOR']}>
                  <ArticleForm />
                </RoleGuard>
              } />
              
              <Route path="categories" element={
                <RoleGuard allowedRoles={['SUPER_ADMIN', 'ADMIN', 'EDITOR']}>
                  <CategoriesManager />
                </RoleGuard>
              } />
              
              <Route path="tags" element={
                <RoleGuard allowedRoles={['SUPER_ADMIN', 'ADMIN', 'EDITOR', 'AUTHOR']}>
                  <TagsManager />
                </RoleGuard>
              } />
              
              <Route path="media" element={
                <RoleGuard allowedRoles={['SUPER_ADMIN', 'ADMIN', 'EDITOR', 'AUTHOR']}>
                  <MediaManager />
                </RoleGuard>
              } />
              
              <Route path="users" element={
                <RoleGuard allowedRoles={['SUPER_ADMIN', 'ADMIN']}>
                  <UsersManager />
                </RoleGuard>
              } />
              
              <Route path="notifications" element={
                <RoleGuard allowedRoles={['SUPER_ADMIN', 'ADMIN', 'EDITOR', 'AUTHOR', 'VIEWER']}>
                  <NotificationsManager />
                </RoleGuard>
              } />
            </Route>

            {/* Fallback route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}
