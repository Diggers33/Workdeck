import React from 'react';
import { CheckCircle2, ArrowRight, Clock } from 'lucide-react';
import { CategoryConfig } from '../../data/settings-categories';

interface EssentialCategoryCardProps {
  category: CategoryConfig;
  isNextAction: boolean;
  onClick: () => void;
}

export function EssentialCategoryCard({ category, isNextAction, onClick }: EssentialCategoryCardProps) {
  const Icon = category.icon;
  
  const borderClass = category.completed
    ? 'border-[#34D399] hover:border-[#10B981]'
    : isNextAction
    ? 'border-[#0066FF] hover:border-[#0052CC] shadow-md'
    : 'border-[#E5E7EB] hover:border-[#D1D5DB]';

  const iconBgClass = category.completed
    ? 'bg-[#D1FAE5]'
    : isNextAction
    ? 'bg-[#0066FF] group-hover:scale-110 transition-transform'
    : 'bg-[#F0F4FF]';

  const iconColorClass = category.completed
    ? 'text-[#34D399]'
    : isNextAction
    ? 'text-white'
    : 'text-[#0066FF]';

  const actionColorClass = category.completed
    ? 'text-[#6B7280]'
    : 'text-[#0066FF]';

  return (
    <button
      onClick={onClick}
      className={`bg-white rounded-lg p-2 text-left hover:shadow-lg transition-all border-2 group relative ${borderClass}`}
    >
      {/* Priority Badge */}
      <div className="absolute top-1.5 right-1.5 flex items-center gap-2">
        {category.completed ? (
          <div className="flex items-center gap-1 text-[8px] font-medium text-[#34D399] bg-[#D1FAE5] px-1.5 py-0 rounded-full">
            <CheckCircle2 className="w-2.5 h-2.5" />
            Done
          </div>
        ) : isNextAction ? (
          <div className="flex items-center gap-1 text-[8px] font-medium text-[#0066FF] bg-[#F0F4FF] px-1.5 py-0 rounded-full animate-pulse">
            <ArrowRight className="w-2.5 h-2.5" />
            Do this next
          </div>
        ) : (
          <div className="w-3.5 h-3.5 rounded-full border border-[#E5E7EB] bg-white flex items-center justify-center">
            <span className="text-[8px] font-medium text-[#9CA3AF]">{category.priority}</span>
          </div>
        )}
      </div>

      {/* Icon */}
      <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 ${iconBgClass}`}>
        <Icon className={`w-6 h-6 ${iconColorClass}`} />
      </div>

      {/* Content */}
      <div className="mb-4">
        <h3 className="text-[16px] font-medium text-[#1F2937] mb-1">
          {category.name}
        </h3>
        <p className="text-[13px] text-[#6B7280] mb-2">
          {category.description}
        </p>
        
        <div className="mt-3 pt-3 border-t border-[#E5E7EB]">
          <p className={`text-[13px] font-medium text-[#1F2937] mb-1 ${category.completed ? '' : ''}`}>
            {category.summary}
          </p>
          <p className="text-[9px] text-[#6B7280]">
            {category.details}
          </p>
        </div>
      </div>

      {/* CTA */}
      <div className="flex items-center justify-between ml-8.5">
        <div className="flex items-center gap-1 text-[9px] text-[#9CA3AF]">
          <Clock className="w-2.5 h-2.5" />
          {category.timeEstimate}
        </div>
        <div className={`flex items-center gap-1 text-[10px] font-medium ${actionColorClass} ${isNextAction ? 'group-hover:gap-2' : ''} transition-all`}>
          {category.action}
          <ArrowRight className="w-2.5 h-2.5" />
        </div>
      </div>
    </button>
  );
}
