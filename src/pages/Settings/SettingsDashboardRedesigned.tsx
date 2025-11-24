import React, { useState } from 'react';
import { X, ChevronDown, ChevronUp } from 'lucide-react';
import { getEssentialCategories, advancedCategories, getConfiguredData } from '../../data/settings-categories';
import { EssentialCategoryCard } from './EssentialCategoryCard';
import { AdvancedCategoryCard } from './AdvancedCategoryCard';
import { ProgressBanner } from './ProgressBanner';
import { CelebrationModal } from './CelebrationModal';

interface SettingsDashboardProps {
  onClose?: () => void;
  userName?: string;
  companyName?: string;
}

export function SettingsDashboardRedesigned({ 
  onClose, 
  userName = 'Admin', 
  companyName = 'IRIS Technology Solutions' 
}: SettingsDashboardProps) {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);

  const configuredData = getConfiguredData();
  const essentialCategories = getEssentialCategories(configuredData);

  const essentialsCompleted = essentialCategories.filter(c => c.completed).length;
  const essentialsTotal = essentialCategories.length;

  const handleCategoryClick = (categoryId: string) => {
    setActiveCategory(categoryId);
  };

  const computeIsNextAction = (category: any, index: number) => {
    return !category.completed && !essentialCategories.slice(0, index).some(c => !c.completed);
  };

  // Render active category screen
  if (activeCategory) {
    const category = [...essentialCategories, ...advancedCategories].find(c => c.id === activeCategory);
    if (category) {
      const Component = category.component;
      return <Component onBack={() => setActiveCategory(null)} />;
    }
  }

  return (
    <>
      <div className="min-h-screen bg-[#F9FAFB]">
        {/* Header */}
        <div className="bg-white border-b border-[#E5E7EB]">
          <div className="max-w-7xl mx-auto px-8 py-2">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h1 className="text-[18px] font-medium text-[#1F2937] mb-2">
                  Welcome back, {userName}
                </h1>
                <p className="text-[11px] text-[#6B7280]">
                  {essentialsCompleted < essentialsTotal ? (
                    <>Let's finish setting up <span className="font-medium text-[#1F2937]">{companyName}</span></>
                  ) : (
                    <>Your workspace is ready to go — configure advanced features when needed</>
                  )}
                </p>
              </div>
              {onClose && (
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-[#F3F4F6] rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-[#6B7280]" />
                </button>
              )}
            </div>

            {/* Progress Banner */}
            <ProgressBanner
              completed={essentialsCompleted}
              total={essentialsTotal}
              onCelebrate={() => setShowCelebration(true)}
            />
          </div>
        </div>

        {/* Main content */}
        <div className="max-w-7xl mx-auto px-8 py-3 pb-32">
          {/* Essentials Section */}
          <div className="mb-3">
            <div className="flex items-center gap-1.5 mb-1.5">
              <div className="w-6 h-6 rounded-full bg-[#0066FF] flex items-center justify-center">
                <span className="text-[12px] font-medium text-white">1</span>
              </div>
              <h2 className="text-[15px] font-medium text-[#1F2937]">Essentials</h2>
              <span className="text-[11px] text-[#6B7280] bg-[#F3F4F6] px-3 py-1 rounded-full">
                Complete these first
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
              {essentialCategories.map((category, index) => (
                <EssentialCategoryCard
                  key={category.id}
                  category={category}
                  isNextAction={computeIsNextAction(category, index)}
                  onClick={() => handleCategoryClick(category.id)}
                />
              ))}
            </div>
          </div>

          {/* Advanced Section */}
          <div>
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center gap-2 mb-3 hover:bg-[#F3F4F6] px-4 py-2 rounded-lg transition-colors w-full md:w-auto"
            >
              <div className="w-6 h-6 rounded-full bg-[#9CA3AF] flex items-center justify-center">
                <span className="text-[12px] font-medium text-white">2</span>
              </div>
              <h2 className="text-[15px] font-medium text-[#1F2937]">Configure when ready</h2>
              <span className="text-[11px] text-[#6B7280] bg-[#F3F4F6] px-3 py-1 rounded-full">
                {advancedCategories.length} optional features
              </span>
              {showAdvanced ? (
                <ChevronUp className="w-5 h-5 text-[#6B7280] ml-auto" />
              ) : (
                <ChevronDown className="w-5 h-5 text-[#6B7280] ml-auto" />
              )}
            </button>

            {showAdvanced ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                {advancedCategories.map((category) => (
                  <AdvancedCategoryCard
                    key={category.id}
                    category={category}
                    onClick={() => handleCategoryClick(category.id)}
                  />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                {/* Teaser card - show first advanced feature */}
                <AdvancedCategoryCard
                  category={advancedCategories[0]}
                  onClick={() => setShowAdvanced(true)}
                />
                
                {/* Expand to see more card */}
                <div className="col-span-1 md:col-span-1 lg:col-span-2">
                  <button
                    onClick={() => setShowAdvanced(true)}
                    className="w-full h-full min-h-[140px] bg-white rounded-lg border-2 border-dashed border-[#E5E7EB] hover:border-[#0066FF] hover:bg-[#F9FAFB] transition-all flex flex-col items-center justify-center gap-2 group"
                  >
                    <div className="flex items-center gap-2 text-[14px] font-medium text-[#6B7280] group-hover:text-[#0066FF] transition-colors">
                      <ChevronDown className="w-4 h-4" />
                      View {advancedCategories.length - 1} more optional features
                    </div>
                    <p className="text-[12px] text-[#9CA3AF]">
                      Policies, Workflows, Clients, and more
                    </p>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Skip CTA */}
          {essentialsCompleted < essentialsTotal && (
            <div className="mt-12 text-center">
              <button className="text-[14px] text-[#6B7280] hover:text-[#1F2937] transition-colors">
                Skip setup and explore Workdeck →
              </button>
            </div>
          )}
        </div>
      </div>

      {showCelebration && (
        <CelebrationModal
          onClose={() => setShowCelebration(false)}
          onContinue={() => {
            setShowCelebration(false);
            setShowAdvanced(true);
          }}
          companyName={companyName}
        />
      )}
    </>
  );
}
