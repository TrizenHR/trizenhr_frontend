'use client';

import { useEffect, useMemo, useState } from 'react';
import { officeLocationApi } from '@/lib/api';
import { OfficeLocation } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
import { useToast } from '@/hooks/use-toast';
import { Building2, Plus, MapPin, Save, Trash2 } from 'lucide-react';

type FormState = {
  name: string;
  address: string;
  latitude: string;
  longitude: string;
  radiusMeters: string;
};

const emptyForm: FormState = {
  name: '',
  address: '',
  latitude: '',
  longitude: '',
  radiusMeters: '150',
};

export default function OfficeLocationsPage() {
  const { toast } = useToast();
  const [locations, setLocations] = useState<OfficeLocation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deactivateTarget, setDeactivateTarget] = useState<OfficeLocation | null>(null);
  const [editing, setEditing] = useState<OfficeLocation | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);

  const stats = useMemo(
    () => ({
      total: locations.length,
      active: locations.filter((l) => l.isActive).length,
    }),
    [locations]
  );

  useEffect(() => {
    void loadLocations();
  }, []);

  const loadLocations = async () => {
    try {
      setIsLoading(true);
      const data = await officeLocationApi.list();
      setLocations(Array.isArray(data) ? data : []);
    } catch {
      setLocations([]);
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = (location?: OfficeLocation) => {
    if (location) {
      setForm({
        name: location.name,
        address: location.address || '',
        latitude: String(location.latitude),
        longitude: String(location.longitude),
        radiusMeters: String(location.radiusMeters),
      });
    } else {
      setForm(emptyForm);
    }
  };

  const openAddDialog = () => {
    setEditing(null);
    resetForm();
    setDialogOpen(true);
  };

  const openEditDialog = (location: OfficeLocation) => {
    setEditing(location);
    resetForm(location);
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      toast({ title: 'Validation Error', description: 'Name is required', variant: 'destructive' });
      return;
    }
    const lat = parseFloat(form.latitude);
    const lng = parseFloat(form.longitude);
    if (isNaN(lat) || isNaN(lng)) {
      toast({ title: 'Validation Error', description: 'Valid latitude and longitude are required', variant: 'destructive' });
      return;
    }
    const radius = parseInt(form.radiusMeters) || 150;

    const payload = {
      name: form.name.trim(),
      address: form.address.trim() || undefined,
      latitude: lat,
      longitude: lng,
      radiusMeters: radius,
    };

    try {
      setIsSaving(true);
      if (editing) {
        await officeLocationApi.update(editing._id, payload);
        toast({ title: 'Updated', description: 'Office location updated successfully.' });
      } else {
        await officeLocationApi.create(payload);
        toast({ title: 'Created', description: 'Office location created successfully.' });
      }
      setDialogOpen(false);
      await loadLocations();
    } catch (error: any) {
      toast({
        title: 'Save Failed',
        description: error.response?.data?.error || 'Failed to save',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeactivate = async () => {
    if (!deactivateTarget) return;
    try {
      await officeLocationApi.deactivate(deactivateTarget._id);
      toast({ title: 'Deactivated', description: 'Office location deactivated.' });
      setDeactivateTarget(null);
      await loadLocations();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Failed to deactivate',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold md:text-3xl">Office Locations</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage geofence-enabled office locations for attendance</p>
        </div>
        <Button onClick={openAddDialog}>
          <Plus className="mr-2 h-4 w-4" />
          Add Location
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center gap-2 py-3">
            <Building2 className="h-4 w-4 text-muted-foreground" />
            <CardTitle className="text-sm font-medium">Total</CardTitle>
          </CardHeader>
          <CardContent className="py-2">
            <p className="text-2xl font-bold">{stats.total}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center gap-2 py-3">
            <MapPin className="h-4 w-4 text-green-500" />
            <CardTitle className="text-sm font-medium">Active</CardTitle>
          </CardHeader>
          <CardContent className="py-2">
            <p className="text-2xl font-bold">{stats.active}</p>
          </CardContent>
        </Card>
      </div>

      {isLoading ? (
        <div className="text-center py-8 text-muted-foreground">Loading...</div>
      ) : locations.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <Building2 className="mx-auto h-12 w-12 mb-3 opacity-30" />
          <p>No office locations yet. Add one to enable geofencing.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {locations.map((loc) => (
            <Card key={loc._id} className={loc.isActive ? '' : 'opacity-60'}>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-base">{loc.name}</CardTitle>
                  <Badge variant={loc.isActive ? 'default' : 'secondary'}>
                    {loc.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
                {loc.address && (
                  <CardDescription className="text-xs">{loc.address}</CardDescription>
                )}
              </CardHeader>
              <CardContent className="space-y-1 text-sm">
                <p className="text-muted-foreground">
                  <span className="font-medium">Lat:</span> {loc.latitude.toFixed(6)}
                </p>
                <p className="text-muted-foreground">
                  <span className="font-medium">Lng:</span> {loc.longitude.toFixed(6)}
                </p>
                <p className="text-muted-foreground">
                  <span className="font-medium">Radius:</span> {loc.radiusMeters}m
                </p>
                <div className="flex gap-2 pt-2">
                  <Button variant="outline" size="sm" onClick={() => openEditDialog(loc)}>
                    Edit
                  </Button>
                  {loc.isActive && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-destructive hover:text-destructive"
                      onClick={() => setDeactivateTarget(loc)}
                    >
                      <Trash2 className="mr-1 h-3 w-3" />
                      Deactivate
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="w-[95vw] max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit Office Location' : 'Add Office Location'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={form.name}
                onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                placeholder="e.g., Head Office, Branch A"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Address (optional)</Label>
              <Input
                id="address"
                value={form.address}
                onChange={(e) => setForm((p) => ({ ...p, address: e.target.value }))}
                placeholder="Street, city, etc."
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="lat">Latitude</Label>
                <Input
                  id="lat"
                  type="number"
                  step="any"
                  value={form.latitude}
                  onChange={(e) => setForm((p) => ({ ...p, latitude: e.target.value }))}
                  placeholder="28.6139"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lng">Longitude</Label>
                <Input
                  id="lng"
                  type="number"
                  step="any"
                  value={form.longitude}
                  onChange={(e) => setForm((p) => ({ ...p, longitude: e.target.value }))}
                  placeholder="77.2090"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="radius">Radius (meters)</Label>
              <Input
                id="radius"
                type="number"
                min={10}
                max={5000}
                value={form.radiusMeters}
                onChange={(e) => setForm((p) => ({ ...p, radiusMeters: e.target.value }))}
              />
              <p className="text-xs text-muted-foreground">Recommended: 100-300m for GPS accuracy tolerance.</p>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              <Save className="mr-2 h-4 w-4" />
              {isSaving ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deactivateTarget} onOpenChange={() => setDeactivateTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Deactivate Location</AlertDialogTitle>
            <AlertDialogDescription>
              Deactivate &quot;{deactivateTarget?.name}&quot;? Check-ins will no longer verify against this location.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeactivate} className="bg-destructive text-destructive-foreground">
              Deactivate
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
