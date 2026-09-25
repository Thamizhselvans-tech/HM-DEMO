import React, { useState } from 'react';
import {
  FileText,
  Search,
  Building2,
  Calendar,
  Filter,
  Eye,
  Download,
  IndianRupee,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Invoice } from '../../types';

export const InvoiceList: React.FC = () => {
  const { invoices, branches, selectedInvoice, setSelectedInvoice } = useApp();

  const [selectedBranch, setSelectedBranch] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDate, setSelectedDate] = useState('All'); // or 24 Sep 2026

  const filteredInvoices = invoices.filter((inv) => {
    const matchBranch = selectedBranch === 'All' || inv.branchId === selectedBranch;
    const matchSearch =
      inv.billNo.includes(searchTerm) ||
      inv.staffName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.branchName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (inv.customerName && inv.customerName.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchDate =
      selectedDate === 'All' || inv.dateTime.toLowerCase().includes(selectedDate.toLowerCase());
    return matchBranch && matchSearch && matchDate;
  });

  const totalFilteredSales = filteredInvoices.reduce((sum, inv) => sum + inv.grandTotal, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200">
        <div>
          <h2 className="text-xl font-bold text-[#123B5D] tracking-tight flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#159A9C]" />
            <span>Invoices (All Branches)</span>
          </h2>
          <p className="text-xs text-slate-500">
            Central repository of all customer bills, dispensations, and cash receipts across branches
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-2xs">
          <span className="text-slate-500">Filtered Sales:</span>
          <strong className="font-mono text-[#123B5D]">₹{totalFilteredSales.toFixed(2)}</strong>
        </div>
      </div>

      {/* Filters Bar matching Screen 12 */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
        {/* Branch Filter */}
        <div className="flex items-center gap-2 text-xs">
          <span className="font-semibold text-slate-700 whitespace-nowrap">Select Branch:</span>
          <select
            value={selectedBranch}
            onChange={(e) => setSelectedBranch(e.target.value)}
            className="px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs bg-[#F7FAFC] focus:ring-2 focus:ring-[#159A9C] focus:border-[#159A9C]"
          >
            <option value="All">All Branches</option>
            {branches.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
        </div>

        {/* Date Filter */}
        <div className="flex items-center gap-2 text-xs">
          <span className="font-semibold text-slate-700 whitespace-nowrap">Date:</span>
          <select
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs bg-[#F7FAFC] focus:ring-2 focus:ring-[#159A9C] focus:border-[#159A9C]"
          >
            <option value="All">All Dates</option>
            <option value="24 Sep">Today (24 Sep 2026)</option>
            <option value="23 Sep">Yesterday (23 Sep 2026)</option>
          </select>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search className="w-3.5 h-3.5" />
          </div>
          <input
            type="text"
            placeholder="Search invoice #, staff, patient..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#159A9C] focus:border-[#159A9C]"
          />
        </div>
      </div>

      {/* Invoices Table matching Screen 12 */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[11px]">
                <th className="py-3.5 px-4 font-semibold">Bill No</th>
                <th className="py-3.5 px-4 font-semibold">Branch</th>
                <th className="py-3.5 px-4 font-semibold">Staff</th>
                <th className="py-3.5 px-4 font-semibold">Date & Time</th>
                <th className="py-3.5 px-4 font-semibold text-center">Items</th>
                <th className="py-3.5 px-4 font-semibold text-right">Total Amount</th>
                <th className="py-3.5 px-4 font-semibold text-center">Payment</th>
                <th className="py-3.5 px-4 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400 text-xs">
                    No invoices found matching criteria.
                  </td>
                </tr>
              ) : (
                filteredInvoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-[#159A9C]">
                      #{inv.billNo}
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-900">
                      {inv.branchName}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      {inv.staffName}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 font-mono text-[11px]">
                      {inv.dateTime}
                    </td>
                    <td className="py-3.5 px-4 text-center font-mono font-semibold">
                      {inv.totalItems}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-[#123B5D]">
                      ₹{inv.grandTotal.toFixed(2)}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200/60 inline-flex items-center">
                        {inv.paymentMethod}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => setSelectedInvoice(inv)}
                        className="px-3 py-1.5 bg-[#eef8f8] hover:bg-[#dff3f3] text-[#159A9C] border border-[#159A9C]/20 rounded-md text-xs font-semibold transition-colors shadow-2xs"
                      >
                        View Bill
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
