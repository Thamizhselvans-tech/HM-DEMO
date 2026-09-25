import React from 'react';
import {
  Building2,
  Package,
  FileText,
  IndianRupee,
  AlertTriangle,
  ArrowUpRight,
  TrendingUp,
  Clock,
  CheckCircle,
  Plus,
  ChevronRight,
  Boxes,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const AdminDashboard: React.FC = () => {
  const {
    branches,
    products,
    invoices,
    setCurrentAdminTab,
    getLowStockAlerts,
    setSelectedInvoice,
  } = useApp();

  const lowStockAlerts = getLowStockAlerts();

  // Calculate live dynamic metrics:
  // Baseline simulated stats + live invoices added
  const baselineBills = 128;
  const baselineSales = 85600;

  // New invoices generated in this session beyond mock initial
  const newInvoices = invoices.filter(
    (inv) => !['inv-1001', 'inv-1002', 'inv-1003', 'inv-1004', 'inv-1005'].includes(inv.id)
  );

  const newSales = newInvoices.reduce((sum, inv) => sum + inv.grandTotal, 0);
  const totalTodayBills = baselineBills + newInvoices.length;
  const totalTodaySales = baselineSales + newSales;

  // Dynamic branch-wise sales calculations mapped over all branches
  const branchSalesData = branches.map((b, index) => {
    const baseBills = index === 0 ? 45 : index === 1 ? 51 : index === 2 ? 32 : 0;
    const baseSales = index === 0 ? 32500 : index === 1 ? 28400 : index === 2 ? 24700 : 0;
    const bInvoices = newInvoices.filter((inv) => inv.branchId === b.id);
    const bBills = baseBills + bInvoices.length;
    const bSales = baseSales + bInvoices.reduce((sum, inv) => sum + inv.grandTotal, 0);
    return {
      branch: b.name,
      branchId: b.id,
      bills: bBills,
      total: bSales,
      staff: b.name.includes('Main') ? 'Arun, Selva' : b.name.includes('City') ? 'Priya, Divya' : b.name.includes('Clinic') ? 'Karthik' : 'Staff Member',
    };
  });

  return (
    <div className="space-y-6">
      {/* Top Welcome & Subtitle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-[#123B5D] tracking-tight">Admin Dashboard</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time multi-branch operations, sales overview & centralized inventory monitoring
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setCurrentAdminTab('stock-update')}
            className="px-3.5 py-2 bg-[#159A9C] hover:bg-[#0f7a7c] text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs active:scale-[0.98]"
          >
            <Boxes className="w-4 h-4" />
            <span>Add / Update Stock</span>
          </button>
          <button
            onClick={() => setCurrentAdminTab('branches')}
            className="px-3.5 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-[#123B5D] rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all shadow-2xs active:scale-[0.98]"
          >
            <Building2 className="w-4 h-4 text-[#159A9C]" />
            <span>Manage Branches</span>
          </button>
        </div>
      </div>

      {/* Top 4 Stat Cards matching Screen 5 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {/* Total Branches */}
        <div className="bg-white rounded-xl p-5 border border-slate-200/90 shadow-xs hover:border-[#123B5D]/30 transition-all">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Total Branches</span>
            <div className="w-9 h-9 rounded-lg bg-[#eaf2f8] text-[#123B5D] flex items-center justify-center">
              <Building2 className="w-4.5 h-4.5" />
            </div>
          </div>
          <div className="text-2xl sm:text-[28px] font-black text-[#123B5D] font-mono tracking-tight">
            {branches.length}
          </div>
          <div className="text-[11px] text-[#2E8B70] flex items-center gap-1.5 mt-2 font-medium">
            <span className="w-2 h-2 rounded-full bg-[#2E8B70] animate-pulse"></span>
            <span>All 3 Branches Active</span>
          </div>
        </div>

        {/* Total Products */}
        <div className="bg-white rounded-xl p-5 border border-slate-200/90 shadow-xs hover:border-[#159A9C]/30 transition-all">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Total Products</span>
            <div className="w-9 h-9 rounded-lg bg-[#eef8f8] text-[#159A9C] flex items-center justify-center">
              <Package className="w-4.5 h-4.5" />
            </div>
          </div>
          <div className="text-2xl sm:text-[28px] font-black text-[#123B5D] font-mono tracking-tight">
            240
          </div>
          <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-2">
            <span>{products.length} master medicines cataloged</span>
          </div>
        </div>

        {/* Today's Bills */}
        <div className="bg-white rounded-xl p-5 border border-slate-200/90 shadow-xs hover:border-[#2E8B70]/30 transition-all">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Today's Bills</span>
            <div className="w-9 h-9 rounded-lg bg-[#edf7f4] text-[#2E8B70] flex items-center justify-center">
              <FileText className="w-4.5 h-4.5" />
            </div>
          </div>
          <div className="text-2xl sm:text-[28px] font-black text-[#123B5D] font-mono tracking-tight">
            {totalTodayBills}
          </div>
          <div className="text-[11px] text-[#2E8B70] flex items-center gap-1 mt-2 font-semibold">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>+14% vs yesterday</span>
          </div>
        </div>

        {/* Today's Sales */}
        <div className="bg-white rounded-xl p-5 border border-slate-200/90 shadow-xs hover:border-[#C9A227]/40 transition-all">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Today's Sales</span>
            <div className="w-9 h-9 rounded-lg bg-[#fbf6e8] text-[#C9A227] flex items-center justify-center border border-[#C9A227]/20">
              <IndianRupee className="w-4.5 h-4.5" />
            </div>
          </div>
          <div className="text-2xl sm:text-[28px] font-black text-[#123B5D] font-mono tracking-tight">
            ₹{totalTodaySales.toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-[#2E8B70] flex items-center gap-1 mt-2 font-medium">
            <span>Across 3 branch terminals</span>
          </div>
        </div>
      </div>

      {/* Middle Row: Branch Wise Sales (Today) + Low Stock Alerts matching Screen 5 proportions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6">
        {/* Branch Wise Sales Table (Takes 8 of 12 cols for breathing room) */}
        <div className="lg:col-span-8 bg-white rounded-xl border border-slate-200/90 shadow-xs p-5 sm:p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-[#159A9C]"></div>
                <h3 className="font-bold text-[#123B5D] text-sm tracking-tight">
                  Branch Wise Sales (Today)
                </h3>
              </div>
              <button
                onClick={() => setCurrentAdminTab('daily-transactions')}
                className="text-xs font-semibold text-[#159A9C] hover:text-[#0f7a7c] flex items-center gap-1 transition-colors"
              >
                <span>Full Daily Report</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[11px]">
                    <th className="py-3 px-3.5 font-semibold">Branch</th>
                    <th className="py-3 px-3.5 font-semibold text-center">Assigned Staff</th>
                    <th className="py-3 px-3.5 font-semibold text-center">Bills</th>
                    <th className="py-3 px-3.5 font-semibold text-right">Total Sales</th>
                    <th className="py-3 px-3.5 font-semibold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {branchSalesData.map((b) => (
                    <tr key={b.branch} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-3.5 font-semibold text-slate-900">
                        <div className="flex items-center gap-2">
                          <Building2 className="w-4 h-4 text-[#159A9C] shrink-0" />
                          <span>{b.branch}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-3.5 text-center text-slate-500">
                        {b.staff}
                      </td>
                      <td className="py-3.5 px-3.5 text-center font-mono font-semibold text-slate-800">
                        {b.bills}
                      </td>
                      <td className="py-3.5 px-3.5 text-right font-mono font-bold text-[#123B5D]">
                        ₹{b.total.toLocaleString('en-IN')}
                      </td>
                      <td className="py-3.5 px-3.5 text-right">
                        <button
                          onClick={() => setCurrentAdminTab('branch-stock')}
                          className="px-2.5 py-1 text-xs rounded-md bg-[#eef8f8] text-[#159A9C] hover:bg-[#dff3f3] font-semibold border border-[#159A9C]/20 transition-colors"
                        >
                          View Stock
                        </button>
                      </td>
                    </tr>
                  ))}
                  {/* Total Row */}
                  <tr className="bg-slate-50/90 font-bold text-slate-900 border-t-2 border-slate-200">
                    <td className="py-3 px-3.5 text-[#123B5D]">Total (All Branches)</td>
                    <td className="py-3 px-3.5 text-center text-slate-500 font-medium">3 Terminals</td>
                    <td className="py-3 px-3.5 text-center font-mono">{totalTodayBills}</td>
                    <td className="py-3 px-3.5 text-right font-mono text-[#159A9C] text-sm">
                      ₹{totalTodaySales.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-3.5"></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Last transaction: 24 Sep 2026 12:20 PM</span>
            <span className="text-[#2E8B70] font-semibold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#2E8B70]"></span>
              <span>Real-time Sync Active</span>
            </span>
          </div>
        </div>

        {/* Low Stock Alerts Widget (Takes 4 of 12 cols) */}
        <div className="lg:col-span-4 bg-white rounded-xl border border-slate-200/90 shadow-xs p-5 sm:p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-[#D95C5C]"></div>
                <h3 className="font-bold text-[#123B5D] text-sm tracking-tight">Low Stock Alerts</h3>
              </div>
              <button
                onClick={() => setCurrentAdminTab('low-stock')}
                className="text-xs font-semibold text-[#159A9C] hover:text-[#0f7a7c] transition-colors"
              >
                View All ({lowStockAlerts.length})
              </button>
            </div>

            {lowStockAlerts.length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-xs">
                <CheckCircle className="w-8 h-8 text-[#2E8B70] mx-auto mb-2" />
                <p>All stock levels are optimal across all branches.</p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {lowStockAlerts.slice(0, 4).map((alert) => (
                  <div
                    key={alert.id}
                    className="p-3 rounded-lg border border-[#D95C5C]/25 bg-[#faecec]/60 flex items-center justify-between gap-2 text-xs"
                  >
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-[#D95C5C] shrink-0 mt-0.5" />
                      <div>
                        <div className="font-semibold text-slate-900">
                          {alert.productName}
                        </div>
                        <div className="text-[11px] text-slate-500 font-medium">
                          {alert.branchName.split('-')[1]?.trim() || alert.branchName}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-[#D95C5C] font-mono">
                        {alert.currentStock} left
                      </div>
                      <div className="text-[10px] text-slate-400">
                        Limit: ≤{alert.threshold}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={() => setCurrentAdminTab('stock-update')}
            className="w-full mt-4 py-2.5 bg-[#faecec] hover:bg-[#f6d7d7] text-[#D95C5C] border border-[#D95C5C]/30 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Restock Inventory Now</span>
          </button>
        </div>
      </div>

      {/* Recent Invoices Table (Central Master View) */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs p-5 sm:p-6">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
          <div>
            <h3 className="font-bold text-[#123B5D] text-sm tracking-tight">Recent Central Invoices</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Live customer bills generated by billing staff across all branch counters
            </p>
          </div>
          <button
            onClick={() => setCurrentAdminTab('invoices')}
            className="text-xs font-semibold text-[#159A9C] hover:text-[#0f7a7c] flex items-center gap-1 transition-colors"
          >
            <span>View All Invoices</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4 font-semibold">Bill No</th>
                <th className="py-3 px-4 font-semibold">Branch</th>
                <th className="py-3 px-4 font-semibold">Cashier</th>
                <th className="py-3 px-4 font-semibold">Date & Time</th>
                <th className="py-3 px-4 font-semibold text-center">Items</th>
                <th className="py-3 px-4 font-semibold text-right">Total Amount</th>
                <th className="py-3 px-4 font-semibold text-center">Payment</th>
                <th className="py-3 px-4 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {invoices.slice(0, 5).map((inv) => (
                <tr key={inv.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-[#123B5D]">
                    #{inv.billNo}
                  </td>
                  <td className="py-3.5 px-4 font-medium text-slate-900">
                    {inv.branchName}
                  </td>
                  <td className="py-3.5 px-4 text-slate-600">{inv.staffName}</td>
                  <td className="py-3.5 px-4 text-slate-500">{inv.dateTime}</td>
                  <td className="py-3.5 px-4 text-center font-mono font-medium">{inv.totalItems}</td>
                  <td className="py-3.5 px-4 text-right font-mono font-bold text-[#123B5D]">
                    ₹{inv.grandTotal.toFixed(2)}
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <span className="text-[11px] px-2 py-0.5 rounded-md bg-slate-100 font-medium text-slate-700 border border-slate-200/60 inline-flex items-center">
                      {inv.paymentMethod}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => setSelectedInvoice(inv)}
                      className="px-3 py-1 text-xs font-semibold rounded-md bg-[#eaf2f8] hover:bg-[#d8e6f1] text-[#123B5D] border border-[#123B5D]/20 transition-colors"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
