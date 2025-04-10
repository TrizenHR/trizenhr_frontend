
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Search, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";

// Form schema with validation
const formSchema = z.object({
  employeeName: z.string().min(1, { message: "Employee Name is required" }),
  gender: z.string().min(1, { message: "Gender is required" }),
  emailId: z.string().email({ message: "Invalid email address" }).optional().or(z.literal("")),
  mobileNumberType: z.enum(["office", "personal"], {
    required_error: "Mobile Number Type is required",
  }),
  department: z.string().min(1, { message: "Department is required" }),
  shiftGroup: z.string().min(1, { message: "Shift Group is required" }),
  role: z.string().min(1, { message: "Role is required" }),
  subscriptionPlan: z.string().optional(),
  employeeId: z.string().min(1, { message: "Employee ID is required" }),
  employeeType: z.string().min(1, { message: "Employee Type is required" }),
  mobileNumber: z.string().min(1, { message: "Mobile Number is required" }),
  location: z.string().min(1, { message: "Location is required" }),
  subDepartment: z.string().optional(),
  designation: z.string().min(1, { message: "Designation is required" }),
});

// Sample data for dropdowns
const genderOptions = ["Male", "Female", "Other"];
const departmentOptions = ["IT", "HR", "Finance", "Marketing", "Sales", "Operations"];
const subDepartmentOptions = ["Development", "Testing", "DevOps", "Design", "Support"];
const shiftGroupOptions = ["General Shift", "Morning Shift", "Night Shift", "Rotating Shift"];
const roleOptions = ["Admin", "Manager", "Team Lead", "Developer", "Tester"];
const subscriptionPlanOptions = ["Basic", "Standard", "Premium", "Enterprise"];
const employeeTypeOptions = ["Full-Time", "Part-Time", "Contract", "Intern"];
const locationOptions = ["Hyderabad", "Bangalore", "Mumbai", "Delhi", "Chennai", "Pune"];
const designationOptions = [
  "Sales Executive",
  "TEAM LEADER",
  "Trainer",
  "Administrator",
  "CEO",
  "CTO",
  "CFO",
  "Project Manager",
  "Senior Developer",
  "Junior Developer",
  "UI/UX Designer",
  "Business Analyst",
];

