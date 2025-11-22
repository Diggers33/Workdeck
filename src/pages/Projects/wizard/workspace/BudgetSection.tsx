import { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Plus, Trash2, DollarSign } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';

interface Expenditure {
  id: string;
  type: string;
  office: string;
  department: string;
  linkedTo: string;
  description: string;
  amount: number;
}

export function BudgetSection() {
  const [expenditures, setExpenditures] = useState<Expenditure[]>([
    {
      id: '1',
      type: 'Software Licenses',
      office: 'Dublin',
      department: 'Engineering',
      linkedTo: 'Design & Development',
      description: 'Adobe Creative Cloud licenses for design team',
      amount: 2400,
    },
    {
      id: '2',
      type: 'Hardware',
      office: 'London',
      department: 'IT',
      linkedTo: 'Planning Phase',
      description: 'Development laptops',
      amount: 8000,
    },
    {
      id: '3',
      type: 'Consulting Services',
      office: 'Dublin',
      department: 'PMO',
      linkedTo: 'Testing & QA',
      description: 'External QA consultant',
      amount: 12000,
    },
  ]);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newExpenditure, setNewExpenditure] = useState<Partial<Expenditure>>({
    type: '',
    office: '',
    department: '',
    linkedTo: '',
    description: '',
    amount: 0,
  });

  const addExpenditure = () => {
    if (!newExpenditure.type || !newExpenditure.amount) return;

    const expenditure: Expenditure = {
      id: Date.now().toString(),
      type: newExpenditure.type,
      office: newExpenditure.office || '',
      department: newExpenditure.department || '',
      linkedTo: newExpenditure.linkedTo || '',
      description: newExpenditure.description || '',
      amount: newExpenditure.amount,
    };

    setExpenditures([...expenditures, expenditure]);
    setIsDialogOpen(false);
    setNewExpenditure({
      type: '',
      office: '',
      department: '',
      linkedTo: '',
      description: '',
      amount: 0,
    });
  };

  const deleteExpenditure = (id: string) => {
    setExpenditures(expenditures.filter((e) => e.id !== id));
  };

  const totalBudget = expenditures.reduce((sum, exp) => sum + exp.amount, 0);

  return (
    <div className="bg-white rounded-lg border border-[#E3E6EB] shadow-sm">
      {/* Header */}
      <div className="px-6 py-5 border-b border-[#E3E6EB] flex items-center justify-between">
        <div>
          <h2 className="text-slate-900">Budget & Expenditures</h2>
          <p className="text-sm text-slate-500 mt-1">Track project costs and expenses</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger className="inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-blue-600 text-white hover:bg-blue-700 h-10 px-4 py-2">
            <Plus className="w-4 h-4 stroke-[1.5]" />
            Add Expenditure
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Add Expenditure Item</DialogTitle>
              <DialogDescription>Add a new expenditure item to the project budget.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label>Expenditure Type</Label>
                <Select
                  value={newExpenditure.type}
                  onValueChange={(value) => setNewExpenditure({ ...newExpenditure, type: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Software Licenses">Software Licenses</SelectItem>
                    <SelectItem value="Hardware">Hardware</SelectItem>
                    <SelectItem value="Consulting Services">Consulting Services</SelectItem>
                    <SelectItem value="Travel & Accommodation">Travel & Accommodation</SelectItem>
                    <SelectItem value="Training">Training</SelectItem>
                    <SelectItem value="Marketing">Marketing</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Office</Label>
                  <Select
                    value={newExpenditure.office}
                    onValueChange={(value) => setNewExpenditure({ ...newExpenditure, office: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select office" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Dublin">Dublin</SelectItem>
                      <SelectItem value="London">London</SelectItem>
                      <SelectItem value="New York">New York</SelectItem>
                      <SelectItem value="Singapore">Singapore</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Department</Label>
                  <Select
                    value={newExpenditure.department}
                    onValueChange={(value) => setNewExpenditure({ ...newExpenditure, department: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Engineering">Engineering</SelectItem>
                      <SelectItem value="IT">IT</SelectItem>
                      <SelectItem value="PMO">PMO</SelectItem>
                      <SelectItem value="Marketing">Marketing</SelectItem>
                      <SelectItem value="Finance">Finance</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Linked Activity or Task</Label>
                <Select
                  value={newExpenditure.linkedTo}
                  onValueChange={(value) => setNewExpenditure({ ...newExpenditure, linkedTo: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select activity or task" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Planning Phase">Planning Phase</SelectItem>
                    <SelectItem value="Design & Development">Design & Development</SelectItem>
                    <SelectItem value="Testing & QA">Testing & QA</SelectItem>
                    <SelectItem value="Deployment">Deployment</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={newExpenditure.description}
                  onChange={(e) => setNewExpenditure({ ...newExpenditure, description: e.target.value })}
                  placeholder="Add description"
                  className="min-h-[80px] resize-none"
                />
              </div>

              <div className="space-y-2">
                <Label>Amount (€)</Label>
                <Input
                  type="number"
                  value={newExpenditure.amount || ''}
                  onChange={(e) => setNewExpenditure({ ...newExpenditure, amount: Number(e.target.value) })}
                  placeholder="0.00"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={addExpenditure} className="bg-blue-600 hover:bg-blue-700">
                  Add Expenditure
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Expenditures Table */}
      <div className="p-6">
        <div className="overflow-hidden rounded-lg border border-[#E3E6EB]">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 border-b border-[#E3E6EB]">
                <th className="text-left px-4 py-3 text-xs text-slate-600">Type</th>
                <th className="text-left px-4 py-3 text-xs text-slate-600">Office</th>
                <th className="text-left px-4 py-3 text-xs text-slate-600">Department</th>
                <th className="text-left px-4 py-3 text-xs text-slate-600">Linked To</th>
                <th className="text-left px-4 py-3 text-xs text-slate-600">Description</th>
                <th className="text-right px-4 py-3 text-xs text-slate-600">Amount (€)</th>
                <th className="w-16"></th>
              </tr>
            </thead>
            <tbody>
              {expenditures.map((expenditure) => (
                <tr key={expenditure.id} className="border-b border-[#E3E6EB] hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3 text-sm text-slate-900">{expenditure.type}</td>
                  <td className="px-4 py-3 text-sm text-slate-600">{expenditure.office || '—'}</td>
                  <td className="px-4 py-3 text-sm text-slate-600">{expenditure.department || '—'}</td>
                  <td className="px-4 py-3 text-sm text-slate-600">{expenditure.linkedTo || '—'}</td>
                  <td className="px-4 py-3 text-sm text-slate-600 max-w-xs truncate">
                    {expenditure.description || '—'}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-900 text-right font-mono">
                    €{expenditure.amount.toLocaleString()}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => deleteExpenditure(expenditure.id)}
                      className="text-slate-400 hover:text-red-600 transition-colors"
                    >
                      <Trash2 className="w-4 h-4 stroke-[1.5]" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-slate-50 border-t-2 border-slate-300">
                <td colSpan={5} className="px-4 py-3 text-sm text-slate-900">
                  Total Budget
                </td>
                <td className="px-4 py-3 text-sm text-slate-900 text-right font-mono">
                  €{totalBudget.toLocaleString()}
                </td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </div>

        {expenditures.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <DollarSign className="w-7 h-7 text-slate-400" />
            </div>
            <p className="text-slate-500 mb-4">No expenditures recorded</p>
            <Button variant="outline" onClick={() => setIsDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2 stroke-[1.5]" />
              Add First Expenditure
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}