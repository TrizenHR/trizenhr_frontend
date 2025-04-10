
import React from 'react';
import { Outlet } from 'react-router-dom';
import DashboardLayout from '@/components/DashboardLayout';
import { useAuth } from '../contexts/AuthContext';

const AdminDashboard: React.FC = () => {
  const { userRole } = useAuth();

  // This would normally be a loading state or redirect
  if (userRole !== 'admin') {
    return <div>Not authorized</div>;
  }

  return (
    <DashboardLayout>
      <Outlet />
    </DashboardLayout>
  );
};

export default AdminDashboard;
