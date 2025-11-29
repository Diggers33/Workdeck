# API Integration Guide

This document describes how the frontend is now connected to the Workdeck backend API.

## Overview

The frontend has been updated to use real API calls instead of hardcoded mock data. All API services are organized in `src/services/` and follow the Workdeck API Complete Reference Guide.

## API Services Created

### Core Services

1. **`apiClient.ts`** - Base API client with:
   - Authentication headers
   - Response unwrapping (`{ status: "OK", result: data }`)
   - Error handling
   - Timeout support
   - Date formatting utilities

2. **`authService.ts`** - Authentication (already existed, enhanced)

### Domain Services

3. **`projectsApi.ts`** - Projects and Activities
   - `getProjects()` - Get all projects
   - `createProjectActivity()` - Create activity
   - `updateProject()` - Update project
   - And more...

4. **`tasksApi.ts`** - Task Management
   - `getTasks()` - Get all tasks
   - `getUserTasks()` - Get user-specific tasks
   - `createTask()` - Create task
   - `updateTask()` - Update task
   - `moveTask()` - Move task between columns
   - And more...

5. **`usersApi.ts`** - Users & Staff
   - `getUsers()` - Get all users
   - `getCurrentUser()` - Get current user
   - `getDepartments()` - Get departments
   - `getStaffCategories()` - Get staff categories
   - And more...

6. **`timesheetsApi.ts`** - Time Tracking
   - `getMyTimesheets()` - Get current user's timesheets
   - `getTimesheets()` - Get all timesheets
   - `createTimesheet()` - Create timesheet entry
   - And more...

7. **`eventsApi.ts`** - Calendar & Events
   - `getEvents()` - Get calendar events
   - `createEvent()` - Create event
   - `updateEvent()` - Update event
   - And more...

8. **`filesApi.ts`** - File Management
   - `getFiles()` - Get files for entity
   - `uploadFile()` - Upload file (2-step process)
   - `deleteFile()` - Delete file
   - And more...

9. **`commentsApi.ts`** - Comments & Notes
   - `getComments()` - Get comments for entity
   - `createComment()` - Create comment
   - `updateComment()` - Update comment
   - And more...

10. **`expensesApi.ts`** - Expenses
    - `getExpenses()` - Get expenses
    - `createExpense()` - Create expense
    - `approveExpense()` - Approve expense
    - And more...

11. **`budgetsApi.ts`** - Budget Management
    - `createProjectBudget()` - Create budget
    - `getCurrencies()` - Get currencies
    - `getCostTypes()` - Get cost types
    - And more...

12. **`milestonesApi.ts`** - Milestones
    - `getMilestones()` - Get milestones
    - `createProjectMilestone()` - Create milestone
    - `updateMilestone()` - Update milestone
    - And more...

13. **`leaveApi.ts`** - Leave & Travel
    - `getMyLeaveRequests()` - Get my leave requests
    - `getTeamLeaveRequests()` - Get team leave requests
    - `createLeaveRequest()` - Create leave request
    - And more...

14. **`resourcePlannerApi.ts`** - Resource Planner Integration
    - `fetchResourcePlannerData()` - Fetches and transforms all data for Resource Planner
    - Maps API data to Resource Planner component format

## Updated Components

### Resource Planner

**File:** `src/pages/ResourcePlanner/ResourcePlannerApp.tsx`

**Changes:**
- Removed mock data imports
- Added `useEffect` to fetch data on mount
- Added loading and error states
- Uses `fetchResourcePlannerData()` to get users, tasks, projects, and leaves
- Task updates now call API

**Before:**
```typescript
import { mockUsers, mockTasks, mockProjects, mockLeaves } from './data/mockData';
const [tasks, setTasks] = useState(mockTasks);
```

**After:**
```typescript
import { fetchResourcePlannerData } from '../../../services/resourcePlannerApi';
const [tasks, setTasks] = useState<Task[]>([]);
// Fetches from API in useEffect
```

## API Configuration

### Base URL

The API base URL is configured via environment variable:

