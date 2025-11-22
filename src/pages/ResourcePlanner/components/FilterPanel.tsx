import { useState } from 'react';
import { X, ChevronDown, ChevronRight } from 'lucide-react';
import { Button } from './ui/button';
import { Checkbox } from './ui/checkbox';
import { Label } from './ui/label';
import { Slider } from './ui/slider';
import { Badge } from './ui/badge';

interface FilterPanelProps {
  isOpen: boolean;
  onClose: () => void;
  departments: string[];
  onApplyFilters: (filters: FilterState) => void;
}

export interface FilterState {
  departments: string[];
  utilizationRange: [number, number];
  utilizationPreset?: 'overallocated' | 'underutilized' | 'optimal';
  availabilityRange?: { start: Date; end: Date };
  skills: string[];
  costRange: [number, number];
  roles: string[];
}

const INITIAL_FILTERS: FilterState = {
  departments: [],
  utilizationRange: [0, 150],
  skills: [],
  costRange: [0, 200],
  roles: [],
};

const SAVED_FILTERS = [
  { id: 1, name: '🔴 Overallocated team', icon: '🔴' },
  { id: 2, name: '🟢 Bench (available)', icon: '🟢' },
  { id: 3, name: '⭐ Senior engineers', icon: '⭐' },
];

const AVAILABLE_SKILLS = ['React', 'Python', 'TypeScript', 'Node.js', 'AWS', 'Design', 'Project Management'];
const AVAILABLE_ROLES = ['Developer', 'Designer', 'Manager', 'Product Owner'];

