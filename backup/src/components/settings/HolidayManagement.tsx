
import React, { useState } from 'react';
import { format, parse } from 'date-fns';
import { 
  Calendar as CalendarIcon, 
  Plus,
  UploadCloud,
  Download,
  Search,
  Edit,
  Trash,
  Gift
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Calendar } from '@/components/ui/calendar';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

interface HolidayManagementProps {
  onChange: () => void;
}

type Holiday = {
  id: number;
  name: string;
  date: Date;
  type: 'public' | 'optional' | 'regional';
  visibility: string[];
  description?: string;
};

const departments = [
  { id: 'all', name: 'All Departments' },
  { id: 'tech', name: 'Technology' },
  { id: 'hr', name: 'Human Resources' },
  { id: 'finance', name: 'Finance' },
  { id: 'marketing', name: 'Marketing' },
  { id: 'operations', name: 'Operations' }
];

// Mock holidays data
const initialHolidays: Holiday[] = [
  {
    id: 1,
    name: 'New Year\'s Day',
    date: new Date(2025, 0, 1),
    type: 'public',
    visibility: ['all'],
    description: 'Happy New Year!'
  },
  {
    id: 2,
    name: 'Republic Day',
    date: new Date(2025, 0, 26),
    type: 'public',
    visibility: ['all'],
    description: 'National holiday celebrating the constitution'
  },
  {
    id: 3,
    name: 'Holi',
    date: new Date(2025, 2, 14),
    type: 'public',
    visibility: ['all'],
    description: 'Festival of colors'
  },
  {
    id: 4,
    name: 'Good Friday',
    date: new Date(2025, 3, 18),
    type: 'optional',
    visibility: ['all'],
    description: 'Christian holiday'
  },
  {
    id: 5,
    name: 'Independence Day',
    date: new Date(2025, 7, 15),
    type: 'public',
    visibility: ['all'],
    description: 'National holiday'
  },
  {
    id: 6,
    name: 'Diwali',
    date: new Date(2025, 10, 12),
    type: 'public',
    visibility: ['all'],
    description: 'Festival of lights'
  },
  {
    id: 7,
    name: 'Regional Conference',
    date: new Date(2025, 5, 15),
    type: 'regional',
    visibility: ['tech', 'marketing'],
    description: 'Tech and Marketing departments only'
  },
  {
    id: 8,
    name: 'Christmas',
    date: new Date(2025, 11, 25),
    type: 'public',
    visibility: ['all'],
    description: 'Christian holiday'
  }
];

