import React, { useRef } from 'react';
import { AppLayout } from '../../../components/layout/AppLayout';
import { BillingProvider } from '../../../contexts/BillingContext';
import { BillingView } from './BillingView';

export default function BillingApp() {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  return (
    <BillingProvider>
      <AppLayout>
        <div ref={scrollContainerRef} style={{ height: '100%', overflow: 'auto' }}>
          <BillingView scrollContainerRef={scrollContainerRef} />
        </div>
      </AppLayout>
    </BillingProvider>
  );
}
