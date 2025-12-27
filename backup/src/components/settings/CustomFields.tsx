
import React, { useState } from 'react';
import { 
  Plus, 
  Pencil, 
  Trash, 
  GripVertical, 
  User, 
  ClipboardCheck, 
  FileText,
  Check,
  X
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface CustomFieldsProps {
  onChange: () => void;
}

type FieldType = 'text' | 'textarea' | 'number' | 'date' | 'select' | 'checkbox' | 'radio';

interface CustomField {
  id: number;
  name: string;
  label: string;
  fieldType: FieldType;
  module: 'employee' | 'attendance' | 'leave';
  required: boolean;
  placeholder?: string;
  options?: string[];
  description?: string;
  active: boolean;
  sortOrder: number;
}

const initialFields: CustomField[] = [
  {
    id: 1,
    name: 'emergencyContact',
    label: 'Emergency Contact',
    fieldType: 'text',
    module: 'employee',
    required: true,
    placeholder: 'Emergency contact name and number',
    description: 'Person to contact in case of emergency',
    active: true,
    sortOrder: 1
  },
  {
    id: 2,
    name: 'bloodGroup',
    label: 'Blood Group',
    fieldType: 'select',
    module: 'employee',
    required: false,
    options: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
    description: 'For medical emergencies',
    active: true,
    sortOrder: 2
  },
  {
    id: 3,
    name: 'aadharNo',
    label: 'Aadhar Number',
    fieldType: 'text',
    module: 'employee',
    required: true,
    placeholder: 'XXXX XXXX XXXX',
    description: 'Government-issued identity number',
    active: true,
    sortOrder: 3
  },
  {
    id: 4,
    name: 'attendanceNotes',
    label: 'Notes',
    fieldType: 'textarea',
    module: 'attendance',
    required: false,
    placeholder: 'Any additional information about your attendance',
    active: true,
    sortOrder: 1
  },
  {
    id: 5,
    name: 'workLocation',
    label: 'Work Location',
    fieldType: 'select',
    module: 'attendance',
    required: true,
    options: ['Office', 'Home', 'Client Site', 'Other'],
    active: true,
    sortOrder: 2
  },
  {
    id: 6,
    name: 'leaveReason',
    label: 'Detailed Reason',
    fieldType: 'textarea',
    module: 'leave',
    required: true,
    placeholder: 'Please provide detailed reason for leave request',
    active: true,
    sortOrder: 1
  },
  {
    id: 7,
    name: 'handoverNotes',
    label: 'Handover Notes',
    fieldType: 'textarea',
    module: 'leave',
    required: false,
    placeholder: 'Tasks/responsibilities to be handled during your absence',
    active: true,
    sortOrder: 2
  },
  {
    id: 8,
    name: 'contactWhileAway',
    label: 'Contact While Away',
    fieldType: 'text',
    module: 'leave',
    required: false,
    placeholder: 'Phone number or email where you can be reached if needed',
    active: true,
    sortOrder: 3
  }
];

const CustomFields: React.FC<CustomFieldsProps> = ({ onChange }) => {
  const [activeTab, setActiveTab] = useState('employee');
  const [fields, setFields] = useState<CustomField[]>(initialFields);
  const [isAddingField, setIsAddingField] = useState(false);
  const [editingField, setEditingField] = useState<CustomField | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [fieldToDelete, setFieldToDelete] = useState<number | null>(null);

  const handleAddField = () => {
    setEditingField(null);
    setIsAddingField(true);
  };

  const handleEditField = (field: CustomField) => {
    setEditingField(field);
    setIsAddingField(true);
  };

  const handleDeleteConfirm = (id: number) => {
    setFieldToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteField = () => {
    if (fieldToDelete) {
      setFields(fields.filter(field => field.id !== fieldToDelete));
      setDeleteDialogOpen(false);
      setFieldToDelete(null);
      onChange();
    }
  };

  const handleToggleStatus = (id: number) => {
    setFields(fields.map(field => 
      field.id === id ? { ...field, active: !field.active } : field
    ));
    onChange();
  };

  const handleSaveField = (field: Omit<CustomField, 'id' | 'sortOrder'>) => {
    if (editingField) {
      setFields(fields.map(f => 
        f.id === editingField.id 
          ? { ...field, id: editingField.id, sortOrder: editingField.sortOrder } 
          : f
      ));
    } else {
      // Add new field with next available ID and sort order
      const nextId = Math.max(0, ...fields.map(f => f.id)) + 1;
      const moduleFields = fields.filter(f => f.module === field.module);
      const nextSortOrder = moduleFields.length > 0
        ? Math.max(...moduleFields.map(f => f.sortOrder)) + 1
        : 1;
      
      setFields([...fields, { ...field, id: nextId, sortOrder: nextSortOrder }]);
    }
    setIsAddingField(false);
    setEditingField(null);
    onChange();
  };

  const moduleFields = fields.filter(field => field.module === activeTab)
    .sort((a, b) => a.sortOrder - b.sortOrder);

  const getFieldTypeIcon = (type: FieldType) => {
    switch (type) {
      case 'text': return 'Text';
      case 'textarea': return 'Long Text';
      case 'number': return 'Number';
      case 'date': return 'Date';
      case 'select': return 'Dropdown';
      case 'checkbox': return 'Checkbox';
      case 'radio': return 'Radio';
      default: return type;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-1">Custom Fields</h2>
        <p className="text-gray-500 text-sm">Add custom fields to different modules in the system</p>
      </div>

      <div className="flex justify-between items-center">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-[400px]">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="employee">
              <User className="mr-2 h-4 w-4" />
              Employee
            </TabsTrigger>
            <TabsTrigger value="attendance">
              <ClipboardCheck className="mr-2 h-4 w-4" />
              Attendance
            </TabsTrigger>
            <TabsTrigger value="leave">
              <FileText className="mr-2 h-4 w-4" />
              Leave
            </TabsTrigger>
          </TabsList>
        </Tabs>
        
        <Button onClick={handleAddField}>
          <Plus className="mr-2 h-4 w-4" />
          Add Field
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            {activeTab === 'employee' && 'Employee Profile Fields'}
            {activeTab === 'attendance' && 'Attendance Record Fields'}
            {activeTab === 'leave' && 'Leave Request Fields'}
          </CardTitle>
          <CardDescription>
            {activeTab === 'employee' && 'Custom fields shown on employee profiles'}
            {activeTab === 'attendance' && 'Additional fields for attendance records'}
            {activeTab === 'leave' && 'Extra fields for leave request forms'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {moduleFields.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No custom fields added yet.</p>
              <Button variant="outline" className="mt-4" onClick={handleAddField}>
                <Plus className="mr-2 h-4 w-4" />
                Add First Field
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[40px]"></TableHead>
                  <TableHead>Field Label</TableHead>
                  <TableHead>Field Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Required</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {moduleFields.map((field) => (
                  <TableRow key={field.id}>
                    <TableCell>
                      <GripVertical className="h-4 w-4 text-gray-400 cursor-move" />
                    </TableCell>
                    <TableCell className="font-medium">{field.label}</TableCell>
                    <TableCell className="text-gray-500">{field.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {getFieldTypeIcon(field.fieldType)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {field.required ? 
                        <Check className="h-4 w-4 text-green-500" /> : 
                        <X className="h-4 w-4 text-gray-300" />
                      }
                    </TableCell>
                    <TableCell>
                      <Switch 
                        checked={field.active} 
                        onCheckedChange={() => handleToggleStatus(field.id)}
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => handleEditField(field)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => handleDeleteConfirm(field.id)}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
      
      {/* Dialog for adding/editing fields */}
      <Dialog 
        open={isAddingField} 
        onOpenChange={(open) => {
          if (!open) setIsAddingField(false);
        }}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingField ? 'Edit Field' : 'Add New Field'}</DialogTitle>
            <DialogDescription>
              {editingField 
                ? 'Update this custom field properties' 
                : 'Configure a new custom field'}
            </DialogDescription>
          </DialogHeader>
          
          <CustomFieldForm 
            field={editingField}
            currentModule={activeTab as 'employee' | 'attendance' | 'leave'}
            onSave={handleSaveField}
            onCancel={() => setIsAddingField(false)}
          />
        </DialogContent>
      </Dialog>
      
      {/* Delete confirmation dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Custom Field</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this field? This action cannot be undone and may affect existing data.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteField}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

interface CustomFieldFormProps {
  field: CustomField | null;
  currentModule: 'employee' | 'attendance' | 'leave';
  onSave: (field: Omit<CustomField, 'id' | 'sortOrder'>) => void;
  onCancel: () => void;
}

const CustomFieldForm: React.FC<CustomFieldFormProps> = ({ 
  field,
  currentModule,
  onSave,
  onCancel
}) => {
  const [formData, setFormData] = useState<Omit<CustomField, 'id' | 'sortOrder'>>({
    name: field?.name || '',
    label: field?.label || '',
    fieldType: field?.fieldType || 'text',
    module: field?.module || currentModule,
    required: field?.required || false,
    placeholder: field?.placeholder || '',
    options: field?.options || [],
    description: field?.description || '',
    active: field?.active !== undefined ? field.active : true
  });
  const [tempOptions, setTempOptions] = useState<string>(
    field?.options ? field.options.join('\n') : ''
  );
  const [nameError, setNameError] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name === 'name') {
      // Field name must be camelCase without spaces or special characters
      if (value && !/^[a-zA-Z][a-zA-Z0-9]*$/.test(value)) {
        setNameError('Field name must start with a letter and contain only letters and numbers');
      } else {
        setNameError('');
      }
      
      setFormData(prev => ({ ...prev, [name]: value }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSelectChange = (name: string, value: string) => {
    if (name === 'fieldType') {
      setFormData(prev => ({ 
        ...prev, 
        [name]: value as FieldType,
        // Reset options if changing away from a field type that uses them
        options: (value === 'select' || value === 'radio' || value === 'checkbox') 
          ? prev.options 
          : []
      }));
    } else if (name === 'module') {
      setFormData(prev => ({ 
        ...prev, 
        [name]: value as 'employee' | 'attendance' | 'leave'
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleRequiredChange = (checked: boolean) => {
    setFormData(prev => ({ ...prev, required: checked }));
  };

  const handleActiveChange = (checked: boolean) => {
    setFormData(prev => ({ ...prev, active: checked }));
  };

  const handleOptionsChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setTempOptions(e.target.value);
    
    // Convert multiline string to array, filtering out empty lines
    const optionsArray = e.target.value
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0);
    
    setFormData(prev => ({ ...prev, options: optionsArray }));
  };

  const handleSubmit = () => {
    // Auto-generate camelCase name from label if name is empty
    let finalName = formData.name;
    if (!finalName && formData.label) {
      finalName = formData.label
        .toLowerCase()
        .replace(/[^a-zA-Z0-9 ]/g, '')
        .split(' ')
        .map((word, index) => 
          index === 0 ? word : word.charAt(0).toUpperCase() + word.slice(1)
        )
        .join('');
    }
    
    onSave({
      ...formData,
      name: finalName
    });
  };

  const showOptions = ['select', 'radio', 'checkbox'].includes(formData.fieldType);

  return (
    <div className="space-y-4 py-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="label">Field Label <span className="text-red-500">*</span></Label>
          <Input 
            id="label" 
            name="label" 
            placeholder="e.g., Emergency Contact" 
            value={formData.label} 
            onChange={handleInputChange}
            required
          />
          <p className="text-xs text-gray-500">
            This will be shown to users on forms
          </p>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="name">
            Field Name 
            <span className="text-xs font-normal text-gray-500 ml-1">(auto-generated if empty)</span>
          </Label>
          <Input 
            id="name" 
            name="name" 
            placeholder="e.g., emergencyContact" 
            value={formData.name} 
            onChange={handleInputChange}
          />
          {nameError && <p className="text-xs text-red-500">{nameError}</p>}
          <p className="text-xs text-gray-500">
            Unique identifier used in database
          </p>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="fieldType">Field Type <span className="text-red-500">*</span></Label>
          <Select 
            value={formData.fieldType} 
            onValueChange={(value) => handleSelectChange('fieldType', value)}
          >
            <SelectTrigger id="fieldType">
              <SelectValue placeholder="Select field type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="text">Text (Single line)</SelectItem>
              <SelectItem value="textarea">Text Area (Multiple lines)</SelectItem>
              <SelectItem value="number">Number</SelectItem>
              <SelectItem value="date">Date</SelectItem>
              <SelectItem value="select">Dropdown</SelectItem>
              <SelectItem value="checkbox">Checkbox Group</SelectItem>
              <SelectItem value="radio">Radio Button Group</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="module">Module <span className="text-red-500">*</span></Label>
          <Select 
            value={formData.module} 
            onValueChange={(value) => handleSelectChange('module', value)}
          >
            <SelectTrigger id="module">
              <SelectValue placeholder="Select module" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="employee">Employee Profile</SelectItem>
              <SelectItem value="attendance">Attendance Record</SelectItem>
              <SelectItem value="leave">Leave Request</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="placeholder">Placeholder Text</Label>
        <Input 
          id="placeholder" 
          name="placeholder" 
          placeholder="e.g., Enter emergency contact name and number" 
          value={formData.placeholder || ''} 
          onChange={handleInputChange}
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Input 
          id="description" 
          name="description" 
          placeholder="Help text to explain this field" 
          value={formData.description || ''} 
          onChange={handleInputChange}
        />
        <p className="text-xs text-gray-500">
          Explanatory text shown to users beneath the field
        </p>
      </div>
      
      {showOptions && (
        <div className="space-y-2">
          <Label htmlFor="options">
            Options <span className="text-red-500">*</span>
            <span className="text-xs font-normal text-gray-500 ml-1">(one per line)</span>
          </Label>
          <textarea
            id="options"
            className="w-full h-20 p-2 border rounded-md"
            placeholder="Enter options, one per line"
            value={tempOptions}
            onChange={handleOptionsChange}
          />
        </div>
      )}
      
      <div className="flex space-x-8 pt-2">
        <div className="flex items-center space-x-2">
          <Switch 
            id="required" 
            checked={formData.required}
            onCheckedChange={handleRequiredChange}
          />
          <Label htmlFor="required">Required Field</Label>
        </div>
        
        <div className="flex items-center space-x-2">
          <Switch 
            id="active" 
            checked={formData.active}
            onCheckedChange={handleActiveChange}
          />
          <Label htmlFor="active">Field Active</Label>
        </div>
      </div>
      
      <DialogFooter className="mt-4">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button 
          onClick={handleSubmit}
          disabled={!formData.label || 
            (showOptions && (!formData.options || formData.options.length === 0)) ||
            (!!nameError && !!formData.name)}
        >
          {field ? 'Update Field' : 'Add Field'}
        </Button>
      </DialogFooter>
    </div>
  );
};

export default CustomFields;
