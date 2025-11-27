import React, { useRef } from 'react';
import { AppLayout } from '../../../components/layout/AppLayout';
import { SpendingProvider } from '../../../contexts/SpendingContext';
import { SpendingView } from './SpendingView';

export default function SpendingApp() {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  return (
    <SpendingProvider>
      <AppLayout>
        <div ref={scrollContainerRef} style={{ height: '100%', overflow: 'auto' }}>
          <SpendingView scrollContainerRef={scrollContainerRef} />
        </div>
      </AppLayout>
    </SpendingProvider>
  );
}
