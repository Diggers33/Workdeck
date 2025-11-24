import time

# Wait a moment to ensure no other process is accessing the file
time.sleep(0.5)

# Read the current file
with open('src/components/layout/UserProfileDropdown.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Add useNavigate import
if "useNavigate" not in content:
    content = content.replace(
        "import { useState } from 'react';",
        "import { useState } from 'react';\nimport { useNavigate } from 'react-router-dom';"
    )

# Add useNavigate hook
if "const navigate = useNavigate();" not in content:
    content = content.replace(
        "const [isOpen, setIsOpen] = useState(false);",
        "const [isOpen, setIsOpen] = useState(false);\n  const navigate = useNavigate();"
    )

# Add onClick handler for Settings
content = content.replace(
    """  const menuItems = [
    {
      icon: <User style={{ width: '16px', height: '16px' }} />,
      label: 'My Profile',
      color: '#0A0A0A'
    },
    {
      icon: <Layout style={{ width: '16px', height: '16px' }} />,
      label: 'Customize Widgets',
      color: '#0A0A0A'
    },
    {
      icon: <Settings style={{ width: '16px', height: '16px' }} />,
      label: 'Settings',
      color: '#0A0A0A'
    },""",
    """  const menuItems = [
    {
      icon: <User style={{ width: '16px', height: '16px' }} />,
      label: 'My Profile',
      color: '#0A0A0A'
    },
    {
      icon: <Layout style={{ width: '16px', height: '16px' }} />,
      label: 'Customize Widgets',
      color: '#0A0A0A'
    },
    {
      icon: <Settings style={{ width: '16px', height: '16px' }} />,
      label: 'Settings',
      color: '#0A0A0A',
      onClick: () => { setIsOpen(false); navigate('/settings'); }
    },"""
)

# Write back
with open('src/components/layout/UserProfileDropdown.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Updated UserProfileDropdown.tsx successfully!")
