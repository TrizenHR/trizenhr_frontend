
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, ArrowLeft, Upload } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink } from "@/components/Breadcrumb";
import DashboardLayout from "@/components/DashboardLayout";

const formSchema = z.object({
  // Basic Details
  employeeName: z.string().min(1, { message: "Full Name is required" }),
  employeeId: z.string().min(1, { message: "Employee ID is required" }),
  dateOfBirth: z.string().optional(),
  gender: z.string().min(1, { message: "Gender is required" }),
  email: z.string().email({ message: "Invalid email address" }).optional().or(z.literal("")),
  mobile: z.string().min(1, { message: "Mobile Number is required" }),
  
  // Employment Details
  department: z.string().min(1, { message: "Department is required" }),
  designation: z.string().min(1, { message: "Designation is required" }),
  joiningDate: z.string().min(1, { message: "Joining Date is required" }),
  reportingManager: z.string().optional(),
  location: z.string().min(1, { message: "Location is required" }),
  employmentType: z.string().min(1, { message: "Employment Type is required" }),
  workStatus: z.string().min(1, { message: "Work Status is required" }),
  role: z.string().min(1, { message: "Role is required" }),
  
  // Credential Details
  sendCredentials: z.boolean().default(false),
});

const genderOptions = ["Male", "Female", "Other"];
const departmentOptions = ["IT", "HR", "Finance", "Marketing", "Sales", "Operations", "Management"];
const designationOptions = [
  "Software Developer",
  "HR Manager",
  "Accountant",
  "Marketing Director",
  "Sales Executive",
  "Operations Analyst",
  "CEO",
  "CTO",
  "Team Leader",
  "Project Manager",
];
const locationOptions = ["NOQU Thousand Lights", "NOQU Anna Nagar", "NOQU T Nagar", "NOQU Velachery"];
const employmentTypeOptions = ["Full-Time", "Part-Time", "Contract", "Intern"];
const workStatusOptions = ["Active", "Inactive", "On Leave", "On Notice", "Resigned"];
const roleOptions = ["Admin", "Manager", "Employee"];

// Mock data to simulate fetching employee details by ID
const employeeData = [
  { 
    id: 12024, 
    employeeId: 'NOQ08', 
    employeeName: 'Gopal Test', 
    email: 'gopalanandh11+1@gmail.com', 
    location: 'NOQU Thousand Lights', 
    mobile: '9876543210', 
    joiningDate: '2024-12-17',
    dateOfBirth: '1990-05-15',
    gender: 'Male',
    department: 'IT',
    designation: 'Software Developer',
    workStatus: 'Active',
    reportingManager: 'Aditya Kumar',
    role: 'Employee',
    employmentType: 'Full-Time'
  },
  { 
    id: 12025, 
    employeeId: 'NOQ09', 
    employeeName: 'Shreya Patel', 
    email: 'shreya.patel@example.com', 
    location: 'NOQU Anna Nagar', 
    mobile: '9876543210', 
    joiningDate: '2024-12-20',
    dateOfBirth: '1992-08-22',
    gender: 'Female',
    department: 'HR',
    designation: 'HR Manager',
    workStatus: 'Active',
    reportingManager: 'Meena Iyer',
    role: 'Manager',
    employmentType: 'Full-Time'
  }
];

