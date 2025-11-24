import time

time.sleep(0.5)

# Read the file
with open('src/pages/Settings/EssentialCategoryCard.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace padding from p-6 to p-4
content = content.replace('p-6 text-left', 'p-4 text-left')

# Replace absolute positioning for badge
content = content.replace('absolute top-4 right-4', 'absolute top-3 right-3')

# Make icon smaller and position side by side with title
old_layout = '''      {/* Icon */}
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
          <p className="text-[12px] text-[#6B7280]">
            {category.details}
          </p>
        </div>
      </div>'''

new_layout = '''      {/* Icon and Title - Side by Side */}
      <div className="flex items-start gap-3 mb-3">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${iconBgClass}`}>
          <Icon className={`w-5 h-5 ${iconColorClass}`} />
        </div>
        <div className="flex-1 pt-1">
          <h3 className="text-[15px] font-medium text-[#1F2937] mb-0.5">
            {category.name}
          </h3>
          <p className="text-[12px] text-[#6B7280]">
            {category.description}
          </p>
        </div>
      </div>

      {/* Compact Summary */}
      <div className="ml-13 mb-3">
        <p className="text-[12px] font-medium text-[#1F2937] mb-0.5">
          {category.summary}
        </p>
        <p className="text-[11px] text-[#6B7280]">
          {category.details}
        </p>
      </div>'''

content = content.replace(old_layout, new_layout)

# Make CTA section more compact
old_cta = '''      {/* CTA */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1 text-[12px] text-[#9CA3AF]">
          <Clock className="w-3 h-3" />
          {category.timeEstimate}
        </div>
        <div className={`flex items-center gap-1 text-[13px] font-medium ${actionColorClass} ${isNextAction ? 'group-hover:gap-2' : ''} transition-all`}>
          {category.action}
          <ArrowRight className="w-4 h-4" />
        </div>
      </div>'''

new_cta = '''      {/* CTA */}
      <div className="flex items-center justify-between ml-13">
        <div className="flex items-center gap-1 text-[11px] text-[#9CA3AF]">
          <Clock className="w-3 h-3" />
          {category.timeEstimate}
        </div>
        <div className={`flex items-center gap-1 text-[12px] font-medium ${actionColorClass} ${isNextAction ? 'group-hover:gap-2' : ''} transition-all`}>
          {category.action}
          <ArrowRight className="w-3.5 h-3.5" />
        </div>
      </div>'''

content = content.replace(old_cta, new_cta)

# Make badges smaller
content = content.replace('text-[11px] font-medium text-[#34D399]', 'text-[10px] font-medium text-[#34D399]')
content = content.replace('text-[11px] font-medium text-[#0066FF]', 'text-[10px] font-medium text-[#0066FF]')
content = content.replace('px-2 py-1 rounded-full', 'px-2 py-0.5 rounded-full')
content = content.replace('w-6 h-6 rounded-full border-2', 'w-5 h-5 rounded-full border-2')
content = content.replace('text-[11px] font-medium text-[#9CA3AF]', 'text-[10px] font-medium text-[#9CA3AF]')

# Write back
with open('src/pages/Settings/EssentialCategoryCard.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Compacted EssentialCategoryCard!")
