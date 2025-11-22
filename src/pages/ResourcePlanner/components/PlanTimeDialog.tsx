import { useState } from 'react';
import { Calendar, Clock, AlertTriangle, TrendingUp } from 'lucide-react';
import { User, Task, Project } from '../types';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Alert, AlertDescription } from './ui/alert';
import { Calendar as CalendarComponent } from './ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { format } from 'date-fns';

interface PlanTimeDialogProps {
  userId: string | null;
  users: User[];
  tasks: Task[];
  projects: Project[];
  open: boolean;
  onClose: () => void;
  onSave: (allocation: TaskAllocation) => void;
}

interface TaskAllocation {
  userId: string;
  taskId: string;
  startDate: Date;
  endDate: Date;
  hoursPerDay: number;
  distribution: 'even' | 'custom';
}

export function PlanTimeDialog({
  userId,
  users,
  tasks,
  projects,
  open,
  onClose,
  onSave,
}: PlanTimeDialogProps) {
  const [selectedUserId, setSelectedUserId] = useState(userId || users[0]?.id);
  const [selectedTaskId, setSelectedTaskId] = useState('');
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [endDate, setEndDate] = useState<Date>(() => {
    const date = new Date();
    date.setDate(date.getDate() + 7);
    return date;
  });
  const [hoursPerDay, setHoursPerDay] = useState(4);
  const [distribution, setDistribution] = useState<'even' | 'custom'>('even');
  
  const selectedUser = users.find(u => u.id === selectedUserId);
  const availableTasks = tasks.filter(t => t.assignedUserId !== selectedUserId);
  const selectedTask = tasks.find(t => t.id === selectedTaskId);
  
  // Calculate capacity impact
  const userCurrentTasks = tasks.filter(t => t.assignedUserId === selectedUserId);
  const currentUtilization = userCurrentTasks.reduce((sum, t) => sum + t.plannedHours, 0);
  const newUtilization = currentUtilization + hoursPerDay;
  const hasConflict = newUtilization > 8;
  
  const handleSave = () => {
    if (selectedTaskId && selectedUserId) {
      onSave({
        userId: selectedUserId,
        taskId: selectedTaskId,
        startDate,
        endDate,
        hoursPerDay,
        distribution,
      });
      onClose();
      // Reset form
      setSelectedTaskId('');
      setHoursPerDay(4);
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Plan Time Allocation</DialogTitle>
          <DialogDescription>
            Allocate time for a task to a team member
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {/* User Selection */}
          <div className="space-y-2">
            <Label>Assign To</Label>
            <Select value={selectedUserId} onValueChange={setSelectedUserId}>
              <SelectTrigger>
                <div className="flex items-center gap-2">
                  {selectedUser && (
                    <>
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={selectedUser.avatar} alt={selectedUser.name} />
                        <AvatarFallback>{selectedUser.name[0]}</AvatarFallback>
                      </Avatar>
                      <span>{selectedUser.name}</span>
                      <span className="text-xs text-gray-500">
                        ({currentUtilization}h / 8h daily)
                      </span>
                    </>
                  )}
                </div>
              </SelectTrigger>
              <SelectContent>
                {users.map(user => {
                  const userTasks = tasks.filter(t => t.assignedUserId === user.id);
                  const utilization = userTasks.reduce((sum, t) => sum + t.plannedHours, 0);
                  return (
                    <SelectItem key={user.id} value={user.id}>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={user.avatar} alt={user.name} />
                          <AvatarFallback>{user.name[0]}</AvatarFallback>
                        </Avatar>
                        <span>{user.name}</span>
                        <span className="text-xs text-gray-500">
                          ({utilization}h / 8h)
                        </span>
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>
          
          {/* Task Selection */}
          <div className="space-y-2">
            <Label>Task</Label>
            <Select value={selectedTaskId} onValueChange={setSelectedTaskId}>
              <SelectTrigger>
                <SelectValue placeholder="Select a task..." />
              </SelectTrigger>
              <SelectContent>
                {availableTasks.map(task => {
                  const project = projects.find(p => p.id === task.projectId);
                  return (
                    <SelectItem key={task.id} value={task.id}>
                      <div>
                        <div className="font-medium">{task.name}</div>
                        <div className="text-xs text-gray-500">
                          {project?.name} • {task.plannedHours}h estimated
                        </div>
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>
          
          {/* Date Range */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Start Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start">
                    <Calendar className="h-4 w-4 mr-2" />
                    {format(startDate, 'MMM d, yyyy')}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent
                    mode="single"
                    selected={startDate}
                    onSelect={(date) => date && setStartDate(date)}
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-2">
              <Label>End Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start">
                    <Calendar className="h-4 w-4 mr-2" />
                    {format(endDate, 'MMM d, yyyy')}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent
                    mode="single"
                    selected={endDate}
                    onSelect={(date) => date && setEndDate(date)}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
          
          {/* Hours per Day */}
          <div className="space-y-2">
            <Label>Hours per Day</Label>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 flex-1">
                <Clock className="h-4 w-4 text-gray-500" />
                <Input
                  type="number"
                  min="0.5"
                  max="24"
                  step="0.5"
                  value={hoursPerDay}
                  onChange={(e) => setHoursPerDay(parseFloat(e.target.value))}
                  className="w-32"
                />
                <span className="text-sm text-gray-600">hours/day</span>
              </div>
              {selectedTask && (
                <div className="text-sm text-gray-600">
                  Suggested: {selectedTask.plannedHours}h/day
                </div>
              )}
            </div>
          </div>
          
          {/* Distribution Options */}
          <div className="space-y-2">
            <Label>Distribution</Label>
            <RadioGroup value={distribution} onValueChange={(v: any) => setDistribution(v)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="even" id="even" />
                <Label htmlFor="even" className="cursor-pointer">
                  Even spread across date range
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="custom" id="custom" />
                <Label htmlFor="custom" className="cursor-pointer">
                  Custom distribution
                </Label>
              </div>
            </RadioGroup>
          </div>
          
          {/* Capacity Impact Preview */}
          <div className="p-4 bg-gray-50 rounded-lg space-y-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-blue-600" />
              <span className="font-medium">Capacity Impact</span>
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-gray-600">Current Utilization</div>
                <div className="font-medium">{currentUtilization}h / 8h per day</div>
              </div>
              <div>
                <div className="text-gray-600">After Allocation</div>
                <div className={`font-medium ${hasConflict ? 'text-red-600' : 'text-green-600'}`}>
                  {newUtilization}h / 8h per day
                </div>
              </div>
            </div>
            
            <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all ${
                  newUtilization > 8 ? 'bg-red-500' : newUtilization > 4 ? 'bg-amber-500' : 'bg-green-500'
                }`}
                style={{ width: `${Math.min((newUtilization / 8) * 100, 100)}%` }}
              />
            </div>
          </div>
          
          {/* Conflict Warning */}
          {hasConflict && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                This allocation will overbook {selectedUser?.name}. Consider reducing hours or adjusting the timeline.
              </AlertDescription>
            </Alert>
          )}
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!selectedTaskId}>
            Plan Time
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}