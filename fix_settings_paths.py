import time

time.sleep(0.5)

# Read the settings-categories file
with open('src/data/settings-categories.ts', 'r', encoding='utf-8') as f:
    content = f.read()

# Update the import paths
content = content.replace(
    "from '../components/settings/",
    "from '../pages/Settings/"
)

# Write back
with open('src/data/settings-categories.ts', 'w', encoding='utf-8') as f:
    f.write(content)

print("Updated settings-categories.ts import paths!")
