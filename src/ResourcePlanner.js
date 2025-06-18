import React, { useState } from 'react';
import { Calendar, Users, AlertTriangle } from 'lucide-react';

const ResourcePlanner = () => {
  const [showTaskDetails, setShowTaskDetails] = useState(true);
  const [selectedTask, setSelectedTask] = useState(null);
  const [currentWeekOffset, setCurrentWeekOffset] = useState(0);
  const [selectedView, setSelectedView] = useState('week');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [showAssignTaskModal, setShowAssignTaskModal] = useState(false);
  const [selectedMemberForAssignment, setSelectedMemberForAssignment] = useState(null);
  const [showSpreadsheetView, setShowSpreadsheetView] = useState(false);
  const [editingCell, setEditingCell] = useState(null);
  const [showPhaseTemplates, setShowPhaseTemplates] = useState(false);
  const [selectedMemberForTemplate, setSelectedMemberForTemplate] = useState(null);
  const [spreadsheetView, setSpreadsheetView] = useState('month');
  
  const [spreadsheetData, setSpreadsheetData] = useState({
    1: { 0: 20, 1: 20, 2: 0, 3: 0, 4: 0, 5: 15, 6: 15, 7: 0, 8: 0, 9: 0, 10: 0, 11: 0 },
    2: { 0: 25, 1: 25, 2: 25, 3: 0, 4: 0, 5: 0, 6: 30, 7: 30, 8: 0, 9: 0, 10: 0, 11: 0 },
    3: { 0: 15, 1: 15, 2: 15, 3: 15, 4: 0, 5: 0, 6: 0, 7: 0, 8: 20, 9: 20, 10: 0, 11: 0 }
  });

  const [projectSpreadsheetData, setProjectSpreadsheetData] = useState({
    1: { 'ai-platform': { 0: 20, 1: 20, 2: 0, 3: 0, 4: 0, 5: 15, 6: 15, 7: 0, 8: 0, 9: 0, 10: 0, 11: 0 } },
    2: { 'ai-platform': { 0: 25, 1: 25, 2: 25, 3: 0, 4: 0, 5: 0, 6: 30, 7: 30, 8: 0, 9: 0, 10: 0, 11: 0 } },
    3: { 'ai-platform': { 0: 15, 1: 15, 2: 15, 3: 15, 4: 0, 5: 0, 6: 0, 7: 0, 8: 20, 9: 20, 10: 0, 11: 0 } }
  });

  const teamMembers = [
    {
      id: 1,
      name: 'Alejandro Rosales',
      avatar: '👨‍💻',
      department: 'Engineering',
      capacity: 40,
      scheduled: 32,
      utilization: 80,
      tasks: [{
        id: 1,
        project: 'AI Platform',
        activity: 'Core Architecture',
        task: 'System Design & Planning',
        color: 'bg-purple-600',
        estimatedHours: 200,
        actualHours: 85,
        totalActivityHours: 300,
        totalProjectHours: 500,
        velocity: 7.3,
        status: 'in-progress',
        startWeek: -8,
        endWeek: 24,
        pattern: [true, true, false, false, true, true, false, true, true],
        isLongTerm: true,
        targetHoursPerWeek: 6.25,
        intensityPhases: [
          { name: 'Planning Phase', hoursPerWeek: 8, startWeek: -8, endWeek: -4 },
          { name: 'Implementation', hoursPerWeek: 6, startWeek: -3, endWeek: 12 },
          { name: 'Testing', hoursPerWeek: 4, startWeek: 13, endWeek: 24 }
        ],
        velocityHistory: [
          { week: -8, hoursLogged: 8 }, { week: -7, hoursLogged: 7 }, { week: -6, hoursLogged: 5 },
          { week: -5, hoursLogged: 9 }, { week: -4, hoursLogged: 6 }, { week: -3, hoursLogged: 8 },
          { week: -2, hoursLogged: 7 }, { week: -1, hoursLogged: 6 }, { week: 0, hoursLogged: 8 }
        ],
        milestones: [
          { name: 'Architecture Design', targetDate: '2025-02-01', status: 'completed', targetHours: 60 },
          { name: 'Core Implementation', targetDate: '2025-04-01', status: 'in-progress', targetHours: 120 },
          { name: 'Testing & Optimization', targetDate: '2025-06-01', status: 'planned', targetHours: 20 }
        ]
      }]
    },
    {
      id: 2,
      name: 'Sarah Kim',
      avatar: '👩‍💻',
      department: 'Engineering',
      capacity: 40,
      scheduled: 46,
      utilization: 115,
      tasks: [{
        id: 2,
        project: 'AI Platform',
        activity: 'ML Algorithms',
        task: 'Model Development',
        color: 'bg-purple-600',
        estimatedHours: 200,
        actualHours: 120,
        totalActivityHours: 250,
        totalProjectHours: 500,
        velocity: 8.2,
        status: 'in-progress',
        startWeek: -8,
        endWeek: 24,
        pattern: [true, true, false, false, true, true, true, true, true],
        isLongTerm: true,
        targetHoursPerWeek: 6.25,
        intensityPhases: [
          { name: 'Research Phase', hoursPerWeek: 12, startWeek: -8, endWeek: -2 },
          { name: 'Development', hoursPerWeek: 10, startWeek: -1, endWeek: 16 },
          { name: 'Optimization', hoursPerWeek: 5, startWeek: 17, endWeek: 24 }
        ],
        velocityHistory: [
          { week: -8, hoursLogged: 10 }, { week: -7, hoursLogged: 12 }, { week: -6, hoursLogged: 8 },
          { week: -5, hoursLogged: 11 }, { week: -4, hoursLogged: 9 }, { week: -3, hoursLogged: 13 },
          { week: -2, hoursLogged: 11 }, { week: -1, hoursLogged: 14 }, { week: 0, hoursLogged: 12 }
        ]
      }]
    },
    {
      id: 3,
      name: 'Dr. Raj Patel',
      avatar: '👨‍💻',
      department: 'Data Science',
      capacity: 40,
      scheduled: 38,
      utilization: 95,
      tasks: [{
        id: 3,
        project: 'AI Platform',
        activity: 'Data Pipeline',
        task: 'ETL Development',
        color: 'bg-purple-600',
        estimatedHours: 100,
        actualHours: 45,
        totalActivityHours: 150,
        totalProjectHours: 500,
        velocity: 6.8,
        status: 'in-progress',
        startWeek: -4,
        endWeek: 16,
        pattern: [true, true, false, false, true, true, true, true, false],
        isLongTerm: true,
        targetHoursPerWeek: 5,
        intensityPhases: [
          { name: 'Setup Phase', hoursPerWeek: 8, startWeek: -4, endWeek: 0 },
          { name: 'Core Development', hoursPerWeek: 6, startWeek: 1, endWeek: 12 },
          { name: 'Maintenance', hoursPerWeek: 3, startWeek: 13, endWeek: 16 }
        ],
        velocityHistory: [
          { week: -4, hoursLogged: 6 }, { week: -3, hoursLogged: 4 }, { week: -2, hoursLogged: 7 },
          { week: -1, hoursLogged: 5 }, { week: 0, hoursLogged: 3 }
        ]
      }]
    }
  ];

  const goToPreviousWeek = () => setCurrentWeekOffset(prev => prev - 1);
  const goToNextWeek = () => setCurrentWeekOffset(prev => prev + 1);
  const goToToday = () => setCurrentWeekOffset(0);

  const getTaskStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'text-green-700 bg-green-100 border-green-200';
      case 'in-progress': return 'text-blue-700 bg-blue-100 border-blue-200';
      case 'over-budget': return 'text-red-700 bg-red-100 border-red-200';
      case 'planned': return 'text-gray-600 bg-gray-100 border-gray-200';
      default: return 'text-gray-600 bg-gray-100 border-gray-200';
    }
  };

  const getRemainingHours = (task) => Math.max(0, task.estimatedHours - task.actualHours);

  const getUtilizationColor = (utilization) => {
    if (utilization > 100) return 'text-red-600 bg-red-50 border-red-200';
    if (utilization > 85) return 'text-orange-600 bg-orange-50 border-orange-200';
    if (utilization < 60) return 'text-blue-600 bg-blue-50 border-blue-200';
    return 'text-green-600 bg-green-50 border-green-200';
  };

  const getSpreadsheetColumns = () => {
    switch (spreadsheetView) {
      case 'week': return Array.from({ length: 52 }, (_, i) => `W${i + 1}`);
      case 'month': return ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      case 'quarter': return ['Q1 2025', 'Q2 2025', 'Q3 2025', 'Q4 2025'];
      case 'year': return ['2025'];
      default: return ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    }
  };

  const getSpreadsheetValue = (memberId, index, projectId = null) => {
    if (projectId) {
      const memberData = projectSpreadsheetData[memberId]?.[projectId] || {};
      return calculateValueForView(memberData, index);
    } else {
      const memberProjects = projectSpreadsheetData[memberId] || {};
      const totalData = {};
      Object.values(memberProjects).forEach(projectData => {
        Object.entries(projectData).forEach(([month, hours]) => {
          totalData[month] = (totalData[month] || 0) + hours;
        });
      });
      return calculateValueForView(totalData, index);
    }
  };

  const calculateValueForView = (memberData, index) => {
    switch (spreadsheetView) {
      case 'week':
        const monthIndex = Math.floor(index / 4.33);
        return memberData[monthIndex] || 0;
      case 'month':
        const weeklyHours = memberData[index] || 0;
        return Math.round(weeklyHours * 4.33);
      case 'quarter':
        const quarterMonths = [[0, 1, 2], [3, 4, 5], [6, 7, 8], [9, 10, 11]];
        const monthsInQuarter = quarterMonths[index] || [];
        return Math.round(monthsInQuarter.reduce((sum, monthIdx) => {
          const weeklyHours = memberData[monthIdx] || 0;
          return sum + (weeklyHours * 4.33);
        }, 0));
      case 'year':
        if (index === 0) {
          return Math.round(Object.values(memberData).reduce((sum, weeklyHours) => {
            return sum + (weeklyHours * 4.33);
          }, 0));
        }
        return 0;
      default:
        return memberData[index] || 0;
    }
  };

  const getCellColor = (hours) => {
    if (hours === 0) return 'bg-gray-100 text-gray-400';
    
    if (spreadsheetView === 'week') {
      if (hours <= 10) return 'bg-blue-100 text-blue-800';
      if (hours <= 20) return 'bg-green-100 text-green-800';
      if (hours <= 30) return 'bg-yellow-100 text-yellow-800';
      if (hours <= 40) return 'bg-orange-100 text-orange-800';
      return 'bg-red-100 text-red-800';
    } else if (spreadsheetView === 'month') {
      if (hours <= 43) return 'bg-blue-100 text-blue-800';
      if (hours <= 87) return 'bg-green-100 text-green-800';
      if (hours <= 130) return 'bg-yellow-100 text-yellow-800';
      if (hours <= 173) return 'bg-orange-100 text-orange-800';
      return 'bg-red-100 text-red-800';
    } else if (spreadsheetView === 'quarter') {
      if (hours <= 130) return 'bg-blue-100 text-blue-800';
      if (hours <= 260) return 'bg-green-100 text-green-800';
      if (hours <= 390) return 'bg-yellow-100 text-yellow-800';
      if (hours <= 520) return 'bg-orange-100 text-orange-800';
      return 'bg-red-100 text-red-800';
    } else if (spreadsheetView === 'year') {
      if (hours <= 520) return 'bg-blue-100 text-blue-800';
      if (hours <= 1040) return 'bg-green-100 text-green-800';
      if (hours <= 1560) return 'bg-yellow-100 text-yellow-800';
      if (hours <= 2080) return 'bg-orange-100 text-orange-800';
      return 'bg-red-100 text-red-800';
    }
    return 'bg-gray-100 text-gray-400';
  };

  const getMemberProjects = (memberId) => {
    const member = teamMembers.find(m => m.id === memberId);
    if (!member) return [];
    return member.tasks.map(task => ({
      id: task.project.toLowerCase().replace(/\s+/g, '-'),
      name: task.project,
      activity: task.activity,
      task: task.task,
      color: task.color
    }));
  };

  const handleProjectCellEdit = (memberId, projectId, columnIndex, value) => {
    const numValue = parseFloat(value);
    if (isNaN(numValue) || numValue < 0) return;
    
    const clampedValue = Math.min(numValue, 3000);
    
    if (spreadsheetView === 'week' || spreadsheetView === 'month') {
      let weeklyHours = clampedValue;
      if (spreadsheetView === 'month') {
        weeklyHours = clampedValue / 4.33;
      }
      
      setProjectSpreadsheetData(prev => ({
        ...prev,
        [memberId]: {
          ...prev[memberId],
          [projectId]: {
            ...prev[memberId]?.[projectId],
            [columnIndex]: Math.max(0, weeklyHours)
          }
        }
      }));
    }
  };

  const getDateRangeLabel = () => {
    if (selectedView === 'year') return '2025';
    if (selectedView === 'quarter') return 'Q4 2025 (Oct-Dec)';
    if (selectedView === 'month') return 'December 2025';
    if (currentWeekOffset === 0) return 'Dec 12-20, 2025';
    return `Dec 12-20, 2025 (${currentWeekOffset > 0 ? '+' : ''}${currentWeekOffset})`;
  };

  const getSpreadsheetLabel = () => {
    switch (spreadsheetView) {
      case 'week': return '52-Week Resource Planning';
      case 'month': return '12-Month Resource Planning';
      case 'quarter': return 'Quarterly Resource Planning';
      case 'year': return 'Annual Resource Planning';
      default: return '12-Month Resource Planning';
    }
  };

  const getUnitLabel = () => {
    switch (spreadsheetView) {
      case 'week': return 'hours per week';
      case 'month': return 'total hours for entire month';
      case 'quarter': return 'total hours for entire quarter';
      case 'year': return 'total hours for entire year';
      default: return 'hours per week';
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen" style={{ 
      fontFamily: '"Inter", "Segoe UI", "Roboto", "Helvetica Neue", "Arial", sans-serif',
      fontSize: '14px',
      lineHeight: '1.5'
    }}>
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <h1 className="text-xl font-semibold text-gray-900" style={{ fontWeight: '600' }}>Resource Planner</h1>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <Calendar className="w-4 h-4" />
              <span>{getDateRangeLabel()}</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-1 border border-gray-300 rounded-md">
              <button onClick={goToPreviousWeek} className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-l-md">
                Prev
              </button>
              <button onClick={goToToday} className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-800 hover:bg-gray-50 border-l border-r border-gray-300">
                Today
              </button>
              <button onClick={goToNextWeek} className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-r-md">
                Next
              </button>
            </div>
            
            <button 
              onClick={() => setShowTaskDetails(!showTaskDetails)} 
              className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              {showTaskDetails ? 'Hide Tasks' : 'Show Tasks'}
            </button>

            <button 
              onClick={() => setShowSpreadsheetView(!showSpreadsheetView)} 
              className={`px-3 py-1.5 text-sm font-medium border rounded-md ${
                showSpreadsheetView 
                  ? 'bg-blue-600 text-white border-blue-600' 
                  : 'text-gray-700 bg-white border-gray-300 hover:bg-gray-50'
              }`}
            >
              {showSpreadsheetView ? 'Timeline View' : 'Spreadsheet View'}
            </button>

            <select 
              value={showSpreadsheetView ? spreadsheetView : selectedView} 
              onChange={(e) => {
                if (showSpreadsheetView) {
                  setSpreadsheetView(e.target.value);
                } else {
                  setSelectedView(e.target.value);
                }
              }}
              className="text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md px-3 py-1.5"
            >
              <option value="week">Week View</option>
              <option value="month">Month View</option>
              <option value="quarter">Quarter View</option>
              <option value="year">Year View</option>
            </select>

            <select 
              value={selectedDepartment} 
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md px-3 py-1.5"
            >
              <option value="all">All Departments</option>
              <option value="Engineering">Engineering</option>
              <option value="Data Science">Data Science</option>
            </select>
            
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <Users className="w-4 h-4" />
              <span>3 team members</span>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {showSpreadsheetView ? (
          /* Spreadsheet View */
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="p-4 bg-gray-50 border-b">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">{getSpreadsheetLabel()}</h2>
                  <p className="text-sm text-gray-600">Click cells to edit {getUnitLabel()}. Use templates for quick setup.</p>
                </div>
                <div className="flex items-center space-x-4 text-sm">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-gray-100 rounded"></div>
                    <span>0h</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-blue-100 rounded"></div>
                    <span>{
                      spreadsheetView === 'year' ? '1-520h' : 
                      spreadsheetView === 'quarter' ? '1-130h' : 
                      spreadsheetView === 'month' ? '1-43h' :
                      '1-10h'
                    }</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-green-100 rounded"></div>
                    <span>{
                      spreadsheetView === 'year' ? '521-1040h' : 
                      spreadsheetView === 'quarter' ? '131-260h' : 
                      spreadsheetView === 'month' ? '44-87h' :
                      '11-20h'
                    }</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-yellow-100 rounded"></div>
                    <span>{
                      spreadsheetView === 'year' ? '1041-1560h' : 
                      spreadsheetView === 'quarter' ? '261-390h' : 
                      spreadsheetView === 'month' ? '88-130h' :
                      '21-30h'
                    }</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-orange-100 rounded"></div>
                    <span>{
                      spreadsheetView === 'year' ? '1561-2080h' : 
                      spreadsheetView === 'quarter' ? '391-520h' : 
                      spreadsheetView === 'month' ? '131-173h' :
                      '31-40h'
                    }</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-red-100 rounded"></div>
                    <span>{
                      spreadsheetView === 'year' ? '2080h+' : 
                      spreadsheetView === 'quarter' ? '520h+' : 
                      spreadsheetView === 'month' ? '173h+' :
                      '40h+'
                    }</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r">
                      Team Member
                    </th>
                    {getSpreadsheetColumns().map((column, idx) => (
                      <th key={idx} className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-r">
                        <div>{column}</div>
                        {spreadsheetView === 'month' && <div className="text-xs text-gray-400 font-normal">2025</div>}
                      </th>
                    ))}
                    <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {teamMembers.map((member) => {
                    const memberProjects = getMemberProjects(member.id);
                    
                    return (
                      <React.Fragment key={member.id}>
                        {/* Member Summary Row */}
                        <tr className="hover:bg-gray-50 bg-gray-25">
                          <td className="px-4 py-3 border-r bg-gray-50">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-sm text-white font-medium">
                                  {member.avatar}
                                </div>
                                <div>
                                  <div className="text-sm font-semibold text-gray-900">{member.name}</div>
                                  <div className="text-xs text-gray-500">{member.department}</div>
                                  <div className="text-xs text-blue-600 font-medium">Total Allocation</div>
                                </div>
                              </div>
                            </div>
                          </td>
                          {getSpreadsheetColumns().map((column, columnIdx) => {
                            const hours = getSpreadsheetValue(member.id, columnIdx);
                            return (
                              <td key={columnIdx} className="px-1 py-1 border-r bg-gray-50">
                                <div className={`w-full px-2 py-2 text-center text-sm font-bold rounded ${getCellColor(hours)}`}>
                                  {hours > 0 ? `${Math.round(hours)}h` : '—'}
                                </div>
                              </td>
                            );
                          })}
                          <td className="px-3 py-3 text-center bg-gray-50">
                            <div className="text-sm font-bold text-gray-900">
                              {Math.round(getSpreadsheetValue(member.id, 0))}h
                            </div>
                            <div className="text-xs text-gray-500">
                              Total
                            </div>
                          </td>
                        </tr>
                        
                        {/* Project Breakdown Rows */}
                        {memberProjects.map((project) => (
                          <tr key={`${member.id}-${project.id}`} className="hover:bg-gray-25">
                            <td className="px-4 py-2 border-r bg-white">
                              <div className="flex items-center space-x-3 ml-8">
                                <div className={`w-3 h-3 rounded-full ${project.color}`}></div>
                                <div>
                                  <div className="text-sm font-medium text-gray-800">{project.name}</div>
                                  <div className="text-xs text-gray-600">{project.activity} → {project.task}</div>
                                </div>
                              </div>
                            </td>
                            {getSpreadsheetColumns().map((column, columnIdx) => {
                              const hours = getSpreadsheetValue(member.id, columnIdx, project.id);
                              const isEditing = editingCell?.memberId === member.id && editingCell?.column === columnIdx && editingCell?.projectId === project.id;
                              return (
                                <td key={columnIdx} className="px-1 py-1 border-r">
                                  {isEditing ? (
                                    <input
                                      type="number"
                                      min="0"
                                      value={Math.round(hours)}
                                      onChange={(e) => handleProjectCellEdit(member.id, project.id, columnIdx, e.target.value)}
                                      onBlur={() => setEditingCell(null)}
                                      onKeyDown={(e) => {
                                        if (e.key === 'Enter' || e.key === 'Tab') {
                                          setEditingCell(null);
                                        }
                                        if (e.key === 'Escape') {
                                          setEditingCell(null);
                                        }
                                      }}
                                      autoFocus
                                      className="w-full px-2 py-1 text-center text-sm border border-blue-500 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                                    />
                                  ) : (
                                    <div
                                      onClick={() => setEditingCell({ memberId: member.id, column: columnIdx, projectId: project.id })}
                                      className={`w-full px-2 py-1.5 text-center text-sm font-medium cursor-pointer hover:ring-1 hover:ring-blue-300 rounded ${getCellColor(hours)}`}
                                    >
                                      {hours > 0 ? `${Math.round(hours)}h` : '—'}
                                    </div>
                                  )}
                                </td>
                              );
                            })}
                            <td className="px-3 py-2 text-center bg-white">
                              <div className="text-sm font-medium text-gray-800">
                                {Math.round(getSpreadsheetValue(member.id, 0, project.id))}h
                              </div>
                            </td>
                          </tr>
                        ))}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          /* Timeline View */
          <div className="mb-8">
            <div className="mb-4 p-3 bg-gray-800 text-white rounded">
              <h3 className="font-semibold">Engineering & Data Science</h3>
              <p className="text-sm text-gray-300">3 team members</p>
            </div>

            {teamMembers.map((member) => (
              <div key={member.id} className="mb-4">
                <div className="flex items-center justify-between mb-2 p-3 bg-white rounded border">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-sm">
                      {member.avatar}
                    </div>
                    <div>
                      <div className="font-medium text-sm">{member.name}</div>
                      <div className="text-xs text-gray-500">{member.scheduled}h / {member.capacity}h</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button className="px-2 py-1 text-xs font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded hover:bg-blue-100">
                      + Assign Task
                    </button>
                    <div className={`px-2 py-1 rounded text-xs font-medium border ${getUtilizationColor(member.utilization)}`}>
                      {member.utilization}%
                      {member.utilization > 100 && <AlertTriangle className="w-3 h-3 inline ml-1" />}
                    </div>
                  </div>
                </div>

                {showTaskDetails && (
                  <div className="ml-4 space-y-1">
                    {member.tasks.map((task, idx) => (
                      <div key={idx} className="flex items-center bg-white rounded border p-2 hover:shadow-md cursor-pointer">
                        <div className="w-72 flex-shrink-0">
                          <div className="flex items-start space-x-2">
                            <div className={`w-3 h-3 rounded-full ${task.color} mt-0.5`}></div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center space-x-2 mb-1">
                                <div className="text-sm font-medium truncate">{task.project}</div>
                                {task.isLongTerm && (
                                  <span className="px-1 py-0.5 text-xs bg-purple-100 text-purple-700 rounded border">
                                    Long-term
                                  </span>
                                )}
                                <button className="px-1.5 py-1 text-xs text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded border border-blue-200">
                                  Edit
                                </button>
                              </div>
                              <div className="text-xs text-gray-600 mb-1">
                                <span className="font-medium">{task.activity}</span>
                                <span className="text-gray-400 mx-1">→</span>
                                <span>{task.task}</span>
                              </div>
                              <div className="flex items-center space-x-2 text-xs text-gray-500 mb-1">
                                <span className="font-medium">{task.actualHours}h / {task.estimatedHours}h personal</span>
                                <span>•</span>
                                <span className="text-orange-600">{task.totalActivityHours}h activity</span>
                                <span>•</span>
                                <span className="text-purple-600">{task.totalProjectHours}h project</span>
                              </div>
                              <div className="flex items-center space-x-2 text-xs mb-1">
                                <span className="text-gray-500">Velocity:</span>
                                <span className="font-medium text-green-600">{task.velocity}h/week</span>
                                <span className="text-gray-400">(target: {task.targetHoursPerWeek}h/week)</span>
                              </div>
                              <span className={`inline-block px-1 py-0.5 text-xs rounded border ${getTaskStatusColor(task.status)}`}>
                                {task.status}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ResourcePlanner;
