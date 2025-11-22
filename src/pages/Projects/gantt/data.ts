import { GanttActivity, GanttWeek } from './types';

export const WEEKS: GanttWeek[] = [
  { label: 'Jan 15', isToday: false },
  { label: 'Jan 22', isToday: true },
  { label: 'Jan 29', isToday: false },
  { label: 'Feb 5', isToday: false },
  { label: 'Feb 12', isToday: false },
  { label: 'Feb 18', isToday: false },
  { label: 'Feb 25', isToday: false },
  { label: 'Mar 3', isToday: false },
  { label: 'Mar 10', isToday: false },
  { label: 'Mar 17', isToday: false },
  { label: 'Mar 24', isToday: false },
  { label: 'Mar 31', isToday: false }
];

export const INITIAL_TASKS: GanttActivity[] = [
  {
    id: 'WP1',
    type: 'activity',
    name: 'WP1 Research',
    duration: '6 weeks',
    borderColor: '#60A5FA',
    expanded: false,
    startWeek: 0,
    durationWeeks: 6,
    barColor: '#60A5FA',
    milestones: [
      {
        id: 'M1.1',
        name: 'Research Phase Complete',
        week: 5,
        status: 'upcoming',
        dueDate: 'Feb 18, 2024'
      }
    ],
    children: [
      {
        id: 'T1.1',
        name: 'Literature review',
        avatars: ['CD', 'BR'],
        hours: '32h / 40h',
        hoursColor: '#34D399',
        startWeek: 0,
        durationWeeks: 2,
        progress: 80,
        barColor: '#60A5FA',
        completed: true,
        type: 'task',
        outOfScheduleWork: {
          beforeStart: 0.5 // Work started half a week early
        }
      },
      {
        id: 'T1.2',
        name: 'Data collection',
        avatars: ['AC'],
        hours: '18h / 30h',
        hoursColor: '#34D399',
        startWeek: 1,
        durationWeeks: 2,
        progress: 60,
        barColor: '#60A5FA',
        flag: true,
        flagWeek: 3, // Flag at week 3 (end of task)
        completed: false,
        type: 'task',
        milestones: [
          {
            id: 'M1.2',
            name: 'Data Collection Complete',
            week: 3, // Same week as the end of the task (startWeek 1 + durationWeeks 2 = week 3)
            status: 'upcoming',
            dueDate: 'Feb 5, 2024'
          }
        ]
      },
      {
        id: 'T1.3',
        name: 'Analysis framework',
        avatars: ['CD', 'JD'],
        hours: '45h / 40h',
        hoursColor: '#F87171',
        startWeek: 2,
        durationWeeks: 2,
        progress: 112,
        barColor: '#F87171',
        striped: true,
        warning: true,
        completed: false,
        type: 'task',
        timeExceeded: true // Exceeded allocated time
      },
      {
        id: 'T1.4',
        name: 'Preliminary report',
        avatars: ['BR'],
        hours: '0h / 20h',
        hoursColor: '#9CA3AF',
        startWeek: 3,
        durationWeeks: 2,
        progress: 0,
        barColor: '#BFDBFE',
        completed: false,
        type: 'task'
      }
    ]
  },
  {
    id: 'WP2',
    type: 'activity',
    name: 'WP2 Development',
    taskCount: 6,
    duration: '8 weeks',
    borderColor: '#34D399',
    expanded: false,
    startWeek: 2,
    durationWeeks: 8,
    barColor: '#34D399',
    milestones: [
      {
        id: 'M2.1',
        name: 'MVP Ready',
        week: 6,
        status: 'upcoming',
        dueDate: 'Mar 3, 2024'
      },
      {
        id: 'M2.2',
        name: 'Development Complete',
        week: 10,
        status: 'upcoming',
        dueDate: 'Mar 31, 2024'
      }
    ],
    children: [
      {
        id: 'T2.1',
        name: 'Backend API design',
        avatars: ['JD', 'AC'],
        hours: '24h / 40h',
        hoursColor: '#34D399',
        startWeek: 2,
        durationWeeks: 2,
        progress: 60,
        barColor: '#34D399',
        completed: false,
        type: 'task'
      },
      {
        id: 'T2.2',
        name: 'Database schema setup',
        avatars: ['JD'],
        hours: '16h / 20h',
        hoursColor: '#34D399',
        startWeek: 3,
        durationWeeks: 1,
        progress: 80,
        barColor: '#34D399',
        completed: false,
        type: 'task'
      },
      {
        id: 'T2.3',
        name: 'Frontend components',
        avatars: ['AC', 'BR'],
        hours: '48h / 60h',
        hoursColor: '#34D399',
        startWeek: 4,
        durationWeeks: 3,
        progress: 75,
        barColor: '#34D399',
        completed: false,
        type: 'task',
        outOfScheduleWork: {
          afterEnd: 0.5 // Work continued half a week after scheduled end
        }
      },
      {
        id: 'T2.4',
        name: 'Authentication module',
        avatars: ['JD'],
        hours: '12h / 30h',
        hoursColor: '#34D399',
        startWeek: 5,
        durationWeeks: 2,
        progress: 40,
        barColor: '#34D399',
        flag: true,
        flagWeek: 7, // Flag at week 7 (end of task)
        completed: false,
        type: 'task'
      },
      {
        id: 'T2.5',
        name: 'API integration',
        avatars: ['AC', 'JD'],
        hours: '0h / 25h',
        hoursColor: '#9CA3AF',
        startWeek: 7,
        durationWeeks: 2,
        progress: 0,
        barColor: '#BFDBFE',
        completed: false,
        type: 'task'
      },
      {
        id: 'T2.6',
        name: 'Performance optimization',
        avatars: ['BR', 'AC'],
        hours: '0h / 35h',
        hoursColor: '#9CA3AF',
        startWeek: 8,
        durationWeeks: 2,
        progress: 0,
        barColor: '#BFDBFE',
        completed: false,
        type: 'task'
      }
    ]
  },
  {
    id: 'WP3',
    type: 'activity',
    name: 'WP3 Testing',
    taskCount: 5,
    duration: '4 weeks',
    borderColor: '#FB923D',
    expanded: false,
    startWeek: 7,
    durationWeeks: 4,
    barColor: '#FB923D',
    milestones: [
      {
        id: 'M3.1',
        name: 'Ready for Production',
        week: 11,
        status: 'upcoming',
        dueDate: 'Apr 7, 2024'
      }
    ],
    children: [
      {
        id: 'T3.1',
        name: 'Unit test coverage',
        avatars: ['CD', 'AC'],
        hours: '0h / 30h',
        hoursColor: '#9CA3AF',
        startWeek: 7,
        durationWeeks: 2,
        progress: 0,
        barColor: '#BFDBFE',
        completed: false,
        type: 'task'
      },
      {
        id: 'T3.2',
        name: 'Integration testing',
        avatars: ['JD'],
        hours: '0h / 25h',
        hoursColor: '#9CA3AF',
        startWeek: 8,
        durationWeeks: 2,
        progress: 0,
        barColor: '#BFDBFE',
        completed: false,
        type: 'task'
      },
      {
        id: 'T3.3',
        name: 'User acceptance testing',
        avatars: ['BR', 'CD'],
        hours: '0h / 40h',
        hoursColor: '#9CA3AF',
        startWeek: 9,
        durationWeeks: 1,
        progress: 0,
        barColor: '#BFDBFE',
        completed: false,
        type: 'task'
      },
      {
        id: 'T3.4',
        name: 'Performance benchmarks',
        avatars: ['AC'],
        hours: '0h / 20h',
        hoursColor: '#9CA3AF',
        startWeek: 9,
        durationWeeks: 1,
        progress: 0,
        barColor: '#BFDBFE',
        flag: true,
        flagWeek: 10, // Flag at week 10 (end of task)
        completed: false,
        type: 'task'
      },
      {
        id: 'T3.5',
        name: 'Bug fixes & refinement',
        avatars: ['JD', 'AC', 'BR'],
        hours: '0h / 45h',
        hoursColor: '#9CA3AF',
        startWeek: 10,
        durationWeeks: 1,
        progress: 0,
        barColor: '#BFDBFE',
        completed: false,
        type: 'task'
      }
    ]
  }
];