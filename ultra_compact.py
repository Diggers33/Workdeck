import time

time.sleep(0.5)

# Read the EssentialCategoryCard file
with open('src/pages/Settings/EssentialCategoryCard.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Make cards even more compact - reduce padding by 25%
content = content.replace('p-4 text-left', 'p-3 text-left')

# Reduce badge positioning
content = content.replace('absolute top-3 right-3', 'absolute top-2 right-2')

# Make icon even smaller
content = content.replace('w-10 h-10 rounded-lg', 'w-8 h-8 rounded-lg')
content = content.replace('w-5 h-5 ${iconColorClass}', 'w-4 h-4 ${iconColorClass}')

# Reduce gap between icon and title
content = content.replace('flex items-start gap-3 mb-3', 'flex items-start gap-2 mb-2')

# Make title section more compact
content = content.replace('flex-1 pt-1', 'flex-1 pt-0.5')
content = content.replace('text-[15px] font-medium text-[#1F2937] mb-0.5', 'text-[14px] font-medium text-[#1F2937] mb-0')
content = content.replace('text-[12px] text-[#6B7280]', 'text-[11px] text-[#6B7280]')

# Make summary section more compact
content = content.replace('ml-13 mb-3', 'ml-10 mb-2')
content = content.replace('text-[12px] font-medium text-[#1F2937] mb-0.5', 'text-[11px] font-medium text-[#1F2937] mb-0')
content = content.replace('text-[11px] text-[#6B7280]', 'text-[10px] text-[#6B7280]')

# Make CTA section more compact
content = content.replace('justify-between ml-13', 'justify-between ml-10')
content = content.replace('text-[11px] text-[#9CA3AF]', 'text-[10px] text-[#9CA3AF]')
content = content.replace('text-[12px] font-medium', 'text-[11px] font-medium')
content = content.replace('w-3.5 h-3.5', 'w-3 h-3')

# Make badges even smaller
content = content.replace('text-[10px] font-medium text-[#34D399]', 'text-[9px] font-medium text-[#34D399]')
content = content.replace('text-[10px] font-medium text-[#0066FF]', 'text-[9px] font-medium text-[#0066FF]')
content = content.replace('px-2 py-0.5 rounded-full', 'px-1.5 py-0.5 rounded-full')
content = content.replace('w-5 h-5 rounded-full border-2', 'w-4 h-4 rounded-full border')
content = content.replace('text-[10px] font-medium text-[#9CA3AF]', 'text-[9px] font-medium text-[#9CA3AF]')

# Write back
with open('src/pages/Settings/EssentialCategoryCard.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Ultra-compacted EssentialCategoryCard!")

# Now update the dashboard
time.sleep(0.5)

with open('src/pages/Settings/SettingsDashboardRedesigned.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Reduce header padding more
content = content.replace('px-8 py-4', 'px-8 py-3')

# Reduce title sizes more
content = content.replace('text-[22px] font-medium', 'text-[20px] font-medium')
content = content.replace('text-[15px] text-[#6B7280]', 'text-[13px] text-[#6B7280]')

# Reduce main content padding more
content = content.replace('px-8 py-6 pb-32', 'px-8 py-4 pb-32')

# Reduce section margin more
content = content.replace('mb-6', 'mb-4')

# Reduce gap in grid more
content = content.replace('gap-3', 'gap-2.5')

# Reduce section header spacing more
content = content.replace('gap-2 mb-3', 'gap-2 mb-2')

# Make section headers smaller
content = content.replace('text-[18px] font-medium', 'text-[16px] font-medium')
content = content.replace('text-[13px] text-[#6B7280]', 'text-[12px] text-[#6B7280]')
content = content.replace('w-8 h-8 rounded-full', 'w-7 h-7 rounded-full')
content = content.replace('text-[14px] font-medium text-white', 'text-[13px] font-medium text-white')

# Write back
with open('src/pages/Settings/SettingsDashboardRedesigned.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Ultra-compacted SettingsDashboardRedesigned!")