export function FilterPanel({ isOpen, onClose, departments, onApplyFilters }: FilterPanelProps) {
  const [filters, setFilters] = useState<FilterState>(INITIAL_FILTERS);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(['department', 'utilization'])
  );
  const [showSavedFilters, setShowSavedFilters] = useState(false);

  const toggleSection = (section: string) => {
    setExpandedSections(prev => {
      const next = new Set(prev);
      if (next.has(section)) {
        next.delete(section);
      } else {
        next.add(section);
      }
      return next;
    });
  };

  const toggleDepartment = (dept: string) => {
    setFilters(prev => ({
      ...prev,
      departments: prev.departments.includes(dept)
        ? prev.departments.filter(d => d !== dept)
        : [...prev.departments, dept],
    }));
  };

  const toggleRole = (role: string) => {
    setFilters(prev => ({
      ...prev,
      roles: prev.roles.includes(role)
        ? prev.roles.filter(r => r !== role)
        : [...prev.roles, role],
    }));
  };

  const setUtilizationPreset = (preset: 'overallocated' | 'underutilized' | 'optimal') => {
    const ranges = {
      overallocated: [100, 150] as [number, number],
      underutilized: [0, 50] as [number, number],
      optimal: [50, 99] as [number, number],
    };
    setFilters(prev => ({
      ...prev,
      utilizationRange: ranges[preset],
      utilizationPreset: preset,
    }));
  };

  const clearAll = () => {
    setFilters(INITIAL_FILTERS);
  };

  const handleApply = () => {
    onApplyFilters(filters);
    onClose();
  };

  const activeFilterCount = [
    filters.departments.length > 0,
    filters.utilizationRange[0] > 0 || filters.utilizationRange[1] < 150,
    filters.skills.length > 0,
    filters.costRange[0] > 0 || filters.costRange[1] < 200,
    filters.roles.length > 0,
  ].filter(Boolean).length;

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/20 z-40 transition-opacity"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="fixed top-0 right-0 h-full w-96 bg-white shadow-2xl z-50 flex flex-col animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-lg font-semibold">Filters</h2>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={clearAll}>
                Clear all
              </Button>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* Team & Department */}
          <div className="border-b border-gray-200 pb-4">
            <button
              onClick={() => toggleSection('department')}
              className="flex items-center justify-between w-full text-sm font-medium mb-3"
            >
              <span>TEAM & DEPARTMENT</span>
              {expandedSections.has('department') ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </button>
            {expandedSections.has('department') && (
              <div className="space-y-2">
                {departments.filter(d => d !== 'All Departments').map(dept => (
                  <div key={dept} className="flex items-center space-x-2">
                    <Checkbox
                      id={`dept-${dept}`}
                      checked={filters.departments.includes(dept)}
                      onCheckedChange={() => toggleDepartment(dept)}
                    />
                    <Label htmlFor={`dept-${dept}`} className="text-sm cursor-pointer">
                      {dept}
                    </Label>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Utilization */}
          <div className="border-b border-gray-200 pb-4">
            <button
              onClick={() => toggleSection('utilization')}
              className="flex items-center justify-between w-full text-sm font-medium mb-3"
            >
              <span>UTILIZATION</span>
              {expandedSections.has('utilization') ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </button>
            {expandedSections.has('utilization') && (
              <div className="space-y-3">
                <div className="px-2">
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                    <span>{filters.utilizationRange[0]}%</span>
                    <span>{filters.utilizationRange[1]}%</span>
                  </div>
                  <Slider
                    value={filters.utilizationRange}
                    onValueChange={(value) =>
                      setFilters(prev => ({ ...prev, utilizationRange: value as [number, number] }))
                    }
                    min={0}
                    max={150}
                    step={5}
                    className="mb-3"
                  />
                </div>
                <div className="flex gap-2 flex-wrap">
                  <Badge
                    variant={filters.utilizationPreset === 'overallocated' ? 'default' : 'outline'}
                    className="cursor-pointer bg-red-100 text-red-700 hover:bg-red-200"
                    onClick={() => setUtilizationPreset('overallocated')}
                  >
                    Overallocated
                  </Badge>
                  <Badge
                    variant={filters.utilizationPreset === 'underutilized' ? 'default' : 'outline'}
                    className="cursor-pointer bg-green-100 text-green-700 hover:bg-green-200"
                    onClick={() => setUtilizationPreset('underutilized')}
                  >
                    Under-utilized
                  </Badge>
                  <Badge
                    variant={filters.utilizationPreset === 'optimal' ? 'default' : 'outline'}
                    className="cursor-pointer bg-amber-100 text-amber-700 hover:bg-amber-200"
                    onClick={() => setUtilizationPreset('optimal')}
                  >
                    Optimal
                  </Badge>
                </div>
              </div>
            )}
          </div>

          {/* Availability */}
          <div className="border-b border-gray-200 pb-4">
            <button
              onClick={() => toggleSection('availability')}
              className="flex items-center justify-between w-full text-sm font-medium mb-3"
            >
              <span>AVAILABILITY</span>
              {expandedSections.has('availability') ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </button>
            {expandedSections.has('availability') && (
              <div className="space-y-3">
                <p className="text-sm text-gray-600">Show people available between:</p>
                <div className="flex gap-2 flex-wrap">
                  <Badge variant="outline" className="cursor-pointer hover:bg-gray-100">
                    This week
                  </Badge>
                  <Badge variant="outline" className="cursor-pointer hover:bg-gray-100">
                    Next 2 weeks
                  </Badge>
                  <Badge variant="outline" className="cursor-pointer hover:bg-gray-100">
                    This month
                  </Badge>
                </div>
              </div>
            )}
          </div>

          {/* Skills */}
          <div className="border-b border-gray-200 pb-4">
            <button
              onClick={() => toggleSection('skills')}
              className="flex items-center justify-between w-full text-sm font-medium mb-3"
            >
              <span>SKILLS</span>
              {expandedSections.has('skills') ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </button>
            {expandedSections.has('skills') && (
              <div className="space-y-2">
                <div className="flex flex-wrap gap-2">
                  {AVAILABLE_SKILLS.map(skill => (
                    <Badge
                      key={skill}
                      variant={filters.skills.includes(skill) ? 'default' : 'outline'}
                      className="cursor-pointer"
                      onClick={() =>
                        setFilters(prev => ({
                          ...prev,
                          skills: prev.skills.includes(skill)
                            ? prev.skills.filter(s => s !== skill)
                            : [...prev.skills, skill],
                        }))
                      }
                    >
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Cost Range */}
          <div className="border-b border-gray-200 pb-4">
            <button
              onClick={() => toggleSection('cost')}
              className="flex items-center justify-between w-full text-sm font-medium mb-3"
            >
              <span>COST RANGE</span>
              {expandedSections.has('cost') ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </button>
            {expandedSections.has('cost') && (
              <div className="px-2">
                <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                  <span>${filters.costRange[0]}/hr</span>
                  <span>${filters.costRange[1]}+/hr</span>
                </div>
                <Slider
                  value={filters.costRange}
                  onValueChange={(value) =>
                    setFilters(prev => ({ ...prev, costRange: value as [number, number] }))
                  }
                  min={0}
                  max={200}
                  step={10}
                />
              </div>
            )}
          </div>

          {/* Role */}
          <div className="border-b border-gray-200 pb-4">
            <button
              onClick={() => toggleSection('role')}
              className="flex items-center justify-between w-full text-sm font-medium mb-3"
            >
              <span>ROLE</span>
              {expandedSections.has('role') ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </button>
            {expandedSections.has('role') && (
              <div className="space-y-2">
                {AVAILABLE_ROLES.map(role => (
                  <div key={role} className="flex items-center space-x-2">
                    <Checkbox
                      id={`role-${role}`}
                      checked={filters.roles.includes(role)}
                      onCheckedChange={() => toggleRole(role)}
                    />
                    <Label htmlFor={`role-${role}`} className="text-sm cursor-pointer">
                      {role}
                    </Label>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Saved Filters */}
          <div className="pt-2">
            <button
              onClick={() => setShowSavedFilters(!showSavedFilters)}
              className="flex items-center justify-between w-full text-sm font-medium mb-3"
            >
              <span>MY SAVED FILTERS</span>
              {showSavedFilters ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </button>
            {showSavedFilters && (
              <div className="space-y-2">
                {SAVED_FILTERS.map(filter => (
                  <button
                    key={filter.id}
                    className="w-full text-left text-sm p-2 rounded hover:bg-gray-100 transition-colors"
                  >
                    {filter.name}
                  </button>
                ))}
                <button className="w-full text-left text-sm p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors">
                  + Save current filters as preset
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <Button onClick={handleApply} className="w-full mb-2">
            Apply Filters
          </Button>
          <p className="text-xs text-center text-gray-500">
            Showing results based on selected filters
          </p>
        </div>
      </div>
    </>
  );
}
