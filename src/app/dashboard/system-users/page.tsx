'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { UserPlus, Trash2, Edit, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/use-auth';
import { UserRole, User } from '@/lib/types';
import { userApi } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { getRoleColor, getRoleDisplayName } from '@/lib/permissions';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export default function SystemUsersPage() {
  const { user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteUserId, setDeleteUserId] = useState<string | null>(null);

  // Only Super Admin can access this page
  if (!user || user.role !== UserRole.SUPER_ADMIN) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <Shield className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-500">
            Only Super Admins can access system user management.
          </p>
        </div>
      </div>
    );
  }

  useEffect(() => {
    loadSystemUsers();
  }, []);

  const loadSystemUsers = async () => {
    try {
      setIsLoading(true);
      // Get all users and filter for Super Admins only
      const allUsers = await userApi.getAllUsers();
      const systemUsers = allUsers.filter((u) => u.role === UserRole.SUPER_ADMIN);
      setUsers(systemUsers);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to load system users',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (userId: string) => {
    try {
      await userApi.deleteUser(userId);
      toast({
        title: 'Success',
        description: 'User deleted successfully',
      });
      loadSystemUsers();
      setDeleteUserId(null);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete user',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">System Users</h1>
          <p className="text-muted-foreground">
            Manage System Admin accounts for platform administration
          </p>
        </div>
        <Button onClick={() => router.push('/dashboard/system-users/create')}>
          <UserPlus className="mr-2 h-4 w-4" />
          Create System Admin
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>System Administrators</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-center py-8 text-muted-foreground">Loading...</p>
          ) : users.length === 0 ? (
            <div className="text-center py-8">
              <Shield className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p className="text-muted-foreground mb-4">No system users found</p>
              <Button onClick={() => router.push('/dashboard/system-users/create')}>
                <UserPlus className="mr-2 h-4 w-4" />
                Create First System Admin
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {users.map((systemUser) => (
                <div
                  key={systemUser._id}
                  className="flex items-center justify-between p-4 rounded-lg border hover:bg-gray-50 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="font-semibold text-lg">
                        {systemUser.firstName} {systemUser.lastName}
                      </h3>
                      <Badge className={getRoleColor(systemUser.role as UserRole)}>
                        {getRoleDisplayName(systemUser.role as UserRole)}
                      </Badge>
                      {systemUser._id === user.id && (
                        <Badge variant="outline" className="bg-blue-50 text-blue-700">
                          You
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{systemUser.email}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => router.push(`/dashboard/system-users/${systemUser._id}`)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setDeleteUserId(systemUser._id)}
                      disabled={systemUser._id === user.id}
                      className="text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteUserId} onOpenChange={(open) => !open && setDeleteUserId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this System Admin account. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteUserId && handleDelete(deleteUserId)}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
