
import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from "@/components/ui/button";

const UserDashboard: React.FC = () => {
  const { logout } = useAuth();

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white border-b px-6 py-3 flex justify-between items-center">
        <div className="text-lg font-bold">NOQU-TAM - User Dashboard</div>
        <Button 
          variant="outline"
          onClick={logout}
        >
          Logout
        </Button>
      </header>
      <main className="p-6">
        <h1 className="text-2xl font-bold mb-4">Welcome to User Dashboard</h1>
        <p className="text-gray-600">This is a placeholder for the user dashboard. More features coming soon.</p>
      </main>
    </div>
  );
};

export default UserDashboard;
