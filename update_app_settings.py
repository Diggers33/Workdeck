import time

time.sleep(0.5)

# Read the App.tsx file
with open('src/App.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Update the import to use SettingsDashboardRedesigned
content = content.replace(
    "import { SettingsDashboard } from './pages/Settings/SettingsDashboard';",
    "import { SettingsDashboardRedesigned } from './pages/Settings/SettingsDashboardRedesigned';"
)

# Update the route to use SettingsDashboardRedesigned
content = content.replace(
    '<Route path="/settings" element={<SettingsDashboard />} />',
    '<Route path="/settings" element={<SettingsDashboardRedesigned />} />'
)

# Write back
with open('src/App.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Updated App.tsx to use SettingsDashboardRedesigned!")
