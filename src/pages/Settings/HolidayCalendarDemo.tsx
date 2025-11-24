import React, { useState } from 'react';
import { ArrowLeft, Calendar } from 'lucide-react';
import { HolidayCalendarSetup } from './HolidayCalendarSetup';
import { HolidayCalendarDetail } from './HolidayCalendarDetail';
import { HolidayCalendarUpdateNotification } from './HolidayCalendarUpdateNotification';
import { RegionalCalendar, COUNTRIES_WITH_REGIONS } from './HolidayCalendarData';

type View = 'select' | 'setup' | 'detail' | 'notification';

export function HolidayCalendarDemo() {
  const [view, setView] = useState<View>('select');
  const [selectedCountry, setSelectedCountry] = useState('Spain');
  const [selectedRegion, setSelectedRegion] = useState('Catalonia');
  const [selectedCity, setSelectedCity] = useState('Barcelona');
  const [appliedCalendar, setAppliedCalendar] = useState<RegionalCalendar | null>(null);
  const [companyClosures, setCompanyClosures] = useState([
    {
      id: '1',
      name: 'Christmas Shutdown',
      startDate: '2025-12-24',
      endDate: '2025-12-31',
      recurring: true,
      type: 'company' as const
    },
    {
      id: '2',
      name: 'Summer Closure',
      startDate: '2025-08-01',
      endDate: '2025-08-15',
      recurring: true,
      type: 'company' as const
    }
  ]);

  const mockOfficeUpdates = [
    {
      officeId: '1',
      officeName: 'Barcelona',
      region: 'Catalonia, Spain',
      holidayCount: 15,
      status: 'auto-applied' as const,
      changes: {
        added: [],
        removed: [],
        dateChanged: ['Good Friday (Apr 18 → Apr 10)']
      }
    },
    {
      officeId: '2',
      officeName: 'Madrid',
      region: 'Madrid, Spain',
      holidayCount: 14,
      status: 'auto-applied' as const
    },
    {
      officeId: '3',
      officeName: 'Bilbao',
      region: 'Basque Country, Spain',
      holidayCount: 15,
      status: 'review-needed' as const,
      reviewReason: 'New regional holiday added',
      changes: {
        added: ['Basque Language Day (Dec 3)'],
        removed: [],
        dateChanged: []
      }
    }
  ];

  const handleApply = (calendar: RegionalCalendar, autoUpdate: boolean) => {
    setAppliedCalendar(calendar);
    setView('detail');
  };

  const handleCustomize = (calendar: RegionalCalendar) => {
    setAppliedCalendar(calendar);
    setView('detail');
  };

  const handleAddClosure = (closure: any) => {
    setCompanyClosures([...companyClosures, { ...closure, id: Date.now().toString() }]);
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      {/* Header */}
      <div className="bg-white border-b border-[#E5E7EB]">
        <div className="max-w-7xl mx-auto px-8 py-6">
          <div className="flex items-center gap-4 mb-4">
            {view !== 'select' && (
              <button
                onClick={() => setView('select')}
                className="p-2 hover:bg-[#F3F4F6] rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-[#6B7280]" />
              </button>
            )}
            <div>
              <h1 className="text-[28px] font-medium text-[#1F2937] mb-1">
                Holiday Calendar System
              </h1>
              <p className="text-[14px] text-[#6B7280]">
                "Set it once, forget it forever" — Automated regional holiday management
              </p>
            </div>
          </div>

          {/* View Selector */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setView('select')}
              className={`px-4 py-2 rounded-lg text-[14px] font-medium transition-colors ${
                view === 'select'
                  ? 'bg-[#0066FF] text-white'
                  : 'bg-white text-[#6B7280] hover:bg-[#F3F4F6] border border-[#E5E7EB]'
              }`}
            >
              1. Location Selection
            </button>
            <button
              onClick={() => setView('setup')}
              className={`px-4 py-2 rounded-lg text-[14px] font-medium transition-colors ${
                view === 'setup'
                  ? 'bg-[#0066FF] text-white'
                  : 'bg-white text-[#6B7280] hover:bg-[#F3F4F6] border border-[#E5E7EB]'
              }`}
            >
              2. Auto-Setup
            </button>
            <button
              onClick={() => setView('detail')}
              disabled={!appliedCalendar}
              className={`px-4 py-2 rounded-lg text-[14px] font-medium transition-colors ${
                view === 'detail'
                  ? 'bg-[#0066FF] text-white'
                  : appliedCalendar
                  ? 'bg-white text-[#6B7280] hover:bg-[#F3F4F6] border border-[#E5E7EB]'
                  : 'bg-[#F3F4F6] text-[#D1D5DB] cursor-not-allowed border border-[#E5E7EB]'
              }`}
            >
              3. Manage Calendar
            </button>
            <button
              onClick={() => setView('notification')}
              className={`px-4 py-2 rounded-lg text-[14px] font-medium transition-colors ${
                view === 'notification'
                  ? 'bg-[#0066FF] text-white'
                  : 'bg-white text-[#6B7280] hover:bg-[#F3F4F6] border border-[#E5E7EB]'
              }`}
            >
              4. Annual Updates
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-8 py-8 pb-32">
        {view === 'select' && (
          <div className="max-w-3xl">
            <div className="bg-white rounded-lg border border-[#E5E7EB] p-6 mb-6">
              <h2 className="text-[20px] font-medium text-[#1F2937] mb-4">
                Step 1: Select Office Location
              </h2>
              <p className="text-[14px] text-[#6B7280] mb-6">
                Choose your country and region to automatically load the correct holiday calendar
              </p>

              <div className="space-y-4">
                <div>
                  <label className="block text-[13px] font-medium text-[#1F2937] mb-2">
                    Country
                  </label>
                  <select
                    value={selectedCountry}
                    onChange={(e) => {
                      setSelectedCountry(e.target.value);
                      setSelectedRegion(COUNTRIES_WITH_REGIONS[e.target.value as keyof typeof COUNTRIES_WITH_REGIONS][0]);
                    }}
                    className="w-full px-4 py-2.5 border border-[#D1D5DB] rounded-lg text-[14px] focus:outline-none focus:ring-2 focus:ring-[#0066FF] focus:border-transparent"
                  >
                    {Object.keys(COUNTRIES_WITH_REGIONS).map((country) => (
                      <option key={country} value={country}>
                        {country}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[13px] font-medium text-[#1F2937] mb-2">
                    Region / State
                  </label>
                  <select
                    value={selectedRegion}
                    onChange={(e) => setSelectedRegion(e.target.value)}
                    className="w-full px-4 py-2.5 border border-[#D1D5DB] rounded-lg text-[14px] focus:outline-none focus:ring-2 focus:ring-[#0066FF] focus:border-transparent"
                  >
                    {COUNTRIES_WITH_REGIONS[selectedCountry as keyof typeof COUNTRIES_WITH_REGIONS].map((region) => (
                      <option key={region} value={region}>
                        {region}
                      </option>
                    ))}
                  </select>
                </div>

                {selectedCountry === 'Spain' && (
                  <div>
                    <label className="block text-[13px] font-medium text-[#1F2937] mb-2">
                      City (Optional - for local holidays)
                    </label>
                    <select
                      value={selectedCity}
                      onChange={(e) => setSelectedCity(e.target.value)}
                      className="w-full px-4 py-2.5 border border-[#D1D5DB] rounded-lg text-[14px] focus:outline-none focus:ring-2 focus:ring-[#0066FF] focus:border-transparent"
                    >
                      <option value="">No city selected</option>
                      <option value="Barcelona">Barcelona</option>
                      <option value="Madrid">Madrid City</option>
                      <option value="Seville">Seville</option>
                    </select>
                  </div>
                )}
              </div>

              <button
                onClick={() => setView('setup')}
                className="mt-6 w-full px-6 py-3 bg-[#0066FF] hover:bg-[#0052CC] text-white rounded-lg text-[15px] font-medium transition-colors"
              >
                Next: Load Holiday Calendar →
              </button>
            </div>

            <div className="bg-[#F0F4FF] rounded-lg p-6 border border-[#DBEAFE]">
              <h3 className="text-[16px] font-medium text-[#1F2937] mb-2">
                What happens next?
              </h3>
              <ul className="space-y-2 text-[14px] text-[#6B7280]">
                <li className="flex items-start gap-2">
                  <span className="text-[#0066FF] mt-1">✓</span>
                  <span>We'll automatically load {selectedCountry === 'Spain' ? '10-15' : '8-12'} public holidays for {selectedRegion}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#0066FF] mt-1">✓</span>
                  <span>One-click apply with preview of all holidays</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#0066FF] mt-1">✓</span>
                  <span>Auto-update enabled for future years (2026, 2027+)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#0066FF] mt-1">✓</span>
                  <span>Add company-specific closures afterward</span>
                </li>
              </ul>
            </div>
          </div>
        )}

        {view === 'setup' && (
          <div className="max-w-3xl">
            <HolidayCalendarSetup
              country={selectedCountry}
              region={selectedRegion}
              city={selectedCity}
              onApply={handleApply}
              onCustomize={handleCustomize}
            />
          </div>
        )}

        {view === 'detail' && appliedCalendar && (
          <HolidayCalendarDetail
            officeName="Barcelona Office"
            regionalCalendar={appliedCalendar}
            companyClosures={companyClosures}
            onAddClosure={handleAddClosure}
            onEditException={(date) => console.log('Edit exception:', date)}
            onCopyToOffice={() => console.log('Copy to office')}
          />
        )}

        {view === 'notification' && (
          <div className="max-w-4xl">
            <div className="mb-6">
              <h2 className="text-[20px] font-medium text-[#1F2937] mb-2">
                Annual Calendar Update System
              </h2>
              <p className="text-[14px] text-[#6B7280]">
                Every November, we automatically fetch next year's holidays. This notification appears 
                on your dashboard showing what's changed.
              </p>
            </div>

            <HolidayCalendarUpdateNotification
              year={2026}
              offices={mockOfficeUpdates}
              onDismiss={() => console.log('Dismissed')}
              onReviewOffice={(id) => console.log('Review office:', id)}
              onApplyAll={() => console.log('Apply all')}
            />

            <div className="mt-6 bg-[#F0F4FF] rounded-lg p-6 border border-[#DBEAFE]">
              <h3 className="text-[16px] font-medium text-[#1F2937] mb-3">
                Review Scenarios
              </h3>
              <div className="space-y-3 text-[14px]">
                <div>
                  <div className="font-medium text-[#1F2937] mb-1">✅ Auto-applied</div>
                  <div className="text-[#6B7280] text-[13px]">
                    No changes or only date shifts for moveable holidays (Easter, etc.). 
                    Applied automatically without requiring your review.
                  </div>
                </div>
                <div>
                  <div className="font-medium text-[#1F2937] mb-1">⚠️ Review needed</div>
                  <div className="text-[#6B7280] text-[13px]">
                    New holiday added by government, conflicting data sources, or significant changes. 
                    You'll see exactly what changed before accepting.
                  </div>
                </div>
                <div>
                  <div className="font-medium text-[#1F2937] mb-1">⏳ Pending</div>
                  <div className="text-[#6B7280] text-[13px]">
                    Updates ready but waiting for your confirmation to apply. 
                    Batch apply all at once or review individually.
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}