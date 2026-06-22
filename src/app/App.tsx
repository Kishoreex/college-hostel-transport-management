import { BrowserRouter, Routes, Route, Navigate } from 'react-router';
import { useState } from 'react';
import { Toaster } from 'sonner';
import Login from './components/auth/Login';
import StudentDashboard from './components/dashboards/StudentDashboard';
import AdminDashboard from './components/dashboards/AdminDashboard';
import WardenDashboard from './components/dashboards/WardenDashboard';
import SecurityDashboard from './components/dashboards/SecurityDashboard';
import TransportDashboard from './components/dashboards/TransportDashboard';
import HostelManagement from './components/hostel/HostelManagement';
import OutpassManagement from './components/outpass/OutpassManagement';
import TransportManagement from './components/transport/TransportManagement';
import Analytics from './components/analytics/Analytics';
import Settings from './components/settings/Settings';
import type { User } from './types';

export default function App() {
  const [user, setUser] = useState<User | null>(null);

  const handleLogin = (userData: User) => {
    setUser(userData);
  };

  const handleLogout = () => {
    window.history.replaceState(null, '', '/');
    setUser(null);
  };

  if (!user) {
    return (
      <>
        <Toaster position="top-center" richColors expand={false} closeButton />
        <Login onLogin={handleLogin} />
      </>
    );
  }

  return (
    <>
    <Toaster position="top-center" richColors expand={false} closeButton />
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to={`/${user.role}`} replace />} />

        {/* Student Routes */}
        <Route path="/student" element={<StudentDashboard user={user} onLogout={handleLogout} />} />

        {/* Admin Routes */}
      {/* Admin Routes */}

<Route
  path="/admin"
  element={
    <AdminDashboard
      user={user}
      onLogout={handleLogout}
    />
  }
/>

<Route
  path="/admin/hostel"
  element={
    user.isSystemAdmin ||
    user.canManageBoysHostel ||
    user.canManageGirlsHostel
      ? (
          <HostelManagement
            user={user}
            onLogout={handleLogout}
          />
        )
      : <Navigate to="/admin" replace />
  }
/>

<Route
  path="/admin/transport"
  element={
    user.isSystemAdmin ||
    user.canManageTransport
      ? (
          <TransportManagement
            user={user}
            onLogout={handleLogout}
          />
        )
      : <Navigate to="/admin" replace />
  }
/>

<Route
  path="/admin/outpass"
  element={
    user.isSystemAdmin
      ? (
          <OutpassManagement
            user={user}
            onLogout={handleLogout}
          />
        )
      : <Navigate to="/admin" replace />
  }
/>

<Route
  path="/admin/analytics"
  element={
    user.isSystemAdmin
      ? (
          <Analytics
            user={user}
            onLogout={handleLogout}
          />
        )
      : <Navigate to="/admin" replace />
  }
/>

<Route
  path="/admin/settings"
  element={
    <Settings
      user={user}
      onLogout={handleLogout}
    />
  }
/>

        {/* Warden Routes */}
        <Route path="/warden" element={<WardenDashboard user={user} onLogout={handleLogout} />} />

        {/* Security Routes */}
        <Route path="/security" element={<SecurityDashboard user={user} onLogout={handleLogout} />} />

        {/* Transport Coordinator Routes */}
        <Route path="/transport" element={<TransportDashboard user={user} onLogout={handleLogout} />} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
    </>
  );
}
