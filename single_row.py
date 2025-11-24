import time

time.sleep(0.5)

# Read the dashboard file
with open('src/pages/Settings/SettingsDashboardRedesigned.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Change grid from 2 columns to 4 columns (single row)
content = content.replace(
    '<div className="grid grid-cols-1 md:grid-cols-2 gap-2">',
    '<div className="grid grid-cols-1 md:grid-cols-4 gap-2">'
)

# Write back
with open('src/pages/Settings/SettingsDashboardRedesigned.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Changed to single row layout (4 columns)!")
