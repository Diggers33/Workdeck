import React, { useState } from 'react';
import { Calendar, Clock, Flag, CheckSquare } from 'lucide-react';

interface TaskDetailsTabProps {
  task: any;
  onUpdate: (updates: any) => void;
}

export function TaskDetailsTab({ task, onUpdate }: TaskDetailsTabProps) {
  const [importance, setImportance] = useState(50);
  const [progress, setProgress] = useState(task.progress || 0);
  const [checklistItems, setChecklistItems] = useState(task.checklist || []);
  const [newChecklistItem, setNewChecklistItem] = useState('');

  // Check if this is a new task being created (from conversion or new project task)
  const isNewTask = task._isNew === true;

  const toggleChecklistItem = (itemId: string) => {
    const updatedChecklist = checklistItems.map((item: any) =>
      item.id === itemId ? { ...item, completed: !item.completed } : item
    );
    setChecklistItems(updatedChecklist);
    onUpdate({ checklist: updatedChecklist });
  };

  const addChecklistItem = () => {
    if (newChecklistItem.trim()) {
      const newItem = {
        id: `checklist-${Date.now()}`,
        label: newChecklistItem.trim(),
        completed: false
      };
      const updatedChecklist = [...checklistItems, newItem];
      setChecklistItems(updatedChecklist);
      onUpdate({ checklist: updatedChecklist });
      setNewChecklistItem('');
    }
  };

  const handleChecklistKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addChecklistItem();
    }
  };

  const getChecklistProgress = () => {
    if (!checklistItems || checklistItems.length === 0) return { completed: 0, total: 0 };
    const completed = checklistItems.filter((item: any) => item.completed).length;
    return { completed, total: checklistItems.length };
  };

  const getImportanceColor = (value: number) => {
    if (value < 33) return '#10B981';
    if (value < 66) return '#F59E0B';
    return '#DC2626';
  };

  const getImportanceLabel = (value: number) => {
    if (value < 33) return 'Low';
    if (value < 66) return 'Medium';
    return 'High';
  };

  return (
    <div style={{
      maxWidth: '100%'
    }}>
      {/* Compact Single Column Layout */}
      <div>
        {/* Section 1: Basic Information - Compact */}
        <div style={{ marginBottom: '12px' }}>
          <label style={{
            display: 'block',
            fontSize: '11px',
            fontWeight: 600,
            color: '#6B7280',
            marginBottom: '4px',
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }}>
            Project
          </label>
          <div style={{
            height: '36px',
            background: 'white',
            border: '1px solid #E5E7EB',
            borderRadius: '6px',
            padding: '0 12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '14px',
            color: isNewTask ? '#9CA3AF' : '#0A0A0A',
            cursor: 'pointer'
          }}>
            <span>{isNewTask ? 'Select project...' : task.project || 'Agro2circular'}</span>
            <span style={{ fontSize: '12px', color: '#9CA3AF' }}>▼</span>
          </div>
        </div>

        <div style={{ marginBottom: '12px' }}>
          <label style={{
            display: 'block',
            fontSize: '11px',
            fontWeight: 600,
            color: '#6B7280',
            marginBottom: '4px',
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }}>
            Activity
          </label>
          <div style={{
            height: '36px',
            background: 'white',
            border: '1px solid #E5E7EB',
            borderRadius: '6px',
            padding: '0 12px 0 14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '13px',
            color: isNewTask ? '#9CA3AF' : '#0A0A0A',
            cursor: 'pointer'
          }}>
            <span style={{
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              flex: 1,
              paddingRight: '8px',
              display: 'block'
            }}>
              {isNewTask ? 'Select activity...' : task.activity || 'Task 3.2. Optical sorting of the multilayer materials - IRIS Task leader'}
            </span>
            <span style={{ fontSize: '12px', color: '#9CA3AF', flexShrink: 0 }}>▼</span>
          </div>
        </div>

        {/* Section 2: Timeline & Resources - 2-Column Grid */}
        <div style={{ 
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1fr',
          gap: '12px',
          marginBottom: '12px'
        }}>
          <div>
            <label style={{
              display: 'block',
              fontSize: '11px',
              fontWeight: 600,
              color: '#6B7280',
              marginBottom: '4px',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              From
            </label>
            <div style={{
              height: '36px',
              background: 'white',
              border: '1px solid #E5E7EB',
              borderRadius: '6px',
              padding: '0 10px 0 32px',
              display: 'flex',
              alignItems: 'center',
              fontSize: '13px',
              color: isNewTask ? '#9CA3AF' : '#0A0A0A',
              position: 'relative'
            }}>
              <Calendar size={14} color="#6B7280" style={{
                position: 'absolute',
                left: '10px'
              }} />
              <span>{isNewTask ? 'Select date' : task.from || '14/10/21'}</span>
            </div>
          </div>
          <div>
            <label style={{
              display: 'block',
              fontSize: '11px',
              fontWeight: 600,
              color: '#6B7280',
              marginBottom: '4px',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              To
            </label>
            <div style={{
              height: '36px',
              background: 'white',
              border: '1px solid #E5E7EB',
              borderRadius: '6px',
              padding: '0 10px 0 32px',
              display: 'flex',
              alignItems: 'center',
              fontSize: '13px',
              color: isNewTask ? '#9CA3AF' : '#0A0A0A',
              position: 'relative'
            }}>
              <Calendar size={14} color="#6B7280" style={{
                position: 'absolute',
                left: '10px'
              }} />
              <span>{isNewTask ? 'Select date' : task.to || '31/12/25'}</span>
            </div>
          </div>
          <div>
            <label style={{
              display: 'block',
              fontSize: '11px',
              fontWeight: 600,
              color: '#6B7280',
              marginBottom: '4px',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              Task Hours
            </label>
            <div style={{
              height: '36px',
              background: 'white',
              border: '1px solid #E5E7EB',
              borderRadius: '6px',
              padding: '0 10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <input
                type="number"
                value={isNewTask ? '' : (task.hours || 320)}
                onChange={(e) => onUpdate({ hours: parseInt(e.target.value) })}
                placeholder={isNewTask ? '0' : undefined}
                style={{
                  border: 'none',
                  outline: 'none',
                  fontSize: '13px',
                  color: '#0A0A0A',
                  flex: 1,
                  background: 'transparent',
                  width: '50px'
                }}
              />
              <span style={{ fontSize: '12px', color: '#9CA3AF' }}>hours</span>
            </div>
          </div>
        </div>

        {/* Section 3: Progress - Compact */}
        <div style={{ marginBottom: '12px' }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '6px'
          }}>
            <label style={{
              fontSize: '11px',
              fontWeight: 600,
              color: '#6B7280',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              Progress
            </label>
            <span style={{
              fontSize: '18px',
              fontWeight: 700,
              color: '#3B82F6'
            }}>
              {progress}%
            </span>
          </div>
          <div style={{ position: 'relative' }}>
            <div style={{
              height: '6px',
              background: '#F0F0F0',
              borderRadius: '3px',
              overflow: 'hidden'
            }}>
              <div style={{
                width: `${progress}%`,
                height: '100%',
                background: '#3B82F6',
                transition: 'width 200ms ease'
              }} />
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={progress}
              onChange={(e) => {
                const value = parseInt(e.target.value);
                setProgress(value);
                onUpdate({ progress: value });
              }}
              style={{
                position: 'absolute',
                width: '100%',
                height: '16px',
                top: '-5px',
                opacity: 0,
                cursor: 'grab',
                zIndex: 2
              }}
            />
            <div style={{
              position: 'absolute',
              left: `${progress}%`,
              top: '50%',
              transform: 'translate(-50%, -50%)',
              width: '14px',
              height: '14px',
              background: '#3B82F6',
              border: '2px solid white',
              borderRadius: '50%',
              boxShadow: '0 2px 4px rgba(59,130,246,0.4)',
              pointerEvents: 'none'
            }} />
          </div>
        </div>

        {/* Section 4: Importance - Compact */}
        <div style={{ marginBottom: '12px' }}>
          <label style={{
            display: 'block',
            fontSize: '11px',
            fontWeight: 600,
            color: '#6B7280',
            marginBottom: '6px',
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }}>
            Importance
          </label>
          <div style={{ position: 'relative' }}>
            <div style={{
              position: 'relative',
              height: '6px',
              background: 'linear-gradient(to right, #10B981 0%, #F59E0B 50%, #DC2626 100%)',
              borderRadius: '3px',
              marginBottom: '4px'
            }}>
              <input
                type="range"
                min="0"
                max="100"
                value={importance}
                onChange={(e) => setImportance(parseInt(e.target.value))}
                style={{
                  position: 'absolute',
                  width: '100%',
                  height: '20px',
                  top: '-7px',
                  opacity: 0,
                  cursor: 'grab',
                  zIndex: 2
                }}
              />
              <div style={{
                position: 'absolute',
                left: `${importance}%`,
                top: '50%',
                transform: 'translate(-50%, -50%)',
                width: '18px',
                height: '18px',
                background: 'white',
                border: `3px solid ${getImportanceColor(importance)}`,
                borderRadius: '50%',
                boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
                pointerEvents: 'none'
              }} />
            </div>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: '11px',
              color: '#9CA3AF'
            }}>
              <span>Low</span>
              <span style={{
                fontSize: '12px',
                fontWeight: 600,
                color: getImportanceColor(importance)
              }}>
                {getImportanceLabel(importance)}
              </span>
              <span>High</span>
            </div>
          </div>
        </div>

        {/* Section 5: Alert & Checkboxes - Side by Side */}
        <div style={{ 
          display: 'grid',
          gridTemplateColumns: '2fr 1fr',
          gap: '12px',
          marginBottom: '12px'
        }}>
          <div>
            <label style={{
              display: 'block',
              fontSize: '11px',
              fontWeight: 600,
              color: '#6B7280',
              marginBottom: '4px',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              Alert Status
            </label>
            <div style={{
              height: '36px',
              background: 'white',
              border: '1px solid #E5E7EB',
              borderRadius: '6px',
              padding: '0 10px 0 28px',
              display: 'flex',
              alignItems: 'center',
              fontSize: '13px',
              color: '#9CA3AF',
              position: 'relative',
              cursor: 'pointer'
            }}>
              <div style={{
                position: 'absolute',
                left: '10px',
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: '#10B981'
              }} />
              <span style={{ fontSize: '13px' }}>Select...</span>
              <span style={{
                marginLeft: 'auto',
                fontSize: '12px',
                color: '#9CA3AF'
              }}>▼</span>
            </div>
          </div>
          <div>
            <label style={{
              display: 'block',
              fontSize: '11px',
              fontWeight: 600,
              color: '#6B7280',
              marginBottom: '4px',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              Options
            </label>
            <div style={{
              height: '36px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              <label style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                cursor: 'pointer'
              }}>
                <input
                  type="checkbox"
                  style={{
                    width: '16px',
                    height: '16px',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                />
                <span style={{ fontSize: '13px', color: '#0A0A0A' }}>Billable</span>
              </label>
              <label style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                cursor: 'pointer'
              }}>
                <input
                  type="checkbox"
                  style={{
                    width: '16px',
                    height: '16px',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                />
                <span style={{ fontSize: '13px', color: '#0A0A0A' }}>Time</span>
              </label>
            </div>
          </div>
        </div>

        {/* Section 6: Assigned To - Compact */}
        <div style={{ marginBottom: '12px' }}>
          <label style={{
            display: 'block',
            fontSize: '11px',
            fontWeight: 600,
            color: '#6B7280',
            marginBottom: '4px',
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }}>
            Assigned to
          </label>
          <div style={{
            height: '48px',
            background: '#F9FAFB',
            border: '1px solid #E5E7EB',
            borderRadius: '6px',
            padding: '6px 10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                background: '#3B82F6',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '14px',
                fontWeight: 600,
                color: 'white'
              }}>
                {task.avatars && task.avatars[0] ? task.avatars[0] : 'AC'}
              </div>
              <div>
                <div style={{
                  fontSize: '13px',
                  fontWeight: 500,
                  color: '#0A0A0A'
                }}>
                  Alice Chen
                </div>
                <div style={{
                  fontSize: '11px',
                  color: '#6B7280'
                }}>
                  Owner
                </div>
              </div>
            </div>
            <button style={{
              height: '28px',
              padding: '0 10px',
              border: '1px solid #3B82F6',
              borderRadius: '6px',
              background: 'white',
              color: '#3B82F6',
              fontSize: '12px',
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'all 150ms ease'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = '#EFF6FF'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'white'}
            >
              Change
            </button>
          </div>
        </div>

        {/* Section 7: Classification - Compact 2x2 Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '12px',
          marginBottom: '12px'
        }}>
          {['Labels', 'Skills', 'Expertise', 'Estimation'].map((field) => (
            <div key={field}>
              <label style={{
                display: 'block',
                fontSize: '11px',
                fontWeight: 600,
                color: '#6B7280',
                marginBottom: '4px',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                {field}
              </label>
              <div style={{
                height: '36px',
                background: 'white',
                border: '1px solid #E5E7EB',
                borderRadius: '6px',
                padding: '0 10px',
                display: 'flex',
                alignItems: 'center',
                fontSize: '13px',
                color: '#9CA3AF',
                cursor: 'pointer'
              }}>
                <span style={{
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  flex: 1
                }}>Select...</span>
                <span style={{
                  fontSize: '11px',
                  marginLeft: '4px'
                }}>▼</span>
              </div>
            </div>
          ))}
        </div>

        {/* Checklist Section - Only show if checklist exists */}
        {checklistItems && checklistItems.length > 0 && (
          <div style={{ marginBottom: '12px' }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '8px'
            }}>
              <label style={{
                fontSize: '11px',
                fontWeight: 600,
                color: '#6B7280',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}>
                <CheckSquare size={14} color="#60A5FA" />
                Checklist
              </label>
              <span style={{
                fontSize: '12px',
                fontWeight: 600,
                color: '#60A5FA'
              }}>
                {getChecklistProgress().completed} / {getChecklistProgress().total}
              </span>
            </div>
            <div style={{
              background: '#F9FAFB',
              border: '1px solid #E5E7EB',
              borderRadius: '6px',
              padding: '8px 12px'
            }}>
              {checklistItems.map((item: any, index: number) => (
                <label
                  key={item.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '6px 0',
                    borderBottom: index < checklistItems.length - 1 ? '1px solid #E5E7EB' : 'none',
                    cursor: 'pointer'
                  }}
                >
                  <input
                    type="checkbox"
                    checked={item.completed}
                    onChange={() => toggleChecklistItem(item.id)}
                    style={{
                      width: '16px',
                      height: '16px',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      accentColor: '#60A5FA',
                      flexShrink: 0
                    }}
                  />
                  <span style={{
                    fontSize: '13px',
                    color: item.completed ? '#9CA3AF' : '#0A0A0A',
                    textDecoration: item.completed ? 'line-through' : 'none',
                    flex: 1
                  }}>
                    {item.label}
                  </span>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Add New Checklist Item */}
        <div style={{ marginBottom: '12px' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <CheckSquare size={14} color="#60A5FA" />
            <input
              type="text"
              value={newChecklistItem}
              onChange={(e) => setNewChecklistItem(e.target.value)}
              onKeyPress={handleChecklistKeyPress}
              placeholder="Add checklist item..."
              style={{
                flex: 1,
                padding: '8px 12px',
                border: '1px solid #E5E7EB',
                borderRadius: '6px',
                fontSize: '13px',
                color: '#0A0A0A',
                fontFamily: 'inherit',
                outline: 'none'
              }}
              onFocus={(e) => e.currentTarget.style.borderColor = '#3B82F6'}
              onBlur={(e) => e.currentTarget.style.borderColor = '#E5E7EB'}
            />
            <button
              onClick={addChecklistItem}
              style={{
                background: '#60A5FA',
                border: 'none',
                borderRadius: '6px',
                padding: '8px 16px',
                color: 'white',
                fontSize: '13px',
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'background 150ms ease',
                whiteSpace: 'nowrap'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#3B82F6'}
              onMouseLeave={(e) => e.currentTarget.style.background = '#60A5FA'}
            >
              Add
            </button>
          </div>
        </div>

        {/* Section 8: Description - Compact */}
        <div>
          <label style={{
            display: 'block',
            fontSize: '11px',
            fontWeight: 600,
            color: '#6B7280',
            marginBottom: '4px',
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }}>
            Description
          </label>
          <textarea
            placeholder="Add task description..."
            style={{
              width: '100%',
              minHeight: '80px',
              padding: '10px',
              border: '1px solid #E5E7EB',
              borderRadius: '6px',
              fontSize: '13px',
              color: '#0A0A0A',
              lineHeight: '1.5',
              resize: 'vertical',
              fontFamily: 'inherit',
              outline: 'none'
            }}
            onFocus={(e) => e.currentTarget.style.borderColor = '#3B82F6'}
            onBlur={(e) => e.currentTarget.style.borderColor = '#E5E7EB'}
          />
        </div>

        {/* Flag Indicator if present */}
        {task.flag && (
          <div style={{
            height: '44px',
            background: '#FFF7ED',
            border: '1px solid #F97316',
            borderLeft: '3px solid #F97316',
            borderRadius: '6px',
            padding: '10px 12px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            marginTop: '12px'
          }}>
            <Flag size={16} color="#F97316" />
            <div style={{ flex: 1 }}>
              <span style={{
                fontSize: '13px',
                fontWeight: 600,
                color: '#F97316'
              }}>
                Flagged
              </span>
              <span style={{
                fontSize: '12px',
                color: '#EA580C',
                marginLeft: '8px'
              }}>
                1 active flag
              </span>
            </div>
            <button style={{
              background: 'transparent',
              border: 'none',
              fontSize: '12px',
              fontWeight: 500,
              color: '#F97316',
              cursor: 'pointer'
            }}>
              View →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}