import React from 'react';
import {
  FileText,
  IndianRupee,
  Plus,
  Clock,
  Building2,
  Package,
  CheckCircle,
  Eye,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface Props {
  onCreateBillClick: () => void;
  onViewBillHistory: () => void;
}

export const StaffDashboard: React.FC<Props> = ({
  onCreateBillClick,
  onViewBillHistory,
}) => {
  const { session, invoices, getStockForBranch, setSelectedInvoice } = useApp();

  const branchId = session?.branchId || 'branch-1';
  const branchName = session?.branchName || 'Branch 1 - Main Hospital';
  const staffName = session?.staffName || 'Staff Member';

  // Branch invoices
  const branchInvoices = invoices.filter((inv) => inv.branchId === branchId);

  // Baseline stats + current branch invoices
  const baseCount = branchId === 'branch-1' ? 45 : branchId === 'branch-2' ? 51 : 32;
  const baseSales = branchId === 'branch-1' ? 32500 : branchId === 'branch-2' ? 28400 : 24700;

  const sessionInvoices = branchInvoices.filter(
    (inv) => !['inv-1001', 'inv-1002', 'inv-1003', 'inv-1004', 'inv-1005'].includes(inv.id)
  );

  const sessionSales = sessionInvoices.reduce((sum, inv) => sum + inv.grandTotal, 0);

  const todayBillsCount = baseCount + sessionInvoices.length;
  const todaySalesAmount = baseSales + sessionSales;

  // Branch Stock lookup
  const stockItems = getStockForBranch(branchId);
  const lowStockItems = stockItems.filter((i) => i.status === 'Low');

  return (
    <div className="space-y-6">
      {/* Welcome Banner matching Screen 16 Right */}
      <div className="bg-[#123B5D] rounded-2xl p-6 text-white shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-[#0c2942]">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#1e5077] border border-[#C9A227]/40 text-xs font-semibold text-slate-100 mb-2">
            <Building2 className="w-3.5 h-3.5 text-[#C9A227]" />
            <span>{branchName}</span>
          </div>
          <h2 className="text-xl font-bold tracking-tight">
            Welcome back, {staffName}
          </h2>
          <p className="text-xs text-slate-300 mt-1">
            Terminal POS Counter Active · Ready to generate patient pharmacy bills
          </p>
        </div>

        <button
          onClick={onCreateBillClick}
          className="px-5 py-3 bg-[#159A9C] text-white hover:bg-[#0f7a7c] rounded-xl font-bold text-xs shadow-md transition-transform active:scale-95 flex items-center justify-center gap-2 shrink-0"
        >
          <Plus className="w-4 h-4 text-white" />
          <span>+ Create New Bill</span>
        </button>
      </div>

      {/* Top 3 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
        {/* Today's Bills */}
        <div className="bg-white rounded-xl p-5 border border-slate-200/90 shadow-xs hover:border-[#159A9C]/50 transition-all">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Today's Bills</span>
            <div className="w-9 h-9 rounded-lg bg-[#eef8f8] text-[#159A9C] flex items-center justify-center">
              <FileText className="w-4.5 h-4.5" />
            </div>
          </div>
          <div className="text-2xl sm:text-[28px] font-black text-[#123B5D] font-mono tracking-tight">
            {todayBillsCount}
          </div>
          <div className="text-[11px] text-[#2E8B70] flex items-center gap-1.5 mt-2 font-medium">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Counter throughput optimal</span>
          </div>
        </div>

        {/* Today's Sales */}
        <div className="bg-white rounded-xl p-5 border border-slate-200/90 shadow-xs hover:border-[#159A9C]/50 transition-all">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Today's Sales</span>
            <div className="w-9 h-9 rounded-lg bg-[#123B5D]/10 text-[#123B5D] flex items-center justify-center">
              <IndianRupee className="w-4.5 h-4.5" />
            </div>
          </div>
          <div className="text-2xl sm:text-[28px] font-black text-[#123B5D] font-mono tracking-tight">
            ₹{todaySalesAmount.toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-2">
            <span>Branch Terminal Collection</span>
          </div>
        </div>

        {/* Available Shelf Items */}
        <div className="bg-white rounded-xl p-5 border border-slate-200/90 shadow-xs hover:border-[#159A9C]/50 transition-all">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Active Shelf Items</span>
            <div className="w-9 h-9 rounded-lg bg-[#eef8f8] text-[#159A9C] flex items-center justify-center">
              <Package className="w-4.5 h-4.5" />
            </div>
          </div>
          <div className="text-2xl sm:text-[28px] font-black text-[#123B5D] font-mono tracking-tight">
            {stockItems.length} <span className="text-sm font-sans font-normal text-slate-500">Medicines</span>
          </div>
          <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-2">
            {lowStockItems.length > 0 ? (
              <span className="text-[#D95C5C] font-semibold flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5" />
                {lowStockItems.length} items low stock
              </span>
            ) : (
              <span className="text-[#2E8B70] font-medium">All medicines stocked</span>
            )}
          </div>
        </div>
      </div>

      {/* Main Grid: Recent Bills Table + Quick Shelf Stock */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6">
        {/* Recent Bills at this counter */}
        <div className="lg:col-span-8 bg-white rounded-xl border border-slate-200/90 shadow-xs p-5 sm:p-6">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-[#123B5D] text-sm tracking-tight">Recent Counter Invoices</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Latest patient transactions generated at {branchName}
              </p>
            </div>
            <button
              onClick={onViewBillHistory}
              className="text-xs font-semibold text-[#159A9C] hover:text-[#0f7a7c] flex items-center gap-1"
            >
              <span>Full History</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-3.5 font-semibold">Bill No</th>
                  <th className="py-3 px-3.5 font-semibold">Patient / Customer</th>
                  <th className="py-3 px-3.5 font-semibold">Time</th>
                  <th className="py-3 px-3.5 font-semibold text-center">Items</th>
                  <th className="py-3 px-3.5 font-semibold text-right">Amount</th>
                  <th className="py-3 px-3.5 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {branchInvoices.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-10 text-center text-slate-400">
                      No bills generated yet for this branch today.
                    </td>
                  </tr>
                ) : (
                  branchInvoices.slice(0, 6).map((inv) => (
                    <tr key={inv.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-3.5 font-mono font-bold text-[#159A9C]">
                        #{inv.billNo}
                      </td>
                      <td className="py-3.5 px-3.5">
                        <div className="font-semibold text-slate-900">
                          {inv.customerName || 'Walk-in Patient'}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          {inv.customerPhone || 'Counter'}
                        </div>
                      </td>
                      <td className="py-3.5 px-3.5 text-slate-500 font-mono text-[11px]">
                        {inv.time || inv.dateTime}
                      </td>
                      <td className="py-3.5 px-3.5 text-center font-mono font-medium">
                        {inv.totalItems}
                      </td>
                      <td className="py-3.5 px-3.5 text-right font-mono font-bold text-[#123B5D]">
                        ₹{inv.grandTotal.toFixed(2)}
                      </td>
                      <td className="py-3.5 px-3.5 text-right">
                        <button
                          onClick={() => setSelectedInvoice(inv)}
                          className="px-3 py-1.5 text-xs font-semibold rounded-md bg-[#eef8f8] text-[#159A9C] hover:bg-[#dff3f3] border border-[#159A9C]/20 transition-colors"
                        >
                          View Slip
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Sidebar: Branch Shelf Stock Status */}
        <div className="lg:col-span-4 bg-white rounded-xl border border-slate-200/90 shadow-xs p-5 sm:p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
              <h3 className="font-bold text-[#123B5D] text-sm tracking-tight">Branch Stock Availability</h3>
              <span className="text-[10px] text-slate-400 font-medium">Live Shelf Count</span>
            </div>

            <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
              {stockItems.map((item) => (
                <div
                  key={item.product.id}
                  className={`p-2.5 rounded-lg border text-xs flex items-center justify-between ${
                    item.status === 'Low'
                      ? 'bg-[#fdf2f2] border-[#D95C5C]/30'
                      : 'bg-[#F7FAFC] border-slate-200/70'
                  }`}
                >
                  <div>
                    <div className="font-semibold text-slate-900">{item.product.name}</div>
                    <div className="text-[10px] text-slate-400">
                      ₹{item.product.rate} · {item.product.unit || 'unit'}
                    </div>
                  </div>
                  <div className="text-right">
                    <div
                      className={`font-mono font-bold ${
                        item.status === 'Low' ? 'text-[#D95C5C]' : 'text-slate-800'
                      }`}
                    >
                      {item.currentStock} left
                    </div>
                    {item.status === 'Low' && (
                      <span className="text-[9px] font-bold text-[#D95C5C] bg-[#fdf2f2] px-1.5 py-0.5 rounded border border-[#D95C5C]/30">
                        LOW
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={onCreateBillClick}
            className="w-full mt-4 py-2.5 bg-[#159A9C] hover:bg-[#0f7a7c] text-white rounded-lg text-xs font-bold shadow-xs transition-colors flex items-center justify-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create Patient Bill Now</span>
          </button>
        </div>
      </div>
    </div>
  );
};
