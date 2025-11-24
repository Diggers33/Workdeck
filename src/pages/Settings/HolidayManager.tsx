import React, { useState } from 'react';
import {
  Calendar, Plus, Trash2, Edit2, Download, Copy, ChevronLeft,
  ChevronRight, Star, Globe, MapPin, AlertCircle, Check
} from 'lucide-react';

interface Holiday {
  id: string;
  name: string;
  date: string; // YYYY-MM-DD
  type: 'national' | 'regional' | 'local' | 'company';
  region?: string;
  recurring: boolean;
}

interface HolidayManagerProps {
  officeId?: number;
  officeName?: string;
  region?: string;
  office?: any;
  onClose: () => void;
  onSave: (holidays: Holiday[]) => void;
  existingHolidays?: Holiday[];
}

const HOLIDAY_PRESETS = {
  'Spain - National': [
    { name: 'New Year\'s Day', date: '01-01', type: 'national', recurring: true },
    { name: 'Epiphany', date: '01-06', type: 'national', recurring: true },
    { name: 'Good Friday', date: '04-18', type: 'national', recurring: false },
    { name: 'Labour Day', date: '05-01', type: 'national', recurring: true },
    { name: 'Assumption of Mary', date: '08-15', type: 'national', recurring: true },
    { name: 'National Day', date: '10-12', type: 'national', recurring: true },
    { name: 'All Saints\' Day', date: '11-01', type: 'national', recurring: true },
    { name: 'Constitution Day', date: '12-06', type: 'national', recurring: true },
    { name: 'Immaculate Conception', date: '12-08', type: 'national', recurring: true },
    { name: 'Christmas Day', date: '12-25', type: 'national', recurring: true }
  ],
  'Spain - Madrid': [
    { name: 'Community of Madrid Day', date: '05-02', type: 'regional', recurring: true },
    { name: 'San Isidro', date: '05-15', type: 'local', recurring: true }
  ],
  'Spain - Catalonia': [
    { name: 'Sant Jordi', date: '04-23', type: 'regional', recurring: true },
    { name: 'National Day of Catalonia', date: '09-11', type: 'regional', recurring: true },
    { name: 'Sant Esteve', date: '12-26', type: 'regional', recurring: true }
  ],
  'Spain - Andalusia': [
    { name: 'Andalusia Day', date: '02-28', type: 'regional', recurring: true }
  ],
  'UK - National': [
    { name: 'New Year\'s Day', date: '01-01', type: 'national', recurring: true },
    { name: 'Good Friday', date: '04-18', type: 'national', recurring: false },
    { name: 'Easter Monday', date: '04-21', type: 'national', recurring: false },
    { name: 'Early May Bank Holiday', date: '05-05', type: 'national', recurring: false },
    { name: 'Spring Bank Holiday', date: '05-26', type: 'national', recurring: false },
    { name: 'Summer Bank Holiday', date: '08-25', type: 'national', recurring: false },
    { name: 'Christmas Day', date: '12-25', type: 'national', recurring: true },
    { name: 'Boxing Day', date: '12-26', type: 'national', recurring: true }
  ],
  'USA - Federal': [
    { name: 'New Year\'s Day', date: '01-01', type: 'national', recurring: true },
    { name: 'Martin Luther King Jr. Day', date: '01-20', type: 'national', recurring: false },
    { name: 'Presidents\' Day', date: '02-17', type: 'national', recurring: false },
    { name: 'Memorial Day', date: '05-26', type: 'national', recurring: false },
    { name: 'Independence Day', date: '07-04', type: 'national', recurring: true },
    { name: 'Labor Day', date: '09-01', type: 'national', recurring: false },
    { name: 'Columbus Day', date: '10-13', type: 'national', recurring: false },
    { name: 'Veterans Day', date: '11-11', type: 'national', recurring: true },
    { name: 'Thanksgiving', date: '11-27', type: 'national', recurring: false },
    { name: 'Christmas Day', date: '12-25', type: 'national', recurring: true }
  ]
};

