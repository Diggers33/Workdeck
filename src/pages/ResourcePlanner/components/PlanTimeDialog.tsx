import { useState, useMemo } from 'react';
import { Calendar, Clock, AlertTriangle, TrendingUp, Sparkles, X } from 'lucide-react';
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
import { Textarea } from './ui/textarea';
import { format } from 'date-fns';

interface PlanTimeDialogProps {
  userId?: string | null;
  open: boolean;
  onClose: () => void;
  onSave: (allocation: TaskAllocation) => void;
}

interface TaskAllocation {
  userId: string;
  projectId: string;
  activityId: string;
  startDate: Date;
  endDate: Date;
  hoursPerDay: number;
  totalHours: number;
  rate: number;
  notes: string;
  allocationType: 'hard' | 'soft';
}

interface SuggestedMatch {
  user: User;
  matchPercent: number;
  skills: string[];
  availability: number;
  rate: number;
}

// Mock data for projects and activities
const mockProjects = [
  { id: 'p1', name: 'E-Commerce Platform', color: '#3B82F6' },
  { id: 'p2', name: 'Mobile App Redesign', color: '#8B5CF6' },
  { id: 'p3', name: 'Internal Tools', color: '#F97316' },
  { id: 'p4', name: 'Customer Portal', color: '#10B981' },
  { id: 'p5', name: 'Marketing Website', color: '#F59E0B' },
];

const mockActivities = [
  { id: 'a1', name: 'Development', projectIds: ['p1', 'p2', 'p3', 'p4', 'p5'] },
  { id: 'a2', name: 'Design', projectIds: ['p1', 'p2', 'p4', 'p5'] },
  { id: 'a3', name: 'Code Review', projectIds: ['p1', 'p2', 'p3', 'p4'] },
  { id: 'a4', name: 'Testing', projectIds: ['p1', 'p2', 'p3', 'p4', 'p5'] },
  { id: 'a5', name: 'Documentation', projectIds: ['p1', 'p3', 'p4'] },
];

