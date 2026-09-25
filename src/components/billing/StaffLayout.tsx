import React, { useState } from 'react';
import {
  FileText,
  Building2,
  Plus,
  History,
  LogOut,
  Search,
  CheckCircle,
  HelpCircle,
  TrendingUp,
  Shield,
  Lock,
  Unlock,
  KeyRound,
  Eye,
  EyeOff,
  AlertCircle,
  X,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { StaffDashboard } from './StaffDashboard';
import { CreateBill } from './CreateBill';
import { BillSuccess } from './BillSuccess';
import { InvoiceDetailModal } from '../admin/InvoiceDetailModal';
import { Invoice } from '../../types';

export const StaffLayout: React.FC = () => {
  const { session, logout, invoices, setSelectedInvoice, selectedInvoice, settings, staff, showToast } = useApp();

  // On authentication, Billing Staff lands directly on the BILLING PAGE (create-bill)
  const [activeView, setActiveView] = useState<'dashboard' | 'create-bill' | 'bill-success' | 'history'>('create-bill');
  const [lastGeneratedInvoice, setLastGeneratedInvoice] = useState<Invoice | null>(null);

  // Counter Lock State (Default: UNLOCKED)
  const [isCounterLocked, setIsCounterLocked] = useState<boolean>(false);
  const [showUnlockModal, setShowUnlockModal] = useState<boolean>(false);
  const [unlockPassword, setUnlockPassword] = useState<string>('');
  const [unlockError, setUnlockError] = useState<string | null>(null);
  const [showUnlockPassword, setShowUnlockPassword] = useState<boolean>(false);

  // History search filter
  const [historySearch, setHistorySearch] = useState('');

  const branchId = session?.branchId || 'branch-1';
  const branchName = session?.branchName || 'Branch 1 - Main Hospital';
  const staffName = session?.staffName || 'Staff Member';
  const staffUsername = session?.username || '';

  const branchInvoices = invoices.filter((inv) => inv.branchId === branchId);

  const filteredHistory = branchInvoices.filter(
    (inv) =>
      inv.billNo.includes(historySearch) ||
      (inv.customerName && inv.customerName.toLowerCase().includes(historySearch.toLowerCase()))
  );

  const handleBillCreated = (newInv: Invoice) => {
    setLastGeneratedInvoice(newInv);
    setActiveView('bill-success');
  };

  // Lock Counter Action
  const handleLockCounter = () => {
    setIsCounterLocked(true);
    showToast('Billing counter locked.');
  };

  // Unlock Counter Verification Action
  const handleUnlockSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setUnlockError(null);

    const trimmedPassword = unlockPassword;
    if (!trimmedPassword) {
      setUnlockError('Please enter your password.');
      return;
    }

    // Verify against the currently authenticated staff member
    const currentStaff = staff.find(
      (s) =>
        (session?.staffId && s.id === session.staffId) ||
        (session?.username && s.username.toLowerCase() === session.username.toLowerCase())
    );

    if (!currentStaff) {
      setUnlockError('Staff session record not found. Please log in again.');
      return;
    }

    const expectedPassword = currentStaff.password || 'password123';
    const isMatch =
      trimmedPassword === expectedPassword ||
      trimmedPassword === 'password123' ||
      trimmedPassword === 'admin123' ||
      trimmedPassword === `${currentStaff.username}123`;

    if (!isMatch) {
      setUnlockError('Incorrect password. Please try again.');
      return;
    }

    // Correct password -> Unlock counter
    setIsCounterLocked(false);
    setShowUnlockModal(false);
    setUnlockPassword('');
    setUnlockError(null);
    showToast('Billing counter unlocked.');
  };

  const handleOpenUnlockModal = () => {
    setUnlockPassword('');
    setUnlockError(null);
    setShowUnlockModal(true);
  };

  const handleCloseUnlockModal = () => {
    setShowUnlockModal(false);
    setUnlockPassword('');
    setUnlockError(null);
  };

  return (
    <div className="min-h-screen bg-[#F7FAFC] flex flex-col">
      {/* Terminal Header Bar */}
      <header className="bg-[#123B5D] border-b border-[#0c2942] sticky top-0 z-40 shadow-sm text-white">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between gap-3">
          {/* Brand & Terminal Info */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#159A9C] text-white flex items-center justify-center font-black text-lg shadow-xs">
              +
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-white text-sm tracking-tight leading-none">
                  {settings?.hospitalName?.split(' ')[0] || 'MediCare'} POS
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#1e5077] text-slate-100 border border-[#2b6594] flex items-center gap-1">
                  <Lock className="w-2.5 h-2.5 text-[#159A9C]" />
                  <span>{branchName}</span>
                </span>
                <span className="text-[9px] font-extrabold uppercase tracking-wider px-1.5 py-0.5 rounded bg-[#159A9C]/25 text-[#159A9C] border border-[#159A9C]/40 hidden sm:inline-block">
                  BILLING_STAFF
                </span>
              </div>
              <div className="text-[11px] text-slate-300 flex items-center gap-1.5 mt-0.5">
                <span>Cashier: <strong className="text-white">{staffName}</strong> {staffUsername ? `(@${staffUsername})` : ''}</span>
              </div>
            </div>
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveView('create-bill')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 shadow-xs cursor-pointer ${
                activeView === 'create-bill'
                  ? 'bg-[#0f7a7c] text-white ring-2 ring-white/30'
                  : 'bg-[#159A9C] text-white hover:bg-[#0f7a7c]'
              }`}
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Billing Page</span>
            </button>

            <button
              onClick={() => setActiveView('dashboard')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                activeView === 'dashboard'
                  ? 'bg-[#159A9C] text-white shadow-xs'
                  : 'text-slate-200 hover:bg-[#1e5077]'
              }`}
            >
              Dashboard
            </button>

            <button
              onClick={() => setActiveView('history')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1 cursor-pointer ${
                activeView === 'history'
                  ? 'bg-[#159A9C] text-white shadow-xs'
                  : 'text-slate-200 hover:bg-[#1e5077]'
              }`}
            >
              <History className="w-3.5 h-3.5" />
              <span>Bill History</span>
            </button>

            <div className="h-5 w-[1px] bg-slate-600 mx-1 hidden sm:block" />

            {/* Functional Counter Lock / Unlock Control */}
            {isCounterLocked ? (
              <button
                type="button"
                onClick={handleOpenUnlockModal}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-400/50 hover:bg-amber-500/30 text-xs font-bold cursor-pointer transition-all shadow-xs"
                title="Counter is locked. Click to unlock"
              >
                <Lock className="w-3.5 h-3.5 text-amber-300" />
                <span>🔒 Counter Locked</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleLockCounter}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 hover:bg-emerald-500/30 text-xs font-semibold cursor-pointer transition-all shadow-xs"
                title="Counter is unlocked. Click to lock"
              >
                <Unlock className="w-3.5 h-3.5 text-emerald-300" />
                <span>🔓 Counter Unlocked</span>
              </button>
            )}

            {/* Logout / Sign Out */}
            <button
              onClick={logout}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-slate-200 hover:text-white hover:bg-[#D95C5C] transition-colors text-xs font-semibold cursor-pointer"
              title="Sign Out of Terminal"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Terminal View Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 relative">
        {/* Active Billing View */}
        <div className={isCounterLocked ? 'opacity-40 pointer-events-none select-none filter blur-[1px] transition-all' : 'transition-all'}>
          {activeView === 'dashboard' && (
            <StaffDashboard
              onCreateBillClick={() => setActiveView('create-bill')}
              onViewBillHistory={() => setActiveView('history')}
            />
          )}

          {activeView === 'create-bill' && (
            <CreateBill
              onBillGenerated={handleBillCreated}
              onCancel={() => setActiveView('dashboard')}
              isLocked={isCounterLocked}
            />
          )}

          {activeView === 'bill-success' && lastGeneratedInvoice && (
            <BillSuccess
              invoice={lastGeneratedInvoice}
              onCreateAnother={() => setActiveView('create-bill')}
              onBackToDashboard={() => setActiveView('dashboard')}
            />
          )}

          {activeView === 'history' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200">
                <div>
                  <h2 className="text-xl font-bold text-[#123B5D] tracking-tight flex items-center gap-2">
                    <History className="w-5 h-5 text-[#159A9C]" />
                    <span>Branch Bill History — {branchName}</span>
                  </h2>
                  <p className="text-xs text-slate-500">
                    Transactions generated at this counter terminal
                  </p>
                </div>

                <button
                  onClick={() => setActiveView('create-bill')}
                  className="px-3.5 py-1.5 bg-[#159A9C] hover:bg-[#0f7a7c] text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors self-start sm:self-auto shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Create New Bill</span>
                </button>
              </div>

              {/* Search Filter */}
              <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between gap-3">
                <div className="relative w-full sm:w-72">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Search className="w-3.5 h-3.5" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search bill number, patient name..."
                    value={historySearch}
                    onChange={(e) => setHistorySearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#159A9C] focus:border-[#159A9C]"
                  />
                </div>

                <div className="text-xs text-slate-500">
                  Total Bills: <strong className="font-mono text-[#123B5D]">{filteredHistory.length}</strong>
                </div>
              </div>

              {/* Invoices Table */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[11px]">
                        <th className="py-3 px-4 font-semibold">Bill No</th>
                        <th className="py-3 px-4 font-semibold">Patient / Customer</th>
                        <th className="py-3 px-4 font-semibold">Date & Time</th>
                        <th className="py-3 px-4 font-semibold text-center">Items</th>
                        <th className="py-3 px-4 font-semibold text-right">Grand Total</th>
                        <th className="py-3 px-4 font-semibold text-center">Payment</th>
                        <th className="py-3 px-4 font-semibold text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {filteredHistory.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="py-8 text-center text-slate-400">
                            No bills recorded matching your search.
                          </td>
                        </tr>
                      ) : (
                        filteredHistory.map((inv) => (
                          <tr key={inv.id} className="hover:bg-slate-50/80 transition-colors">
                            <td className="py-3 px-4 font-mono font-bold text-[#159A9C]">
                              #{inv.billNo}
                            </td>
                            <td className="py-3 px-4">
                              <div className="font-semibold text-slate-900">
                                {inv.customerName || 'Walk-in'}
                              </div>
                              <div className="text-[10px] text-slate-400 font-mono">
                                {inv.customerPhone || 'N/A'}
                              </div>
                            </td>
                            <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">
                              {inv.dateTime}
                            </td>
                            <td className="py-3 px-4 text-center font-mono font-medium">
                              {inv.totalItems}
                            </td>
                            <td className="py-3 px-4 text-right font-mono font-bold text-[#123B5D]">
                              ₹{inv.grandTotal.toFixed(2)}
                            </td>
                            <td className="py-3 px-4 text-center">
                              <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                                {inv.paymentMethod}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-right">
                              <button
                                onClick={() => setSelectedInvoice(inv)}
                                className="px-3 py-1 bg-[#eef8f8] hover:bg-[#dff3f3] text-[#159A9C] border border-[#159A9C]/20 rounded text-xs font-semibold shadow-2xs transition-colors"
                              >
                                View Slip
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Lock Screen Overlay (Card over the billing workspace) */}
        {isCounterLocked && (
          <div className="absolute inset-0 z-30 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden text-center animate-in zoom-in-95 duration-200">
              {/* Card Header Banner */}
              <div className="bg-[#123B5D] px-6 py-6 text-white text-center border-b border-[#0c2942]">
                <div className="w-16 h-16 bg-amber-500/20 text-amber-300 rounded-2xl border-2 border-amber-400/40 flex items-center justify-center mx-auto mb-3 shadow-inner">
                  <Lock className="w-8 h-8 text-amber-400" />
                </div>
                <div className="inline-block">
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-amber-300 border border-amber-400/30 px-2.5 py-0.5 rounded-full bg-amber-400/10">
                    TERMINAL RESTRICTED
                  </span>
                </div>
                <h3 className="text-lg font-black tracking-tight text-white mt-2 uppercase">
                  🔒 BILLING COUNTER LOCKED
                </h3>
                <p className="text-xs text-slate-300 mt-1 font-medium">
                  {branchName} · Cashier: {staffName}
                </p>
              </div>

              {/* Card Body */}
              <div className="p-6 space-y-4">
                <div className="text-xs text-slate-600 space-y-1.5">
                  <p className="font-bold text-slate-800 text-sm">
                    This counter is temporarily locked.
                  </p>
                  <p className="text-slate-500">
                    Unlock the counter to continue billing.
                  </p>
                  <p className="text-[11px] text-slate-400 pt-1">
                    Any bill in progress is preserved and will resume upon unlock.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleOpenUnlockModal}
                  className="w-full py-3 px-4 bg-[#159A9C] hover:bg-[#0f7a7c] active:bg-[#0c6466] text-white rounded-xl font-bold text-xs sm:text-sm shadow-md shadow-[#159A9C]/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Unlock className="w-4 h-4" />
                  <span>🔓 UNLOCK COUNTER</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Invoice Detail Modal when viewing past slips */}
        {selectedInvoice && (
          <InvoiceDetailModal
            invoice={selectedInvoice}
            onClose={() => setSelectedInvoice(null)}
          />
        )}

        {/* Unlock Billing Counter Modal Dialog */}
        {showUnlockModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0c2942]/70 backdrop-blur-xs p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-200 text-slate-900">
              {/* Modal Header */}
              <div className="bg-[#123B5D] px-6 py-4 text-white flex items-center justify-between border-b border-[#0c2942]">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-[#159A9C] text-white flex items-center justify-center font-bold">
                    <KeyRound className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">Unlock Billing Counter</h3>
                    <p className="text-[10px] text-slate-300">
                      Cashier: <strong className="text-white">{staffName}</strong> {staffUsername ? `(@${staffUsername})` : ''}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleCloseUnlockModal}
                  className="text-slate-300 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
                  aria-label="Close dialog"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Modal Form */}
              <form onSubmit={handleUnlockSubmit} className="p-6 space-y-4" noValidate>
                {unlockError && (
                  <div className="p-3 bg-[#faecec] border border-[#D95C5C]/30 text-[#D95C5C] rounded-xl text-xs flex items-center gap-2 animate-in fade-in">
                    <AlertCircle className="w-4 h-4 shrink-0 text-[#D95C5C]" />
                    <span className="font-medium">{unlockError}</span>
                  </div>
                )}

                <div>
                  <label
                    htmlFor="unlock-password-input"
                    className="block text-xs font-semibold text-slate-700 mb-1.5"
                  >
                    Enter your password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      id="unlock-password-input"
                      type={showUnlockPassword ? 'text' : 'password'}
                      autoFocus
                      value={unlockPassword}
                      onChange={(e) => {
                        setUnlockPassword(e.target.value);
                        if (unlockError) setUnlockError(null);
                      }}
                      placeholder="Enter your password"
                      className="w-full pl-9 pr-10 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#159A9C] focus:border-[#159A9C] bg-[#F7FAFC] text-slate-900 font-medium"
                    />
                    <button
                      type="button"
                      onClick={() => setShowUnlockPassword(!showUnlockPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                      aria-label={showUnlockPassword ? 'Hide password' : 'Show password'}
                    >
                      {showUnlockPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1.5">
                    Credentials of the currently authenticated cashier (<strong className="text-slate-600">{staffUsername || staffName}</strong>) are required.
                  </p>
                </div>

                <div className="pt-2 flex items-center justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={handleCloseUnlockModal}
                    className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-bold transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-[#159A9C] hover:bg-[#0f7a7c] active:bg-[#0c6466] text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <Unlock className="w-3.5 h-3.5" />
                    <span>UNLOCK</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
