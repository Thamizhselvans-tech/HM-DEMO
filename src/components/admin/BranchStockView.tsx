import React, { useState, useEffect } from 'react';
import {
  Boxes,
  Building2,
  Search,
  Plus,
  AlertTriangle,
  X,
  Trash2,
  Package,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const BranchStockView: React.FC = () => {
  const {
    branches,
    getStockForBranch,
    updateBranchStock,
    removeProductFromBranch,
    setCurrentAdminTab,
    selectedStockBranchId,
    setSelectedStockBranchId,
  } = useApp();

  const [selectedBranchId, setSelectedBranchId] = useState(
    selectedStockBranchId || branches[0]?.id || ''
  );

  useEffect(() => {
    if (selectedStockBranchId) {
      setSelectedBranchId(selectedStockBranchId);
    }
  }, [selectedStockBranchId]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Low' | 'Normal'>('All');

  // Quick Restock Modal state
  const [restockModalItem, setRestockModalItem] = useState<{
    productId: string;
    productName: string;
    currentStock: number;
    threshold: number;
  } | null>(null);
  const [quickAddQty, setQuickAddQty] = useState<number>(50);

  // Delete from Branch Confirmation Modal state
  const [deleteConfirmItem, setDeleteConfirmItem] = useState<{
    productId: string;
    productName: string;
  } | null>(null);

  const stockItems = getStockForBranch(selectedBranchId);
  const selectedBranch = branches.find((b) => b.id === selectedBranchId);

  const filteredItems = stockItems.filter((item) => {
    const matchSearch =
      searchTerm.trim() === '' ||
      item.product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.product.category.toLowerCase().includes(searchTerm.toLowerCase());

    const matchStatus =
      statusFilter === 'All' || item.status === statusFilter;

    return matchSearch && matchStatus;
  });

  const lowCount = stockItems.filter((i) => i.status === 'Low').length;

  const handleQuickRestockSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!restockModalItem || quickAddQty <= 0) return;
    updateBranchStock(selectedBranchId, restockModalItem.productId, Number(quickAddQty));
    setRestockModalItem(null);
  };

  const handleConfirmDeleteFromBranch = () => {
    if (!deleteConfirmItem) return;
    removeProductFromBranch(selectedBranchId, deleteConfirmItem.productId);
    setDeleteConfirmItem(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200">
        <div>
          <h2 className="text-xl font-bold text-[#123B5D] tracking-tight flex items-center gap-2">
            <Boxes className="w-5 h-5 text-[#159A9C]" />
            <span>Branch Stock View</span>
          </h2>
          <p className="text-xs text-slate-500">
            Real-time branch inventory levels, threshold compliance, and stock status
          </p>
        </div>
        <button
          onClick={() => setCurrentAdminTab('stock-update')}
          className="px-3.5 py-1.5 bg-[#159A9C] hover:bg-[#0f7a7c] text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add / Update Stock</span>
        </button>
      </div>

      {/* Simplified Controls Bar: Branch Selector + Search + Status Filter Tabs */}
      <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200/90 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Branch Selector Dropdown */}
        <div className="flex items-center gap-2.5 w-full md:w-auto">
          <label className="text-xs font-bold text-slate-700 whitespace-nowrap">
            Select Branch:
          </label>
          <div className="relative w-full md:w-64">
            <select
              value={selectedBranchId}
              onChange={(e) => setSelectedBranchId(e.target.value)}
              className="w-full px-3 py-2 text-xs font-semibold rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#159A9C] focus:border-[#159A9C] bg-[#F7FAFC] cursor-pointer"
            >
              {branches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Search */}
        <div className="relative w-full md:w-72">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search className="w-3.5 h-3.5" />
          </div>
          <input
            type="text"
            placeholder="Search medicine at this branch..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#159A9C] focus:border-[#159A9C]"
          />
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg text-xs self-stretch md:self-auto justify-center">
          <button
            onClick={() => setStatusFilter('All')}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors cursor-pointer ${
              statusFilter === 'All'
                ? 'bg-white text-[#123B5D] shadow-xs font-semibold'
                : 'text-slate-600 hover:text-[#123B5D]'
            }`}
          >
            All ({stockItems.length})
          </button>
          <button
            onClick={() => setStatusFilter('Low')}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors cursor-pointer ${
              statusFilter === 'Low'
                ? 'bg-[#faecec] text-[#D95C5C] shadow-xs font-bold border border-[#D95C5C]/30'
                : 'text-slate-600 hover:text-[#D95C5C]'
            }`}
          >
            Low Stock ({lowCount})
          </button>
          <button
            onClick={() => setStatusFilter('Normal')}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors cursor-pointer ${
              statusFilter === 'Normal'
                ? 'bg-white text-[#2E8B70] shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Normal
          </button>
        </div>
      </div>

      {/* Stock Table matching Screen 9 */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="p-4 bg-[#F7FAFC] border-b border-slate-200 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-[#159A9C]" />
            <span className="font-bold text-[#123B5D]">{selectedBranch?.name}</span>
            <span className="text-slate-500">· {selectedBranch?.city}</span>
          </div>
          {lowCount > 0 && (
            <div className="flex items-center gap-1.5 text-[#D95C5C] font-bold bg-[#faecec] px-2.5 py-1 rounded-md border border-[#D95C5C]/30 text-xs">
              <AlertTriangle className="w-3.5 h-3.5 text-[#D95C5C]" />
              <span>{lowCount} medicines below minimum threshold!</span>
            </div>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[11px]">
                <th className="py-3.5 px-4 font-semibold">Product</th>
                <th className="py-3.5 px-4 font-semibold">Category</th>
                <th className="py-3.5 px-4 font-semibold text-right">Selling Rate</th>
                <th className="py-3.5 px-4 font-semibold text-center">Alert Threshold</th>
                <th className="py-3.5 px-4 font-semibold text-center">Current Stock</th>
                <th className="py-3.5 px-4 font-semibold text-center">Status</th>
                <th className="py-3.5 px-4 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredItems.length > 0 ? (
                filteredItems.map((item) => (
                  <tr
                    key={item.product.id}
                    className={`hover:bg-slate-50/80 transition-colors ${
                      item.status === 'Low' ? 'bg-[#faecec]/30' : ''
                    }`}
                  >
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-900">{item.product.name}</div>
                      <div className="text-[11px] text-slate-400 font-mono">
                        {item.product.unit || 'unit'}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[11px]">
                        {item.product.category}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-[#123B5D]">
                      ₹{item.product.rate.toFixed(2)}
                    </td>
                    <td className="py-3.5 px-4 text-center font-mono text-slate-600">
                      ≤ {item.threshold}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`font-mono font-bold text-sm ${
                          item.status === 'Low' ? 'text-[#D95C5C]' : 'text-slate-800'
                        }`}
                      >
                        {item.currentStock}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      {item.status === 'Low' ? (
                        <span className="inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-0.5 rounded-md bg-[#faecec] text-[#D95C5C] border border-[#D95C5C]/30">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#D95C5C]"></span>
                          <span>Low Stock</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-0.5 rounded-md bg-[#edf7f4] text-[#2E8B70] border border-[#2E8B70]/30">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#2E8B70]"></span>
                          <span>Normal</span>
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() =>
                            setRestockModalItem({
                              productId: item.product.id,
                              productName: item.product.name,
                              currentStock: item.currentStock,
                              threshold: item.threshold,
                            })
                          }
                          className="px-2.5 py-1.5 text-xs font-semibold rounded-md bg-[#eef8f8] text-[#159A9C] hover:bg-[#dff3f3] border border-[#159A9C]/20 transition-colors cursor-pointer"
                        >
                          + Add Stock
                        </button>
                        <button
                          onClick={() =>
                            setDeleteConfirmItem({
                              productId: item.product.id,
                              productName: item.product.name,
                            })
                          }
                          className="p-1.5 text-slate-400 hover:text-[#D95C5C] hover:bg-rose-50 rounded-md transition-colors border border-transparent hover:border-rose-200 cursor-pointer"
                          title={`Remove ${item.product.name} from ${selectedBranch?.name}`}
                          aria-label={`Remove ${item.product.name} from ${selectedBranch?.name}`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : stockItems.length === 0 ? (
                /* Empty state when branch has no medicines assigned */
                <tr>
                  <td colSpan={7} className="py-12 text-center">
                    <div className="flex flex-col items-center justify-center text-slate-400">
                      <Package className="w-9 h-9 stroke-[1.5] text-slate-300 mb-2" />
                      <p className="text-sm font-semibold text-slate-700">
                        No medicines assigned to this branch.
                      </p>
                      <p className="text-xs text-slate-400 mt-1 max-w-sm">
                        Use the Stock Management page to allocate or restock medicines for {selectedBranch?.name}.
                      </p>
                      <button
                        type="button"
                        onClick={() => setCurrentAdminTab('stock-update')}
                        className="mt-4 px-4 py-2 bg-[#159A9C] hover:bg-[#0f7a7c] text-white font-semibold rounded-lg text-xs flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>+ Add / Update Stock</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                /* Empty state when search or status filter has no matches */
                <tr>
                  <td colSpan={7} className="py-10 text-center">
                    <div className="flex flex-col items-center justify-center text-slate-400">
                      <Search className="w-7 h-7 stroke-[1.5] text-slate-300 mb-2" />
                      <p className="text-sm font-semibold text-slate-600">
                        No medicines match your filter
                      </p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Try resetting your search query or status filter.
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          setSearchTerm('');
                          setStatusFilter('All');
                        }}
                        className="mt-3 px-3 py-1.5 text-xs font-semibold text-[#159A9C] bg-[#eef8f8] hover:bg-[#dff3f3] rounded-lg transition-colors border border-[#159A9C]/20 cursor-pointer"
                      >
                        Reset filters
                      </button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete / Remove Medicine from Branch Confirmation Modal */}
      {deleteConfirmItem && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-[#0c2942]/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
            <div className="px-5 py-4 bg-[#123B5D] text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                <h3 className="font-bold text-xs sm:text-sm">
                  Remove Medicine from Branch?
                </h3>
              </div>
              <button
                onClick={() => setDeleteConfirmItem(null)}
                className="text-slate-300 hover:text-white p-1 rounded transition-colors cursor-pointer"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <p className="text-slate-600">
                Are you sure you want to remove:
              </p>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1">
                <div className="font-bold text-sm text-[#123B5D]">
                  {deleteConfirmItem.productName}
                </div>
                <div className="text-[11px] text-slate-500">
                  from: <span className="font-semibold text-slate-700">{selectedBranch?.name}</span>
                </div>
              </div>

              <p className="text-slate-500 text-[11px] leading-relaxed">
                This will remove this medicine from this branch&apos;s stock list. Historical invoices and other branches will remain completely intact.
              </p>

              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setDeleteConfirmItem(null)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 font-semibold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDeleteFromBranch}
                  className="px-4 py-2 bg-[#D95C5C] hover:bg-rose-700 text-white rounded-lg font-semibold shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Remove</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Restock Dialog */}
      {restockModalItem && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-[#0c2942]/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full border border-slate-200 overflow-hidden">
            <div className="px-5 py-3.5 bg-[#123B5D] text-white flex items-center justify-between">
              <h3 className="font-bold text-xs">
                Quick Restock: {restockModalItem.productName}
              </h3>
              <button
                onClick={() => setRestockModalItem(null)}
                className="text-slate-300 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleQuickRestockSubmit} className="p-5 space-y-4 text-xs">
              <div className="p-3 bg-[#F7FAFC] rounded-lg border border-slate-200 space-y-1">
                <div className="flex justify-between text-slate-600">
                  <span>Branch:</span>
                  <span className="font-semibold text-slate-800">{selectedBranch?.name}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Current Stock:</span>
                  <span className="font-bold font-mono text-[#123B5D]">
                    {restockModalItem.currentStock} units
                  </span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Alert Threshold:</span>
                  <span className="font-mono text-slate-600">
                    ≤ {restockModalItem.threshold} units
                  </span>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Quantity to Add *
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={quickAddQty}
                  onChange={(e) => setQuickAddQty(Math.max(1, Number(e.target.value)))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono font-bold text-[#159A9C] focus:ring-2 focus:ring-[#159A9C] focus:border-[#159A9C] focus:outline-none"
                />
              </div>

              <div className="p-2.5 bg-[#edf7f4] rounded-lg border border-[#2E8B70]/20 flex justify-between items-center text-xs">
                <span className="text-slate-600">Projected New Stock:</span>
                <span className="font-mono font-bold text-[#2E8B70] text-sm">
                  {restockModalItem.currentStock + quickAddQty} units
                </span>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setRestockModalItem(null)}
                  className="px-3 py-1.5 border border-slate-300 text-slate-600 rounded-lg hover:bg-slate-50 font-medium transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#159A9C] hover:bg-[#0f7a7c] text-white rounded-lg font-semibold shadow-xs transition-colors cursor-pointer"
                >
                  Confirm Restock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
