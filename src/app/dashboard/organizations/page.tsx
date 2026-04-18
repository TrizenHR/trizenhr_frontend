'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { organizationApi, userApi } from '@/lib/api';
import { requestNotificationsRefresh } from '@/lib/notifications-events';
import { Organization, SubscriptionPlan, CreateOrganizationPayload, UserRole } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Building2, CheckCircle, XCircle, Plus, Edit, Trash2, Users } from 'lucide-react';
import { format } from 'date-fns';

export default function OrganizationsPage() {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [filteredOrganizations, setFilteredOrganizations] = useState<Organization[]>([]);
  const [companyAdminNames, setCompanyAdminNames] = useState<Record<string, string>>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [planFilter, setPlanFilter] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentOrgId, setCurrentOrgId] = useState<string | null>(null);
  const [formData, setFormData] = useState<CreateOrganizationPayload>({
    name: '',
    subdomain: '',
    subscriptionPlan: SubscriptionPlan.FREE,
    microsoftAuth: {
      tenantId: '',
      domain: '',
      allowMicrosoftAuth: false,
      allowLocalAuth: true,
    },
  });

  const { toast } = useToast();

  useEffect(() => {
    loadOrganizations();
  }, []);

  useEffect(() => {
    filterOrganizations();
  }, [organizations, searchQuery, statusFilter, planFilter]);

  const loadOrganizations = async () => {
    try {
      setIsLoading(true);
      const data = await organizationApi.getAll();
      setOrganizations(data);

      // For System Admin view: resolve company admin for each organization
      const adminEntries = await Promise.all(
        data.map(async (org) => {
          try {
            const admins = await userApi.getAllUsers({
              role: UserRole.ADMIN,
              isActive: true,
              organizationId: org._id,
            });
            const admin = admins[0];
            const name = admin
              ? admin.fullName || `${admin.firstName} ${admin.lastName}`.trim() || admin.email
              : '-';
            return [org._id, name] as const;
          } catch {
            return [org._id, '-'] as const;
          }
        })
      );

      setCompanyAdminNames(Object.fromEntries(adminEntries));
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to load organizations',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filterOrganizations = () => {
    let filtered = [...organizations];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (org) =>
          org.name.toLowerCase().includes(query) ||
          org.subdomain?.toLowerCase().includes(query)
      );
    }

    // Status filter
    if (statusFilter === 'active') {
      filtered = filtered.filter((org) => org.isActive);
    } else if (statusFilter === 'inactive') {
      filtered = filtered.filter((org) => !org.isActive);
    }

    // Plan filter
    if (planFilter !== 'all') {
      filtered = filtered.filter((org) => org.subscriptionPlan === planFilter);
    }

    setFilteredOrganizations(filtered);
  };

  const handleCreateOrUpdate = async () => {
    try {
      if (isEditing && currentOrgId) {
        await organizationApi.update(currentOrgId, formData);
        toast({
          title: 'Success',
          description: 'Organization updated successfully',
        });
      } else {
        await organizationApi.create(formData);
        toast({
          title: 'Success',
          description: 'Organization created successfully',
        });
      }
      setIsDialogOpen(false);
      resetForm();
      loadOrganizations();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Operation failed',
        variant: 'destructive',
      });
    }
  };

  const handleEdit = (org: Organization) => {
    setIsEditing(true);
    setCurrentOrgId(org._id);
    setFormData({
      name: org.name,
      subdomain: org.subdomain,
      subscriptionPlan: org.subscriptionPlan,
      microsoftAuth: {
        tenantId: org.microsoftAuth?.tenantId || '',
        domain: org.microsoftAuth?.domain || '',
        allowMicrosoftAuth: org.microsoftAuth?.allowMicrosoftAuth || false,
        allowLocalAuth: org.microsoftAuth?.allowLocalAuth ?? true,
      },
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this organization?')) return;

    try {
      await organizationApi.delete(id);
      requestNotificationsRefresh();
      toast({
        title: 'Success',
        description: 'Organization deleted successfully',
      });
      loadOrganizations();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to delete organization',
        variant: 'destructive',
      });
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      subdomain: '',
      subscriptionPlan: SubscriptionPlan.FREE,
      microsoftAuth: {
        tenantId: '',
        domain: '',
        allowMicrosoftAuth: false,
        allowLocalAuth: true,
      },
    });
    setIsEditing(false);
    setCurrentOrgId(null);
  };

  const getPlanBadgeColor = (plan: SubscriptionPlan) => {
    const colors = {
      [SubscriptionPlan.FREE]: 'bg-gray-100 text-gray-800',
      [SubscriptionPlan.BASIC]: 'bg-blue-100 text-blue-800',
      [SubscriptionPlan.PREMIUM]: 'bg-purple-100 text-purple-800',
      [SubscriptionPlan.ENTERPRISE]: 'bg-yellow-100 text-yellow-800',
    };
    return colors[plan] || 'bg-gray-100 text-gray-800';
  };

  const stats = {
    total: organizations.length,
    active: organizations.filter((o) => o.isActive).length,
    inactive: organizations.filter((o) => !o.isActive).length,
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Organizations</h1>
          <p className="text-muted-foreground">Manage client organizations</p>
        </div>
        <Button onClick={() => setIsDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Organization
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Organizations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-blue-600" />
              <span className="text-2xl font-bold text-blue-600">{stats.total}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-2xl font-bold text-green-600">{stats.active}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Inactive</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <XCircle className="h-4 w-4 text-red-600" />
              <span className="text-2xl font-bold text-red-600">{stats.inactive}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Search</Label>
              <Input
                placeholder="Name, subdomain..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Plan</Label>
              <Select value={planFilter} onValueChange={setPlanFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Plans</SelectItem>
                  <SelectItem value={SubscriptionPlan.FREE}>Free</SelectItem>
                  <SelectItem value={SubscriptionPlan.BASIC}>Basic</SelectItem>
                  <SelectItem value={SubscriptionPlan.PREMIUM}>Premium</SelectItem>
                  <SelectItem value={SubscriptionPlan.ENTERPRISE}>Enterprise</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Organizations Table */}
      <Card>
        <CardHeader>
          <CardTitle>Organizations ({filteredOrganizations.length})</CardTitle>
          <CardDescription>Manage all client organizations</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-center text-muted-foreground py-8">Loading...</p>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Company Admin</TableHead>
                    <TableHead>Subdomain</TableHead>
                    <TableHead>Plan</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrganizations.length > 0 ? (
                    filteredOrganizations.map((org) => (
                      <TableRow key={org._id}>
                        <TableCell className="font-medium">{org.name}</TableCell>
                        <TableCell>{companyAdminNames[org._id] || '-'}</TableCell>
                        <TableCell>{org.subdomain || '-'}</TableCell>
                        <TableCell>
                          <Badge className={getPlanBadgeColor(org.subscriptionPlan)} variant="outline">
                            {org.subscriptionPlan}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {org.isActive ? (
                            <Badge className="bg-green-100 text-green-800">Active</Badge>
                          ) : (
                            <Badge className="bg-red-100 text-red-800">Inactive</Badge>
                          )}
                        </TableCell>
                        <TableCell>{format(new Date(org.createdAt), 'MMM dd, yyyy')}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Link href={`/dashboard/users/create?orgId=${org._id}`}>
                              <Button variant="ghost" size="sm" title="Create Company Admin for this organization">
                                <Users className="h-4 w-4" />
                              </Button>
                            </Link>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(org)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(org._id)}
                            >
                              <Trash2 className="h-4 w-4 text-red-600" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                        No organizations found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>{isEditing ? 'Edit Organization' : 'Create Organization'}</DialogTitle>
            <DialogDescription>
              {isEditing ? 'Update organization details' : 'Add a new client organization'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="overflow-y-auto flex-1 px-1">
            <div className="space-y-6 py-4">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-foreground">Basic Information</h3>
                
                <div className="space-y-2">
                  <Label htmlFor="name">Organization Name *</Label>
                  <Input
                    id="name"
                    placeholder="Acme Corporation"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="subdomain">Subdomain (Optional)</Label>
                  <Input
                    id="subdomain"
                    placeholder="acme"
                    value={formData.subdomain || ''}
                    onChange={(e) => setFormData({ ...formData, subdomain: e.target.value })}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="plan">Subscription Plan</Label>
                  <Select
                    value={formData.subscriptionPlan}
                    onValueChange={(value) =>
                      setFormData({ ...formData, subscriptionPlan: value as SubscriptionPlan })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={SubscriptionPlan.FREE}>Free</SelectItem>
                      <SelectItem value={SubscriptionPlan.BASIC}>Basic</SelectItem>
                      <SelectItem value={SubscriptionPlan.PREMIUM}>Premium</SelectItem>
                      <SelectItem value={SubscriptionPlan.ENTERPRISE}>Enterprise</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Microsoft Authentication Section */}
              <div className="border-t pt-6">
                <h3 className="text-sm font-semibold text-foreground mb-4">Authentication Settings</h3>
                
                <div className="space-y-5">
                  <div className="flex items-start justify-between gap-4 p-3 rounded-lg border bg-muted/30">
                    <div className="flex-1 space-y-1">
                      <Label className="text-sm font-medium">Microsoft Sign-In</Label>
                      <p className="text-xs text-muted-foreground">Allow users to authenticate with their Microsoft accounts</p>
                    </div>
                    <Switch
                      checked={formData.microsoftAuth?.allowMicrosoftAuth || false}
                      onCheckedChange={(checked: boolean) =>
                        setFormData({
                          ...formData,
                          microsoftAuth: { 
                            tenantId: formData.microsoftAuth?.tenantId || '',
                            domain: formData.microsoftAuth?.domain || '',
                            allowMicrosoftAuth: checked,
                            allowLocalAuth: formData.microsoftAuth?.allowLocalAuth ?? true,
                          },
                        })
                      }
                    />
                  </div>

                  <div className="flex items-start justify-between gap-4 p-3 rounded-lg border bg-muted/30">
                    <div className="flex-1 space-y-1">
                      <Label className="text-sm font-medium">Email/Password Login</Label>
                      <p className="text-xs text-muted-foreground">Allow traditional email and password authentication</p>
                    </div>
                    <Switch
                      checked={formData.microsoftAuth?.allowLocalAuth ?? true}
                      onCheckedChange={(checked: boolean) =>
                        setFormData({
                          ...formData,
                          microsoftAuth: {
                            tenantId: formData.microsoftAuth?.tenantId || '',
                            domain: formData.microsoftAuth?.domain || '',
                            allowMicrosoftAuth: formData.microsoftAuth?.allowMicrosoftAuth || false,
                            allowLocalAuth: checked,
                          },
                        })
                      }
                    />
                  </div>

                  {formData.microsoftAuth?.allowMicrosoftAuth && (
                    <div className="space-y-4 pt-2">
                      <div className="space-y-2">
                        <Label htmlFor="domain" className="text-sm font-medium">Email Domain</Label>
                        <Input
                          id="domain"
                          placeholder="e.g., trizenventures.com"
                          value={formData.microsoftAuth?.domain || ''}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              microsoftAuth: {
                                tenantId: formData.microsoftAuth?.tenantId || '',
                                domain: e.target.value,
                                allowMicrosoftAuth: formData.microsoftAuth?.allowMicrosoftAuth || false,
                                allowLocalAuth: formData.microsoftAuth?.allowLocalAuth ?? true,
                              },
                            })
                          }
                        />
                        <p className="text-xs text-muted-foreground">Optional: Match users by their email domain</p>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="tenantId" className="text-sm font-medium">Azure AD Tenant ID</Label>
                        <Input
                          id="tenantId"
                          placeholder="e.g., 12345678-abcd-1234-5678-abcdef123456"
                          value={formData.microsoftAuth?.tenantId || ''}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              microsoftAuth: {
                                tenantId: e.target.value,
                                domain: formData.microsoftAuth?.domain || '',
                                allowMicrosoftAuth: formData.microsoftAuth?.allowMicrosoftAuth || false,
                                allowLocalAuth: formData.microsoftAuth?.allowLocalAuth ?? true,
                              },
                            })
                          }
                        />
                        <p className="text-xs text-muted-foreground">Optional: Restrict access to a specific Azure AD tenant</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => {
              setIsDialogOpen(false);
              resetForm();
            }}>
              Cancel
            </Button>
            <Button onClick={handleCreateOrUpdate}>
              {isEditing ? 'Update Organization' : 'Create Organization'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
