/**
 * Events & Calendar API Service
 * Based on Workdeck API Complete Reference Guide
 */

import { apiGet, apiPost } from './apiClient';

// ==================== Types ====================

export interface EventEntity {
  id: string;
  title: string;
  description: string;

  startAt: string; // ISO 8601
  endAt: string;

  address: string;

  color: string;
  secondaryColor: string;

  private: boolean;
  billable: boolean;
  timesheet: boolean;

  externalMeeting: boolean;
  createWherebyRoom: boolean;
  wherebyRoomId?: string;

  planSync: boolean;

  task?: {
    id: string;
    name: string;
  };

  project?: {
    id: string;
    name: string;
  };

  creator: {
    id: string;
    fullName: string;
  };

  guests: Attendee[];
  externalGuests: ExternalUser[];

  leaveRequest?: LeaveRequestEntity;

  timezone: string; // Default: "Europe/Madrid"

  recurrence?: RecurrentEvent;
  recurrenceParentId?: string;
  isRecurrent: boolean;
  isMasterOfRecurrence: boolean;

  googleEventId?: string;

  state: number;
}

export interface Attendee {
  user: {
    id: string;
    fullName: string;
  };
  status: number; // 0=Pending, 1=Accepted, 2=Denied
}

export interface ExternalUser {
  email: string;
  name?: string;
}

export interface LeaveRequestEntity {
  id: string;
  leaveType: {
    id: string;
    name: string;
  };
  startDate: string;
  endDate: string;
  days: number;
  status: number;
}

export interface RecurrentEvent {
  frequency: 'daily' | 'weekly' | 'monthly';
  interval: number;
  endDate?: string;
}

// ==================== API Functions ====================

/**
 * Get events
 * GET /queries/events
 */
export async function getEvents(
  startDate: string, // DD/MM/YYYY
  endDate: string,
  userId?: string
): Promise<EventEntity[]> {
  let params = `?startDate=${startDate}&endDate=${endDate}`;
  if (userId) params += `&userId=${userId}`;
  return apiGet<EventEntity[]>(`/queries/events${params}`);
}

/**
 * Get single event
 * GET /queries/events/{eventId}
 */
export async function getEvent(eventId: string): Promise<EventEntity> {
  return apiGet<EventEntity>(`/queries/events/${eventId}`);
}

/**
 * Create event
 * POST /commands/sync/create-event
 */
export async function createEvent(event: {
  title: string;
  description?: string;
  startAt: string; // ISO 8601
  endAt: string;
  address?: string;
  color?: string;
  private?: boolean;
  billable?: boolean;
  timesheet?: boolean;
  task?: { id: string };
  project?: { id: string };
  guests?: { user: { id: string } }[];
  externalGuests?: { email: string }[];
  timezone?: string;
  recurrence?: RecurrentEvent;
}): Promise<EventEntity> {
  return apiPost<EventEntity>('/commands/sync/create-event', event);
}

/**
 * Update event
 * POST /commands/sync/update-event
 */
export async function updateEvent(
  id: string,
  updates: Partial<{
    title: string;
    description: string;
    startAt: string;
    endAt: string;
    address: string;
    color: string;
    private: boolean;
    billable: boolean;
    timesheet: boolean;
    task: { id: string };
    project: { id: string };
    guests: { user: { id: string } }[];
    externalGuests: { email: string }[];
  }>
): Promise<void> {
  return apiPost('/commands/sync/update-event', { id, ...updates });
}

/**
 * Delete event
 * POST /commands/sync/delete-event
 */
export async function deleteEvent(id: string): Promise<void> {
  return apiPost('/commands/sync/delete-event', { id });
}

/**
 * Get recommended time slots
 * GET /queries/events/recommend-time
 */
export async function getRecommendedTimeSlots(
  date: string, // DD/MM/YYYY
  duration: number, // minutes
  participants: string[] // user IDs
): Promise<{
  slots: {
    startTime: string;
    endTime: string;
    available: boolean;
  }[];
}> {
  const params = `?date=${date}&duration=${duration}&participants=${participants.join(',')}`;
  return apiGet(`/queries/events/recommend-time${params}`);
}

