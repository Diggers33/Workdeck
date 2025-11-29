import React, { useState, useEffect } from 'react';
import { GripVertical, Clock, CheckSquare, ChevronDown, ChevronRight, ChevronUp, MoreHorizontal, ArrowUpRight, Inbox, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  ChecklistItem as ApiChecklistItem,
  AssignedTask as ApiAssignedTask,
  addChecklistItem as apiAddChecklistItem,
  toggleChecklistItem as apiToggleChecklistItem,
  deleteChecklistItem as apiDeleteChecklistItem,
  clearCompletedChecklist as apiClearCompletedChecklist,
} from '../../api/dashboardApi';

interface TodoListWidgetProps {
  items?: ApiChecklistItem[];
  assignedTasks?: ApiAssignedTask[];
  onDragStart: (task: any) => void;
  onDragEnd: () => void;
  onTaskClick?: (task: any) => void;
  onRefresh?: () => void; // Callback to refresh data from parent (bi-directional sync)
}

interface ChecklistItem {
  id: string;
  label: string;
  completed: boolean;
}

interface Task {
  id: string;
  title: string;
  project?: string;
  projectColor?: string;
  category: string;
  due: string;
  duration: string;
  completed: boolean;
  endDate?: string;
  checklist?: ChecklistItem[];
  priority?: 'high' | 'medium' | 'low';
}

// Note: Assigned tasks now come from API. No mock data fallback.
// Empty array from API = valid state (no assigned tasks), shown as empty state in UI.

// Helper function to convert API assigned tasks to internal Task format
function convertApiAssignedTasksToTasks(tasks: ApiAssignedTask[]): Task[] {
  return tasks.map(task => ({
    id: task.id,
    title: task.name,
    project: task.projectName,
    projectColor: task.projectColor || '#60A5FA',
    category: 'Work',
    due: formatDueDate(task.dueDate),
    duration: task.estimatedTime ? formatDuration(task.estimatedTime) : '1h',
    completed: task.status === 'completed' || task.status === 'done',
    priority: (task.priority?.toLowerCase() as 'high' | 'medium' | 'low') || 'medium',
    checklist: task.checklist?.map(c => ({
      id: c.id,
      label: c.label,
      completed: c.completed
    }))
  }));
}

// Helper to format due date
function formatDueDate(dueDate?: string): string {
  if (!dueDate) return 'No due date';
  try {
    const date = new Date(dueDate);
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === now.toDateString()) return 'Today';
    if (date.toDateString() === tomorrow.toDateString()) return 'Tomorrow';

    const diffDays = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays > 0 && diffDays <= 7) return 'This week';
    if (diffDays < 0) return `${Math.abs(diffDays)} days overdue`;

    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  } catch {
    return dueDate;
  }
}

// Helper to format duration in minutes to readable string
function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}

// Note: Personal tasks now come from API. No mock data fallback.
// Empty array from API = valid state (no tasks), shown as empty state in UI.

// Helper function to convert API checklist items to Task format
function convertApiItemsToTasks(items: ApiChecklistItem[]): Task[] {
  return items.map(item => {
    // Debug: log each item to see its structure
    console.log('[TodoWidget] Converting checklist item:', JSON.stringify(item, null, 2));

    return {
      id: item.id,
      // Use text, but ensure it's not empty/undefined
      title: item.text || 'Untitled',
      category: 'Personal',
      due: formatDate(item.createdAt),
      duration: '30m',
      completed: item.completed,
      priority: 'medium' as const,
    };
  });
}

// Helper to format date
function formatDate(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  } catch {
    return dateStr;
  }
}