```typescript
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://test-api.workdeck.com';
```

Set in `.env` file:
```
VITE_API_URL=https://test-api.workdeck.com
```

### Authentication

All API requests (except login) require a Bearer token:

```typescript
Authorization: Bearer <token>
```

The token is stored in localStorage with the "Bearer " prefix and automatically added to all requests via `getAuthHeaders()`.

## Response Format

All API responses follow this format:

```typescript
{
  status: "OK" | "KO" | "ERROR",
  result: <actual data>,
  errors?: ApiError[]
}
```

The `apiClient.ts` automatically unwraps `response.result` so you get the actual data directly.

## Date Formats

- **Request Format:** `DD/MM/YYYY` (e.g., "15/01/2025")
- **Response Dates:** `DD/MM/YYYY`
- **Response DateTimes:** ISO 8601 (e.g., "2025-01-15T10:30:00Z")

Use `formatDate()` and `parseDate()` utilities from `apiClient.ts` for conversions.

## Error Handling

The API client handles:
- 401 Unauthorized - Automatically logs out user
- Timeout errors (15s default)
- API-level errors (status: "ERROR")
- Network errors

## Next Steps

### Still Using Mock Data

These components still need API integration:

1. **Projects/Gantt Views**
   - `src/pages/Projects/gantt/modal-tabs/TaskCommentsTab.tsx` - Uses mock comments
   - `src/pages/Projects/gantt/modal-tabs/TaskFilesTab.tsx` - Uses mock files
   - `src/pages/Projects/gantt/project-tabs/ProjectCommentsTab.tsx` - Uses mock comments
   - `src/pages/Projects/gantt/project-tabs/ProjectFilesTab.tsx` - Uses mock files

2. **Finance/Billing**
   - `src/pages/Finance/Billing/InvoiceCreationFlow.tsx` - Uses mock time entries, expenses, milestones
   - `src/contexts/BillingContext.tsx` - Uses mock invoices

3. **Finance/Spending**
   - `src/contexts/SpendingContext.tsx` - Uses mock spending requests

4. **Time/Calendar**
   - `src/pages/Time/Calendar/WorkdeckCalendar.tsx` - Uses dummy events

5. **Work/MyTasks**
   - `src/pages/Work/MyTasks/MyTasksBoard.tsx` - Uses sample data

### How to Integrate

1. Import the appropriate API service:
   ```typescript
   import { getComments, createComment } from '../../../services/commentsApi';
   ```

2. Replace mock data with API calls:
   ```typescript
   // Before
   const [comments, setComments] = useState(mockComments);
   
   // After
   useEffect(() => {
     async function loadComments() {
       const data = await getComments('task', taskId);
       setComments(data);
     }
     loadComments();
   }, [taskId]);
   ```

3. Update handlers to call API:
   ```typescript
   const handleSave = async (comment: Comment) => {
     await createComment('task', {
       entityId: taskId,
       text: comment.text,
     });
     // Refresh comments
   };
   ```

## Testing

To test the API integration:

1. Ensure you're logged in (token in localStorage)
2. Check browser console for API calls
3. Verify data loads from API instead of mock data
4. Test create/update/delete operations

## Troubleshooting

### API calls failing

1. Check if token exists: `localStorage.getItem('api-token')`
2. Verify API URL: Check `VITE_API_URL` in `.env`
3. Check browser console for errors
4. Verify CORS settings on backend

### Data not loading

1. Check network tab for failed requests
2. Verify API response format matches expected structure
3. Check if data transformation is correct in `resourcePlannerApi.ts`

### Type errors

1. Ensure TypeScript types match API response
2. Update types in service files if API structure differs
3. Use type assertions if needed: `data as ExpectedType`

## Summary

✅ **Completed:**
- Base API client with authentication
- All domain API services created
- Resource Planner connected to API
- Error handling and loading states

⏳ **Remaining:**
- Projects/Gantt views
- Finance modules
- Time/Calendar
- Work/MyTasks

All API services are ready to use - just import and call them in your components!

