import React, { useState } from 'react';
import {
  Users,
  Plus,
  Building2,
  Mail,
  Phone,
  Shield,
  Edit2,
  CheckCircle2,
  X,
  ArrowLeft,
  ArrowRight,
  UserCheck,
  UserX,
  Receipt,
  Eye,
  EyeOff,
  AlertCircle,
  KeyRound,
  Lock,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Staff } from '../../types';
import { FormLabel, PhoneInput, FieldError } from '../common/FormComponents';
import {
  validateRequired,
  validatePhone,
  validateEmail,
  validatePassword,
  validatePasswordMatch,
  sanitizePhoneInput,
} from '../../utils/validation';

export const StaffManagement: React.FC = () => {
  const { staff, branches, invoices, addStaff, updateStaff, showToast } = useApp();

  // Branch workspace selection state (null = show all branches first)
  const [selectedBranchId, setSelectedBranchId] = useState<string | null>(null);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null);

  // Form states matching Requirement 4
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [formBranchId, setFormBranchId] = useState('');
  const [status, setStatus] = useState<'Active' | 'Inactive'>('Active');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);

  const currentBranch = branches.find((b) => b.id === selectedBranchId) || null;

  // Filter staff belonging specifically to the active branch (strict isolation)
  const branchStaff = currentBranch
    ? staff.filter((s) => s.branchId === currentBranch.id)
    : [];

  // Branch-specific invoices
  const branchInvoices = currentBranch
    ? invoices.filter((inv) => inv.branchId === currentBranch.id)
    : [];

  const handleOpenAdd = (defaultBranchId?: string | null) => {
    setEditingStaff(null);
    setName('');
    setUsername('');
    setPassword('');
    setConfirmPassword('');
    setShowPassword(false);
    setFormBranchId(defaultBranchId || currentBranch?.id || branches[0]?.id || 'branch-1');
    setStatus('Active');
    setEmail('');
    setPhone('');
    setErrors({});
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (s: Staff) => {
    setEditingStaff(s);
    setName(s.name);
    setUsername(s.username);
    setPassword(s.password || 'password123');
    setConfirmPassword(s.password || 'password123');
    setShowPassword(false);
    setFormBranchId(s.branchId);
    setStatus(s.status);
    setEmail(s.email || '');
    setPhone(sanitizePhoneInput(s.phone || ''));
    setErrors({});
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleToggleStaffStatus = (s: Staff) => {
    const nextStatus = s.status === 'Active' ? 'Inactive' : 'Active';
    updateStaff(s.id, { status: nextStatus });
    if (showToast) {
      showToast(`${s.name} account is now ${nextStatus === 'Active' ? 'Enabled' : 'Disabled'}.`);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    const newErrors: Record<string, string> = {};

    const trimmedName = name.trim();
    const trimmedUsername = username.trim().toLowerCase();

    const nameErr = validateRequired(trimmedName, 'Staff Name');
    if (nameErr) newErrors.name = nameErr;

    const usernameErr = validateRequired(trimmedUsername, 'Username');
    if (usernameErr) newErrors.username = usernameErr;

    // Check duplicate username if adding new or changing username
    const duplicate = staff.find(
      (s) => s.username.toLowerCase() === trimmedUsername && s.id !== editingStaff?.id
    );
    if (duplicate) {
      newErrors.username = `Username "${trimmedUsername}" is already taken by another staff member.`;
    }

    const passwordErr = validatePassword(password, true, 4);
    if (passwordErr) newErrors.password = passwordErr;

    const confirmErr = validatePasswordMatch(password, confirmPassword);
    if (confirmErr) newErrors.confirmPassword = confirmErr;

    const branchErr = validateRequired(formBranchId, 'Assigned Branch');
    if (branchErr) newErrors.branch = branchErr;

    const phoneErr = validatePhone(phone, false, 'Phone number');
    if (phoneErr) newErrors.phone = phoneErr;

    if (email.trim()) {
      const emailErr = validateEmail(email, false, 'Email address');
      if (emailErr) newErrors.email = emailErr;
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setFormError('Please correct the highlighted fields before submitting.');
      return;
    }

    setErrors({});
    const assignedBranch = branches.find((b) => b.id === formBranchId);
    if (!assignedBranch) {
      setFormError('Please select a valid hospital branch.');
      return;
    }

    if (editingStaff) {
      updateStaff(editingStaff.id, {
        name: trimmedName,
        username: trimmedUsername,
        password,
        branchId: assignedBranch.id,
        branchName: assignedBranch.name,
        email: email.trim() || `${trimmedUsername}@medicare.com`,
        phone: phone.trim(),
        role: 'Billing Staff',
        status,
      });
      if (showToast) showToast(`Billing Staff "${trimmedName}" updated successfully.`);
    } else {
      addStaff({
        name: trimmedName,
        username: trimmedUsername,
        password,
        email: email.trim() || `${trimmedUsername}@medicare.com`,
        phone: phone.trim(),
        branchId: assignedBranch.id,
        branchName: assignedBranch.name,
        role: 'Billing Staff',
        status,
      });
      if (showToast) showToast(`Billing Staff account "${trimmedName}" created for ${assignedBranch.name}.`);
    }
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* ============================================================== */}
      {/* VIEW 1: SELECT BRANCH (SHOW BRANCHES FIRST)                    */}
      {/* ============================================================== */}
      {!currentBranch ? (
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200">
            <div>
              <h2 className="text-xl font-bold text-[#123B5D] tracking-tight flex items-center gap-2">
                <Users className="w-5 h-5 text-[#159A9C]" />
                <span>Staff Management</span>
              </h2>
              <p className="text-xs text-slate-500">
                Manage branch billing workspaces and provision branch-specific counter operators
              </p>
            </div>

            <button
              onClick={() => handleOpenAdd(null)}
              className="px-3.5 py-2 bg-[#159A9C] hover:bg-[#0f7a7c] text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs self-start sm:self-auto cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>+ Add Billing Staff</span>
            </button>
          </div>

          {/* Guide Banner */}
          <div className="p-3.5 bg-[#eef8f8] border border-[#159A9C]/25 rounded-xl text-xs text-[#123B5D] flex items-center gap-2.5">
            <Building2 className="w-4 h-4 text-[#159A9C] shrink-0" />
            <span>
              <strong>Branch-Centric Workspace:</strong> Central Admin manages billing workspaces by branch. Select a branch below to view its assigned billing staff and transactions.
            </span>
          </div>

          {/* Branch Cards Grid (Desktop 3-columns, Responsive Stacking) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {branches.map((b) => {
              const bStaff = staff.filter((s) => s.branchId === b.id);
              const activeCount = bStaff.filter((s) => s.status === 'Active').length;
              const isActive = b.status === 'Active';

              return (
                <div
                  key={b.id}
                  className="bg-white rounded-xl border border-slate-200 shadow-xs hover:shadow-md transition-all flex flex-col justify-between overflow-hidden group"
                >
                  <div className="p-5 space-y-4">
                    {/* Top Identity */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-xl bg-[#eaf2f8] text-[#123B5D] flex items-center justify-center font-bold shrink-0 border border-[#123B5D]/15">
                          <Building2 className="w-5 h-5 text-[#159A9C]" />
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-bold text-[#123B5D] text-sm truncate" title={b.name}>
                            {b.name}
                          </h3>
                          <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                            <span>{b.city}</span>
                            <span>·</span>
                            <span className="font-mono text-[11px] text-slate-400">{b.code}</span>
                          </div>
                        </div>
                      </div>

                      {/* Branch Account Status */}
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
                        />
                        <span>{b.status || 'Active'}</span>
                      </span>
                    </div>

                    {/* Operational Metric: Billing Staff */}
                    <div className="p-3 bg-[#F7FAFC] rounded-lg border border-slate-200/80 grid grid-cols-2 gap-2 text-center">
                      <div>
                        <div className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">
                          Billing Staff
                        </div>
                        <div className="text-base font-bold text-[#123B5D] font-mono mt-0.5">
                          {bStaff.length} {bStaff.length === 1 ? 'Member' : 'Members'}
                        </div>
                      </div>
                      <div className="border-l border-slate-200/80">
                        <div className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">
                          Status
                        </div>
                        <div className="text-xs font-semibold text-[#2E8B70] mt-1 flex items-center justify-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#2E8B70]" />
                          <span>{activeCount} Active</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Card Action: Enter Branch */}
                  <div className="px-5 py-3 bg-[#F7FAFC] border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setSelectedBranchId(b.id)}
                      className="w-full py-2 px-3.5 bg-white hover:bg-[#159A9C] text-[#123B5D] hover:text-white border border-slate-300 hover:border-[#159A9C] rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-2xs cursor-pointer group-hover:border-[#159A9C]/50"
                    >
                      <span>Enter Branch</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* ============================================================== */
        /* VIEW 2: BRANCH BILLING WORKSPACE                               */
        /* ============================================================== */
        <div className="space-y-6">
          {/* Navigation Bar / Breadcrumb */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setSelectedBranchId(null)}
                className="px-2.5 py-1.5 bg-white hover:bg-slate-100 text-[#123B5D] border border-slate-300 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                title="Return to branch selection"
              >
                <ArrowLeft className="w-3.5 h-3.5 text-[#159A9C]" />
                <span>Back to All Branches</span>
              </button>
              <div>
                <h2 className="text-xl font-bold text-[#123B5D] tracking-tight flex items-center gap-2">
                  <span className="uppercase">{currentBranch.name}</span>
                  <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-[#eef8f8] text-[#159A9C] border border-[#159A9C]/30">
                    Billing Workspace
                  </span>
                </h2>
                <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                  <span>{currentBranch.city}</span>
                  <span>·</span>
                  <span className="font-mono text-slate-400">{currentBranch.code}</span>
                  <span>·</span>
                  <span>{currentBranch.address || currentBranch.location}</span>
                </p>
              </div>
            </div>

            <button
              onClick={() => handleOpenAdd(currentBranch.id)}
              className="px-3.5 py-2 bg-[#159A9C] hover:bg-[#0f7a7c] text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs self-start sm:self-auto cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>+ Add Billing Staff</span>
            </button>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-[#eef8f8] text-[#159A9C] flex items-center justify-center font-bold shrink-0">
                <Users className="w-4 h-4" />
              </div>
              <div>
                <div className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">
                  Assigned Staff
                </div>
                <div className="text-lg font-bold text-[#123B5D] font-mono">
                  {branchStaff.length} {branchStaff.length === 1 ? 'Member' : 'Members'}
                </div>
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-[#edf7f4] text-[#2E8B70] flex items-center justify-center font-bold shrink-0">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div>
                <div className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">
                  Active Counters
                </div>
                <div className="text-lg font-bold text-[#2E8B70] font-mono">
                  {branchStaff.filter((s) => s.status === 'Active').length} Active
                </div>
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-[#F7FAFC] text-[#123B5D] flex items-center justify-center font-bold shrink-0 border border-slate-200">
                <Receipt className="w-4 h-4 text-[#159A9C]" />
              </div>
              <div>
                <div className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">
                  Branch Invoices Recorded
                </div>
                <div className="text-lg font-bold text-[#123B5D] font-mono">
                  {branchInvoices.length} Bills
                </div>
              </div>
            </div>
          </div>

          {/* Billing Staff Table (STRICTLY ISOLATED TO THIS BRANCH ONLY) */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="px-5 py-3.5 bg-[#F7FAFC] border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-[#123B5D] text-xs uppercase tracking-wider">
                  Billing Staff — {currentBranch.name}
                </h3>
                <p className="text-[11px] text-slate-500">
                  Staff members assigned to this branch counter. No staff from other branches are listed here.
                </p>
              </div>
              <span className="text-[11px] font-mono text-slate-500">
                {branchStaff.length} Accounts
              </span>
            </div>

            {branchStaff.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs bg-slate-50/50">
                <Users className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="font-semibold text-slate-600">No billing staff assigned to {currentBranch.name} yet.</p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Click "+ Add Billing Staff" to provision a cashier terminal account for this branch.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[11px]">
                      <th className="py-3 px-4 font-semibold">Staff Member</th>
                      <th className="py-3 px-4 font-semibold">Username</th>
                      <th className="py-3 px-4 font-semibold">Assigned Branch</th>
                      <th className="py-3 px-4 font-semibold">Role</th>
                      <th className="py-3 px-4 font-semibold text-center">Status</th>
                      <th className="py-3 px-4 font-semibold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {branchStaff.map((s) => {
                      const isStaffActive = s.status === 'Active';
                      return (
                        <tr key={s.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-full bg-[#eef8f8] text-[#159A9C] flex items-center justify-center font-bold text-xs shrink-0 border border-[#159A9C]/20">
                                {s.name[0]}
                              </div>
                              <div>
                                <div className="font-semibold text-slate-900">{s.name}</div>
                                <div className="text-[11px] text-slate-400">{s.email || `${s.username}@medicare.com`}</div>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4 font-mono font-medium text-slate-600">
                            @{s.username}
                          </td>
                          <td className="py-3 px-4">
                            <span className="font-medium text-[#123B5D]">
                              {currentBranch.name}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-[#eef8f8] text-[#159A9C] border border-[#159A9C]/20">
                              <Shield className="w-3 h-3" />
                              <span>BILLING_STAFF</span>
                            </span>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span
                              className={`text-[11px] font-semibold px-2 py-0.5 rounded-full inline-flex items-center gap-1.5 ${
                                isStaffActive
                                  ? 'bg-[#edf7f4] text-[#2E8B70] border border-[#2E8B70]/20'
                                  : 'bg-rose-50 text-[#D95C5C] border border-[#D95C5C]/20'
                              }`}
                            >
                              <span
                                className={`w-1.5 h-1.5 rounded-full ${
                                  isStaffActive ? 'bg-[#2E8B70]' : 'bg-[#D95C5C]'
                                }`}
                              />
                              <span>{s.status}</span>
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              {/* Edit Button */}
                              <button
                                type="button"
                                onClick={() => handleOpenEdit(s)}
                                className="px-2.5 py-1 text-xs font-semibold text-slate-600 hover:text-[#123B5D] hover:bg-slate-100 rounded-md border border-slate-200 transition-colors flex items-center gap-1 cursor-pointer shadow-2xs"
                                title="Edit Staff Details"
                              >
                                <Edit2 className="w-3 h-3" />
                                <span>Edit</span>
                              </button>

                              {/* Disable / Enable Button */}
                              <button
                                type="button"
                                onClick={() => handleToggleStaffStatus(s)}
                                className={`px-2.5 py-1 text-xs font-semibold rounded-md border transition-colors flex items-center gap-1 cursor-pointer shadow-2xs ${
                                  isStaffActive
                                    ? 'bg-white hover:bg-rose-50 text-slate-600 hover:text-[#D95C5C] border-slate-200 hover:border-rose-200'
                                    : 'bg-white hover:bg-emerald-50 text-slate-600 hover:text-[#2E8B70] border-slate-200 hover:border-emerald-200'
                                }`}
                                title={isStaffActive ? 'Disable account' : 'Enable account'}
                              >
                                {isStaffActive ? (
                                  <>
                                    <UserX className="w-3 h-3 text-[#D95C5C]" />
                                    <span>Disable</span>
                                  </>
                                ) : (
                                  <>
                                    <UserCheck className="w-3 h-3 text-[#2E8B70]" />
                                    <span>Enable</span>
                                  </>
                                )}
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Recent Branch Billing Activity */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="px-5 py-3.5 bg-[#F7FAFC] border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-[#123B5D] text-xs uppercase tracking-wider">
                  Recent Invoices — {currentBranch.name}
                </h3>
                <p className="text-[11px] text-slate-500">
                  Transactions processed by this branch's billing team
                </p>
              </div>
              <span className="text-[11px] font-mono text-slate-500">
                {branchInvoices.length} Bills
              </span>
            </div>

            {branchInvoices.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs bg-slate-50/50">
                <Receipt className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="font-semibold text-slate-600">No invoices generated at this branch counter yet.</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100 text-xs">
                {branchInvoices.slice(0, 5).map((inv) => (
                  <div key={inv.id} className="p-3.5 flex items-center justify-between hover:bg-slate-50">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-[#eaf2f8] text-[#123B5D] flex items-center justify-center font-mono font-bold text-xs shrink-0">
                        #{inv.billNo}
                      </div>
                      <div>
                        <div className="font-semibold text-slate-900">
                          {inv.customerName || 'Walk-in Patient'}
                        </div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-2">
                          <span>Cashier: <strong>{inv.staffName}</strong></span>
                          <span>·</span>
                          <span>{inv.dateTime || inv.date}</span>
                          <span>·</span>
                          <span className="text-[#159A9C] font-medium">{inv.items.length} Medicines</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right font-mono font-bold text-[#123B5D]">
                      ₹{inv.grandTotal.toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL: ADD / EDIT BILLING STAFF (MEETS SPECIFICATION 4 & 5)   */}
      {/* ============================================================== */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-[#0c2942]/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full border border-slate-200 overflow-hidden">
            {/* Header */}
            <div className="px-6 py-4 bg-[#123B5D] text-white flex items-center justify-between border-b border-[#0c2942]">
              <div>
                <h3 className="font-bold text-sm tracking-tight">
                  {editingStaff ? 'Edit Billing Staff Account' : 'Add Billing Staff'}
                </h3>
                <p className="text-[11px] text-slate-300 mt-0.5">
                  Provision branch-isolated counter credentials
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-300 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
                aria-label="Close dialog"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Error banner */}
            {formError && (
              <div className="mx-6 mt-4 p-3 bg-[#faecec] border border-[#D95C5C]/30 text-[#D95C5C] rounded-xl text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <div className="flex-1 font-medium">{formError}</div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs" noValidate>
              {/* Staff Name */}
              <div>
                <FormLabel label="Staff Name" required htmlFor="staff-name" />
                <input
                  id="staff-name"
                  type="text"
                  placeholder="e.g. Arun Kumar"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (errors.name) {
                      setErrors((prev) => {
                        const { name: _, ...rest } = prev;
                        return rest;
                      });
                    }
                    if (formError) setFormError(null);
                  }}
                  className={`w-full px-3 py-2 border rounded-lg text-xs focus:outline-none transition-colors font-medium ${
                    errors.name
                      ? 'border-red-500 bg-red-50/20 focus:ring-2 focus:ring-red-400 focus:border-red-500'
                      : 'border-slate-300 focus:ring-2 focus:ring-[#159A9C] focus:border-[#159A9C] bg-[#F7FAFC]'
                  }`}
                />
                <FieldError error={errors.name} />
              </div>

              {/* Username */}
              <div>
                <FormLabel label="Username" required htmlFor="staff-username" />
                <input
                  id="staff-username"
                  type="text"
                  placeholder="e.g. arun"
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value.toLowerCase().replace(/\s+/g, ''));
                    if (errors.username) {
                      setErrors((prev) => {
                        const { username: _, ...rest } = prev;
                        return rest;
                      });
                    }
                    if (formError) setFormError(null);
                  }}
                  className={`w-full px-3 py-2 border rounded-lg text-xs focus:outline-none transition-colors font-mono ${
                    errors.username
                      ? 'border-red-500 bg-red-50/20 focus:ring-2 focus:ring-red-400 focus:border-red-500'
                      : 'border-slate-300 focus:ring-2 focus:ring-[#159A9C] focus:border-[#159A9C] bg-[#F7FAFC]'
                  }`}
                />
                <FieldError error={errors.username} />
                <p className="text-[10px] text-slate-400 mt-1">
                  Used by staff to sign in at the Billing Staff Portal.
                </p>
              </div>

              {/* Password & Confirm Password Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <FormLabel label="Password" required htmlFor="staff-password" />
                  <div className="relative">
                    <input
                      id="staff-password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        if (errors.password) {
                          setErrors((prev) => {
                            const { password: _, ...rest } = prev;
                            return rest;
                          });
                        }
                        if (formError) setFormError(null);
                      }}
                      className={`w-full pl-3 pr-8 py-2 border rounded-lg text-xs focus:outline-none transition-colors ${
                        errors.password
                          ? 'border-red-500 bg-red-50/20 focus:ring-2 focus:ring-red-400 focus:border-red-500'
                          : 'border-slate-300 focus:ring-2 focus:ring-[#159A9C] focus:border-[#159A9C] bg-[#F7FAFC]'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                  <FieldError error={errors.password} />
                </div>

                <div>
                  <FormLabel label="Confirm Password" required htmlFor="staff-confirm-password" />
                  <input
                    id="staff-confirm-password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      if (errors.confirmPassword) {
                        setErrors((prev) => {
                          const { confirmPassword: _, ...rest } = prev;
                          return rest;
                        });
                      }
                      if (formError) setFormError(null);
                    }}
                    className={`w-full px-3 py-2 border rounded-lg text-xs focus:outline-none transition-colors ${
                      errors.confirmPassword || (confirmPassword && password !== confirmPassword)
                        ? 'border-red-500 bg-red-50/20 focus:ring-2 focus:ring-red-400 focus:border-red-500'
                        : 'border-slate-300 focus:ring-2 focus:ring-[#159A9C] focus:border-[#159A9C] bg-[#F7FAFC]'
                    }`}
                  />
                  <FieldError error={errors.confirmPassword} />
                </div>
              </div>

              {/* Assigned Branch Dropdown (Strictly assigned by Admin) */}
              <div>
                <FormLabel label="Assigned Branch" required htmlFor="staff-branch" />
                <select
                  id="staff-branch"
                  value={formBranchId}
                  onChange={(e) => {
                    setFormBranchId(e.target.value);
                    if (errors.branch) {
                      setErrors((prev) => {
                        const { branch: _, ...rest } = prev;
                        return rest;
                      });
                    }
                    if (formError) setFormError(null);
                  }}
                  className={`w-full px-3 py-2 border rounded-lg text-xs focus:outline-none transition-colors bg-white font-medium cursor-pointer ${
                    errors.branch
                      ? 'border-red-500 bg-red-50/20 focus:ring-2 focus:ring-red-400 focus:border-red-500'
                      : 'border-slate-300 focus:ring-2 focus:ring-[#159A9C] focus:border-[#159A9C]'
                  }`}
                >
                  {branches.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name} ({b.city} · {b.code})
                    </option>
                  ))}
                </select>
                <FieldError error={errors.branch} />
                <p className="text-[10px] text-slate-400 mt-1">
                  Staff member is locked to this branch counter. They cannot switch branches during billing.
                </p>
              </div>

              {/* Status & Optional Contact */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <FormLabel label="Account Status" htmlFor="staff-status" />
                  <select
                    id="staff-status"
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-[#159A9C] focus:border-[#159A9C] focus:outline-none bg-white font-medium cursor-pointer"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Disabled</option>
                  </select>
                </div>

                <div>
                  <FormLabel label="Phone (Optional)" htmlFor="staff-phone" />
                  <PhoneInput
                    id="staff-phone"
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
                    placeholder="9840111223"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#159A9C] hover:bg-[#0f7a7c] text-white rounded-lg font-semibold shadow-xs transition-colors cursor-pointer"
                >
                  {editingStaff ? 'Save Changes' : 'Create Staff Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
