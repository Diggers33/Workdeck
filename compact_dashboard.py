import time

time.sleep(0.5)

# Read the file
with open('src/pages/Settings/SettingsDashboardRedesigned.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Reduce header padding
content = content.replace(
    '<div className="max-w-7xl mx-auto px-8 py-6">',
    '<div className="max-w-7xl mx-auto px-8 py-4">'
)

# Reduce title size slightly
content = content.replace(
    'text-[24px] font-medium',
    'text-[22px] font-medium'
)

# Reduce main content padding
content = content.replace(
    '<div className="max-w-7xl mx-auto px-8 py-8 pb-32">',
    '<div className="max-w-7xl mx-auto px-8 py-6 pb-32">'
)

# Reduce section margin bottom
content = content.replace(
    '<div className="mb-8">',
    '<div className="mb-6">'
)

# Reduce gap in grid
content = content.replace(
    '<div className="grid grid-cols-1 md:grid-cols-2 gap-4">',
    '<div className="grid grid-cols-1 md:grid-cols-2 gap-3">'
)

# Reduce section header size and spacing
content = content.replace(
    '<div className="flex items-center gap-2 mb-4">',
    '<div className="flex items-center gap-2 mb-3">'
)

content = content.replace(
    '<h2 className="text-[20px] font-medium text-[#1F2937]">',
    '<h2 className="text-[18px] font-medium text-[#1F2937]">'
)

# Write back
with open('src/pages/Settings/SettingsDashboardRedesigned.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Compacted SettingsDashboardRedesigned!")
