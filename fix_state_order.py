import time
import re

time.sleep(0.5)

# Read the file
with open('src/pages/Projects/board/ProjectBoard.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# The problem is that columns state is defined AFTER the useEffect hooks that reference it
# We need to move columns state definition to BEFORE the useEffect hooks

# Find the boardLabels section (this comes before useEffect hooks currently)
# Find generateTasks and columns state (this comes after useEffect hooks)
# Move them to come right after boardLabels

# Strategy:
# 1. Extract the generateTasks function and columns state
# 2. Remove them from their current location
# 3. Insert them right after boardLabels state

# Find and extract generateTasks + columns
generateTasks_pattern = r'(  const generateTasks = \(columnId: string, color: string, count: number\): Task\[\] => \{[\s\S]*?  \};\n\n  const \[columns, setColumns\] = useState<Column\[\]>\(\(\) => \[[\s\S]*?\n  \]\);)'

match = re.search(generateTasks_pattern, content)
if match:
    generateTasks_and_columns = match.group(1)

    # Remove from current location
    content = content.replace(generateTasks_and_columns, '')

    # Find where to insert (after boardLabels)
    insert_point = '  ]);\n\n  // Load board data from localStorage on mount'

    # Insert before the load useEffect
    content = content.replace(
        insert_point,
        '  ]);\n\n' + generateTasks_and_columns + '\n\n  // Load board data from localStorage on mount'
    )

    print("Moved generateTasks and columns state before useEffect hooks!")
else:
    print("Could not find pattern to move")

# Write back
with open('src/pages/Projects/board/ProjectBoard.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
