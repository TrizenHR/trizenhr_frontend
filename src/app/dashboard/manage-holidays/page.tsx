'use client';

import { useEffect, useState } from 'react';
import { holidayApi } from '@/lib/api';
import { Holiday, HolidayType, HolidayFormData } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { Plus, Pencil, Trash2, Calendar as CalendarIcon, Repeat, Upload } from 'lucide-react';
import { format } from 'date-fns';
import BulkUploadDialog from '@/components/holidays/BulkUploadDialog';
import { useAuth } from '@/hooks/use-auth';
import { canManageHolidays } from '@/lib/permissions';

export default function ManageHolidaysPage() {
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingHoliday, setEditingHoliday] = useState<Holiday | null>(null);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  
  const [formData, setFormData] = useState<HolidayFormData>({
    name: '',
    date: '',
    type: HolidayType.COMPANY,
    description: '',
    isRecurring: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isBulkUploadOpen, setIsBulkUploadOpen] = useState(false);

  const { toast } = useToast();
  const { user } = useAuth();
  const canManage = user ? canManageHolidays(user.role) : false;

  useEffect(() => {
    loadHolidays();
  }, [selectedYear]);

  const loadHolidays = async () => {
    try {
      setIsLoading(true);
      const data = await holidayApi.getAll({ year: selectedYear });
      setHolidays(data);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to load holidays',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenDialog = (holiday?: Holiday) => {
    if (holiday) {
      setEditingHoliday(holiday);
      setFormData({
        name: holiday.name,
        date: format(new Date(holiday.date), 'yyyy-MM-dd'),
        type: holiday.type,
        description: holiday.description || '',
        isRecurring: holiday.isRecurring,
      });
    } else {
      setEditingHoliday(null);
      setFormData({
        name: '',
        date: '',
        type: HolidayType.COMPANY,
        description: '',
        isRecurring: false,
      });
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.date) {
      toast({
        title: 'Validation Error',
        description: 'Name and date are required',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsSubmitting(true);

      if (editingHoliday) {
        await holidayApi.update(editingHoliday._id, formData);
        toast({
          title: 'Success',
          description: 'Holiday updated successfully',
        });
      } else {
        await holidayApi.create(formData);
        toast({
          title: 'Success',
          description: 'Holiday created successfully',
        });
      }

      setIsDialogOpen(false);
      loadHolidays();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Failed to save holiday',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this holiday?')) return;

    try {
      await holidayApi.delete(id);
      toast({
        title: 'Success',
        description: 'Holiday deleted successfully',
      });
      loadHolidays();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to delete holiday',
        variant: 'destructive',
      });
    }
  };

  const getTypeColor = (type: HolidayType) => {
    const colors: Record<HolidayType, string> = {
      [HolidayType.NATIONAL]: 'bg-red-100 text-red-800',
      [HolidayType.COMPANY]: 'bg-blue-100 text-blue-800',
      [HolidayType.OPTIONAL]: 'bg-yellow-100 text-yellow-800',
    };
    return colors[type];
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - 1 + i);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Manage Holidays</h1>
          <p className="text-muted-foreground">Configure company and national holidays</p>
        </div>
        <div className="flex gap-2">
          <Select
            value={selectedYear.toString()}
            onValueChange={(value) => setSelectedYear(parseInt(value))}
          >
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {years.map((year) => (
                <SelectItem key={year} value={year.toString()}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {canManage && (
            <>
              <Button variant="outline" onClick={() => setIsBulkUploadOpen(true)}>
                <Upload className="mr-2 h-4 w-4" />
                Bulk Upload
              </Button>
              <Button onClick={() => handleOpenDialog()}>
                <Plus className="mr-2 h-4 w-4" />
                Add Holiday
              </Button>
            </>
          )}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Holidays ({selectedYear})</CardTitle>
          <CardDescription>
            {canManage
              ? 'Manage holidays for the selected year'
              : 'View holidays for the selected year (Admin only can manage)'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-center text-muted-foreground py-8">Loading...</p>
          ) : holidays.length > 0 ? (
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="min-w-[150px]">Date</TableHead>
                    <TableHead className="min-w-[150px]">Name</TableHead>
                    <TableHead className="min-w-[100px]">Type</TableHead>
                    <TableHead className="min-w-[200px]">Description</TableHead>
                    <TableHead className="min-w-[100px]">Recurring</TableHead>
                    <TableHead className="text-right min-w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {holidays.map((holiday) => (
                    <TableRow key={holiday._id}>
                      <TableCell className="whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                          {format(new Date(holiday.date), 'MMM dd, yyyy (EEE)')}
                        </div>
                      </TableCell>
                      <TableCell className="font-medium whitespace-nowrap">{holiday.name}</TableCell>
                      <TableCell className="whitespace-nowrap">
                        <Badge variant="outline" className={getTypeColor(holiday.type)}>
                          {holiday.type}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-xs truncate">
                        {holiday.description || '-'}
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        {holiday.isRecurring && (
                          <Badge variant="secondary" className="flex items-center gap-1 w-fit">
                            <Repeat className="h-3 w-3" />
                            Yearly
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {canManage && (
                          <div className="flex justify-end gap-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleOpenDialog(holiday)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDelete(holiday._id)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">
              No holidays configured for {selectedYear}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Holiday Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="w-[95vw] max-w-[500px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingHoliday ? 'Edit Holiday' : 'Add New Holiday'}
            </DialogTitle>
            <DialogDescription>
              {editingHoliday
                ? 'Update the holiday details below'
                : 'Create a new holiday for the company'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Holiday Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., New Year's Day"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date">Date *</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">Type *</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) =>
                    setFormData({ ...formData, type: value as HolidayType })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={HolidayType.NATIONAL}>National</SelectItem>
                    <SelectItem value={HolidayType.COMPANY}>Company</SelectItem>
                    <SelectItem value={HolidayType.OPTIONAL}>Optional</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Optional description"
                rows={2}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="recurring"
                checked={formData.isRecurring}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, isRecurring: checked as boolean })
                }
              />
              <Label htmlFor="recurring" className="text-sm font-normal cursor-pointer">
                Recurring yearly (will appear every year)
              </Label>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Saving...' : editingHoliday ? 'Update' : 'Create'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Bulk Upload Dialog */}
      <BulkUploadDialog
        open={isBulkUploadOpen}
        onOpenChange={setIsBulkUploadOpen}
        onSuccess={() => {
          loadHolidays();
        }}
      />
    </div>
  );
}
