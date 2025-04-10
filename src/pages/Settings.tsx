
import React, { useState } from 'react';
import { Save, Check, Undo2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import DashboardLayout from '@/components/DashboardLayout';
import ProfileSettings from '@/components/settings/ProfileSettings';
import CompanySettings from '@/components/settings/CompanySettings';
import RolesPermissions from '@/components/settings/RolesPermissions';
import AttendancePolicies from '@/components/settings/AttendancePolicies';
import HolidayManagement from '@/components/settings/HolidayManagement';
import NotificationSettings from '@/components/settings/NotificationSettings';
import CustomFields from '@/components/settings/CustomFields';
import ThemeSettings from '@/components/settings/ThemeSettings';
import DataBackup from '@/components/settings/DataBackup';
import AuditLogs from '@/components/settings/AuditLogs';

const Settings: React.FC = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [hasChanges, setHasChanges] = useState(false);

  const handleSaveChanges = () => {
    toast({
      title: "Settings Saved",
      description: "Your settings have been successfully updated.",
      duration: 3000,
    });
    setHasChanges(false);
  };

  const handleReset = () => {
    if (confirm("Are you sure you want to reset all changes?")) {
      toast({
        title: "Changes Discarded",
        description: "Your changes have been discarded.",
        duration: 3000,
      });
      setHasChanges(false);
    }
  };

  const onSettingsChange = () => {
    setHasChanges(true);
  };

  return (
    <DashboardLayout>
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Settings</h1>
          
          {hasChanges && (
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleReset}>
                <Undo2 className="mr-2 h-4 w-4" />
                Discard Changes
              </Button>
              <Button onClick={handleSaveChanges}>
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </Button>
            </div>
          )}
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-5 mb-8">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="company">Company</TabsTrigger>
            <TabsTrigger value="roles">Roles & Permissions</TabsTrigger>
            <TabsTrigger value="attendance">Attendance & Leave</TabsTrigger>
            <TabsTrigger value="holidays">Holidays</TabsTrigger>
          </TabsList>
          <TabsList className="grid grid-cols-5 mb-8">
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="custom-fields">Custom Fields</TabsTrigger>
            <TabsTrigger value="theme">Theme & Branding</TabsTrigger>
            <TabsTrigger value="backup">Data & Backup</TabsTrigger>
            <TabsTrigger value="audit">Audit Logs</TabsTrigger>
          </TabsList>

          <div className="bg-white p-6 rounded-lg border shadow-sm">
            <TabsContent value="profile">
              <ProfileSettings onChange={onSettingsChange} />
            </TabsContent>
            
            <TabsContent value="company">
              <CompanySettings onChange={onSettingsChange} />
            </TabsContent>
            
            <TabsContent value="roles">
              <RolesPermissions onChange={onSettingsChange} />
            </TabsContent>
            
            <TabsContent value="attendance">
              <AttendancePolicies onChange={onSettingsChange} />
            </TabsContent>
            
            <TabsContent value="holidays">
              <HolidayManagement onChange={onSettingsChange} />
            </TabsContent>
            
            <TabsContent value="notifications">
              <NotificationSettings onChange={onSettingsChange} />
            </TabsContent>
            
            <TabsContent value="custom-fields">
              <CustomFields onChange={onSettingsChange} />
            </TabsContent>
            
            <TabsContent value="theme">
              <ThemeSettings onChange={onSettingsChange} />
            </TabsContent>
            
            <TabsContent value="backup">
              <DataBackup onChange={onSettingsChange} />
            </TabsContent>
            
            <TabsContent value="audit">
              <AuditLogs />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Settings;
