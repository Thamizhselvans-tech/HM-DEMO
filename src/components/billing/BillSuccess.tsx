import React from 'react';
import {
  CheckCircle2,
  Printer,
  Plus,
  ArrowLeft,
  Download,
  Building2,
  Share2,
  Package,
  AlertTriangle,
  FileText,
  ShieldCheck,
} from 'lucide-react';
import { Invoice } from '../../types';
import { useApp } from '../../context/AppContext';

interface Props {
  invoice: Invoice;
  onCreateAnother: () => void;
  onBackToDashboard: () => void;
}

export const BillSuccess: React.FC<Props> = ({
  invoice,
  onCreateAnother,
  onBackToDashboard,
}) => {
  const { getProductStockAtBranch, products, settings, currency } = useApp();

  const handlePrint = () => {
    window.print();
  };

  const curr = currency || '₹';

  const handleDownload = () => {
    const orgName = (settings?.hospitalName || 'HEALTHCARE MEDICAL STORE').toUpperCase();
    const tagline = (settings?.tagline || 'MULTI-BRANCH CLINICAL OPERATIONS & PHARMACY SYSTEM').toUpperCase();
    const phone = settings?.phone || '+91 98765 45210';
    const footerMsg = settings?.receiptFooter || 'Thank You! Visit Again';

    const lines = [
      `================================================`,
      `           ${orgName.slice(0, 44).padStart(Math.floor((44 - orgName.slice(0, 44).length) / 2) + orgName.slice(0, 44).length)}`,
      `           ${tagline.slice(0, 44).padStart(Math.floor((44 - tagline.slice(0, 44).length) / 2) + tagline.slice(0, 44).length)}`,
      `================================================`,
      `Branch: ${invoice.branchName}`,
      `Invoice No: #${invoice.billNo}`,
      `Date & Time: ${invoice.dateTime}`,
      `Attending Cashier: ${invoice.staffName}`,
      `Patient Name: ${invoice.customerName || 'Walk-in'}`,
      `Patient Phone: ${invoice.customerPhone || 'N/A'}`,
      `Prescriber: ${invoice.doctorName || 'General OPD'}`,
      `Central Phone: ${phone}`,
      `------------------------------------------------`,
      `Item                  Rate      Qty     Amount  `,
      `------------------------------------------------`,
      ...invoice.items.map(
        (i) =>
          `${i.productName.padEnd(20).slice(0, 20)}  ${curr} ${i.rate.toFixed(2).padStart(6)}  ${i.quantity.toString().padStart(4)}  ${curr} ${i.amount.toFixed(2).padStart(8)}`
      ),
      `------------------------------------------------`,
      `Total Medicines: ${invoice.items.length}`,
      `Total Dosage Units: ${invoice.totalItems}`,
      `Payment Mode: ${invoice.paymentMethod}`,
      `GRAND TOTAL: ${curr} ${invoice.grandTotal.toFixed(2)}`,
      `------------------------------------------------`,
      `   * ${settings?.autoDeductStock !== false ? 'STOCK DEDUCTED AUTOMATICALLY FROM SHELF' : 'INVENTORY PRESERVED (DEDUCTION PAUSED)'} *  `,
      `             ${footerMsg}             `,
      `================================================`,
    ].join('\n');

    const blob = new Blob([lines], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Invoice_${invoice.billNo}_${invoice.branchName.replace(/\s+/g, '_')}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Success Notification Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-md p-6 text-center no-print space-y-4">
        <div className="w-16 h-16 bg-[#eef8f8] text-[#2E8B70] rounded-full flex items-center justify-center mx-auto shadow-inner border border-[#2E8B70]/20">
          <CheckCircle2 className="w-10 h-10 animate-in zoom-in duration-300" />
        </div>

        <div>
          {settings?.autoDeductStock !== false ? (
            <span className="text-[10px] uppercase font-bold tracking-wider text-[#2E8B70] bg-[#eef8f8] px-2.5 py-0.5 rounded-full border border-[#2E8B70]/30">
              Stock Deducted Automatically
            </span>
          ) : (
            <span className="text-[10px] uppercase font-bold tracking-wider text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-300">
              Stock Deduction Paused (By Settings)
            </span>
          )}
          <h2 className="text-2xl font-bold text-[#123B5D] tracking-tight mt-1.5">
            Bill Generated Successfully!
          </h2>
          <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
            Invoice <strong className="font-mono text-[#159A9C]">#{invoice.billNo}</strong> has been created.{' '}
            {settings?.autoDeductStock !== false ? (
              <>
                Branch inventory at <strong className="text-slate-800">{invoice.branchName}</strong> has been deducted in real time.
              </>
            ) : (
              <>
                Branch inventory at <strong className="text-slate-800">{invoice.branchName}</strong> was kept intact (real-time deduction disabled).
              </>
            )}
          </p>
        </div>

        {/* Real-Time Stock Deduction Audit Card */}
        <div className="bg-[#F7FAFC] border border-slate-200 rounded-xl p-3.5 text-left space-y-2">
          <div className="flex items-center justify-between text-[11px] font-bold text-slate-700 pb-1 border-b border-slate-200">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-[#159A9C]" />
              <span>Inventory Deduction Audit ({invoice.branchName})</span>
            </span>
            <span className="text-slate-400 font-normal">Real-Time Sync</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            {invoice.items.map((item) => {
              const currentRem = getProductStockAtBranch(invoice.branchId, item.productId);
              const prod = products.find((p) => p.id === item.productId);
              const isLow = prod && currentRem <= prod.threshold;

              return (
                <div
                  key={item.productId}
                  className="bg-white p-2.5 rounded-lg border border-slate-200 flex items-center justify-between"
                >
                  <div className="truncate pr-2">
                    <div className="font-bold text-slate-800 truncate">{item.productName}</div>
                    <div className="text-[10px] text-[#D95C5C] font-mono">
                      -{item.quantity} unit{item.quantity > 1 ? 's' : ''} deducted
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-[11px] font-mono font-bold text-slate-900">
                      {currentRem} left
                    </div>
                    {isLow ? (
                      <span className="text-[9px] font-bold text-[#D99A24] bg-[#fdfaf2] px-1 py-0.2 rounded border border-[#D99A24]/30">
                        Low Stock
                      </span>
                    ) : (
                      <span className="text-[9px] text-[#2E8B70] font-medium">
                        Normal
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={handlePrint}
            className="px-5 py-2.5 bg-[#159A9C] hover:bg-[#0f7a7c] text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center gap-2"
          >
            <Printer className="w-4 h-4" />
            <span>Print Invoice</span>
          </button>

          <button
            onClick={handleDownload}
            className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5"
          >
            <Download className="w-4 h-4" />
            <span>Download Slip</span>
          </button>

          <button
            onClick={onCreateAnother}
            className="px-4 py-2.5 bg-[#eef8f8] hover:bg-[#dff3f3] text-[#159A9C] border border-[#159A9C]/30 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>+ Create New Bill</span>
          </button>

          <button
            onClick={onBackToDashboard}
            className="px-4 py-2.5 text-slate-500 hover:text-slate-800 text-xs font-medium"
          >
            Back to Dashboard
          </button>
        </div>
      </div>

      {/* Customer Invoice Card (Print-Ready) */}
      <div
        className="bg-white rounded-2xl border border-slate-200 shadow-lg overflow-hidden p-6 sm:p-8 text-xs text-slate-800"
        id="printable-customer-invoice"
      >
        {/* Pharmacy Store Header */}
        <div className="text-center pb-4 border-b-2 border-slate-200">
          <div className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-[#123B5D] text-white font-black text-lg mb-1">
            +
          </div>
          <h1 className="text-base font-extrabold text-[#123B5D] tracking-tight uppercase">
            {settings?.hospitalName || 'HealthCare Medical Store'}
          </h1>
          {settings?.tagline && (
            <div className="text-[11px] text-slate-500 font-medium">
              {settings.tagline}
            </div>
          )}
          <div className="text-xs font-bold text-[#159A9C] mt-0.5">
            {invoice.branchName}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            Hospital Operations · Phone: {settings?.phone || '+91 98765 45210'}
          </div>
          <div className="text-[10px] text-slate-400 font-mono mt-0.5">
            DL No: DL-2026-HOSP-01 · GSTIN: 33AAAAA0000A1Z5
          </div>
        </div>

        {/* Invoice Meta Grid */}
        <div className="grid grid-cols-2 gap-4 py-4 border-b border-slate-200 text-xs">
          <div>
            <div className="text-slate-500">Invoice Number:</div>
            <div className="font-mono font-bold text-[#123B5D] text-sm">#{invoice.billNo}</div>
            <div className="text-slate-500 mt-1">Date & Time:</div>
            <div className="font-medium text-slate-800">{invoice.dateTime}</div>
          </div>

          <div className="text-right">
            <div className="text-slate-500">Patient Name:</div>
            <div className="font-bold text-[#123B5D]">
              {invoice.customerName || 'Walk-in Outpatient'}
            </div>
            <div className="text-slate-500 mt-1">Phone / Prescriber:</div>
            <div className="font-medium text-slate-700">
              {invoice.customerPhone || 'N/A'} · {invoice.doctorName || 'General OPD'}
            </div>
          </div>
        </div>

        {/* Items Table */}
        <div className="py-4">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b-2 border-slate-300 text-slate-700 uppercase font-bold text-[10px]">
                <th className="py-2">Product</th>
                <th className="py-2 text-right">Rate</th>
                <th className="py-2 text-center">Qty</th>
                <th className="py-2 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              {invoice.items.map((item, idx) => (
                <tr key={idx}>
                  <td className="py-2.5 font-sans font-medium text-slate-900">
                    {item.productName}
                  </td>
                  <td className="py-2.5 text-right text-slate-600">
                    {curr}{item.rate.toFixed(2)}
                  </td>
                  <td className="py-2.5 text-center font-bold text-slate-800">
                    {item.quantity}
                  </td>
                  <td className="py-2.5 text-right font-bold text-[#123B5D]">
                    {curr}{item.amount.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals & Grand Total */}
        <div className="pt-3 border-t-2 border-slate-300 space-y-1.5">
          <div className="flex justify-between text-slate-600 text-xs">
            <span>Total Dosage Units:</span>
            <span className="font-mono font-bold text-slate-800">{invoice.totalItems} units</span>
          </div>
          <div className="flex justify-between text-slate-600 text-xs">
            <span>Payment Mode:</span>
            <span className="font-semibold text-slate-800 bg-slate-100 px-2 py-0.5 rounded">
              {invoice.paymentMethod}
            </span>
          </div>
          <div className="flex justify-between items-center text-sm font-bold text-[#123B5D] pt-2 border-t border-slate-200">
            <span className="text-base uppercase">Grand Total:</span>
            <span className="text-xl text-[#123B5D] font-mono font-black">
              {curr}{invoice.grandTotal.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Footer Note */}
        <div className="mt-6 pt-4 border-t border-slate-200 text-center text-slate-500 space-y-1">
          <p className="font-bold text-slate-800 text-xs">
            {settings?.receiptFooter || 'Thank You! Get Well Soon'}
          </p>
          <p className="text-[10px] text-slate-400">
            Store medicines below 25°C in a dry place. Keep out of reach of children.
          </p>
          <div className="text-[9px] text-slate-400 font-mono pt-1">
            Cashier Terminal: {invoice.staffName} · System Ref: {invoice.id}
          </div>
        </div>
      </div>
    </div>
  );
};
