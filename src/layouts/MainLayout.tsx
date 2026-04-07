import React, { useEffect, useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import { useAppContext } from '../context/AppContext';

export default function MainLayout() {
  const { userName } = useAppContext();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    if (!userName) {
      navigate('/');
    }
  }, [userName, navigate]);

  if (!userName) return null;

  return (
    <div className="main-wrapper">
      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div className="sidebar-overlay" onClick={() => setIsSidebarOpen(false)} />
      )}

      {/* Sidebar with mobile toggle classes */}
      <div className={`sidebar-container ${!isSidebarOpen ? 'sidebar-hidden' : ''}`}>
        <Sidebar onClose={() => setIsSidebarOpen(false)} />
      </div>

      <div className="content-container">
        <Topbar onMenuClick={() => setIsSidebarOpen(true)} />
        <main style={{ flex: 1, padding: '90px 3rem 3rem 3rem', maxWidth: '1200px', margin: '0 0', width: '100%' }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
