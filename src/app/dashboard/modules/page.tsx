'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Clock, CalendarDays, Wallet, Users, Target, Shield, Save } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface SystemModule {
  id: string;
  name: string;
  description: string;
  icon: any;
  iconColor: string;
  iconBg: string;
  enabled: boolean;
  locked?: boolean;
}

const INITIAL_MODULES: SystemModule[] = [
  {
    id: 'attendance',
    name: 'Attendance Tracking',
    description: 'Real-time check-in, check-out, geofencing, selfie verification, and shift management.',
    icon: Clock,
    iconColor: 'text-blue-600',
    iconBg: 'bg-blue-500/10',
    enabled: true,
    locked: true, // Locked since it's core to the tenant application
  },
  {
    id: 'leave',
    name: 'Leave Management',
    description: 'Custom leave types, balance accruals, encashments, and multi-tier approval workflows.',
    icon: CalendarDays,
    iconColor: 'text-indigo-600',
    iconBg: 'bg-indigo-500/10',
    enabled: true,
  },
  {
    id: 'payroll',
    name: 'Payroll Engine',
    description: 'Salary structures, deductions (PF/ESI/Taxes), LOP rules, overtime, and automated payslip generation.',
    icon: Wallet,
    iconColor: 'text-emerald-600',
    iconBg: 'bg-emerald-500/10',
    enabled: true,
  },
  {
    id: 'recruitment',
    name: 'Recruitment & ATS',
    description: 'Applicant tracking, vacancy posting, resume parses, and scheduling interview rounds.',
    icon: Users,
    iconColor: 'text-amber-600',
    iconBg: 'bg-amber-500/10',
    enabled: false,
  },
  {
    id: 'performance',
    name: 'Performance & OKRs',
    description: 'Quarterly review cycles, performance appraisals, goal sheets, and 360-degree peer feedback.',
    icon: Target,
    iconColor: 'text-purple-600',
    iconBg: 'bg-purple-500/10',
    enabled: false,
  },
];

export default function ModulesPage() {
  const [modules, setModules] = useState<SystemModule[]>(INITIAL_MODULES);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleToggle = (id: string, checked: boolean) => {
    setModules(prev =>
      prev.map(m => {
        if (m.id === id) {
          return { ...m, enabled: checked };
        }
        return m;
      })
    );
  };

  const handleSave = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      toast({
        title: 'Modules Configured',
        description: 'Module states saved locally. Backend integration pending.',
      });
    }, 600);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold md:text-3xl font-sf">Modules Management</h1>
          <p className="text-sm text-muted-foreground mt-1">Activate or deactivate specific product modules for your organization</p>
        </div>
        <Button onClick={handleSave} disabled={isLoading} className="shadow-md">
          <Save className="mr-2 h-4 w-4" />
          {isLoading ? 'Saving...' : 'Save Configuration'}
        </Button>
      </div>

      {/* Warning/Alert Banner */}
      <div className="flex gap-3 items-start bg-amber-500/10 text-amber-800 rounded-xl p-4 text-sm border border-amber-500/20 font-medium">
        <Shield className="h-5 w-5 shrink-0 mt-0.5 text-amber-600" />
        <div>
          <h4 className="font-bold mb-1 text-amber-900">Module Access Alert</h4>
          <p className="leading-relaxed">Disabling a module hides related navigation menus and restricts API endpoints for all users. System database tables are preserved and data remains intact during suspension.</p>
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {modules.map(module => {
          const Icon = module.icon;
          return (
            <Card key={module.id} className="flex flex-col h-full hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center gap-3 pb-3">
                <div className={`size-10 rounded-xl ${module.iconBg} flex items-center justify-center`}>
                  <Icon className={`size-5.5 ${module.iconColor}`} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <CardTitle className="text-base truncate">{module.name}</CardTitle>
                    {module.locked && (
                      <Badge variant="secondary" className="text-[10px] font-bold px-1.5 py-0">CORE</Badge>
                    )}
                  </div>
                  <CardDescription className="text-xs">
                    Status: {module.enabled ? (
                      <span className="text-emerald-600 font-semibold">Active</span>
                    ) : (
                      <span className="text-muted-foreground">Inactive</span>
                    )}
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="flex-1 pb-4">
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {module.description}
                </p>
              </CardContent>
              <CardFooter className="border-t border-border/50 pt-3 flex items-center justify-between">
                <span className="text-xs text-muted-foreground font-semibold">
                  {module.locked ? 'Permanently Enabled' : 'Enable Module'}
                </span>
                <Switch
                  checked={module.enabled}
                  disabled={module.locked}
                  onCheckedChange={checked => handleToggle(module.id, checked)}
                />
              </CardFooter>
            </Card>
          );
        })}
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <Button variant="outline" onClick={() => setModules(INITIAL_MODULES)}>Reset Defaults</Button>
        <Button onClick={handleSave} disabled={isLoading}>
          <Save className="mr-2 h-4 w-4" />
          {isLoading ? 'Saving...' : 'Save Configuration'}
        </Button>
      </div>
    </div>
  );
}
