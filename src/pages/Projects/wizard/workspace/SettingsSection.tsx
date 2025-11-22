import { Card } from '../ui/card';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Switch } from '../ui/switch';
import { Button } from '../ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { Settings, Lock, CreditCard, GitBranch } from 'lucide-react';

export function SettingsSection() {
  return (
    <div className="space-y-6">
      {/* Project Details */}
      <Card className="p-6 shadow-sm border-[#E3E6EB]">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
            <Settings className="w-5 h-5 text-blue-600 stroke-[1.5]" />
          </div>
          <div>
            <h3 className="text-slate-900">Project Details</h3>
            <p className="text-sm text-slate-500">Basic project configuration</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Project Name</Label>
              <Input defaultValue="Digital Transformation Initiative" />
            </div>
            <div className="space-y-2">
              <Label>Project Code</Label>
              <Input defaultValue="PROJ-2024-001" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Start Date</Label>
              <Input type="date" defaultValue="2024-01-01" />
            </div>
            <div className="space-y-2">
              <Label>End Date</Label>
              <Input type="date" defaultValue="2024-12-31" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Project Type</Label>
              <Select defaultValue="fixed-price">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fixed-price">Fixed Price</SelectItem>
                  <SelectItem value="time-materials">Time & Materials</SelectItem>
                  <SelectItem value="retainer">Retainer</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select defaultValue="active">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="planned">Planned</SelectItem>
                  <SelectItem value="on-hold">On Hold</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <div className="space-y-0.5">
              <Label>Billable Project</Label>
              <p className="text-sm text-slate-500">Enable time tracking for billing</p>
            </div>
            <Switch defaultChecked />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Timesheet Required</Label>
              <p className="text-sm text-slate-500">Team members must log time</p>
            </div>
            <Switch defaultChecked />
          </div>
        </div>

        <div className="flex justify-end mt-6">
          <Button className="bg-blue-600 hover:bg-blue-700">Save Changes</Button>
        </div>
      </Card>

      {/* Permissions */}
      <Card className="p-6 shadow-sm border-[#E3E6EB]">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center">
            <Lock className="w-5 h-5 text-purple-600 stroke-[1.5]" />
          </div>
          <div>
            <h3 className="text-slate-900">Permissions</h3>
            <p className="text-sm text-slate-500">Control access to project data</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between py-3 border-b border-slate-100">
            <div>
              <p className="text-sm text-slate-900">Project Manager</p>
              <p className="text-xs text-slate-500">Full access to all features</p>
            </div>
            <span className="text-sm text-green-600">Full Access</span>
          </div>

          <div className="flex items-center justify-between py-3 border-b border-slate-100">
            <div>
              <p className="text-sm text-slate-900">Team Members</p>
              <p className="text-xs text-slate-500">Can view and edit tasks</p>
            </div>
            <span className="text-sm text-blue-600">Edit Access</span>
          </div>

          <div className="flex items-center justify-between py-3 border-b border-slate-100">
            <div>
              <p className="text-sm text-slate-900">Stakeholders</p>
              <p className="text-xs text-slate-500">View-only access</p>
            </div>
            <span className="text-sm text-slate-600">View Only</span>
          </div>
        </div>

        <div className="flex justify-end mt-6">
          <Button variant="outline">Manage Roles</Button>
        </div>
      </Card>

      {/* Billing Setup */}
      <Card className="p-6 shadow-sm border-[#E3E6EB]">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
            <CreditCard className="w-5 h-5 text-green-600 stroke-[1.5]" />
          </div>
          <div>
            <h3 className="text-slate-900">Billing Setup</h3>
            <p className="text-sm text-slate-500">Configure billing and invoicing</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Hourly Rate</Label>
              <Input type="number" placeholder="€0.00" defaultValue="150" />
            </div>
            <div className="space-y-2">
              <Label>Currency</Label>
              <Select defaultValue="eur">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="eur">EUR (€)</SelectItem>
                  <SelectItem value="usd">USD ($)</SelectItem>
                  <SelectItem value="gbp">GBP (£)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Invoice Schedule</Label>
            <Select defaultValue="monthly">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="bi-weekly">Bi-weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="quarterly">Quarterly</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between pt-2">
            <div className="space-y-0.5">
              <Label>Auto-generate Invoices</Label>
              <p className="text-sm text-slate-500">Automatically create invoices based on schedule</p>
            </div>
            <Switch />
          </div>
        </div>

        <div className="flex justify-end mt-6">
          <Button className="bg-blue-600 hover:bg-blue-700">Save Changes</Button>
        </div>
      </Card>

      {/* Workflow Template */}
      <Card className="p-6 shadow-sm border-[#E3E6EB]">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 bg-orange-50 rounded-lg flex items-center justify-center">
            <GitBranch className="w-5 h-5 text-orange-600 stroke-[1.5]" />
          </div>
          <div>
            <h3 className="text-slate-900">Workflow Template</h3>
            <p className="text-sm text-slate-500">Define project workflow and stages</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Template</Label>
            <Select defaultValue="agile">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="agile">Standard Agile</SelectItem>
                <SelectItem value="waterfall">Waterfall</SelectItem>
                <SelectItem value="kanban">Kanban</SelectItem>
                <SelectItem value="custom">Custom</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="p-4 bg-slate-50 rounded-lg">
            <p className="text-sm text-slate-600 mb-3">Workflow Stages:</p>
            <div className="flex items-center gap-2">
              <div className="px-3 py-1.5 bg-white border border-[#E3E6EB] rounded text-sm text-slate-700">
                Backlog
              </div>
              <div className="text-slate-400">→</div>
              <div className="px-3 py-1.5 bg-white border border-[#E3E6EB] rounded text-sm text-slate-700">
                In Progress
              </div>
              <div className="text-slate-400">→</div>
              <div className="px-3 py-1.5 bg-white border border-[#E3E6EB] rounded text-sm text-slate-700">
                Review
              </div>
              <div className="text-slate-400">→</div>
              <div className="px-3 py-1.5 bg-white border border-[#E3E6EB] rounded text-sm text-slate-700">
                Done
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end mt-6">
          <Button variant="outline">Customize Workflow</Button>
        </div>
      </Card>
    </div>
  );
}
