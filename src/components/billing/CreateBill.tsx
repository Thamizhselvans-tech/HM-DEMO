import React, { useState, useMemo } from 'react';
import {
  Plus,
  Minus,
  Trash2,
  Building2,
  Package,
  IndianRupee,
  AlertTriangle,
  CheckCircle,
  FileText,
  User,
  Phone,
  Sparkles,
  ArrowLeft,
  CreditCard,
  QrCode,
  Banknote,
  Search,
  X,
  Lock,
  Stethoscope,
  Info,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { BillItemInput, Invoice } from '../../types';
import { FormLabel, PhoneInput, FieldError } from '../common/FormComponents';
import {
  validateQuantity,
  validatePhone,
  sanitizePhoneInput,
} from '../../utils/validation';

interface Props {
  onBillGenerated: (invoice: Invoice) => void;
  onCancel: () => void;
  isLocked?: boolean;
}

export const CreateBill: React.FC<Props> = ({ onBillGenerated, onCancel, isLocked = false }) => {
  const { session, products, getProductStockAtBranch, createBill, showToast } = useApp();

  // Assigned branch lock - staff can only bill from their assigned branch
  const branchId = session?.branchId || 'branch-1';
  const branchName = session?.branchName || 'Branch 1 - Main Hospital';
  const staffName = session?.staffName || 'Staff Member';

  // Customer / Prescriber info
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [doctorName, setDoctorName] = useState('Dr. S. K. Sharma, MD');
  const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'UPI' | 'Card'>('Cash');

  // Product Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Active Selected Product & Quantity Form
  const [selectedProductId, setSelectedProductId] = useState<string>(products[0]?.id || '');
  const [itemQuantity, setItemQuantity] = useState<number>(1);
  const [itemError, setItemError] = useState<string | null>(null);

  // Cart / Bill Items List
  const [billItems, setBillItems] = useState<BillItemInput[]>([]);

  // Categories list
  const categories = useMemo(() => {
    const cats = new Set<string>();
    products.forEach((p) => {
      const primaryCat = p.category.split('/')[0].trim();
      cats.add(primaryCat);
    });
    return ['All', ...Array.from(cats)];
  }, [products]);

  // Filtered products based on search & category
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch =
        searchQuery.trim() === '' ||
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.batchNo && p.batchNo.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesCat =
        selectedCategory === 'All' ||
        p.category.toLowerCase().includes(selectedCategory.toLowerCase());

      return matchesSearch && matchesCat;
    });
  }, [products, searchQuery, selectedCategory]);

  // Current selected product object
  const selectedProduct = products.find((p) => p.id === selectedProductId) || products[0];

  // Current branch stock for the selected product
  const currentBranchStock = selectedProduct
    ? getProductStockAtBranch(branchId, selectedProduct.id)
    : 0;

  // Quantity already added to cart for this product
  const alreadyInCartQty = billItems
    .filter((i) => i.productId === selectedProductId)
    .reduce((sum, i) => sum + i.quantity, 0);

  const availableAfterCart = Math.max(0, currentBranchStock - alreadyInCartQty);

  // Auto-calculated amount for selected product & entered quantity
  const currentCalculatedAmount = selectedProduct
    ? selectedProduct.rate * (Number(itemQuantity) || 0)
    : 0;

  // Grand totals
  const grandTotal = billItems.reduce((sum, item) => sum + item.amount, 0);
  const totalItemsCount = billItems.reduce((sum, item) => sum + item.quantity, 0);

  // Select a product
  const handleSelectProduct = (prodId: string) => {
    if (isLocked) return;
    setSelectedProductId(prodId);
    setItemQuantity(1);
    setItemError(null);
  };

  // Add Item to Bill
  const handleAddItem = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (isLocked) return;
    setItemError(null);

    if (!selectedProduct) return;
    
    const qtyValidation = validateQuantity(itemQuantity, 'Quantity');
    if (qtyValidation) {
      setItemError(qtyValidation);
      return;
    }
    const qty = Number(itemQuantity);

    if (qty > availableAfterCart) {
      setItemError(
        `Insufficient branch stock! Only ${availableAfterCart} unit(s) available at ${branchName}.`
      );
      return;
    }

    // Check if already in list
    const existingIndex = billItems.findIndex((i) => i.productId === selectedProduct.id);
    if (existingIndex > -1) {
      const updated = [...billItems];
      const newQty = updated[existingIndex].quantity + qty;
      updated[existingIndex].quantity = newQty;
      updated[existingIndex].amount = newQty * selectedProduct.rate;
      setBillItems(updated);
    } else {
      setBillItems((prev) => [
        ...prev,
        {
          productId: selectedProduct.id,
          productName: selectedProduct.name,
          rate: selectedProduct.rate,
          quantity: qty,
          amount: selectedProduct.rate * qty,
        },
      ]);
    }

    // Reset item quantity to 1
    setItemQuantity(1);
    showToast(`Added ${selectedProduct.name} (x${qty}) to bill`);
  };

  // Inline Quick Add from product search list
  const handleQuickAddOne = (prod: (typeof products)[0]) => {
    if (isLocked) return;
    const bStock = getProductStockAtBranch(branchId, prod.id);
    const inCart = billItems
      .filter((i) => i.productId === prod.id)
      .reduce((sum, i) => sum + i.quantity, 0);
    const avail = Math.max(0, bStock - inCart);

    if (avail < 1) {
      showToast(`Cannot add ${prod.name}: Stock exhausted at ${branchName}`);
      return;
    }

    const existingIndex = billItems.findIndex((i) => i.productId === prod.id);
    if (existingIndex > -1) {
      const updated = [...billItems];
      const newQty = updated[existingIndex].quantity + 1;
      updated[existingIndex].quantity = newQty;
      updated[existingIndex].amount = newQty * prod.rate;
      setBillItems(updated);
    } else {
      setBillItems((prev) => [
        ...prev,
        {
          productId: prod.id,
          productName: prod.name,
          rate: prod.rate,
          quantity: 1,
          amount: prod.rate,
        },
      ]);
    }
    showToast(`+1 ${prod.name} added`);
  };

  // Adjust item quantity inside cart
  const handleUpdateCartQty = (index: number, delta: number) => {
    if (isLocked) return;
    const item = billItems[index];
    const totalBranchStock = getProductStockAtBranch(branchId, item.productId);
    const newQty = item.quantity + delta;

    if (newQty <= 0) {
      handleRemoveItem(index);
      return;
    }

    if (newQty > totalBranchStock) {
      showToast(`Cannot increase: Only ${totalBranchStock} units available at ${branchName}`);
      return;
    }

    const updated = [...billItems];
    updated[index].quantity = newQty;
    updated[index].amount = newQty * item.rate;
    setBillItems(updated);
  };

  // Remove Item from cart
  const handleRemoveItem = (index: number) => {
    if (isLocked) return;
    const removed = billItems[index];
    setBillItems((prev) => prev.filter((_, i) => i !== index));
    showToast(`Removed ${removed.productName} from bill`);
  };

  // Preset 1: Paracetamol (2) + Cough Syrup (3) + Vitamin Tablet (1) = ₹265
  const handleLoadPromptExample = () => {
    if (isLocked) return;
    const pcm = products.find((p) => p.name.toLowerCase().includes('paracetamol')) || products[0];
    const cough = products.find((p) => p.name.toLowerCase().includes('cough')) || products[1];
    const vit = products.find((p) => p.name.toLowerCase().includes('vitamin')) || products[2];

    const exampleItems: BillItemInput[] = [
      {
        productId: pcm.id,
        productName: pcm.name,
        rate: 10,
        quantity: 2,
        amount: 20,
      },
      {
        productId: cough.id,
        productName: cough.name,
        rate: 80,
        quantity: 3,
        amount: 240,
      },
      {
        productId: vit.id,
        productName: vit.name,
        rate: 5,
        quantity: 1,
        amount: 5,
      },
    ];

    setBillItems(exampleItems);
    setCustomerName('Vijay Anand');
    setCustomerPhone('9840055441');
    setPhoneError(null);
    setDoctorName('Dr. S. K. Sharma, MD');
    setPaymentMethod('Cash');
    showToast('Loaded multi-item example: Paracetamol (2) + Cough Syrup (3) + Vitamin (1) = ₹265');
  };

  // Preset 2: Antibiotic Course
  const handleLoadAntibioticCourse = () => {
    if (isLocked) return;
    const amx = products.find((p) => p.name.toLowerCase().includes('amoxicillin')) || products[1];
    const pcm = products.find((p) => p.name.toLowerCase().includes('paracetamol')) || products[0];

    const items: BillItemInput[] = [
      {
        productId: amx.id,
        productName: amx.name,
        rate: amx.rate,
        quantity: 2,
        amount: amx.rate * 2,
      },
      {
        productId: pcm.id,
        productName: pcm.name,
        rate: pcm.rate,
        quantity: 1,
        amount: pcm.rate * 1,
      },
    ];

    setBillItems(items);
    setCustomerName('K. Ramesh');
    setCustomerPhone('9444122334');
    setPhoneError(null);
    setDoctorName('Dr. Anitha Rao, MBBS');
    setPaymentMethod('UPI');
    showToast('Loaded Antibiotic Course (2 items)');
  };

  // Final Generate Invoice & Deduct Stock
  const handleGenerateBill = () => {
    if (isLocked) return;
    setPhoneError(null);

    // Validate phone number if entered
    if (customerPhone.trim()) {
      const phoneErr = validatePhone(customerPhone, false, 'Patient phone number');
      if (phoneErr) {
        setPhoneError(phoneErr);
        return;
      }
    }

    if (billItems.length === 0) {
      setItemError('Please add at least one medicine item before generating an invoice.');
      return;
    }

    // Verify stock availability once more
    for (const item of billItems) {
      const liveStock = getProductStockAtBranch(branchId, item.productId);
      if (item.quantity > liveStock) {
        setItemError(
          `Stock deficit for ${item.productName}! Only ${liveStock} units left at ${branchName}.`
        );
        return;
      }
    }

    const newInvoice = createBill({
      branchId,
      branchName,
      staffId: session?.staffId || 'staff-1',
      staffName,
      customerName: customerName.trim() || 'Walk-in Patient',
      customerPhone: customerPhone.trim() || 'Counter Patient',
      doctorName: doctorName.trim() || 'General OPD',
      items: billItems,
      paymentMethod,
    });

    onBillGenerated(newInvoice);
  };

  return (
    <div className="space-y-5">
      {/* Top Bar with Terminal Context & Branch Lock Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <button
            onClick={onCancel}
            className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-[#F7FAFC] transition-colors"
            title="Back to Terminal Dashboard"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-[#123B5D] tracking-tight flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#159A9C]" />
                <span>Create Pharmacy Invoice</span>
              </h2>
              <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md bg-[#eef8f8] text-[#159A9C] border border-[#159A9C]/30">
                <Lock className="w-3 h-3 text-[#159A9C]" />
                <span>{branchName}</span>
              </span>
            </div>
            <div className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
              <span>Attending Pharmacist: <strong className="text-slate-700">{staffName}</strong></span>
              <span>·</span>
              <span className="text-slate-400">Stock automatically deducted upon billing</span>
            </div>
          </div>
        </div>

        {/* Quick Example Presets */}
        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={handleLoadPromptExample}
            className="px-3 py-1.5 bg-[#fdfaf2] hover:bg-[#fbf3e0] text-[#917117] border border-[#C9A227]/40 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors shadow-2xs"
            title="Paracetamol (2) + Cough Syrup (3) + Vitamin (1) = ₹265"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#C9A227]" />
            <span>Load Prompt Bill (₹265)</span>
          </button>

          <button
            type="button"
            onClick={handleLoadAntibioticCourse}
            className="px-3 py-1.5 bg-[#eef8f8] hover:bg-[#dff3f3] text-[#159A9C] border border-[#159A9C]/30 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
            title="Amoxicillin (2) + Paracetamol (1)"
          >
            <span>Rx Pack (2 Items)</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column: Patient Details + Product Search & Selection */}
        <div className="lg:col-span-7 space-y-5">
          {/* 1. Patient & Prescriber Information */}
          <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs p-4 sm:p-5">
            <h3 className="font-bold text-[#123B5D] text-xs uppercase tracking-wider mb-3 pb-2 border-b border-slate-100 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-[#159A9C]" />
                <span>1. Patient & Prescriber Details</span>
              </span>
              <span className="text-[10px] text-slate-400 font-normal normal-case">
                Optional for Outpatient Walk-ins
              </span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <FormLabel label="Patient Name" htmlFor="patient-name" />
                <div className="relative">
                  <input
                    id="patient-name"
                    type="text"
                    placeholder="e.g. Vijay Anand (Walk-in)"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-[#159A9C] focus:border-[#159A9C] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <FormLabel label="Patient Contact Phone" htmlFor="patient-phone" />
                <PhoneInput
                  id="patient-phone"
                  value={customerPhone}
                  onChange={(val) => {
                    setCustomerPhone(val);
                    if (phoneError) setPhoneError(null);
                  }}
                  error={phoneError}
                  placeholder="9840055441"
                />
              </div>

              <div className="sm:col-span-2">
                <FormLabel
                  label="Prescribing Doctor / Prescription Ref"
                  htmlFor="prescribing-doctor"
                  className="block font-semibold text-slate-700 mb-1 flex items-center justify-between"
                >
                  <span className="text-[10px] text-slate-400 font-normal">OPD Consultation</span>
                </FormLabel>
                <div className="relative">
                  <input
                    id="prescribing-doctor"
                    type="text"
                    placeholder="e.g. Dr. S. K. Sharma, MD"
                    value={doctorName}
                    onChange={(e) => setDoctorName(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-[#159A9C] focus:border-[#159A9C] focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 2. Product Search & Selection Section */}
          <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs p-4 sm:p-5 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-bold text-[#123B5D] text-xs uppercase tracking-wider flex items-center gap-1.5">
                <Package className="w-3.5 h-3.5 text-[#159A9C]" />
                <span>2. Search & Select Medicine</span>
              </h3>
              <span className="text-[11px] text-[#159A9C] font-semibold">
                {branchName} Stock
              </span>
            </div>

            {/* Search Input Bar */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search medicine by name, category, or batch (e.g. Paracetamol, Cough Syrup)..."
                className="w-full pl-9 pr-9 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#159A9C] focus:border-[#159A9C] bg-[#F7FAFC]"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Category Quick Filters */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px] scrollbar-none">
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-2.5 py-1 rounded-md font-medium whitespace-nowrap transition-colors ${
                    selectedCategory === cat
                      ? 'bg-[#159A9C] text-white font-bold shadow-2xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Medicine Quick Picker Grid */}
            <div className="border border-slate-200 rounded-lg max-h-44 overflow-y-auto divide-y divide-slate-100 text-xs">
              {filteredProducts.length === 0 ? (
                <div className="p-4 text-center text-slate-400 text-xs">
                  No medicines match "{searchQuery}" in category "{selectedCategory}"
                </div>
              ) : (
                filteredProducts.map((prod) => {
                  const bStock = getProductStockAtBranch(branchId, prod.id);
                  const isSelected = selectedProductId === prod.id;
                  const isLow = bStock <= prod.threshold;
                  const isOut = bStock === 0;

                  return (
                    <div
                      key={prod.id}
                      onClick={() => handleSelectProduct(prod.id)}
                      className={`p-2.5 flex items-center justify-between cursor-pointer transition-colors ${
                        isSelected
                          ? 'bg-[#eef8f8] border-l-4 border-l-[#159A9C]'
                          : 'hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex-1 min-w-0 pr-3">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 truncate">
                            {prod.name}
                          </span>
                          <span className="text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.2 rounded">
                            {prod.unit || 'unit'}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500 truncate mt-0.5">
                          {prod.category} · Batch: {prod.batchNo || 'GEN'}
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <div className="text-right">
                          <div className="font-mono font-bold text-[#123B5D]">
                            ₹{prod.rate.toFixed(2)}
                          </div>
                          <div className="text-[10px] flex items-center justify-end gap-1 font-mono">
                            {isOut ? (
                              <span className="text-[#D95C5C] font-bold">Out of stock</span>
                            ) : isLow ? (
                              <span className="text-[#D99A24] font-semibold">{bStock} left (Low)</span>
                            ) : (
                              <span className="text-[#2E8B70] font-medium">{bStock} in stock</span>
                            )}
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleQuickAddOne(prod);
                          }}
                          disabled={isOut}
                          className="px-2 py-1 bg-[#159A9C] hover:bg-[#0f7a7c] disabled:bg-slate-200 text-white rounded text-[11px] font-bold shadow-2xs transition-transform active:scale-95"
                          title="Quick add 1 unit to cart"
                        >
                          +1
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Selected Medicine Action Card */}
            {selectedProduct && (
              <form onSubmit={handleAddItem} className="bg-[#F7FAFC] rounded-xl p-4 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Selected For Dispensation
                    </span>
                    <h4 className="font-bold text-[#123B5D] text-sm">{selectedProduct.name}</h4>
                    <p className="text-[11px] text-slate-500">
                      {selectedProduct.category} · {selectedProduct.unit || 'Unit'} · Batch: {selectedProduct.batchNo}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400">Unit Price</span>
                    <div className="text-base font-bold font-mono text-[#123B5D]">
                      ₹{selectedProduct.rate.toFixed(2)}
                    </div>
                  </div>
                </div>

                {/* Live Stock & Auto-Calculation Matrix */}
                <div className="grid grid-cols-3 gap-2 bg-white p-3 rounded-lg border border-slate-200 text-center">
                  <div>
                    <div className="text-[10px] text-slate-500 font-medium">Branch Shelf Stock</div>
                    <div
                      className={`text-sm font-bold font-mono mt-0.5 ${
                        availableAfterCart <= selectedProduct.threshold
                          ? 'text-[#D95C5C]'
                          : 'text-[#2E8B70]'
                      }`}
                    >
                      {availableAfterCart} available
                    </div>
                    {alreadyInCartQty > 0 && (
                      <div className="text-[9px] text-slate-400">({alreadyInCartQty} in current cart)</div>
                    )}
                  </div>

                  <div className="border-x border-slate-200 px-1">
                    <div className="text-[10px] text-slate-500 font-medium">Quantity to Add</div>
                    <div className="text-sm font-bold font-mono text-slate-800 mt-0.5">
                      {itemQuantity || 0} {selectedProduct.unit || 'units'}
                    </div>
                  </div>

                  <div>
                    <div className="text-[10px] text-slate-500 font-medium">Item Amount</div>
                    <div className="text-sm font-bold font-mono text-[#123B5D] mt-0.5">
                      ₹{currentCalculatedAmount.toFixed(2)}
                    </div>
                    <div className="text-[9px] text-slate-400 font-mono">
                      Rate × Qty
                    </div>
                  </div>
                </div>

                {/* Quantity Controls with Quick Presets */}
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <label className="text-xs font-semibold text-slate-700 shrink-0">
                      Enter Quantity:
                    </label>
                    <div className="flex items-center gap-1.5 flex-1 max-w-[200px]">
                      <button
                        type="button"
                        onClick={() => setItemQuantity((prev) => Math.max(1, prev - 1))}
                        disabled={itemQuantity <= 1}
                        className="w-8 h-8 rounded-lg bg-white border border-slate-300 flex items-center justify-center text-slate-700 hover:bg-slate-100 disabled:opacity-40"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <input
                        type="number"
                        min="1"
                        max={availableAfterCart > 0 ? availableAfterCart : 1}
                        value={itemQuantity}
                        onChange={(e) => {
                          const val = parseInt(e.target.value) || 0;
                          setItemQuantity(val);
                          setItemError(null);
                        }}
                        className="w-full py-1.5 text-center font-mono font-bold text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#159A9C] focus:border-[#159A9C] bg-white"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setItemQuantity((prev) =>
                            availableAfterCart > 0 ? Math.min(availableAfterCart, prev + 1) : prev + 1
                          )
                        }
                        disabled={itemQuantity >= availableAfterCart}
                        className="w-8 h-8 rounded-lg bg-white border border-slate-300 flex items-center justify-center text-slate-700 hover:bg-slate-100 disabled:opacity-40"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Quick quantity shortcuts */}
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 5, 10].map((q) => (
                        <button
                          key={q}
                          type="button"
                          onClick={() => {
                            setItemQuantity(q);
                            setItemError(null);
                          }}
                          className={`px-2 py-1 rounded text-[11px] font-mono font-semibold transition-colors ${
                            itemQuantity === q
                              ? 'bg-[#159A9C] text-white'
                              : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                          }`}
                        >
                          {q}
                        </button>
                      ))}
                      {availableAfterCart > 0 && availableAfterCart < 10 && (
                        <button
                          type="button"
                          onClick={() => setItemQuantity(availableAfterCart)}
                          className="px-2 py-1 rounded text-[11px] font-mono font-bold bg-[#fdfaf2] text-[#917117] hover:bg-[#fbf3e0] border border-[#C9A227]/30"
                          title="Select remaining stock"
                        >
                          Max ({availableAfterCart})
                        </button>
                      )}
                    </div>
                  </div>

                  {itemError && (
                    <div className="p-2.5 bg-[#fdf2f2] border border-[#D95C5C]/30 text-[#D95C5C] rounded-lg flex items-center gap-2 text-xs">
                      <AlertTriangle className="w-4 h-4 shrink-0" />
                      <span>{itemError}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={availableAfterCart <= 0}
                    className="w-full py-2.5 bg-[#159A9C] hover:bg-[#0f7a7c] disabled:bg-slate-300 text-white rounded-lg font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add {selectedProduct.name} to Bill (₹{currentCalculatedAmount.toFixed(2)})</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* Right Column: Live Bill Summary, Multi-Product Cart, & Invoice Generation */}
        <div className="lg:col-span-5 space-y-5">
          <div className="bg-white rounded-xl border border-slate-200/90 shadow-sm p-4 sm:p-5 flex flex-col justify-between min-h-[520px]">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-[#eef8f8] text-[#159A9C] flex items-center justify-center font-bold text-xs border border-[#159A9C]/20">
                    ₹
                  </div>
                  <div>
                    <h3 className="font-bold text-[#123B5D] text-xs">
                      Patient Bill Items ({billItems.length})
                    </h3>
                    <p className="text-[10px] text-slate-400">
                      Calculates each item & grand total automatically
                    </p>
                  </div>
                </div>

                {billItems.length > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      setBillItems([]);
                      showToast('Bill items cleared');
                    }}
                    className="text-[11px] font-semibold text-[#D95C5C] hover:text-[#b84545] flex items-center gap-1"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Clear</span>
                  </button>
                )}
              </div>

              {/* Bill Items List Table */}
              {billItems.length === 0 ? (
                <div className="py-16 text-center text-slate-400 text-xs space-y-2">
                  <Package className="w-10 h-10 text-slate-300 mx-auto" />
                  <p className="font-semibold text-slate-600">No items added to bill yet</p>
                  <p className="text-[11px] text-slate-400 max-w-xs mx-auto">
                    Select a medicine from the catalog and click "Add Product to Bill" or load the example bill above.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-500 uppercase text-[10px]">
                        <th className="py-2 px-1">Product</th>
                        <th className="py-2 px-1 text-right">Rate</th>
                        <th className="py-2 px-1 text-center">Qty</th>
                        <th className="py-2 px-1 text-right">Amount</th>
                        <th className="py-2 px-1 text-right"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {billItems.map((item, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/80">
                          <td className="py-2.5 px-1">
                            <div className="font-bold text-slate-900">{item.productName}</div>
                            <div className="text-[10px] text-slate-400">₹{item.rate} × {item.quantity}</div>
                          </td>
                          <td className="py-2.5 px-1 text-right font-mono text-slate-600">
                            ₹{item.rate.toFixed(2)}
                          </td>
                          <td className="py-2.5 px-1 text-center">
                            <div className="inline-flex items-center gap-1 bg-[#F7FAFC] border border-slate-200 rounded px-1.5 py-0.5">
                              <button
                                type="button"
                                onClick={() => handleUpdateCartQty(idx, -1)}
                                className="text-slate-500 hover:text-[#D95C5C]"
                              >
                                -
                              </button>
                              <span className="font-mono font-bold text-slate-900 min-w-[16px] text-center">
                                {item.quantity}
                              </span>
                              <button
                                type="button"
                                onClick={() => handleUpdateCartQty(idx, 1)}
                                className="text-slate-500 hover:text-[#159A9C]"
                              >
                                +
                              </button>
                            </div>
                          </td>
                          <td className="py-2.5 px-1 text-right font-mono font-bold text-[#123B5D]">
                            ₹{item.amount.toFixed(2)}
                          </td>
                          <td className="py-2.5 px-1 text-right">
                            <button
                              type="button"
                              onClick={() => handleRemoveItem(idx)}
                              className="text-slate-400 hover:text-[#D95C5C] p-1 transition-colors"
                              title="Remove item"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Bill Summary & Payment Calculation */}
            <div className="pt-4 border-t-2 border-slate-200 space-y-4">
              {/* Payment Mode Selector */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1.5">
                  Payment Method
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('Cash')}
                    className={`py-2 px-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 border transition-all ${
                      paymentMethod === 'Cash'
                        ? 'bg-[#eef8f8] border-[#159A9C] text-[#159A9C] shadow-2xs font-bold'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Banknote className="w-3.5 h-3.5" />
                    <span>Cash</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('UPI')}
                    className={`py-2 px-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 border transition-all ${
                      paymentMethod === 'UPI'
                        ? 'bg-[#eef8f8] border-[#159A9C] text-[#159A9C] shadow-2xs font-bold'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <QrCode className="w-3.5 h-3.5" />
                    <span>UPI / QR</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('Card')}
                    className={`py-2 px-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 border transition-all ${
                      paymentMethod === 'Card'
                        ? 'bg-[#eef8f8] border-[#159A9C] text-[#159A9C] shadow-2xs font-bold'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <CreditCard className="w-3.5 h-3.5" />
                    <span>Card / POS</span>
                  </button>
                </div>
              </div>

              {/* Total Calculation breakdown */}
              <div className="bg-[#F7FAFC] p-3.5 rounded-xl border border-slate-200 space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Unique Medicines:</span>
                  <span className="font-mono font-bold text-slate-800">{billItems.length} items</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Total Dosage Units:</span>
                  <span className="font-mono font-bold text-slate-800">{totalItemsCount} units</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal:</span>
                  <span className="font-mono font-bold text-slate-800">
                    ₹{grandTotal.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-[11px] text-slate-400">
                  <span>GST / Healthcare Cess:</span>
                  <span>Included (0%)</span>
                </div>
                <div className="flex justify-between items-center text-base font-bold text-[#123B5D] pt-2 border-t border-slate-200">
                  <span>Grand Total:</span>
                  <span className="font-mono text-[#123B5D] text-xl font-black">
                    ₹{grandTotal.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Generate Bill Button */}
              <button
                type="button"
                onClick={handleGenerateBill}
                disabled={billItems.length === 0}
                className="w-full py-3 bg-[#159A9C] hover:bg-[#0f7a7c] disabled:bg-slate-300 disabled:cursor-not-allowed text-white rounded-xl font-bold text-sm shadow-md transition-transform active:scale-98 flex items-center justify-center gap-2"
              >
                <CheckCircle className="w-4.5 h-4.5" />
                <span>Generate Bill & Deduct Stock</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