export default function EditEmployee() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("basic");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState({
    offerLetter: null,
    idProof: null,
    resume: null,
    photo: null,
    experienceLetter: null
  });
  
  // Create a form instance
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      employeeName: "",
      employeeId: "",
      dateOfBirth: "",
      gender: "",
      email: "",
      mobile: "",
      department: "",
      designation: "",
      joiningDate: "",
      reportingManager: "",
      location: "",
      employmentType: "",
      workStatus: "",
      role: "",
      sendCredentials: false,
    },
  });

  // Fetch employee data on component mount
  useEffect(() => {
    if (id) {
      // In a real application, this would be an API call
      const employee = employeeData.find(emp => emp.id === Number(id));
      
      if (employee) {
        // Populate form with employee data
        form.reset({
          employeeName: employee.employeeName,
          employeeId: employee.employeeId,
          dateOfBirth: employee.dateOfBirth,
          gender: employee.gender,
          email: employee.email,
          mobile: employee.mobile,
          department: employee.department,
          designation: employee.designation,
          joiningDate: employee.joiningDate,
          reportingManager: employee.reportingManager,
          location: employee.location,
          employmentType: employee.employmentType,
          workStatus: employee.workStatus,
          role: employee.role,
          sendCredentials: false,
        });
      } else {
        // If employee not found, redirect to employee list
        toast({
          title: "Employee Not Found",
          description: "The employee you're trying to edit does not exist.",
          variant: "destructive",
        });
        navigate("/admin/dashboard/employee-list");
      }
    }
  }, [id, form, navigate, toast]);

  const handleFileUpload = (fileType: string, event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setUploadedFiles({
        ...uploadedFiles,
        [fileType]: event.target.files[0]
      });
      
      toast({
        title: "File Uploaded",
        description: `${fileType.charAt(0).toUpperCase() + fileType.slice(1)} has been uploaded successfully.`,
      });
    }
  };

  function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    
    // In a real application, this would be an API call
    setTimeout(() => {
      console.log(values);
      console.log("Uploaded files:", uploadedFiles);
      
      toast({
        title: "Employee Updated",
        description: `${values.employeeName} has been updated successfully.`,
      });
      
      setIsSubmitting(false);
      navigate("/admin/dashboard/employee-list");
    }, 1500);
  }

  return (
    <DashboardLayout>
      <div className="container px-6 py-6">
        <Breadcrumb className="mb-4">
          <BreadcrumbItem>
            <BreadcrumbLink href="/admin/dashboard">Dashboard</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbItem>
            <BreadcrumbLink href="/admin/dashboard/employee-list">Employee List</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbItem>
            <BreadcrumbLink href="#" isCurrentPage>Edit Employee</BreadcrumbLink>
          </BreadcrumbItem>
        </Breadcrumb>
        
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => navigate("/admin/dashboard/employee-list")}
            >
              <ArrowLeft size={18} />
            </Button>
            <h1 className="text-2xl font-bold">Edit Employee</h1>
          </div>
        </div>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="w-full grid grid-cols-3">
                <TabsTrigger value="basic">Basic Details</TabsTrigger>
                <TabsTrigger value="employment">Employment Details</TabsTrigger>
                <TabsTrigger value="documents">Documents & Credentials</TabsTrigger>
              </TabsList>
              
              {/* Basic Details Tab */}
              <TabsContent value="basic" className="space-y-6 mt-6">
                <div className="bg-white rounded-lg p-6 shadow-sm space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="employeeName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Name <span className="text-red-500">*</span></FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Enter employee name" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="employeeId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Employee ID <span className="text-red-500">*</span></FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Enter employee ID" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="dateOfBirth"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Date of Birth</FormLabel>
                          <FormControl>
                            <Input 
                              type="date" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="gender"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Gender <span className="text-red-500">*</span></FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select gender" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {genderOptions.map((gender) => (
                                <SelectItem key={gender} value={gender}>{gender}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email ID</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Enter email address" 
                              type="email"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="mobile"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Mobile Number <span className="text-red-500">*</span></FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Enter mobile number" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="flex justify-end gap-3">
                    <Button 
                      type="button" 
                      variant="outline"
                      onClick={() => navigate("/admin/dashboard/employee-list")}
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="button" 
                      onClick={() => setActiveTab("employment")}
                    >
                      Next: Employment Details
                    </Button>
                  </div>
                </div>
              </TabsContent>
              
              {/* Employment Details Tab */}
              <TabsContent value="employment" className="space-y-6 mt-6">
                <div className="bg-white rounded-lg p-6 shadow-sm space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="department"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Department <span className="text-red-500">*</span></FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select department" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {departmentOptions.map((department) => (
                                <SelectItem key={department} value={department}>{department}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="designation"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Designation <span className="text-red-500">*</span></FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select designation" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {designationOptions.map((designation) => (
                                <SelectItem key={designation} value={designation}>{designation}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="joiningDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Joining Date <span className="text-red-500">*</span></FormLabel>
                          <FormControl>
                            <Input 
                              type="date" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="reportingManager"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Reporting Manager</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select reporting manager" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Aditya Kumar">Aditya Kumar</SelectItem>
                              <SelectItem value="Meena Iyer">Meena Iyer</SelectItem>
                              <SelectItem value="Vijay Nair">Vijay Nair</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="location"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Location <span className="text-red-500">*</span></FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select location" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {locationOptions.map((location) => (
                                <SelectItem key={location} value={location}>{location}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="employmentType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Employment Type <span className="text-red-500">*</span></FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select employment type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {employmentTypeOptions.map((type) => (
                                <SelectItem key={type} value={type}>{type}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="workStatus"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Work Status <span className="text-red-500">*</span></FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select work status" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {workStatusOptions.map((status) => (
                                <SelectItem key={status} value={status}>{status}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="role"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Role <span className="text-red-500">*</span></FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select role" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {roleOptions.map((role) => (
                                <SelectItem key={role} value={role}>{role}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="flex justify-end gap-3">
                    <Button 
                      type="button" 
                      variant="outline"
                      onClick={() => setActiveTab("basic")}
                    >
                      Previous: Basic Details
                    </Button>
                    <Button 
                      type="button" 
                      onClick={() => setActiveTab("documents")}
                    >
                      Next: Documents & Credentials
                    </Button>
                  </div>
                </div>
              </TabsContent>
              
              {/* Documents Tab */}
              <TabsContent value="documents" className="space-y-6 mt-6">
                <div className="bg-white rounded-lg p-6 shadow-sm space-y-6">
                  <h3 className="text-lg font-medium">Documents</h3>
                  
                  <div className="grid grid-cols-1 gap-4">
                    <div className="flex flex-col space-y-2">
                      <Label htmlFor="offerLetter">Offer Letter</Label>
                      <div className="flex items-center gap-3">
                        <Input 
                          id="offerLetter" 
                          type="file" 
                          className="w-full"
                          onChange={(e) => handleFileUpload('offerLetter', e)} 
                        />
                        {uploadedFiles.offerLetter && (
                          <span className="text-sm text-green-600">Uploaded</span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex flex-col space-y-2">
                      <Label htmlFor="idProof">ID Proof (Aadhaar, PAN)</Label>
                      <div className="flex items-center gap-3">
                        <Input 
                          id="idProof" 
                          type="file" 
                          className="w-full"
                          onChange={(e) => handleFileUpload('idProof', e)}
                        />
                        {uploadedFiles.idProof && (
                          <span className="text-sm text-green-600">Uploaded</span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex flex-col space-y-2">
                      <Label htmlFor="resume">Resume</Label>
                      <div className="flex items-center gap-3">
                        <Input 
                          id="resume" 
                          type="file" 
                          className="w-full"
                          onChange={(e) => handleFileUpload('resume', e)}
                        />
                        {uploadedFiles.resume && (
                          <span className="text-sm text-green-600">Uploaded</span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex flex-col space-y-2">
                      <Label htmlFor="experienceLetter">Experience Letter (if any)</Label>
                      <div className="flex items-center gap-3">
                        <Input 
                          id="experienceLetter" 
                          type="file" 
                          className="w-full"
                          onChange={(e) => handleFileUpload('experienceLetter', e)}
                        />
                        {uploadedFiles.experienceLetter && (
                          <span className="text-sm text-green-600">Uploaded</span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex flex-col space-y-2">
                      <Label htmlFor="photo">Photo ID</Label>
                      <div className="flex items-center gap-3">
                        <Input 
                          id="photo" 
                          type="file" 
                          accept="image/*"
                          className="w-full"
                          onChange={(e) => handleFileUpload('photo', e)}
                        />
                        {uploadedFiles.photo && (
                          <span className="text-sm text-green-600">Uploaded</span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="border-t pt-6 mt-6">
                    <h3 className="text-lg font-medium mb-4">Login Credentials</h3>
                    
                    <FormField
                      control={form.control}
                      name="sendCredentials"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                          <FormControl>
                            <RadioGroup
                              onValueChange={(value) => field.onChange(value === "true")}
                              defaultValue={field.value ? "true" : "false"}
                              className="flex flex-col gap-3"
                            >
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="true" id="send-yes" />
                                <Label htmlFor="send-yes">
                                  Send login credentials to employee via email
                                </Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="false" id="send-no" />
                                <Label htmlFor="send-no">
                                  Don't send credentials
                                </Label>
                              </div>
                            </RadioGroup>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="flex justify-end gap-3">
                    <Button 
                      type="button" 
                      variant="outline"
                      onClick={() => setActiveTab("employment")}
                    >
                      Previous: Employment Details
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        "Save Employee"
                      )}
                    </Button>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </form>
        </Form>
      </div>
    </DashboardLayout>
  );
}
