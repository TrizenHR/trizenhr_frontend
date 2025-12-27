
import React, { useState } from 'react';
import { 
  Database, 
  Download, 
  Upload, 
  Calendar, 
  Clock,
  FileDown,
  FileUp,
  ShieldCheck,
  AlertTriangle,
  Check
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { toast } from '@/hooks/use-toast';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface DataBackupProps {
  onChange: () => void;
}

const DataBackup: React.FC<DataBackupProps> = ({ onChange }) => {
  const [backupSettings, setBackupSettings] = useState({
    autoBackup: true,
    backupFrequency: 'weekly',
    backupTime: '02:00',
    retentionPeriod: '30',
    compressBackups: true,
    emailNotification: true,
    backupScope: 'full'
  });
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  const handleSettingChange = (setting: string, value: string | boolean) => {
    setBackupSettings(prev => ({
      ...prev,
      [setting]: value
    }));
    onChange();
  };

  const simulateExport = (type: string) => {
    setIsExporting(true);
    setExportProgress(0);
    
    // Simulate progress
    const interval = setInterval(() => {
      setExportProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsExporting(false);
          
          toast({
            title: `${type} Export Complete`,
            description: `Your ${type.toLowerCase()} data has been successfully exported.`,
          });
          
          return 0;
        }
        return prev + 10;
      });
    }, 300);
  };

  const handleImport = () => {
    setIsUploading(true);
    
    // Simulate import delay
    setTimeout(() => {
      setIsUploading(false);
      toast({
        title: "Import Complete",
        description: "Your data has been successfully imported.",
      });
    }, 2000);
  };

  const pastBackups = [
    { id: 1, name: 'Full Backup', date: '2025-04-09 02:00', size: '156MB', status: 'completed', type: 'Auto' },
    { id: 2, name: 'Employee Data', date: '2025-04-08 14:32', size: '42MB', status: 'completed', type: 'Manual' },
    { id: 3, name: 'Full Backup', date: '2025-04-02 02:00', size: '152MB', status: 'completed', type: 'Auto' },
    { id: 4, name: 'Attendance Records', date: '2025-03-31 11:15', size: '78MB', status: 'completed', type: 'Manual' },
    { id: 5, name: 'Full Backup', date: '2025-03-26 02:00', size: '148MB', status: 'completed', type: 'Auto' }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-1">Data Backup & Import</h2>
        <p className="text-gray-500 text-sm">Configure backup settings and manage data imports/exports</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Database className="h-5 w-5" />
              Backup Settings
            </CardTitle>
            <CardDescription>Configure automatic backup schedule and options</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="autoBackup">Automatic Backup</Label>
                <p className="text-sm text-gray-500">
                  Schedule periodic backups automatically
                </p>
              </div>
              <Switch 
                id="autoBackup" 
                checked={backupSettings.autoBackup}
                onCheckedChange={(checked) => handleSettingChange('autoBackup', checked)}
              />
            </div>
            
            {backupSettings.autoBackup && (
              <>
                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div className="space-y-2">
                    <Label htmlFor="backupFrequency">Backup Frequency</Label>
                    <Select 
                      value={backupSettings.backupFrequency} 
                      onValueChange={(value) => handleSettingChange('backupFrequency', value)}
                    >
                      <SelectTrigger id="backupFrequency">
                        <SelectValue placeholder="Select frequency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly (Sunday)</SelectItem>
                        <SelectItem value="monthly">Monthly (1st day)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="backupTime">Backup Time</Label>
                    <Select 
                      value={backupSettings.backupTime} 
                      onValueChange={(value) => handleSettingChange('backupTime', value)}
                    >
                      <SelectTrigger id="backupTime">
                        <SelectValue placeholder="Select time" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="00:00">12:00 AM (Midnight)</SelectItem>
                        <SelectItem value="02:00">2:00 AM</SelectItem>
                        <SelectItem value="04:00">4:00 AM</SelectItem>
                        <SelectItem value="06:00">6:00 AM</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="pt-2">
                  <Label htmlFor="retentionPeriod">Retention Period (days)</Label>
                  <Select 
                    value={backupSettings.retentionPeriod} 
                    onValueChange={(value) => handleSettingChange('retentionPeriod', value)}
                  >
                    <SelectTrigger id="retentionPeriod">
                      <SelectValue placeholder="Select period" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="7">7 days</SelectItem>
                      <SelectItem value="14">14 days</SelectItem>
                      <SelectItem value="30">30 days</SelectItem>
                      <SelectItem value="90">90 days</SelectItem>
                      <SelectItem value="365">365 days</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-500 mt-1">
                    Old backups will be automatically deleted after this period
                  </p>
                </div>
                
                <div className="flex items-center justify-between pt-4 border-t">
                  <div className="space-y-0.5">
                    <Label htmlFor="compressBackups">Compress Backups</Label>
                    <p className="text-sm text-gray-500">
                      Compress backup files to save storage space
                    </p>
                  </div>
                  <Switch 
                    id="compressBackups" 
                    checked={backupSettings.compressBackups}
                    onCheckedChange={(checked) => handleSettingChange('compressBackups', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between pt-4 border-t">
                  <div className="space-y-0.5">
                    <Label htmlFor="emailNotification">Email Notification</Label>
                    <p className="text-sm text-gray-500">
                      Send email when backup completes or fails
                    </p>
                  </div>
                  <Switch 
                    id="emailNotification" 
                    checked={backupSettings.emailNotification}
                    onCheckedChange={(checked) => handleSettingChange('emailNotification', checked)}
                  />
                </div>
                
                <div className="pt-2">
                  <Label htmlFor="backupScope">Backup Scope</Label>
                  <Select 
                    value={backupSettings.backupScope} 
                    onValueChange={(value) => handleSettingChange('backupScope', value)}
                  >
                    <SelectTrigger id="backupScope">
                      <SelectValue placeholder="Select scope" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="full">Full Backup (All Data)</SelectItem>
                      <SelectItem value="employees">Employees Only</SelectItem>
                      <SelectItem value="attendance">Attendance & Leave Only</SelectItem>
                      <SelectItem value="settings">Settings Only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}
            
            <div className="pt-6">
              <Button className="w-full" onClick={() => simulateExport('Manual')}>
                <ShieldCheck className="mr-2 h-4 w-4" />
                Create Manual Backup Now
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <FileDown className="h-5 w-5" />
              <FileUp className="h-5 w-5" />
              Export & Import
            </CardTitle>
            <CardDescription>Export or import specific data sets</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-slate-50 border rounded-md p-4 mb-2">
              <div className="flex items-start space-x-2">
                <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-amber-800">Important</p>
                  <p className="text-gray-600">Importing data will overwrite existing records. Please ensure you have a backup before proceeding.</p>
                </div>
              </div>
            </div>
            
            <div className="border rounded-md divide-y">
              <div className="p-3 flex justify-between items-center">
                <div>
                  <h3 className="font-medium">Employee Data</h3>
                  <p className="text-sm text-gray-500">Employee profiles and details</p>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => simulateExport('Employee')}>
                    <Download className="mr-2 h-4 w-4" />
                    Export
                  </Button>
                  <Button size="sm" variant="outline" onClick={handleImport}>
                    <Upload className="mr-2 h-4 w-4" />
                    Import
                  </Button>
                </div>
              </div>
              
              <div className="p-3 flex justify-between items-center">
                <div>
                  <h3 className="font-medium">Attendance Records</h3>
                  <p className="text-sm text-gray-500">All attendance and time data</p>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => simulateExport('Attendance')}>
                    <Download className="mr-2 h-4 w-4" />
                    Export
                  </Button>
                  <Button size="sm" variant="outline" onClick={handleImport}>
                    <Upload className="mr-2 h-4 w-4" />
                    Import
                  </Button>
                </div>
              </div>
              
              <div className="p-3 flex justify-between items-center">
                <div>
                  <h3 className="font-medium">Leave Records</h3>
                  <p className="text-sm text-gray-500">All leave applications and balances</p>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => simulateExport('Leave')}>
                    <Download className="mr-2 h-4 w-4" />
                    Export
                  </Button>
                  <Button size="sm" variant="outline" onClick={handleImport}>
                    <Upload className="mr-2 h-4 w-4" />
                    Import
                  </Button>
                </div>
              </div>
              
              <div className="p-3 flex justify-between items-center">
                <div>
                  <h3 className="font-medium">System Settings</h3>
                  <p className="text-sm text-gray-500">Configuration and preferences</p>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => simulateExport('Settings')}>
                    <Download className="mr-2 h-4 w-4" />
                    Export
                  </Button>
                  <Button size="sm" variant="outline" onClick={handleImport}>
                    <Upload className="mr-2 h-4 w-4" />
                    Import
                  </Button>
                </div>
              </div>
            </div>
            
            {isExporting && (
              <div className="mt-4">
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">Exporting data...</span>
                  <span className="text-sm">{exportProgress}%</span>
                </div>
                <Progress value={exportProgress} className="h-2" />
              </div>
            )}
            
            {isUploading && (
              <div className="mt-4">
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">Uploading file...</span>
                </div>
                <Progress value={undefined} className="h-2" />
              </div>
            )}
            
            <div className="border-t pt-4 mt-4">
              <h3 className="font-medium mb-2">CSV Template Downloads</h3>
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" size="sm">
                  <Download className="mr-2 h-4 w-4" />
                  Employee Template
                </Button>
                <Button variant="outline" size="sm">
                  <Download className="mr-2 h-4 w-4" />
                  Attendance Template
                </Button>
                <Button variant="outline" size="sm">
                  <Download className="mr-2 h-4 w-4" />
                  Leave Template
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Backup History</CardTitle>
          <CardDescription>View and restore previous backups</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Backup Name</TableHead>
                <TableHead>Date & Time</TableHead>
                <TableHead>Size</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pastBackups.map((backup) => (
                <TableRow key={backup.id}>
                  <TableCell className="font-medium">{backup.name}</TableCell>
                  <TableCell>{backup.date}</TableCell>
                  <TableCell>{backup.size}</TableCell>
                  <TableCell>
                    <Badge 
                      variant={backup.status === 'completed' ? 'default' : 'destructive'}
                      className="capitalize"
                    >
                      {backup.status === 'completed' && <Check className="mr-1 h-3 w-3" />}
                      {backup.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant={backup.type === 'Auto' ? 'outline' : 'secondary'}
                    >
                      {backup.type}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="outline" size="sm" className="mr-2">
                      <Download className="mr-2 h-4 w-4" />
                      Download
                    </Button>
                    <Button variant="outline" size="sm">
                      Restore
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default DataBackup;
