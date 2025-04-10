
import React, { useState } from 'react';
import { 
  Palette, 
  Upload, 
  Sun, 
  Moon, 
  Monitor,
  Save,
  ArrowRight
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { 
  ToggleGroup, 
  ToggleGroupItem 
} from '@/components/ui/toggle-group';

interface ThemeSettingsProps {
  onChange: () => void;
}

interface ColorSwatchProps {
  color: string;
  selected: boolean;
  onClick: () => void;
}

const predefinedColors = [
  { name: 'Trizen Brand Purple', value: '#3b2ba1' },
  { name: 'Blue', value: '#1e40af' },
  { name: 'Green', value: '#15803d' },
  { name: 'Red', value: '#b91c1c' },
  { name: 'Orange', value: '#c2410c' },
  { name: 'Pink', value: '#be185d' },
  { name: 'Teal', value: '#0f766e' },
  { name: 'Indigo', value: '#4f46e5' }
];

const ThemeSettings: React.FC<ThemeSettingsProps> = ({ onChange }) => {
  const [themeSettings, setThemeSettings] = useState({
    colorMode: 'light',
    primaryColor: '#3b2ba1',
    customLogo: '',
    customFavicon: '',
    appTitle: 'Trizen HRMS',
    footerText: '© 2025 Trizen Ventures LLP. All rights reserved.',
    enableCustomBranding: true,
    showCompanyLogo: true
  });

  const handleColorModeChange = (value: string) => {
    if (value) {
      setThemeSettings(prev => ({ ...prev, colorMode: value }));
      onChange();
    }
  };

  const handlePrimaryColorSelect = (color: string) => {
    setThemeSettings(prev => ({ ...prev, primaryColor: color }));
    onChange();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setThemeSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    onChange();
  };

  const handleFileUpload = (name: string) => {
    // In a real app, this would upload the file to a server
    // For demo purposes, we'll just set a placeholder value
    setThemeSettings(prev => ({
      ...prev,
      [name]: name === 'customLogo' ? '/placeholder.svg' : '/favicon.ico'
    }));
    onChange();
  };

  const ColorSwatch: React.FC<ColorSwatchProps> = ({ color, selected, onClick }) => {
    return (
      <div
        className={`w-8 h-8 rounded-full cursor-pointer transition-all ${
          selected ? 'ring-2 ring-offset-2 ring-black dark:ring-white' : ''
        }`}
        style={{ backgroundColor: color }}
        onClick={onClick}
        title={predefinedColors.find(c => c.value === color)?.name || color}
      />
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-1">Theme & Branding</h2>
        <p className="text-gray-500 text-sm">Customize the appearance of your HRMS application</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Sun className="h-5 w-5" />
              <Moon className="h-5 w-5" />
              Theme Mode
            </CardTitle>
            <CardDescription>Choose light, dark, or system mode</CardDescription>
          </CardHeader>
          <CardContent>
            <ToggleGroup 
              type="single" 
              value={themeSettings.colorMode}
              onValueChange={handleColorModeChange}
              className="justify-start"
            >
              <ToggleGroupItem value="light" aria-label="Light Mode">
                <Sun className="mr-2 h-4 w-4" />
                Light
              </ToggleGroupItem>
              <ToggleGroupItem value="dark" aria-label="Dark Mode">
                <Moon className="mr-2 h-4 w-4" />
                Dark
              </ToggleGroupItem>
              <ToggleGroupItem value="system" aria-label="System Mode">
                <Monitor className="mr-2 h-4 w-4" />
                System
              </ToggleGroupItem>
            </ToggleGroup>
            
            <div className="mt-6 space-y-2">
              <Label>Primary Color</Label>
              <div className="flex flex-wrap gap-3">
                {predefinedColors.map(color => (
                  <ColorSwatch
                    key={color.value}
                    color={color.value}
                    selected={themeSettings.primaryColor === color.value}
                    onClick={() => handlePrimaryColorSelect(color.value)}
                  />
                ))}
                <div className="flex items-center">
                  <ArrowRight className="h-4 w-4 mx-1 text-gray-400" />
                  <input
                    type="color"
                    value={themeSettings.primaryColor}
                    onChange={(e) => handlePrimaryColorSelect(e.target.value)}
                    className="w-8 h-8 rounded-full cursor-pointer"
                  />
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                This color will be used for buttons, links, and accents
              </p>
            </div>
            
            <div className="mt-6">
              <h3 className="font-medium mb-4">Preview</h3>
              <div className={`
                p-4 rounded-lg border shadow-sm 
                ${themeSettings.colorMode === 'dark' ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}
              `}>
                <h4 className="font-medium">Sample Card</h4>
                <p className="text-sm mt-1 mb-4">This is how your content will look.</p>
                <Button 
                  style={{ 
                    backgroundColor: themeSettings.primaryColor,
                    color: 'white',
                    border: 'none' 
                  }}
                >
                  Sample Button
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Palette className="h-5 w-5" />
              Custom Branding
            </CardTitle>
            <CardDescription>Upload your logo and customize app appearance</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="enableCustomBranding">Enable Custom Branding</Label>
                <p className="text-sm text-gray-500">
                  Apply your organization's branding to the app
                </p>
              </div>
              <Switch 
                id="enableCustomBranding" 
                name="enableCustomBranding" 
                checked={themeSettings.enableCustomBranding}
                onCheckedChange={(checked) => 
                  handleInputChange({ 
                    target: { name: 'enableCustomBranding', checked, type: 'checkbox' } 
                  } as React.ChangeEvent<HTMLInputElement>)
                }
              />
            </div>
            
            {themeSettings.enableCustomBranding && (
              <>
                <div className="space-y-2 pt-2">
                  <Label htmlFor="appTitle">Application Title</Label>
                  <Input 
                    id="appTitle" 
                    name="appTitle" 
                    value={themeSettings.appTitle} 
                    onChange={handleInputChange} 
                  />
                  <p className="text-xs text-gray-500">
                    Displayed in browser tab and app header
                  </p>
                </div>
                
                <div className="flex items-center justify-between pt-2">
                  <div className="space-y-0.5">
                    <Label htmlFor="showCompanyLogo">Show Company Logo</Label>
                    <p className="text-sm text-gray-500">
                      Display your logo in the application
                    </p>
                  </div>
                  <Switch 
                    id="showCompanyLogo" 
                    name="showCompanyLogo" 
                    checked={themeSettings.showCompanyLogo}
                    onCheckedChange={(checked) => 
                      handleInputChange({ 
                        target: { name: 'showCompanyLogo', checked, type: 'checkbox' } 
                      } as React.ChangeEvent<HTMLInputElement>)
                    }
                  />
                </div>
                
                {themeSettings.showCompanyLogo && (
                  <div className="space-y-2 pt-2">
                    <Label htmlFor="logo-upload">Company Logo</Label>
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 border rounded-md bg-slate-50 flex items-center justify-center">
                        {themeSettings.customLogo ? (
                          <img src={themeSettings.customLogo} alt="Logo" className="max-h-full max-w-full" />
                        ) : (
                          <Palette className="h-6 w-6 text-gray-400" />
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
                          onChange={() => handleFileUpload('customLogo')}
                        />
                      </label>
                    </div>
                    <p className="text-xs text-gray-500">Recommended size: 200x60px. Max 2MB.</p>
                  </div>
                )}
                
                <div className="space-y-2 pt-2">
                  <Label htmlFor="favicon-upload">Custom Favicon</Label>
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 border rounded-md bg-slate-50 flex items-center justify-center">
                      {themeSettings.customFavicon ? (
                        <img src={themeSettings.customFavicon} alt="Favicon" className="max-h-full max-w-full" />
                      ) : (
                        <Palette className="h-4 w-4 text-gray-400" />
                      )}
                    </div>
                    <label className="cursor-pointer">
                      <Button variant="outline" type="button" size="sm" asChild>
                        <div>
                          <Upload className="h-4 w-4 mr-2" />
                          Upload Favicon
                        </div>
                      </Button>
                      <input 
                        id="favicon-upload" 
                        type="file" 
                        accept="image/x-icon,image/png" 
                        className="hidden" 
                        onChange={() => handleFileUpload('customFavicon')}
                      />
                    </label>
                  </div>
                  <p className="text-xs text-gray-500">PNG or ICO format. Recommended size: 32x32px.</p>
                </div>
                
                <div className="space-y-2 pt-2">
                  <Label htmlFor="footerText">Footer Text</Label>
                  <Input 
                    id="footerText" 
                    name="footerText" 
                    value={themeSettings.footerText} 
                    onChange={handleInputChange} 
                  />
                  <p className="text-xs text-gray-500">
                    Displayed at the bottom of every page
                  </p>
                </div>
              </>
            )}
            
            <Button className="w-full mt-4">
              <Save className="mr-2 h-4 w-4" />
              Apply Branding Changes
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ThemeSettings;
