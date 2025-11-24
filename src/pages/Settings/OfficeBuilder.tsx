import React, { useState } from 'react';
import {
  X, MapPin, Save, AlertCircle, Building2, Clock, Calendar,
  Globe, DollarSign, Plus, Trash2, Check, ChevronDown, Copy,
  CalendarDays, Download, Edit2, Star, Sparkles
} from 'lucide-react';
import { HolidayCalendarSetup } from './HolidayCalendarSetup';
import { COUNTRIES_WITH_REGIONS, CITIES_WITH_LOCAL_HOLIDAYS, getRegionalCalendar, RegionalCalendar } from './HolidayCalendarData';

interface Timetable {
  id: string;
  name: string;
  timezone: string;
  weekStartsOn: string;
  weekEndsOn: string;
  dayStartTime: string;
  dayEndTime: string;
  hoursPerDay: number;
  hoursPerWeek: number;
  timeBlockMinutes: number;
  nonWorkingDays: string[];
}

interface Holiday {
  id: string;
  name: string;
  date: string;
  type: 'national' | 'regional' | 'local' | 'company';
  region?: string;
  recurring: boolean;
}

interface Office {
  id: number;
  name: string;
  address: string;
  currency: string;
  timetables: Timetable[];
  holidays?: Holiday[];
}

interface OfficeBuilderProps {
  onClose: () => void;
  onSave: (office: Office) => void;
  editingOffice?: Office;
}

const CURRENCIES = [
  { code: 'USD', name: 'US Dollar', symbol: '$' },
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'GBP', name: 'British Pound', symbol: '£' },
  { code: 'CHF', name: 'Swiss Franc', symbol: 'CHF' },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$' },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$' },
  { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$' },
  { code: 'CNY', name: 'Chinese Yuan', symbol: '¥' },
  { code: 'INR', name: 'Indian Rupee', symbol: '₹' }
];

const TIMEZONES = [
  'UTC',
  'America/New_York',
  'America/Chicago',
  'America/Los_Angeles',
  'America/Toronto',
  'Europe/London',
  'Europe/Paris',
  'Europe/Berlin',
  'Europe/Madrid',
  'Europe/Rome',
  'Asia/Tokyo',
  'Asia/Singapore',
  'Asia/Hong_Kong',
  'Asia/Dubai',
  'Australia/Sydney',
  'Pacific/Auckland'
];

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const TIME_BLOCKS = [
  { value: 15, label: '15 minutes' },
  { value: 30, label: '30 minutes' },
  { value: 60, label: '1 hour' }
];

