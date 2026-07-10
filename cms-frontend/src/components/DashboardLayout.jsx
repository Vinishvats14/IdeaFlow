import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Sidebar from './Sidebar';

export default function DashboardLayout() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'hsl(210, 40%, 98%)', color: 'hsl(215, 30%, 18%)' }}>
        <p>Loading Dashboard Space...</p>
      </div>
    );
  }

  // Route Guard: Redirect to login if not authenticated
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="dashboard-layout" style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--bg-primary)' }}>
      {/* Dynamic Sidebar */}
      <Sidebar />
      
      {/* Dashboard Main Content Canvas */}
      <main className="dashboard-main">
        <Outlet />
      </main>
    </div>
  );
}
