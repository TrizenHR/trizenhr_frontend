
import React, { useState } from 'react';
import { 
  User, 
  Camera, 
  Mail, 
  Phone,
  Lock,
  ShieldCheck
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Switch } from '@/components/ui/switch';

interface ProfileSettingsProps {
  onChange: () => void;
}

const ProfileSettings: React.FC<ProfileSettingsProps> = ({ onChange }) => {
  const [profileData, setProfileData] = useState({
    name: 'Admin User',
    email: 'admin@trizen.com',
    phone: '+91 9876543210',
    twoFactorEnabled: false
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({ ...prev, [name]: value }));
    onChange();
  };

  const handleToggle2FA = (checked: boolean) => {
    setProfileData((prev) => ({ ...prev, twoFactorEnabled: checked }));
    onChange();
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    // In a real app, this would upload the image to a server
    onChange();
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-1">Profile Settings</h2>
        <p className="text-gray-500 text-sm">Manage your personal information and security preferences</p>
      </div>

      <div className="flex items-center gap-6">
        <div className="relative">
          <Avatar className="h-24 w-24 border">
            <AvatarImage src="/placeholder.svg" alt="Profile" />
            <AvatarFallback>AU</AvatarFallback>
          </Avatar>
          <label 
            htmlFor="avatar-upload" 
            className="absolute -right-2 -bottom-2 p-1.5 bg-primary text-white rounded-full cursor-pointer hover:bg-primary/90 transition-colors"
          >
            <Camera className="h-4 w-4" />
            <input 
              id="avatar-upload" 
              type="file" 
              accept="image/*" 
              className="hidden" 
              onChange={handleImageUpload}
            />
          </label>
        </div>
        
        <div>
          <h3 className="font-medium">{profileData.name}</h3>
          <p className="text-gray-500 text-sm">Administrator</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <User className="h-5 w-5" />
              Personal Information
            </CardTitle>
            <CardDescription>Update your basic profile information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input 
                id="name" 
                name="name" 
                value={profileData.name} 
                onChange={handleInputChange} 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input 
                id="email" 
                name="email" 
                type="email" 
                value={profileData.email} 
                onChange={handleInputChange} 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input 
                id="phone" 
                name="phone" 
                value={profileData.phone} 
                onChange={handleInputChange} 
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Lock className="h-5 w-5" />
              Security Settings
            </CardTitle>
            <CardDescription>Manage your password and security preferences</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button variant="outline" className="w-full">
              Change Password
            </Button>
            
            <div className="pt-4 border-t">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="flex items-center">
                    <ShieldCheck className="h-5 w-5 mr-2 text-primary" />
                    <Label htmlFor="two-factor">Two-Factor Authentication</Label>
                  </div>
                  <p className="text-sm text-gray-500">
                    Add an extra layer of security to your account
                  </p>
                </div>
                <Switch 
                  id="two-factor" 
                  checked={profileData.twoFactorEnabled}
                  onCheckedChange={handleToggle2FA}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProfileSettings;
