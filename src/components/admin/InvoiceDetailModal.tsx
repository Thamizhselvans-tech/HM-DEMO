import React from 'react';
import {
  X,
  Printer,
  Download,
  Building2,
  Calendar,
  User,
  Phone,
  CheckCircle,
  FileText,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Invoice } from '../../types';

interface Props {
  invoice: Invoice;
  onClose: () => void;
}

export const InvoiceDetailModal: React.FC<Props> = ({ invoice, onClose }) => {
  const { settings, currency } = useApp();

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    // Generate text/csv data slip download
    const orgName = (settings?.hospitalName || 'HealthCare Medical Store').toUpperCase();
    const tagline = settings?.tagline || 'Multi-Branch Clinical Operations & Pharmacy System';
    const phone = settings?.phone || '+91 98765 45210';
    const footerMsg = settings?.receiptFooter || 'Thank You! Visit Again';
    const curr = currency || '₹';

    const lines = [
      orgName,
      tagline,
      `Branch: ${invoice.branchName}`,
      `Bill No: #${invoice.billNo}`,
      `Date & Time: ${invoice.dateTime}`,
      `Staff: ${invoice.staffName}`,
      `Customer: ${invoice.customerName} (${invoice.customerPhone})`,
      `Central Contact Phone: ${phone}`,
      `----------------------------------------`,
      `Item\tRate\tQty\tAmount`,
      ...invoice.items.map((i) => `${i.productName}\t${curr}${i.rate.toFixed(2)}\t${i.quantity}\t${curr}${i.amount.toFixed(2)}`),
      `----------------------------------------`,
      `Total Items: ${invoice.totalItems}`,
      `Grand Total: ${curr} ${invoice.grandTotal.toFixed(2)}`,
      `Payment Method: ${invoice.paymentMethod}`,
      footerMsg,
    ].join('\n');

    const blob = new Blob([lines], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Invoice_Bill_${invoice.billNo}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#0c2942]/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-xl w-full border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95">
        {/* Header (No print) */}
        <div className="px-6 py-4 bg-[#123B5D] text-white flex items-center justify-between no-print">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-[#159A9C]" />
            <h3 className="font-bold text-white text-sm">
              Central Invoice Details — #{invoice.billNo}
            </h3>
          </div>
          <button onClick={onClose} className="text-slate-300 hover:text-white p-1">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Printable Invoice Container */}
        <div className="p-6 text-xs text-slate-800" id="printable-invoice">
          {/* Medical Center Header */}
          <div className="text-center pb-4 border-b border-slate-200">
            <div className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-[#123B5D] text-white font-black text-lg mb-1">
              +
            </div>
            <h2 className="text-base font-bold text-[#123B5D] tracking-tight uppercase">
              {settings?.hospitalName || 'HealthCare Medical Store'}
            </h2>
            {settings?.tagline && (
              <div className="text-[11px] text-slate-500 font-medium">
                {settings.tagline}
              </div>
            )}
            <div className="font-semibold text-[#159A9C] text-xs mt-0.5">{invoice.branchName}</div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              123, Main Road · Phone: {settings?.phone || '+91 98765 45210'}
            </div>
            <div className="text-[10px] text-slate-400 font-mono">
              Drug Lic No: DL-TN-2026-4921 · GSTIN: 33AAAAA0000A1Z5
            </div>
          </div>

          {/* Meta Info Grid */}
          <div className="grid grid-cols-2 gap-3 py-3 border-b border-slate-100 text-xs">
            <div>
              <div className="text-slate-500">Bill Number:</div>
              <div className="font-mono font-bold text-[#123B5D] text-sm">#{invoice.billNo}</div>
              <div className="text-slate-500 mt-1">Date & Time:</div>
              <div className="font-medium text-slate-800">{invoice.dateTime}</div>
            </div>
            <div className="text-right">
              <div className="text-slate-500">Billing Counter Staff:</div>
              <div className="font-bold text-slate-900">{invoice.staffName}</div>
              <div className="text-slate-500 mt-1">Patient / Customer:</div>
              <div className="font-medium text-slate-800">
                {invoice.customerName || 'Walk-in'} ({invoice.customerPhone || 'N/A'})
              </div>
            </div>
          </div>

          {/* Items Table matching Screen 12 */}
          <div className="py-3">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-slate-300 text-slate-600 uppercase text-[10px]">
                  <th className="py-1.5 font-bold">Product</th>
                  <th className="py-1.5 text-right font-bold">Rate</th>
                  <th className="py-1.5 text-center font-bold">Qty</th>
                  <th className="py-1.5 text-right font-bold">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                {invoice.items.map((item, idx) => (
                  <tr key={idx} className="py-1">
                    <td className="py-2 font-sans font-medium text-slate-900">
                      {item.productName}
                    </td>
                    <td className="py-2 text-right text-slate-600">
                      {currency}{item.rate.toFixed(2)}
                    </td>
                    <td className="py-2 text-center text-slate-800 font-bold">
                      {item.quantity}
                    </td>
                    <td className="py-2 text-right font-bold text-slate-900">
                      {currency}{item.amount.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals & Grand Total matching Screen 12 */}
          <div className="pt-3 border-t-2 border-slate-300 space-y-1">
            <div className="flex justify-between text-slate-600 text-xs">
              <span>Total Items Dispensed:</span>
              <span className="font-mono font-bold">{invoice.totalItems}</span>
            </div>
            <div className="flex justify-between text-slate-600 text-xs">
              <span>Payment Mode:</span>
              <span className="font-semibold text-slate-800">{invoice.paymentMethod}</span>
            </div>
            <div className="flex justify-between text-sm font-bold text-slate-900 pt-2 border-t border-slate-200">
              <span className="text-base">Grand Total:</span>
              <span className="text-base text-[#123B5D] font-mono">
                {currency}{invoice.grandTotal.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Footer Note */}
          <div className="mt-4 pt-3 border-t border-slate-100 text-center text-[11px] text-slate-500">
            <p className="font-semibold text-slate-700">
              {settings?.receiptFooter || 'Thank You! Visit Again'}
            </p>
            <p className="text-[10px] text-slate-400">
              Medicines sold without valid doctor prescription cannot be returned after 48 hours.
            </p>
          </div>
        </div>

        {/* Modal Actions (No print) */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between no-print">
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors shadow-2xs"
          >
            Close
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownload}
              className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Slip</span>
            </button>
            <button
              onClick={handlePrint}
              className="px-4 py-1.5 bg-[#159A9C] hover:bg-[#0f7a7c] text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Invoice</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
