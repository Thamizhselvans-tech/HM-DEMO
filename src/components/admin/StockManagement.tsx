import React, { useState, useMemo } from 'react';
import {
  Boxes,
  Building2,
  Package,
  Plus,
  Minus,
  ArrowRight,
  CheckCircle,
  AlertTriangle,
  History,
  TrendingUp,
  Search,
  ChevronDown,
  X,
  RotateCcw,
  Layers,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { FormLabel, FieldError, RequiredAsterisk } from '../common/FormComponents';

export const StockManagement: React.FC = () => {
  const {
    branches,
    products,
    customCategories,
    restockMultipleItems,
    getProductStockAtBranch,
    setCurrentAdminTab,
  } = useApp();

  const [selectedBranchId, setSelectedBranchId] = useState(branches[0]?.id || '');
  const [selectedCategory, setSelectedCategory] = useState<string>('Analgesics / Antipyretic');
  const [productSearch, setProductSearch] = useState('');

  // Initial Paracetamol product to match prompt example
  const initialParacetamol =
    products.find((p) => p.name.toLowerCase().includes('paracetamol')) || products[0];

  // Multi-product selection
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>(
    initialParacetamol ? [initialParacetamol.id] : []
  );

  // Unified adjustment per product: number | string (e.g. +100, +50, +20, -10)
  const [adjustments, setAdjustments] = useState<Record<string, string | number>>(
    initialParacetamol ? { [initialParacetamol.id]: 100 } : {}
  );

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Dynamic list of category options (predefined + customCategories + product categories)
  const categoryOptions = useMemo(() => {
    const list: string[] = ['All Categories'];
    const seen = new Set<string>();

    const addCategory = (c?: string) => {
      if (!c) return;
      const clean = c.trim();
      if (!clean || clean.toLowerCase() === 'all' || clean.toLowerCase() === 'all categories') return;
      const lower = clean.toLowerCase();
      if (!seen.has(lower)) {
        seen.add(lower);
        list.push(clean);
      }
    };

    // Predefined standard categories
    [
      'Analgesics / Antipyretic',
      'Antibiotics',
      'Respiratory / Cough',
      'Supplements',
      'Topical Pain Care',
      'Broad Spectrum',
      'Bone & Joint Health',
      'Gastrointestinal',
      'Antihistamine / Allergy',
      'Cardiovascular',
      'Diabetes',
      'Vitamins & Supplements',
      'Electrolytes',
    ].forEach(addCategory);

    // Dynamically created categories from persistent context
    (customCategories || []).forEach(addCategory);

    // Any other categories currently present in products catalog
    products.forEach((p) => addCategory(p.category));

    return list;
  }, [customCategories, products]);

  // Products belonging to the selected category (Requirement 3 & 10)
  const displayedCategoryProducts = useMemo(() => {
    return products.filter((p) => {
      // Category match
      let matchCat = true;
      if (selectedCategory !== 'All Categories') {
        const catA = p.category.toLowerCase().trim();
        const catB = selectedCategory.toLowerCase().trim();
        matchCat =
          catA === catB ||
          (catB.includes('analgesic') && catA.includes('analgesic')) ||
          (catB.includes('respiratory') && catA.includes('respiratory')) ||
          (catB.includes('supplement') && catA.includes('supplement')) ||
          (catB.includes('bone') && catA.includes('bone'));
      }

      // Search match inside category (Requirement 11)
      const matchSearch =
        !productSearch.trim() ||
        p.name.toLowerCase().includes(productSearch.toLowerCase().trim()) ||
        p.category.toLowerCase().includes(productSearch.toLowerCase().trim());

      return matchCat && matchSearch;
    });
  }, [products, selectedCategory, productSearch]);

  // Audit log of adjustments done this session (Requirement 13)
  const [stockHistory, setStockHistory] = useState<
    Array<{
      id: string;
      branchName: string;
      category: string;
      productName: string;
      added: number;
      oldStock: number;
      newStock: number;
      updatedBy: string;
      time: string;
    }>
  >([]);

  const selectedBranch = branches.find((b) => b.id === selectedBranchId);

  const getAdjustment = (productId: string): number => {
    const val = adjustments[productId];
    if (val === '' || val === undefined || val === null) return 0;
    const num = Number(val);
    return isNaN(num) ? 0 : num;
  };

  const handleAdjustmentChange = (productId: string, value: string) => {
    setAdjustments((prev) => ({
      ...prev,
      [productId]: value,
    }));
    setErrorMessage(null);
  };

  const handleIncrement = (productId: string) => {
    const currentAdj = getAdjustment(productId);
    setAdjustments((prev) => ({
      ...prev,
      [productId]: currentAdj + 1,
    }));
    setErrorMessage(null);
  };

  const handleDecrement = (productId: string) => {
    const currentStock = getProductStockAtBranch(selectedBranchId, productId);
    const currentAdj = getAdjustment(productId);
    // Prevent final stock from becoming negative: Current + (Adj - 1) >= 0 => Current + Adj > 0
    if (currentStock + currentAdj <= 0) return;
    setAdjustments((prev) => ({
      ...prev,
      [productId]: currentAdj - 1,
    }));
    setErrorMessage(null);
  };

  const handleToggleProduct = (productId: string) => {
    setSelectedProductIds((prev) => {
      if (prev.includes(productId)) {
        return prev.filter((id) => id !== productId);
      } else {
        // If not already in adjustments, set default +10 or 0
        setAdjustments((adj) => ({
          ...adj,
          [productId]: adj[productId] !== undefined ? adj[productId] : 10,
        }));
        return [...prev, productId];
      }
    });
    setErrorMessage(null);
  };

  const handleSelectAllCategoryProducts = () => {
    const idsInCat = displayedCategoryProducts.map((p) => p.id);
    setSelectedProductIds((prev) => {
      const combined = new Set([...prev, ...idsInCat]);
      return Array.from(combined);
    });
    setAdjustments((adj) => {
      const updated = { ...adj };
      idsInCat.forEach((id) => {
        if (updated[id] === undefined) {
          updated[id] = 10;
        }
      });
      return updated;
    });
    setErrorMessage(null);
  };

  const handleDeselectCategoryProducts = () => {
    const idsInCat = new Set(displayedCategoryProducts.map((p) => p.id));
    setSelectedProductIds((prev) => prev.filter((id) => !idsInCat.has(id)));
    setErrorMessage(null);
  };

  const handleClearSelection = () => {
    setSelectedProductIds([]);
    setAdjustments({});
    setErrorMessage(null);
    setSuccessMessage(null);
  };

  const handleUpdateStock = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!selectedBranchId) {
      setErrorMessage('Please select a hospital branch.');
      return;
    }

    if (selectedProductIds.length === 0) {
      setErrorMessage('At least one product must be selected before updating stock.');
      return;
    }

    // Validation checks: Final stock must never become negative
    for (const pId of selectedProductIds) {
      const prod = products.find((p) => p.id === pId);
      const name = prod?.name || 'Product';
      const curStock = getProductStockAtBranch(selectedBranchId, pId);
      const adjVal = getAdjustment(pId);

      if (curStock + adjVal < 0) {
        setErrorMessage(
          `Final stock cannot be negative for "${name}" (Current: ${curStock}, Adjustment: ${adjVal}). Minimum adjustment is -${curStock}.`
        );
        return;
      }
    }

    // Check if at least one product has an adjustment
    const hasAnyChanges = selectedProductIds.some(
      (pId) => getAdjustment(pId) !== 0
    );
    if (!hasAnyChanges) {
      setErrorMessage('Please adjust the stock (+ or −) for at least one selected product.');
      return;
    }

    // Batch update atomically for the selected branch only
    const itemsToRestock = selectedProductIds
      .filter((pId) => getAdjustment(pId) !== 0)
      .map((pId) => {
        const adjVal = getAdjustment(pId);
        return {
          branchId: selectedBranchId,
          productId: pId,
          quantity: adjVal,
        };
      });

    // Record audit log entries matching Requirement 13
    const dateFormatted = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const newLogs = selectedProductIds
      .filter((pId) => getAdjustment(pId) !== 0)
      .map((pId) => {
        const prod = products.find((p) => p.id === pId);
        const curStock = getProductStockAtBranch(selectedBranchId, pId);
        const adjVal = getAdjustment(pId);
        const newStock = Math.max(0, curStock + adjVal);
        return {
          id: `adj-${Date.now()}-${pId}`,
          branchName: selectedBranch?.name || 'Branch',
          category: prod?.category || selectedCategory,
          productName: prod?.name || 'Product',
          added: adjVal,
          oldStock: curStock,
          newStock,
          updatedBy: 'Admin',
          time: dateFormatted,
        };
      });

    restockMultipleItems(itemsToRestock);

    setStockHistory((prev) => [...newLogs, ...prev]);

    const count = itemsToRestock.length;
    setSuccessMessage(`Stock updated successfully for ${count} product${count === 1 ? '' : 's'} at ${selectedBranch?.name}.`);

    // Reset adjustment fields to 0 for next entry
    setAdjustments({});

    setTimeout(() => {
      setSuccessMessage(null);
    }, 4500);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200">
        <div>
          <h2 className="text-xl font-bold text-[#123B5D] tracking-tight flex items-center gap-2">
            <Boxes className="w-5 h-5 text-[#159A9C]" />
            <span>Add / Update Stock (Admin Only)</span>
          </h2>
          <p className="text-xs text-slate-500">
            Select branch, filter by medicine category, and adjust inventory quantities
          </p>
        </div>

        <button
          onClick={() => setCurrentAdminTab('branch-stock')}
          className="px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-[#123B5D] rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors self-start sm:self-auto shadow-2xs cursor-pointer"
        >
          <span>Branch Stock View</span>
          <ArrowRight className="w-3.5 h-3.5 text-[#159A9C]" />
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Main Stock Update Form */}
        <div className="lg:col-span-8 bg-white rounded-xl border border-slate-200 shadow-xs p-6">
          <div className="flex items-center gap-2 mb-5 pb-3 border-b border-slate-100">
            <div className="w-8 h-8 rounded-lg bg-[#eaf2f8] text-[#123B5D] flex items-center justify-center font-bold">
              <Boxes className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-[#123B5D] text-sm">Update Branch Inventory</h3>
              <p className="text-[11px] text-slate-500">
                Select target branch and medicines to restock or adjust
              </p>
            </div>
          </div>

          <form onSubmit={handleUpdateStock} className="space-y-5 text-xs">
            {/* 1. Select Branch */}
            <div>
              <FormLabel label="Select Branch" required htmlFor="stock-branch-select" />
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Building2 className="w-4 h-4" />
                </div>
                <select
                  id="stock-branch-select"
                  value={selectedBranchId}
                  onChange={(e) => {
                    setSelectedBranchId(e.target.value);
                    setErrorMessage(null);
                  }}
                  className="w-full pl-9 pr-3 py-2.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#159A9C] focus:border-[#159A9C] bg-white cursor-pointer font-semibold text-slate-800"
                >
                  {branches.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name} ({b.city})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* 2. Select Medicine Category (Requirement 2) */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1.5">
                Select Medicine Category
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Layers className="w-4 h-4" />
                </div>
                <select
                  value={selectedCategory}
                  onChange={(e) => {
                    setSelectedCategory(e.target.value);
                    setErrorMessage(null);
                  }}
                  className="w-full pl-9 pr-8 py-2.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#159A9C] focus:border-[#159A9C] bg-white cursor-pointer font-semibold text-slate-800 appearance-none"
                >
                  {categoryOptions.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 pr-2.5 flex items-center pointer-events-none text-slate-400">
                  <ChevronDown className="w-4 h-4" />
                </div>
              </div>
            </div>

            {/* 3. Products in Selected Category (Requirement 3, 4, 11, 12) */}
            <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-200/90 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-200">
                <div>
                  <h4 className="font-bold text-[#123B5D] text-xs uppercase tracking-wider flex items-center gap-1.5">
                    <span>Products in Selected Category</span>
                    <span className="text-[11px] font-normal text-slate-500">
                      ({selectedCategory})
                    </span>
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    Check the medicines you want to adjust for{' '}
                    <strong className="text-slate-600">{selectedBranch?.name}</strong>
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <div className="relative w-44">
                    <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search in category..."
                      value={productSearch}
                      onChange={(e) => setProductSearch(e.target.value)}
                      className="w-full pl-8 pr-2.5 py-1 text-xs rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-1 focus:ring-[#159A9C]"
                    />
                  </div>
                  {displayedCategoryProducts.length > 0 && (
                    <>
                      <button
                        type="button"
                        onClick={handleSelectAllCategoryProducts}
                        className="px-2 py-1 text-[11px] font-semibold text-[#159A9C] hover:bg-[#eef8f8] border border-[#159A9C]/30 rounded-md transition-colors cursor-pointer"
                        title="Select all products in this category"
                      >
                        Select All
                      </button>
                      <button
                        type="button"
                        onClick={handleDeselectCategoryProducts}
                        className="px-2 py-1 text-[11px] font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-200/60 border border-slate-300 rounded-md transition-colors cursor-pointer"
                        title="Deselect all products in this category"
                      >
                        Deselect
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Product Checkboxes List */}
              {displayedCategoryProducts.length === 0 ? (
                <div className="p-6 text-center text-slate-400 text-xs bg-white rounded-lg border border-dashed border-slate-200">
                  <Package className="w-6 h-6 text-slate-300 mx-auto mb-1.5" />
                  <p className="font-semibold text-slate-600">No products found in this category.</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {productSearch
                      ? `No medicines match "${productSearch}" in ${selectedCategory}.`
                      : `No medicines have been assigned to ${selectedCategory} yet.`}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 max-h-64 overflow-y-auto pr-1">
                  {displayedCategoryProducts.map((p) => {
                    const isChecked = selectedProductIds.includes(p.id);
                    const currentStock = getProductStockAtBranch(selectedBranchId, p.id);
                    const isLow = currentStock <= p.threshold;

                    return (
                      <div
                        key={p.id}
                        onClick={() => handleToggleProduct(p.id)}
                        className={`p-3 rounded-xl border transition-all cursor-pointer select-none flex items-start gap-2.5 ${
                          isChecked
                            ? 'bg-[#eef8f8] border-[#159A9C] shadow-xs'
                            : 'bg-white border-slate-200 hover:bg-slate-50/80 hover:border-slate-300'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {}} // handled by parent onClick
                          className="mt-0.5 w-4 h-4 rounded text-[#159A9C] focus:ring-[#159A9C] border-slate-300 cursor-pointer shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-slate-900 text-xs truncate">
                            {p.name}
                          </div>
                          <div className="text-[11px] text-slate-500 font-mono mt-0.5 flex items-center justify-between">
                            <span>
                              Current Stock:{' '}
                              <strong
                                className={isLow ? 'text-[#D95C5C]' : 'text-[#123B5D]'}
                              >
                                {currentStock}
                              </strong>
                            </span>
                            {isLow && (
                              <span className="text-[10px] text-[#D95C5C] font-semibold bg-rose-50 px-1 py-0.2 rounded border border-rose-200">
                                Low
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* 4. Selected Products & Stock Adjustment Table (Requirements 4, 5, 6, 7) */}
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-1 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-[#123B5D] text-xs">
                    Selected Products ({selectedProductIds.length})
                  </h4>
                  <span className="text-[11px] text-slate-400">
                    Use + / − to adjust stock quantity
                  </span>
                </div>
                {selectedProductIds.length > 0 && (
                  <button
                    type="button"
                    onClick={handleClearSelection}
                    className="text-[11px] text-slate-500 hover:text-[#D95C5C] font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                    title="Uncheck all products and reset adjustments"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Clear Selection</span>
                  </button>
                )}
              </div>

              {selectedProductIds.length === 0 ? (
                <div className="p-8 text-center bg-slate-50/70 rounded-xl border border-dashed border-slate-200">
                  <Package className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-xs font-semibold text-slate-600">No products selected</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Select a category above and check medicines to configure stock adjustments.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto rounded-xl border border-slate-200 shadow-2xs">
                  <table className="w-full text-xs text-left">
                    <thead>
                      <tr className="bg-slate-50/90 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[11px]">
                        <th className="py-3 px-3.5 font-semibold">Product</th>
                        <th className="py-3 px-3 font-semibold text-center w-28">Current Stock</th>
                        <th className="py-3 px-3 font-semibold text-center w-48">Adjustment</th>
                        <th className="py-3 px-3.5 font-semibold text-center w-32">Final Stock</th>
                        <th className="py-3 px-2 font-semibold text-center w-10"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {selectedProductIds.map((pId) => {
                        const prod = products.find((p) => p.id === pId);
                        if (!prod) return null;
                        const currentStock = getProductStockAtBranch(
                          selectedBranchId,
                          prod.id
                        );
                        const adjVal = getAdjustment(pId);
                        const finalStock = currentStock + adjVal;
                        const isNegative = finalStock < 0;
                        const cannotDecrement = currentStock + adjVal <= 0;

                        return (
                          <tr
                            key={prod.id}
                            className={`hover:bg-slate-50/80 transition-colors ${
                              isNegative ? 'bg-rose-50/40' : ''
                            }`}
                          >
                            {/* Product Info */}
                            <td className="py-3 px-3.5">
                              <div className="font-semibold text-slate-900">
                                {prod.name}
                              </div>
                              <div className="text-[10px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                                <span className="text-[#159A9C] font-medium">{prod.category}</span>
                                {prod.unit && <span>· {prod.unit}</span>}
                              </div>
                            </td>

                            {/* Current Stock */}
                            <td className="py-3 px-3 text-center font-mono">
                              <span
                                className={`font-bold text-sm ${
                                  currentStock <= prod.threshold
                                    ? 'text-[#D95C5C]'
                                    : 'text-[#123B5D]'
                                }`}
                              >
                                {currentStock}
                              </span>
                              {currentStock <= prod.threshold && (
                                <div className="text-[9px] text-[#D95C5C] font-semibold">
                                  LOW
                                </div>
                              )}
                            </td>

                            {/* + / - Stock Adjustment Control */}
                            <td className="py-3 px-3 text-center">
                              <div className="flex items-center justify-center gap-1.5">
                                {/* Decrement Button */}
                                <button
                                  type="button"
                                  onClick={() => handleDecrement(prod.id)}
                                  disabled={cannotDecrement}
                                  className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-sm transition-all select-none ${
                                    cannotDecrement
                                      ? 'bg-slate-100 text-slate-350 cursor-not-allowed border border-slate-200/60 opacity-50'
                                      : 'bg-white hover:bg-rose-50 text-slate-700 hover:text-[#D95C5C] border border-slate-300 hover:border-rose-300 shadow-2xs active:scale-95 cursor-pointer'
                                  }`}
                                  title={
                                    cannotDecrement
                                      ? 'Final stock cannot be reduced below 0'
                                      : 'Decrease adjustment (−1)'
                                  }
                                >
                                  <Minus className="w-3.5 h-3.5" />
                                </button>

                                {/* Direct Numeric Input */}
                                <div className="relative w-20">
                                  <input
                                    type="number"
                                    value={adjustments[pId] ?? ''}
                                    onChange={(e) =>
                                      handleAdjustmentChange(pId, e.target.value)
                                    }
                                    placeholder="0"
                                    className={`w-full py-1.5 px-2 text-center border rounded-lg font-mono font-bold text-xs bg-white focus:outline-none focus:ring-2 ${
                                      isNegative
                                        ? 'border-[#D95C5C] text-[#D95C5C] focus:ring-[#D95C5C]'
                                        : adjVal > 0
                                        ? 'border-slate-300 text-[#159A9C] focus:ring-[#159A9C] focus:border-[#159A9C]'
                                        : adjVal < 0
                                        ? 'border-slate-300 text-[#D95C5C] focus:ring-[#D95C5C] focus:border-[#D95C5C]'
                                        : 'border-slate-300 text-slate-700 focus:ring-[#159A9C]'
                                    }`}
                                  />
                                </div>

                                {/* Increment Button */}
                                <button
                                  type="button"
                                  onClick={() => handleIncrement(prod.id)}
                                  className="w-7 h-7 rounded-lg bg-white hover:bg-[#eef8f8] text-slate-700 hover:text-[#159A9C] border border-slate-300 hover:border-[#159A9C]/40 shadow-2xs active:scale-95 flex items-center justify-center font-bold text-sm transition-all cursor-pointer select-none"
                                  title="Increase adjustment (+1)"
                                >
                                  <Plus className="w-3.5 h-3.5" />
                                </button>
                              </div>
                              {isNegative && (
                                <div className="text-[9px] text-[#D95C5C] font-semibold mt-1">
                                  Cannot go below 0
                                </div>
                              )}
                            </td>

                            {/* Calculated Final Stock */}
                            <td className="py-3 px-3.5 text-center font-mono">
                              <div
                                className={`font-bold text-sm ${
                                  isNegative
                                    ? 'text-[#D95C5C]'
                                    : finalStock > currentStock
                                    ? 'text-[#2E8B70]'
                                    : finalStock < currentStock
                                    ? 'text-[#D95C5C]'
                                    : 'text-[#123B5D]'
                                }`}
                              >
                                {finalStock}
                              </div>
                              <div className="text-[10px] text-slate-400">
                                {finalStock > currentStock ? (
                                  <span className="text-[#2E8B70]">
                                    +{finalStock - currentStock}
                                  </span>
                                ) : finalStock < currentStock ? (
                                  <span className="text-[#D95C5C]">
                                    {finalStock - currentStock}
                                  </span>
                                ) : (
                                  <span>No change</span>
                                )}
                              </div>
                            </td>

                            {/* Remove Row Button */}
                            <td className="py-3 px-2 text-center">
                              <button
                                type="button"
                                onClick={() => handleToggleProduct(prod.id)}
                                className="p-1 text-slate-400 hover:text-[#D95C5C] hover:bg-rose-50 rounded transition-colors cursor-pointer"
                                title={`Remove ${prod.name} from selection`}
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Validation Error Banner */}
            {errorMessage && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-[#D95C5C] rounded-lg text-xs flex items-center gap-2 animate-in fade-in">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Success Notification Banner */}
            {successMessage && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs flex items-center justify-between animate-in fade-in">
                <div className="flex items-center gap-2 font-medium">
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{successMessage}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setSuccessMessage(null)}
                  className="text-emerald-500 hover:text-emerald-700 p-0.5 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Update Stock Button (Requirement 8) */}
            <button
              type="submit"
              disabled={selectedProductIds.length === 0}
              className={`w-full py-2.5 px-4 text-white rounded-lg font-semibold text-xs shadow-xs transition-colors flex items-center justify-center gap-2 ${
                selectedProductIds.length === 0
                  ? 'bg-slate-300 cursor-not-allowed'
                  : 'bg-[#159A9C] hover:bg-[#0f7a7c] cursor-pointer'
              }`}
            >
              <CheckCircle className="w-4 h-4" />
              <span>
                Update Stock{' '}
                {selectedProductIds.length > 0 &&
                  `(${selectedProductIds.length} ${
                    selectedProductIds.length === 1 ? 'Product' : 'Products'
                  })`}
              </span>
            </button>
          </form>
        </div>

        {/* Right: Restock History & Quick Tips */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5">
            <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-100">
              <History className="w-4 h-4 text-slate-500" />
              <h3 className="font-bold text-[#123B5D] text-xs">Recent Stock Updates (Audit Log)</h3>
            </div>

            {stockHistory.length === 0 ? (
              <div className="py-6 text-center text-slate-400 text-xs space-y-1">
                <Boxes className="w-8 h-8 text-slate-300 mx-auto" />
                <p>No manual adjustments performed yet in this session.</p>
                <p className="text-[11px] text-slate-400">
                  Updates made will log here immediately.
                </p>
              </div>
            ) : (
              <div className="space-y-2.5 text-xs max-h-96 overflow-y-auto pr-1">
                {stockHistory.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 bg-[#F7FAFC] rounded-lg border border-slate-200/80 space-y-1.5"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="font-bold text-slate-900 text-xs">{item.productName}</div>
                        <div className="text-[11px] text-slate-500">
                          {item.branchName} ·{' '}
                          <span className="text-[#159A9C] font-semibold">{item.category}</span>
                        </div>
                      </div>
                      <span
                        className={`font-bold font-mono text-xs px-2 py-0.5 rounded ${
                          item.added > 0
                            ? 'bg-emerald-50 text-[#2E8B70] border border-[#2E8B70]/30'
                            : item.added < 0
                            ? 'bg-rose-50 text-[#D95C5C] border border-[#D95C5C]/30'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {item.added > 0 ? `+${item.added}` : item.added}
                      </span>
                    </div>

                    <div className="text-[11px] text-slate-600 grid grid-cols-2 gap-1 pt-1.5 border-t border-slate-200/60 font-mono">
                      <div>
                        <span className="text-slate-400">Previous: </span>
                        <span className="font-semibold">{item.oldStock}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-slate-400">New Stock: </span>
                        <span className="font-bold text-[#123B5D]">{item.newStock}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-100">
                      <span>Updated By: <strong className="text-slate-600">{item.updatedBy || 'Admin'}</strong></span>
                      <span>{item.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Independent Stock Rule Card */}
          <div className="bg-[#eef8f8]/60 border border-[#159A9C]/25 rounded-xl p-4 text-xs text-[#123B5D] space-y-2 shadow-2xs">
            <div className="font-bold flex items-center gap-1.5 text-[#123B5D]">
              <Building2 className="w-4 h-4 text-[#159A9C]" />
              <span>Independent Branch Inventory Rule</span>
            </div>
            <p className="text-slate-600 leading-relaxed text-[11px]">
              Every branch maintains its own localized stock. When billing staff at Branch 1
              issues medicines, only Branch 1 inventory is deducted. Central Admin can replenish or adjust
              multiple products across any branch simultaneously.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
