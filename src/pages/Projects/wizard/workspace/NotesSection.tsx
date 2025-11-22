import { useState } from 'react';
import { Button } from '../ui/button';
import { Bold, List, Code, Link, Palette } from 'lucide-react';

export function NotesSection() {
  const [notes, setNotes] = useState(
    `# Project Notes

## Key Objectives
- Complete digital transformation for client
- Implement new workflows across all departments
- Ensure minimal disruption during migration

## Recent Updates
Meeting with stakeholders on March 15th went well. All parties agreed on the revised timeline.

## Action Items
1. Finalize architecture design by end of Q1
2. Schedule training sessions for team members
3. Review security protocols with IT department

## Important Links
- Project documentation: [Link to docs]
- Design files: [Link to Figma]`
  );

  return (
    <div className="bg-white rounded-lg border border-[#E3E6EB] shadow-sm">
      {/* Header */}
      <div className="px-6 py-5 border-b border-[#E3E6EB]">
        <h2 className="text-slate-900">Notes</h2>
        <p className="text-sm text-slate-500 mt-1">Project notes and documentation</p>
      </div>

      {/* Editor Toolbar */}
      <div className="px-6 py-3 border-b border-[#E3E6EB] flex items-center gap-2">
        <button className="w-8 h-8 flex items-center justify-center text-slate-600 hover:bg-slate-100 rounded transition-colors">
          <Bold className="w-4 h-4 stroke-[1.5]" />
        </button>
        <button className="w-8 h-8 flex items-center justify-center text-slate-600 hover:bg-slate-100 rounded transition-colors">
          <List className="w-4 h-4 stroke-[1.5]" />
        </button>
        <button className="w-8 h-8 flex items-center justify-center text-slate-600 hover:bg-slate-100 rounded transition-colors">
          <Code className="w-4 h-4 stroke-[1.5]" />
        </button>
        <button className="w-8 h-8 flex items-center justify-center text-slate-600 hover:bg-slate-100 rounded transition-colors">
          <Link className="w-4 h-4 stroke-[1.5]" />
        </button>
        <button className="w-8 h-8 flex items-center justify-center text-slate-600 hover:bg-slate-100 rounded transition-colors">
          <Palette className="w-4 h-4 stroke-[1.5]" />
        </button>
      </div>

      {/* Text Editor */}
      <div className="p-6">
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="w-full min-h-[500px] p-4 bg-[#FAFAFC] border border-[#E3E6EB] rounded-lg focus:border-blue-400 focus:ring-2 focus:ring-blue-50 outline-none resize-none text-sm text-slate-700 leading-relaxed"
          placeholder="Start typing your notes..."
        />
        <div className="flex items-center justify-between mt-4">
          <p className="text-xs text-slate-400">Auto-saved 2 minutes ago</p>
          <Button className="bg-blue-600 hover:bg-blue-700">Save Changes</Button>
        </div>
      </div>
    </div>
  );
}
