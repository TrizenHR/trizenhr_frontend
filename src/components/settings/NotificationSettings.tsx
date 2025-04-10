
import React, { useState } from 'react';
import { 
  Bell, 
  Mail, 
  MessageSquare, 
  Phone,
  Info,
  Settings,
  Smartphone
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface NotificationSettingsProps {
  onChange: () => void;
}

type NotificationType = {
  id: string;
  name: string;
  description: string;
  channels: {
    email: boolean;
    inApp: boolean;
    sms: boolean;
    push: boolean;
  };
  roles: string[];
};

const notificationTypes: NotificationType[] = [
  {
    id: 'attendance_marked',
    name: 'Attendance Marked',
    description: 'When employee marks attendance',
    channels: { email: true, inApp: true, sms: false, push: true },
    roles: ['employee']
  },
  {
    id: 'attendance_missing',
    name: 'Missing Attendance Alert',
    description: 'When employee has not marked attendance by a certain time',
    channels: { email: true, inApp: true, sms: true, push: true },
    roles: ['employee', 'manager']
  },
  {
    id: 'leave_request',
    name: 'Leave Request Submitted',
    description: 'When employee submits a leave request',
    channels: { email: true, inApp: true, sms: false, push: false },
    roles: ['employee', 'manager', 'hr']
  },
  {
    id: 'leave_approved',
    name: 'Leave Request Approved',
    description: 'When a leave request is approved',
    channels: { email: true, inApp: true, sms: false, push: true },
    roles: ['employee']
  },
  {
    id: 'leave_rejected',
    name: 'Leave Request Rejected',
    description: 'When a leave request is rejected',
    channels: { email: true, inApp: true, sms: false, push: true },
    roles: ['employee']
  },
  {
    id: 'late_arrival',
    name: 'Late Arrival',
    description: 'When employee arrives late',
    channels: { email: false, inApp: true, sms: false, push: false },
    roles: ['employee', 'manager']
  },
  {
    id: 'attendance_summary',
    name: 'Daily Attendance Summary',
    description: 'Daily summary of team attendance',
    channels: { email: true, inApp: false, sms: false, push: false },
    roles: ['manager', 'hr']
  },
  {
    id: 'holiday_reminder',
    name: 'Holiday Reminder',
    description: 'Reminder for upcoming holidays',
    channels: { email: true, inApp: true, sms: false, push: true },
    roles: ['all']
  },
  {
    id: 'system_maintenance',
    name: 'System Maintenance',
    description: 'System maintenance notifications',
    channels: { email: true, inApp: true, sms: false, push: false },
    roles: ['all']
  }
];

const NotificationSettings: React.FC<NotificationSettingsProps> = ({ onChange }) => {
  const [activeTab, setActiveTab] = useState('notifications');
  const [notifications, setNotifications] = useState(notificationTypes);
  const [emailSettings, setEmailSettings] = useState({
    senderName: 'Trizen HR',
    senderEmail: 'hr@trizen.com',
    smtpServer: 'smtp.trizen.com',
    smtpPort: '587',
    enableSSL: true,
    enableDigestMode: false,
    digestFrequency: 'daily',
    emailFooter: 'This is an automated message from Trizen HRMS. Please do not reply to this email.'
  });
  const [smsSettings, setSmsSettings] = useState({
    enabled: false,
    provider: 'twilio',
    apiKey: 'xxxx-xxxx-xxxx-xxxx',
    senderId: 'TRIZEN',
    restrictedToUrgent: true
  });
  const [pushSettings, setPushSettings] = useState({
    enabled: true,
    quietHoursStart: '22:00',
    quietHoursEnd: '08:00',
    enableQuietHours: true
  });
  const [openCategory, setOpenCategory] = useState<string | null>(null);

  const handleNotificationChannelToggle = (id: string, channel: keyof NotificationType['channels'], value: boolean) => {
    setNotifications(prev => prev.map(notif => 
      notif.id === id 
        ? { ...notif, channels: { ...notif.channels, [channel]: value } }
        : notif
    ));
    onChange();
  };

  const handleToggleSection = (categoryId: string) => {
    setOpenCategory(openCategory === categoryId ? null : categoryId);
  };

  const handleEmailSettingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setEmailSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    onChange();
  };

  const handleSmsSettingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setSmsSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    onChange();
  };

  const handlePushSettingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setPushSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    onChange();
  };

  const handleSelectChange = (name: string, value: string) => {
    if (name.startsWith('email')) {
      setEmailSettings(prev => ({ ...prev, [name.replace('email', '')]: value }));
    } else if (name.startsWith('sms')) {
      setSmsSettings(prev => ({ ...prev, [name.replace('sms', '')]: value }));
    } else if (name.startsWith('push')) {
      setPushSettings(prev => ({ ...prev, [name.replace('push', '')]: value }));
    }
    onChange();
  };

  const handleToggleChange = (setting: string, value: boolean) => {
    if (setting.startsWith('email')) {
      setEmailSettings(prev => ({ ...prev, [setting.replace('email', '')]: value }));
    } else if (setting.startsWith('sms')) {
      setSmsSettings(prev => ({ ...prev, [setting.replace('sms', '')]: value }));
    } else if (setting.startsWith('push')) {
      setPushSettings(prev => ({ ...prev, [setting.replace('push', '')]: value }));
    }
    onChange();
  };

  // Group notifications by category
  const notificationCategories = [
    {
      id: 'attendance',
      name: 'Attendance Notifications',
      items: notifications.filter(n => 
        n.id.includes('attendance') || n.id.includes('late')
      )
    },
    {
      id: 'leave',
      name: 'Leave Notifications',
      items: notifications.filter(n => 
        n.id.includes('leave')
      )
    },
    {
      id: 'system',
      name: 'System Notifications',
      items: notifications.filter(n => 
        n.id.includes('system') || n.id.includes('holiday')
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-1">Notification Settings</h2>
        <p className="text-gray-500 text-sm">Configure how and when notifications are sent to users</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="notifications">
            <Bell className="mr-2 h-4 w-4" />
            Notification Types
          </TabsTrigger>
          <TabsTrigger value="channels">
            <Mail className="mr-2 h-4 w-4" />
            Delivery Channels
          </TabsTrigger>
          <TabsTrigger value="templates">
            <MessageSquare className="mr-2 h-4 w-4" />
            Message Templates
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="notifications" className="mt-6 space-y-6">
          <div className="flex justify-between items-center mb-2">
            <div>
              <Badge variant="outline" className="mr-2">
                {notifications.length} Notification Types
              </Badge>
            </div>
            <Button variant="outline" size="sm">
              <Settings className="mr-2 h-4 w-4" />
              Default Settings
            </Button>
          </div>
          
          {notificationCategories.map(category => (
            <Card key={category.id}>
              <Collapsible 
                open={openCategory === category.id} 
                onOpenChange={() => handleToggleSection(category.id)}
              >
                <CardHeader className="py-4">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-lg">{category.name}</CardTitle>
                    <CollapsibleTrigger asChild>
                      <Button variant="ghost" size="sm">
                        {openCategory === category.id ? "Hide" : "Show"}
                      </Button>
                    </CollapsibleTrigger>
                  </div>
                </CardHeader>
                <CollapsibleContent>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[300px]">Notification</TableHead>
                          <TableHead className="w-[40px] text-center">Email</TableHead>
                          <TableHead className="w-[40px] text-center">In-App</TableHead>
                          <TableHead className="w-[40px] text-center">SMS</TableHead>
                          <TableHead className="w-[40px] text-center">Push</TableHead>
                          <TableHead>Recipients</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {category.items.map(notification => (
                          <TableRow key={notification.id}>
                            <TableCell>
                              <div className="font-medium">{notification.name}</div>
                              <div className="text-sm text-gray-500">{notification.description}</div>
                            </TableCell>
                            <TableCell className="text-center">
                              <Switch 
                                checked={notification.channels.email}
                                onCheckedChange={(checked) => 
                                  handleNotificationChannelToggle(notification.id, 'email', checked)
                                }
                              />
                            </TableCell>
                            <TableCell className="text-center">
                              <Switch 
                                checked={notification.channels.inApp}
                                onCheckedChange={(checked) => 
                                  handleNotificationChannelToggle(notification.id, 'inApp', checked)
                                }
                              />
                            </TableCell>
                            <TableCell className="text-center">
                              <Switch 
                                checked={notification.channels.sms}
                                onCheckedChange={(checked) => 
                                  handleNotificationChannelToggle(notification.id, 'sms', checked)
                                }
                                disabled={!smsSettings.enabled}
                              />
                            </TableCell>
                            <TableCell className="text-center">
                              <Switch 
                                checked={notification.channels.push}
                                onCheckedChange={(checked) => 
                                  handleNotificationChannelToggle(notification.id, 'push', checked)
                                }
                                disabled={!pushSettings.enabled}
                              />
                            </TableCell>
                            <TableCell>
                              <div className="flex flex-wrap gap-1">
                                {notification.roles.includes('all') ? (
                                  <Badge variant="secondary">All Users</Badge>
                                ) : (
                                  notification.roles.map(role => (
                                    <Badge 
                                      key={role} 
                                      variant="outline"
                                      className="capitalize"
                                    >
                                      {role}
                                    </Badge>
                                  ))
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </CollapsibleContent>
              </Collapsible>
            </Card>
          ))}
        </TabsContent>
        
        <TabsContent value="channels" className="mt-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Mail className="h-5 w-5" />
                  Email Notifications
                </CardTitle>
                <CardDescription>Configure email notification settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="senderName">Sender Name</Label>
                    <Input 
                      id="senderName" 
                      name="senderName" 
                      value={emailSettings.senderName} 
                      onChange={handleEmailSettingChange} 
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="senderEmail">Sender Email</Label>
                    <Input 
                      id="senderEmail" 
                      name="senderEmail" 
                      type="email" 
                      value={emailSettings.senderEmail} 
                      onChange={handleEmailSettingChange} 
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="smtpServer">SMTP Server</Label>
                    <Input 
                      id="smtpServer" 
                      name="smtpServer" 
                      value={emailSettings.smtpServer} 
                      onChange={handleEmailSettingChange} 
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="smtpPort">SMTP Port</Label>
                    <Input 
                      id="smtpPort" 
                      name="smtpPort" 
                      value={emailSettings.smtpPort} 
                      onChange={handleEmailSettingChange} 
                    />
                  </div>
                </div>
                
                <div className="flex items-center justify-between border-t pt-4">
                  <div className="space-y-0.5">
                    <Label htmlFor="enableSSL">Enable SSL/TLS</Label>
                    <p className="text-sm text-gray-500">
                      Use secure connection for sending emails
                    </p>
                  </div>
                  <Switch 
                    id="enableSSL" 
                    name="enableSSL" 
                    checked={emailSettings.enableSSL}
                    onCheckedChange={(checked) => handleToggleChange('emailenableSSL', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between border-t pt-4">
                  <div className="space-y-0.5">
                    <Label htmlFor="enableDigestMode">Enable Digest Mode</Label>
                    <p className="text-sm text-gray-500">
                      Combine multiple notifications into a single email
                    </p>
                  </div>
                  <Switch 
                    id="enableDigestMode" 
                    name="enableDigestMode" 
                    checked={emailSettings.enableDigestMode}
                    onCheckedChange={(checked) => handleToggleChange('emailenableDigestMode', checked)}
                  />
                </div>
                
                {emailSettings.enableDigestMode && (
                  <div className="space-y-2 pt-2">
                    <Label htmlFor="digestFrequency">Digest Frequency</Label>
                    <Select 
                      value={emailSettings.digestFrequency} 
                      onValueChange={(value) => handleSelectChange('emaildigestFrequency', value)}
                    >
                      <SelectTrigger id="digestFrequency">
                        <SelectValue placeholder="Select frequency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="hourly">Hourly</SelectItem>
                        <SelectItem value="daily">Daily (End of day)</SelectItem>
                        <SelectItem value="weekly">Weekly (Friday)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
                
                <div className="space-y-2 pt-2">
                  <Label htmlFor="emailFooter">Email Footer</Label>
                  <Input 
                    id="emailFooter" 
                    name="emailFooter" 
                    value={emailSettings.emailFooter} 
                    onChange={handleEmailSettingChange} 
                  />
                </div>
                
                <Button className="w-full mt-2" variant="outline">
                  Test Email Configuration
                </Button>
              </CardContent>
            </Card>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Phone className="h-5 w-5" />
                    SMS Notifications
                  </CardTitle>
                  <CardDescription>Configure SMS notification settings</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="smsEnabled">Enable SMS Notifications</Label>
                      <p className="text-sm text-gray-500">
                        Allow sending notifications via SMS
                      </p>
                    </div>
                    <Switch 
                      id="smsEnabled" 
                      name="enabled" 
                      checked={smsSettings.enabled}
                      onCheckedChange={(checked) => handleToggleChange('smsenabled', checked)}
                    />
                  </div>
                  
                  {smsSettings.enabled && (
                    <>
                      <div className="space-y-2 pt-2">
                        <Label htmlFor="smsProvider">SMS Provider</Label>
                        <Select 
                          value={smsSettings.provider} 
                          onValueChange={(value) => handleSelectChange('smsprovider', value)}
                        >
                          <SelectTrigger id="smsProvider">
                            <SelectValue placeholder="Select provider" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="twilio">Twilio</SelectItem>
                            <SelectItem value="aws">AWS SNS</SelectItem>
                            <SelectItem value="custom">Custom API</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="apiKey">API Key/Secret</Label>
                        <Input 
                          id="apiKey" 
                          name="apiKey" 
                          type="password" 
                          value={smsSettings.apiKey} 
                          onChange={handleSmsSettingChange} 
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="senderId">Sender ID</Label>
                        <Input 
                          id="senderId" 
                          name="senderId" 
                          value={smsSettings.senderId} 
                          onChange={handleSmsSettingChange} 
                        />
                      </div>
                      
                      <div className="flex items-center justify-between pt-2">
                        <div className="space-y-0.5">
                          <Label htmlFor="restrictedToUrgent">Restrict to Urgent Notifications</Label>
                          <p className="text-sm text-gray-500">
                            Only send SMS for high-priority notifications
                          </p>
                        </div>
                        <Switch 
                          id="restrictedToUrgent" 
                          name="restrictedToUrgent" 
                          checked={smsSettings.restrictedToUrgent}
                          onCheckedChange={(checked) => handleToggleChange('smsrestrictedToUrgent', checked)}
                        />
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Smartphone className="h-5 w-5" />
                    Push Notifications
                  </CardTitle>
                  <CardDescription>Configure mobile push notification settings</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="pushEnabled">Enable Push Notifications</Label>
                      <p className="text-sm text-gray-500">
                        Send notifications to mobile devices
                      </p>
                    </div>
                    <Switch 
                      id="pushEnabled" 
                      name="enabled" 
                      checked={pushSettings.enabled}
                      onCheckedChange={(checked) => handleToggleChange('pushenabled', checked)}
                    />
                  </div>
                  
                  {pushSettings.enabled && (
                    <>
                      <div className="flex items-center justify-between pt-2">
                        <div className="space-y-0.5">
                          <Label htmlFor="enableQuietHours">Enable Quiet Hours</Label>
                          <p className="text-sm text-gray-500">
                            Don't send push notifications during certain hours
                          </p>
                        </div>
                        <Switch 
                          id="enableQuietHours" 
                          name="enableQuietHours" 
                          checked={pushSettings.enableQuietHours}
                          onCheckedChange={(checked) => handleToggleChange('pushenableQuietHours', checked)}
                        />
                      </div>
                      
                      {pushSettings.enableQuietHours && (
                        <div className="grid grid-cols-2 gap-4 pt-2">
                          <div className="space-y-2">
                            <Label htmlFor="quietHoursStart">Quiet Hours Start</Label>
                            <Input 
                              id="quietHoursStart" 
                              name="quietHoursStart" 
                              type="time" 
                              value={pushSettings.quietHoursStart} 
                              onChange={handlePushSettingChange} 
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="quietHoursEnd">Quiet Hours End</Label>
                            <Input 
                              id="quietHoursEnd" 
                              name="quietHoursEnd" 
                              type="time" 
                              value={pushSettings.quietHoursEnd} 
                              onChange={handlePushSettingChange} 
                            />
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="templates" className="mt-6">
          <div className="bg-slate-50 p-4 rounded-lg mb-6 flex items-center gap-3">
            <Info className="h-5 w-5 text-blue-500 flex-shrink-0" />
            <p className="text-sm text-slate-700">
              Customize notification templates for each channel. Variables like <code>{"{name}"}</code>, <code>{"{date}"}</code>, etc. will be replaced with actual values.
            </p>
          </div>
          
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Email Templates</CardTitle>
                <CardDescription>Customize email notification templates</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="border rounded-md p-4">
                    <h3 className="font-medium mb-2">Leave Request Template</h3>
                    <p className="text-sm text-gray-500 mb-4">Used when a leave request is submitted</p>
                    
                    <div className="space-y-2">
                      <Label htmlFor="emailSubject">Email Subject</Label>
                      <Input 
                        id="emailSubject" 
                        defaultValue="[Trizen HR] Leave Request from {employee_name}" 
                      />
                    </div>
                    
                    <div className="space-y-2 mt-3">
                      <Label htmlFor="emailBody">Email Body</Label>
                      <textarea
                        id="emailBody"
                        rows={6}
                        className="w-full p-2 border rounded-md"
                        defaultValue={`Dear {recipient_name},

A leave request has been submitted:

Employee: {employee_name}
Leave Type: {leave_type}
From: {start_date}
To: {end_date}
Total Days: {days}
Reason: {reason}

Please review this request at your earliest convenience.

Best regards,
Trizen HR Team`}
                      />
                    </div>
                    
                    <div className="flex justify-end mt-3">
                      <Button size="sm" variant="outline" className="mr-2">
                        Reset to Default
                      </Button>
                      <Button size="sm">
                        Save Template
                      </Button>
                    </div>
                  </div>
                  
                  <div className="border rounded-md p-4">
                    <h3 className="font-medium mb-2">Attendance Reminder Template</h3>
                    <p className="text-sm text-gray-500 mb-4">Sent when employee hasn't marked attendance</p>
                    
                    <div className="space-y-2">
                      <Label htmlFor="attendanceEmailSubject">Email Subject</Label>
                      <Input 
                        id="attendanceEmailSubject" 
                        defaultValue="[Trizen HR] Attendance Reminder" 
                      />
                    </div>
                    
                    <div className="space-y-2 mt-3">
                      <Label htmlFor="attendanceEmailBody">Email Body</Label>
                      <textarea
                        id="attendanceEmailBody"
                        rows={4}
                        className="w-full p-2 border rounded-md"
                        defaultValue={`Hello {employee_name},

We noticed that you haven't marked your attendance for today ({date}). Please log in to the Trizen HRMS to record your attendance.

Regards,
Trizen HR Team`}
                      />
                    </div>
                    
                    <div className="flex justify-end mt-3">
                      <Button size="sm" variant="outline" className="mr-2">
                        Reset to Default
                      </Button>
                      <Button size="sm">
                        Save Template
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">SMS & Push Templates</CardTitle>
                <CardDescription>Customize mobile notification templates</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="border rounded-md p-4">
                    <h3 className="font-medium mb-2">SMS Leave Approval Template</h3>
                    <p className="text-sm text-gray-500 mb-2">Remember to keep SMS templates short</p>
                    
                    <div className="space-y-2 mt-3">
                      <Label htmlFor="smsTemplate">SMS Template</Label>
                      <Input
                        id="smsTemplate"
                        defaultValue="Trizen HR: Your leave request for {start_date} to {end_date} has been {status}."
                      />
                      <p className="text-xs text-gray-500">Max 160 characters for standard SMS</p>
                    </div>
                  </div>
                  
                  <div className="border rounded-md p-4">
                    <h3 className="font-medium mb-2">Push Notification Template</h3>
                    <p className="text-sm text-gray-500 mb-2">For mobile app notifications</p>
                    
                    <div className="space-y-2">
                      <Label htmlFor="pushTitle">Notification Title</Label>
                      <Input 
                        id="pushTitle" 
                        defaultValue="Leave Request {status}" 
                      />
                    </div>
                    
                    <div className="space-y-2 mt-3">
                      <Label htmlFor="pushBody">Notification Body</Label>
                      <Input
                        id="pushBody"
                        defaultValue="Your leave request from {start_date} to {end_date} has been {status}."
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default NotificationSettings;
