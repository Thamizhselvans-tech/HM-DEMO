import React, { useState } from 'react';
import {
  AlertTriangle,
  Building2,
  Package,
  Plus,
  CheckCircle2,
  RefreshCw,
  X,
  Boxes,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { LowStockAlert } from '../../types';

export const LowStockAlerts: React.FC = () => {
  const { getLowStockAlerts, updateBranchStock, restockMultipleItems, branches } = useApp();
  const alerts = getLowStockAlerts();

  const [selectedBranchFilter, setSelectedBranchFilter] = useState('All');
  const [activeAlert, setActiveAlert] = useState<LowStockAlert | null>(null);
  const [restockAmount, setRestockAmount] = useState<number>(100);

  const filteredAlerts = alerts.filter(
    (a) => selectedBranchFilter === 'All' || a.branchId === selectedBranchFilter
  );

  const handleRestockSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeAlert || restockAmount <= 0) return;
    updateBranchStock(activeAlert.branchId, activeAlert.productId, Number(restockAmount));
    setActiveAlert(null);
  };

  const handleRestockAll = () => {
    const itemsToRestock = filteredAlerts.map((alert) => ({
      branchId: alert.branchId,
      productId: alert.productId,
      quantity: Math.max(25, alert.threshold * 2),
    }));
    if (itemsToRestock.length > 0) {
      restockMultipleItems(itemsToRestock);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200">
        <div>
          <h2 className="text-xl font-bold text-[#123B5D] tracking-tight flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-[#D95C5C]" />
            <span>Low Stock Alerts</span>
          </h2>
          <p className="text-xs text-slate-500">
            Automated alerts when localized branch inventory drops below defined safe minimum thresholds
          </p>
        </div>

        {alerts.length > 0 && (
          <button
            onClick={handleRestockAll}
            className="px-3.5 py-1.5 bg-[#D95C5C] hover:bg-[#c24b4b] text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs self-start sm:self-auto"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Restock All Low Items</span>
          </button>
        )}
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-3 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-2 text-xs">
          <span className="font-semibold text-slate-700">Filter Branch:</span>
          <select
            value={selectedBranchFilter}
            onChange={(e) => setSelectedBranchFilter(e.target.value)}
            className="px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs bg-[#F7FAFC] focus:ring-2 focus:ring-[#159A9C] focus:border-[#159A9C]"
          >
            <option value="All">All Branches ({alerts.length})</option>
            {branches.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
        </div>

        <div className="text-xs text-slate-500">
          Showing <strong className="text-[#D95C5C] font-mono">{filteredAlerts.length}</strong> critical stock alert(s)
        </div>
      </div>

      {/* Low Stock Alert Cards matching Screen 10 */}
      {filteredAlerts.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center shadow-xs">
          <CheckCircle2 className="w-12 h-12 text-[#2E8B70] mx-auto mb-3" />
          <h3 className="text-base font-bold text-[#123B5D]">All Stock Levels Optimal</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
            No medicine items are currently below their branch threshold limit. When stock depletes from billing, alerts will automatically appear here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
          {filteredAlerts.map((alert) => (
            <div
              key={alert.id}
              className="bg-white rounded-xl border border-[#D95C5C]/30 shadow-xs hover:shadow-md transition-shadow p-4 flex flex-col sm:flex-row items-start sm:center justify-between gap-4"
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-[#faecec] border border-[#D95C5C]/25 text-[#D95C5C] flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-[#123B5D] text-sm">{alert.productName}</h4>
                    <span className="text-[10px] font-bold text-[#D95C5C] bg-[#faecec] px-2 py-0.5 rounded-full uppercase tracking-wider border border-[#D95C5C]/20">
                      Critical
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                    <Building2 className="w-3.5 h-3.5 text-[#159A9C]" />
                    <span>{alert.branchName}</span>
                  </div>
                  <div className="mt-2 flex items-center gap-2 text-xs">
                    <span className="text-[#D95C5C] font-mono font-bold bg-[#faecec] px-2 py-0.5 rounded border border-[#D95C5C]/25">
                      {alert.currentStock} remaining
                    </span>
                    <span className="text-slate-400">·</span>
                    <span className="text-slate-500">
                      Threshold: <strong className="font-mono text-slate-700">{alert.threshold}</strong>
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => {
                  setActiveAlert(alert);
                  setRestockAmount(100);
                }}
                className="w-full sm:w-auto px-4 py-2 bg-[#eef8f8] hover:bg-[#dff3f3] text-[#159A9C] border border-[#159A9C]/25 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors self-stretch sm:self-auto shrink-0 shadow-2xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Stock</span>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Restock Dialog Modal */}
      {activeAlert && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-[#0c2942]/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full border border-slate-200 overflow-hidden">
            <div className="px-5 py-4 bg-[#123B5D] text-white flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm">Add Stock to Branch</h3>
                <p className="text-[11px] text-slate-300">{activeAlert.branchName}</p>
              </div>
              <button
                onClick={() => setActiveAlert(null)}
                className="text-slate-300 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleRestockSubmit} className="p-5 space-y-4 text-xs">
              <div className="p-3 bg-[#faecec]/60 rounded-lg border border-[#D95C5C]/20 space-y-1.5">
                <div className="flex justify-between text-slate-700">
                  <span>Product:</span>
                  <span className="font-bold text-[#123B5D]">{activeAlert.productName}</span>
                </div>
                <div className="flex justify-between text-slate-700">
                  <span>Current Branch Stock:</span>
                  <span className="font-mono font-bold text-[#D95C5C]">
                    {activeAlert.currentStock} units
                  </span>
                </div>
                <div className="flex justify-between text-slate-700">
                  <span>Minimum Threshold:</span>
                  <span className="font-mono font-semibold text-slate-700">
                    {activeAlert.threshold} units
                  </span>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Quantity to Add
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={restockAmount}
                  onChange={(e) => setRestockAmount(parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono focus:ring-2 focus:ring-[#159A9C] focus:border-[#159A9C] focus:outline-none"
                />
                <div className="flex gap-1.5 mt-2">
                  {[50, 100, 200, 500].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setRestockAmount(preset)}
                      className="px-2 py-0.5 bg-slate-100 hover:bg-[#eef8f8] hover:text-[#159A9C] rounded text-slate-700 text-[11px] font-mono transition-colors"
                    >
                      +{preset}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-2.5 bg-[#edf7f4] rounded-lg border border-[#2E8B70]/30 flex justify-between text-xs text-[#2E8B70]">
                <span>Stock After Dispatch:</span>
                <span className="font-bold font-mono">
                  {activeAlert.currentStock + (Number(restockAmount) || 0)} units
                </span>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setActiveAlert(null)}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#159A9C] hover:bg-[#0f7a7c] text-white rounded-lg font-semibold shadow-xs transition-colors"
                >
                  Update & Clear Alert
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
