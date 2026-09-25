import React, { useState } from 'react';
import {
  Calendar,
  Building2,
  TrendingUp,
  Boxes,
  FileText,
  IndianRupee,
  Download,
  Filter,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { useApp } from '../../context/AppContext';

export const DailyTransactions: React.FC = () => {
  const { branches, invoices, setSelectedInvoice, branchStock, products, showToast } = useApp();

  const [selectedDate, setSelectedDate] = useState('2026-09-24');
  const [selectedBranchFilter, setSelectedBranchFilter] = useState('All');
  const [exportNotice, setExportNotice] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Helper to format date string
  const formatDisplayDate = (dStr: string) => {
    if (dStr === '2026-09-24') return '24 Sep 2026';
    if (dStr === '2026-09-23') return '23 Sep 2026';
    const parts = dStr.split('-');
    if (parts.length === 3) {
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const mIdx = parseInt(parts[1], 10) - 1;
      return `${parts[2]} ${months[mIdx] || parts[1]} ${parts[0]}`;
    }
    return dStr;
  };

  const formatFilenameDate = (dStr: string) => {
    if (dStr === '2026-09-24') return '24-Sep-2026';
    if (dStr === '2026-09-23') return '23-Sep-2026';
    const parts = dStr.split('-');
    if (parts.length === 3) {
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const mIdx = parseInt(parts[1], 10) - 1;
      return `${parts[2]}-${months[mIdx] || parts[1]}-${parts[0]}`;
    }
    return dStr;
  };

  // Baseline data based on date
  const isYesterday = selectedDate === '2026-09-23';

  const newInvoices = invoices.filter(
    (inv) => !['inv-1001', 'inv-1002', 'inv-1003', 'inv-1004', 'inv-1005'].includes(inv.id)
  );

  const allBranchSummaryRows = branches.map((b, idx) => {
    const baseBills = isYesterday
      ? (idx === 0 ? 38 : idx === 1 ? 44 : idx === 2 ? 28 : 0)
      : (idx === 0 ? 45 : idx === 1 ? 51 : idx === 2 ? 32 : 0);
    const baseSales = isYesterday
      ? (idx === 0 ? 29800 : idx === 1 ? 26100 : idx === 2 ? 21500 : 0)
      : (idx === 0 ? 32500 : idx === 1 ? 28400 : idx === 2 ? 24700 : 0);
    const baseItems = isYesterday
      ? (idx === 0 ? 105 : idx === 1 ? 92 : idx === 2 ? 74 : 0)
      : (idx === 0 ? 120 : idx === 1 ? 98 : idx === 2 ? 86 : 0);

    const bNew = isYesterday ? [] : newInvoices.filter((i) => i.branchId === b.id);
    return {
      id: b.id,
      name: b.name,
      city: b.city,
      bills: baseBills + bNew.length,
      totalSales: baseSales + bNew.reduce((s, i) => s + i.grandTotal, 0),
      itemsSold: baseItems + bNew.reduce((s, i) => s + i.totalItems, 0),
    };
  });

  const branchSummaryRows = allBranchSummaryRows.filter(
    (b) => selectedBranchFilter === 'All' || b.id === selectedBranchFilter
  );

  const totalBills = branchSummaryRows.reduce((sum, r) => sum + r.bills, 0);
  const totalSales = branchSummaryRows.reduce((sum, r) => sum + r.totalSales, 0);
  const totalItemsSold = branchSummaryRows.reduce((sum, r) => sum + r.itemsSold, 0);

  const filteredInvoices = invoices.filter((inv) => {
    const matchBranch = selectedBranchFilter === 'All' || inv.branchId === selectedBranchFilter;
    const matchDate = isYesterday
      ? (inv.date === '2026-09-23' || inv.dateTime?.includes('23 Sep'))
      : (inv.date !== '2026-09-23' || inv.dateTime?.includes('24 Sep'));
    return matchBranch && matchDate;
  });

  const handleExportExcel = () => {
    try {
      // 11. Empty data handling
      if (filteredInvoices.length === 0) {
        const msg = 'No transactions found for the selected date and branch.';
        setExportNotice({ type: 'error', message: msg });
        if (showToast) showToast(msg);
        setTimeout(() => setExportNotice(null), 5000);
        return;
      }

      const activeDateDisplay = formatDisplayDate(selectedDate);
      const activeFileDate = formatFilenameDate(selectedDate);
      const activeBranchName =
        selectedBranchFilter === 'All'
          ? 'All Branches'
          : branches.find((b) => b.id === selectedBranchFilter)?.name || selectedBranchFilter;

      // Create Workbook
      const wb = XLSX.utils.book_new();

      // ==========================================
      // SHEET 1: Daily Summary
      // ==========================================
      const sheet1Rows: (string | number)[][] = [
        ['DAILY TRANSACTION SUMMARY'],
        [],
        ['Organization:', 'Central HQ'],
        ['Audit Date:', activeDateDisplay],
        ['Branch Filter:', activeBranchName],
        ['Generated At:', new Date().toLocaleString('en-IN')],
        [],
        ['Branch', 'Bills', 'Total Sales (₹)', 'Stock Items Sold'],
      ];

      branchSummaryRows.forEach((row) => {
        sheet1Rows.push([
          `${row.name} (${row.city})`,
          row.bills,
          row.totalSales,
          row.itemsSold,
        ]);
      });

      // Total Row
      const totalLabel = selectedBranchFilter === 'All' ? 'TOTAL (ALL BRANCHES)' : 'TOTAL';
      sheet1Rows.push([totalLabel, totalBills, totalSales, totalItemsSold]);

      const ws1 = XLSX.utils.aoa_to_sheet(sheet1Rows);
      ws1['!cols'] = [{ wch: 32 }, { wch: 14 }, { wch: 20 }, { wch: 18 }];

      XLSX.utils.book_append_sheet(wb, ws1, 'Daily Summary');

      // ==========================================
      // SHEET 2: Transaction Details
      // ==========================================
      const sheet2Rows: (string | number)[][] = [
        [
          'Invoice No',
          'Date',
          'Time',
          'Branch',
          'Cashier / Billing Staff',
          'Patient / Customer',
          'Number of Items',
          'Payment Method',
          'Total Amount (₹)',
        ],
      ];

      let sumItems = 0;
      let sumAmount = 0;

      filteredInvoices.forEach((inv) => {
        sumItems += inv.totalItems;
        sumAmount += inv.grandTotal;

        const timePart =
          inv.time ||
          (inv.dateTime && inv.dateTime.includes(' ')
            ? inv.dateTime.split(' ').slice(3).join(' ')
            : '10:00 AM');

        sheet2Rows.push([
          `#${inv.billNo}`,
          activeDateDisplay,
          timePart,
          inv.branchName,
          inv.staffName,
          inv.customerName || 'Walk-in Patient',
          inv.totalItems,
          inv.paymentMethod,
          inv.grandTotal,
        ]);
      });

      // Total Row for Transaction Details
      sheet2Rows.push([
        'TOTAL',
        '',
        '',
        '',
        '',
        `${filteredInvoices.length} Invoices`,
        sumItems,
        '',
        sumAmount,
      ]);

      const ws2 = XLSX.utils.aoa_to_sheet(sheet2Rows);
      ws2['!cols'] = [
        { wch: 14 },
        { wch: 16 },
        { wch: 12 },
        { wch: 28 },
        { wch: 24 },
        { wch: 26 },
        { wch: 16 },
        { wch: 16 },
        { wch: 18 },
      ];
      ws2['!autofilter'] = { ref: `A1:I${sheet2Rows.length}` };

      XLSX.utils.book_append_sheet(wb, ws2, 'Transaction Details');

      // ==========================================
      // SHEET 3: Stock Summary
      // ==========================================
      const sheet3Rows: (string | number)[][] = [
        [
          'Branch',
          'Product',
          'Opening Stock',
          'Quantity Sold',
          'Stock Added',
          'Closing Stock',
          'Alert Threshold',
          'Status',
        ],
      ];

      // Calculate quantity sold for each branch and product from the selected day's invoices
      const targetBranches =
        selectedBranchFilter === 'All'
          ? branches
          : branches.filter((b) => b.id === selectedBranchFilter);

      let sumOpen = 0;
      let sumSold = 0;
      let sumAdded = 0;
      let sumClose = 0;

      targetBranches.forEach((br) => {
        const branchInvoices = filteredInvoices.filter((inv) => inv.branchId === br.id);

        // Map product sold quantity
        const productSalesMap = new Map<string, number>();
        branchInvoices.forEach((inv) => {
          inv.items.forEach((item) => {
            const cur = productSalesMap.get(item.productId) || 0;
            productSalesMap.set(item.productId, cur + item.quantity);
          });
        });

        // Get branch stock records
        const brStockItems = branchStock.filter((s) => s.branchId === br.id);

        brStockItems.forEach((st) => {
          const prod = products.find((p) => p.id === st.productId);
          if (!prod) return;

          const qtySold = productSalesMap.get(st.productId) || 0;
          const stockAdded = 0;
          const closingStock = st.currentStock;
          const openingStock = closingStock + qtySold - stockAdded;
          const threshold = prod.threshold || 10;
          const status = closingStock <= threshold ? 'Low Stock' : 'Normal';

          sumOpen += openingStock;
          sumSold += qtySold;
          sumAdded += stockAdded;
          sumClose += closingStock;

          sheet3Rows.push([
            br.name,
            prod.name,
            openingStock,
            qtySold,
            stockAdded,
            closingStock,
            threshold,
            status,
          ]);
        });
      });

      // Total row for Stock Summary
      sheet3Rows.push([
        'TOTAL',
        '',
        sumOpen,
        sumSold,
        sumAdded,
        sumClose,
        '',
        '',
      ]);

      const ws3 = XLSX.utils.aoa_to_sheet(sheet3Rows);
      ws3['!cols'] = [
        { wch: 28 },
        { wch: 24 },
        { wch: 15 },
        { wch: 15 },
        { wch: 14 },
        { wch: 15 },
        { wch: 16 },
        { wch: 14 },
      ];
      ws3['!autofilter'] = { ref: `A1:H${sheet3Rows.length}` };

      XLSX.utils.book_append_sheet(wb, ws3, 'Stock Summary');

      // Export file
      const filename = `Daily_Transactions_${activeFileDate}.xlsx`;
      XLSX.writeFile(wb, filename);

      const successMsg = `Daily transaction report exported successfully (${filename})`;
      setExportNotice({ type: 'success', message: successMsg });
      if (showToast) showToast(successMsg);
      setTimeout(() => setExportNotice(null), 5000);
    } catch (err) {
      console.error('Failed to export daily transactions workbook:', err);
      const errMsg = 'Unable to export the daily transaction report. Please try again.';
      setExportNotice({ type: 'error', message: errMsg });
      if (showToast) showToast(errMsg);
      setTimeout(() => setExportNotice(null), 6000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200">
        <div>
          <h2 className="text-xl font-bold text-[#123B5D] tracking-tight flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-[#159A9C]" />
            <span>Daily Transactions (Admin View)</span>
          </h2>
          <p className="text-xs text-slate-500">
            End-of-day branch sales consolidation, invoice counts, and medicine dispensing units
          </p>
        </div>

        <button
          onClick={handleExportExcel}
          className="px-3.5 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-[#123B5D] rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors self-start sm:self-auto shadow-2xs cursor-pointer active:scale-95"
          title="Export daily transactions workbook (.xlsx)"
        >
          <Download className="w-3.5 h-3.5 text-[#159A9C]" />
          <span>Export Daily Summary</span>
        </button>
      </div>

      {/* Export Status Notification */}
      {exportNotice && (
        <div
          className={`flex items-center justify-between gap-3 p-3 text-xs rounded-xl shadow-xs border animate-in fade-in duration-150 ${
            exportNotice.type === 'success'
              ? 'bg-emerald-50/90 border-emerald-200 text-emerald-800'
              : 'bg-rose-50/90 border-rose-200 text-rose-800'
          }`}
        >
          <div className="flex items-center gap-2 font-medium">
            {exportNotice.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{exportNotice.message}</span>
          </div>
          <button
            onClick={() => setExportNotice(null)}
            className="text-slate-400 hover:text-slate-600 text-xs font-bold px-1"
          >
            ×
          </button>
        </div>
      )}

      {/* Date & Branch Picker Bar matching Screen 14 */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs">
          <Calendar className="w-4 h-4 text-[#159A9C]" />
          <span className="font-semibold text-slate-700">Audit Date:</span>
          <select
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-semibold bg-[#F7FAFC] focus:ring-2 focus:ring-[#159A9C] focus:border-[#159A9C]"
          >
            <option value="2026-09-24">24 Sep 2026 (Today)</option>
            <option value="2026-09-23">23 Sep 2026 (Yesterday)</option>
          </select>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <Building2 className="w-4 h-4 text-[#159A9C]" />
          <span className="font-semibold text-slate-700">Filter Branch:</span>
          <select
            value={selectedBranchFilter}
            onChange={(e) => setSelectedBranchFilter(e.target.value)}
            className="px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-semibold bg-[#F7FAFC] focus:ring-2 focus:ring-[#159A9C] focus:border-[#159A9C]"
          >
            <option value="All">All Branches</option>
            {branches.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Daily Transactions Summary Table matching Screen 14 */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-3 bg-[#F7FAFC] border-b border-slate-200 font-bold text-xs text-[#123B5D]">
          Consolidated Branch Sales Table — {formatDisplayDate(selectedDate)}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[11px] bg-slate-50/50">
                <th className="py-3 px-4 font-semibold">Branch</th>
                <th className="py-3 px-4 font-semibold text-center">Bills</th>
                <th className="py-3 px-4 font-semibold text-right">Total Sales</th>
                <th className="py-3 px-4 font-semibold text-center">Stock Items Sold</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {branchSummaryRows.map((row) => (
                <tr key={row.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-4 font-semibold text-slate-900 flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-[#159A9C]" />
                    <span>{row.name}</span>
                    <span className="text-slate-400 font-normal">({row.city})</span>
                  </td>
                  <td className="py-3.5 px-4 text-center font-mono font-medium">
                    {row.bills}
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono font-bold text-[#123B5D]">
                    ₹{row.totalSales.toLocaleString('en-IN')}
                  </td>
                  <td className="py-3.5 px-4 text-center font-mono text-slate-700">
                    {row.itemsSold} items
                  </td>
                </tr>
              ))}

              {/* Total Row matching Screen 14: Total 128 | ₹85,600 | 304 items */}
              {selectedBranchFilter === 'All' && (
                <tr className="bg-[#eef8f8] font-bold text-[#123B5D] border-t-2 border-[#159A9C]/40">
                  <td className="py-3 px-4 text-[#123B5D]">Total (All Branches)</td>
                  <td className="py-3 px-4 text-center font-mono text-sm">{totalBills}</td>
                  <td className="py-3 px-4 text-right font-mono text-sm text-[#123B5D]">
                    ₹{totalSales.toLocaleString('en-IN')}
                  </td>
                  <td className="py-3 px-4 text-center font-mono text-sm text-[#123B5D]">
                    {totalItemsSold} items
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Transaction Feed */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5">
        <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
          <div>
            <h3 className="font-bold text-[#123B5D] text-sm">Detailed Transaction History</h3>
            <p className="text-xs text-slate-500">Every customer invoice generated on this date</p>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            {filteredInvoices.length} invoices matching
          </span>
        </div>

        <div className="space-y-2">
          {filteredInvoices.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs bg-slate-50 rounded-lg border border-dashed border-slate-200">
              No transactions found for this date or branch filter.
            </div>
          ) : (
            filteredInvoices.map((inv) => (
              <div
                key={inv.id}
                className="p-3 bg-[#F7FAFC] hover:bg-slate-100/80 rounded-lg border border-slate-200 flex items-center justify-between text-xs transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#eef8f8] text-[#159A9C] flex items-center justify-center font-mono font-bold text-xs shrink-0 border border-[#159A9C]/20">
                    #{inv.billNo}
                  </div>
                  <div>
                    <div className="font-semibold text-slate-900 flex items-center gap-2">
                      <span>{inv.branchName}</span>
                      <span className="text-slate-400 font-normal">· Cashier: {inv.staffName}</span>
                    </div>
                    <div className="text-[11px] text-slate-500">
                      Patient: {inv.customerName || 'Walk-in'} · {inv.dateTime}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="font-mono font-bold text-[#123B5D]">
                      ₹{inv.grandTotal.toFixed(2)}
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono">
                      {inv.totalItems} items · {inv.paymentMethod}
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedInvoice(inv)}
                    className="px-2.5 py-1 bg-white border border-slate-300 hover:bg-[#eef8f8] hover:text-[#159A9C] text-slate-700 rounded font-semibold text-[11px] transition-colors shadow-2xs cursor-pointer"
                  >
                    Slip
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

