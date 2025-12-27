
import React, { useState } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Plus, Trash2, CalendarClock, ArrowDown, Clock, Mail, User2, Users, PieChart, FileText, Home } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/components/ui/use-toast";

// Mock data for scheduled reports
const mockScheduledReports = [
  {
    id: 1,
    name: "Monthly Attendance Summary",
    type: "Attendance",
    frequency: "Monthly",
    recipients: ["hr@company.com", "manager@company.com"],
    lastRun: "2023-04-01",
    nextRun: "2023-05-01",
    status: "active"
  },
  {
    id: 2,
    name: "Weekly Timesheet Report",
    type: "Timesheet",
    frequency: "Weekly",
    recipients: ["projectmanager@company.com"],
    lastRun: "2023-04-07",
    nextRun: "2023-04-14",
    status: "active"
  },
  {
    id: 3,
    name: "Leave Balance Report",
    type: "Leave",
    frequency: "Quarterly",
    recipients: ["hr@company.com"],
    lastRun: "2023-01-01",
    nextRun: "2023-04-01",
    status: "inactive"
  },
  {
    id: 4,
    name: "Overtime Report",
    type: "Attendance",
    frequency: "Monthly",
    recipients: ["finance@company.com", "hr@company.com"],
    lastRun: "2023-03-01",
    nextRun: "2023-04-01",
    status: "active"
  },
  {
    id: 5,
    name: "Late Arrival Report",
    type: "Attendance",
    frequency: "Weekly",
    recipients: ["teamlead@company.com"],
    lastRun: "2023-04-07",
    nextRun: "2023-04-14",
    status: "active"
  }
];

// Report types with their descriptions
const reportTypes = [
  {
    id: "attendance",
    name: "Attendance Summary",
    description: "Details of employee attendance, absences, and late arrivals",
    icon: <User2 className="h-6 w-6 text-indigo-500" />
  },
  {
    id: "leave",
    name: "Leave Balance",
    description: "Current leave balance and leave history for all employees",
    icon: <CalendarClock className="h-6 w-6 text-green-500" />
  },
  {
    id: "timesheet",
    name: "Timesheet Summary",
    description: "Overview of time logged by employees on projects",
    icon: <Clock className="h-6 w-6 text-blue-500" />
  },
  {
    id: "department",
    name: "Department Report",
    description: "Department-wise attendance and performance metrics",
    icon: <Users className="h-6 w-6 text-amber-500" />
  },
  {
    id: "performance",
    name: "Performance Metrics",
    description: "Key performance indicators and metrics",
    icon: <PieChart className="h-6 w-6 text-red-500" />
  },
  {
    id: "custom",
    name: "Custom Report",
    description: "Create a completely customized report",
    icon: <FileText className="h-6 w-6 text-purple-500" />
  }
];

