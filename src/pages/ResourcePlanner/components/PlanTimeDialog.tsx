import { useState, useMemo } from 'react';
import { Calendar, AlertTriangle } from 'lucide-react';
import { User } from '../types';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Calendar as CalendarComponent } from './ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Textarea } from './ui/textarea';
import { format } from 'date-fns';
import { colors, typography, utilizationColors, projectColors } from '../constants/designTokens';

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

// Mock data
const mockProjects = [
  { id: 'p1', name: 'E-Commerce Platform', color: projectColors[0] },
  { id: 'p2', name: 'Mobile App Redesign', color: projectColors[1] },
  { id: 'p3', name: 'Internal Tools', color: projectColors[2] },
  { id: 'p4', name: 'Customer Portal', color: projectColors[3] },
  { id: 'p5', name: 'Marketing Website', color: projectColors[4] },
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

  const selectedUser = mockUsers.find(u => u.id === selectedUserId);

  const availableActivities = useMemo(() => {
    if (!selectedProjectId) return [];
    return mockActivities.filter(a => a.projectIds.includes(selectedProjectId));
  }, [selectedProjectId]);

  const suggestedMatches: SuggestedMatch[] = useMemo(() => {
    return [
      { user: mockUsers[0], matchPercent: 94, skills: ['Python', 'ML'], availability: 60, rate: 85 },
      { user: mockUsers[1], matchPercent: 87, skills: ['Python'], availability: 40, rate: 75 },
      { user: mockUsers[2], matchPercent: 72, skills: ['ML', 'Data'], availability: 80, rate: 90 },
    ];
  }, [selectedProjectId, selectedActivityId]);

  const dayCount = useMemo(() => {
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  }, [startDate, endDate]);

  const handleHoursPerDayChange = (value: number) => {
    setHoursPerDay(value);
    setTotalHours(value * dayCount);
  };

  const handleTotalHoursChange = (value: number) => {
    setTotalHours(value);
    setHoursPerDay(Math.round((value / dayCount) * 10) / 10);
  };

  const hasConflict = useMemo(() => {
    if (!selectedUserId) return false;
    return hoursPerDay > 6;
  }, [selectedUserId, hoursPerDay]);

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
      setSelectedProjectId('');
      setSelectedActivityId('');
      setSelectedUserId('');
      setNotes('');
    }
  };

  const canSave = selectedProjectId && selectedActivityId && selectedUserId;

  // Label style using design tokens
  const labelStyle = {
    fontSize: typography.base,
    fontWeight: typography.medium,
    color: colors.textPrimary,
    marginBottom: '6px',
    display: 'block' as const
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent
        className="max-w-[560px] p-0"
        style={{
          backgroundColor: colors.bgWhite,
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        }}
      >
        {/* Header */}
        <div style={{ padding: '20px 20px 16px 20px', borderBottom: `1px solid ${colors.borderDefault}` }}>
          <DialogTitle style={{ fontSize: typography.lg, fontWeight: typography.semibold, color: colors.textPrimary, margin: 0 }}>
            Plan Time Allocation
          </DialogTitle>
          <DialogDescription style={{ fontSize: typography.base, color: colors.textSecondary, marginTop: '4px' }}>
            Allocate time for a team member to a project activity
          </DialogDescription>
        </div>

        {/* Content */}
        <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px', maxHeight: '70vh', overflowY: 'auto' }}>

          {/* Project & Activity Row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={labelStyle}>Project <span style={{ color: '#DC2626' }}>*</span></label>
              <Select value={selectedProjectId} onValueChange={(v) => { setSelectedProjectId(v); setSelectedActivityId(''); }}>
                <SelectTrigger style={{ height: '40px', backgroundColor: '#FFFFFF' }}>
                  <SelectValue placeholder="Select project..." />
                </SelectTrigger>
                <SelectContent>
                  {mockProjects.map(project => (
                    <SelectItem key={project.id} value={project.id}>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: project.color }} />
                        {project.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label style={labelStyle}>Activity <span style={{ color: '#DC2626' }}>*</span></label>
              <Select value={selectedActivityId} onValueChange={setSelectedActivityId} disabled={!selectedProjectId}>
                <SelectTrigger style={{ height: '40px', backgroundColor: '#FFFFFF' }}>
                  <SelectValue placeholder={selectedProjectId ? "Select activity..." : "Select project first"} />
                </SelectTrigger>
                <SelectContent>
                  {availableActivities.map(activity => (
                    <SelectItem key={activity.id} value={activity.id}>{activity.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Date Range Row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={labelStyle}>Start Date</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start" style={{ height: '40px', backgroundColor: '#FFFFFF' }}>
                    <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                    {format(startDate, 'MMM d, yyyy')}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent mode="single" selected={startDate} onSelect={(date) => date && setStartDate(date)} />
                </PopoverContent>
              </Popover>
            </div>
            <div>
              <label style={labelStyle}>End Date</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start" style={{ height: '40px', backgroundColor: '#FFFFFF' }}>
                    <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                    {format(endDate, 'MMM d, yyyy')}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent mode="single" selected={endDate} onSelect={(date) => date && setEndDate(date)} />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Allocation Type */}
          <div>
            <label style={labelStyle}>Allocation Type</label>
            <RadioGroup value={allocationType} onValueChange={(v: 'hard' | 'soft') => setAllocationType(v)} className="flex gap-6">
              <div className="flex items-center gap-2">
                <RadioGroupItem value="hard" id="hard" />
                <label htmlFor="hard" style={{ fontSize: '13px', color: '#374151', cursor: 'pointer' }}>Hard (Confirmed)</label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="soft" id="soft" />
                <label htmlFor="soft" style={{ fontSize: '13px', color: '#374151', cursor: 'pointer' }}>Soft (Tentative)</label>
              </div>
            </RadioGroup>
          </div>

          {/* Team Member */}
          <div>
            <label style={labelStyle}>Assign To <span style={{ color: '#DC2626' }}>*</span></label>
            <Select value={selectedUserId} onValueChange={setSelectedUserId}>
              <SelectTrigger style={{ height: '40px', backgroundColor: '#FFFFFF' }}>
                {selectedUser ? (
                  <div className="flex items-center gap-2">
                    <Avatar className="h-5 w-5">
                      <AvatarImage src={selectedUser.avatar} alt={selectedUser.name} />
                      <AvatarFallback>{selectedUser.name[0]}</AvatarFallback>
                    </Avatar>
                    <span style={{ fontSize: '13px' }}>{selectedUser.name}</span>
                    <span style={{ fontSize: '12px', color: '#6B7280' }}>({selectedUser.role})</span>
                  </div>
                ) : (
                  <SelectValue placeholder="Select team member..." />
                )}
              </SelectTrigger>
              <SelectContent>
                {mockUsers.map(user => (
                  <SelectItem key={user.id} value={user.id}>
                    <div className="flex items-center gap-2">
                      <Avatar className="h-5 w-5">
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
          <div style={{ backgroundColor: colors.bgSubtle, borderRadius: '8px', border: `1px solid ${colors.borderDefault}` }}>
            <div style={{ padding: '10px 12px', borderBottom: `1px solid ${colors.borderDefault}` }}>
              <span style={{ fontSize: typography.xs, fontWeight: typography.medium, color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Suggested Matches
              </span>
            </div>
            <div>
              {suggestedMatches.map((match, idx) => (
                <button
                  key={match.user.id}
                  onClick={() => handleSelectSuggestion(match)}
                  style={{
                    width: '100%',
                    height: '44px',
                    padding: '0 12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    backgroundColor: selectedUserId === match.user.id ? colors.bgSelected : 'transparent',
                    borderBottom: idx < suggestedMatches.length - 1 ? `1px solid ${colors.borderLight}` : 'none',
                    cursor: 'pointer',
                    border: 'none',
                    textAlign: 'left',
                  }}
                  onMouseEnter={(e) => { if (selectedUserId !== match.user.id) e.currentTarget.style.backgroundColor = colors.bgWhite; }}
                  onMouseLeave={(e) => { if (selectedUserId !== match.user.id) e.currentTarget.style.backgroundColor = 'transparent'; }}
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="h-7 w-7">
                      <AvatarImage src={match.user.avatar} alt={match.user.name} />
                      <AvatarFallback>{match.user.name[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div style={{ fontSize: typography.base, fontWeight: typography.medium, color: colors.textPrimary }}>{match.user.name}</div>
                      <div style={{ fontSize: typography.xs, color: colors.textSecondary }}>
                        {match.skills.join(', ')} · {match.availability}% available · €{match.rate}/h
                      </div>
                    </div>
                  </div>
                  <span style={{ fontSize: typography.sm, fontWeight: typography.semibold, color: idx === 0 ? colors.statusGreen : colors.textMuted }}>
                    {match.matchPercent}%
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Hours & Rate Row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
            <div>
              <label style={labelStyle}>Hours/Day</label>
              <Input
                type="number"
                min="0.5"
                max="24"
                step="0.5"
                value={hoursPerDay}
                onChange={(e) => handleHoursPerDayChange(parseFloat(e.target.value) || 0)}
                style={{ height: '40px', backgroundColor: '#FFFFFF' }}
              />
            </div>
            <div>
              <label style={labelStyle}>Total Hours</label>
              <Input
                type="number"
                min="1"
                value={totalHours}
                onChange={(e) => handleTotalHoursChange(parseFloat(e.target.value) || 0)}
                style={{ height: '40px', backgroundColor: '#FFFFFF' }}
              />
            </div>
            <div>
              <label style={labelStyle}>Rate</label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', fontSize: '13px', color: '#6B7280' }}>€</span>
                <Input
                  type="number"
                  min="0"
                  value={rate}
                  onChange={(e) => setRate(parseFloat(e.target.value) || 0)}
                  style={{ height: '40px', paddingLeft: '28px', paddingRight: '32px', backgroundColor: '#FFFFFF' }}
                />
                <span style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', fontSize: '12px', color: '#9CA3AF' }}>/hr</span>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label style={labelStyle}>Notes</label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any notes about this allocation..."
              rows={2}
              style={{ resize: 'none', backgroundColor: '#FFFFFF' }}
            />
          </div>

          {/* Conflict Warning */}
          {hasConflict && selectedUser && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '12px',
              backgroundColor: utilizationColors.warning.bg,
              borderRadius: '6px',
              border: `1px solid ${utilizationColors.warning.border}`
            }}>
              <AlertTriangle className="h-4 w-4 flex-shrink-0" style={{ color: colors.statusAmber }} />
              <span style={{ fontSize: typography.base, color: colors.statusAmber, flex: 1 }}>
                {selectedUser.name} is at 120% capacity Nov 20-22
              </span>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" style={{ height: '28px', fontSize: typography.sm }}>Adjust dates</Button>
                <Button variant="outline" size="sm" style={{ height: '28px', fontSize: typography.sm }}>Assign anyway</Button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{
          padding: '16px 20px',
          borderTop: `1px solid ${colors.borderDefault}`,
          display: 'flex',
          justifyContent: 'flex-end',
          gap: '12px',
          backgroundColor: colors.bgWhite
        }}>
          <Button
            variant="ghost"
            onClick={onClose}
            style={{ fontSize: typography.base, color: colors.textSecondary }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={!canSave}
            style={{
              fontSize: typography.base,
              backgroundColor: canSave ? colors.barBlue : '#A5B4FC',
              color: colors.bgWhite,
            }}
          >
            Save Allocation
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
