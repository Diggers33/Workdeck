import React from 'react';
import { AppLayout } from '../../../components/layout/AppLayout';
import { TasksProvider } from '../../../contexts/TasksContext';
import { MyTasksBoard } from './MyTasksBoard';
import { Toaster } from 'sonner';

export default function MyTasksApp() {
  return (
    <TasksProvider>
      <AppLayout>
        <MyTasksBoard />
        <Toaster position="bottom-right" richColors />
      </AppLayout>
    </TasksProvider>
  );
}
