$content = Get-Content 'src/App.tsx' -Raw
$content = $content -replace "import \{ AppLayout \} from '\.\/components\/layout\/AppLayout';", "import { AppLayout } from './components/layout/AppLayout';`nimport { SettingsDashboard } from './pages/Settings/SettingsDashboard';"
$content = $content -replace '(<Route path="/projects/edit/:id" element=\{<ProjectWizardPage />\} />)', '$1`n        <Route path="/settings" element={<SettingsDashboard />} />'
Set-Content 'src/App.tsx' -Value $content -NoNewline
