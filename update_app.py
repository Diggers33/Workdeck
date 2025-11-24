import time
import os

# Wait a moment to ensure no other process is accessing the file
time.sleep(0.5)

# Read the current file
with open('src/App.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Add the import
if "import { SettingsDashboard }" not in content:
    content = content.replace(
        "import { AppLayout } from './components/layout/AppLayout';",
        "import { AppLayout } from './components/layout/AppLayout';\nimport { SettingsDashboard } from './pages/Settings/SettingsDashboard';"
    )

# Add the route
if '<Route path="/settings"' not in content:
    content = content.replace(
        '<Route path="/projects/edit/:id" element={<ProjectWizardPage />} />',
        '<Route path="/projects/edit/:id" element={<ProjectWizardPage />} />\n        <Route path="/settings" element={<SettingsDashboard />} />'
    )

# Write back
with open('src/App.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Updated App.tsx successfully!")
