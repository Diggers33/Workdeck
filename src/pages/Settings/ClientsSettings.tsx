import React, { useState } from 'react';
import { ChevronLeft, Plus, Building, Search, Upload, Edit2, Trash2 } from 'lucide-react';

interface ClientsSettingsProps {
  onBack: () => void;
}

export function ClientsSettings({ onBack }: ClientsSettingsProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [clients, setClients] = useState([
    {
      id: 1,
      name: 'TechCorp Industries',
      contact: 'John Smith',
      email: 'john.smith@techcorp.com',
      phone: '+1 555 0100',
      address: '123 Business Ave, New York, NY',
      vatNumber: 'US123456789',
      paymentTerms: 'NET 30'
    },
    {
      id: 2,
      name: 'Global Solutions Ltd',
      contact: 'Sarah Johnson',
      email: 'sarah.j@globalsolutions.com',
      phone: '+44 20 7946 0958',
      address: '456 Commerce St, London, UK',
      vatNumber: 'GB987654321',
      paymentTerms: 'NET 60'
    },
    {
      id: 3,
      name: 'Innovation Partners',
      contact: 'Michael Chen',
      email: 'm.chen@innovationpartners.com',
      phone: '+49 30 12345678',
      address: '789 Innovation Blvd, Berlin, Germany',
      vatNumber: 'DE456789123',
      paymentTerms: 'NET 30'
    }
  ]);

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    client.contact.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      <div className="bg-white border-b border-[#E5E7EB] sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-8 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <button onClick={onBack} className="p-2 hover:bg-[#F3F4F6] rounded-lg transition-colors">
                <ChevronLeft className="w-5 h-5 text-[#6B7280]" />
              </button>
              <div>
                <h1 className="text-[20px] font-medium text-[#1F2937]">Clients</h1>
                <p className="text-[13px] text-[#6B7280]">Client database management</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button className="px-3 py-2 border border-[#D1D5DB] hover:bg-[#F9FAFB] text-[#374151] rounded-lg text-[13px] font-medium transition-colors flex items-center gap-2">
                <Upload className="w-4 h-4" />
                Import
              </button>
              <button className="px-4 py-2 bg-[#0066FF] hover:bg-[#0052CC] text-white rounded-lg text-[14px] font-medium transition-colors flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Add Client
              </button>
            </div>
          </div>

          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search clients..."
              className="w-full pl-10 pr-4 py-2 border border-[#D1D5DB] rounded-lg text-[14px] focus:outline-none focus:ring-2 focus:ring-[#0066FF] focus:border-transparent"
            />
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-8 py-8 pb-24">
        <div className="grid gap-4">
          {filteredClients.map((client) => (
            <div key={client.id} className="bg-white rounded-lg border border-[#E5E7EB] p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4 flex-1">
                  <div className="w-12 h-12 rounded-lg bg-[#F0F4FF] flex items-center justify-center flex-shrink-0">
                    <Building className="w-6 h-6 text-[#0066FF]" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-[15px] font-medium text-[#1F2937] mb-1">{client.name}</h3>
                    <p className="text-[12px] text-[#6B7280] mb-3">{client.address}</p>
                    
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <p className="text-[11px] font-medium text-[#9CA3AF] mb-0.5">Contact Person</p>
                        <p className="text-[13px] text-[#1F2937]">{client.contact}</p>
                        <p className="text-[11px] text-[#6B7280]">{client.email}</p>
                      </div>
                      <div>
                        <p className="text-[11px] font-medium text-[#9CA3AF] mb-0.5">VAT Number</p>
                        <p className="text-[13px] text-[#1F2937]">{client.vatNumber}</p>
                      </div>
                      <div>
                        <p className="text-[11px] font-medium text-[#9CA3AF] mb-0.5">Payment Terms</p>
                        <p className="text-[13px] text-[#1F2937]">{client.paymentTerms}</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <button className="p-2 hover:bg-[#F3F4F6] rounded-lg transition-colors">
                    <Edit2 className="w-4 h-4 text-[#6B7280]" />
                  </button>
                  <button className="p-2 hover:bg-[#FEE2E2] rounded-lg transition-colors">
                    <Trash2 className="w-4 h-4 text-[#F87171]" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}