const mockUsers: User[] = [
  { id: 'u1', name: 'Sarah Chen', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah', department: 'Engineering', totalCapacity: 40, role: 'Senior Developer' },
  { id: 'u2', name: 'Alex Rivera', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex', department: 'Engineering', totalCapacity: 40, role: 'Developer' },
  { id: 'u3', name: 'Maria Santos', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Maria', department: 'Data Science', totalCapacity: 40, role: 'ML Engineer' },
  { id: 'u4', name: 'James Wilson', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=James', department: 'Engineering', totalCapacity: 40, role: 'Developer' },
  { id: 'u5', name: 'Emma Rodriguez', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emma', department: 'Design', totalCapacity: 40, role: 'UX Designer' },
];

export function PlanTimeDialog({
  userId,
  open,
  onClose,
  onSave,
}: PlanTimeDialogProps) {
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [selectedActivityId, setSelectedActivityId] = useState('');
  const [selectedUserId, setSelectedUserId] = useState(userId || '');
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [endDate, setEndDate] = useState<Date>(() => {
    const date = new Date();
    date.setDate(date.getDate() + 7);
    return date;
  });
  const [hoursPerDay, setHoursPerDay] = useState(4);
  const [totalHours, setTotalHours] = useState(20);
  const [rate, setRate] = useState(85);
  const [notes, setNotes] = useState('');
  const [allocationType, setAllocationType] = useState<'hard' | 'soft'>('hard');

  const selectedProject = mockProjects.find(p => p.id === selectedProjectId);
  const selectedUser = mockUsers.find(u => u.id === selectedUserId);

  // Filter activities based on selected project
  const availableActivities = useMemo(() => {
    if (!selectedProjectId) return [];
    return mockActivities.filter(a => a.projectIds.includes(selectedProjectId));
  }, [selectedProjectId]);

  // Generate AI suggested matches
  const suggestedMatches: SuggestedMatch[] = useMemo(() => {
    // Mock AI suggestions based on project/activity
    return [
      {
        user: mockUsers[0],
        matchPercent: 94,
        skills: ['Python', 'ML'],
        availability: 60,
        rate: 85,
      },
      {
        user: mockUsers[1],
        matchPercent: 87,
        skills: ['Python'],
        availability: 40,
        rate: 75,
      },
      {
        user: mockUsers[2],
        matchPercent: 72,
        skills: ['ML', 'Data'],
        availability: 80,
        rate: 90,
      },
    ];
  }, [selectedProjectId, selectedActivityId]);

  // Calculate days between dates
  const dayCount = useMemo(() => {
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
  }, [startDate, endDate]);

  // Sync total hours with hours per day
  const handleHoursPerDayChange = (value: number) => {
    setHoursPerDay(value);
    setTotalHours(value * dayCount);
  };

  const handleTotalHoursChange = (value: number) => {
    setTotalHours(value);
    setHoursPerDay(Math.round((value / dayCount) * 10) / 10);
  };

  // Check for capacity conflicts
  const hasConflict = useMemo(() => {
    if (!selectedUserId) return false;
    // Mock conflict detection - in real app would check actual allocations
    return hoursPerDay > 6;
  }, [selectedUserId, hoursPerDay, startDate, endDate]);

  const conflictDates = 'Nov 20-22'; // Mock conflict dates

  const handleSelectSuggestion = (match: SuggestedMatch) => {
    setSelectedUserId(match.user.id);
    setRate(match.rate);
  };

  const handleSave = () => {
    if (selectedProjectId && selectedActivityId && selectedUserId) {
      onSave({
        userId: selectedUserId,
        projectId: selectedProjectId,
        activityId: selectedActivityId,
        startDate,
        endDate,
        hoursPerDay,
        totalHours,
        rate,
        notes,
        allocationType,
      });
      onClose();
      // Reset form
      setSelectedProjectId('');
      setSelectedActivityId('');
      setSelectedUserId('');
      setNotes('');
    }
  };

  const canSave = selectedProjectId && selectedActivityId && selectedUserId;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b px-6 py-4 z-10">
          <DialogTitle style={{ fontSize: '18px', fontWeight: 600 }}>Plan Time Allocation</DialogTitle>
          <DialogDescription className="mt-1">
            Allocate time for a team member to a project activity
          </DialogDescription>
        </div>

        <div className="px-6 py-4 space-y-5">
          {/* Section 1: Project & Activity */}
          <div className="space-y-4">
            <div
              className="text-xs font-semibold uppercase tracking-wider"
              style={{ color: '#6B7280', letterSpacing: '0.5px' }}
            >
              Project & Activity
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label style={{ fontSize: '13px' }}>
                  Project <span className="text-red-500">*</span>
                </Label>
                <Select value={selectedProjectId} onValueChange={(v) => {
                  setSelectedProjectId(v);
                  setSelectedActivityId('');
                }}>
                  <SelectTrigger style={{ height: '40px' }}>
                    <SelectValue placeholder="Select project..." />
                  </SelectTrigger>
                  <SelectContent>
                    {mockProjects.map(project => (
                      <SelectItem key={project.id} value={project.id}>
                        <div className="flex items-center gap-2">
                          <div
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: project.color }}
                          />
                          {project.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label style={{ fontSize: '13px' }}>
                  Activity <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={selectedActivityId}
                  onValueChange={setSelectedActivityId}
                  disabled={!selectedProjectId}
                >
                  <SelectTrigger style={{ height: '40px' }}>
                    <SelectValue placeholder={selectedProjectId ? "Select activity..." : "Select project first"} />
                  </SelectTrigger>
                  <SelectContent>
                    {availableActivities.map(activity => (
                      <SelectItem key={activity.id} value={activity.id}>
                        {activity.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Section 2: Date Range */}
          <div className="space-y-4">
            <div
              className="text-xs font-semibold uppercase tracking-wider"
              style={{ color: '#6B7280', letterSpacing: '0.5px' }}
            >
              Date Range
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label style={{ fontSize: '13px' }}>Start Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start h-10">
                      <Calendar className="h-4 w-4 mr-2 text-gray-500" />
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
              <div className="space-y-1.5">
                <Label style={{ fontSize: '13px' }}>End Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start h-10">
                      <Calendar className="h-4 w-4 mr-2 text-gray-500" />
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
          </div>

          {/* Section 3: Allocation Type */}
          <div className="space-y-4">
            <div
              className="text-xs font-semibold uppercase tracking-wider"
              style={{ color: '#6B7280', letterSpacing: '0.5px' }}
            >
              Allocation Type
            </div>

            <RadioGroup
              value={allocationType}
              onValueChange={(v: 'hard' | 'soft') => setAllocationType(v)}
              className="flex gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="hard" id="hard" />
                <Label htmlFor="hard" className="cursor-pointer text-sm">
                  Hard (Confirmed)
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="soft" id="soft" />
                <Label htmlFor="soft" className="cursor-pointer text-sm">
                  Soft (Tentative)
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Section 4: Team Member Selection */}
          <div className="space-y-4">
            <div
              className="text-xs font-semibold uppercase tracking-wider"
              style={{ color: '#6B7280', letterSpacing: '0.5px' }}
            >
              Team Member
            </div>

            <div className="space-y-1.5">
              <Label style={{ fontSize: '13px' }}>
                Assign To <span className="text-red-500">*</span>
              </Label>
              <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                <SelectTrigger style={{ height: '40px' }}>
                  {selectedUser ? (
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={selectedUser.avatar} alt={selectedUser.name} />
                        <AvatarFallback>{selectedUser.name[0]}</AvatarFallback>
                      </Avatar>
                      <span>{selectedUser.name}</span>
                      <span className="text-xs text-gray-500">({selectedUser.role})</span>
                    </div>
                  ) : (
                    <SelectValue placeholder="Select team member..." />
                  )}
                </SelectTrigger>
                <SelectContent>
                  {mockUsers.map(user => (
                    <SelectItem key={user.id} value={user.id}>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={user.avatar} alt={user.name} />
                          <AvatarFallback>{user.name[0]}</AvatarFallback>
                        </Avatar>
                        <span>{user.name}</span>
                        <span className="text-xs text-gray-500">({user.role})</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Suggested Matches */}
            <div
              className="rounded-lg border"
              style={{ backgroundColor: '#F8FAFC', borderColor: '#E2E8F0' }}
            >
              <div className="px-3 py-2 border-b flex items-center gap-2" style={{ borderColor: '#E2E8F0' }}>
                <Sparkles className="h-4 w-4 text-amber-500" />
                <span className="text-xs font-semibold" style={{ color: '#64748B' }}>
                  SUGGESTED MATCHES
                </span>
              </div>
              <div className="divide-y" style={{ borderColor: '#E2E8F0' }}>
                {suggestedMatches.map((match, idx) => (
                  <button
                    key={match.user.id}
                    onClick={() => handleSelectSuggestion(match)}
                    className={`w-full px-3 py-2.5 flex items-center justify-between hover:bg-white transition-colors text-left ${
                      selectedUserId === match.user.id ? 'bg-blue-50' : ''
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={match.user.avatar} alt={match.user.name} />
                        <AvatarFallback>{match.user.name[0]}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium text-sm" style={{ color: '#1E293B' }}>
                          {match.user.name}
                        </div>
                        <div className="text-xs" style={{ color: '#64748B' }}>
                          {match.skills.join(', ')} · {match.availability}% available · €{match.rate}/h
                        </div>
                      </div>
                    </div>
                    <div
                      className="text-xs font-semibold px-2 py-0.5 rounded"
                      style={{
                        backgroundColor: match.matchPercent >= 90 ? '#D1FAE5' : match.matchPercent >= 80 ? '#FEF3C7' : '#F1F5F9',
                        color: match.matchPercent >= 90 ? '#059669' : match.matchPercent >= 80 ? '#D97706' : '#64748B',
                      }}
                    >
                      {match.matchPercent}% match
                    </div>
                  </button>
                ))}
              </div>
              <div className="px-3 py-2 text-xs" style={{ color: '#94A3B8' }}>
                Match based on: skills, availability, past project performance
              </div>
            </div>
          </div>

          {/* Section 5: Hours & Rate */}
          <div className="space-y-4">
            <div
              className="text-xs font-semibold uppercase tracking-wider"
              style={{ color: '#6B7280', letterSpacing: '0.5px' }}
            >
              Hours & Rate
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label style={{ fontSize: '13px' }}>Hours/Day</Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    min="0.5"
                    max="24"
                    step="0.5"
                    value={hoursPerDay}
                    onChange={(e) => handleHoursPerDayChange(parseFloat(e.target.value) || 0)}
                    className="h-10"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label style={{ fontSize: '13px' }}>Total Hours</Label>
                <Input
                  type="number"
                  min="1"
                  value={totalHours}
                  onChange={(e) => handleTotalHoursChange(parseFloat(e.target.value) || 0)}
                  className="h-10"
                />
              </div>
              <div className="space-y-1.5">
                <Label style={{ fontSize: '13px' }}>Rate</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">€</span>
                  <Input
                    type="number"
                    min="0"
                    value={rate}
                    onChange={(e) => setRate(parseFloat(e.target.value) || 0)}
                    className="h-10 pl-7"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">/hr</span>
                </div>
              </div>
            </div>
          </div>

          {/* Section 6: Notes */}
          <div className="space-y-4">
            <div
              className="text-xs font-semibold uppercase tracking-wider"
              style={{ color: '#6B7280', letterSpacing: '0.5px' }}
            >
              Notes
            </div>

            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any notes about this allocation..."
              rows={2}
              className="resize-none"
            />
          </div>

          {/* Conflict Warning */}
          {hasConflict && selectedUser && (
            <Alert
              className="border-amber-200"
              style={{ backgroundColor: '#FFFBEB' }}
            >
              <AlertTriangle className="h-4 w-4 text-amber-600" />
              <AlertDescription className="ml-2 flex items-center justify-between">
                <span className="text-amber-800">
                  {selectedUser.name} is at 120% capacity {conflictDates}
                </span>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="h-7 text-xs">
                    Adjust dates
                  </Button>
                  <Button variant="outline" size="sm" className="h-7 text-xs">
                    Assign anyway
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t px-6 py-4 flex items-center justify-between">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!canSave}>
            Save Allocation
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