export function HolidayManager({ 
  officeId,
  officeName,
  office,
  region, 
  onClose, 
  onSave, 
  existingHolidays = [] 
}: HolidayManagerProps) {
  const actualOfficeId = officeId || office?.id;
  const actualOfficeName = officeName || office?.name || 'Office';
  const actualRegion = region || office?.region;

  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [holidays, setHolidays] = useState<Holiday[]>(existingHolidays);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showPresets, setShowPresets] = useState(holidays.length === 0);
  const [editingHoliday, setEditingHoliday] = useState<Holiday | null>(null);

  const [newHoliday, setNewHoliday] = useState({
    name: '',
    date: `${selectedYear}-01-01`,
    type: 'company' as Holiday['type'],
    region: '',
    recurring: false
  });

  const addHoliday = () => {
    if (!newHoliday.name || !newHoliday.date) {
      alert('Please enter holiday name and date');
      return;
    }

    const holiday: Holiday = {
      id: `holiday-${Date.now()}`,
      name: newHoliday.name,
      date: newHoliday.date,
      type: newHoliday.type,
      region: newHoliday.region || undefined,
      recurring: newHoliday.recurring
    };

    setHolidays([...holidays, holiday]);
    setNewHoliday({
      name: '',
      date: `${selectedYear}-01-01`,
      type: 'company',
      region: '',
      recurring: false
    });
    setShowAddForm(false);
  };

  const deleteHoliday = (id: string) => {
    setHolidays(holidays.filter(h => h.id !== id));
  };

  const importPreset = (presetKey: string) => {
    const preset = HOLIDAY_PRESETS[presetKey as keyof typeof HOLIDAY_PRESETS];
    if (!preset) return;

    const newHolidays = preset.map((ph, idx) => ({
      id: `preset-${Date.now()}-${idx}`,
      name: ph.name,
      date: `${selectedYear}-${ph.date}`,
      type: ph.type as Holiday['type'],
      region: presetKey.split(' - ')[1],
      recurring: ph.recurring
    }));

    setHolidays([...holidays, ...newHolidays]);
    setShowPresets(false);
  };

  const copyFromPreviousYear = () => {
    const previousYearHolidays = holidays
      .filter(h => h.date.startsWith(`${selectedYear - 1}-`))
      .map(h => ({
        ...h,
        id: `copy-${Date.now()}-${h.id}`,
        date: h.date.replace(`${selectedYear - 1}`, `${selectedYear}`)
      }));

    setHolidays([...holidays, ...previousYearHolidays]);
  };

  const yearHolidays = holidays
    .filter(h => h.date.startsWith(`${selectedYear}-`))
    .sort((a, b) => a.date.localeCompare(b.date));

  const getTypeColor = (type: Holiday['type']) => {
    switch (type) {
      case 'national': return 'bg-[#60A5FA] text-white';
      case 'regional': return 'bg-[#A78BFA] text-white';
      case 'local': return 'bg-[#FBBF24] text-white';
      case 'company': return 'bg-[#34D399] text-white';
      default: return 'bg-[#9CA3AF] text-white';
    }
  };

  const getTypeIcon = (type: Holiday['type']) => {
    switch (type) {
      case 'national': return <Globe className="w-3 h-3" />;
      case 'regional': return <MapPin className="w-3 h-3" />;
      case 'local': return <MapPin className="w-3 h-3" />;
      case 'company': return <Star className="w-3 h-3" />;
      default: return null;
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="border-b border-[#E5E7EB] p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[#F472B6] to-[#EC4899] flex items-center justify-center">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-[20px] font-medium text-[#1F2937]">
                  Holiday Calendar: {actualOfficeName}
                </h2>
                <p className="text-[13px] text-[#6B7280] mt-0.5">
                  Manage annual holidays and non-working days
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-[#F3F4F6] rounded-lg transition-colors"
            >
              <Plus className="w-5 h-5 text-[#6B7280] rotate-45" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Year Selector & Actions */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setSelectedYear(selectedYear - 1)}
                  className="p-2 hover:bg-[#F3F4F6] rounded-lg transition-colors"
                >
                  <ChevronLeft className="w-5 h-5 text-[#6B7280]" />
                </button>
                <div className="px-4 py-2 bg-[#F0F4FF] rounded-lg">
                  <span className="text-[18px] font-medium text-[#0066FF]">{selectedYear}</span>
                </div>
                <button
                  onClick={() => setSelectedYear(selectedYear + 1)}
                  className="p-2 hover:bg-[#F3F4F6] rounded-lg transition-colors"
                >
                  <ChevronRight className="w-5 h-5 text-[#6B7280]" />
                </button>
                <div className="ml-4 flex items-center gap-2">
                  <span className="text-[13px] text-[#6B7280]">
                    {yearHolidays.length} {yearHolidays.length === 1 ? 'holiday' : 'holidays'}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {selectedYear > currentYear && holidays.filter(h => h.date.startsWith(`${selectedYear - 1}-`)).length > 0 && (
                  <button
                    onClick={copyFromPreviousYear}
                    className="px-3 py-1.5 text-[13px] text-[#6B7280] hover:bg-[#F3F4F6] rounded-lg transition-colors flex items-center gap-1"
                  >
                    <Copy className="w-4 h-4" />
                    Copy from {selectedYear - 1}
                  </button>
                )}
                <button
                  onClick={() => setShowPresets(!showPresets)}
                  className="px-3 py-1.5 text-[13px] text-[#0066FF] hover:bg-[#F0F4FF] rounded-lg transition-colors flex items-center gap-1"
                >
                  <Download className="w-4 h-4" />
                  Import Holidays
                </button>
                <button
                  onClick={() => setShowAddForm(!showAddForm)}
                  className="px-3 py-1.5 bg-[#0066FF] hover:bg-[#0052CC] text-white rounded-lg text-[13px] font-medium transition-colors flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" />
                  Add Holiday
                </button>
              </div>
            </div>

            {/* Import Presets */}
            {showPresets && (
              <div className="bg-[#F0F4FF] border border-[#DBEAFE] rounded-lg p-5">
                <h3 className="text-[14px] font-medium text-[#1F2937] mb-3">Import Holiday Calendar</h3>
                <div className="grid grid-cols-2 gap-3">
                  {Object.keys(HOLIDAY_PRESETS).map((presetKey) => {
                    const [country, region] = presetKey.split(' - ');
                    const preset = HOLIDAY_PRESETS[presetKey as keyof typeof HOLIDAY_PRESETS];
                    return (
                      <button
                        key={presetKey}
                        onClick={() => importPreset(presetKey)}
                        className="bg-white border border-[#E5E7EB] rounded-lg p-3 text-left hover:border-[#0066FF] hover:shadow-sm transition-all"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[13px] font-medium text-[#1F2937]">{presetKey}</span>
                          <span className="text-[11px] text-[#6B7280] bg-[#F3F4F6] px-2 py-0.5 rounded">
                            {preset.length} days
                          </span>
                        </div>
                        <p className="text-[11px] text-[#6B7280]">
                          Includes {region || 'national'} holidays for {selectedYear}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Add Holiday Form */}
            {showAddForm && (
              <div className="bg-white border-2 border-[#0066FF] rounded-lg p-5">
                <h3 className="text-[14px] font-medium text-[#1F2937] mb-4">Add New Holiday</h3>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="col-span-2">
                    <label className="block text-[13px] font-medium text-[#1F2937] mb-2">
                      Holiday Name *
                    </label>
                    <input
                      type="text"
                      value={newHoliday.name}
                      onChange={(e) => setNewHoliday({ ...newHoliday, name: e.target.value })}
                      placeholder="e.g., Christmas Day"
                      className="w-full px-3 py-2 border border-[#D1D5DB] rounded-lg text-[14px] focus:outline-none focus:ring-2 focus:ring-[#0066FF] focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-[13px] font-medium text-[#1F2937] mb-2">
                      Date *
                    </label>
                    <input
                      type="date"
                      value={newHoliday.date}
                      onChange={(e) => setNewHoliday({ ...newHoliday, date: e.target.value })}
                      className="w-full px-3 py-2 border border-[#D1D5DB] rounded-lg text-[14px] focus:outline-none focus:ring-2 focus:ring-[#0066FF] focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-[13px] font-medium text-[#1F2937] mb-2">
                      Type
                    </label>
                    <select
                      value={newHoliday.type}
                      onChange={(e) => setNewHoliday({ ...newHoliday, type: e.target.value as Holiday['type'] })}
                      className="w-full px-3 py-2 border border-[#D1D5DB] rounded-lg text-[14px] focus:outline-none focus:ring-2 focus:ring-[#0066FF] focus:border-transparent"
                    >
                      <option value="company">Company</option>
                      <option value="national">National</option>
                      <option value="regional">Regional</option>
                      <option value="local">Local</option>
                    </select>
                  </div>
                  {(newHoliday.type === 'regional' || newHoliday.type === 'local') && (
                    <div className="col-span-2">
                      <label className="block text-[13px] font-medium text-[#1F2937] mb-2">
                        Region / Location
                      </label>
                      <input
                        type="text"
                        value={newHoliday.region}
                        onChange={(e) => setNewHoliday({ ...newHoliday, region: e.target.value })}
                        placeholder="e.g., Madrid, Catalonia"
                        className="w-full px-3 py-2 border border-[#D1D5DB] rounded-lg text-[14px] focus:outline-none focus:ring-2 focus:ring-[#0066FF] focus:border-transparent"
                      />
                    </div>
                  )}
                  <div className="col-span-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={newHoliday.recurring}
                        onChange={(e) => setNewHoliday({ ...newHoliday, recurring: e.target.checked })}
                        className="w-4 h-4 text-[#0066FF] rounded border-[#D1D5DB] focus:ring-2 focus:ring-[#0066FF]"
                      />
                      <span className="text-[13px] text-[#1F2937]">
                        Recurring (same date every year)
                      </span>
                    </label>
                  </div>
                </div>
                <div className="flex items-center justify-end gap-2">
                  <button
                    onClick={() => setShowAddForm(false)}
                    className="px-4 py-2 text-[14px] text-[#6B7280] hover:bg-[#F3F4F6] rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={addHoliday}
                    className="px-4 py-2 bg-[#0066FF] hover:bg-[#0052CC] text-white rounded-lg text-[14px] font-medium transition-colors"
                  >
                    Add Holiday
                  </button>
                </div>
              </div>
            )}

            {/* Holidays List */}
            {yearHolidays.length > 0 ? (
              <div className="space-y-2">
                {yearHolidays.map((holiday) => (
                  <div
                    key={holiday.id}
                    className="bg-white border border-[#E5E7EB] rounded-lg p-4 hover:shadow-sm transition-shadow"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="text-center">
                          <div className="text-[20px] font-medium text-[#1F2937]">
                            {new Date(holiday.date + 'T00:00:00').getDate()}
                          </div>
                          <div className="text-[10px] text-[#9CA3AF] uppercase">
                            {new Date(holiday.date + 'T00:00:00').toLocaleDateString('en-GB', { month: 'short' })}
                          </div>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="text-[14px] font-medium text-[#1F2937]">{holiday.name}</h4>
                            {holiday.recurring && (
                              <span className="text-[10px] text-[#6B7280] bg-[#F3F4F6] px-2 py-0.5 rounded">
                                Recurring
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`text-[11px] px-2 py-0.5 rounded flex items-center gap-1 ${getTypeColor(holiday.type)}`}>
                              {getTypeIcon(holiday.type)}
                              {holiday.type.charAt(0).toUpperCase() + holiday.type.slice(1)}
                            </span>
                            {holiday.region && (
                              <span className="text-[11px] text-[#6B7280]">{holiday.region}</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => deleteHoliday(holiday.id)}
                        className="p-2 hover:bg-[#FEE2E2] rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4 text-[#F87171]" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-[#F9FAFB] border-2 border-dashed border-[#D1D5DB] rounded-lg p-12 text-center">
                <Calendar className="w-12 h-12 text-[#D1D5DB] mx-auto mb-3" />
                <p className="text-[14px] text-[#6B7280] mb-2">No holidays for {selectedYear}</p>
                <p className="text-[12px] text-[#9CA3AF]">
                  Import a holiday calendar or add holidays manually
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-[#E5E7EB] p-4 bg-[#F9FAFB]">
          <div className="flex items-center justify-end max-w-4xl mx-auto gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-[14px] text-[#6B7280] hover:bg-white rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => onSave(holidays)}
              className="px-5 py-2 bg-[#0066FF] hover:bg-[#0052CC] text-white rounded-lg text-[14px] font-medium transition-colors flex items-center gap-2"
            >
              <Check className="w-4 h-4" />
              Save Holiday Calendar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}