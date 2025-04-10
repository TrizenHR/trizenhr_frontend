
import React, { useState } from 'react';
import { 
  Building, 
  MapPin, 
  Upload, 
  Globe,
  Clock,
  Calendar
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

interface CompanySettingsProps {
  onChange: () => void;
}

const weekdays = [
  { id: 'mon', label: 'Monday' },
  { id: 'tue', label: 'Tuesday' },
  { id: 'wed', label: 'Wednesday' },
  { id: 'thu', label: 'Thursday' },
  { id: 'fri', label: 'Friday' },
  { id: 'sat', label: 'Saturday' },
  { id: 'sun', label: 'Sunday' },
];

const timezones = [
  { value: 'Asia/Kolkata', label: 'India (GMT+5:30)' },
  { value: 'America/New_York', label: 'Eastern Time (GMT-4:00)' },
  { value: 'Europe/London', label: 'London (GMT+1:00)' },
  { value: 'Asia/Singapore', label: 'Singapore (GMT+8:00)' },
  { value: 'Australia/Sydney', label: 'Sydney (GMT+10:00)' },
];

const CompanySettings: React.FC<CompanySettingsProps> = ({ onChange }) => {
  const [companyData, setCompanyData] = useState({
    name: 'Trizen Ventures LLP',
    logo: '',
    address: '123 Tech Park, Sector 5',
    city: 'Bengaluru',
    state: 'Karnataka',
    country: 'India',
    zipCode: '560001',
    timezone: 'Asia/Kolkata',
    workingDays: ['mon', 'tue', 'wed', 'thu', 'fri'],
    officeStartTime: '09:00',
    officeEndTime: '18:00',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCompanyData((prev) => ({ ...prev, [name]: value }));
    onChange();
  };

  const handleSelectChange = (value: string, name: string) => {
    setCompanyData((prev) => ({ ...prev, [name]: value }));
    onChange();
  };

  const handleWorkingDayToggle = (day: string, checked: boolean) => {
    setCompanyData((prev) => ({
      ...prev,
      workingDays: checked 
        ? [...prev.workingDays, day]
        : prev.workingDays.filter(d => d !== day)
    }));
    onChange();
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    // In a real app, this would upload the logo to a server
    onChange();
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-1">Company Settings</h2>
        <p className="text-gray-500 text-sm">Configure organization details and working schedules</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Building className="h-5 w-5" />
              Company Information
            </CardTitle>
            <CardDescription>Basic information about your company</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="companyName">Company Name</Label>
              <Input 
                id="companyName" 
                name="name" 
                value={companyData.name} 
                onChange={handleInputChange} 
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="logo-upload">Company Logo</Label>
              <div className="flex items-center gap-3">
                <div className="h-14 w-14 border rounded-md bg-slate-50 flex items-center justify-center">
                  {companyData.logo ? (
                    <img src={companyData.logo} alt="Logo" className="max-h-full max-w-full" />
                  ) : (
                    <Building className="h-8 w-8 text-gray-400" />
                  )}
                </div>
                <label className="cursor-pointer">
                  <Button variant="outline" type="button" size="sm" asChild>
                    <div>
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Logo
                    </div>
                  </Button>
                  <input 
                    id="logo-upload" 
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                    onChange={handleLogoUpload}
                  />
                </label>
              </div>
              <p className="text-xs text-gray-500 mt-1">Recommended size: 200x200px. Max 1MB.</p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Textarea 
                id="address" 
                name="address" 
                value={companyData.address} 
                onChange={handleInputChange}
                rows={2}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input 
                  id="city" 
                  name="city" 
                  value={companyData.city} 
                  onChange={handleInputChange} 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="state">State</Label>
                <Input 
                  id="state" 
                  name="state" 
                  value={companyData.state} 
                  onChange={handleInputChange} 
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="country">Country</Label>
                <Input 
                  id="country" 
                  name="country" 
                  value={companyData.country} 
                  onChange={handleInputChange} 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="zipCode">ZIP/Postal Code</Label>
                <Input 
                  id="zipCode" 
                  name="zipCode" 
                  value={companyData.zipCode} 
                  onChange={handleInputChange} 
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Schedule Settings
            </CardTitle>
            <CardDescription>Configure timezone and working hours</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="timezone">Default Time Zone</Label>
              <Select 
                value={companyData.timezone} 
                onValueChange={(value) => handleSelectChange(value, 'timezone')}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select timezone" />
                </SelectTrigger>
                <SelectContent>
                  {timezones.map((tz) => (
                    <SelectItem key={tz.value} value={tz.value}>
                      {tz.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Working Days</Label>
              <div className="grid grid-cols-2 gap-2 mt-1">
                {weekdays.map((day) => (
                  <div key={day.id} className="flex items-center space-x-2">
                    <Checkbox 
                      id={`day-${day.id}`} 
                      checked={companyData.workingDays.includes(day.id)}
                      onCheckedChange={(checked) => 
                        handleWorkingDayToggle(day.id, checked === true)
                      }
                    />
                    <Label htmlFor={`day-${day.id}`} className="cursor-pointer">
                      {day.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="officeStartTime">Office Start Time</Label>
                <Input 
                  id="officeStartTime" 
                  name="officeStartTime" 
                  type="time"
                  value={companyData.officeStartTime} 
                  onChange={handleInputChange} 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="officeEndTime">Office End Time</Label>
                <Input 
                  id="officeEndTime" 
                  name="officeEndTime" 
                  type="time"
                  value={companyData.officeEndTime} 
                  onChange={handleInputChange} 
                />
              </div>
            </div>
            
            <div className="pt-3">
              <Button variant="outline" className="w-full">
                <Calendar className="mr-2 h-4 w-4" />
                Configure Holiday Calendar
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CompanySettings;
