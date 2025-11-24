import time

time.sleep(0.5)

# Read the EssentialCategoryCard file
with open('src/pages/Settings/EssentialCategoryCard.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Make cards super compact - reduce padding by another 25%
content = content.replace('p-3 text-left', 'p-2 text-left')

# Reduce badge positioning
content = content.replace('absolute top-2 right-2', 'absolute top-1.5 right-1.5')

# Make icon even smaller
content = content.replace('w-8 h-8 rounded-lg', 'w-7 h-7 rounded-lg')
content = content.replace('w-4 h-4 ${iconColorClass}', 'w-3.5 h-3.5 ${iconColorClass}')

# Reduce gap between icon and title
content = content.replace('flex items-start gap-2 mb-2', 'flex items-start gap-1.5 mb-1.5')

# Make title section super compact
content = content.replace('flex-1 pt-0.5', 'flex-1')
content = content.replace('text-[14px] font-medium text-[#1F2937] mb-0', 'text-[13px] font-medium text-[#1F2937]')
content = content.replace('text-[11px] text-[#6B7280]', 'text-[10px] text-[#6B7280]')

# Make summary section super compact
content = content.replace('ml-10 mb-2', 'ml-8.5 mb-1.5')
content = content.replace('text-[11px] font-medium text-[#1F2937] mb-0', 'text-[10px] font-medium text-[#1F2937]')
content = content.replace('text-[10px] text-[#6B7280]', 'text-[9px] text-[#6B7280]')

# Make CTA section super compact
content = content.replace('justify-between ml-10', 'justify-between ml-8.5')
content = content.replace('text-[10px] text-[#9CA3AF]', 'text-[9px] text-[#9CA3AF]')
content = content.replace('text-[11px] font-medium', 'text-[10px] font-medium')
content = content.replace('w-3 h-3', 'w-2.5 h-2.5')

# Make badges super small
content = content.replace('text-[9px] font-medium text-[#34D399]', 'text-[8px] font-medium text-[#34D399]')
content = content.replace('text-[9px] font-medium text-[#0066FF]', 'text-[8px] font-medium text-[#0066FF]')
content = content.replace('px-1.5 py-0.5 rounded-full', 'px-1.5 py-0 rounded-full')
content = content.replace('w-4 h-4 rounded-full border', 'w-3.5 h-3.5 rounded-full border')
content = content.replace('text-[9px] font-medium text-[#9CA3AF]', 'text-[8px] font-medium text-[#9CA3AF]')

# Write back
with open('src/pages/Settings/EssentialCategoryCard.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Super-compacted EssentialCategoryCard!")

# Now update the dashboard
time.sleep(0.5)

with open('src/pages/Settings/SettingsDashboardRedesigned.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Reduce header padding more
content = content.replace('px-8 py-3', 'px-8 py-2')

# Reduce title sizes more
content = content.replace('text-[20px] font-medium', 'text-[18px] font-medium')
content = content.replace('text-[13px] text-[#6B7280]', 'text-[12px] text-[#6B7280]')

# Reduce main content padding more
content = content.replace('px-8 py-4 pb-32', 'px-8 py-3 pb-32')

# Reduce section margin more
content = content.replace('mb-4', 'mb-3')

# Reduce gap in grid more
content = content.replace('gap-2.5', 'gap-2')

# Reduce section header spacing more
content = content.replace('gap-2 mb-2', 'gap-1.5 mb-1.5')

# Make section headers smaller
content = content.replace('text-[16px] font-medium', 'text-[15px] font-medium')
content = content.replace('text-[12px] text-[#6B7280]', 'text-[11px] text-[#6B7280]')
content = content.replace('w-7 h-7 rounded-full', 'w-6 h-6 rounded-full')
content = content.replace('text-[13px] font-medium text-white', 'text-[12px] font-medium text-white')

# Write back
with open('src/pages/Settings/SettingsDashboardRedesigned.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Super-compacted SettingsDashboardRedesigned!")
