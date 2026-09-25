import React, { useState } from 'react';
import {
  Building2,
  ShieldAlert,
  Layers,
  ArrowRightLeft,
  LogOut,
  ChevronDown,
  UserCheck,
  Check,
  Radio,
  FileText,
  AlertTriangle,
  Lock,
  Shield,
  X,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const HeaderBar: React.FC = () => {
  const {
    session,
    loginAdmin,
    loginStaffMember,
    logout,
    setShowWorkflowModal,
    getLowStockAlerts,
    staff,
    showToast,
    setCurrentAdminTab,
    settings,
  } = useApp();

  const [switcherOpen, setSwitcherOpen] = useState(false);
  const [adminAuthModalOpen, setAdminAuthModalOpen] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);

  const lowStockCount = getLowStockAlerts().length;

  const handleAdminClick = () => {
    setSwitcherOpen(false);
    if (session?.role === 'admin') {
      loginAdmin();
      return;
    }
    // Billing staff attempting to access Admin requires Admin credentials
    setAdminPassword('');
    setAuthError(null);
    setAdminAuthModalOpen(true);
  };

  const handleVerifyAdmin = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminPassword === 'admin123') {
      loginAdmin();
      setAdminAuthModalOpen(false);
      showToast('Admin authorization verified');
    } else {
      setAuthError('Access Denied: Invalid Admin password. Staff cannot access Admin portal.');
    }
  };

  return (
    <header className="bg-[#123B5D] text-white shadow-sm border-b border-[#0c2942] no-print sticky top-0 z-40">
      {/* Sleek single-bar header with standard h-14 (56px) height */}
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between gap-3">
        {/* Left: Branding & Title */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2.5">
            <img
              src="/logo.png"
              alt="MedBill Pro"
              className="w-8 h-8 rounded-lg object-contain bg-white p-0.5 shadow-sm border border-white/20 shrink-0"
            />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-sm sm:text-base tracking-tight text-white leading-none">
                  {settings?.hospitalName ? settings.hospitalName.split(' ')[0] : 'MediCare'}
                </span>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-[#C9A227] border border-[#C9A227]/30 px-1.5 py-0.5 rounded bg-[#C9A227]/10 hidden sm:inline-block">
                  HMS Enterprise
                </span>
              </div>
              <p className="text-[11px] text-slate-300 hidden md:block leading-none mt-0.5 truncate max-w-xs">
                {settings?.tagline || 'Multi-Branch Hospital & Clinic Management'}
              </p>
            </div>
          </div>
        </div>

        {/* Center: System Architecture Indicators (Clean unboxed badges) */}
        <div className="hidden xl:flex items-center gap-5 text-xs text-slate-200 font-medium">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#2E8B70]"></span>
            <span className="text-slate-200">Centralized Admin</span>
          </div>
          <span className="text-slate-400">·</span>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#159A9C]"></span>
            <span className="text-slate-200">Branch Billing</span>
          </div>
          <span className="text-slate-400">·</span>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#D99A24]"></span>
            <span className="text-slate-200">Real-Time Sync</span>
          </div>
        </div>

        {/* Right Controls: Low Stock Alert Badge + Workflow Modal + Role Switcher + Logout */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Low Stock Alert Indicator */}
          {lowStockCount > 0 && (
            <button
              onClick={() => {
                if (session?.role === 'admin') {
                  setCurrentAdminTab('low-stock');
                } else {
                  showToast(`${lowStockCount} items below threshold across hospital branches`);
                }
              }}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#D95C5C]/20 hover:bg-[#D95C5C]/30 text-red-200 border border-[#D95C5C]/40 text-xs font-semibold cursor-pointer transition-colors"
              title={`${lowStockCount} items below threshold. Click to view.`}
            >
              <AlertTriangle className="w-3.5 h-3.5 text-[#D95C5C]" />
              <span className="hidden sm:inline">{lowStockCount} Low Stock</span>
              <span className="sm:hidden font-mono">{lowStockCount}</span>
            </button>
          )}

          {/* Architecture / Workflow button */}
          <button
            onClick={() => setShowWorkflowModal(true)}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-slate-100 hover:text-white text-xs font-medium border border-white/15 transition-colors shadow-2xs"
            title="System Workflow Diagram"
          >
            <Layers className="w-3.5 h-3.5 text-[#159A9C]" />
            <span className="hidden sm:inline">System Flow</span>
          </button>

          {/* Quick Role Switcher Dropdown */}
          <div className="relative">
            <button
              onClick={() => setSwitcherOpen(!switcherOpen)}
              className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 rounded-lg bg-[#159A9C] hover:bg-[#0f7a7c] text-white text-xs font-semibold border border-white/20 transition-colors shadow-xs"
            >
              <ArrowRightLeft className="w-3.5 h-3.5 text-white/90" />
              <span className="max-w-[130px] truncate">
                {session
                  ? session.role === 'admin'
                    ? 'Admin Portal'
                    : `${session.staffName?.split(' ')[0]} (${session.branchName?.split('-')[0]?.trim() || 'Branch'})`
                  : 'Switch Role'}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-white/80" />
            </button>

            {switcherOpen && (
              <div
                className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-2xl border border-slate-200 text-slate-800 p-2 z-50 animate-in fade-in slide-in-from-top-2"
                onClick={() => setSwitcherOpen(false)}
              >
                <div className="text-[11px] font-bold text-slate-400 uppercase px-2 py-1 tracking-wider">
                  Switch Active Role (Demo)
                </div>

                {/* Central Admin */}
                <button
                  onClick={handleAdminClick}
                  className={`w-full text-left p-2 rounded-lg flex items-center justify-between text-xs transition-colors ${
                    session?.role === 'admin'
                      ? 'bg-[#eaf2f8] text-[#123B5D] font-bold border border-[#123B5D]/20'
                      : 'hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-md bg-[#123B5D] text-white flex items-center justify-center text-xs font-bold">
                      A
                    </span>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold">Central Admin Portal</span>
                        {session?.role === 'staff' && (
                          <span title="Password required for billing staff">
                            <Lock className="w-3 h-3 text-[#D99A24]" />
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-slate-500">
                        {session?.role === 'staff' ? 'Protected · Admin login required' : 'All Branches · Full Control'}
                      </div>
                    </div>
                  </div>
                  {session?.role === 'admin' ? (
                    <Check className="w-4 h-4 text-[#159A9C]" />
                  ) : (
                    <span className="text-[10px] text-[#D99A24] font-semibold bg-[#fdf6e9] px-1.5 py-0.5 rounded border border-[#D99A24]/30">
                      Locked
                    </span>
                  )}
                </button>

                <div className="h-px bg-slate-100 my-1" />
                <div className="text-[11px] font-bold text-slate-400 uppercase px-2 py-1 tracking-wider">
                  {session?.role === 'admin' ? 'Switch Branch Terminal' : 'Your Assigned Counter'}
                </div>

                {staff
                  .filter((s) => s.role === 'Billing Staff')
                  .map((s) => {
                    const isCurrent = session?.staffId === s.id;
                    return (
                      <button
                        key={s.id}
                        disabled={session?.role === 'staff' && !isCurrent}
                        onClick={() => {
                          if (session?.role === 'admin' || isCurrent) {
                            loginStaffMember(s.id);
                          } else {
                            showToast('Staff can only operate their assigned branch terminal.');
                          }
                        }}
                        className={`w-full text-left p-2 rounded-lg flex items-center justify-between text-xs transition-colors ${
                          isCurrent
                            ? 'bg-[#edf7f4] text-[#2E8B70] font-bold border border-[#2E8B70]/20'
                            : session?.role === 'staff'
                            ? 'opacity-50 cursor-not-allowed hover:bg-transparent text-slate-400'
                            : 'hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-md bg-[#159A9C] text-white flex items-center justify-center text-xs font-bold">
                            {s.name[0]}
                          </span>
                          <div>
                            <div className="font-semibold text-slate-800">{s.name}</div>
                            <div className="text-[10px] text-slate-500">{s.branchName}</div>
                          </div>
                        </div>
                        {isCurrent ? (
                          <span className="text-[10px] bg-[#edf7f4] text-[#2E8B70] font-bold px-1.5 py-0.5 rounded border border-[#2E8B70]/30">
                            Active
                          </span>
                        ) : session?.role === 'staff' ? (
                          <span className="text-[9px] text-slate-400">Locked</span>
                        ) : null}
                      </button>
                    );
                  })}
              </div>
            )}
          </div>

          {/* Active User / Logout */}
          {session ? (
            <button
              onClick={logout}
              className="p-1.5 rounded-lg bg-white/10 hover:bg-[#D95C5C] text-slate-200 hover:text-white transition-colors"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          ) : null}
        </div>
      </div>

      {/* Admin Verification Modal for Billing Staff */}
      {adminAuthModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0c2942]/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-sm w-full shadow-2xl border border-slate-200 text-slate-900 p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                <div className="w-8 h-8 rounded-lg bg-[#fdf6e9] text-[#D99A24] flex items-center justify-center">
                  <Lock className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#123B5D]">Admin Privileges Required</h3>
                  <p className="text-[11px] text-slate-500 font-normal">
                    Billing staff cannot access Admin-only pages
                  </p>
                </div>
              </div>
              <button
                onClick={() => setAdminAuthModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              You are currently logged in as <strong className="text-slate-800">{session?.staffName}</strong> ({session?.branchName}). Central Admin Portal contains privileged management pages, consolidated audit logs, and stock replenishment tools.
            </p>

            <form onSubmit={handleVerifyAdmin} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Central Admin Password
                </label>
                <input
                  type="password"
                  required
                  autoFocus
                  value={adminPassword}
                  onChange={(e) => {
                    setAdminPassword(e.target.value);
                    setAuthError(null);
                  }}
                  placeholder="Enter admin password (admin123)"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#159A9C] focus:border-[#159A9C]"
                />
              </div>

              {authError && (
                <div className="p-2.5 bg-[#faecec] border border-[#D95C5C]/30 text-[#D95C5C] rounded-lg text-xs flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 shrink-0" />
                  <span>{authError}</span>
                </div>
              )}

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setAdminAuthModalOpen(false)}
                  className="flex-1 py-2 px-3 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-semibold"
                >
                  Stay in Branch POS
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 px-3 rounded-lg bg-[#159A9C] hover:bg-[#0f7a7c] text-white text-xs font-bold shadow-sm transition-colors"
                >
                  Verify Admin
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </header>
  );
};
