
import React from 'react';
import { Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const AdminDashboard: React.FC = () => {
  const { userRole } = useAuth();

  // This would normally be a loading state or redirect
  if (userRole !== 'admin') {
    return <div>Not authorized</div>;
  }

  return <Outlet />;
};

export default AdminDashboard;
