import { useState } from 'react';
import { X, Calendar, User as UserIcon, Clock, DollarSign } from 'lucide-react';
import { Task, User, Project } from '../types';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Switch } from './ui/switch';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { format } from 'date-fns';

interface TaskDetailModalProps {
  task: Task | null;
  users: User[];
  projects: Project[];
  open: boolean;
  onClose: () => void;
  onSave: (task: Task) => void;
}

export function TaskDetailModal({
  task,
  users,
  projects,
  open,
  onClose,
  onSave,
}: TaskDetailModalProps) {
  const [editedTask, setEditedTask] = useState<Task | null>(task);
  
  if (!task || !editedTask) return null;
  
  const project = projects.find(p => p.id === task.projectId);
  const assignedUser = users.find(u => u.id === editedTask.assignedUserId);
  
  const handleSave = () => {
    if (editedTask) {
      onSave(editedTask);
      onClose();
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Task Details</DialogTitle>
          <div className="text-sm text-gray-600">
            {project?.name} / {task.name}
          </div>
        </DialogHeader>
        
        <DialogDescription>
          Edit the details of the task below.
        </DialogDescription>
        
        <div className="space-y-6 py-4">
          {/* Task Name */}
          <div className="space-y-2">
            <Label htmlFor="task-name">Task Name</Label>
            <Input
              id="task-name"
              value={editedTask.name}
              onChange={(e) => setEditedTask({ ...editedTask, name: e.target.value })}
            />
          </div>
          
          {/* Assigned User */}
          <div className="space-y-2">
            <Label>Assigned To</Label>
            <Select
              value={editedTask.assignedUserId}
              onValueChange={(value) => setEditedTask({ ...editedTask, assignedUserId: value })}
            >
              <SelectTrigger>
                <div className="flex items-center gap-2">
                  {assignedUser && (
                    <>
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={assignedUser.avatar} alt={assignedUser.name} />
                        <AvatarFallback>
                          <UserIcon className="h-3 w-3" />
                        </AvatarFallback>
                      </Avatar>
                      <span>{assignedUser.name}</span>
                    </>
                  )}
                </div>
              </SelectTrigger>
              <SelectContent>
                {users.map(user => (
                  <SelectItem key={user.id} value={user.id}>
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={user.avatar} alt={user.name} />
                        <AvatarFallback>
                          <UserIcon className="h-3 w-3" />
                        </AvatarFallback>
                      </Avatar>
                      <span>{user.name}</span>
                      <span className="text-xs text-gray-500">({user.department})</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {/* Date Range */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start-date">Start Date</Label>
              <Input
                id="start-date"
                type="date"
                value={format(new Date(editedTask.startDate), 'yyyy-MM-dd')}
                onChange={(e) => setEditedTask({
                  ...editedTask,
                  startDate: new Date(e.target.value)
                })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end-date">End Date</Label>
              <Input
                id="end-date"
                type="date"
                value={format(new Date(editedTask.endDate), 'yyyy-MM-dd')}
                onChange={(e) => setEditedTask({
                  ...editedTask,
                  endDate: new Date(e.target.value)
                })}
              />
            </div>
          </div>
          
          {/* Planned Hours */}
          <div className="space-y-2">
            <Label htmlFor="planned-hours">Planned Hours per Day</Label>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-gray-500" />
              <Input
                id="planned-hours"
                type="number"
                min="0"
                max="24"
                step="0.5"
                value={editedTask.plannedHours}
                onChange={(e) => setEditedTask({
                  ...editedTask,
                  plannedHours: parseFloat(e.target.value)
                })}
                className="w-32"
              />
              <span className="text-sm text-gray-600">hours/day</span>
            </div>
          </div>
          
          {/* Billable Toggle */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-gray-500" />
              <div>
                <Label htmlFor="billable" className="cursor-pointer">Billable Time</Label>
                <p className="text-xs text-gray-600">
                  Mark this task as billable to client
                </p>
              </div>
            </div>
            <Switch
              id="billable"
              checked={editedTask.isBillable}
              onCheckedChange={(checked) => setEditedTask({
                ...editedTask,
                isBillable: checked
              })}
            />
          </div>
          
          {/* Allocation Type */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Label>Allocation Type</Label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="h-4 w-4 rounded-full border border-gray-300 flex items-center justify-center text-xs text-gray-500 cursor-help">
                      ?
                    </div>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <div className="space-y-1">
                      <div><strong>Hard:</strong> Fixed allocation that cannot be moved automatically</div>
                      <div><strong>Soft:</strong> Flexible allocation that can be adjusted by AI optimization</div>
                    </div>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <Select
              value={editedTask.allocationType}
              onValueChange={(value: 'soft' | 'hard') => setEditedTask({
                ...editedTask,
                allocationType: value
              })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="hard">
                  <div>
                    <div className="font-medium">Hard Allocation</div>
                    <div className="text-xs text-gray-500">Fixed, cannot be moved</div>
                  </div>
                </SelectItem>
                <SelectItem value="soft">
                  <div>
                    <div className="font-medium">Soft Allocation</div>
                    <div className="text-xs text-gray-500">Flexible, can be optimized</div>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}