const ReportScheduler: React.FC = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("scheduled");
  const [selectedReportType, setSelectedReportType] = useState<string | null>(null);
  const [scheduledReports, setScheduledReports] = useState(mockScheduledReports);

  const handleDeleteReport = (id: number) => {
    setScheduledReports(prev => prev.filter(report => report.id !== id));
    toast({
      title: "Report deleted",
      description: "The scheduled report has been deleted successfully.",
    });
  };

  const handleToggleStatus = (id: number) => {
    setScheduledReports(prev => 
      prev.map(report => 
        report.id === id 
          ? { ...report, status: report.status === "active" ? "inactive" : "active" } 
          : report
      )
    );
    
    const report = scheduledReports.find(r => r.id === id);
    toast({
      title: `Report ${report?.status === "active" ? "deactivated" : "activated"}`,
      description: `"${report?.name}" is now ${report?.status === "active" ? "inactive" : "active"}.`,
    });
  };

  const handleCreateNewReport = () => {
    if (!selectedReportType) {
      toast({
        title: "Selection required",
        description: "Please select a report type to continue.",
        variant: "destructive"
      });
      return;
    }
    
    setActiveTab("configure");
    toast({
      title: "Report selected",
      description: `You've selected ${reportTypes.find(r => r.id === selectedReportType)?.name}. Configure your report.`,
    });
  };

  const handleScheduleReport = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Report scheduled",
      description: "Your new report has been scheduled successfully.",
    });
    setActiveTab("scheduled");
    setSelectedReportType(null);
  };

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Report Scheduler</h1>
            <p className="text-muted-foreground">
              Create and manage automated report schedules for your team
            </p>
          </div>
        </div>

        <Breadcrumb className="mb-6">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/admin/dashboard">
                <Home className="h-4 w-4 mr-1" />
                Dashboard
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="/admin/dashboard/report-scheduler">
                Report Scheduler
              </BreadcrumbLink>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="scheduled">Scheduled Reports</TabsTrigger>
            <TabsTrigger value="create">Create New</TabsTrigger>
            <TabsTrigger value="configure" disabled={!selectedReportType}>Configure</TabsTrigger>
          </TabsList>
          
          {/* Scheduled Reports Tab */}
          <TabsContent value="scheduled" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Your Scheduled Reports</CardTitle>
                <CardDescription>
                  View and manage all your scheduled reports
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Report Name</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Frequency</TableHead>
                        <TableHead>Next Run</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Recipients</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {scheduledReports.map((report) => (
                        <TableRow key={report.id}>
                          <TableCell className="font-medium">{report.name}</TableCell>
                          <TableCell>{report.type}</TableCell>
                          <TableCell>{report.frequency}</TableCell>
                          <TableCell>{report.nextRun}</TableCell>
                          <TableCell>
                            <Badge variant={report.status === "active" ? "default" : "secondary"}>
                              {report.status === "active" ? "Active" : "Inactive"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              <Mail className="h-4 w-4 mr-1" />
                              <span>{report.recipients.length}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end space-x-2">
                              <Switch
                                checked={report.status === "active"}
                                onCheckedChange={() => handleToggleStatus(report.id)}
                              />
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDeleteReport(report.id)}
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                
                <div className="mt-4 flex justify-end">
                  <Button onClick={() => setActiveTab("create")}>
                    <Plus className="mr-2 h-4 w-4" />
                    Create New Report
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Create New Report Tab */}
          <TabsContent value="create" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Select Report Type</CardTitle>
                <CardDescription>
                  Choose the type of report you want to schedule
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {reportTypes.map((type) => (
                    <div
                      key={type.id}
                      className={`border rounded-lg p-4 cursor-pointer transition-all ${
                        selectedReportType === type.id
                          ? "border-primary bg-primary/5"
                          : "hover:border-gray-400"
                      }`}
                      onClick={() => setSelectedReportType(type.id)}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="rounded-full p-2 bg-primary/10">
                          {type.icon}
                        </div>
                        <div>
                          <h3 className="font-medium">{type.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {type.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="mt-6 flex justify-end">
                  <Button
                    variant="outline"
                    className="mr-2"
                    onClick={() => {
                      setSelectedReportType(null);
                      setActiveTab("scheduled");
                    }}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleCreateNewReport}>
                    Continue
                    <ArrowDown className="ml-2 h-4 w-4 rotate-90" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Configure Report Tab */}
          <TabsContent value="configure" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>
                  Configure {reportTypes.find(r => r.id === selectedReportType)?.name}
                </CardTitle>
                <CardDescription>
                  Set up the details and schedule for your report
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleScheduleReport} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="report-name">Report Name</Label>
                        <Input id="report-name" placeholder="Enter a name for this report" required />
                      </div>
                      
                      <div>
                        <Label htmlFor="report-description">Description (Optional)</Label>
                        <Input id="report-description" placeholder="Brief description of this report" />
                      </div>
                      
                      <div>
                        <Label htmlFor="frequency">Frequency</Label>
                        <Select defaultValue="weekly">
                          <SelectTrigger id="frequency">
                            <SelectValue placeholder="Select frequency" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="daily">Daily</SelectItem>
                            <SelectItem value="weekly">Weekly</SelectItem>
                            <SelectItem value="monthly">Monthly</SelectItem>
                            <SelectItem value="quarterly">Quarterly</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <Label htmlFor="time">Time of Day</Label>
                        <Select defaultValue="midnight">
                          <SelectTrigger id="time">
                            <SelectValue placeholder="Select time" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="midnight">12:00 AM (Midnight)</SelectItem>
                            <SelectItem value="morning">8:00 AM (Morning)</SelectItem>
                            <SelectItem value="noon">12:00 PM (Noon)</SelectItem>
                            <SelectItem value="evening">6:00 PM (Evening)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="format">Report Format</Label>
                        <Select defaultValue="pdf">
                          <SelectTrigger id="format">
                            <SelectValue placeholder="Select format" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pdf">PDF Document</SelectItem>
                            <SelectItem value="excel">Excel Spreadsheet</SelectItem>
                            <SelectItem value="csv">CSV File</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <Label>Recipients</Label>
                        <div className="space-y-2 mt-1">
                          <div className="flex items-center space-x-2">
                            <Checkbox id="recipient-hr" />
                            <label
                              htmlFor="recipient-hr"
                              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                              HR Department
                            </label>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <Checkbox id="recipient-managers" />
                            <label
                              htmlFor="recipient-managers"
                              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                              Department Managers
                            </label>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <Checkbox id="recipient-me" defaultChecked />
                            <label
                              htmlFor="recipient-me"
                              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                              Send to me
                            </label>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <Label htmlFor="additional-emails">Additional Email Recipients</Label>
                        <Input id="additional-emails" placeholder="email@example.com, another@example.com" />
                        <p className="text-xs text-muted-foreground mt-1">
                          Separate multiple emails with commas
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <Label>Report Content</Label>
                    <div className="border rounded-lg p-4 mt-2 space-y-3">
                      <div className="flex items-center space-x-2">
                        <Checkbox id="content-summary" defaultChecked />
                        <label
                          htmlFor="content-summary"
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          Include summary statistics
                        </label>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Checkbox id="content-charts" defaultChecked />
                        <label
                          htmlFor="content-charts"
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          Include visual charts
                        </label>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Checkbox id="content-details" defaultChecked />
                        <label
                          htmlFor="content-details"
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          Include detailed records
                        </label>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-end space-x-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setSelectedReportType(null);
                        setActiveTab("create");
                      }}
                    >
                      Back
                    </Button>
                    <Button type="submit">Schedule Report</Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default ReportScheduler;