export function TodoListWidget({ items, assignedTasks: apiAssignedTasks, onDragStart, onDragEnd, onTaskClick, onRefresh }: TodoListWidgetProps) {
  const navigate = useNavigate();

  // Debug logging
  console.log('[TodoWidget] items (personal) prop:', items);
  console.log('[TodoWidget] assignedTasks prop:', apiAssignedTasks);

  // Determine data state for personal tasks:
  // - undefined = API not called yet or failed (show loading)
  // - [] = API returned empty (valid - no personal tasks)
  // - array with items = show the items
  const personalTasksLoading = items === undefined;
  const personalTasksEmpty = Array.isArray(items) && items.length === 0;
  const hasPersonalApiData = Array.isArray(items) && items.length > 0;

  console.log('[TodoWidget] personalTasksLoading:', personalTasksLoading, 'personalTasksEmpty:', personalTasksEmpty, 'hasPersonalApiData:', hasPersonalApiData);

  // Determine data state for assigned tasks:
  const assignedTasksLoading = apiAssignedTasks === undefined;
  const assignedTasksEmpty = Array.isArray(apiAssignedTasks) && apiAssignedTasks.length === 0;
  const hasAssignedApiData = Array.isArray(apiAssignedTasks) && apiAssignedTasks.length > 0;

  const [expandedGroups, setExpandedGroups] = useState({
    assigned: true,
    personal: true
  });

  const [expandedTasks, setExpandedTasks] = useState<Set<string>>(new Set());
  const [showNewMenu, setShowNewMenu] = useState(false);
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [quickAddValue, setQuickAddValue] = useState('');
  const [convertingTask, setConvertingTask] = useState<string | null>(null);
  const [showPriorityMenu, setShowPriorityMenu] = useState<string | null>(null);

  // State for managing tasks - both come from API now
  const [assignedTasks, setAssignedTasks] = useState<Task[]>(
    hasAssignedApiData ? convertApiAssignedTasksToTasks(apiAssignedTasks) : []
  );

  // Personal tasks come from API - initialize based on API state
  const [personalTasks, setPersonalTasks] = useState<Task[]>(
    hasPersonalApiData ? convertApiItemsToTasks(items) : []
  );

  // Update assigned tasks when API data changes
  useEffect(() => {
    if (Array.isArray(apiAssignedTasks)) {
      setAssignedTasks(apiAssignedTasks.length > 0 ? convertApiAssignedTasksToTasks(apiAssignedTasks) : []);
    }
  }, [apiAssignedTasks]);

  // Update personal tasks when API items change
  useEffect(() => {
    if (Array.isArray(items)) {
      setPersonalTasks(items.length > 0 ? convertApiItemsToTasks(items) : []);
    }
  }, [items]);

  const toggleGroup = (group: 'assigned' | 'personal') => {
    setExpandedGroups(prev => ({ ...prev, [group]: !prev[group] }));
  };

  const toggleTaskExpansion = (taskId: string) => {
    setExpandedTasks(prev => {
      const newSet = new Set(prev);
      if (newSet.has(taskId)) {
        newSet.delete(taskId);
      } else {
        newSet.add(taskId);
      }
      return newSet;
    });
  };

  const toggleTaskCompletion = async (taskId: string, isAssigned: boolean) => {
    if (isAssigned) {
      // For assigned tasks, just update UI (would need different API endpoint)
      setAssignedTasks(prev => prev.map(task =>
        task.id === taskId ? { ...task, completed: !task.completed } : task
      ));
    } else {
      // For personal checklist items, update UI optimistically then call API
      const task = personalTasks.find(t => t.id === taskId);
      if (!task) return;

      const newCompleted = !task.completed;

      // Optimistic update
      setPersonalTasks(prev => prev.map(t =>
        t.id === taskId ? { ...t, completed: newCompleted } : t
      ));

      // Call API
      try {
        await apiToggleChecklistItem(taskId, newCompleted, task.title);
      } catch (error) {
        console.error('Failed to toggle checklist item:', error);
        // Revert on error
        setPersonalTasks(prev => prev.map(t =>
          t.id === taskId ? { ...t, completed: !newCompleted } : t
        ));
      }
    }
  };

  const toggleChecklistItem = (taskId: string, itemId: string, isAssigned: boolean) => {
    if (isAssigned) {
      setAssignedTasks(prev => prev.map(task => {
        if (task.id === taskId && task.checklist) {
          return {
            ...task,
            checklist: task.checklist.map(item =>
              item.id === itemId ? { ...item, completed: !item.completed } : item
            )
          };
        }
        return task;
      }));
    } else {
      setPersonalTasks(prev => prev.map(task => {
        if (task.id === taskId && task.checklist) {
          return {
            ...task,
            checklist: task.checklist.map(item =>
              item.id === itemId ? { ...item, completed: !item.completed } : item
            )
          };
        }
        return task;
      }));
    }
  };

  // Delete a personal checklist item
  const handleDeleteItem = async (taskId: string) => {
    // Find the task to delete
    const taskToDelete = personalTasks.find(t => t.id === taskId);
    if (!taskToDelete) return;

    // Optimistic update - remove from UI immediately
    setPersonalTasks(prev => prev.filter(t => t.id !== taskId));

    // Call API
    try {
      await apiDeleteChecklistItem(taskId);
    } catch (error) {
      console.error('Failed to delete checklist item:', error);
      // Revert on error - add back to the list
      setPersonalTasks(prev => [...prev, taskToDelete]);
    }
  };

  // Clear all completed personal checklist items
  const handleClearCompleted = async () => {
    const completedTasks = personalTasks.filter(t => t.completed);
    if (completedTasks.length === 0) return;

    // Optimistic update - remove completed items from UI
    setPersonalTasks(prev => prev.filter(t => !t.completed));

    // Call API
    try {
      await apiClearCompletedChecklist();
      // Optionally trigger parent refresh for full sync
      if (onRefresh) {
        onRefresh();
      }
    } catch (error) {
      console.error('Failed to clear completed items:', error);
      // Revert on error - add back completed items
      setPersonalTasks(prev => [...prev, ...completedTasks]);
    }
  };

  const getPriorityColor = (priority?: 'high' | 'medium' | 'low') => {
    switch (priority) {
      case 'high': return '#F87171';
      case 'medium': return '#FBBF24';
      case 'low': return '#60A5FA';
      default: return '#9CA3AF';
    }
  };

  const totalActive = assignedTasks.filter(t => !t.completed).length + personalTasks.filter(t => !t.completed).length;

  const getChecklistProgress = (checklist: ChecklistItem[]) => {
    const completed = checklist.filter(item => item.completed).length;
    return { completed, total: checklist.length };
  };

  const handleQuickAdd = async () => {
    if (quickAddValue.trim()) {
      const text = quickAddValue.trim();
      setQuickAddValue('');
      setShowQuickAdd(false);

      // Create optimistic task
      const tempId = `temp-${Date.now()}`;
      const newTask: Task = {
        id: tempId,
        title: text,
        category: 'General',
        due: 'Just now',
        duration: '30m',
        completed: false,
        priority: 'medium'
      };

      // Optimistic update
      setPersonalTasks(prev => [newTask, ...prev]);

      // Call API
      try {
        const createdItem = await apiAddChecklistItem(text);
        // Update with real ID from API
        setPersonalTasks(prev => prev.map(t =>
          t.id === tempId ? { ...t, id: createdItem.id } : t
        ));
      } catch (error) {
        console.error('Failed to add checklist item:', error);
        // Remove optimistic item on error
        setPersonalTasks(prev => prev.filter(t => t.id !== tempId));
      }
    }
  };

  const handleQuickAddKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleQuickAdd();
    } else if (e.key === 'Escape') {
      setShowQuickAdd(false);
      setQuickAddValue('');
    }
  };

  const handleConvertToTask = (task: Task) => {
    if (onTaskClick) {
      // Create a minimal task for modal with only the to-do information
      const taskForModal = {
        id: `a${Date.now()}`,
        name: task.title,
        title: task.title,
        checklist: task.checklist, // Preserve checklist if it exists
        _convertFrom: task.id, // flag to identify this is a conversion
        _isNew: true // flag to treat as new task creation
      };
      onTaskClick(taskForModal);
    }
  };

  const handleNewProjectTask = () => {
    if (onTaskClick) {
      // Open modal with empty task for creation
      onTaskClick({
        id: `a${Date.now()}`,
        name: '',
        title: '',
        category: 'General',
        due: 'No date',
        duration: '1h',
        completed: false,
        _isNew: true // flag to identify this is a new task
      });
    }
    setShowNewMenu(false);
  };

  const changePriority = (taskId: string, priority: 'high' | 'medium' | 'low', isAssigned: boolean) => {
    if (isAssigned) {
      setAssignedTasks(prev => prev.map(task => 
        task.id === taskId ? { ...task, priority } : task
      ));
    } else {
      setPersonalTasks(prev => prev.map(task => 
        task.id === taskId ? { ...task, priority } : task
      ));
    }
    setShowPriorityMenu(null);
  };

  const renderTaskRow = (task: Task, showProject: boolean = false) => {
    const isExpanded = expandedTasks.has(task.id);
    const hasChecklist = task.checklist && task.checklist.length > 0;
    const checklistProgress = hasChecklist ? getChecklistProgress(task.checklist!) : null;

    return (
      <div 
        key={task.id} 
        className={`border transition-all relative ${
          task.completed 
            ? 'bg-[#F9FAFB] border-[#F3F4F6] opacity-40' 
            : 'bg-white border-[#E5E7EB] hover:border-[#60A5FA]'
        } rounded group`}
      >
        {/* Priority indicator bar - full height, clickable */}
        {!task.completed && (
          <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l z-10">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowPriorityMenu(showPriorityMenu === task.id ? null : task.id);
              }}
              className="absolute inset-0 hover:w-3 transition-all rounded-l"
              style={{ backgroundColor: getPriorityColor(task.priority) }}
            />
            
            {/* Priority dropdown */}
            {showPriorityMenu === task.id && (
              <>
                <div 
                  className="fixed inset-0 z-10" 
                  onClick={() => setShowPriorityMenu(null)}
                />
                <div className="absolute left-8 top-2 bg-white border border-[#D1D5DB] rounded shadow-xl z-20 py-1.5 overflow-hidden" style={{ minWidth: '140px' }}>
                  <div className="px-3 py-1.5 text-[10px] uppercase tracking-wide text-[#6B7280] font-medium bg-[#F9FAFB] border-b border-[#E5E7EB]">
                    Set Priority
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      changePriority(task.id, 'high', showProject);
                    }}
                    className="w-full text-left px-3 py-2 text-[13px] text-[#1F2937] hover:bg-[#FEF2F2] transition-colors flex items-center gap-2.5 group"
                  >
                    <div className="w-1 h-5 rounded-full group-hover:w-1.5 transition-all" style={{ backgroundColor: '#F87171' }} />
                    <span className="font-medium">High</span>
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      changePriority(task.id, 'medium', showProject);
                    }}
                    className="w-full text-left px-3 py-2 text-[13px] text-[#1F2937] hover:bg-[#FFFBEB] transition-colors flex items-center gap-2.5 group"
                  >
                    <div className="w-1 h-5 rounded-full group-hover:w-1.5 transition-all" style={{ backgroundColor: '#FBBF24' }} />
                    <span className="font-medium">Medium</span>
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      changePriority(task.id, 'low', showProject);
                    }}
                    className="w-full text-left px-3 py-2 text-[13px] text-[#1F2937] hover:bg-[#EFF6FF] transition-colors flex items-center gap-2.5 group"
                  >
                    <div className="w-1 h-5 rounded-full group-hover:w-1.5 transition-all" style={{ backgroundColor: '#60A5FA' }} />
                    <span className="font-medium">Low</span>
                  </button>
                </div>
              </>
            )}
          </div>
        )}
        
        {/* Main task row */}
        <div
          onPointerDown={(e) => {
            if (!task.completed) {
              e.preventDefault();
              e.stopPropagation();
              e.currentTarget.style.opacity = '0.5';
              onDragStart(task);
            }
          }}
          onPointerUp={(e) => {
            if (!task.completed) {
              e.currentTarget.style.opacity = '1';
              onDragEnd();
            }
          }}
          onPointerCancel={(e) => {
            if (!task.completed) {
              e.currentTarget.style.opacity = '1';
              onDragEnd();
            }
          }}
          style={{
            touchAction: !task.completed ? 'none' : 'auto',
            WebkitUserSelect: 'none',
            userSelect: 'none'
          }}
          className={`flex items-center gap-2 px-2.5 py-2 transition-all ${
            task.completed 
              ? '' 
              : 'hover:bg-[#F9FAFB] cursor-pointer'
          }`}
          onClick={(e) => {
            // Only open task detail if clicking on the task row itself, not on interactive elements
            if (
              onTaskClick &&
              !task.completed &&
              e.target === e.currentTarget
            ) {
              onTaskClick(task);
            }
          }}
        >
          {/* Drag handle */}
          {!task.completed && (
            <GripVertical className="w-3 h-3 text-[#9CA3AF] flex-shrink-0" />
          )}
          
          {/* Checkbox */}
          <input 
            type="checkbox"
            checked={task.completed}
            onChange={() => toggleTaskCompletion(task.id, showProject)}
            onClick={(e) => e.stopPropagation()}
            className="w-4 h-4 cursor-pointer flex-shrink-0"
            style={{ accentColor: '#60A5FA' }}
          />
          
          {/* Task content */}
          <div 
            className={`flex-1 min-w-0 ${showProject && !task.completed ? 'cursor-pointer' : ''}`}
            onClick={() => {
              // Only open detail modal for assigned (project) tasks
              if (onTaskClick && !task.completed && showProject) {
                // Transform task to match Gantt task format
                const ganttTask = {
                  ...task,
                  name: task.title // TaskDetailModal expects 'name' property
                };
                onTaskClick(ganttTask);
              }
            }}
          >
            <p className={`text-[14px] leading-tight font-medium ${
              task.completed ? 'text-[#9CA3AF] line-through' : 'text-[#1F2937]'
            }`}>
              {task.title}
            </p>
            <div className="flex items-center gap-1.5 text-[12px] text-[#6B7280] flex-wrap mt-0.5">
              {/* Project tag (only for Assigned group) */}
              {showProject && task.project && (
                <span 
                  className="text-[11px] px-1.5 py-0.5 rounded font-medium text-white whitespace-nowrap"
                  style={{ backgroundColor: task.projectColor }}
                >
                  {task.project}
                </span>
              )}
              
              {/* Category */}
              <span className="whitespace-nowrap">• {task.category}</span>
              
              {/* Due label */}
              <span className="whitespace-nowrap">• {task.due}</span>
              
              {/* Scheduled time (if exists) */}
              {task.endDate && (
                <span className="flex items-center gap-1 whitespace-nowrap">
                  <span>•</span>
                  <Clock className="w-3 h-3" />
                  <span>{task.endDate}</span>
                </span>
              )}
              
              {/* Checklist progress */}
              {hasChecklist && checklistProgress && (
                <span className="whitespace-nowrap">• Checklist {checklistProgress.completed}/{checklistProgress.total}</span>
              )}
            </div>
          </div>
          
          {/* Convert to task button (only for personal items) */}
          {!showProject && !task.completed && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleConvertToTask(task);
              }}
              className="flex-shrink-0 opacity-0 group-hover:opacity-100 p-1 hover:bg-[#EFF6FF] rounded transition-all"
              title="Convert to project task"
            >
              <ArrowUpRight className="w-3.5 h-3.5 text-[#60A5FA]" />
            </button>
          )}

          {/* Delete button (only for personal items) */}
          {!showProject && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDeleteItem(task.id);
              }}
              className="flex-shrink-0 opacity-0 group-hover:opacity-100 p-1 hover:bg-[#FEE2E2] rounded transition-all"
              title="Delete item"
            >
              <Trash2 className="w-3.5 h-3.5 text-[#EF4444]" />
            </button>
          )}

          {/* Add checklist button (only for personal items without checklist) */}
          {!showProject && !hasChecklist && !task.completed && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleTaskExpansion(task.id);
              }}
              className="flex-shrink-0 opacity-0 group-hover:opacity-100 p-1 hover:bg-[#EFF6FF] rounded transition-all"
              title="Add checklist"
            >
              <CheckSquare className="w-3.5 h-3.5 text-[#60A5FA]" />
            </button>
          )}
          
          {/* Expand/collapse chevron for checklist */}
          {hasChecklist && (
            <button 
              onClick={(e) => {
                e.stopPropagation();
                toggleTaskExpansion(task.id);
              }}
              className="flex-shrink-0 p-0.5 hover:bg-[#F3F4F6] rounded transition-colors"
            >
              {isExpanded ? (
                <ChevronUp className="w-3.5 h-3.5 text-[#6B7280]" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5 text-[#6B7280]" />
              )}
            </button>
          )}
        </div>

        {/* Expanded checklist section - seamlessly integrated */}
        {hasChecklist && isExpanded && (
          <div className="border-t border-[#E5E7EB] px-2.5 py-2 pl-[52px]">
            <div className="space-y-1.5">
              {task.checklist!.map(item => (
                <div key={item.id} className="flex items-center gap-2">
                  <input 
                    type="checkbox"
                    checked={item.completed}
                    onChange={() => toggleChecklistItem(task.id, item.id, showProject)}
                    className="w-3.5 h-3.5 cursor-pointer flex-shrink-0"
                    style={{ accentColor: '#60A5FA' }}
                  />
                  <span className={`text-[13px] ${
                    item.completed ? 'text-[#9CA3AF] line-through' : 'text-[#4B5563]'
                  }`}>
                    {item.label}
                  </span>
                </div>
              ))}
              
              {/* Add new checklist item - only for personal to-dos */}
              {!showProject && (
                <div className="flex items-center gap-2 mt-2 pt-1.5 border-t border-[#E5E7EB]">
                  <CheckSquare className="w-3.5 h-3.5 text-[#60A5FA] flex-shrink-0" />
                  <input
                    type="text"
                    placeholder="Add item..."
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        const value = (e.target as HTMLInputElement).value.trim();
                        if (value) {
                          const newItem: ChecklistItem = {
                            id: `c${Date.now()}`,
                            label: value,
                            completed: false
                          };
                          setPersonalTasks(prev => prev.map(t => {
                            if (t.id === task.id) {
                              return {
                                ...t,
                                checklist: [...(t.checklist || []), newItem]
                              };
                            }
                            return t;
                          }));
                          (e.target as HTMLInputElement).value = '';
                        }
                      }
                    }}
                    className="flex-1 bg-transparent border-none outline-none text-[13px] text-[#1F2937] placeholder:text-[#9CA3AF]"
                  />
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* Add checklist button for tasks without checklists - only for personal */}
        {!hasChecklist && !showProject && isExpanded && (
          <div className="border-t border-[#E5E7EB] px-2.5 py-2 pl-[52px]">
            <div className="flex items-center gap-2">
              <CheckSquare className="w-3.5 h-3.5 text-[#60A5FA] flex-shrink-0" />
              <input
                type="text"
                placeholder="Add first checklist item..."
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    const value = (e.target as HTMLInputElement).value.trim();
                    if (value) {
                      const newItem: ChecklistItem = {
                        id: `c${Date.now()}`,
                        label: value,
                        completed: false
                      };
                      setPersonalTasks(prev => prev.map(t => {
                        if (t.id === task.id) {
                          return {
                            ...t,
                            checklist: [newItem]
                          };
                        }
                        return t;
                      }));
                      (e.target as HTMLInputElement).value = '';
                      // Keep expanded after adding first item
                    }
                  }
                }}
                className="flex-1 bg-transparent border-none outline-none text-[13px] text-[#1F2937] placeholder:text-[#9CA3AF]"
              />
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderGroup = (
    title: string,
    count: number,
    groupKey: 'assigned' | 'personal',
    tasks: Task[],
    showProject: boolean = false,
    isLoading: boolean = false,
    isEmpty: boolean = false
  ) => {
    const isExpanded = expandedGroups[groupKey];

    return (
      <div className="space-y-2">
        {/* Group header */}
        <div
          className="flex items-center justify-between cursor-pointer hover:bg-[#F9FAFB] px-1 py-1 rounded -mx-1 transition-colors"
          onClick={() => toggleGroup(groupKey)}
        >
          <div className="flex items-center gap-1.5">
            {isExpanded ? (
              <ChevronDown className="w-3.5 h-3.5 text-[#6B7280]" />
            ) : (
              <ChevronRight className="w-3.5 h-3.5 text-[#6B7280]" />
            )}
            <span className="text-[14px] font-medium text-[#374151]">{title}</span>
            {((groupKey === 'personal' && hasPersonalApiData) || (groupKey === 'assigned' && hasAssignedApiData)) && (
              <span className="text-[10px] text-[#10B981] font-medium">(Live)</span>
            )}
          </div>
          <span className="text-[11px] px-2 py-0.5 rounded bg-[#F3F4F6] text-[#6B7280] font-medium" style={{ borderRadius: '6px' }}>
            {isLoading ? '...' : count}
          </span>
        </div>

        {/* Divider */}
        <div className="border-b border-[#E5E7EB]" />

        {/* Task list */}
        {isExpanded && (
          <div className="space-y-2">
            {/* Quick-add input (only for Personal group) */}
            {groupKey === 'personal' && showQuickAdd && (
              <div className="bg-[#EFF6FF] border border-[#60A5FA] rounded px-2.5 py-2">
                <div className="flex items-center gap-2 mb-1.5">
                  <CheckSquare className="w-4 h-4 text-[#60A5FA] flex-shrink-0" />
                  <input
                    type="text"
                    value={quickAddValue}
                    onChange={(e) => setQuickAddValue(e.target.value)}
                    onKeyDown={handleQuickAddKeyPress}
                    placeholder="Add quick to-do..."
                    autoFocus
                    className="flex-1 bg-transparent border-none outline-none text-[14px] text-[#1F2937] placeholder:text-[#9CA3AF]"
                  />
                </div>
                <div className="flex items-center justify-end gap-1.5">
                  <button
                    onClick={() => {
                      setShowQuickAdd(false);
                      setQuickAddValue('');
                    }}
                    className="px-2 py-0.5 hover:bg-white/50 text-[#6B7280] text-[11px] rounded transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleQuickAdd}
                    className="px-2.5 py-0.5 bg-[#60A5FA] hover:bg-[#3B82F6] text-white text-[11px] rounded font-medium transition-colors"
                  >
                    Add
                  </button>
                </div>
              </div>
            )}

            {/* Loading state */}
            {isLoading && (
              <div className="flex flex-col items-center justify-center py-6 text-center">
                <div className="w-5 h-5 border-2 border-[#60A5FA] border-t-transparent rounded-full animate-spin mb-2"></div>
                <p className="text-[11px] text-[#9CA3AF]">Loading tasks...</p>
              </div>
            )}

            {/* Empty state */}
            {isEmpty && !isLoading && (
              <div className="flex flex-col items-center justify-center py-6 text-center">
                <div className="w-10 h-10 rounded-full bg-[#F3F4F6] flex items-center justify-center mb-2">
                  <Inbox className="w-5 h-5 text-[#9CA3AF]" />
                </div>
                <p className="text-[12px] text-[#6B7280] mb-1">No tasks for today</p>
                <p className="text-[10px] text-[#9CA3AF]">Click "New +" to add one</p>
              </div>
            )}

            {/* Task list */}
            {!isLoading && !isEmpty && tasks.map(task => renderTaskRow(task, showProject))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div 
      className="bg-white rounded-lg relative overflow-hidden" 
      style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.1)', height: '100%', display: 'flex', flexDirection: 'column' }}
    >
      {/* Colored top accent */}
      <div className="absolute left-0 right-0 top-0 h-1" style={{ background: 'linear-gradient(90deg, #60A5FA 0%, #93C5FD 100%)' }}></div>
      
      {/* Header */}
      <div className="px-4 py-2.5 border-b border-[#E5E7EB] flex items-center justify-between" style={{ minHeight: '40px' }}>
        <div className="flex items-center gap-1.5">
          <CheckSquare className="w-4 h-4 text-[#60A5FA]" />
          <h3 className="text-[14px] font-medium text-[#1F2937]">To-Do</h3>
          {(hasPersonalApiData || hasAssignedApiData) && (
            <span className="text-[10px] text-[#10B981] font-medium">(Live)</span>
          )}
        </div>
        <div className="relative">
          <button 
            onClick={() => setShowNewMenu(!showNewMenu)}
            className="bg-[#60A5FA] hover:bg-[#3B82F6] text-white px-2.5 py-1 rounded text-[11px] font-medium transition-all"
          >
            New +
          </button>
          
          {/* Dropdown menu */}
          {showNewMenu && (
            <>
              <div 
                className="fixed inset-0 z-10" 
                onClick={() => setShowNewMenu(false)}
              />
              <div 
                className="absolute right-0 mt-1 bg-white border border-[#E5E7EB] rounded shadow-lg z-20"
                style={{ minWidth: '180px' }}
              >
                <button
                  onClick={() => {
                    setShowQuickAdd(true);
                    setShowNewMenu(false);
                    setExpandedGroups(prev => ({ ...prev, personal: true }));
                  }}
                  className="w-full text-left px-3 py-2 text-[13px] text-[#1F2937] hover:bg-[#F9FAFB] transition-colors flex items-center gap-2"
                >
                  <CheckSquare className="w-3.5 h-3.5 text-[#60A5FA]" />
                  <span>Quick to-do</span>
                </button>
                <button
                  onClick={handleNewProjectTask}
                  className="w-full text-left px-3 py-2 text-[13px] text-[#1F2937] hover:bg-[#F9FAFB] transition-colors flex items-center gap-2 border-t border-[#E5E7EB]"
                >
                  <ArrowUpRight className="w-3.5 h-3.5 text-[#60A5FA]" />
                  <span>Project task</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Two collapsible groups in scrollable area */}
      <div className="px-4 py-3 custom-scrollbar space-y-4" style={{ flex: 1, overflowY: 'auto' }}>
        {renderGroup('Assigned', assignedTasks.length, 'assigned', assignedTasks, true, assignedTasksLoading, assignedTasksEmpty && assignedTasks.length === 0)}
        {renderGroup('Personal', personalTasks.length, 'personal', personalTasks, false, personalTasksLoading, personalTasksEmpty && personalTasks.length === 0)}
      </div>

      {/* Footer */}
      <div className="px-4 py-2 border-t border-[#E5E7EB] flex items-center justify-between" style={{ minHeight: '36px', paddingTop: '8px' }}>
        <button
          onClick={() => navigate('/work/tasks')}
          className="text-[11px] text-[#3B82F6] hover:text-[#2563EB] hover:underline transition-all"
        >
          All tasks →
        </button>
        <div className="flex items-center gap-3">
          {/* Clear completed button - only show if there are completed personal tasks */}
          {personalTasks.filter(t => t.completed).length > 0 && (
            <button
              onClick={handleClearCompleted}
              className="text-[11px] text-[#EF4444] hover:text-[#DC2626] hover:underline transition-all"
            >
              Clear completed ({personalTasks.filter(t => t.completed).length})
            </button>
          )}
          <span className="text-[11px] text-[#6B7280]">{totalActive} active</span>
        </div>
      </div>
    </div>
  );
}