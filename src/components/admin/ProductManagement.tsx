import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import {
  Package,
  Plus,
  Search,
  Edit2,
  Trash2,
  X,
  IndianRupee,
  Layers,
  CheckCircle2,
  AlertCircle,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Product } from '../../types';
import { FormLabel, FieldError, RequiredAsterisk } from '../common/FormComponents';
import {
  validateRequired,
  validateSellingRate,
  validateAlertThreshold,
} from '../../utils/validation';

const DEFAULT_PREDEFINED_CATEGORIES = [
  'Analgesics',
  'Antibiotics',
  'Respiratory / Cough',
  'Supplements',
  'Topical Pain Care',
  'Broad Spectrum',
  'Bone & Joint',
  'Antidiabetics',
  'Antihypertensives',
  'Gastrointestinal',
  'Antipyretics',
  'Antihistamines',
  'Cardiovascular',
  'Diabetes',
  'Vitamins & Supplements',
];

export const ProductManagement: React.FC = () => {
  const {
    products,
    addProduct,
    updateProduct,
    deleteProduct,
    customCategories,
    addCustomCategory,
    setCurrentAdminTab,
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [deleteSuccessMsg, setDeleteSuccessMsg] = useState<string | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Analgesics');
  const [customCategory, setCustomCategory] = useState('');
  const [customCategoryError, setCustomCategoryError] = useState<string | null>(null);
  const [rate, setRate] = useState<number | string>(10);
  const [threshold, setThreshold] = useState<number | string>(10);
  const [unit, setUnit] = useState('strip');
  const [batchNo, setBatchNo] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Dynamically compute all categories without duplicates (case-insensitive)
  const allCategories = useMemo(() => {
    const list: string[] = [];
    const seen = new Set<string>();

    const addIfUnique = (catName?: string) => {
      if (!catName) return;
      const clean = catName.trim();
      if (!clean || clean.toLowerCase() === 'all' || clean.toLowerCase() === 'other') return;
      const lower = clean.toLowerCase();
      if (!seen.has(lower)) {
        seen.add(lower);
        list.push(clean);
      }
    };

    DEFAULT_PREDEFINED_CATEGORIES.forEach(addIfUnique);
    customCategories.forEach(addIfUnique);
    products.forEach((p) => addIfUnique(p.category));

    return list;
  }, [customCategories, products]);

  const categoryFilterList = useMemo(() => ['All', ...allCategories], [allCategories]);

  // Form dropdown options: all defined categories plus 'Other'
  const formCategoryOptions = useMemo(() => {
    return [...allCategories, 'Other'];
  }, [allCategories]);

  // Category horizontal scroll controls & state
  const categoryScrollRef = useRef<HTMLDivElement>(null);
  const categoryButtonRefs = useRef<Map<string, HTMLButtonElement>>(new Map());
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [hasOverflow, setHasOverflow] = useState(false);

  const checkScroll = useCallback(() => {
    const el = categoryScrollRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    const overflow = scrollWidth > clientWidth + 4;
    setHasOverflow(overflow);
    setCanScrollLeft(scrollLeft > 6);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 6);
  }, []);

  useEffect(() => {
    checkScroll();
    const el = categoryScrollRef.current;
    if (!el) return;

    el.addEventListener('scroll', checkScroll, { passive: true });
    window.addEventListener('resize', checkScroll);

    let resizeObserver: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(() => {
        checkScroll();
      });
      resizeObserver.observe(el);
    }

    const timer = setTimeout(checkScroll, 120);

    return () => {
      el.removeEventListener('scroll', checkScroll);
      window.removeEventListener('resize', checkScroll);
      if (resizeObserver) resizeObserver.disconnect();
      clearTimeout(timer);
    };
  }, [checkScroll, categoryFilterList]);

  // Requirement 7: Active category must remain visible
  useEffect(() => {
    const buttonEl = categoryButtonRefs.current.get(categoryFilter);
    const containerEl = categoryScrollRef.current;
    if (buttonEl && containerEl) {
      const containerRect = containerEl.getBoundingClientRect();
      const buttonRect = buttonEl.getBoundingClientRect();
      if (buttonRect.left < containerRect.left || buttonRect.right > containerRect.right) {
        buttonEl.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
          inline: 'nearest',
        });
      }
    }
  }, [categoryFilter]);

  const scrollCategory = (direction: 'left' | 'right') => {
    const el = categoryScrollRef.current;
    if (!el) return;
    const scrollAmount = Math.max(180, Math.floor(el.clientWidth * 0.6));
    el.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
  };

  const filteredProducts = products.filter((p) => {
    const matchSearch =
      searchTerm.trim() === '' ||
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.batchNo && p.batchNo.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchCategory =
      categoryFilter === 'All' ||
      p.category.toLowerCase().includes(categoryFilter.toLowerCase());
    return matchSearch && matchCategory;
  });

  const handleOpenAdd = () => {
    setEditingProduct(null);
    setName('');
    setCategory('Analgesics');
    setCustomCategory('');
    setCustomCategoryError(null);
    setRate(10);
    setThreshold(10);
    setUnit('strip (10 tabs)');
    setBatchNo(`BATCH-${Math.floor(1000 + Math.random() * 9000)}`);
    setErrors({});
    setIsModalOpen(true);
  };

  const handleOpenEdit = (p: Product) => {
    setEditingProduct(p);
    setName(p.name);
    if (allCategories.some((c) => c.toLowerCase() === p.category.toLowerCase())) {
      const matched = allCategories.find((c) => c.toLowerCase() === p.category.toLowerCase()) || p.category;
      setCategory(matched);
      setCustomCategory('');
    } else {
      setCategory('Other');
      setCustomCategory(p.category);
    }
    setCustomCategoryError(null);
    setRate(p.rate);
    setThreshold(p.threshold);
    setUnit(p.unit || 'strip');
    setBatchNo(p.batchNo || '');
    setErrors({});
    setIsModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (!productToDelete) return;
    const deletedName = productToDelete.name;
    deleteProduct(productToDelete.id);
    setProductToDelete(null);
    setDeleteSuccessMsg(`"${deletedName}" has been successfully removed from the catalog.`);
    setTimeout(() => {
      setDeleteSuccessMsg(null);
    }, 4000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    const nameErr = validateRequired(name, 'Product Name');
    if (nameErr) newErrors.name = nameErr;

    let finalCategory = category;
    if (category === 'Other') {
      const trimmedCustom = customCategory.trim();
      const customErr = validateRequired(trimmedCustom, 'Custom Category Name');
      if (customErr) {
        newErrors.customCategory = customErr;
        setCustomCategoryError(customErr);
      } else {
        finalCategory = addCustomCategory(trimmedCustom) || trimmedCustom;
      }
    }

    const rateErr = validateSellingRate(rate, 'Selling Rate');
    if (rateErr) newErrors.rate = rateErr;

    const thresholdErr = validateAlertThreshold(threshold, 'Low Stock Alert Threshold');
    if (thresholdErr) newErrors.threshold = thresholdErr;

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    if (!finalCategory) {
      finalCategory = 'Analgesics';
    }

    if (editingProduct) {
      updateProduct(editingProduct.id, {
        name: name.trim(),
        category: finalCategory,
        rate: Number(rate),
        threshold: Number(threshold),
        unit,
        batchNo,
      });
    } else {
      addProduct({
        name: name.trim(),
        category: finalCategory,
        rate: Number(rate),
        threshold: Number(threshold),
        unit,
        batchNo: batchNo || `BATCH-${Date.now().toString().slice(-4)}`,
        status: 'Active',
      });
    }
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200">
        <div>
          <h2 className="text-xl font-bold text-[#123B5D] tracking-tight flex items-center gap-2">
            <Package className="w-5 h-5 text-[#159A9C]" />
            <span>Master Product Catalog</span>
          </h2>
          <p className="text-xs text-slate-500">
            Define medicines, rates, alert thresholds, and dispensing units across all hospital branches
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="px-3.5 py-2 bg-[#159A9C] hover:bg-[#0f7a7c] text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>+ Add Product</span>
        </button>
      </div>

      {/* Success Notification Banner */}
      {deleteSuccessMsg && (
        <div className="flex items-center justify-between gap-3 p-3 bg-emerald-50/90 border border-emerald-200 text-emerald-800 text-xs rounded-xl shadow-xs animate-in fade-in duration-200">
          <div className="flex items-center gap-2 font-medium">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{deleteSuccessMsg}</span>
          </div>
          <button
            onClick={() => setDeleteSuccessMsg(null)}
            className="text-emerald-500 hover:text-emerald-700 p-0.5 rounded transition-colors"
            title="Dismiss notification"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/90 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
        <div className="relative w-full sm:w-80">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search className="w-3.5 h-3.5" />
          </div>
          <input
            type="text"
            placeholder="Search product name, category..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#159A9C] focus:border-[#159A9C]"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-end text-xs text-slate-600">
          <span>Showing <strong className="font-mono text-[#123B5D]">{filteredProducts.length}</strong> products</span>
          <button
            onClick={() => setCurrentAdminTab('stock-update')}
            className="px-3 py-1.5 text-xs rounded-lg bg-[#eef8f8] text-[#159A9C] font-semibold hover:bg-[#dff3f3] border border-[#159A9C]/20 transition-colors"
          >
            Update Branch Stock
          </button>
        </div>
      </div>

      {/* Medicine Category Filter Bar with Left / Right Scroll Controls */}
      <div className="relative flex items-center gap-1.5 w-full">
        {hasOverflow && (
          <button
            type="button"
            onClick={() => scrollCategory('left')}
            disabled={!canScrollLeft}
            aria-label="Scroll categories left"
            className={`p-1.5 rounded-lg border transition-all shrink-0 ${
              canScrollLeft
                ? 'bg-white hover:bg-slate-50 text-slate-700 hover:text-[#159A9C] border-slate-200/90 shadow-2xs hover:border-[#159A9C]/40 active:scale-95 cursor-pointer'
                : 'bg-slate-100/60 text-slate-350 border-slate-200/60 cursor-not-allowed opacity-40'
            }`}
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        )}

        <div
          ref={categoryScrollRef}
          className="flex items-center gap-2 overflow-x-auto py-1 flex-nowrap scrollbar-none flex-1 scroll-smooth [&::-webkit-scrollbar]:hidden"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {categoryFilterList.map((cat) => {
            const isSelected = categoryFilter === cat;
            return (
              <button
                key={cat}
                ref={(node) => {
                  if (node) {
                    categoryButtonRefs.current.set(cat, node);
                  } else {
                    categoryButtonRefs.current.delete(cat);
                  }
                }}
                type="button"
                onClick={() => setCategoryFilter(cat)}
                className={`px-3.5 py-1.5 rounded-full text-xs whitespace-nowrap transition-all cursor-pointer shrink-0 ${
                  isSelected
                    ? 'bg-[#159A9C] text-white font-semibold shadow-xs border border-[#159A9C]'
                    : 'bg-slate-100/80 hover:bg-slate-200/70 text-slate-600 hover:text-slate-900 border border-slate-200/80 font-medium'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {hasOverflow && (
          <button
            type="button"
            onClick={() => scrollCategory('right')}
            disabled={!canScrollRight}
            aria-label="Scroll categories right"
            className={`p-1.5 rounded-lg border transition-all shrink-0 ${
              canScrollRight
                ? 'bg-white hover:bg-slate-50 text-slate-700 hover:text-[#159A9C] border-slate-200/90 shadow-2xs hover:border-[#159A9C]/40 active:scale-95 cursor-pointer'
                : 'bg-slate-100/60 text-slate-350 border-slate-200/60 cursor-not-allowed opacity-40'
            }`}
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Products Table matching Screen 7 */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[11px]">
                <th className="py-3.5 px-4 font-semibold">Product Name</th>
                <th className="py-3.5 px-4 font-semibold">Category</th>
                <th className="py-3.5 px-4 font-semibold text-right">Selling Rate</th>
                <th className="py-3.5 px-4 font-semibold text-center">Alert Threshold</th>
                <th className="py-3.5 px-4 font-semibold text-center">Status</th>
                <th className="py-3.5 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredProducts.length > 0 ? (
                filteredProducts.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-900">{p.name}</div>
                      <div className="text-[11px] text-slate-400 font-mono">
                        {p.unit || 'unit'} · {p.batchNo || 'N/A'}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="text-slate-600 text-[11px] bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200/60">
                        {p.category}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-[#123B5D]">
                      ₹{p.rate.toFixed(2)}
                    </td>
                    <td className="py-3.5 px-4 text-center font-mono font-semibold text-slate-700">
                      <span className="px-2 py-0.5 rounded-md bg-[#fdf8ee] text-[#D99A24] border border-[#D99A24]/30 text-[11px]">
                        ≤ {p.threshold} units
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-0.5 rounded-md bg-[#edf7f4] text-[#2E8B70] border border-[#2E8B70]/30">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#2E8B70]"></span>
                        <span>{p.status}</span>
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenEdit(p)}
                          className="p-1.5 text-slate-500 hover:text-[#159A9C] hover:bg-[#eef8f8] rounded-md transition-colors"
                          title="Edit Product"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setProductToDelete(p)}
                          className="p-1.5 text-slate-500 hover:text-[#D95C5C] hover:bg-rose-50 rounded-md transition-colors"
                          title="Delete Product"
                          aria-label={`Delete ${p.name}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-12 text-center">
                    <div className="flex flex-col items-center justify-center text-slate-400">
                      <Package className="w-8 h-8 stroke-[1.5] text-slate-300 mb-2" />
                      <p className="text-sm font-semibold text-slate-600">No products found</p>
                      <p className="text-xs text-slate-400 mt-1 max-w-sm">
                        {searchTerm
                          ? `No medicines matching "${searchTerm}" in ${categoryFilter === 'All' ? 'the catalog' : categoryFilter}.`
                          : `There are currently no products in the "${categoryFilter}" category.`}
                      </p>
                      {(categoryFilter !== 'All' || searchTerm) && (
                        <button
                          type="button"
                          onClick={() => {
                            setCategoryFilter('All');
                            setSearchTerm('');
                          }}
                          className="mt-3 px-3 py-1.5 text-xs font-semibold text-[#159A9C] hover:text-[#0f7a7c] bg-[#eef8f8] rounded-lg transition-colors border border-[#159A9C]/20"
                        >
                          Clear filters
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-[#0c2942]/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 bg-[#123B5D] text-white flex items-center justify-between">
              <h3 className="font-bold text-sm">
                {editingProduct ? 'Edit Medicine / Product' : 'Add New Medicine / Product'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-300 hover:text-white p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs" noValidate>
              {/* 1. Product Name Editable Text Input */}
              <div>
                <FormLabel label="Product Name" required htmlFor="product-name" />
                <input
                  id="product-name"
                  type="text"
                  placeholder="Enter medicine/product name..."
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (errors.name) {
                      setErrors((prev) => {
                        const { name: _, ...rest } = prev;
                        return rest;
                      });
                    }
                  }}
                  className={`w-full px-3 py-2 border rounded-lg text-xs focus:outline-none transition-colors ${
                    errors.name
                      ? 'border-red-500 bg-red-50/20 focus:ring-2 focus:ring-red-400 focus:border-red-500'
                      : 'border-slate-300 focus:ring-2 focus:ring-[#159A9C] focus:border-[#159A9C]'
                  }`}
                />
                <FieldError error={errors.name} />
              </div>

              {/* 2. Medicine Category Dropdown */}
              <div>
                <FormLabel label="Medicine Category" required htmlFor="product-category" />
                <div className="relative">
                  <select
                    id="product-category"
                    value={category}
                    onChange={(e) => {
                      setCategory(e.target.value);
                      if (e.target.value !== 'Other') {
                        setCustomCategoryError(null);
                        if (errors.customCategory) {
                          setErrors((prev) => {
                            const { customCategory: _, ...rest } = prev;
                            return rest;
                          });
                        }
                      }
                    }}
                    className="w-full px-3 py-2 pr-8 border border-slate-300 rounded-lg text-xs bg-white text-slate-800 focus:ring-2 focus:ring-[#159A9C] focus:border-[#159A9C] focus:outline-none cursor-pointer appearance-none"
                  >
                    {formCategoryOptions.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                    {!formCategoryOptions.includes(category) && category && (
                      <option value={category}>{category}</option>
                    )}
                  </select>
                  <div className="absolute inset-y-0 right-0 pr-2.5 flex items-center pointer-events-none text-slate-400">
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </div>
              </div>

              {/* 3. Custom Category Name (Only when "Other" is selected) */}
              {category === 'Other' && (
                <div>
                  <FormLabel label="Custom Category Name" required htmlFor="custom-category" />
                  <input
                    id="custom-category"
                    type="text"
                    placeholder="Enter new category name..."
                    value={customCategory}
                    onChange={(e) => {
                      setCustomCategory(e.target.value);
                      if (customCategoryError) setCustomCategoryError(null);
                      if (errors.customCategory) {
                        setErrors((prev) => {
                          const { customCategory: _, ...rest } = prev;
                          return rest;
                        });
                      }
                    }}
                    className={`w-full px-3 py-2 border rounded-lg text-xs focus:outline-none transition-colors ${
                      customCategoryError || errors.customCategory
                        ? 'border-red-500 bg-red-50/20 focus:ring-2 focus:ring-red-400 focus:border-red-500'
                        : 'border-slate-300 focus:ring-2 focus:ring-[#159A9C] focus:border-[#159A9C]'
                    }`}
                  />
                  <FieldError error={customCategoryError || errors.customCategory} />
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <FormLabel label="Selling Rate (₹)" required htmlFor="product-rate" />
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      ₹
                    </div>
                    <input
                      id="product-rate"
                      type="number"
                      step="0.01"
                      min="0"
                      value={rate}
                      onChange={(e) => {
                        setRate(e.target.value);
                        if (errors.rate) {
                          setErrors((prev) => {
                            const { rate: _, ...rest } = prev;
                            return rest;
                          });
                        }
                      }}
                      className={`w-full pl-7 pr-3 py-2 border rounded-lg text-xs font-mono focus:outline-none transition-colors ${
                        errors.rate
                          ? 'border-red-500 bg-red-50/20 focus:ring-2 focus:ring-red-400 focus:border-red-500'
                          : 'border-slate-300 focus:ring-2 focus:ring-[#159A9C] focus:border-[#159A9C]'
                      }`}
                    />
                  </div>
                  <FieldError error={errors.rate} />
                </div>

                <div>
                  <FormLabel label="Low Stock Alert Threshold" required htmlFor="product-threshold" />
                  <input
                    id="product-threshold"
                    type="number"
                    min="0"
                    value={threshold}
                    onChange={(e) => {
                      setThreshold(e.target.value);
                      if (errors.threshold) {
                        setErrors((prev) => {
                          const { threshold: _, ...rest } = prev;
                          return rest;
                        });
                      }
                    }}
                    className={`w-full px-3 py-2 border rounded-lg text-xs font-mono focus:outline-none transition-colors ${
                      errors.threshold
                        ? 'border-red-500 bg-red-50/20 focus:ring-2 focus:ring-red-400 focus:border-red-500'
                        : 'border-slate-300 focus:ring-2 focus:ring-[#159A9C] focus:border-[#159A9C]'
                    }`}
                  />
                  <FieldError error={errors.threshold} />
                  <div className="text-[10px] text-slate-400 mt-1">
                    Alert triggers when branch stock ≤ this value
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <FormLabel label="Dispensing Unit" htmlFor="product-unit" />
                  <input
                    id="product-unit"
                    type="text"
                    placeholder="e.g. strip (10 tabs), 100ml bottle"
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-[#159A9C] focus:border-[#159A9C] focus:outline-none"
                  />
                </div>

                <div>
                  <FormLabel label="Batch / Lot No." htmlFor="product-batch" />
                  <input
                    id="product-batch"
                    type="text"
                    placeholder="e.g. PCM-2026-A1"
                    value={batchNo}
                    onChange={(e) => setBatchNo(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono focus:ring-2 focus:ring-[#159A9C] focus:border-[#159A9C] focus:outline-none uppercase"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#159A9C] hover:bg-[#0f7a7c] text-white rounded-lg font-semibold shadow-xs transition-colors"
                >
                  {editingProduct ? 'Save Updates' : 'Add to Catalog'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {productToDelete && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-[#0c2942]/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-6">
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-full bg-rose-50 border border-rose-100 flex items-center justify-center shrink-0 text-[#D95C5C]">
                  <Trash2 className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-bold text-[#123B5D]">
                    Delete Product
                  </h3>
                  <p className="text-xs text-slate-600 mt-1">
                    Are you sure you want to delete this product?
                  </p>
                  <div className="mt-3 p-2.5 bg-slate-50 rounded-lg border border-slate-200/80 text-xs">
                    <div className="font-semibold text-slate-800">{productToDelete.name}</div>
                    <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-2">
                      <span>Category: {productToDelete.category}</span>
                      <span>·</span>
                      <span>Rate: ₹{productToDelete.rate.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100 text-xs">
                <button
                  type="button"
                  onClick={() => setProductToDelete(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDelete}
                  className="px-4 py-2 bg-[#D95C5C] hover:bg-[#c34a4a] text-white font-semibold rounded-lg shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