const HOLIDAY_PRESETS = {
  'None': [],
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

export function OfficeBuilder({ onClose, onSave, editingOffice }: OfficeBuilderProps) {
  const [step, setStep] = useState(1); // 1: Basic Info + Location, 2: Holiday Calendar, 3: Schedules
  const [officeName, setOfficeName] = useState(editingOffice?.name || '');
  const [address, setAddress] = useState(editingOffice?.address || '');
  const [currency, setCurrency] = useState(editingOffice?.currency || 'USD');
  const [selectedHolidayPresets, setSelectedHolidayPresets] = useState<string[]>(['None']);
  const [holidays, setHolidays] = useState<Holiday[]>(editingOffice?.holidays || []);
  const [timetables, setTimetables] = useState<Timetable[]>(
    editingOffice?.timetables || [
      {
        id: 'tt-1',
        name: 'New timetable',
        timezone: 'Europe/Madrid',
        weekStartsOn: 'Monday',
        weekEndsOn: 'Friday',
        dayStartTime: '08:00',
        dayEndTime: '20:00',
        hoursPerDay: 8,
        hoursPerWeek: 40,
        timeBlockMinutes: 30,
        nonWorkingDays: []
      }
    ]
  );
  const [activeTimetable, setActiveTimetable] = useState(0);

  const addTimetable = () => {
    const newTimetable: Timetable = {
      id: `tt-${Date.now()}`,
      name: `Timetable ${timetables.length + 1}`,
      timezone: 'UTC',
      weekStartsOn: 'Monday',
      weekEndsOn: 'Friday',
      dayStartTime: '09:00',
      dayEndTime: '18:00',
      hoursPerDay: 8,
      hoursPerWeek: 40,
      timeBlockMinutes: 30,
      nonWorkingDays: []
    };
    setTimetables([...timetables, newTimetable]);
    setActiveTimetable(timetables.length);
  };

  const updateTimetable = (index: number, updates: Partial<Timetable>) => {
    const newTimetables = [...timetables];
    newTimetables[index] = { ...newTimetables[index], ...updates };
    setTimetables(newTimetables);
  };

  const deleteTimetable = (index: number) => {
    if (timetables.length === 1) {
      alert('You must have at least one timetable');
      return;
    }
    setTimetables(timetables.filter((_, i) => i !== index));
    if (activeTimetable >= timetables.length - 1) {
      setActiveTimetable(Math.max(0, timetables.length - 2));
    }
  };

  const toggleNonWorkingDay = (index: number, day: string) => {
    const timetable = timetables[index];
    const nonWorkingDays = timetable.nonWorkingDays.includes(day)
      ? timetable.nonWorkingDays.filter(d => d !== day)
      : [...timetable.nonWorkingDays, day];
    updateTimetable(index, { nonWorkingDays });
  };

  const handleSave = () => {
    if (!officeName.trim()) {
      alert('Please enter an office name');
      return;
    }

    const office: Office = {
      id: editingOffice?.id || Date.now(),
      name: officeName,
      address,
      currency,
      timetables,
      holidays
    };

    onSave(office);
  };

  const isValid = officeName.trim();
  const currentTimetable = timetables[activeTimetable];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-6xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="border-b border-[#E5E7EB] p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[#0066FF] to-[#0052CC] flex items-center justify-center">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-[20px] font-medium text-[#1F2937]">
                  {editingOffice ? 'Edit Office' : 'New Office'}
                </h2>
                <p className="text-[13px] text-[#6B7280] mt-0.5">
                  Configure location, currency, and work schedules
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-[#F3F4F6] rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-[#6B7280]" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6">
            <div className="max-w-5xl mx-auto space-y-6">
              {/* Basic Info Section */}
              <div className="bg-gradient-to-r from-[#F0F4FF] to-[#E0E9FF] rounded-lg p-5">
                <div className="flex items-center gap-2 mb-4">
                  <MapPin className="w-5 h-5 text-[#0066FF]" />
                  <h3 className="text-[15px] font-medium text-[#1F2937]">Basic Information</h3>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[13px] font-medium text-[#1F2937] mb-2">
                      Office Name *
                    </label>
                    <input
                      type="text"
                      value={officeName}
                      onChange={(e) => setOfficeName(e.target.value)}
                      placeholder="e.g., London HQ"
                      className="w-full px-3 py-2 border border-[#D1D5DB] rounded-lg text-[14px] focus:outline-none focus:ring-2 focus:ring-[#0066FF] focus:border-transparent"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-[13px] font-medium text-[#1F2937] mb-2">
                      Address
                    </label>
                    <input
                      type="text"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="Street address, city, country"
                      className="w-full px-3 py-2 border border-[#D1D5DB] rounded-lg text-[14px] focus:outline-none focus:ring-2 focus:ring-[#0066FF] focus:border-transparent"
                    />
                  </div>
                </div>
                <div className="mt-4">
                  <label className="block text-[13px] font-medium text-[#1F2937] mb-2">
                    Currency
                  </label>
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="w-full px-3 py-2 border border-[#D1D5DB] rounded-lg text-[14px] focus:outline-none focus:ring-2 focus:ring-[#0066FF] focus:border-transparent"
                  >
                    {CURRENCIES.map((curr) => (
                      <option key={curr.code} value={curr.code}>
                        {curr.code} - {curr.name} ({curr.symbol})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Quick Holiday Setup */}
              <div className="bg-gradient-to-r from-[#FCE7F3] to-[#FEF3C7] rounded-lg p-5">
                <div className="flex items-center gap-2 mb-4">
                  <CalendarDays className="w-5 h-5 text-[#EC4899]" />
                  <h3 className="text-[15px] font-medium text-[#1F2937]">Quick Holiday Setup</h3>
                  <span className="text-[11px] text-[#6B7280] bg-white/60 px-2 py-0.5 rounded">
                    {holidays.length} {holidays.length === 1 ? 'holiday' : 'holidays'} for 2025-2027
                  </span>
                </div>
                <p className="text-[12px] text-[#6B7280] mb-4">
                  Select your region to auto-populate 3 years of national and regional holidays
                </p>
                <div className="grid grid-cols-4 gap-2">
                  {Object.keys(HOLIDAY_PRESETS).map((presetKey) => {
                    const preset = HOLIDAY_PRESETS[presetKey as keyof typeof HOLIDAY_PRESETS];
                    const isSelected = selectedHolidayPresets.includes(presetKey);
                    const isNone = presetKey === 'None';
                    
                    return (
                      <button
                        key={presetKey}
                        onClick={() => {
                          if (isNone) {
                            setSelectedHolidayPresets(['None']);
                            setHolidays([]);
                          } else {
                            const newSelection = isSelected
                              ? selectedHolidayPresets.filter(s => s !== presetKey)
                              : [...selectedHolidayPresets.filter(s => s !== 'None'), presetKey];
                            
                            setSelectedHolidayPresets(newSelection.length === 0 ? ['None'] : newSelection);
                            
                            // Generate holidays for 2025, 2026, 2027
                            if (!isSelected) {
                              const newHolidays = [];
                              for (let year = 2025; year <= 2027; year++) {
                                const yearHolidays = preset.map((ph, idx) => ({
                                  id: `${presetKey}-${year}-${idx}`,
                                  name: ph.name,
                                  date: `${year}-${ph.date}`,
                                  type: ph.type as Holiday['type'],
                                  region: presetKey.split(' - ')[1],
                                  recurring: ph.recurring
                                }));
                                newHolidays.push(...yearHolidays);
                              }
                              setHolidays([...holidays, ...newHolidays]);
                            } else {
                              // Remove holidays from this preset
                              setHolidays(holidays.filter(h => !h.id.startsWith(presetKey)));
                            }
                          }
                        }}
                        className={`px-3 py-2.5 rounded-lg text-[12px] font-medium transition-all border-2 text-left ${
                          isSelected
                            ? 'bg-gradient-to-br from-[#EC4899] to-[#F472B6] text-white border-[#EC4899]'
                            : 'bg-white text-[#1F2937] border-[#E5E7EB] hover:border-[#EC4899]'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span>{presetKey}</span>
                          {isSelected && <Check className="w-3 h-3" />}
                        </div>
                        {!isNone && (
                          <span className="text-[10px] opacity-75">
                            {preset.length} days/year
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
                <div className="mt-3 pt-3 border-t border-[#EC4899]/20">
                  <p className="text-[11px] text-[#6B7280]">
                    💡 <strong>Pro tip:</strong> For Spain, select both National + your region (e.g., Madrid). You can manage holidays in detail later.
                  </p>
                </div>
              </div>

              {/* Schedule Section */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-[#0066FF]" />
                    <h3 className="text-[15px] font-medium text-[#1F2937]">Work Schedules</h3>
                    <span className="text-[12px] text-[#6B7280] bg-[#F3F4F6] px-2 py-0.5 rounded">
                      {timetables.length} {timetables.length === 1 ? 'schedule' : 'schedules'}
                    </span>
                  </div>
                  <button
                    onClick={addTimetable}
                    className="px-3 py-1.5 bg-[#0066FF] hover:bg-[#0052CC] text-white rounded-lg text-[13px] font-medium transition-colors flex items-center gap-1"
                  >
                    <Plus className="w-4 h-4" />
                    Add Schedule
                  </button>
                </div>

                {/* Timetable Tabs */}
                <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
                  {timetables.map((tt, index) => (
                    <button
                      key={tt.id}
                      onClick={() => setActiveTimetable(index)}
                      className={`px-4 py-2 rounded-lg text-[13px] font-medium transition-all flex items-center gap-2 whitespace-nowrap ${
                        activeTimetable === index
                          ? 'bg-[#0066FF] text-white'
                          : 'bg-white border border-[#E5E7EB] text-[#6B7280] hover:border-[#0066FF]'
                      }`}
                    >
                      <Clock className="w-4 h-4" />
                      {tt.name}
                    </button>
                  ))}
                </div>

                {/* Active Timetable Form */}
                {currentTimetable && (
                  <div className="bg-white border-2 border-[#E5E7EB] rounded-lg p-6">
                    <div className="flex items-center justify-between mb-5">
                      <input
                        type="text"
                        value={currentTimetable.name}
                        onChange={(e) => updateTimetable(activeTimetable, { name: e.target.value })}
                        className="text-[16px] font-medium text-[#1F2937] border-none outline-none focus:ring-0 p-0"
                      />
                      {timetables.length > 1 && (
                        <button
                          onClick={() => deleteTimetable(activeTimetable)}
                          className="p-2 hover:bg-[#FEE2E2] rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4 text-[#F87171]" />
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                      {/* Left Column */}
                      <div className="space-y-4">
                        {/* Timezone */}
                        <div>
                          <label className="block text-[13px] font-medium text-[#1F2937] mb-2">
                            Timezone
                          </label>
                          <div className="relative">
                            <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
                            <select
                              value={currentTimetable.timezone}
                              onChange={(e) => updateTimetable(activeTimetable, { timezone: e.target.value })}
                              className="w-full pl-10 pr-3 py-2 border border-[#D1D5DB] rounded-lg text-[14px] focus:outline-none focus:ring-2 focus:ring-[#0066FF] focus:border-transparent"
                            >
                              {TIMEZONES.map((tz) => (
                                <option key={tz} value={tz}>{tz}</option>
                              ))}
                            </select>
                          </div>
                        </div>

                        {/* Week Range */}
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[13px] font-medium text-[#1F2937] mb-2">
                              Week starts on
                            </label>
                            <select
                              value={currentTimetable.weekStartsOn}
                              onChange={(e) => updateTimetable(activeTimetable, { weekStartsOn: e.target.value })}
                              className="w-full px-3 py-2 border border-[#D1D5DB] rounded-lg text-[14px] focus:outline-none focus:ring-2 focus:ring-[#0066FF] focus:border-transparent"
                            >
                              {DAYS_OF_WEEK.map((day) => (
                                <option key={day} value={day}>{day}</option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="block text-[13px] font-medium text-[#1F2937] mb-2">
                              Week ends on
                            </label>
                            <select
                              value={currentTimetable.weekEndsOn}
                              onChange={(e) => updateTimetable(activeTimetable, { weekEndsOn: e.target.value })}
                              className="w-full px-3 py-2 border border-[#D1D5DB] rounded-lg text-[14px] focus:outline-none focus:ring-2 focus:ring-[#0066FF] focus:border-transparent"
                            >
                              {DAYS_OF_WEEK.map((day) => (
                                <option key={day} value={day}>{day}</option>
                              ))}
                            </select>
                          </div>
                        </div>

                        {/* Working Hours */}
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[13px] font-medium text-[#1F2937] mb-2">
                              From
                            </label>
                            <div className="relative">
                              <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
                              <input
                                type="time"
                                value={currentTimetable.dayStartTime}
                                onChange={(e) => updateTimetable(activeTimetable, { dayStartTime: e.target.value })}
                                className="w-full pl-10 pr-3 py-2 border border-[#D1D5DB] rounded-lg text-[14px] focus:outline-none focus:ring-2 focus:ring-[#0066FF] focus:border-transparent"
                              />
                            </div>
                          </div>
                          <div>
                            <label className="block text-[13px] font-medium text-[#1F2937] mb-2">
                              To
                            </label>
                            <div className="relative">
                              <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
                              <input
                                type="time"
                                value={currentTimetable.dayEndTime}
                                onChange={(e) => updateTimetable(activeTimetable, { dayEndTime: e.target.value })}
                                className="w-full pl-10 pr-3 py-2 border border-[#D1D5DB] rounded-lg text-[14px] focus:outline-none focus:ring-2 focus:ring-[#0066FF] focus:border-transparent"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Hours */}
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[13px] font-medium text-[#1F2937] mb-2">
                              Hours per day
                            </label>
                            <input
                              type="number"
                              value={currentTimetable.hoursPerDay}
                              onChange={(e) => updateTimetable(activeTimetable, { hoursPerDay: parseInt(e.target.value) || 0 })}
                              min="1"
                              max="24"
                              className="w-full px-3 py-2 border border-[#D1D5DB] rounded-lg text-[14px] focus:outline-none focus:ring-2 focus:ring-[#0066FF] focus:border-transparent"
                            />
                          </div>
                          <div>
                            <label className="block text-[13px] font-medium text-[#1F2937] mb-2">
                              Hours per week
                            </label>
                            <input
                              type="number"
                              value={currentTimetable.hoursPerWeek}
                              onChange={(e) => updateTimetable(activeTimetable, { hoursPerWeek: parseInt(e.target.value) || 0 })}
                              min="1"
                              max="168"
                              className="w-full px-3 py-2 border border-[#D1D5DB] rounded-lg text-[14px] focus:outline-none focus:ring-2 focus:ring-[#0066FF] focus:border-transparent"
                            />
                          </div>
                        </div>

                        {/* Time Block */}
                        <div>
                          <label className="block text-[13px] font-medium text-[#1F2937] mb-2">
                            Time block
                          </label>
                          <select
                            value={currentTimetable.timeBlockMinutes}
                            onChange={(e) => updateTimetable(activeTimetable, { timeBlockMinutes: parseInt(e.target.value) })}
                            className="w-full px-3 py-2 border border-[#D1D5DB] rounded-lg text-[14px] focus:outline-none focus:ring-2 focus:ring-[#0066FF] focus:border-transparent"
                          >
                            {TIME_BLOCKS.map((block) => (
                              <option key={block.value} value={block.value}>{block.label}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {/* Right Column - Weekends & Holidays */}
                      <div className="space-y-4">
                        {/* Weekends */}
                        <div>
                          <label className="block text-[13px] font-medium text-[#1F2937] mb-3">
                            Weekends
                          </label>
                          <div className="bg-[#F9FAFB] rounded-lg p-4 border border-[#E5E7EB]">
                            <div className="space-y-2">
                              {DAYS_OF_WEEK.map((day) => {
                                const isNonWorking = currentTimetable.nonWorkingDays.includes(day);
                                return (
                                  <button
                                    key={day}
                                    onClick={() => toggleNonWorkingDay(activeTimetable, day)}
                                    className={`w-full px-4 py-2.5 rounded-lg text-[13px] font-medium transition-all flex items-center justify-between ${
                                      isNonWorking
                                        ? 'bg-[#F87171] text-white'
                                        : 'bg-white border border-[#E5E7EB] text-[#1F2937] hover:border-[#0066FF]'
                                    }`}
                                  >
                                    <span>{day}</span>
                                    {isNonWorking && <Check className="w-4 h-4" />}
                                  </button>
                                );
                              })}
                            </div>
                            <div className="mt-3 pt-3 border-t border-[#E5E7EB]">
                              <p className="text-[11px] text-[#6B7280]">
                                Mark regular weekend days (typically Saturday & Sunday)
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-[#E5E7EB] p-4 bg-[#F9FAFB]">
          <div className="flex items-center justify-between max-w-5xl mx-auto">
            <div className="flex items-center gap-2">
              {!isValid && (
                <div className="flex items-center gap-2 text-[#F87171] text-[13px]">
                  <AlertCircle className="w-4 h-4" />
                  <span>Please enter an office name</span>
                </div>
              )}
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-[14px] text-[#6B7280] hover:bg-white rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={!isValid}
                className={`px-5 py-2 rounded-lg text-[14px] font-medium transition-colors flex items-center gap-2 ${
                  isValid
                    ? 'bg-[#0066FF] hover:bg-[#0052CC] text-white'
                    : 'bg-[#E5E7EB] text-[#9CA3AF] cursor-not-allowed'
                }`}
              >
                <Save className="w-4 h-4" />
                {editingOffice ? 'Save Changes' : 'Create Office'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}