import os
import re

# Directory containing board components
board_dir = 'src/pages/Projects/board'

# Walk through all .tsx files
for filename in os.listdir(board_dir):
    if not filename.endswith('.tsx'):
        continue

    filepath = os.path.join(board_dir, filename)

    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    original_content = content

    # Fix common import patterns
    # The gantt folder is a sibling of board folder, so ../gantt/ is correct
    # No changes needed for those

    # Fix any absolute imports that might exist
    content = re.sub(
        r"from ['\"]@/components/",
        r"from '../../components/",
        content
    )

    content = re.sub(
        r"from ['\"]@/lib/",
        r"from '../../../lib/",
        content
    )

    # Fix UI component imports if they exist
    content = re.sub(
        r"from ['\"]@/components/ui/",
        r"from '../../../components/ui/",
        content
    )

    if content != original_content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Fixed imports in {filename}")
    else:
        print(f"No changes needed in {filename}")

print("\nDone fixing imports!")
