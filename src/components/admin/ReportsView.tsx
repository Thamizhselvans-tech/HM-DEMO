import React, { useState } from 'react';
import {
  FileText,
  BarChart3,
  TrendingUp,
  AlertTriangle,
  Boxes,
  PieChart,
  History,
  Download,
  ArrowRight,
  Building2,
  Calendar,
  CheckCircle,
  IndianRupee,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const ReportsView: React.FC = () => {
  const {
    branches,
    products,
    invoices,
    branchStock,
    getLowStockAlerts,
    setCurrentAdminTab,
  } = useApp();

  const [activeReportKey, setActiveReportKey] = useState<
    'sales' | 'stock' | 'lowStock' | 'productWise' | 'branchComp' | 'transactions'
  >('sales');

  const alerts = getLowStockAlerts();

  // Top products calculation based on invoices
  const productSalesMap: Record<string, { name: string; qty: number; revenue: number }> = {};
  products.forEach((p) => {
    productSalesMap[p.id] = { name: p.name, qty: 0, revenue: 0 };
  });

  invoices.forEach((inv) => {
    inv.items.forEach((item) => {
      if (productSalesMap[item.productId]) {
        productSalesMap[item.productId].qty += item.quantity;
        productSalesMap[item.productId].revenue += item.amount;
      }
    });
  });

  const topProducts = Object.values(productSalesMap)
    .sort((a, b) => b.revenue - a.revenue);

  // Total stock units in entire network
  const totalStockUnits = branchStock.reduce((acc, s) => acc + s.currentStock, 0);

  const reportCards = [
    {
      key: 'sales' as const,
      title: 'Daily Sales Report',
      description: 'Branch-wise daily sales and revenue breakdown',
      icon: TrendingUp,
      color: 'navy',
      badge: 'Revenue',
    },
    {
      key: 'stock' as const,
      title: 'Stock Report',
      description: 'Current stock count, valuations, and movement',
      icon: Boxes,
      color: 'emerald',
      badge: `${totalStockUnits} Units`,
    },
    {
      key: 'lowStock' as const,
      title: 'Low Stock Report',
      description: 'Products and branches currently below safe threshold',
      icon: AlertTriangle,
      color: 'coral',
      badge: `${alerts.length} Alerts`,
    },
    {
      key: 'productWise' as const,
      title: 'Product Wise Report',
      description: 'Medicine sales performance and dispensing usage',
      icon: PieChart,
      color: 'teal',
      badge: 'Dispensation',
    },
    {
      key: 'branchComp' as const,
      title: 'Branch Comparison',
      description: 'Comparative analytics across all three branches',
      icon: BarChart3,
      color: 'gold',
      badge: 'Multi-Branch',
    },
    {
      key: 'transactions' as const,
      title: 'Transaction History',
      description: 'Comprehensive historical activity and bill logs',
      icon: History,
      color: 'slate',
      badge: `${invoices.length} Bills`,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200">
        <div>
          <h2 className="text-xl font-bold text-[#123B5D] tracking-tight flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-[#159A9C]" />
            <span>Reports & Analytics (Admin)</span>
          </h2>
          <p className="text-xs text-slate-500">
            Generate executive medical auditing reports, branch comparisons, and inventory telemetry
          </p>
        </div>

        <button
          onClick={() => {
            const data = JSON.stringify({ invoices, branchStock, branches }, null, 2);
            const blob = new Blob([data], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `Hospital_Full_Report_${Date.now()}.json`;
            a.click();
          }}
          className="px-3.5 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-[#123B5D] rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors self-start sm:self-auto shadow-2xs"
        >
          <Download className="w-3.5 h-3.5 text-[#159A9C]" />
          <span>Export All Reports</span>
        </button>
      </div>

      {/* 6 Report Cards matching Screen 13 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {reportCards.map((rc) => {
          const Icon = rc.icon;
          const isSelected = activeReportKey === rc.key;

          return (
            <div
              key={rc.key}
              onClick={() => setActiveReportKey(rc.key)}
              className={`p-4 rounded-xl border transition-all cursor-pointer shadow-xs ${
                isSelected
                  ? 'bg-[#eef8f8] border-[#159A9C] ring-2 ring-[#159A9C]/20 shadow-md'
                  : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-[#F7FAFC]'
              }`}
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <div
                  className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                    rc.color === 'navy'
                      ? 'bg-[#eaf2f8] text-[#123B5D]'
                      : rc.color === 'emerald'
                      ? 'bg-[#edf7f4] text-[#2E8B70]'
                      : rc.color === 'coral'
                      ? 'bg-[#faecec] text-[#D95C5C]'
                      : rc.color === 'teal'
                      ? 'bg-[#eef8f8] text-[#159A9C]'
                      : rc.color === 'gold'
                      ? 'bg-[#fdf8ee] text-[#C9A227]'
                      : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                  {rc.badge}
                </span>
              </div>
              <h3 className="font-bold text-[#123B5D] text-sm">{rc.title}</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">{rc.description}</p>
              <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] font-semibold text-[#159A9C]">
                <span>{isSelected ? 'Viewing Report Below' : 'Click to View Report'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Report Detailed View */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-4">
        {/* Report 1: Daily Sales Report */}
        {activeReportKey === 'sales' && (() => {
          const salesRows = branches.map((b, idx) => {
            const baseSales = idx === 0 ? 32500 : idx === 1 ? 28400 : idx === 2 ? 24700 : 0;
            const baseBills = idx === 0 ? 45 : idx === 1 ? 51 : idx === 2 ? 32 : 0;
            const bNew = invoices.filter(
              (inv) => inv.branchId === b.id && !['inv-1001', 'inv-1002', 'inv-1003', 'inv-1004', 'inv-1005'].includes(inv.id)
            );
            const totalS = baseSales + bNew.reduce((sum, inv) => sum + inv.grandTotal, 0);
            const totalB = baseBills + bNew.length;
            return { branch: b, totalS, totalB };
          });
          const consolidatedSales = salesRows.reduce((sum, r) => sum + r.totalS, 0);

          return (
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                <div>
                  <h3 className="font-bold text-[#123B5D] text-sm">
                    Daily Sales Breakdown (24 Sep 2026)
                  </h3>
                  <p className="text-xs text-slate-500">
                    Total revenue collected across all outpatient and pharmacy billing terminals
                  </p>
                </div>
                <span className="text-xs bg-[#edf7f4] text-[#2E8B70] border border-[#2E8B70]/30 font-bold px-2.5 py-1 rounded">
                  Consolidated: ₹{consolidatedSales.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>

              <div className="space-y-4">
                {salesRows.map(({ branch, totalS, totalB }) => {
                  const percentage = consolidatedSales > 0 ? Math.round((totalS / consolidatedSales) * 100) : 0;

                  return (
                    <div key={branch.id} className="p-3 bg-[#F7FAFC] rounded-lg border border-slate-200/80">
                      <div className="flex justify-between items-center text-xs mb-1.5">
                        <span className="font-bold text-slate-900">{branch.name}</span>
                        <span className="font-mono font-bold text-[#123B5D]">
                          ₹{totalS.toLocaleString('en-IN')} ({totalB} bills)
                        </span>
                      </div>
                      <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-[#159A9C] h-full rounded-full transition-all"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-[11px] text-slate-400 mt-1">
                        <span>{branch.city}</span>
                        <span>{percentage}% of daily hospital revenue</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })()}

        {/* Report 2: Stock Report */}
        {activeReportKey === 'stock' && (
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div>
                <h3 className="font-bold text-[#123B5D] text-sm">Central Stock Valuation</h3>
                <p className="text-xs text-slate-500">Total units stocked across all 3 branches</p>
              </div>
              <button
                onClick={() => setCurrentAdminTab('branch-stock')}
                className="text-xs text-[#159A9C] font-semibold hover:underline"
              >
                Go to Branch Stock View →
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {branches.map((b) => {
                const branchUnits = branchStock
                  .filter((s) => s.branchId === b.id)
                  .reduce((acc, s) => acc + s.currentStock, 0);

                return (
                  <div key={b.id} className="p-4 bg-[#F7FAFC] rounded-xl border border-slate-200 text-center">
                    <Building2 className="w-5 h-5 text-[#159A9C] mx-auto mb-1" />
                    <div className="font-bold text-[#123B5D] text-xs">{b.name}</div>
                    <div className="text-xl font-bold font-mono text-[#123B5D] mt-2">
                      {branchUnits} units
                    </div>
                    <div className="text-[11px] text-slate-500 mt-1">Available on shelf</div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Report 3: Low Stock Report */}
        {activeReportKey === 'lowStock' && (
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div>
                <h3 className="font-bold text-[#123B5D] text-sm">
                  Active Low Stock Threshold Violations
                </h3>
                <p className="text-xs text-slate-500">
                  Items requiring immediate replenishment to avoid stockout during customer billing
                </p>
              </div>
              <button
                onClick={() => setCurrentAdminTab('low-stock')}
                className="text-xs text-[#D95C5C] font-semibold hover:underline"
              >
                Manage Low Stock Alerts →
              </button>
            </div>

            <div className="space-y-2">
              {alerts.map((alert) => (
                <div
                  key={alert.id}
                  className="p-3 bg-[#faecec]/50 rounded-lg border border-[#D95C5C]/25 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-[#D95C5C] shrink-0" />
                    <div>
                      <div className="font-bold text-slate-900">{alert.productName}</div>
                      <div className="text-[11px] text-slate-500">{alert.branchName}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[#D95C5C] font-bold font-mono">
                      {alert.currentStock} units left
                    </div>
                    <div className="text-[10px] text-slate-500">
                      Threshold: {alert.threshold} units (Deficit: {alert.threshold - alert.currentStock})
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Report 4: Product Wise Report */}
        {activeReportKey === 'productWise' && (
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div>
                <h3 className="font-bold text-[#123B5D] text-sm">Product-Wise Dispensing & Revenue</h3>
                <p className="text-xs text-slate-500">Performance rankings across all hospital branches</p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 uppercase text-[11px]">
                    <th className="py-2 px-3">Product Name</th>
                    <th className="py-2 px-3 text-center">Units Sold</th>
                    <th className="py-2 px-3 text-right">Revenue Generated</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {topProducts.map((p, idx) => (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="py-2.5 px-3 font-semibold text-slate-900">{p.name}</td>
                      <td className="py-2.5 px-3 text-center font-mono">{p.qty} units</td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-[#123B5D]">
                        ₹{p.revenue.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Report 5: Branch Comparison */}
        {activeReportKey === 'branchComp' && (
          <div>
            <div className="pb-3 border-b border-slate-100 mb-4">
              <h3 className="font-bold text-[#123B5D] text-sm">Branch Performance Comparison</h3>
              <p className="text-xs text-slate-500">Head-to-head comparison of efficiency and patient traffic</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {branches.map((b, idx) => {
                const baseBills = idx === 0 ? 45 : idx === 1 ? 51 : idx === 2 ? 32 : 12;
                const baseSales = idx === 0 ? 32500 : idx === 1 ? 28400 : idx === 2 ? 24700 : 9500;
                const bInvoices = invoices.filter((inv) => inv.branchId === b.id);
                const isNewSessionInv = bInvoices.filter((inv) => !['inv-1001', 'inv-1002', 'inv-1003', 'inv-1004', 'inv-1005'].includes(inv.id));
                const totalB = baseBills + isNewSessionInv.length;
                const totalS = baseSales + isNewSessionInv.reduce((sum, inv) => sum + inv.grandTotal, 0);
                const avgTicket = Math.round(totalS / (totalB || 1));

                return (
                  <div key={b.id} className="p-4 rounded-xl border border-slate-200 bg-[#F7FAFC]">
                    <div className="font-bold text-xs text-[#123B5D]">{b.name}</div>
                    <div className="text-[11px] text-slate-500 mb-3">
                      {b.city} · {b.staffCount || 2} Staff · {b.code}
                    </div>
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-slate-600">Daily Volume:</span>
                        <strong className="font-mono text-slate-800">{totalB} Bills</strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Total Revenue:</span>
                        <strong className="font-mono text-[#159A9C]">₹{totalS.toLocaleString('en-IN')}</strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Avg Ticket Size:</span>
                        <strong className="font-mono text-[#123B5D]">₹{avgTicket}</strong>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Report 6: Transaction History */}
        {activeReportKey === 'transactions' && (
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div>
                <h3 className="font-bold text-[#123B5D] text-sm">Detailed Transaction History</h3>
                <p className="text-xs text-slate-500">Every recorded transaction across all branches</p>
              </div>
              <button
                onClick={() => setCurrentAdminTab('daily-transactions')}
                className="text-xs text-[#159A9C] font-semibold hover:underline"
              >
                Go to Daily Transactions View →
              </button>
            </div>

            <div className="space-y-2">
              {invoices.map((inv) => (
                <div
                  key={inv.id}
                  className="p-3 bg-[#F7FAFC] rounded-lg border border-slate-200 flex items-center justify-between text-xs"
                >
                  <div>
                    <div className="font-bold text-slate-900">
                      Bill #{inv.billNo} — {inv.branchName}
                    </div>
                    <div className="text-[11px] text-slate-500">
                      Staff: {inv.staffName} · {inv.dateTime} · {inv.totalItems} items
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold font-mono text-[#123B5D]">
                      ₹{inv.grandTotal.toFixed(2)}
                    </div>
                    <div className="text-[10px] text-slate-400">{inv.paymentMethod}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
