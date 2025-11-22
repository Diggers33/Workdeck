import { useState } from 'react';
import { X, ArrowRight, TrendingUp, CheckCircle2, AlertCircle } from 'lucide-react';
import { AIRecommendation } from '../types';
import { Button } from './ui/button';
import { Checkbox } from './ui/checkbox';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { motion, AnimatePresence } from 'framer-motion';

interface SimulationPanelProps {
  recommendations: AIRecommendation[];
  currentUtilization: number;
  onClose: () => void;
  onApply: (selectedIds: string[]) => void;
}

export function SimulationPanel({
  recommendations,
  currentUtilization,
  onClose,
  onApply,
}: SimulationPanelProps) {
  const [selectedRecommendations, setSelectedRecommendations] = useState<Set<string>>(
    new Set(recommendations.map(r => r.id))
  );
  
  const toggleRecommendation = (id: string) => {
    const newSet = new Set(selectedRecommendations);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedRecommendations(newSet);
  };
  
  const totalImpact = recommendations
    .filter(r => selectedRecommendations.has(r.id))
    .reduce((sum, r) => sum + r.impact, 0);
  
  const projectedUtilization = currentUtilization + totalImpact;
  
  return (
    <AnimatePresence>
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="fixed right-0 top-0 bottom-0 w-[600px] bg-white shadow-2xl border-l border-gray-200 z-50 flex flex-col"
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-blue-600" />
                AI Optimization Results
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                {recommendations.length} recommendations found
              </p>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          {/* Before/After Comparison */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="text-sm text-gray-600 mb-1">Current Utilization</div>
              <div className="text-2xl font-semibold">
                {currentUtilization.toFixed(1)}%
              </div>
            </div>
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="text-sm text-green-700 mb-1">Projected Utilization</div>
              <div className="text-2xl font-semibold text-green-700 flex items-center gap-2">
                {projectedUtilization.toFixed(1)}%
                <TrendingUp className="h-5 w-5" />
              </div>
            </div>
          </div>
          
          <div className="mt-4 flex items-center gap-2 text-sm">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <span className="text-green-700">
              +{totalImpact.toFixed(1)}% improvement with selected changes
            </span>
          </div>
        </div>
        
        {/* Recommendations List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-3">
          {recommendations.map((rec, index) => (
            <motion.div
              key={rec.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`p-4 border rounded-lg transition-all ${
                selectedRecommendations.has(rec.id)
                  ? 'border-blue-300 bg-blue-50'
                  : 'border-gray-200 bg-white'
              }`}
            >
              <div className="flex items-start gap-3">
                <Checkbox
                  checked={selectedRecommendations.has(rec.id)}
                  onCheckedChange={() => toggleRecommendation(rec.id)}
                  className="mt-1"
                />
                
                <div className="flex-1 space-y-2">
                  {/* Task and Project */}
                  <div>
                    <div className="font-medium">{rec.taskName}</div>
                    <div className="text-xs text-gray-600">{rec.projectName}</div>
                  </div>
                  
                  {/* User Reassignment */}
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-gray-700">{rec.currentUserName}</span>
                    <ArrowRight className="h-4 w-4 text-gray-400" />
                    <span className="font-medium text-blue-700">{rec.recommendedUserName}</span>
                  </div>
                  
                  {/* Hours and Dates */}
                  <div className="flex items-center gap-4 text-xs text-gray-600">
                    <span>{rec.hours}h</span>
                    <span>•</span>
                    <span>
                      {rec.newStartDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} -{' '}
                      {rec.newEndDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                  
                  {/* Reason */}
                  <div className="text-sm text-gray-700 bg-white p-2 rounded border border-gray-100">
                    {rec.reason}
                  </div>
                  
                  {/* Impact Badge */}
                  <Badge variant="secondary" className="bg-green-100 text-green-700">
                    +{rec.impact.toFixed(1)}% billable utilization
                  </Badge>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
        
        {/* Footer Actions */}
        <div className="p-6 border-t border-gray-200 space-y-3">
          {selectedRecommendations.size === 0 && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Select at least one recommendation to apply changes
              </AlertDescription>
            </Alert>
          )}
          
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button
              onClick={() => onApply(Array.from(selectedRecommendations))}
              disabled={selectedRecommendations.size === 0}
              className="flex-1"
            >
              Apply {selectedRecommendations.size} Change{selectedRecommendations.size !== 1 ? 's' : ''}
            </Button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