export default function CreateEmployee() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchDesignation, setSearchDesignation] = useState("");
  const [designationOpen, setDesignationOpen] = useState(false);

  // Initialize the form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      employeeName: "",
      gender: "",
      emailId: "",
      mobileNumberType: "office",
      department: "",
      shiftGroup: "",
      role: "",
      subscriptionPlan: "",
      employeeId: "",
      employeeType: "",
      mobileNumber: "",
      location: "",
      subDepartment: "",
      designation: "",
    },
  });

  // Filter designations based on search
  const filteredDesignations = designationOptions.filter((designation) =>
    designation.toLowerCase().includes(searchDesignation.toLowerCase())
  );

  // Form submission handler
  function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      console.log(values);
      toast({
        title: "Employee Created",
        description: `${values.employeeName} has been created successfully.`,
      });
      setIsSubmitting(false);
    }, 1500);
  }

  return (
    <div className="container max-w-6xl mx-auto px-6 py-8">
      <h1 className="text-xl font-semibold text-gray-700 mb-6">Create Employee</h1>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-4">
              {/* Employee Name */}
              <FormField
                control={form.control}
                name="employeeName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-gray-600">
                      Employee Name<span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Enter employee name" 
                        className="rounded-md border-gray-300 p-2 w-full"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Gender */}
              <FormField
                control={form.control}
                name="gender"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-gray-600">
                      Gender<span className="text-red-500">*</span>
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="rounded-md border-gray-300 p-2 w-full">
                          <SelectValue placeholder="Select gender" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {genderOptions.map((gender) => (
                          <SelectItem key={gender} value={gender}>
                            {gender}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Email ID */}
              <FormField
                control={form.control}
                name="emailId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-gray-600">
                      Email ID
                    </FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Enter email address" 
                        className="rounded-md border-gray-300 p-2 w-full"
                        type="email"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Mobile Number Type */}
              <FormField
                control={form.control}
                name="mobileNumberType"
                render={({ field }) => (
                  <FormItem className="space-y-1">
                    <FormLabel className="text-sm font-medium text-gray-600">
                      Mobile Number Type
                    </FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex space-x-6"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="office" id="office" />
                          <Label htmlFor="office">Office number</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="personal" id="personal" />
                          <Label htmlFor="personal">Personal number</Label>
                        </div>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Department */}
              <FormField
                control={form.control}
                name="department"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-gray-600">
                      Department<span className="text-red-500">*</span>
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="rounded-md border-gray-300 p-2 w-full">
                          <SelectValue placeholder="Select department" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {departmentOptions.map((department) => (
                          <SelectItem key={department} value={department}>
                            {department}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Shift Group */}
              <FormField
                control={form.control}
                name="shiftGroup"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-gray-600">
                      Shift Group<span className="text-red-500">*</span>
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="rounded-md border-gray-300 p-2 w-full">
                          <SelectValue placeholder="Select shift group" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {shiftGroupOptions.map((shiftGroup) => (
                          <SelectItem key={shiftGroup} value={shiftGroup}>
                            {shiftGroup}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Role */}
              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-gray-600">
                      Role<span className="text-red-500">*</span>
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="rounded-md border-gray-300 p-2 w-full">
                          <SelectValue placeholder="Select role" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {roleOptions.map((role) => (
                          <SelectItem key={role} value={role}>
                            {role}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Subscription Plan */}
              <FormField
                control={form.control}
                name="subscriptionPlan"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-gray-600">
                      Subscription Plan
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="rounded-md border-gray-300 p-2 w-full">
                          <SelectValue placeholder="Select subscription plan" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {subscriptionPlanOptions.map((plan) => (
                          <SelectItem key={plan} value={plan}>
                            {plan}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Right Column */}
            <div className="space-y-4">
              {/* Employee ID */}
              <FormField
                control={form.control}
                name="employeeId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-gray-600">
                      Employee ID<span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Enter employee ID" 
                        className="rounded-md border-gray-300 p-2 w-full"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Employee Type */}
              <FormField
                control={form.control}
                name="employeeType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-gray-600">
                      Employee Type<span className="text-red-500">*</span>
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="rounded-md border-gray-300 p-2 w-full">
                          <SelectValue placeholder="Select employee type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {employeeTypeOptions.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Mobile Number */}
              <FormField
                control={form.control}
                name="mobileNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-gray-600">
                      Mobile Number<span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <div className="flex gap-2">
                        <Select defaultValue="+91">
                          <SelectTrigger className="w-24 rounded-md border-gray-300">
                            <SelectValue placeholder="+91" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="+91">+91</SelectItem>
                            <SelectItem value="+1">+1</SelectItem>
                            <SelectItem value="+44">+44</SelectItem>
                            <SelectItem value="+61">+61</SelectItem>
                          </SelectContent>
                        </Select>
                        <Input 
                          placeholder="Enter mobile number" 
                          className="flex-1 rounded-md border-gray-300 p-2"
                          {...field} 
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Location */}
              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-gray-600">
                      Location<span className="text-red-500">*</span>
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="rounded-md border-gray-300 p-2 w-full">
                          <SelectValue placeholder="Select location" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {locationOptions.map((location) => (
                          <SelectItem key={location} value={location}>
                            {location}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Sub-Department */}
              <FormField
                control={form.control}
                name="subDepartment"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-gray-600">
                      Sub-Department
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="rounded-md border-gray-300 p-2 w-full">
                          <SelectValue placeholder="Select sub-department" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {subDepartmentOptions.map((subDepartment) => (
                          <SelectItem key={subDepartment} value={subDepartment}>
                            {subDepartment}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Designation - with search */}
              <FormField
                control={form.control}
                name="designation"
                render={({ field }) => (
                  <FormItem className="relative">
                    <FormLabel className="text-sm font-medium text-gray-600">
                      Designation<span className="text-red-500">*</span>
                    </FormLabel>
                    <div className="relative">
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        open={designationOpen}
                        onOpenChange={setDesignationOpen}
                      >
                        <FormControl>
                          <SelectTrigger 
                            className="rounded-md border-gray-300 p-2 w-full" 
                            onClick={() => setDesignationOpen(true)}
                          >
                            <SelectValue placeholder="Search designation" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent 
                          className="w-full" 
                          onCloseAutoFocus={(e) => e.preventDefault()}
                        >
                          <div className="px-3 py-2 border-b">
                            <div className="relative">
                              <Search className="h-4 w-4 absolute left-2 top-2.5 text-gray-500" />
                              <Input 
                                placeholder="Search designation..." 
                                className="pl-8"
                                value={searchDesignation}
                                onChange={(e) => setSearchDesignation(e.target.value)}
                                onClick={(e) => e.stopPropagation()}
                              />
                            </div>
                          </div>
                          <div className="max-h-[150px] overflow-y-auto">
                            {filteredDesignations.length > 0 ? (
                              filteredDesignations.map((designation) => (
                                <SelectItem key={designation} value={designation}>
                                  {designation}
                                </SelectItem>
                              ))
                            ) : (
                              <div className="p-2 text-center text-sm text-gray-500">
                                No designations found
                              </div>
                            )}
                          </div>
                        </SelectContent>
                      </Select>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Form Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button 
              type="submit" 
              className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700"
              disabled={isSubmitting}
            >
              {isSubmitting && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Create Employee
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              className="w-full sm:w-auto"
              onClick={() => form.reset()}
            >
              Cancel
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
