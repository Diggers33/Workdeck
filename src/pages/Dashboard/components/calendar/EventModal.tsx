import React, { useState, useEffect } from 'react';
import { CalendarEvent } from './WorkdeckCalendar';
import { X, Calendar, ChevronDown, Check, GripVertical, Clock, User, Trash2, MapPin, Video, Bell, Repeat, Globe, Lock, Users, Paperclip, FileText, MessageSquare, ListChecks, Reply, Edit2, MoreHorizontal, AtSign } from 'lucide-react';
import { toast } from 'sonner';
import { EventComments } from './EventComments';
import { getUsers, getProjectsSummary, UserSummary, ProjectSummary, TaskSummary } from '../../api/dashboardApi';

interface EventModalProps {
  event?: CalendarEvent | null;
  initialDate?: Date;
  initialEndDate?: Date; // Optional end date for drawn events
  onClose: () => void;
  onSave: (event: Partial<CalendarEvent>) => void;
  onDelete?: (eventId: string) => void;
  userColors?: { [key: string]: string };
}

export function EventModal({ event, initialDate, initialEndDate, onClose, onSave, onDelete, userColors }: EventModalProps) {
  const isEditing = !!event;
  
  // Form state
  const [mode, setMode] = useState<'event' | 'task' | 'timeblock'>('event');
  const [title, setTitle] = useState(event?.title || '');
  const [project, setProject] = useState(event?.project || '');
  const [task, setTask] = useState(event?.task || '');
  const [date, setDate] = useState(event?.startTime || initialDate || new Date());
  const [fromTime, setFromTime] = useState(() => {
    if (event?.startTime) return formatTime(new Date(event.startTime));
    if (initialDate) return formatTime(initialDate);
    return '13:30';
  });
  const [toTime, setToTime] = useState(() => {
    if (event?.endTime) return formatTime(new Date(event.endTime));
    if (initialEndDate) return formatTime(initialEndDate); // Use drawn end time
    if (initialDate) {
      // Default to 30 minutes after initialDate
      const endDate = new Date(initialDate.getTime() + 30 * 60 * 1000);
      return formatTime(endDate);
    }
    return '14:00';
  });
  const [isTimesheet, setIsTimesheet] = useState(event?.isTimesheet ?? true);
  const [isBillable, setIsBillable] = useState(event?.isBillable ?? false);

  // Dropdowns
  const [showProjectDropdown, setShowProjectDropdown] = useState(false);
  const [showTaskDropdown, setShowTaskDropdown] = useState(false);
  const [showMoreOptions, setShowMoreOptions] = useState(false);
  const [currentPage, setCurrentPage] = useState<'details' | 'comments' | 'agenda' | 'files'>('details');
  
  // Additional fields for "More options"
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState<Array<{
    id: string; 
    text: string; 
    user: string; 
    timestamp: Date;
    replies?: Array<{id: string; text: string; user: string; timestamp: Date; attachments?: Array<{id: string; name: string; size: number; type: string; url: string}>}>;
    isEditing?: boolean;
    attachments?: Array<{id: string; name: string; size: number; type: string; url: string}>;
  }>>([]);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [showMentions, setShowMentions] = useState(false);
  const [mentionQuery, setMentionQuery] = useState('');
  const [cursorPosition, setCursorPosition] = useState(0);
  const [pendingAttachments, setPendingAttachments] = useState<Array<{id: string; name: string; size: number; type: string; url: string}>>([]);

  // Data from API
  const [teamMembers, setTeamMembers] = useState<Array<{ id: string; name: string; initials: string; color: string }>>([]);
  const [projectsList, setProjectsList] = useState<Array<{ id: string; name: string; color?: string; activities?: any[] }>>([]);
  const [tasksList, setTasksList] = useState<Array<{ id: string; name: string; color?: string }>>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [fullProjectsData, setFullProjectsData] = useState<ProjectSummary[]>([]); // Store full project data with activities

  // Fetch data on mount
  useEffect(() => {
    async function fetchData() {
      setIsLoadingData(true);
      try {
        // Fetch users for team members
        const users = await getUsers();
        console.log('[EventModal] Fetched users:', users);
        const formattedUsers = users.map((user: UserSummary) => {
          const firstName = user.firstName || user.first_name || '';
          const lastName = user.lastName || user.last_name || '';
          const name = `${firstName} ${lastName}`.trim() || user.email || 'Unknown';
          const initials = firstName && lastName
            ? `${firstName[0]}${lastName[0]}`.toUpperCase()
            : name.slice(0, 2).toUpperCase();
          return {
            id: user.id || user.user || '',
            name,
            initials,
            color: '#' + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0') // Random color
          };
        });
        setTeamMembers(formattedUsers);

        // Fetch projects (includes activities/tasks)
        const projects = await getProjectsSummary();
        console.log('[EventModal] Fetched projects:', projects);
        setFullProjectsData(projects); // Store full data with activities
        const formattedProjects = projects.map((proj: ProjectSummary) => ({
          id: proj.id || (proj as any).project || '',
          name: proj.name,
          color: proj.color,
          activities: proj.activities || (proj as any).tasks || []
        }));
        setProjectsList(formattedProjects);
      } catch (error) {
        console.error('[EventModal] Error fetching data:', error);
      } finally {
        setIsLoadingData(false);
      }
    }
    fetchData();
  }, []);

  // Get tasks from project activities when project changes (no separate API call needed)
  useEffect(() => {
    if (!selectedProjectId) {
      setTasksList([]);
      return;
    }
    // Find the project in our cached data
    const projectData = fullProjectsData.find(p => (p.id || (p as any).project) === selectedProjectId);
    console.log('[EventModal] Getting tasks for project:', selectedProjectId, projectData);

    if (projectData) {
      // Activities/tasks are included in project-summary response
      const activities = projectData.activities || (projectData as any).tasks || [];
      console.log('[EventModal] Project activities:', activities);
      const formattedTasks = activities.map((t: any) => ({
        id: t.id || t.task || t.activity || '',
        name: t.summary || t.name || t.title || 'Unnamed Task',
        color: t.color
      }));
      setTasksList(formattedTasks);
    } else {
      setTasksList([]);
    }
  }, [selectedProjectId, fullProjectsData]);
  const [agendaItems, setAgendaItems] = useState<Array<{
    id: string; 
    title: string; 
    timeAllocation: string; 
    presenter: string;
    completed: boolean;
    notes: string;
    isExpanded: boolean;
    actions: Array<{
      id: string;
      text: string;
      assignedTo: string;
      dueDate: string;
      completed: boolean;
    }>;
  }>>([]);
  const [newAgendaItem, setNewAgendaItem] = useState('');
  const [editingAgendaId, setEditingAgendaId] = useState<string | null>(null);
  const [editingAgendaTitle, setEditingAgendaTitle] = useState('');
  const [agendaDropdownId, setAgendaDropdownId] = useState<string | null>(null);
  const [agendaDropdownType, setAgendaDropdownType] = useState<'time' | 'presenter' | null>(null);
  const [showActionDocument, setShowActionDocument] = useState(false);
  const [assigneeDropdownId, setAssigneeDropdownId] = useState<string | null>(null);
  const [description, setDescription] = useState(event?.description || '');
  const [location, setLocation] = useState('');
  const [attendees, setAttendees] = useState<string[]>([]);
  const [reminders, setReminders] = useState('15 minutes before');
  
  // New fields from the design
  const [isPrivate, setIsPrivate] = useState(false);
  const [guestSearch, setGuestSearch] = useState('');
  const [guests, setGuests] = useState<string[]>([]);
  const [timezone, setTimezone] = useState('Europe/Madrid');
  const [showTimezoneDropdown, setShowTimezoneDropdown] = useState(false);
  const [recurrence, setRecurrence] = useState('');
  const [showRecurrenceDropdown, setShowRecurrenceDropdown] = useState(false);
  const [isExternalMeeting, setIsExternalMeeting] = useState(false);
  const [importance, setImportance] = useState<'low' | 'medium' | 'high'>('medium');
  const [alert, setAlert] = useState('15 minutes before');
  const [showAlertDropdown, setShowAlertDropdown] = useState(false);
  const [meetingLink, setMeetingLink] = useState('');
  const [meetingRoom, setMeetingRoom] = useState('');
  const [attachments, setAttachments] = useState<Array<{id: string; name: string; size: string; type: string; date: string; content?: string}>>([]); 

  // Event color picker state
  const [eventColor, setEventColor] = useState(event?.color || '#3B82F6');
  const [showColorPicker, setShowColorPicker] = useState(false);
// Predefined color options matching Angular/Workdeck palette  const colorOptions = [    { name: 'Blue', value: '#3B82F6' },    { name: 'Sky', value: '#60A5FA' },    { name: 'Green', value: '#10B981' },    { name: 'Emerald', value: '#34D399' },    { name: 'Yellow', value: '#FBBF24' },    { name: 'Orange', value: '#F97316' },    { name: 'Red', value: '#EF4444' },    { name: 'Pink', value: '#EC4899' },    { name: 'Purple', value: '#8B5CF6' },    { name: 'Indigo', value: '#6366F1' },    { name: 'Teal', value: '#14B8A6' },    { name: 'Gray', value: '#6B7280' },  ];
  
  const timeAllocations = ['5m', '10m', '15m', '30m', '45m', '1h'];
  const presenters = ['Colm Digby', 'Sarah Chen', 'Mike O\'Brien', 'Emma Walsh', 'No presenter'];
  const agendaTeamMembers = ['Colm Digby', 'Sarah Chen', 'Mike O\'Brien', 'Emma Walsh', 'John Murphy', 'Lisa O\'Connor'];

  const addAgendaItem = () => {
    if (newAgendaItem.trim()) {
      setAgendaItems([...agendaItems, {
        id: `agenda-${Date.now()}`,
        title: newAgendaItem.trim(),
        timeAllocation: '',
        presenter: '',
        completed: false,
        notes: '',
        isExpanded: false,
        actions: []
      }]);
      setNewAgendaItem('');
    }
  };

  const deleteAgendaItem = (id: string) => {
    setAgendaItems(agendaItems.filter(item => item.id !== id));
  };

  const updateAgendaItem = (id: string, updates: Partial<typeof agendaItems[0]>) => {
    setAgendaItems(agendaItems.map(item => 
      item.id === id ? { ...item, ...updates } : item
    ));
  };

  const startEditingAgenda = (id: string, title: string) => {
    setEditingAgendaId(id);
    setEditingAgendaTitle(title);
  };

  const finishEditingAgenda = () => {
    if (editingAgendaId && editingAgendaTitle.trim()) {
      updateAgendaItem(editingAgendaId, { title: editingAgendaTitle.trim() });
    }
    setEditingAgendaId(null);
    setEditingAgendaTitle('');
  };

  const addActionToAgendaItem = (agendaId: string, actionText: string) => {
    const agendaItem = agendaItems.find(item => item.id === agendaId);
    if (agendaItem && actionText.trim()) {
      const newAction = {
        id: `action-${Date.now()}`,
        text: actionText.trim(),
        assignedTo: '',
        dueDate: '',
        completed: false
      };
      updateAgendaItem(agendaId, {
        actions: [...agendaItem.actions, newAction]
      });
    }
  };

  const updateAction = (agendaId: string, actionId: string, updates: Partial<{text: string; assignedTo: string; dueDate: string; completed: boolean}>) => {
    const agendaItem = agendaItems.find(item => item.id === agendaId);
    if (agendaItem) {
      const updatedActions = agendaItem.actions.map(action =>
        action.id === actionId ? { ...action, ...updates } : action
      );
      updateAgendaItem(agendaId, { actions: updatedActions });
    }
  };

  const deleteAction = (agendaId: string, actionId: string) => {
    const agendaItem = agendaItems.find(item => item.id === agendaId);
    if (agendaItem) {
      updateAgendaItem(agendaId, {
        actions: agendaItem.actions.filter(action => action.id !== actionId)
      });
    }
  };

  const getTotalActionCount = (): number => {
    return agendaItems.reduce((total, item) => total + item.actions.length, 0);
  };

  const getCompletedActionCount = (): number => {
    return agendaItems.reduce((total, item) => 
      total + item.actions.filter(action => action.completed).length, 0
    );
  };

  // Comment handling functions
  const handleCommentChange = (text: string) => {
    setCommentText(text);
    
    // Check for @ mentions
    const lastAtIndex = text.lastIndexOf('@');
    if (lastAtIndex !== -1) {
      const textAfterAt = text.substring(lastAtIndex + 1);
      const spaceIndex = textAfterAt.indexOf(' ');
      const query = spaceIndex === -1 ? textAfterAt : textAfterAt.substring(0, spaceIndex);
      
      if (query.length >= 0 && spaceIndex === -1) {
        setMentionQuery(query);
        setShowMentions(true);
        setCursorPosition(lastAtIndex);
      } else {
        setShowMentions(false);
      }
    } else {
      setShowMentions(false);
    }
  };

  const insertMention = (member: typeof teamMembers[0]) => {
    const beforeMention = commentText.substring(0, cursorPosition);
    const afterMention = commentText.substring(cursorPosition + 1 + mentionQuery.length);
    setCommentText(`${beforeMention}@${member.name} ${afterMention}`);
    setShowMentions(false);
    setMentionQuery('');
  };

  const addComment = () => {
    if (commentText.trim() || pendingAttachments.length > 0) {
      if (replyingTo) {
        // Add reply to existing comment
        setComments(comments.map(comment => {
          if (comment.id === replyingTo) {
            return {
              ...comment,
              replies: [
                ...(comment.replies || []),
                {
                  id: `reply-${Date.now()}`,
                  text: commentText.trim(),
                  user: 'Colm Digby (You)',
                  timestamp: new Date(),
                  attachments: pendingAttachments.length > 0 ? [...pendingAttachments] : undefined
                }
              ]
            };
          }
          return comment;
        }));
        setReplyingTo(null);
      } else {
        // Add new comment
        setComments([...comments, {
          id: `comment-${Date.now()}`,
          text: commentText.trim(),
          user: 'Colm Digby (You)',
          timestamp: new Date(),
          replies: [],
          attachments: pendingAttachments.length > 0 ? [...pendingAttachments] : undefined
        }]);
      }
      setCommentText('');
      setPendingAttachments([]);
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const items = Array.from(e.clipboardData.items);
    items.forEach(item => {
      if (item.type.startsWith('image/')) {
        const file = item.getAsFile();
        if (file) {
          handleAddAttachment(file);
        }
      }
    });
  };

  const handleAddAttachment = (file: File) => {
    const url = URL.createObjectURL(file);
    const attachment = {
      id: `attach-${Date.now()}-${Math.random()}`,
      name: file.name,
      size: file.size,
      type: file.type,
      url: url
    };
    setPendingAttachments([...pendingAttachments, attachment]);
    toast.success(`Added ${file.name}`);
  };

  const handleRemoveAttachment = (id: string) => {
    const attachment = pendingAttachments.find(a => a.id === id);
    if (attachment) {
      URL.revokeObjectURL(attachment.url);
    }
    setPendingAttachments(pendingAttachments.filter(a => a.id !== id));
  };

  const startEditComment = (commentId: string, text: string) => {
    setEditingCommentId(commentId);
    setEditText(text);
  };

  const saveEditComment = (commentId: string) => {
    if (editText.trim()) {
      setComments(comments.map(comment => 
        comment.id === commentId ? { ...comment, text: editText.trim() } : comment
      ));
    }
    setEditingCommentId(null);
    setEditText('');
  };

  const deleteComment = (commentId: string) => {
    setComments(comments.filter(comment => comment.id !== commentId));
  };

  const filteredMentions = teamMembers.filter(member =>
    member.name.toLowerCase().includes(mentionQuery.toLowerCase())
  );

  const downloadActionDocument = () => {
    const totalActions = getTotalActionCount();
    const completedActions = getCompletedActionCount();
    const pendingActions = totalActions - completedActions;
    const completionRate = totalActions > 0 ? Math.round((completedActions / totalActions) * 100) : 0;

    // Generate Word document content (HTML format that Word can open)
    const docContent = `<!DOCTYPE html>
<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
<head><meta charset='utf-8'><title>Action Items Document</title>
<style>
body { font-family: 'Inter', 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #0A0A0A; max-width: 800px; margin: 40px auto; padding: 40px; }
.header { border-bottom: 4px solid #0066FF; padding-bottom: 24px; margin-bottom: 32px; }
.header h1 { color: #0066FF; margin: 0 0 8px 0; font-size: 28px; font-weight: 700; }
.header .meeting-title { font-size: 24px; font-weight: 600; color: #0A0A0A; margin: 16px 0 8px 0; }
.header .meeting-info { font-size: 14px; color: #6B7280; }
.summary { background: #F0F7FF; border-left: 4px solid #0066FF; padding: 20px 24px; margin: 32px 0; border-radius: 6px; }
.summary h2 { margin: 0 0 16px 0; font-size: 18px; font-weight: 700; color: #0066FF; }
.summary-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; }
.summary-item { background: white; padding: 12px 16px; border-radius: 4px; border: 1px solid #E5E7EB; }
.summary-label { font-size: 12px; color: #6B7280; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600; margin-bottom: 4px; }
.summary-value { font-size: 20px; font-weight: 700; color: #0A0A0A; }
.completion-rate { font-size: 32px; color: #0066FF; }
.section { margin: 40px 0; }
.section h2 { font-size: 20px; font-weight: 700; color: #0A0A0A; margin: 0 0 24px 0; padding-bottom: 12px; border-bottom: 2px solid #E5E7EB; }
.agenda-item { background: #FAFBFC; border: 1px solid #E5E7EB; border-radius: 6px; padding: 20px 24px; margin-bottom: 24px; page-break-inside: avoid; }
.agenda-title { font-size: 16px; font-weight: 700; color: #0A0A0A; margin: 0 0 8px 0; }
.agenda-meta { font-size: 13px; color: #6B7280; display: flex; gap: 16px; flex-wrap: wrap; }
.agenda-notes { background: white; border-left: 3px solid #0066FF; padding: 12px 16px; margin: 16px 0; font-size: 14px; color: #374151; border-radius: 4px; }
.actions-table { width: 100%; border-collapse: collapse; margin-top: 16px; background: white; }
.actions-table th { background: #F9FAFB; padding: 12px 16px; text-align: left; font-size: 12px; font-weight: 700; color: #6B7280; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 2px solid #E5E7EB; }
.actions-table td { padding: 12px 16px; border-bottom: 1px solid #E5E7EB; font-size: 14px; color: #0A0A0A; }
.actions-table tr:last-child td { border-bottom: none; }
.action-completed { background: #F0FDF4; }
.action-pending { background: white; }
.status-badge { display: inline-block; padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: 600; }
.status-completed { background: #D1FAE5; color: #059669; }
.status-pending { background: #FEF3C7; color: #D97706; }
.footer { margin-top: 60px; padding-top: 24px; border-top: 2px solid #E5E7EB; text-align: center; color: #9CA3AF; font-size: 13px; }
.footer .logo { font-weight: 700; color: #0066FF; font-size: 16px; margin-bottom: 4px; }
@media print { body { margin: 0; padding: 20px; } }
</style></head><body>
<div class='header'>
<h1>ACTION ITEMS DOCUMENT</h1>
<div class='meeting-title'>${title}</div>
<div class='meeting-info'>${formatDateInput(date)} at ${fromTime}${toTime && toTime !== fromTime ? ` - ${toTime}` : ''}</div>
</div>
<div class='summary'><h2>Executive Summary</h2>
<div class='summary-grid'>
<div class='summary-item'><div class='summary-label'>Total Action Items</div><div class='summary-value'>${totalActions}</div></div>
<div class='summary-item'><div class='summary-label'>Completed</div><div class='summary-value' style='color: #059669;'>${completedActions}</div></div>
<div class='summary-item'><div class='summary-label'>Pending</div><div class='summary-value' style='color: #D97706;'>${pendingActions}</div></div>
<div class='summary-item'><div class='summary-label'>Completion Rate</div><div class='completion-rate'>${completionRate}%</div></div>
</div></div>
<div class='section'><h2>Action Items by Topic</h2>
${agendaItems.map(item => `<div class='agenda-item'>
<div class='agenda-title'>${item.title}</div>
<div class='agenda-meta'>
${item.timeAllocation ? `<span>⏱️ Time: <strong>${item.timeAllocation}</strong></span>` : ''}
${item.presenter ? `<span>👤 Presenter: <strong>${item.presenter}</strong></span>` : ''}
</div>
${item.notes ? `<div class='agenda-notes'><strong>Notes:</strong> ${item.notes}</div>` : ''}
${item.actions.length > 0 ? `<table class='actions-table'>
<thead><tr><th style='width: 60px;'>Status</th><th>Action Item</th><th style='width: 150px;'>Assigned To</th><th style='width: 120px;'>Due Date</th></tr></thead>
<tbody>${item.actions.map(action => `<tr class='${action.completed ? 'action-completed' : 'action-pending'}'>
<td><span class='status-badge ${action.completed ? 'status-completed' : 'status-pending'}'>${action.completed ? '✓ Done' : 'Pending'}</span></td>
<td><strong>${action.text}</strong></td>
<td>${action.assignedTo || '<em>Unassigned</em>'}</td>
<td>${action.dueDate || '<em>No due date</em>'}</td>
</tr>`).join('')}</tbody></table>` : '<p style="color: #9CA3AF; font-style: italic; margin-top: 12px;">No action items for this topic</p>'}
</div>`).join('')}
</div>
<div class='footer'><div class='logo'>WORKDECK</div><div>Enterprise Workforce Management Platform</div><div>Document generated on ${new Date().toLocaleString()}</div></div>
</body></html>`;

    // Create file data
    const blob = new Blob([docContent], { type: 'application/msword' });
    const fileName = `Action_Items_${title.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.doc`;

    // Add to attachments with content stored
    const newAttachment = {
      id: `attachment-${Date.now()}`,
      name: fileName,
      size: `${Math.round(blob.size / 1024)} KB`,
      type: 'Word Document',
      date: new Date().toISOString(),
      content: docContent
    };
    setAttachments([...attachments, newAttachment]);

    // Show success toast
    toast.success('Action document saved & attached!', {
      description: 'Document added to Files tab'
    });
  };

  // Use fetched projects data (fallback to empty if loading)
  const projects = projectsList.length > 0
    ? projectsList.map(p => p.name)
    : ['Loading projects...'];

  // Use fetched tasks data (fallback to empty if loading or no project selected)
  const tasks = tasksList.length > 0
    ? tasksList.map(t => t.name)
    : selectedProjectId ? ['Loading tasks...'] : ['Select a project first'];

  function formatTime(date: Date): string {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  }

  function formatDateInput(date: Date): string {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  }

  function calculateDuration(): string {
    const [fromH, fromM] = fromTime.split(':').map(Number);
    const [toH, toM] = toTime.split(':').map(Number);
    
    const fromMinutes = fromH * 60 + fromM;
    const toMinutes = toH * 60 + toM;
    const diffMinutes = toMinutes - fromMinutes;
    
    if (diffMinutes < 60) {
      return `${diffMinutes}m`;
    }
    
    const hours = Math.floor(diffMinutes / 60);
    const minutes = diffMinutes % 60;
    
    if (minutes === 0) {
      return `${hours}h`;
    }
    
    return `${hours}h ${minutes}m`;
  }

  function parseTimeAllocation(timeStr: string): number {
    if (!timeStr) return 0;
    const match = timeStr.match(/(\d+)(m|h)/);
    if (!match) return 0;
    const value = parseInt(match[1]);
    const unit = match[2];
    return unit === 'h' ? value * 60 : value;
  }

  function calculateTotalAgendaTime(): number {
    return agendaItems.reduce((total, item) => {
      return total + parseTimeAllocation(item.timeAllocation);
    }, 0);
  }

  function formatMinutes(minutes: number): string {
    if (minutes < 60) {
      return `${minutes}m`;
    }
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (mins === 0) {
      return `${hours}h`;
    }
    return `${hours}h ${mins}m`;
  }

  function getMeetingDurationMinutes(): number {
    const [fromH, fromM] = fromTime.split(':').map(Number);
    const [toH, toM] = toTime.split(':').map(Number);
    const fromMinutes = fromH * 60 + fromM;
    const toMinutes = toH * 60 + toM;
    return toMinutes - fromMinutes;
  }

  const handleSave = () => {
    const [fromHours, fromMinutes] = fromTime.split(':').map(Number);
    const [toHours, toMinutes] = toTime.split(':').map(Number);
    
    const startTime = new Date(date);
    startTime.setHours(fromHours, fromMinutes, 0, 0);
    
    const endTime = new Date(date);
    endTime.setHours(toHours, toMinutes, 0, 0);

    const finalTitle = title || (project && task ? `${project} - ${task}` : task || project || 'Untitled');

    // Get the IDs for project and task
    const projectData = projectsList.find(p => p.name === project);
    const taskData = tasksList.find(t => t.name === task);

    onSave({
      id: event?.id || `event-${Date.now()}`,
      title: finalTitle,
      project,
      projectId: projectData?.id || selectedProjectId, // Include project ID for API
      projectColor: projectData?.color || '#3B82F6',
      color: eventColor, // User-selected event color
      task,
      taskId: taskData?.id, // Include task ID for API
      startTime,
      endTime,
      isTimesheet,
      isBillable,
      isPrivate,
      isExternal: isExternalMeeting,
      createdBy: 'Colm Digby (You)',
      description,
      location,
      attendees,
      guests: guests.length > 0 ? guests : teamMembers.filter(m => attendees.includes(m.name)).map(m => m.id), // Map attendee names to IDs
      reminders,
      timezone,
      recurrence,
      importance,
      alert,
      meetingLink,
      meetingRoom,
      attachments,
      agendaItems,
      comments
    });
  };

  return (
    <>
      {/* Backdrop */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          zIndex: 1000
        }}
        onClick={onClose}
      />

      {/* Centered Modal (only shown when More Options is closed) */}
      {!showMoreOptions && (
        <div
          style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            background: 'white',
            borderRadius: '8px',
            width: '100%',
            maxWidth: '640px',
            maxHeight: '85vh',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            display: 'flex',
            flexDirection: 'column',
            zIndex: 1001
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div style={{
            padding: '24px 24px 20px 24px',
            borderBottom: '1px solid #E5E7EB',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Add a title..."
              style={{
                border: 'none',
                outline: 'none',
                fontSize: '16px',
                fontWeight: 400,
                color: '#0A0A0A',
                flex: 1,
                background: 'transparent',
                padding: 0
              }}
              autoFocus={!isEditing}
            />

            <button
              onClick={onClose}
              style={{
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '6px',
                border: 'none',
                background: 'transparent',
                cursor: 'pointer',
                color: '#9CA3AF',
                flexShrink: 0,
                marginLeft: '12px'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#F3F4F6'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            >
              <X size={20} />
            </button>
          </div>

          {/* Content */}
          <div style={{ 
            padding: '24px', 
            overflowY: 'auto',
            flex: 1 
          }}>
            {/* Event/Task/Time Block Tabs */}
            <div style={{ marginBottom: '24px', display: 'flex', gap: '8px' }}>
              <button
                onClick={() => setMode('event')}
                style={{
                  padding: '8px 20px',
                  borderRadius: '6px',
                  border: mode === 'event' ? 'none' : '1px solid #D1D5DB',
                  background: mode === 'event' ? '#0066FF' : 'white',
                  color: mode === 'event' ? 'white' : '#6B7280',
                  fontSize: '14px',
                  fontWeight: 500,
                  cursor: 'pointer',
                  transition: 'all 150ms'
                }}
              >
                Event
              </button>
              <button
                onClick={() => setMode('task')}
                style={{
                  padding: '8px 20px',
                  borderRadius: '6px',
                  border: mode === 'task' ? 'none' : '1px solid #D1D5DB',
                  background: mode === 'task' ? '#0066FF' : 'white',
                  color: mode === 'task' ? 'white' : '#6B7280',
                  fontSize: '14px',
                  fontWeight: 500,
                  cursor: 'pointer',
                  transition: 'all 150ms'
                }}
              >
                Task
              </button>
              <button
                onClick={() => setMode('timeblock')}
                style={{
                  padding: '8px 20px',
                  borderRadius: '6px',
                  border: mode === 'timeblock' ? 'none' : '1px solid #D1D5DB',
                  background: mode === 'timeblock' ? '#0066FF' : 'white',
                  color: mode === 'timeblock' ? 'white' : '#6B7280',
                  fontSize: '14px',
                  fontWeight: 500,
                  cursor: 'pointer',
                  transition: 'all 150ms'
                }}
              >
                Time Block
              </button>
            </div>

            {/* Project & Task */}
            <div style={{ 
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '12px',
              marginBottom: '20px'
            }}>
              <div style={{ position: 'relative' }}>
                <label style={{ 
                  display: 'block',
                  fontSize: '13px', 
                  fontWeight: 500, 
                  color: '#374151',
                  marginBottom: '8px'
                }}>
                  Project
                </label>
                <button
                  onClick={() => setShowProjectDropdown(!showProjectDropdown)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    border: '1px solid #D1D5DB',
                    borderRadius: '6px',
                    background: 'white',
                    cursor: 'pointer',
                    fontSize: '14px',
                    color: project ? '#0A0A0A' : '#9CA3AF',
                    textAlign: 'left'
                  }}
                >
                  {project || 'Select...'}
                  <ChevronDown size={16} color="#9CA3AF" />
                </button>

                {showProjectDropdown && (
                  <>
                    <div
                      style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        zIndex: 998
                      }}
                      onClick={() => setShowProjectDropdown(false)}
                    />
                    <div style={{
                      position: 'absolute',
                      top: '72px',
                      left: 0,
                      right: 0,
                      background: 'white',
                      border: '1px solid #E5E7EB',
                      borderRadius: '6px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                      zIndex: 999,
                      maxHeight: '240px',
                      overflow: 'auto'
                    }}>
                      {projects.map(p => (
                        <button
                          key={p}
                          onClick={() => {
                            setProject(p);
                            // Find and set the project ID for fetching tasks
                            const projectData = projectsList.find(proj => proj.name === p);
                            setSelectedProjectId(projectData?.id || null);
                            setTask(''); // Reset task when project changes
                            setShowProjectDropdown(false);
                          }}
                          style={{
                            width: '100%',
                            padding: '10px 12px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            background: project === p ? '#F9FAFB' : 'transparent',
                            border: 'none',
                            fontSize: '14px',
                            color: '#0A0A0A',
                            cursor: 'pointer',
                            textAlign: 'left'
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.background = '#F9FAFB'}
                          onMouseLeave={(e) => e.currentTarget.style.background = project === p ? '#F9FAFB' : 'transparent'}
                        >
                          {p}
                          {project === p && <Check size={16} color="#0066FF" />}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>

              <div style={{ position: 'relative' }}>
                <label style={{ 
                  display: 'block',
                  fontSize: '13px', 
                  fontWeight: 500, 
                  color: '#374151',
                  marginBottom: '8px'
                }}>
                  Task <span style={{ color: '#9CA3AF', fontWeight: 400 }}>(optional)</span>
                </label>
                <button
                  onClick={() => setShowTaskDropdown(!showTaskDropdown)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    border: '1px solid #D1D5DB',
                    borderRadius: '6px',
                    background: 'white',
                    cursor: 'pointer',
                    fontSize: '14px',
                    color: task ? '#0A0A0A' : '#9CA3AF',
                    textAlign: 'left'
                  }}
                >
                  {task || 'Select...'}
                  <ChevronDown size={16} color="#9CA3AF" />
                </button>

                {showTaskDropdown && (
                  <>
                    <div
                      style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        zIndex: 998
                      }}
                      onClick={() => setShowTaskDropdown(false)}
                    />
                    <div style={{
                      position: 'absolute',
                      top: '72px',
                      left: 0,
                      right: 0,
                      background: 'white',
                      border: '1px solid #E5E7EB',
                      borderRadius: '6px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                      zIndex: 999,
                      maxHeight: '240px',
                      overflow: 'auto'
                    }}>
                      {tasks.map(t => (
                        <button
                          key={t}
                          onClick={() => {
                            setTask(t);
                            if (!title) setTitle(t);
                            setShowTaskDropdown(false);
                          }}
                          style={{
                            width: '100%',
                            padding: '10px 12px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            background: task === t ? '#F9FAFB' : 'transparent',
                            border: 'none',
                            fontSize: '14px',
                            color: '#0A0A0A',
                            cursor: 'pointer',
                            textAlign: 'left'
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.background = '#F9FAFB'}
                          onMouseLeave={(e) => e.currentTarget.style.background = task === t ? '#F9FAFB' : 'transparent'}
                        >
                          {t}
                          {task === t && <Check size={16} color="#0066FF" />}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Date & Time */}
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: '1.4fr 1fr 1fr 0.8fr',
              gap: '12px',
              marginBottom: '20px'
            }}>
              <div>
                <label style={{ 
                  display: 'block',
                  fontSize: '13px', 
                  fontWeight: 500, 
                  color: '#374151',
                  marginBottom: '8px'
                }}>
                  Date
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    value={formatDateInput(date)}
                    readOnly
                    style={{
                      width: '100%',
                      padding: '10px 36px 10px 12px',
                      border: '1px solid #D1D5DB',
                      borderRadius: '6px',
                      fontSize: '14px',
                      color: '#0A0A0A',
                      background: 'white'
                    }}
                  />
                  <Calendar 
                    size={16} 
                    color="#9CA3AF" 
                    style={{
                      position: 'absolute',
                      right: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      pointerEvents: 'none'
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ 
                  display: 'block',
                  fontSize: '13px', 
                  fontWeight: 500, 
                  color: '#374151',
                  marginBottom: '8px'
                }}>
                  From
                </label>
                <input
                  type="time"
                  value={fromTime}
                  onChange={(e) => setFromTime(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid #D1D5DB',
                    borderRadius: '6px',
                    fontSize: '14px',
                    color: '#0A0A0A'
                  }}
                />
              </div>

              <div>
                <label style={{ 
                  display: 'block',
                  fontSize: '13px', 
                  fontWeight: 500, 
                  color: '#374151',
                  marginBottom: '8px'
                }}>
                  To
                </label>
                <input
                  type="time"
                  value={toTime}
                  onChange={(e) => setToTime(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid #D1D5DB',
                    borderRadius: '6px',
                    fontSize: '14px',
                    color: '#0A0A0A'
                  }}
                />
              </div>

              <div>
                <label style={{ 
                  display: 'block',
                  fontSize: '13px', 
                  fontWeight: 500, 
                  color: '#374151',
                  marginBottom: '8px'
                }}>
                  Duration
                </label>
                <div
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid #E5E7EB',
                    borderRadius: '6px',
                    fontSize: '14px',
                    color: '#6B7280',
                    background: '#F9FAFB',
                    display: 'flex',
                    alignItems: 'center'
                  }}
                >
                  {calculateDuration()}
                </div>
              </div>
            </div>


            {/* Event Color Picker */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                fontSize: '13px',
                fontWeight: 500,
                color: '#374151',
                marginBottom: '8px'
              }}>
                Event Color
              </label>
              <div style={{ position: 'relative' }}>
                <button
                  onClick={() => setShowColorPicker(!showColorPicker)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '10px 12px',
                    border: '1px solid #D1D5DB',
                    borderRadius: '6px',
                    background: 'white',
                    cursor: 'pointer',
                    width: '100%',
                    maxWidth: '200px'
                  }}
                >
                  <div style={{
                    width: '20px',
                    height: '20px',
                    borderRadius: '4px',
                    background: eventColor,
                    border: '1px solid rgba(0,0,0,0.1)'
                  }} />
                  <span style={{ fontSize: '14px', color: '#0A0A0A', flex: 1, textAlign: 'left' }}>
                    {colorOptions.find(c => c.value === eventColor)?.name || 'Custom'}
                  </span>
                  <ChevronDown size={16} color="#9CA3AF" />
                </button>

                {showColorPicker && (
                  <>
                    <div
                      style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        zIndex: 998
                      }}
                      onClick={() => setShowColorPicker(false)}
                    />
                    <div style={{
                      position: 'absolute',
                      top: '48px',
                      left: 0,
                      background: 'white',
                      border: '1px solid #E5E7EB',
                      borderRadius: '8px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                      zIndex: 999,
                      padding: '12px',
                      minWidth: '200px'
                    }}>
                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(6, 1fr)',
                        gap: '8px'
                      }}>
                        {colorOptions.map(color => (
                          <button
                            key={color.value}
                            onClick={() => {
                              setEventColor(color.value);
                              setShowColorPicker(false);
                            }}
                            title={color.name}
                            style={{
                              width: '28px',
                              height: '28px',
                              borderRadius: '6px',
                              background: color.value,
                              border: eventColor === color.value ? '2px solid #0066FF' : '1px solid rgba(0,0,0,0.1)',
                              cursor: 'pointer',
                              transition: 'transform 100ms',
                              transform: eventColor === color.value ? 'scale(1.1)' : 'scale(1)'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.15)'}
                            onMouseLeave={(e) => e.currentTarget.style.transform = eventColor === color.value ? 'scale(1.1)' : 'scale(1)'}
                          />
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Timesheet and Billable */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '12px',
                cursor: 'pointer'
              }}>
                <input
                  type="checkbox"
                  checked={isTimesheet}
                  onChange={(e) => setIsTimesheet(e.target.checked)}
                  style={{
                    width: '18px',
                    height: '18px',
                    cursor: 'pointer',
                    accentColor: '#0066FF'
                  }}
                />
                <span style={{ fontSize: '14px', fontWeight: 500, color: '#0A0A0A' }}>
                  Timesheet
                </span>
                <span style={{ fontSize: '13px', color: '#9CA3AF' }}>
                  — Include in submitted work hours
                </span>
              </label>

              <label style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                cursor: 'pointer'
              }}>
                <input
                  type="checkbox"
                  checked={isBillable}
                  onChange={(e) => setIsBillable(e.target.checked)}
                  style={{
                    width: '18px',
                    height: '18px',
                    cursor: 'pointer',
                    accentColor: '#0066FF'
                  }}
                />
                <span style={{ fontSize: '14px', fontWeight: 500, color: '#0A0A0A' }}>
                  Billable
                </span>
                <span style={{ fontSize: '13px', color: '#9CA3AF' }}>
                  — Track as billable time for invoicing
                </span>
              </label>
            </div>
          </div>

          {/* Footer */}
          <div style={{
            padding: '16px 24px',
            borderTop: '1px solid #E5E7EB',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '12px'
          }}>
            <button
              onClick={() => setShowMoreOptions(true)}
              style={{
                padding: '0',
                border: 'none',
                background: 'transparent',
                color: '#0066FF',
                fontSize: '14px',
                fontWeight: 500,
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => e.currentTarget.style.textDecoration = 'underline'}
              onMouseLeave={(e) => e.currentTarget.style.textDecoration = 'none'}
            >
              More options →
            </button>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={onClose}
                style={{
                  padding: '10px 24px',
                  borderRadius: '6px',
                  border: 'none',
                  background: 'transparent',
                  color: '#6B7280',
                  fontSize: '14px',
                  fontWeight: 500,
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#F3F4F6'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              >
                Cancel
              </button>

              <button
                onClick={handleSave}
                style={{
                  padding: '10px 24px',
                  borderRadius: '6px',
                  border: 'none',
                  background: '#0066FF',
                  color: 'white',
                  fontSize: '14px',
                  fontWeight: 500,
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#0052CC'}
                onMouseLeave={(e) => e.currentTarget.style.background = '#0066FF'}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Side Panel (only shown when More Options is open) */}
      {showMoreOptions && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            right: 0,
            bottom: 0,
            width: '680px',
            background: 'white',
            boxShadow: '-4px 0 24px rgba(0, 0, 0, 0.15)',
            zIndex: 1002,
            display: 'flex',
            flexDirection: 'column',
            animation: 'slideIn 200ms ease-out'
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Panel Header */}
          <div style={{
            padding: '28px 32px 0 32px',
            borderBottom: '1px solid #E5E7EB',
            background: '#FAFBFC'
          }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '24px' }}>
              <div style={{ flex: 1, marginRight: '16px' }}>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Event title..."
                  style={{
                    border: 'none',
                    outline: 'none',
                    fontSize: '20px',
                    fontWeight: 600,
                    color: '#0A0A0A',
                    width: '100%',
                    background: 'transparent',
                    padding: 0,
                    marginBottom: '8px'
                  }}
                />
                
                {/* Event type pills */}
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <button
                    onClick={() => setMode('event')}
                    style={{
                      padding: '4px 12px',
                      borderRadius: '12px',
                      border: 'none',
                      background: mode === 'event' ? '#0066FF' : '#E5E7EB',
                      color: mode === 'event' ? 'white' : '#6B7280',
                      fontSize: '12px',
                      fontWeight: 500,
                      cursor: 'pointer'
                    }}
                  >
                    Event
                  </button>
                  <button
                    onClick={() => setMode('task')}
                    style={{
                      padding: '4px 12px',
                      borderRadius: '12px',
                      border: 'none',
                      background: mode === 'task' ? '#0066FF' : '#E5E7EB',
                      color: mode === 'task' ? 'white' : '#6B7280',
                      fontSize: '12px',
                      fontWeight: 500,
                      cursor: 'pointer'
                    }}
                  >
                    Task
                  </button>
                  <button
                    onClick={() => setMode('timeblock')}
                    style={{
                      padding: '4px 12px',
                      borderRadius: '12px',
                      border: 'none',
                      background: mode === 'timeblock' ? '#0066FF' : '#E5E7EB',
                      color: mode === 'timeblock' ? 'white' : '#6B7280',
                      fontSize: '12px',
                      fontWeight: 500,
                      cursor: 'pointer'
                    }}
                  >
                    Time Block
                  </button>
                  
                  {isPrivate && (
                    <div style={{ 
                      padding: '4px 10px',
                      borderRadius: '12px',
                      background: '#FEF3C7',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}>
                      <Lock size={12} color="#92400E" />
                      <span style={{ fontSize: '12px', fontWeight: 500, color: '#92400E' }}>Private</span>
                    </div>
                  )}
                  
                  {isExternalMeeting && (
                    <div style={{ 
                      padding: '4px 10px',
                      borderRadius: '12px',
                      background: '#DBEAFE',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}>
                      <Globe size={12} color="#1E40AF" />
                      <span style={{ fontSize: '12px', fontWeight: 500, color: '#1E40AF' }}>External</span>
                    </div>
                  )}
                </div>
              </div>
              
              <button
                onClick={onClose}
                style={{
                  width: '36px',
                  height: '36px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '6px',
                  border: 'none',
                  background: 'white',
                  cursor: 'pointer',
                  color: '#9CA3AF',
                  flexShrink: 0
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#F3F4F6'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'white'}
              >
                <X size={20} />
              </button>
            </div>

            {/* Navigation Tabs */}
            <div style={{ 
              display: 'flex',
              gap: '4px',
              marginBottom: '-1px'
            }}>
              <button
                onClick={() => setCurrentPage('details')}
                style={{
                  padding: '14px 20px',
                  border: 'none',
                  background: 'transparent',
                  fontSize: '14px',
                  fontWeight: 600,
                  color: currentPage === 'details' ? '#0066FF' : '#6B7280',
                  cursor: 'pointer',
                  borderBottom: currentPage === 'details' ? '3px solid #0066FF' : '3px solid transparent',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  letterSpacing: '0.01em'
                }}
                onMouseEnter={(e) => {
                  if (currentPage !== 'details') e.currentTarget.style.color = '#374151';
                }}
                onMouseLeave={(e) => {
                  if (currentPage !== 'details') e.currentTarget.style.color = '#6B7280';
                }}
              >
                <FileText size={16} />
                Details
              </button>
              <button
                onClick={() => setCurrentPage('comments')}
                style={{
                  padding: '14px 20px',
                  border: 'none',
                  background: 'transparent',
                  fontSize: '14px',
                  fontWeight: 600,
                  color: currentPage === 'comments' ? '#0066FF' : '#6B7280',
                  cursor: 'pointer',
                  borderBottom: currentPage === 'comments' ? '3px solid #0066FF' : '3px solid transparent',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  letterSpacing: '0.01em'
                }}
                onMouseEnter={(e) => {
                  if (currentPage !== 'comments') e.currentTarget.style.color = '#374151';
                }}
                onMouseLeave={(e) => {
                  if (currentPage !== 'comments') e.currentTarget.style.color = '#6B7280';
                }}
              >
                <MessageSquare size={16} />
                Comments
                {comments.length > 0 && (
                  <span style={{
                    background: currentPage === 'comments' ? '#0066FF' : '#E5E7EB',
                    color: currentPage === 'comments' ? 'white' : '#6B7280',
                    fontSize: '11px',
                    fontWeight: 700,
                    padding: '2px 7px',
                    borderRadius: '10px',
                    minWidth: '22px',
                    textAlign: 'center'
                  }}>
                    {comments.length}
                  </span>
                )}
              </button>
              <button
                onClick={() => setCurrentPage('agenda')}
                style={{
                  padding: '14px 20px',
                  border: 'none',
                  background: 'transparent',
                  fontSize: '14px',
                  fontWeight: 600,
                  color: currentPage === 'agenda' ? '#0066FF' : '#6B7280',
                  cursor: 'pointer',
                  borderBottom: currentPage === 'agenda' ? '3px solid #0066FF' : '3px solid transparent',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  letterSpacing: '0.01em'
                }}
                onMouseEnter={(e) => {
                  if (currentPage !== 'agenda') e.currentTarget.style.color = '#374151';
                }}
                onMouseLeave={(e) => {
                  if (currentPage !== 'agenda') e.currentTarget.style.color = '#6B7280';
                }}
              >
                <ListChecks size={16} />
                Agenda
                {agendaItems.length > 0 && (
                  <span style={{
                    background: currentPage === 'agenda' ? '#0066FF' : '#E5E7EB',
                    color: currentPage === 'agenda' ? 'white' : '#6B7280',
                    fontSize: '11px',
                    fontWeight: 700,
                    padding: '2px 7px',
                    borderRadius: '10px',
                    minWidth: '22px',
                    textAlign: 'center'
                  }}>
                    {agendaItems.length}
                  </span>
                )}
              </button>
              <button
                onClick={() => setCurrentPage('files')}
                style={{
                  padding: '14px 20px',
                  border: 'none',
                  background: 'transparent',
                  fontSize: '14px',
                  fontWeight: 600,
                  color: currentPage === 'files' ? '#0066FF' : '#6B7280',
                  cursor: 'pointer',
                  borderBottom: currentPage === 'files' ? '3px solid #0066FF' : '3px solid transparent',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  letterSpacing: '0.01em'
                }}
                onMouseEnter={(e) => {
                  if (currentPage !== 'files') e.currentTarget.style.color = '#374151';
                }}
                onMouseLeave={(e) => {
                  if (currentPage !== 'files') e.currentTarget.style.color = '#6B7280';
                }}
              >
                <Paperclip size={16} />
                Files
              </button>
            </div>
          </div>

          {/* Panel Content - Scrollable */}
          <div style={{ 
            padding: '0',
            overflowY: 'auto',
            flex: 1,
            background: 'white'
          }}>
            {/* DETAILS PAGE */}
            {currentPage === 'details' && (
              <div style={{ padding: '32px' }}>
                {/* Quick info bar */}
                <div style={{
                  display: 'flex',
                  gap: '20px',
                  padding: '16px',
                  background: '#F9FAFB',
                  borderRadius: '6px',
                  border: '1px solid #E5E7EB',
                  marginBottom: '32px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Calendar size={16} color="#6B7280" />
                    <span style={{ fontSize: '14px', color: '#0A0A0A', fontWeight: 500 }}>
                      {formatDateInput(date)}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Clock size={16} color="#6B7280" />
                    <span style={{ fontSize: '14px', color: '#0A0A0A', fontWeight: 500 }}>
                      {fromTime} - {toTime}
                    </span>
                    <span style={{ fontSize: '13px', color: '#9CA3AF' }}>
                      ({calculateDuration()})
                    </span>
                  </div>
                  {project && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#0066FF' }} />
                      <span style={{ fontSize: '14px', color: '#0A0A0A', fontWeight: 500 }}>
                        {project}
                      </span>
                    </div>
                  )}
                </div>

                {/* Project & Task - Two Column */}
                <div style={{ 
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '16px',
                  marginBottom: '24px'
                }}>
                  <div style={{ position: 'relative' }}>
                    <label style={{ 
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      fontSize: '13px', 
                      fontWeight: 600, 
                      color: '#374151',
                      marginBottom: '8px',
                      letterSpacing: '0.01em'
                    }}>
                      <div style={{ width: '3px', height: '14px', background: '#0066FF', borderRadius: '2px' }} />
                      PROJECT
                    </label>
                    <button
                      onClick={() => setShowProjectDropdown(!showProjectDropdown)}
                      style={{
                        width: '100%',
                        padding: '12px 14px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        border: '1px solid #D1D5DB',
                        borderRadius: '6px',
                        background: 'white',
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: 500,
                        color: project ? '#0A0A0A' : '#9CA3AF',
                        textAlign: 'left'
                      }}
                    >
                      {project || 'Select project...'}
                      <ChevronDown size={16} color="#9CA3AF" />
                    </button>

                    {showProjectDropdown && (
                      <>
                        <div
                          style={{
                            position: 'fixed',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            zIndex: 998
                          }}
                          onClick={() => setShowProjectDropdown(false)}
                        />
                        <div style={{
                          position: 'absolute',
                          top: '72px',
                          left: 0,
                          right: 0,
                          background: 'white',
                          border: '1px solid #E5E7EB',
                          borderRadius: '6px',
                          boxShadow: '0 8px 16px rgba(0,0,0,0.12)',
                          zIndex: 999,
                          maxHeight: '280px',
                          overflow: 'auto'
                        }}>
                          {projects.map(p => (
                            <button
                              key={p}
                              onClick={() => {
                                setProject(p);
                                // Find and set the project ID for fetching tasks
                                const projectData = projectsList.find(proj => proj.name === p);
                                setSelectedProjectId(projectData?.id || null);
                                setTask(''); // Reset task when project changes
                                setShowProjectDropdown(false);
                              }}
                              style={{
                                width: '100%',
                                padding: '12px 14px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                background: project === p ? '#F0F9FF' : 'transparent',
                                border: 'none',
                                fontSize: '14px',
                                color: '#0A0A0A',
                                cursor: 'pointer',
                                textAlign: 'left'
                              }}
                              onMouseEnter={(e) => e.currentTarget.style.background = '#F9FAFB'}
                              onMouseLeave={(e) => e.currentTarget.style.background = project === p ? '#F0F9FF' : 'transparent'}
                            >
                              {p}
                              {project === p && <Check size={16} color="#0066FF" />}
                            </button>
                          ))}
                        </div>
                      </>
                    )}
                  </div>

                  <div style={{ position: 'relative' }}>
                    <label style={{ 
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      fontSize: '13px', 
                      fontWeight: 600, 
                      color: '#374151',
                      marginBottom: '8px',
                      letterSpacing: '0.01em'
                    }}>
                      TASK <span style={{ color: '#9CA3AF', fontWeight: 400, fontSize: '12px' }}>(Optional)</span>
                    </label>
                    <button
                      onClick={() => setShowTaskDropdown(!showTaskDropdown)}
                      style={{
                        width: '100%',
                        padding: '12px 14px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        border: '1px solid #D1D5DB',
                        borderRadius: '6px',
                        background: 'white',
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: 500,
                        color: task ? '#0A0A0A' : '#9CA3AF',
                        textAlign: 'left'
                      }}
                    >
                      {task || 'Select task...'}
                      <ChevronDown size={16} color="#9CA3AF" />
                    </button>

                    {showTaskDropdown && (
                      <>
                        <div
                          style={{
                            position: 'fixed',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            zIndex: 998
                          }}
                          onClick={() => setShowTaskDropdown(false)}
                        />
                        <div style={{
                          position: 'absolute',
                          top: '72px',
                          left: 0,
                          right: 0,
                          background: 'white',
                          border: '1px solid #E5E7EB',
                          borderRadius: '6px',
                          boxShadow: '0 8px 16px rgba(0,0,0,0.12)',
                          zIndex: 999,
                          maxHeight: '280px',
                          overflow: 'auto'
                        }}>
                          {tasks.map(t => (
                            <button
                              key={t}
                              onClick={() => {
                                setTask(t);
                                if (!title) setTitle(t);
                                setShowTaskDropdown(false);
                              }}
                              style={{
                                width: '100%',
                                padding: '12px 14px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                background: task === t ? '#F0F9FF' : 'transparent',
                                border: 'none',
                                fontSize: '14px',
                                color: '#0A0A0A',
                                cursor: 'pointer',
                                textAlign: 'left'
                              }}
                              onMouseEnter={(e) => e.currentTarget.style.background = '#F9FAFB'}
                              onMouseLeave={(e) => e.currentTarget.style.background = task === t ? '#F0F9FF' : 'transparent'}
                            >
                              {t}
                              {task === t && <Check size={16} color="#0066FF" />}
                            </button>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Date & Time - Enhanced Layout */}
                <div style={{ marginBottom: '24px' }}>
                  <label style={{ 
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '13px', 
                    fontWeight: 600, 
                    color: '#374151',
                    marginBottom: '12px',
                    letterSpacing: '0.01em'
                  }}>
                    <div style={{ width: '3px', height: '14px', background: '#0066FF', borderRadius: '2px' }} />
                    DATE & TIME
                  </label>
                  
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1.6fr 1fr 1fr 0.8fr',
                    gap: '12px'
                  }}>
                    <div style={{ position: 'relative' }}>
                      <input
                        type="text"
                        value={formatDateInput(date)}
                        readOnly
                        style={{
                          width: '100%',
                          padding: '12px 40px 12px 14px',
                          border: '1px solid #D1D5DB',
                          borderRadius: '6px',
                          fontSize: '14px',
                          fontWeight: 500,
                          color: '#0A0A0A',
                          background: 'white',
                          cursor: 'pointer'
                        }}
                      />
                      <Calendar 
                        size={18} 
                        color="#6B7280" 
                        style={{
                          position: 'absolute',
                          right: '14px',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          pointerEvents: 'none'
                        }}
                      />
                    </div>

                    <input
                      type="time"
                      value={fromTime}
                      onChange={(e) => setFromTime(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '12px 14px',
                        border: '1px solid #D1D5DB',
                        borderRadius: '6px',
                        fontSize: '14px',
                        fontWeight: 500,
                        color: '#0A0A0A'
                      }}
                    />

                    <input
                      type="time"
                      value={toTime}
                      onChange={(e) => setToTime(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '12px 14px',
                        border: '1px solid #D1D5DB',
                        borderRadius: '6px',
                        fontSize: '14px',
                        fontWeight: 500,
                        color: '#0A0A0A'
                      }}
                    />

                    <div
                      style={{
                        width: '100%',
                        padding: '12px 14px',
                        border: '1px solid #E5E7EB',
                        borderRadius: '6px',
                        fontSize: '14px',
                        fontWeight: 600,
                        color: '#0066FF',
                        background: '#F0F9FF',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      {calculateDuration()}
                    </div>
                  </div>
                </div>

                {/* Timezone & Recurrence */}
                <div style={{ 
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '16px',
                  marginBottom: '24px'
                }}>
                  <div style={{ position: 'relative' }}>
                    <label style={{ 
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      fontSize: '13px', 
                      fontWeight: 500, 
                      color: '#6B7280',
                      marginBottom: '8px'
                    }}>
                      <Globe size={14} />
                      Timezone
                    </label>
                    <button
                      onClick={() => setShowTimezoneDropdown(!showTimezoneDropdown)}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        border: '1px solid #D1D5DB',
                        borderRadius: '6px',
                        background: 'white',
                        cursor: 'pointer',
                        fontSize: '14px',
                        color: '#0A0A0A',
                        textAlign: 'left'
                      }}
                    >
                      {timezone}
                      <ChevronDown size={16} color="#9CA3AF" />
                    </button>
                    {showTimezoneDropdown && (
                      <>
                        <div
                          style={{
                            position: 'fixed',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            zIndex: 998
                          }}
                          onClick={() => setShowTimezoneDropdown(false)}
                        />
                        <div style={{
                          position: 'absolute',
                          top: '68px',
                          left: 0,
                          right: 0,
                          background: 'white',
                          border: '1px solid #E5E7EB',
                          borderRadius: '6px',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                          zIndex: 999,
                          maxHeight: '200px',
                          overflow: 'auto'
                        }}>
                          {['Europe/Madrid', 'Europe/London', 'America/New_York', 'America/Los_Angeles', 'Asia/Tokyo'].map(tz => (
                            <button
                              key={tz}
                              onClick={() => {
                                setTimezone(tz);
                                setShowTimezoneDropdown(false);
                              }}
                              style={{
                                width: '100%',
                                padding: '10px 12px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                background: timezone === tz ? '#F9FAFB' : 'transparent',
                                border: 'none',
                                fontSize: '14px',
                                color: '#0A0A0A',
                                cursor: 'pointer',
                                textAlign: 'left'
                              }}
                              onMouseEnter={(e) => e.currentTarget.style.background = '#F9FAFB'}
                              onMouseLeave={(e) => e.currentTarget.style.background = timezone === tz ? '#F9FAFB' : 'transparent'}
                            >
                              {tz}
                              {timezone === tz && <Check size={16} color="#0066FF" />}
                            </button>
                          ))}
                        </div>
                      </>
                    )}
                  </div>

                  <div style={{ position: 'relative' }}>
                    <label style={{ 
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      fontSize: '13px', 
                      fontWeight: 500, 
                      color: '#6B7280',
                      marginBottom: '8px'
                    }}>
                      <Repeat size={14} />
                      Recurrence
                    </label>
                    <button
                      onClick={() => setShowRecurrenceDropdown(!showRecurrenceDropdown)}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        border: '1px solid #D1D5DB',
                        borderRadius: '6px',
                        background: 'white',
                        cursor: 'pointer',
                        fontSize: '14px',
                        color: recurrence ? '#0A0A0A' : '#9CA3AF',
                        textAlign: 'left'
                      }}
                    >
                      {recurrence || 'Does not repeat'}
                      <ChevronDown size={16} color="#9CA3AF" />
                    </button>
                    {showRecurrenceDropdown && (
                      <>
                        <div
                          style={{
                            position: 'fixed',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            zIndex: 998
                          }}
                          onClick={() => setShowRecurrenceDropdown(false)}
                        />
                        <div style={{
                          position: 'absolute',
                          top: '68px',
                          left: 0,
                          right: 0,
                          background: 'white',
                          border: '1px solid #E5E7EB',
                          borderRadius: '6px',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                          zIndex: 999
                        }}>
                          {['Does not repeat', 'Daily', 'Weekly', 'Monthly', 'Yearly'].map(rec => (
                            <button
                              key={rec}
                              onClick={() => {
                                setRecurrence(rec === 'Does not repeat' ? '' : rec);
                                setShowRecurrenceDropdown(false);
                              }}
                              style={{
                                width: '100%',
                                padding: '10px 12px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                background: recurrence === rec ? '#F9FAFB' : 'transparent',
                                border: 'none',
                                fontSize: '14px',
                                color: '#0A0A0A',
                                cursor: 'pointer',
                                textAlign: 'left'
                              }}
                              onMouseEnter={(e) => e.currentTarget.style.background = '#F9FAFB'}
                              onMouseLeave={(e) => e.currentTarget.style.background = recurrence === rec ? '#F9FAFB' : 'transparent'}
                            >
                              {rec}
                              {recurrence === rec && <Check size={16} color="#0066FF" />}
                            </button>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Location & Meeting Link */}
                <div style={{ 
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '16px',
                  marginBottom: '24px'
                }}>
                  <div>
                    <label style={{ 
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      fontSize: '13px', 
                      fontWeight: 500, 
                      color: '#6B7280',
                      marginBottom: '8px'
                    }}>
                      <MapPin size={14} />
                      Location
                    </label>
                    <input
                      type="text"
                      value={meetingRoom}
                      onChange={(e) => setMeetingRoom(e.target.value)}
                      placeholder="Meeting room or location..."
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        border: '1px solid #D1D5DB',
                        borderRadius: '6px',
                        fontSize: '14px',
                        color: '#0A0A0A'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ 
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      fontSize: '13px', 
                      fontWeight: 500, 
                      color: '#6B7280',
                      marginBottom: '8px'
                    }}>
                      <Video size={14} />
                      Meeting Link
                    </label>
                    <input
                      type="text"
                      value={meetingLink}
                      onChange={(e) => setMeetingLink(e.target.value)}
                      placeholder="Zoom, Meet, Teams..."
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        border: '1px solid #D1D5DB',
                        borderRadius: '6px',
                        fontSize: '14px',
                        color: '#0A0A0A'
                      }}
                    />
                  </div>
                </div>

                {/* Guests */}
                <div style={{ marginBottom: '24px' }}>
                  <label style={{ 
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontSize: '13px', 
                    fontWeight: 500, 
                    color: '#6B7280',
                    marginBottom: '8px'
                  }}>
                    <Users size={14} />
                    Guests
                  </label>
                  <input
                    type="text"
                    value={guestSearch}
                    onChange={(e) => setGuestSearch(e.target.value)}
                    placeholder="Add guests by email or name..."
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: '1px solid #D1D5DB',
                      borderRadius: '6px',
                      fontSize: '14px',
                      color: '#0A0A0A'
                    }}
                  />
                </div>

                {/* Alert & Importance */}
                <div style={{ 
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '16px',
                  marginBottom: '24px'
                }}>
                  <div style={{ position: 'relative' }}>
                    <label style={{ 
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      fontSize: '13px', 
                      fontWeight: 500, 
                      color: '#6B7280',
                      marginBottom: '8px'
                    }}>
                      <Bell size={14} />
                      Alert
                    </label>
                    <button
                      onClick={() => setShowAlertDropdown(!showAlertDropdown)}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        border: '1px solid #D1D5DB',
                        borderRadius: '6px',
                        background: 'white',
                        cursor: 'pointer',
                        fontSize: '14px',
                        color: '#0A0A0A',
                        textAlign: 'left'
                      }}
                    >
                      {alert}
                      <ChevronDown size={16} color="#9CA3AF" />
                    </button>
                    {showAlertDropdown && (
                      <>
                        <div
                          style={{
                            position: 'fixed',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            zIndex: 998
                          }}
                          onClick={() => setShowAlertDropdown(false)}
                        />
                        <div style={{
                          position: 'absolute',
                          top: '68px',
                          left: 0,
                          right: 0,
                          background: 'white',
                          border: '1px solid #E5E7EB',
                          borderRadius: '6px',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                          zIndex: 999
                        }}>
                          {['No alert', '5 minutes before', '15 minutes before', '30 minutes before', '1 hour before', '1 day before'].map(alertOption => (
                            <button
                              key={alertOption}
                              onClick={() => {
                                setAlert(alertOption);
                                setShowAlertDropdown(false);
                              }}
                              style={{
                                width: '100%',
                                padding: '10px 12px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                background: alert === alertOption ? '#F9FAFB' : 'transparent',
                                border: 'none',
                                fontSize: '14px',
                                color: '#0A0A0A',
                                cursor: 'pointer',
                                textAlign: 'left'
                              }}
                              onMouseEnter={(e) => e.currentTarget.style.background = '#F9FAFB'}
                              onMouseLeave={(e) => e.currentTarget.style.background = alert === alertOption ? '#F9FAFB' : 'transparent'}
                            >
                              {alertOption}
                              {alert === alertOption && <Check size={16} color="#0066FF" />}
                            </button>
                          ))}
                        </div>
                      </>
                    )}
                  </div>

                  <div>
                    <label style={{ 
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      fontSize: '13px', 
                      fontWeight: 500, 
                      color: '#6B7280',
                      marginBottom: '8px'
                    }}>
                      Importance
                    </label>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <button
                        onClick={() => setImportance('low')}
                        style={{
                          flex: 1,
                          padding: '10px',
                          border: importance === 'low' ? '2px solid #10B981' : '1px solid #D1D5DB',
                          borderRadius: '6px',
                          background: importance === 'low' ? '#ECFDF5' : 'white',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px'
                        }}
                      >
                        <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#10B981' }} />
                        <span style={{ fontSize: '13px', fontWeight: 500, color: '#0A0A0A' }}>Low</span>
                      </button>
                      <button
                        onClick={() => setImportance('medium')}
                        style={{
                          flex: 1,
                          padding: '10px',
                          border: importance === 'medium' ? '2px solid #F59E0B' : '1px solid #D1D5DB',
                          borderRadius: '6px',
                          background: importance === 'medium' ? '#FFFBEB' : 'white',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px'
                        }}
                      >
                        <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#F59E0B' }} />
                        <span style={{ fontSize: '13px', fontWeight: 500, color: '#0A0A0A' }}>Med</span>
                      </button>
                      <button
                        onClick={() => setImportance('high')}
                        style={{
                          flex: 1,
                          padding: '10px',
                          border: importance === 'high' ? '2px solid #EF4444' : '1px solid #D1D5DB',
                          borderRadius: '6px',
                          background: importance === 'high' ? '#FEF2F2' : 'white',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px'
                        }}
                      >
                        <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#EF4444' }} />
                        <span style={{ fontSize: '13px', fontWeight: 500, color: '#0A0A0A' }}>High</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Privacy & External Toggles */}
                <div style={{
                  display: 'flex',
                  gap: '16px',
                  marginBottom: '24px',
                  padding: '16px',
                  background: '#F9FAFB',
                  borderRadius: '6px',
                  border: '1px solid #E5E7EB'
                }}>
                  <label style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    cursor: 'pointer'
                  }}>
                    <input
                      type="checkbox"
                      checked={isPrivate}
                      onChange={(e) => setIsPrivate(e.target.checked)}
                      style={{
                        width: '20px',
                        height: '20px',
                        cursor: 'pointer',
                        accentColor: '#0066FF'
                      }}
                    />
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: 500, color: '#0A0A0A', marginBottom: '2px' }}>
                        Private Event
                      </div>
                      <div style={{ fontSize: '12px', color: '#9CA3AF' }}>
                        Only visible to you
                      </div>
                    </div>
                  </label>

                  <label style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    cursor: 'pointer'
                  }}>
                    <input
                      type="checkbox"
                      checked={isExternalMeeting}
                      onChange={(e) => setIsExternalMeeting(e.target.checked)}
                      style={{
                        width: '20px',
                        height: '20px',
                        cursor: 'pointer',
                        accentColor: '#0066FF'
                      }}
                    />
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: 500, color: '#0A0A0A', marginBottom: '2px' }}>
                        External Meeting
                      </div>
                      <div style={{ fontSize: '12px', color: '#9CA3AF' }}>
                        With external guests
                      </div>
                    </div>
                  </label>
                </div>

                {/* Timesheet & Billable */}
                <div style={{
                  display: 'flex',
                  gap: '16px',
                  marginBottom: '28px',
                  padding: '16px',
                  background: '#F0F9FF',
                  borderRadius: '6px',
                  border: '1px solid #BFDBFE'
                }}>
                  <label style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    cursor: 'pointer'
                  }}>
                    <input
                      type="checkbox"
                      checked={isTimesheet}
                      onChange={(e) => setIsTimesheet(e.target.checked)}
                      style={{
                        width: '20px',
                        height: '20px',
                        cursor: 'pointer',
                        accentColor: '#0066FF'
                      }}
                    />
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: 500, color: '#0A0A0A', marginBottom: '2px' }}>
                        Include in Timesheet
                      </div>
                      <div style={{ fontSize: '12px', color: '#6B7280' }}>
                        Count towards work hours
                      </div>
                    </div>
                  </label>

                  <label style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    cursor: 'pointer'
                  }}>
                    <input
                      type="checkbox"
                      checked={isBillable}
                      onChange={(e) => setIsBillable(e.target.checked)}
                      style={{
                        width: '20px',
                        height: '20px',
                        cursor: 'pointer',
                        accentColor: '#0066FF'
                      }}
                    />
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: 500, color: '#0A0A0A', marginBottom: '2px' }}>
                        Billable Time
                      </div>
                      <div style={{ fontSize: '12px', color: '#6B7280' }}>
                        Track for client invoicing
                      </div>
                    </div>
                  </label>
                </div>

                {/* Description */}
                <div style={{ marginBottom: '28px' }}>
                  <label style={{ 
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '13px', 
                    fontWeight: 600, 
                    color: '#374151',
                    marginBottom: '8px',
                    letterSpacing: '0.01em'
                  }}>
                    <div style={{ width: '3px', height: '14px', background: '#0066FF', borderRadius: '2px' }} />
                    DESCRIPTION
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Add meeting notes, objectives, or any relevant details..."
                    rows={4}
                    style={{
                      width: '100%',
                      padding: '12px 14px',
                      border: '1px solid #D1D5DB',
                      borderRadius: '6px',
                      fontSize: '14px',
                      lineHeight: '1.6',
                      color: '#0A0A0A',
                      fontFamily: 'Inter, sans-serif',
                      resize: 'vertical'
                    }}
                  />
                </div>
              </div>
            )}

            {/* COMMENTS PAGE */}
            {currentPage === 'comments' && (
              <EventComments
                comments={comments}
                commentText={commentText}
                replyingTo={replyingTo}
                editingCommentId={editingCommentId}
                editText={editText}
                showMentions={showMentions}
                mentionQuery={mentionQuery}
                teamMembers={teamMembers}
                attachments={pendingAttachments}
                onCommentChange={handleCommentChange}
                onAddComment={addComment}
                onStartEdit={startEditComment}
                onSaveEdit={saveEditComment}
                onCancelEdit={() => {
                  setEditingCommentId(null);
                  setEditText('');
                }}
                onDelete={deleteComment}
                onStartReply={(commentId) => {
                  setReplyingTo(commentId);
                  setCommentText('');
                }}
                onCancelReply={() => setReplyingTo(null)}
                onEditTextChange={setEditText}
                onInsertMention={insertMention}
                onAddAttachment={handleAddAttachment}
                onRemoveAttachment={handleRemoveAttachment}
                onPaste={handlePaste}
              />
            )}

            {/* AGENDA PAGE */}
            {currentPage === 'agenda' && (
              <div style={{ padding: '32px', display: 'flex', flexDirection: 'column', height: '100%' }}>
                {/* Summary Bar */}
                {agendaItems.length > 0 && (
                  <div style={{
                    display: 'flex',
                    gap: '16px',
                    padding: '20px',
                    background: '#F0F9FF',
                    borderRadius: '8px',
                    border: '1px solid #BFDBFE',
                    marginBottom: '24px'
                  }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '12px', color: '#6B7280', marginBottom: '4px', fontWeight: 500 }}>
                        MEETING DURATION
                      </div>
                      <div style={{ fontSize: '20px', fontWeight: 600, color: '#0A0A0A' }}>
                        {formatMinutes(getMeetingDurationMinutes())}
                      </div>
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '12px', color: '#6B7280', marginBottom: '4px', fontWeight: 500 }}>
                        AGENDA TIME
                      </div>
                      <div style={{ fontSize: '20px', fontWeight: 600, color: calculateTotalAgendaTime() > getMeetingDurationMinutes() ? '#EF4444' : '#0066FF' }}>
                        {formatMinutes(calculateTotalAgendaTime())}
                      </div>
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '12px', color: '#6B7280', marginBottom: '4px', fontWeight: 500 }}>
                        ITEMS
                      </div>
                      <div style={{ fontSize: '20px', fontWeight: 600, color: '#0A0A0A' }}>
                        {agendaItems.filter(item => item.completed).length} / {agendaItems.length}
                      </div>
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '12px', color: '#6B7280', marginBottom: '4px', fontWeight: 500 }}>
                        PROGRESS
                      </div>
                      <div style={{ fontSize: '20px', fontWeight: 600, color: '#10B981' }}>
                        {agendaItems.length > 0 ? Math.round((agendaItems.filter(item => item.completed).length / agendaItems.length) * 100) : 0}%
                      </div>
                    </div>
                  </div>
                )}

                {/* Add Item Input */}
                <div style={{ marginBottom: '24px' }}>
                  <input
                    type="text"
                    value={newAgendaItem}
                    onChange={(e) => setNewAgendaItem(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        addAgendaItem();
                      }
                    }}
                    placeholder="+ Add agenda item and press Enter"
                    style={{
                      width: '100%',
                      padding: '14px 16px',
                      border: '2px solid #D1D5DB',
                      borderRadius: '6px',
                      fontSize: '14px',
                      fontWeight: 500,
                      color: '#0A0A0A',
                      fontFamily: 'Inter, sans-serif'
                    }}
                  />
                </div>

                {agendaItems.length === 0 ? (
                  <div style={{
                    padding: '80px 0',
                    textAlign: 'center'
                  }}>
                    <ListChecks size={48} color="#D1D5DB" style={{ margin: '0 auto 20px' }} />
                    <div style={{ 
                      fontSize: '16px',
                      fontWeight: 600,
                      color: '#9CA3AF',
                      marginBottom: '8px'
                    }}>
                      No agenda items yet
                    </div>
                    <div style={{ fontSize: '14px', color: '#D1D5DB' }}>
                      Add items to structure your meeting
                    </div>
                  </div>
                ) : (
                  <div style={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    gap: '8px'
                  }}>
                    {agendaItems.map((item, index) => (
                      <div 
                        key={item.id}
                        style={{
                          borderRadius: '8px',
                          background: item.completed ? '#F9FAFB' : 'white',
                          border: item.completed ? '1px solid #E5E7EB' : '1px solid #D1D5DB',
                          position: 'relative',
                          overflow: 'visible'
                        }}
                      >
                        {/* Main Row */}
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            padding: '16px',
                            position: 'relative'
                          }}
                          onMouseEnter={(e) => {
                            const deleteBtn = e.currentTarget.parentElement?.querySelector('[data-delete-btn]') as HTMLElement;
                            if (deleteBtn) deleteBtn.style.opacity = '1';
                          }}
                          onMouseLeave={(e) => {
                            const deleteBtn = e.currentTarget.parentElement?.querySelector('[data-delete-btn]') as HTMLElement;
                            if (deleteBtn) deleteBtn.style.opacity = '0';
                          }}
                        >
                          {/* Drag Handle */}
                          <div style={{
                            color: '#9CA3AF',
                            cursor: 'grab',
                            display: 'flex',
                            alignItems: 'center'
                          }}>
                            <GripVertical size={20} />
                          </div>

                          {/* Checkbox */}
                          <input
                            type="checkbox"
                            checked={item.completed}
                            onChange={(e) => updateAgendaItem(item.id, { completed: e.target.checked })}
                            style={{
                              width: '20px',
                              height: '20px',
                              cursor: 'pointer',
                              accentColor: '#10B981',
                              flexShrink: 0
                            }}
                          />

                          {/* Number Badge */}
                          <div style={{
                            width: '28px',
                            height: '28px',
                            borderRadius: '50%',
                            background: item.completed ? '#10B981' : '#0066FF',
                            color: 'white',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '13px',
                            fontWeight: 600,
                            flexShrink: 0
                          }}>
                            {index + 1}
                          </div>

                          {/* Title */}
                          {editingAgendaId === item.id ? (
                            <input
                              type="text"
                              value={editingAgendaTitle}
                              onChange={(e) => setEditingAgendaTitle(e.target.value)}
                              onBlur={finishEditingAgenda}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  finishEditingAgenda();
                                }
                                if (e.key === 'Escape') {
                                  setEditingAgendaId(null);
                                  setEditingAgendaTitle('');
                                }
                              }}
                              autoFocus
                              style={{
                                flex: 1,
                                padding: '8px 10px',
                                border: '1px solid #0066FF',
                                borderRadius: '4px',
                                fontSize: '14px',
                                color: '#0A0A0A',
                                background: 'white',
                                outline: 'none',
                                fontWeight: 500
                              }}
                            />
                          ) : (
                            <div
                              onClick={() => startEditingAgenda(item.id, item.title)}
                              style={{
                                flex: 1,
                                fontSize: '14px',
                                fontWeight: 500,
                                color: item.completed ? '#9CA3AF' : '#0A0A0A',
                                cursor: 'text',
                                padding: '8px 10px',
                                textDecoration: item.completed ? 'line-through' : 'none'
                              }}
                            >
                              {item.title}
                            </div>
                          )}

                          {/* Time Allocation */}
                          <div style={{ position: 'relative' }}>
                            <button
                              onClick={() => {
                                setAgendaDropdownId(agendaDropdownId === item.id && agendaDropdownType === 'time' ? null : item.id);
                                setAgendaDropdownType('time');
                              }}
                              style={{
                                padding: '7px 12px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                border: '1px solid #D1D5DB',
                                borderRadius: '6px',
                                background: 'white',
                                cursor: 'pointer',
                                fontSize: '13px',
                                fontWeight: 600,
                                color: item.timeAllocation ? '#0A0A0A' : '#9CA3AF'
                              }}
                            >
                              <Clock size={14} />
                              {item.timeAllocation || '—'}
                            </button>

                          {agendaDropdownId === item.id && agendaDropdownType === 'time' && (
                            <>
                              <div
                                style={{
                                  position: 'fixed',
                                  top: 0,
                                  left: 0,
                                  right: 0,
                                  bottom: 0,
                                  zIndex: 998
                                }}
                                onClick={() => {
                                  setAgendaDropdownId(null);
                                  setAgendaDropdownType(null);
                                }}
                              />
                              <div style={{
                                position: 'absolute',
                                top: '36px',
                                right: 0,
                                background: 'white',
                                border: '1px solid #E5E7EB',
                                borderRadius: '6px',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                                zIndex: 999,
                                minWidth: '100px'
                              }}>
                                {timeAllocations.map(time => (
                                  <button
                                    key={time}
                                    onClick={() => {
                                      updateAgendaItem(item.id, { timeAllocation: time });
                                      setAgendaDropdownId(null);
                                      setAgendaDropdownType(null);
                                    }}
                                    style={{
                                      width: '100%',
                                      padding: '8px 12px',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'space-between',
                                      background: item.timeAllocation === time ? '#F9FAFB' : 'transparent',
                                      border: 'none',
                                      fontSize: '14px',
                                      color: '#0A0A0A',
                                      cursor: 'pointer',
                                      textAlign: 'left'
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.background = '#F9FAFB'}
                                    onMouseLeave={(e) => e.currentTarget.style.background = item.timeAllocation === time ? '#F9FAFB' : 'transparent'}
                                  >
                                    {time}
                                    {item.timeAllocation === time && <Check size={14} color="#0066FF" />}
                                  </button>
                                ))}
                              </div>
                            </>
                          )}
                        </div>

                          {/* Presenter */}
                          <div style={{ position: 'relative' }}>
                            <button
                              onClick={() => {
                                setAgendaDropdownId(agendaDropdownId === item.id && agendaDropdownType === 'presenter' ? null : item.id);
                                setAgendaDropdownType('presenter');
                              }}
                              style={{
                                padding: '7px 12px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                border: '1px solid #D1D5DB',
                                borderRadius: '6px',
                                background: 'white',
                                cursor: 'pointer',
                                fontSize: '13px',
                                fontWeight: 600,
                                color: item.presenter ? '#0A0A0A' : '#9CA3AF',
                                minWidth: '120px'
                              }}
                            >
                              <User size={14} />
                              {item.presenter ? item.presenter.split(' ')[0] : '—'}
                            </button>

                          {agendaDropdownId === item.id && agendaDropdownType === 'presenter' && (
                            <>
                              <div
                                style={{
                                  position: 'fixed',
                                  top: 0,
                                  left: 0,
                                  right: 0,
                                  bottom: 0,
                                  zIndex: 998
                                }}
                                onClick={() => {
                                  setAgendaDropdownId(null);
                                  setAgendaDropdownType(null);
                                }}
                              />
                              <div style={{
                                position: 'absolute',
                                top: '36px',
                                right: 0,
                                background: 'white',
                                border: '1px solid #E5E7EB',
                                borderRadius: '6px',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                                zIndex: 999,
                                minWidth: '160px'
                              }}>
                                {presenters.map(presenter => (
                                  <button
                                    key={presenter}
                                    onClick={() => {
                                      updateAgendaItem(item.id, { presenter });
                                      setAgendaDropdownId(null);
                                      setAgendaDropdownType(null);
                                    }}
                                    style={{
                                      width: '100%',
                                      padding: '8px 12px',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'space-between',
                                      background: item.presenter === presenter ? '#F9FAFB' : 'transparent',
                                      border: 'none',
                                      fontSize: '14px',
                                      color: '#0A0A0A',
                                      cursor: 'pointer',
                                      textAlign: 'left'
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.background = '#F9FAFB'}
                                    onMouseLeave={(e) => e.currentTarget.style.background = item.presenter === presenter ? '#F9FAFB' : 'transparent'}
                                  >
                                    {presenter}
                                    {item.presenter === presenter && <Check size={14} color="#0066FF" />}
                                  </button>
                                ))}
                              </div>
                            </>
                          )}
                        </div>

                          {/* Expand/Collapse Button */}
                          <button
                            onClick={() => updateAgendaItem(item.id, { isExpanded: !item.isExpanded })}
                            style={{
                              width: '32px',
                              height: '32px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              border: '1px solid #D1D5DB',
                              background: 'white',
                              cursor: 'pointer',
                              borderRadius: '6px',
                              color: '#6B7280',
                              transition: 'all 150ms'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.background = '#F9FAFB'}
                            onMouseLeave={(e) => e.currentTarget.style.background = 'white'}
                          >
                            <ChevronDown 
                              size={16} 
                              style={{ 
                                transform: item.isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                                transition: 'transform 150ms'
                              }} 
                            />
                          </button>

                          {/* Delete Button */}
                          <button
                            data-delete-btn
                            onClick={() => deleteAgendaItem(item.id)}
                            style={{
                              width: '32px',
                              height: '32px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              border: 'none',
                              background: 'transparent',
                              cursor: 'pointer',
                              borderRadius: '6px',
                              color: '#EF4444',
                              opacity: 0,
                              transition: 'opacity 150ms, background 150ms'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.background = '#FEE2E2'}
                            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>

                        {/* Expandable Notes & Actions Section */}
                        {item.isExpanded && (
                          <div style={{
                            padding: '16px',
                            borderTop: '1px solid #E5E7EB',
                            background: '#FAFBFC'
                          }}>
                            {/* Notes */}
                            <div style={{ marginBottom: '20px' }}>
                              <label style={{
                                display: 'block',
                                fontSize: '12px',
                                fontWeight: 600,
                                color: '#6B7280',
                                marginBottom: '8px',
                                letterSpacing: '0.02em'
                              }}>
                                DISCUSSION NOTES
                              </label>
                              <textarea
                                value={item.notes}
                                onChange={(e) => updateAgendaItem(item.id, { notes: e.target.value })}
                                placeholder="Add notes, talking points, or details for this agenda item..."
                                rows={3}
                                style={{
                                  width: '100%',
                                  padding: '12px',
                                  border: '1px solid #D1D5DB',
                                  borderRadius: '6px',
                                  fontSize: '13px',
                                  color: '#0A0A0A',
                                  fontFamily: 'Inter, sans-serif',
                                  resize: 'vertical',
                                  lineHeight: '1.6',
                                  background: 'white'
                                }}
                              />
                            </div>

                            {/* Action Items */}
                            <div>
                              <label style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                fontSize: '12px',
                                fontWeight: 600,
                                color: '#6B7280',
                                marginBottom: '12px',
                                letterSpacing: '0.02em'
                              }}>
                                ACTION ITEMS
                                {item.actions.length > 0 && (
                                  <span style={{
                                    background: '#0066FF',
                                    color: 'white',
                                    fontSize: '11px',
                                    fontWeight: 700,
                                    padding: '2px 8px',
                                    borderRadius: '10px'
                                  }}>
                                    {item.actions.filter(a => a.completed).length}/{item.actions.length}
                                  </span>
                                )}
                              </label>

                              {/* Action Items List */}
                              {item.actions.length > 0 && (
                                <div style={{
                                  display: 'flex',
                                  flexDirection: 'column',
                                  gap: '8px',
                                  marginBottom: '12px'
                                }}>
                                  {item.actions.map(action => (
                                    <div
                                      key={action.id}
                                      style={{
                                        display: 'flex',
                                        alignItems: 'flex-start',
                                        gap: '10px',
                                        padding: '12px',
                                        background: 'white',
                                        borderRadius: '6px',
                                        border: '1px solid #E5E7EB'
                                      }}
                                    >
                                      <input
                                        type="checkbox"
                                        checked={action.completed}
                                        onChange={(e) => updateAction(item.id, action.id, { completed: e.target.checked })}
                                        style={{
                                          width: '18px',
                                          height: '18px',
                                          cursor: 'pointer',
                                          accentColor: '#10B981',
                                          marginTop: '2px',
                                          flexShrink: 0
                                        }}
                                      />
                                      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                        <input
                                          type="text"
                                          value={action.text}
                                          onChange={(e) => updateAction(item.id, action.id, { text: e.target.value })}
                                          onFocus={(e) => {
                                            if (action.text === 'New action item') {
                                              updateAction(item.id, action.id, { text: '' });
                                            }
                                          }}
                                          style={{
                                            width: '100%',
                                            padding: '8px 10px',
                                            border: '1px solid #E5E7EB',
                                            borderRadius: '4px',
                                            fontSize: '13px',
                                            fontWeight: 400,
                                            color: action.completed ? '#9CA3AF' : '#6B7280',
                                            textDecoration: action.completed ? 'line-through' : 'none',
                                            background: '#F9FAFB',
                                            outline: 'none'
                                          }}
                                          placeholder="Action item..."
                                        />
                                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', position: 'relative' }}>
                                          <div style={{ flex: 1, position: 'relative' }}>
                                            <input
                                              type="text"
                                              value={action.assignedTo}
                                              onChange={(e) => updateAction(item.id, action.id, { assignedTo: e.target.value })}
                                              onFocus={() => setAssigneeDropdownId(action.id)}
                                              placeholder="Assign to..."
                                              style={{
                                                width: '100%',
                                                padding: '6px 8px',
                                                border: '1px solid #E5E7EB',
                                                borderRadius: '4px',
                                                fontSize: '12px',
                                                color: '#6B7280',
                                                background: '#F9FAFB'
                                              }}
                                            />
                                            {assigneeDropdownId === action.id && (
                                              <>
                                                <div
                                                  style={{
                                                    position: 'fixed',
                                                    top: 0,
                                                    left: 0,
                                                    right: 0,
                                                    bottom: 0,
                                                    zIndex: 998
                                                  }}
                                                  onClick={() => setAssigneeDropdownId(null)}
                                                />
                                                <div style={{
                                                  position: 'absolute',
                                                  bottom: '32px',
                                                  left: 0,
                                                  right: 0,
                                                  background: 'white',
                                                  border: '1px solid #E5E7EB',
                                                  borderRadius: '6px',
                                                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                                                  zIndex: 999,
                                                  maxHeight: '200px',
                                                  overflow: 'auto'
                                                }}>
                                                  {agendaTeamMembers
                                                    .filter(member => 
                                                      !action.assignedTo || 
                                                      member.toLowerCase().includes(action.assignedTo.toLowerCase())
                                                    )
                                                    .map(member => (
                                                      <button
                                                        key={member}
                                                        onClick={() => {
                                                          updateAction(item.id, action.id, { assignedTo: member });
                                                          setAssigneeDropdownId(null);
                                                        }}
                                                        style={{
                                                          width: '100%',
                                                          padding: '8px 12px',
                                                          display: 'flex',
                                                          alignItems: 'center',
                                                          gap: '8px',
                                                          background: action.assignedTo === member ? '#F9FAFB' : 'transparent',
                                                          border: 'none',
                                                          fontSize: '13px',
                                                          color: '#0A0A0A',
                                                          cursor: 'pointer',
                                                          textAlign: 'left'
                                                        }}
                                                        onMouseEnter={(e) => e.currentTarget.style.background = '#F9FAFB'}
                                                        onMouseLeave={(e) => e.currentTarget.style.background = action.assignedTo === member ? '#F9FAFB' : 'transparent'}
                                                      >
                                                        <div style={{
                                                          width: '24px',
                                                          height: '24px',
                                                          borderRadius: '50%',
                                                          background: '#0066FF',
                                                          color: 'white',
                                                          display: 'flex',
                                                          alignItems: 'center',
                                                          justifyContent: 'center',
                                                          fontSize: '11px',
                                                          fontWeight: 600,
                                                          flexShrink: 0
                                                        }}>
                                                          {member.split(' ').map(n => n[0]).join('')}
                                                        </div>
                                                        {member}
                                                        {action.assignedTo === member && <Check size={14} color="#0066FF" style={{ marginLeft: 'auto' }} />}
                                                      </button>
                                                    ))}
                                                </div>
                                              </>
                                            )}
                                          </div>
                                          <input
                                            type="date"
                                            value={action.dueDate}
                                            onChange={(e) => updateAction(item.id, action.id, { dueDate: e.target.value })}
                                            style={{
                                              padding: '6px 8px',
                                              border: '1px solid #E5E7EB',
                                              borderRadius: '4px',
                                              fontSize: '12px',
                                              color: '#6B7280',
                                              background: '#F9FAFB',
                                              cursor: 'pointer'
                                            }}
                                          />
                                          <button
                                            onClick={() => deleteAction(item.id, action.id)}
                                            style={{
                                              width: '28px',
                                              height: '28px',
                                              display: 'flex',
                                              alignItems: 'center',
                                              justifyContent: 'center',
                                              border: 'none',
                                              background: 'transparent',
                                              cursor: 'pointer',
                                              borderRadius: '4px',
                                              color: '#EF4444'
                                            }}
                                            onMouseEnter={(e) => e.currentTarget.style.background = '#FEE2E2'}
                                            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                          >
                                            <X size={14} />
                                          </button>
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}

                              {/* Add Action Button */}
                              <button
                                onClick={() => addActionToAgendaItem(item.id, 'New action item')}
                                style={{
                                  width: '100%',
                                  padding: '10px',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  gap: '6px',
                                  border: '1px dashed #D1D5DB',
                                  borderRadius: '6px',
                                  background: 'white',
                                  cursor: 'pointer',
                                  fontSize: '13px',
                                  fontWeight: 500,
                                  color: '#6B7280'
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.borderColor = '#0066FF';
                                  e.currentTarget.style.color = '#0066FF';
                                  e.currentTarget.style.background = '#F0F9FF';
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.borderColor = '#D1D5DB';
                                  e.currentTarget.style.color = '#6B7280';
                                  e.currentTarget.style.background = 'white';
                                }}
                              >
                                + Add Action Item
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Generate Action Document Button */}
                {agendaItems.length > 0 && getTotalActionCount() > 0 && (
                  <div style={{
                    padding: '24px 32px',
                    borderTop: '1px solid #E5E7EB',
                    background: '#FAFBFC',
                    marginTop: 'auto'
                  }}>
                    <button
                      onClick={() => setShowActionDocument(true)}
                      style={{
                        width: '100%',
                        padding: '14px 24px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '10px',
                        border: 'none',
                        borderRadius: '6px',
                        background: '#0066FF',
                        color: 'white',
                        fontSize: '14px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        boxShadow: '0 2px 4px rgba(0, 102, 255, 0.2)'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = '#0052CC';
                        e.currentTarget.style.boxShadow = '0 4px 8px rgba(0, 102, 255, 0.3)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = '#0066FF';
                        e.currentTarget.style.boxShadow = '0 2px 4px rgba(0, 102, 255, 0.2)';
                      }}
                    >
                      <FileText size={18} />
                      Generate Action Document ({getTotalActionCount()} {getTotalActionCount() === 1 ? 'item' : 'items'})
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* FILES PAGE */}
            {currentPage === 'files' && (
              <div style={{
                padding: '32px'
              }}>
                {attachments.length === 0 ? (
                  <div style={{
                    minHeight: '400px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <div style={{ textAlign: 'center', maxWidth: '400px' }}>
                      <Paperclip size={56} color="#D1D5DB" style={{ margin: '0 auto 24px' }} />
                      <div style={{ 
                        fontSize: '18px',
                        fontWeight: 600,
                        color: '#9CA3AF',
                        marginBottom: '12px'
                      }}>
                        No files attached
                      </div>
                      <div style={{ fontSize: '14px', color: '#D1D5DB', marginBottom: '28px', lineHeight: '1.6' }}>
                        Attach meeting documents, presentations, or resources to share with attendees
                      </div>
                      <button
                        style={{
                          padding: '12px 32px',
                          borderRadius: '6px',
                          border: '1px solid #D1D5DB',
                          background: 'white',
                          color: '#374151',
                          fontSize: '14px',
                          fontWeight: 600,
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '8px'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = '#F9FAFB';
                          e.currentTarget.style.borderColor = '#0066FF';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'white';
                          e.currentTarget.style.borderColor = '#D1D5DB';
                        }}
                      >
                        <Paperclip size={16} />
                        Upload File
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '24px'
                    }}>
                      <div>
                        <div style={{ fontSize: '18px', fontWeight: 600, color: '#0A0A0A', marginBottom: '4px' }}>
                          Attachments
                        </div>
                        <div style={{ fontSize: '13px', color: '#6B7280' }}>
                          {attachments.length} {attachments.length === 1 ? 'file' : 'files'} attached
                        </div>
                      </div>
                      <button
                        style={{
                          padding: '10px 20px',
                          borderRadius: '6px',
                          border: '1px solid #D1D5DB',
                          background: 'white',
                          color: '#374151',
                          fontSize: '13px',
                          fontWeight: 600,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = '#F9FAFB';
                          e.currentTarget.style.borderColor = '#0066FF';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'white';
                          e.currentTarget.style.borderColor = '#D1D5DB';
                        }}
                      >
                        <Paperclip size={14} />
                        Add File
                      </button>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {attachments.map(attachment => (
                        <div
                          key={attachment.id}
                          style={{
                            padding: '16px',
                            background: '#F9FAFB',
                            border: '1px solid #E5E7EB',
                            borderRadius: '6px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            cursor: attachment.content ? 'pointer' : 'default',
                            transition: 'all 0.2s'
                          }}
                          onClick={() => {
                            if (attachment.content) {
                              // Download the document when clicked
                              const blob = new Blob([attachment.content], { type: 'application/msword' });
                              const url = URL.createObjectURL(blob);
                              const link = document.createElement('a');
                              link.href = url;
                              link.download = attachment.name;
                              document.body.appendChild(link);
                              link.click();
                              document.body.removeChild(link);
                              URL.revokeObjectURL(url);
                              toast.success('Document downloaded');
                            }
                          }}
                          onMouseEnter={(e) => {
                            if (attachment.content) {
                              e.currentTarget.style.background = '#F3F4F6';
                              e.currentTarget.style.borderColor = '#0066FF';
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (attachment.content) {
                              e.currentTarget.style.background = '#F9FAFB';
                              e.currentTarget.style.borderColor = '#E5E7EB';
                            }
                          }}
                        >
                          <div style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '6px',
                            background: '#0066FF',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0
                          }}>
                            <FileText size={20} color="white" />
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{
                              fontSize: '14px',
                              fontWeight: 600,
                              color: '#0A0A0A',
                              marginBottom: '4px',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap'
                            }}>
                              {attachment.name}
                            </div>
                            <div style={{
                              fontSize: '12px',
                              color: '#6B7280',
                              display: 'flex',
                              gap: '12px'
                            }}>
                              <span>{attachment.type}</span>
                              <span>•</span>
                              <span>{attachment.size}</span>
                              <span>•</span>
                              <span>{new Date(attachment.date).toLocaleDateString()}</span>
                              {attachment.content && (
                                <>
                                  <span>•</span>
                                  <span style={{ color: '#0066FF', fontWeight: 500 }}>Click to download</span>
                                </>
                              )}
                            </div>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation(); // Prevent triggering the parent div's onClick
                              setAttachments(attachments.filter(a => a.id !== attachment.id));
                              toast.success('Attachment removed');
                            }}
                            style={{
                              padding: '8px',
                              borderRadius: '4px',
                              border: 'none',
                              background: 'transparent',
                              color: '#9CA3AF',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = '#FEE2E2';
                              e.currentTarget.style.color = '#DC2626';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = 'transparent';
                              e.currentTarget.style.color = '#9CA3AF';
                            }}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Panel Footer */}
          <div style={{
            padding: '20px 32px',
            borderTop: '1px solid #E5E7EB',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '12px',
            background: '#FAFBFC'
          }}>
            {isEditing && onDelete && (
              <button
                onClick={() => {
                  if (event?.id) {
                    onDelete(event.id);
                    onClose();
                  }
                }}
                style={{
                  padding: '10px 20px',
                  borderRadius: '6px',
                  border: '1px solid #FCA5A5',
                  background: 'white',
                  color: '#DC2626',
                  fontSize: '14px',
                  fontWeight: 500,
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#FEE2E2';
                  e.currentTarget.style.borderColor = '#DC2626';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'white';
                  e.currentTarget.style.borderColor = '#FCA5A5';
                }}
              >
                Delete Event
              </button>
            )}
            
            <div style={{ marginLeft: 'auto', display: 'flex', gap: '12px' }}>
              <button
                onClick={onClose}
                style={{
                  padding: '12px 28px',
                  borderRadius: '6px',
                  border: '1px solid #D1D5DB',
                  background: 'white',
                  color: '#6B7280',
                  fontSize: '14px',
                  fontWeight: 500,
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#F9FAFB'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'white'}
              >
                Cancel
              </button>

              <button
                onClick={handleSave}
                style={{
                  padding: '12px 32px',
                  borderRadius: '6px',
                  border: 'none',
                  background: '#0066FF',
                  color: 'white',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  boxShadow: '0 1px 2px rgba(0, 102, 255, 0.2)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#0052CC';
                  e.currentTarget.style.boxShadow = '0 2px 4px rgba(0, 102, 255, 0.3)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#0066FF';
                  e.currentTarget.style.boxShadow = '0 1px 2px rgba(0, 102, 255, 0.2)';
                }}
              >
                Save Event
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Action Document Modal */}
      {showActionDocument && (
        <>
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0, 0, 0, 0.6)',
              zIndex: 1003
            }}
            onClick={() => setShowActionDocument(false)}
          />
          <div
            style={{
              position: 'fixed',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              background: 'white',
              borderRadius: '8px',
              width: '100%',
              maxWidth: '900px',
              maxHeight: '90vh',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2), 0 10px 10px -5px rgba(0, 0, 0, 0.08)',
              display: 'flex',
              flexDirection: 'column',
              zIndex: 1004
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div style={{
              padding: '28px 32px',
              borderBottom: '1px solid #E5E7EB',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: '#FAFBFC'
            }}>
              <div>
                <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#0A0A0A', marginBottom: '4px' }}>
                  Meeting Action Document
                </h2>
                <p style={{ fontSize: '13px', color: '#6B7280' }}>
                  {formatDateInput(date)} • {fromTime} - {toTime}
                </p>
              </div>
              <button
                onClick={() => setShowActionDocument(false)}
                style={{
                  width: '36px',
                  height: '36px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '6px',
                  border: 'none',
                  background: 'white',
                  cursor: 'pointer',
                  color: '#9CA3AF'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#F3F4F6'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'white'}
              >
                <X size={20} />
              </button>
            </div>

            {/* Content */}
            <div style={{
              padding: '32px',
              overflowY: 'auto',
              flex: 1
            }}>
              {/* Meeting Info */}
              <div style={{
                padding: '20px',
                background: '#F9FAFB',
                borderRadius: '8px',
                border: '1px solid #E5E7EB',
                marginBottom: '32px'
              }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <div style={{ fontSize: '12px', fontWeight: 600, color: '#6B7280', marginBottom: '4px' }}>
                      MEETING TITLE
                    </div>
                    <div style={{ fontSize: '15px', fontWeight: 600, color: '#0A0A0A' }}>
                      {title || 'Untitled Meeting'}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '12px', fontWeight: 600, color: '#6B7280', marginBottom: '4px' }}>
                      PROJECT
                    </div>
                    <div style={{ fontSize: '15px', fontWeight: 600, color: '#0A0A0A' }}>
                      {project || '—'}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '12px', fontWeight: 600, color: '#6B7280', marginBottom: '4px' }}>
                      DATE & TIME
                    </div>
                    <div style={{ fontSize: '15px', fontWeight: 600, color: '#0A0A0A' }}>
                      {formatDateInput(date)} • {fromTime} - {toTime}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '12px', fontWeight: 600, color: '#6B7280', marginBottom: '4px' }}>
                      DURATION
                    </div>
                    <div style={{ fontSize: '15px', fontWeight: 600, color: '#0A0A0A' }}>
                      {calculateDuration()}
                    </div>
                  </div>
                </div>
              </div>

              {/* Summary Stats */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: '16px',
                marginBottom: '32px'
              }}>
                <div style={{
                  padding: '16px',
                  background: '#F0F9FF',
                  borderRadius: '6px',
                  border: '1px solid #BFDBFE',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '28px', fontWeight: 700, color: '#0066FF', marginBottom: '4px' }}>
                    {getTotalActionCount()}
                  </div>
                  <div style={{ fontSize: '12px', fontWeight: 600, color: '#6B7280' }}>
                    Total Actions
                  </div>
                </div>
                <div style={{
                  padding: '16px',
                  background: '#F0FDF4',
                  borderRadius: '6px',
                  border: '1px solid #BBF7D0',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '28px', fontWeight: 700, color: '#10B981', marginBottom: '4px' }}>
                    {getCompletedActionCount()}
                  </div>
                  <div style={{ fontSize: '12px', fontWeight: 600, color: '#6B7280' }}>
                    Completed
                  </div>
                </div>
                <div style={{
                  padding: '16px',
                  background: '#FEF3C7',
                  borderRadius: '6px',
                  border: '1px solid #FDE68A',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '28px', fontWeight: 700, color: '#F59E0B', marginBottom: '4px' }}>
                    {getTotalActionCount() - getCompletedActionCount()}
                  </div>
                  <div style={{ fontSize: '12px', fontWeight: 600, color: '#6B7280' }}>
                    Pending
                  </div>
                </div>
                <div style={{
                  padding: '16px',
                  background: '#F9FAFB',
                  borderRadius: '6px',
                  border: '1px solid #E5E7EB',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '28px', fontWeight: 700, color: '#0A0A0A', marginBottom: '4px' }}>
                    {agendaItems.filter(item => item.actions.length > 0).length}
                  </div>
                  <div style={{ fontSize: '12px', fontWeight: 600, color: '#6B7280' }}>
                    Topics
                  </div>
                </div>
              </div>

              {/* Agenda Items with Actions */}
              <div>
                <h3 style={{
                  fontSize: '16px',
                  fontWeight: 700,
                  color: '#0A0A0A',
                  marginBottom: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <div style={{ width: '4px', height: '20px', background: '#0066FF', borderRadius: '2px' }} />
                  Action Items by Topic
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                  {agendaItems.map((item, index) => {
                    if (item.actions.length === 0) return null;
                    
                    return (
                      <div
                        key={item.id}
                        style={{
                          padding: '20px',
                          background: 'white',
                          borderRadius: '8px',
                          border: '1px solid #E5E7EB'
                        }}
                      >
                        {/* Topic Header */}
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          marginBottom: '16px',
                          paddingBottom: '16px',
                          borderBottom: '1px solid #F3F4F6'
                        }}>
                          <div style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '50%',
                            background: '#0066FF',
                            color: 'white',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '14px',
                            fontWeight: 700,
                            flexShrink: 0
                          }}>
                            {index + 1}
                          </div>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: '15px', fontWeight: 700, color: '#0A0A0A', marginBottom: '4px' }}>
                              {item.title}
                            </div>
                            <div style={{ fontSize: '12px', color: '#9CA3AF', display: 'flex', gap: '12px' }}>
                              {item.timeAllocation && (
                                <span>⏱ {item.timeAllocation}</span>
                              )}
                              {item.presenter && (
                                <span>👤 {item.presenter}</span>
                              )}
                            </div>
                          </div>
                          <div style={{
                            padding: '4px 12px',
                            background: '#F0F9FF',
                            borderRadius: '12px',
                            fontSize: '12px',
                            fontWeight: 700,
                            color: '#0066FF'
                          }}>
                            {item.actions.filter(a => a.completed).length}/{item.actions.length} Done
                          </div>
                        </div>

                        {/* Discussion Notes */}
                        {item.notes && (
                          <div style={{
                            padding: '12px',
                            background: '#FAFBFC',
                            borderRadius: '6px',
                            marginBottom: '16px',
                            fontSize: '13px',
                            lineHeight: '1.6',
                            color: '#374151'
                          }}>
                            <div style={{ fontSize: '11px', fontWeight: 700, color: '#6B7280', marginBottom: '6px', letterSpacing: '0.05em' }}>
                              NOTES
                            </div>
                            {item.notes}
                          </div>
                        )}

                        {/* Actions */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                          {item.actions.map(action => (
                            <div
                              key={action.id}
                              style={{
                                display: 'flex',
                                alignItems: 'flex-start',
                                gap: '12px',
                                padding: '14px',
                                background: action.completed ? '#F0FDF4' : '#FAFBFC',
                                borderRadius: '6px',
                                border: action.completed ? '1px solid #BBF7D0' : '1px solid #E5E7EB'
                              }}
                            >
                              <div style={{
                                width: '20px',
                                height: '20px',
                                borderRadius: '50%',
                                background: action.completed ? '#10B981' : '#E5E7EB',
                                color: 'white',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '12px',
                                flexShrink: 0,
                                marginTop: '2px'
                              }}>
                                {action.completed ? '✓' : ''}
                              </div>
                              <div style={{ flex: 1 }}>
                                <div style={{
                                  fontSize: '14px',
                                  fontWeight: 500,
                                  color: action.completed ? '#059669' : '#0A0A0A',
                                  marginBottom: '6px',
                                  textDecoration: action.completed ? 'line-through' : 'none'
                                }}>
                                  {action.text}
                                </div>
                                <div style={{
                                  display: 'flex',
                                  gap: '16px',
                                  fontSize: '12px',
                                  color: '#6B7280'
                                }}>
                                  {action.assignedTo && (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                      <User size={12} />
                                      <span style={{ fontWeight: 600 }}>{action.assignedTo}</span>
                                    </div>
                                  )}
                                  {action.dueDate && (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                      <Calendar size={12} />
                                      <span>{new Date(action.dueDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div style={{
              padding: '20px 32px',
              borderTop: '1px solid #E5E7EB',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              background: '#FAFBFC'
            }}>
              <div style={{ fontSize: '12px', color: '#9CA3AF' }}>
                Document generated on {new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })} at {new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  onClick={() => setShowActionDocument(false)}
                  style={{
                    padding: '10px 24px',
                    borderRadius: '6px',
                    border: '1px solid #D1D5DB',
                    background: 'white',
                    color: '#6B7280',
                    fontSize: '14px',
                    fontWeight: 500,
                    cursor: 'pointer'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#F9FAFB'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'white'}
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    downloadActionDocument();
                    setShowActionDocument(false);
                  }}
                  style={{
                    padding: '10px 24px',
                    borderRadius: '6px',
                    border: 'none',
                    background: '#0066FF',
                    color: 'white',
                    fontSize: '14px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#0052CC'}
                  onMouseLeave={(e) => e.currentTarget.style.background = '#0066FF'}
                >
                  <FileText size={16} />
                  Save & Share Document
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      <style>{`
        @keyframes slideIn {
          from {
            transform: translateX(100%);
          }
          to {
            transform: translateX(0);
          }
        }
      `}</style>
    </>
  );
}