const HolidayManagement: React.FC<HolidayManagementProps> = ({ onChange }) => {
  const [activeView, setActiveView] = useState('list');
  const [holidays, setHolidays] = useState<Holiday[]>(initialHolidays);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editingHoliday, setEditingHoliday] = useState<Holiday | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [holidayToDelete, setHolidayToDelete] = useState<number | null>(null);

  // Calendar highlights for holidays
  const holidayDates = holidays.map(holiday => holiday.date);

  // Filtered holidays based on search and filter type
  const filteredHolidays = holidays.filter(holiday => {
    const matchesSearch = holiday.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         format(holiday.date, 'MMMM dd, yyyy').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'all' || holiday.type === filterType;
    return matchesSearch && matchesType;
  });

  const handleAddHoliday = () => {
    setEditingHoliday(null);
    setAddDialogOpen(true);
  };

  const handleEditHoliday = (holiday: Holiday) => {
    setEditingHoliday(holiday);
    setAddDialogOpen(true);
  };

  const handleDeleteConfirm = (id: number) => {
    setHolidayToDelete(id);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteHoliday = () => {
    if (holidayToDelete) {
      setHolidays(holidays.filter(h => h.id !== holidayToDelete));
      setDeleteConfirmOpen(false);
      setHolidayToDelete(null);
      onChange();
    }
  };

  const handleSaveHoliday = (holiday: Omit<Holiday, 'id'>) => {
    if (editingHoliday) {
      setHolidays(holidays.map(h => 
        h.id === editingHoliday.id ? { ...holiday, id: editingHoliday.id } : h
      ));
    } else {
      setHolidays([...holidays, { ...holiday, id: holidays.length + 1 }]);
    }
    setAddDialogOpen(false);
    setEditingHoliday(null);
    onChange();
  };

  const getHolidayTypeColor = (type: string) => {
    switch (type) {
      case 'public': return 'bg-green-500';
      case 'optional': return 'bg-blue-500';
      case 'regional': return 'bg-amber-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-1">Holiday Management</h2>
        <p className="text-gray-500 text-sm">Configure public holidays and optional holidays for your organization</p>
      </div>

      <div className="flex justify-between items-center gap-4">
        <div className="flex-1 max-w-md relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Search holidays..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="public">Public Holidays</SelectItem>
            <SelectItem value="optional">Optional Holidays</SelectItem>
            <SelectItem value="regional">Regional Holidays</SelectItem>
          </SelectContent>
        </Select>
        
        <Tabs value={activeView} onValueChange={setActiveView} className="w-72">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="list">List View</TabsTrigger>
            <TabsTrigger value="calendar">Calendar View</TabsTrigger>
          </TabsList>
        </Tabs>
        
        <div className="flex gap-2">
          <Button variant="outline">
            <UploadCloud className="mr-2 h-4 w-4" />
            Import CSV
          </Button>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button onClick={handleAddHoliday}>
            <Plus className="mr-2 h-4 w-4" />
            Add Holiday
          </Button>
        </div>
      </div>

      <Tabs value={activeView} className="w-full">
        <TabsContent value="list" className="mt-0">
          <Card>
            <CardContent className="pt-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Visibility</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredHolidays.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                        No holidays found matching your search criteria
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredHolidays.map((holiday) => (
                      <TableRow key={holiday.id}>
                        <TableCell className="font-medium">{holiday.name}</TableCell>
                        <TableCell>{format(holiday.date, 'MMMM dd, yyyy')}</TableCell>
                        <TableCell>
                          <Badge className={`${getHolidayTypeColor(holiday.type)} text-white`}>
                            {holiday.type.charAt(0).toUpperCase() + holiday.type.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {holiday.visibility.includes('all') 
                            ? 'All Departments' 
                            : holiday.visibility.map(dept => {
                                const department = departments.find(d => d.id === dept);
                                return department ? department.name : dept;
                              }).join(', ')}
                        </TableCell>
                        <TableCell>{holiday.description || '-'}</TableCell>
                        <TableCell className="text-right">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => handleEditHoliday(holiday)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => handleDeleteConfirm(holiday.id)}
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="calendar" className="mt-0">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <div className="flex-1">
                  <Calendar
                    mode="single"
                    selected={new Date()}
                    className="rounded-md border"
                    modifiersStyles={{
                      holiday: { 
                        fontWeight: 'bold', 
                        backgroundColor: '#4ade80', 
                        color: 'white' 
                      }
                    }}
                    modifiers={{
                      holiday: holidayDates
                    }}
                  />
                </div>
                <div className="flex-1 border rounded-md p-4">
                  <h3 className="font-medium mb-3">Holiday Legend</h3>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full bg-green-500"></div>
                      <span>Public Holiday</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full bg-blue-500"></div>
                      <span>Optional Holiday</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full bg-amber-500"></div>
                      <span>Regional Holiday</span>
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <h3 className="font-medium mb-2">Upcoming Holidays</h3>
                    <div className="space-y-2 max-h-[200px] overflow-y-auto">
                      {holidays
                        .filter(h => h.date >= new Date())
                        .sort((a, b) => a.date.getTime() - b.date.getTime())
                        .slice(0, 5)
                        .map((holiday) => (
                        <div key={holiday.id} className="flex items-center gap-2">
                          <Gift className="h-4 w-4 text-primary" />
                          <span>
                            <strong>{format(holiday.date, 'MMM dd')}:</strong> {holiday.name}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Dialog for adding/editing holidays */}
      <Dialog 
        open={addDialogOpen} 
        onOpenChange={(open) => {
          if (!open) setAddDialogOpen(false);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingHoliday ? 'Edit Holiday' : 'Add New Holiday'}</DialogTitle>
            <DialogDescription>
              {editingHoliday 
                ? 'Update the details for this holiday' 
                : 'Fill in the details to add a new holiday to the calendar'}
            </DialogDescription>
          </DialogHeader>
          
          <HolidayForm 
            holiday={editingHoliday} 
            onSave={handleSaveHoliday}
            onCancel={() => setAddDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
      
      {/* Confirmation dialog for delete */}
      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Holiday</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this holiday? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirmOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteHoliday}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

interface HolidayFormProps {
  holiday: Holiday | null;
  onSave: (holiday: Omit<Holiday, 'id'>) => void;
  onCancel: () => void;
}

const HolidayForm: React.FC<HolidayFormProps> = ({ holiday, onSave, onCancel }) => {
  const [name, setName] = useState(holiday?.name || '');
  const [date, setDate] = useState<Date | undefined>(holiday?.date || undefined);
  const [type, setType] = useState<'public' | 'optional' | 'regional'>(holiday?.type || 'public');
  const [description, setDescription] = useState(holiday?.description || '');
  const [visibility, setVisibility] = useState<string[]>(holiday?.visibility || ['all']);
  const [dateOpen, setDateOpen] = useState(false);

  const handleVisibilityChange = (departmentId: string, checked: boolean) => {
    if (departmentId === 'all') {
      setVisibility(checked ? ['all'] : []);
    } else {
      setVisibility(prev => {
        // If 'all' is selected and we're checking another department, remove 'all'
        if (prev.includes('all') && checked) {
          return [departmentId];
        }
        
        // If we're unchecking and it results in an empty array, default to 'all'
        if (!checked && prev.length === 1 && prev[0] === departmentId) {
          return ['all'];
        }
        
        // Regular toggle behavior
        return checked 
          ? [...prev.filter(id => id !== 'all'), departmentId] 
          : prev.filter(id => id !== departmentId);
      });
    }
  };

  const handleSubmit = () => {
    if (!name.trim() || !date) return;
    
    onSave({
      name,
      date,
      type,
      description,
      visibility: visibility.length ? visibility : ['all']
    });
  };

  return (
    <div className="space-y-4 py-4">
      <div className="space-y-2">
        <Label htmlFor="holiday-name">Holiday Name</Label>
        <Input 
          id="holiday-name" 
          placeholder="e.g., New Year's Day" 
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="holiday-date">Date</Label>
        <Popover open={dateOpen} onOpenChange={setDateOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="w-full justify-start text-left font-normal"
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {date ? format(date, 'MMMM dd, yyyy') : 'Select date'}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={date}
              onSelect={(date) => {
                setDate(date);
                setDateOpen(false);
              }}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="holiday-type">Holiday Type</Label>
        <Select value={type} onValueChange={(value: 'public' | 'optional' | 'regional') => setType(value)}>
          <SelectTrigger>
            <SelectValue placeholder="Select type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="public">Public Holiday</SelectItem>
            <SelectItem value="optional">Optional Holiday</SelectItem>
            <SelectItem value="regional">Regional Holiday</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="holiday-description">Description (Optional)</Label>
        <Input 
          id="holiday-description" 
          placeholder="Add a short description" 
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>
      
      <div className="space-y-2">
        <Label>Visibility (Departments)</Label>
        <div className="grid grid-cols-2 gap-2 mt-1">
          {departments.map((dept) => (
            <div key={dept.id} className="flex items-center space-x-2">
              <Checkbox 
                id={`dept-${dept.id}`} 
                checked={visibility.includes(dept.id)}
                onCheckedChange={(checked) => 
                  handleVisibilityChange(dept.id, checked === true)
                }
              />
              <Label htmlFor={`dept-${dept.id}`} className="cursor-pointer">
                {dept.name}
              </Label>
            </div>
          ))}
        </div>
      </div>
      
      <DialogFooter className="mt-4">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button 
          onClick={handleSubmit}
          disabled={!name.trim() || !date}
        >
          {holiday ? 'Update Holiday' : 'Add Holiday'}
        </Button>
      </DialogFooter>
    </div>
  );
};

export default HolidayManagement;
