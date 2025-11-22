import { DayAllocation } from '../types';
import { getCapacityStatus, getCapacityColor } from '../utils/capacityUtils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { AlertCircle } from 'lucide-react';
import { format } from 'date-fns';

interface CapacityCellProps {
  allocation: DayAllocation;
  date?: Date;
  isWeekend?: boolean;
  onClick?: () => void;
}

export function CapacityCell({ allocation, date, isWeekend = false, onClick }: CapacityCellProps) {
  const status = getCapacityStatus(allocation.plannedHours, allocation.totalCapacity);
  const colorClass = getCapacityColor(status);
  const isOverallocated = allocation.plannedHours >= allocation.totalCapacity;
  const utilizationPercent = (allocation.plannedHours / allocation.totalCapacity) * 100;
  
  return (
    <TooltipProvider delayDuration={300}>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className={`min-w-[120px] h-12 border-l border-gray-200 flex items-center justify-center text-xs cursor-pointer transition-all hover:border-2 relative ${
              isWeekend ? 'bg-gray-50 border-dashed' : ''
            } ${colorClass}`}
            onClick={onClick}
            style={{
              borderRadius: '4px',
              padding: '8px',
            }}
          >
            {allocation.plannedHours > 0 ? (
              <div className="flex items-center gap-1">
                <span className="font-medium">
                  {allocation.plannedHours}h/{allocation.totalCapacity}h
                </span>
                {isOverallocated && (
                  <AlertCircle className="h-3 w-3 text-red-600 animate-pulse" />
                )}
              </div>
            ) : (
              <span className="text-gray-300">—</span>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-xs p-3">
          <div className="space-y-2">
            {date && (
              <div className="font-semibold border-b pb-1 mb-2">
                {format(date, 'EEEE, MMM d')}
              </div>
            )}
            <div className="space-y-1">
              {allocation.tasks.length > 0 && allocation.tasks.map(task => (
                <div key={task.id} className="text-xs">
                  • {task.name} ({task.plannedHours}h)
                </div>
              ))}
              {allocation.tasks.length === 0 && (
                <div className="text-xs text-gray-500">No tasks planned</div>
              )}
            </div>
            <div className="border-t pt-2 mt-2 text-xs">
              <div className="font-medium">
                Total: {allocation.plannedHours}h / {allocation.totalCapacity}h capacity
              </div>
              <div className={`flex items-center gap-1 mt-1 ${
                utilizationPercent < 50 ? 'text-green-600' :
                utilizationPercent < 100 ? 'text-amber-600' :
                'text-red-600'
              }`}>
                Status: {
                  utilizationPercent < 50 ? 'Available ✓' :
                  utilizationPercent < 100 ? 'Optimal ✓' :
                  'Overallocated !'
                }
              </div>
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}