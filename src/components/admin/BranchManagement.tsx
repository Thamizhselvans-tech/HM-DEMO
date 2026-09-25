import React, { useState } from 'react';
import {
  Building2,
  Plus,
  MapPin,
  Phone,
  Edit,
  ArrowRight,
  AlertTriangle,
  X,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Branch } from '../../types';
import { FormLabel, PhoneInput, FieldError } from '../common/FormComponents';
import {
  validateRequired,
  validatePhone,
  sanitizePhoneInput,
} from '../../utils/validation';

export const BranchManagement: React.FC = () => {
  const {
    branches,
    addBranch,
    updateBranch,
    setCurrentAdminTab,
    invoices,
    getStockForBranch,
    setSelectedStockBranchId,
    showToast,
  } = useApp();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);

  // Form fields for Edit Branch (Name, Code, Address, Phone, Status)
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [city, setCity] = useState('');
  const [location, setLocation] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [status, setStatus] = useState<'Active' | 'Inactive'>('Active');
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Dynamic invoices beyond initial baseline
  const newInvoices = invoices.filter(
    (inv) => !['inv-1001', 'inv-1002', 'inv-1003', 'inv-1004', 'inv-1005'].includes(inv.id)
  );

  const getBranchMetrics = (b: Branch, index: number) => {
    // Base simulation stats matching AdminDashboard & DailyTransactions
    const baseBills = index === 0 ? 45 : index === 1 ? 51 : index === 2 ? 32 : 0;
    const baseSales = index === 0 ? 32500 : index === 1 ? 28400 : index === 2 ? 24700 : 0;

    // Actual billing transactions today
    const bInvoices = newInvoices.filter((inv) => inv.branchId === b.id);
    const todayBills = baseBills + bInvoices.length;
    const todaySales = baseSales + bInvoices.reduce((sum, inv) => sum + inv.grandTotal, 0);

    // Real branch stock catalog items and low-stock count
    const stockItems = getStockForBranch(b.id);
    const stockProductCount = b.productCount || stockItems.length || 120;
    const lowStockCount = stockItems.filter((item) => item.status === 'Low').length;

    return {
      todayBills,
      todaySales,
      stockProductCount,
      lowStockCount,
    };
  };

  const handleOpenAdd = () => {
    setName('');
    setCode(`B${branches.length + 1}-EXT`);
    setCity('');
    setLocation('');
    setAddress('');
    setPhone('');
    setStatus('Active');
    setErrors({});
    setEditingBranch(null);
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (b: Branch) => {
    setEditingBranch(b);
    setName(b.name);
    setCode(b.code);
    setCity(b.city);
    setLocation(b.location);
    setAddress(b.address);
    setPhone(sanitizePhoneInput(b.phone || ''));
    setStatus(b.status || 'Active');
    setErrors({});
    setIsAddModalOpen(true);
  };

  const handleViewBranchStock = (branchId: string) => {
    if (setSelectedStockBranchId) {
      setSelectedStockBranchId(branchId);
    }
    setCurrentAdminTab('branch-stock');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    const nameErr = validateRequired(name, 'Branch Name');
    if (nameErr) newErrors.name = nameErr;

    const cityErr = validateRequired(city, 'City');
    if (cityErr) newErrors.city = cityErr;

    // Phone validation (Optional field, but if entered, must be strictly 10 digits!)
    const phoneErr = validatePhone(phone, false, 'Phone number');
    if (phoneErr) newErrors.phone = phoneErr;

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    if (editingBranch) {
      updateBranch(editingBranch.id, {
        name: name.trim(),
        code: code.trim(),
        city: city.trim(),
        location: location.trim(),
        address: address.trim(),
        phone: phone.trim(),
        status,
      });
      if (showToast) showToast(`Branch "${name.trim()}" updated successfully.`);
    } else {
      addBranch({
        name: name.trim(),
        code: code.trim() || `B${branches.length + 1}`,
        city: city.trim(),
        location: location.trim() || city.trim(),
        address: address.trim(),
        phone: phone.trim(),
        status,
      });
      if (showToast) showToast(`Branch "${name.trim()}" created successfully.`);
    }
    setIsAddModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200">
        <div>
          <h2 className="text-xl font-bold text-[#123B5D] tracking-tight flex items-center gap-2">
            <Building2 className="w-5 h-5 text-[#159A9C]" />
            <span>Branches Management</span>
          </h2>
          <p className="text-xs text-slate-500">
            Configure hospital branches, clinics, pharmacy counters & regional stock centers
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="px-3.5 py-2 bg-[#159A9C] hover:bg-[#0f7a7c] text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>+ Add Branch</span>
        </button>
      </div>

      {/* Branch Cards Grid - Responsive 3-column layout on desktop, stacking on mobile */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {branches.map((b, index) => {
          const { todayBills, todaySales, stockProductCount, lowStockCount } = getBranchMetrics(
            b,
            index
          );
          const isActive = b.status === 'Active';

          return (
            <div
              key={b.id}
              className="bg-white rounded-xl border border-slate-200/90 shadow-xs hover:shadow-md transition-shadow overflow-hidden flex flex-col justify-between"
            >
              <div>
                {/* Card Header: Branch icon, Branch Name, Location · Branch Code, Active status */}
                <div className="p-4 border-b border-slate-100 flex items-start justify-between gap-2.5 bg-[#F7FAFC]">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-10 h-10 rounded-lg bg-[#eaf2f8] text-[#123B5D] flex items-center justify-center font-bold text-sm border border-[#123B5D]/20 shrink-0">
                      <Building2 className="w-5 h-5 text-[#159A9C]" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-bold text-[#123B5D] text-sm truncate" title={b.name}>
                        {b.name}
                      </h3>
                      <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                        <span className="truncate">{b.city}</span>
                        <span>·</span>
                        <span className="font-mono text-[11px] text-slate-400 shrink-0">{b.code}</span>
                      </div>
                    </div>
                  </div>
                  <span
                    className={`text-[11px] font-semibold px-2 py-0.5 rounded-full shrink-0 flex items-center gap-1.5 ${
                      isActive
                        ? 'bg-[#edf7f4] text-[#2E8B70] border border-[#2E8B70]/30'
                        : 'bg-slate-100 text-slate-500 border border-slate-300'
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        isActive ? 'bg-[#2E8B70]' : 'bg-slate-400'
                      }`}
                    ></span>
                    <span>{b.status}</span>
                  </span>
                </div>

                {/* Card Body: Address, Phone, Operational Metrics, Stock Status */}
                <div className="p-4 space-y-3.5 text-xs">
                  {/* Contact Information */}
                  <div className="space-y-1.5 text-slate-600">
                    <div className="flex items-start gap-2">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                      <span className="line-clamp-2">{b.address || `${b.location}, ${b.city}`}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="font-mono text-[11px] text-slate-700">{b.phone}</span>
                    </div>
                  </div>

                  {/* Operational Metrics: Stock & Today's Billing */}
                  <div className="grid grid-cols-2 gap-2.5 pt-3 border-t border-slate-100">
                    <div className="bg-[#F7FAFC] p-2.5 rounded-lg border border-slate-200/80 text-center">
                      <div className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">
                        Stock
                      </div>
                      <div className="text-sm font-bold text-[#123B5D] font-mono mt-0.5">
                        {stockProductCount} Products
                      </div>
                    </div>
                    <div className="bg-[#F7FAFC] p-2.5 rounded-lg border border-slate-200/80 text-center">
                      <div className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">
                        Today's Billing
                      </div>
                      <div className="text-sm font-bold text-[#123B5D] font-mono mt-0.5">
                        {todayBills} Bills
                      </div>
                      <div className="text-[10px] font-bold text-[#159A9C] font-mono mt-0.5">
                        ₹{todaySales.toLocaleString('en-IN')}
                      </div>
                    </div>
                  </div>

                  {/* Stock Status Indicator */}
                  <div className="flex items-center justify-between pt-2.5 pb-0.5 border-t border-slate-100 text-xs">
                    <span className="text-slate-500 font-medium">Stock Status:</span>
                    {lowStockCount > 0 ? (
                      <span className="inline-flex items-center gap-1.5 font-bold text-[11px] text-[#D95C5C] bg-[#faecec] px-2.5 py-0.5 rounded-full border border-[#D95C5C]/30">
                        <AlertTriangle className="w-3 h-3 text-[#D95C5C] shrink-0" />
                        <span>{lowStockCount} Low Stock Item{lowStockCount === 1 ? '' : 's'}</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 font-semibold text-[11px] text-[#2E8B70] bg-[#edf7f4] px-2.5 py-0.5 rounded-full border border-[#2E8B70]/30">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#2E8B70]"></span>
                        <span>Normal</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Card Footer: View Branch Stock & Edit Branch */}
              <div className="px-4 py-2.5 bg-[#F7FAFC] border-t border-slate-100 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => handleViewBranchStock(b.id)}
                  className="text-xs font-semibold text-[#159A9C] hover:text-[#0f7a7c] flex items-center gap-1.5 transition-colors cursor-pointer group py-1"
                >
                  <span>View Branch Stock</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </button>
                <button
                  type="button"
                  onClick={() => handleOpenEdit(b)}
                  className="px-2.5 py-1 text-xs font-semibold text-slate-600 hover:text-[#123B5D] hover:bg-slate-200/60 rounded-md border border-slate-200 transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
                  title="Edit Branch Information"
                >
                  <Edit className="w-3 h-3" />
                  <span>Edit Branch</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Branch Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-[#0c2942]/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 bg-[#123B5D] text-white flex items-center justify-between">
              <h3 className="font-bold text-sm">
                {editingBranch ? 'Edit Hospital Branch' : 'Add New Hospital Branch'}
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-300 hover:text-white p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs" noValidate>
              <div>
                <FormLabel label="Branch Name" required htmlFor="branch-name" />
                <input
                  id="branch-name"
                  type="text"
                  placeholder="e.g. Branch 4 - Specialty Clinic"
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

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <FormLabel label="Branch Code" htmlFor="branch-code" />
                  <input
                    id="branch-code"
                    type="text"
                    placeholder="e.g. B4-CLINIC"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-[#159A9C] focus:border-[#159A9C] focus:outline-none uppercase"
                  />
                </div>
                <div>
                  <FormLabel label="City" required htmlFor="branch-city" />
                  <input
                    id="branch-city"
                    type="text"
                    placeholder="e.g. Madurai"
                    value={city}
                    onChange={(e) => {
                      setCity(e.target.value);
                      if (errors.city) {
                        setErrors((prev) => {
                          const { city: _, ...rest } = prev;
                          return rest;
                        });
                      }
                    }}
                    className={`w-full px-3 py-2 border rounded-lg text-xs focus:outline-none transition-colors ${
                      errors.city
                        ? 'border-red-500 bg-red-50/20 focus:ring-2 focus:ring-red-400 focus:border-red-500'
                        : 'border-slate-300 focus:ring-2 focus:ring-[#159A9C] focus:border-[#159A9C]'
                    }`}
                  />
                  <FieldError error={errors.city} />
                </div>
              </div>

              <div>
                <FormLabel label="Location Area" htmlFor="branch-location" />
                <input
                  id="branch-location"
                  type="text"
                  placeholder="e.g. Anna Nagar East"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-[#159A9C] focus:border-[#159A9C] focus:outline-none"
                />
              </div>

              <div>
                <FormLabel label="Full Postal Address" htmlFor="branch-address" />
                <textarea
                  id="branch-address"
                  rows={2}
                  placeholder="Address details..."
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-[#159A9C] focus:border-[#159A9C] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <FormLabel label="Phone Number" htmlFor="branch-phone" />
                  <PhoneInput
                    id="branch-phone"
                    value={phone}
                    onChange={(val) => {
                      setPhone(val);
                      if (errors.phone) {
                        setErrors((prev) => {
                          const { phone: _, ...rest } = prev;
                          return rest;
                        });
                      }
                    }}
                    error={errors.phone}
                    placeholder="9876545210"
                  />
                </div>
                <div>
                  <FormLabel label="Branch Status" htmlFor="branch-status" />
                  <select
                    id="branch-status"
                    value={status}
                    onChange={(e) => setStatus(e.target.value as 'Active' | 'Inactive')}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-[#159A9C] focus:border-[#159A9C] focus:outline-none bg-white font-medium"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#159A9C] hover:bg-[#0f7a7c] text-white rounded-lg font-semibold shadow-xs transition-colors cursor-pointer"
                >
                  {editingBranch ? 'Save Changes' : 'Create Branch'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
