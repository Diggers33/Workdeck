import { LeaveType } from '../types';

export interface LeaveConfig {
  type: LeaveType;
  label: string;
  icon: string;
  color: string;
  background: string;
  textColor: string;
}

export const leaveConfigs: Record<LeaveType, LeaveConfig> = {
  vacation: {
    type: 'vacation',
    label: 'VACATION',
    icon: '🏖️',
    color: '#3B82F6',
    background: '#DBEAFE',
    textColor: '#3B82F6',
  },
  sick: {
    type: 'sick',
    label: 'SICK LEAVE',
    icon: '🤒',
    color: '#EF4444',
    background: '#FEE2E2',
    textColor: '#EF4444',
  },
  personal: {
    type: 'personal',
    label: 'PERSONAL DAY',
    icon: '🏠',
    color: '#8B5CF6',
    background: '#F3E8FF',
    textColor: '#8B5CF6',
  },
  holiday: {
    type: 'holiday',
    label: 'HOLIDAY',
    icon: '🎉',
    color: '#10B981',
    background: '#D1FAE5',
    textColor: '#10B981',
  },
  training: {
    type: 'training',
    label: 'TRAINING',
    icon: '📚',
    color: '#F59E0B',
    background: '#FEF3C7',
    textColor: '#F59E0B',
  },
  wfh: {
    type: 'wfh',
    label: 'WORK FROM HOME',
    icon: '🏡',
    color: '#06B6D4',
    background: '#CFFAFE',
    textColor: '#06B6D4',
  },
};

export function getLeaveConfig(type: LeaveType): LeaveConfig {
  return leaveConfigs[type];
}
