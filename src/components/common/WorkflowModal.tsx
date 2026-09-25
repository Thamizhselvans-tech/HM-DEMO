import React from 'react';
import {
  X,
  Layers,
  ShieldCheck,
  Building2,
  Users,
  ShoppingCart,
  TrendingDown,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ArrowRight,
  Database,
  Printer,
  Sparkles,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const WorkflowModal: React.FC = () => {
  const { showWorkflowModal, setShowWorkflowModal, branches, getLowStockAlerts, invoices } = useApp();

  if (!showWorkflowModal) return null;

  const lowStockCount = getLowStockAlerts().length;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full border border-slate-200 overflow-hidden my-6 max-h-[92vh] flex flex-col">
        {/* Modal Header */}
        <div className="bg-[#123B5D] text-white px-6 py-4 flex items-center justify-between border-b border-[#0c2942]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#1e5077] border border-[#C9A227]/40 flex items-center justify-center font-bold text-[#C9A227]">
              +
            </div>
            <div>
              <h2 className="text-lg font-bold">System Architecture & Workflow Diagram</h2>
              <p className="text-xs text-slate-300">
                Multi-Branch Hospital / Clinic Billing & Stock Management System (Client Architecture)
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowWorkflowModal(false)}
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm">
          {/* Section 1: System Overview */}
          <div className="bg-[#F7FAFC] border border-slate-200 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-200">
              <span className="bg-[#123B5D] text-white text-xs font-bold px-2 py-0.5 rounded">1</span>
              <h3 className="font-bold text-[#123B5D] text-base">SYSTEM OVERVIEW</h3>
              <span className="text-xs text-slate-500 ml-auto">Real-time centralized sync</span>
            </div>

            <div className="flex flex-col items-center gap-4">
              {/* Central Admin Box */}
              <div className="bg-white border-2 border-[#123B5D] rounded-xl p-3 text-center w-72 shadow-sm">
                <div className="w-10 h-10 bg-[#123B5D] text-white rounded-full flex items-center justify-center mx-auto mb-1">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div className="font-bold text-[#123B5D] text-sm">Central Admin Portal</div>
                <div className="text-xs text-[#159A9C] font-semibold">Headquarters Management</div>
                <div className="text-[11px] text-slate-500 mt-1">Full Stock, Reports, Staff & Multi-Branch Control</div>
              </div>

              {/* Connecting arrows */}
              <div className="text-xs text-[#159A9C] font-semibold flex items-center gap-2">
                <span>↓ All data (Bills, Stock, Reports) sync to Admin</span>
              </div>

              {/* Branches Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
                {branches.map((b, idx) => (
                  <div key={b.id} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm relative">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 rounded-lg bg-[#eef8f8] text-[#159A9C] border border-[#159A9C]/20 flex items-center justify-center font-bold text-xs">
                        {idx + 1}
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 text-sm">{b.name}</div>
                        <div className="text-xs text-slate-500">{b.city} · {b.staffCount} staff</div>
                      </div>
                    </div>
                    <div className="bg-[#F7FAFC] p-2.5 rounded-lg border border-slate-200/80 text-xs space-y-1 mt-2">
                      <div className="flex items-center justify-between text-slate-600">
                        <span>Staff Assigned:</span>
                        <span className="font-semibold text-slate-800">
                          {idx === 0 ? 'Arun, Selva' : idx === 1 ? 'Priya, Divya' : 'Karthik'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-slate-600">
                        <span>Billing Terminal:</span>
                        <span className="text-[#2E8B70] font-semibold">Active & Online</span>
                      </div>
                    </div>
                    <div className="mt-3 text-center text-xs text-slate-500 flex items-center justify-center gap-1">
                      <Users className="w-3.5 h-3.5 text-[#159A9C]" />
                      <span>Serves Walk-in & OPD Patients</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Section 2: User Roles & Access */}
          <div className="bg-[#F7FAFC] border border-slate-200 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-200">
              <span className="bg-[#159A9C] text-white text-xs font-bold px-2 py-0.5 rounded">2</span>
              <h3 className="font-bold text-[#123B5D] text-base">USER ROLES & ACCESS CONTROL</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Admin Permissions */}
              <div className="bg-white border border-[#C9A227]/30 rounded-xl p-4 shadow-2xs">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-7 h-7 rounded-lg bg-[#fdfaf2] text-[#C9A227] border border-[#C9A227]/40 flex items-center justify-center font-bold text-xs">
                    ADM
                  </div>
                  <h4 className="font-bold text-[#123B5D] text-sm">Admin (Central Management)</h4>
                </div>
                <ul className="space-y-1.5 text-xs text-slate-700">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#2E8B70] shrink-0" />
                    <span>Manage all branches (Add / Edit branches)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#2E8B70] shrink-0" />
                    <span>Add / Edit master products & prices</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#2E8B70] shrink-0" />
                    <span>Manage stock for each branch & restock inventory</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#2E8B70] shrink-0" />
                    <span>View all branch invoices and customer bills</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#2E8B70] shrink-0" />
                    <span>View daily and historical sales reports & branch comparisons</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#2E8B70] shrink-0" />
                    <span>Receive instant low stock alerts across all branches</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#2E8B70] shrink-0" />
                    <span>Manage billing staff accounts & access rights</span>
                  </li>
                </ul>
              </div>

              {/* Billing Staff Permissions */}
              <div className="bg-white border border-[#159A9C]/30 rounded-xl p-4 shadow-2xs">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-7 h-7 rounded-lg bg-[#eef8f8] text-[#159A9C] border border-[#159A9C]/30 flex items-center justify-center">
                    <Users className="w-4 h-4" />
                  </div>
                  <h4 className="font-bold text-[#123B5D] text-sm">Billing Staff (Each Branch)</h4>
                </div>
                <div className="space-y-3">
                  <div>
                    <div className="text-[11px] font-bold text-[#2E8B70] uppercase tracking-wider mb-1">
                      Allowed Actions:
                    </div>
                    <ul className="space-y-1.5 text-xs text-slate-700">
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-[#2E8B70] shrink-0" />
                        <span>Login with username & password to assigned branch</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-[#2E8B70] shrink-0" />
                        <span>Select products and create customer bills</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-[#2E8B70] shrink-0" />
                        <span>Add multiple products per bill with live calculation</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-[#2E8B70] shrink-0" />
                        <span>Generate, review and print thermal/A4 customer invoice</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-[#2E8B70] shrink-0" />
                        <span>View own branch billing history & daily branch sales</span>
                      </li>
                    </ul>
                  </div>

                  <div>
                    <div className="text-[11px] font-bold text-[#D95C5C] uppercase tracking-wider mb-1">
                      Restricted (Security Boundary):
                    </div>
                    <ul className="space-y-1 text-xs text-slate-500">
                      <li className="flex items-center gap-2">
                        <XCircle className="w-3.5 h-3.5 text-[#D95C5C] shrink-0" />
                        <span>Cannot add products or alter catalog prices</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <XCircle className="w-3.5 h-3.5 text-[#D95C5C] shrink-0" />
                        <span>Cannot access other branches' stock or invoices</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <XCircle className="w-3.5 h-3.5 text-[#D95C5C] shrink-0" />
                        <span>Cannot access central admin features or staff credentials</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Complete Workflow */}
          <div className="bg-[#F7FAFC] border border-slate-200 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-200">
              <span className="bg-[#2E8B70] text-white text-xs font-bold px-2 py-0.5 rounded">3</span>
              <h3 className="font-bold text-[#123B5D] text-base">COMPLETE INTERACTIVE WORKFLOW</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-6 gap-3 text-xs">
              <div className="bg-white p-3 rounded-lg border border-slate-200 flex flex-col items-center text-center">
                <div className="w-8 h-8 rounded-full bg-[#123B5D]/10 text-[#123B5D] flex items-center justify-center font-bold mb-2">
                  1
                </div>
                <div className="font-bold text-slate-800">Admin Sets Up</div>
                <div className="text-slate-500 mt-1">Adds Products & sets initial stock for each branch</div>
              </div>

              <div className="bg-white p-3 rounded-lg border border-slate-200 flex flex-col items-center text-center">
                <div className="w-8 h-8 rounded-full bg-[#123B5D]/10 text-[#123B5D] flex items-center justify-center font-bold mb-2">
                  2
                </div>
                <div className="font-bold text-slate-800">Staff Login</div>
                <div className="text-slate-500 mt-1">Staff logs into their assigned hospital branch</div>
              </div>

              <div className="bg-white p-3 rounded-lg border border-slate-200 flex flex-col items-center text-center">
                <div className="w-8 h-8 rounded-full bg-[#123B5D]/10 text-[#123B5D] flex items-center justify-center font-bold mb-2">
                  3
                </div>
                <div className="font-bold text-slate-800">Create Bill</div>
                <div className="text-slate-500 mt-1">Select items, enter quantity, rate auto-calculated</div>
              </div>

              <div className="bg-white p-3 rounded-lg border border-[#2E8B70]/30 bg-[#eef8f8] flex flex-col items-center text-center">
                <div className="w-8 h-8 rounded-full bg-[#2E8B70] text-white flex items-center justify-center font-bold mb-2">
                  4
                </div>
                <div className="font-bold text-[#2E8B70]">Stock Deducted</div>
                <div className="text-slate-600 mt-1">Stock automatically deducted from branch inventory</div>
              </div>

              <div className="bg-white p-3 rounded-lg border border-[#D99A24]/30 bg-[#fdfaf2] flex flex-col items-center text-center">
                <div className="w-8 h-8 rounded-full bg-[#D99A24] text-white flex items-center justify-center font-bold mb-2">
                  5
                </div>
                <div className="font-bold text-[#D99A24]">Low Stock Alert</div>
                <div className="text-slate-600 mt-1">If stock ≤ threshold, instant alert sent to Admin</div>
              </div>

              <div className="bg-white p-3 rounded-lg border border-[#123B5D]/20 bg-slate-50 flex flex-col items-center text-center">
                <div className="w-8 h-8 rounded-full bg-[#123B5D] text-white flex items-center justify-center font-bold mb-2">
                  6
                </div>
                <div className="font-bold text-[#123B5D]">Central Sync</div>
                <div className="text-slate-600 mt-1">All sales and invoices reflected in Admin reports</div>
              </div>
            </div>

            {/* Current System Health Banner */}
            <div className="mt-4 p-3 bg-white border border-slate-200 rounded-lg flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#2E8B70] animate-pulse"></span>
                <span className="font-semibold text-slate-800">System Status:</span>
                <span className="text-slate-600">3 Branches Active · Real-time Sync Active</span>
              </div>
              <div className="flex items-center gap-4 text-slate-700">
                <span>Total Invoices: <strong className="font-mono">{invoices.length}</strong></span>
                <span>
                  Active Low Stock Alerts: <strong className="text-[#D95C5C] font-mono">{lowStockCount}</strong>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-100 px-6 py-3 border-t border-slate-200 flex justify-end">
          <button
            onClick={() => setShowWorkflowModal(false)}
            className="px-4 py-2 bg-[#159A9C] text-white rounded-lg text-xs font-semibold hover:bg-[#0f7a7c] transition-colors shadow-xs"
          >
            Close Workflow View
          </button>
        </div>
      </div>
    </div>
  );
};
