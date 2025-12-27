
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff } from "lucide-react";

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{email?: string, password?: string}>({});
  const { login } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const validateForm = () => {
    const newErrors: {email?: string, password?: string} = {};
    
    if (!email) {
      newErrors.email = "Email / Mobile is required";
    }
    
    if (!password) {
      newErrors.password = "Password is required";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      const result = await login(email, password);
      
      if (result.success) {
        toast({
          title: "Success",
          description: "Login successful!",
        });
        
        // Redirect based on user role
        const storedUser = localStorage.getItem('auth_user');
        if (storedUser) {
          const user = JSON.parse(storedUser);
          if (user.role === 'admin') {
            navigate('/admin/dashboard/employee-list');
          } else if (user.role === 'user') {
            navigate('/user/dashboard');
          }
        }
      } else {
        toast({
          title: "Error",
          description: result.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="flex flex-col md:flex-row h-screen">
      {/* Left Panel - Login Form */}
      <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col bg-white">
        <div className="mb-8">
          <img 
            src="/lovable-uploads/03356e85-3c07-49e1-a539-d7a0314780cc.png" 
            alt="Trizen Logo" 
            className="h-16"
          />
        </div>
        
        <div className="flex-grow flex flex-col justify-center max-w-md mx-auto w-full">
          <h1 className="text-3xl font-bold text-[#1b2a4e] mb-8">Sign In</h1>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-[#1b2a4e] font-medium">
                Email / Mobile <span className="text-red-500">*</span>
              </Label>
              <Input
                id="email"
                type="text"
                placeholder="Email / Mobile"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`border ${errors.email ? 'border-red-500' : 'border-gray-300'} rounded-md`}
              />
              {errors.email && (
                <p className="text-red-500 text-sm">{errors.email}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label htmlFor="password" className="text-[#1b2a4e] font-medium">
                  Password <span className="text-red-500">*</span>
                </Label>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`border pr-10 ${errors.password ? 'border-red-500' : 'border-gray-300'} rounded-md`}
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-500 text-sm">{errors.password}</p>
              )}
              <div className="flex justify-end">
                <a href="#" className="text-sm text-[#3b2ba1] hover:underline">
                  Forgot password?
                </a>
              </div>
            </div>
            
            <Button 
              type="submit" 
              className="w-full bg-[#3b2ba1] hover:bg-[#2a1f76] text-white py-3"
              disabled={isLoading}
            >
              {isLoading ? "Signing In..." : "Sign In"}
            </Button>
          </form>
          
          <div className="mt-8 text-center">
            <p className="text-[#1b2a4e]">
              Don't have an account? {" "}
              <a href="#" className="text-[#3b2ba1] hover:underline font-medium">
                Sign Up
              </a>
            </p>
          </div>
          
          <div className="text-sm text-center text-gray-500 mt-8">
            <p>Admin: admin@noqu.com / admin123</p>
            <p>User: user@noqu.com / user123</p>
          </div>
        </div>
      </div>
      
      {/* Right Panel - Brand Background */}
      <div className="hidden md:block md:w-1/2 bg-[#fef7e0] relative overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-[240px] font-bold text-[#3b2ba1]/10 select-none">TRIZEN</div>
        </div>
        <div className="absolute bottom-0 right-0 p-12">
          <img 
            src="/lovable-uploads/03356e85-3c07-49e1-a539-d7a0314780cc.png" 
            alt="Trizen Logo" 
            className="w-32 opacity-30"
          />
        </div>
      </div>
    </div>
  );
};

export default Login;
