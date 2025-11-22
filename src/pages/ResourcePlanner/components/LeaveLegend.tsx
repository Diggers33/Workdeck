import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { leaveConfigs } from '../utils/leaveConfig';
import { Button } from './ui/button';

export function LeaveLegend() {
  const [isExpanded, setIsExpanded] = useState(false);
  
  return (
    <div className="relative">
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsExpanded(!isExpanded)}
        className="gap-2"
      >
        Legend
        {isExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
      </Button>
      
      {isExpanded && (
        <div
          className="absolute right-0 top-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 p-4"
          style={{ minWidth: '240px' }}
        >
          <div className="font-medium mb-3 text-sm" style={{ color: '#1F2937' }}>
            Leave Types:
          </div>
          <div className="space-y-2">
            {Object.values(leaveConfigs).map((config) => (
              <div
                key={config.type}
                className="flex items-center gap-2 text-sm"
              >
                <div
                  className="w-6 h-6 rounded flex items-center justify-center text-base"
                  style={{ background: config.background }}
                >
                  {config.icon}
                </div>
                <span style={{ color: '#6B7280' }}>
                  {config.label.charAt(0) + config.label.slice(1).toLowerCase()}
                </span>
                <div
                  className="w-3 h-3 rounded-full ml-auto"
                  style={{ background: config.color }}
                />
              </div>
            ))}
          </div>
          
          <div className="mt-3 pt-3 border-t border-gray-200 text-xs" style={{ color: '#9CA3AF' }}>
            <div className="flex items-center gap-2 mb-1">
              <span>⏳ Pending approval</span>
            </div>
            <div className="flex items-center gap-2">
              <span>❌ Denied request</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
