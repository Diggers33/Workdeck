import { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Plus, Trash2, Calendar, AlertCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';

interface Milestone {
  id: string;
  name: string;
  linkedTo: string;
  description: string;
  deliveryDate: string;
  alert: string;
  color: string;
}

const COLORS = [
  { value: 'red', label: 'Red', class: 'bg-red-500' },
  { value: 'orange', label: 'Orange', class: 'bg-orange-500' },
  { value: 'yellow', label: 'Yellow', class: 'bg-yellow-500' },
  { value: 'green', label: 'Green', class: 'bg-green-500' },
  { value: 'blue', label: 'Blue', class: 'bg-blue-500' },
  { value: 'purple', label: 'Purple', class: 'bg-purple-500' },
];

export function MilestonesSection() {
  const [milestones, setMilestones] = useState<Milestone[]>([
    {
      id: '1',
      name: 'Planning Complete',
      linkedTo: 'Planning Phase',
      description: 'All planning activities completed and approved',
      deliveryDate: '2024-03-15',
      alert: 'One week before',
      color: 'blue',
    },
    {
      id: '2',
      name: 'Design Review',
      linkedTo: 'Design & Development',
      description: 'Complete design review with stakeholders',
      deliveryDate: '2024-06-30',
      alert: 'Two weeks before',
      color: 'purple',
    },
    {
      id: '3',
      name: 'UAT Completion',
      linkedTo: 'Testing & QA',
      description: 'User acceptance testing completed',
      deliveryDate: '2024-10-15',
      alert: 'One month before',
      color: 'orange',
    },
  ]);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newMilestone, setNewMilestone] = useState<Partial<Milestone>>({
    name: '',
    linkedTo: '',
    description: '',
    deliveryDate: '',
    alert: 'One week before',
    color: 'blue',
  });

  const addMilestone = () => {
    if (!newMilestone.name || !newMilestone.deliveryDate) return;

    const milestone: Milestone = {
      id: Date.now().toString(),
      name: newMilestone.name,
      linkedTo: newMilestone.linkedTo || '',
      description: newMilestone.description || '',
      deliveryDate: newMilestone.deliveryDate,
      alert: newMilestone.alert || 'One week before',
      color: newMilestone.color || 'blue',
    };

    setMilestones([...milestones, milestone]);
    setIsDialogOpen(false);
    setNewMilestone({
      name: '',
      linkedTo: '',
      description: '',
      deliveryDate: '',
      alert: 'One week before',
      color: 'blue',
    });
  };

  const deleteMilestone = (id: string) => {
    setMilestones(milestones.filter((m) => m.id !== id));
  };

  const getColorClass = (color: string) => {
    const colorObj = COLORS.find((c) => c.value === color);
    return colorObj?.class || 'bg-blue-500';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  return (
    <div className="bg-white rounded-lg border border-[#E3E6EB] shadow-sm">
      {/* Header */}
      <div className="px-6 py-5 border-b border-[#E3E6EB] flex items-center justify-between">
        <div>
          <h2 className="text-slate-900">Milestones</h2>
          <p className="text-sm text-slate-500 mt-1">Track key deliverables and deadlines</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger className="inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-blue-600 text-white hover:bg-blue-700 h-10 px-4 py-2">
            <Plus className="w-4 h-4 stroke-[1.5]" />
            New Milestone
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Create New Milestone</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label>Milestone Name</Label>
                <Input
                  value={newMilestone.name}
                  onChange={(e) => setNewMilestone({ ...newMilestone, name: e.target.value })}
                  placeholder="Enter milestone name"
                />
              </div>

              <div className="space-y-2">
                <Label>Linked Activity or Task</Label>
                <Select
                  value={newMilestone.linkedTo}
                  onValueChange={(value) => setNewMilestone({ ...newMilestone, linkedTo: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select activity or task" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Planning Phase">Planning Phase</SelectItem>
                    <SelectItem value="Design & Development">Design & Development</SelectItem>
                    <SelectItem value="Testing & QA">Testing & QA</SelectItem>
                    <SelectItem value="Deployment">Deployment</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={newMilestone.description}
                  onChange={(e) => setNewMilestone({ ...newMilestone, description: e.target.value })}
                  placeholder="Add milestone description"
                  className="min-h-[80px] resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Delivery Date</Label>
                  <Input
                    type="date"
                    value={newMilestone.deliveryDate}
                    onChange={(e) => setNewMilestone({ ...newMilestone, deliveryDate: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Alert</Label>
                  <Select
                    value={newMilestone.alert}
                    onValueChange={(value) => setNewMilestone({ ...newMilestone, alert: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="One week before">One week before</SelectItem>
                      <SelectItem value="Two weeks before">Two weeks before</SelectItem>
                      <SelectItem value="One month before">One month before</SelectItem>
                      <SelectItem value="None">None</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Color</Label>
                <div className="flex gap-2">
                  {COLORS.map((color) => (
                    <button
                      key={color.value}
                      onClick={() => setNewMilestone({ ...newMilestone, color: color.value })}
                      className={`w-8 h-8 rounded-full ${color.class} ${
                        newMilestone.color === color.value ? 'ring-2 ring-offset-2 ring-slate-400' : ''
                      }`}
                      title={color.label}
                    />
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={addMilestone} className="bg-blue-600 hover:bg-blue-700">
                  Create Milestone
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Milestones Table */}
      <div className="p-6">
        <div className="overflow-hidden rounded-lg border border-[#E3E6EB]">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 border-b border-[#E3E6EB]">
                <th className="w-8"></th>
                <th className="text-left px-4 py-3 text-xs text-slate-600">Milestone Name</th>
                <th className="text-left px-4 py-3 text-xs text-slate-600">Linked To</th>
                <th className="text-left px-4 py-3 text-xs text-slate-600">Description</th>
                <th className="text-left px-4 py-3 text-xs text-slate-600">Delivery Date</th>
                <th className="text-left px-4 py-3 text-xs text-slate-600">Alert</th>
                <th className="w-16"></th>
              </tr>
            </thead>
            <tbody>
              {milestones.map((milestone) => (
                <tr key={milestone.id} className="border-b border-[#E3E6EB] hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className={`w-3 h-3 rounded-full ${getColorClass(milestone.color)}`}></div>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-900">{milestone.name}</td>
                  <td className="px-4 py-3 text-sm text-slate-600">{milestone.linkedTo || '—'}</td>
                  <td className="px-4 py-3 text-sm text-slate-600 max-w-xs truncate">{milestone.description || '—'}</td>
                  <td className="px-4 py-3 text-sm text-slate-600">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-slate-400 stroke-[1.5]" />
                      {formatDate(milestone.deliveryDate)}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-600">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-3.5 h-3.5 text-slate-400 stroke-[1.5]" />
                      {milestone.alert}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => deleteMilestone(milestone.id)}
                      className="text-slate-400 hover:text-red-600 transition-colors"
                    >
                      <Trash2 className="w-4 h-4 stroke-[1.5]" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {milestones.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-7 h-7 text-slate-400" />
            </div>
            <p className="text-slate-500 mb-4">No milestones yet</p>
            <Button variant="outline" onClick={() => setIsDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2 stroke-[1.5]" />
              Create First Milestone
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}