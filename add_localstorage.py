import time
import re

time.sleep(0.5)

# Read the file
with open('src/pages/Projects/board/ProjectBoard.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Add useEffect import
content = content.replace(
    "import React, { useState } from 'react';",
    "import React, { useState, useEffect } from 'react';"
)

# Add localStorage key constant after imports
storage_key_constant = """
// LocalStorage keys
const STORAGE_PREFIX = 'workdeck_board_';
const getStorageKey = (projectName: string, key: string) => `${STORAGE_PREFIX}${projectName}_${key}`;
"""

# Insert after the last import
content = content.replace(
    "import { BoardLegend } from './BoardLegend';",
    "import { BoardLegend } from './BoardLegend';" + storage_key_constant
)

# Add localStorage persistence hooks after the columns state
# Find where columns state is defined and add useEffect after it

localstorage_hooks = """
  // Load board data from localStorage on mount
  useEffect(() => {
    const savedColumns = localStorage.getItem(getStorageKey(projectName, 'columns'));
    const savedLabels = localStorage.getItem(getStorageKey(projectName, 'labels'));
    const savedViews = localStorage.getItem(getStorageKey(projectName, 'views'));
    const savedCardSize = localStorage.getItem(getStorageKey(projectName, 'cardSize'));

    if (savedColumns) {
      try {
        const parsed = JSON.parse(savedColumns);
        setColumns(parsed);
      } catch (e) {
        console.error('Failed to parse saved columns:', e);
      }
    }

    if (savedLabels) {
      try {
        const parsed = JSON.parse(savedLabels);
        setBoardLabels(parsed);
      } catch (e) {
        console.error('Failed to parse saved labels:', e);
      }
    }

    if (savedViews) {
      try {
        const parsed = JSON.parse(savedViews);
        // Merge with system views to preserve them
        const systemViews = savedViews.filter((v: any) => v.isSystem);
        const customViews = parsed.filter((v: any) => !v.isSystem);
        setSavedViews([...systemViews, ...customViews]);
      } catch (e) {
        console.error('Failed to parse saved views:', e);
      }
    }

    if (savedCardSize) {
      setCardSize(savedCardSize as 'small' | 'medium' | 'large');
    }
  }, [projectName]);

  // Save columns to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem(getStorageKey(projectName, 'columns'), JSON.stringify(columns));
  }, [columns, projectName]);

  // Save labels to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem(getStorageKey(projectName, 'labels'), JSON.stringify(boardLabels));
  }, [boardLabels, projectName]);

  // Save views to localStorage whenever they change (only custom views)
  useEffect(() => {
    const customViews = savedViews.filter(v => !v.isSystem);
    localStorage.setItem(getStorageKey(projectName, 'views'), JSON.stringify(customViews));
  }, [savedViews, projectName]);

  // Save card size preference
  useEffect(() => {
    localStorage.setItem(getStorageKey(projectName, 'cardSize'), cardSize);
  }, [cardSize, projectName]);
"""

# Find the boardLabels state and insert after it
content = content.replace(
    """  ]);

  const generateTasks = (columnId: string, color: string, count: number): Task[] => {""",
    """  ]);
""" + localstorage_hooks + """
  const generateTasks = (columnId: string, color: string, count: number): Task[] => {"""
)

# Update handleDragEnd to no longer have TODO comment
content = content.replace(
    "    // TODO: Save to localStorage here",
    "    // Changes are automatically saved via useEffect"
)

# Write back
with open('src/pages/Projects/board/ProjectBoard.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Added localStorage persistence to ProjectBoard.tsx!")
