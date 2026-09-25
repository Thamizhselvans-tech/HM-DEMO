import React, { useState } from 'react';
import {
  LayoutDashboard,
  Building2,
  Package,
  Boxes,
  AlertTriangle,
  FileText,
  BarChart3,
  Users,
  Settings,
  Menu,
  X,
  LogOut,
  Bell,
  ChevronRight,
  Shield,
  Layers,
  ArrowRightLeft,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { AdminDashboard } from './AdminDashboard';
import { BranchManagement } from './BranchManagement';
import { ProductManagement } from './ProductManagement';
import { StockManagement } from './StockManagement';
import { BranchStockView } from './BranchStockView';
import { LowStockAlerts } from './LowStockAlerts';
import { InvoiceList } from './InvoiceList';
import { DailyTransactions } from './DailyTransactions';
import { ReportsView } from './ReportsView';
import { StaffManagement } from './StaffManagement';
import { AdminSettings } from './AdminSettings';
import { InvoiceDetailModal } from './InvoiceDetailModal';

export const AdminLayout: React.FC = () => {
  const {
    currentAdminTab,
    setCurrentAdminTab,
    getLowStockAlerts,
    session,
    logout,
    setShowWorkflowModal,
    loginStaffMember,
    selectedInvoice,
    setSelectedInvoice,
    settings,
  } = useApp();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const lowStockCount = getLowStockAlerts().length;

  const navSections = [
    {
      title: 'OVERVIEW',
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
      ],
    },
    {
      title: 'INVENTORY & STOCKS',
      items: [
        { id: 'products', label: 'Product Catalog', icon: Package },
        { id: 'stock-update', label: 'Stock Management', icon: Boxes },
        { id: 'branch-stock', label: 'Branch Stock View', icon: Boxes },
        {
          id: 'low-stock',
          label: 'Low Stock Alerts',
          icon: AlertTriangle,
          badge: lowStockCount > 0 ? lowStockCount : undefined,
        },
      ],
    },
    {
      title: 'BILLING & AUDIT',
      items: [
        { id: 'invoices', label: 'Central Invoices', icon: FileText },
        { id: 'daily-transactions', label: 'Daily Transactions', icon: BarChart3 },
        { id: 'reports', label: 'Reports & Analytics', icon: BarChart3 },
      ],
    },
    {
      title: 'ORGANIZATION',
      items: [
        { id: 'branches', label: 'Hospital Branches', icon: Building2 },
        { id: 'staff', label: 'Staff Management', icon: Users },
        { id: 'settings', label: 'System Settings', icon: Settings },
      ],
    },
  ];

  const handleNavClick = (tabId: string) => {
    setCurrentAdminTab(tabId);
    setMobileMenuOpen(false);
  };

  // RBAC Access Control Barrier
  if (session?.role !== 'admin') {
    return (
      <div className="min-h-[85vh] flex items-center justify-center p-4 bg-[#F7FAFC]">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-[#D95C5C]/30 p-8 text-center space-y-4">
          <div className="w-16 h-16 bg-[#faecec] text-[#D95C5C] rounded-2xl flex items-center justify-center mx-auto shadow-inner">
            <Shield className="w-9 h-9" />
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#D95C5C] bg-[#faecec] px-2.5 py-1 rounded-full border border-[#D95C5C]/30">
              403 Forbidden · Admin Only
            </span>
            <h2 className="text-xl font-bold text-[#123B5D] mt-2">
              Access Restricted to Central Admin
            </h2>
            <p className="text-xs text-slate-500 mt-2 leading-relaxed">
              Billing staff terminals are strictly scoped to their assigned hospital branch counter. You do not have permissions to access Central Admin configurations, all-branch consolidated reports, or catalog editing.
            </p>
          </div>
          <div className="pt-3">
            <button
              onClick={() => logout()}
              className="w-full py-2.5 px-4 bg-[#123B5D] hover:bg-[#0c2942] text-white rounded-xl text-xs font-bold shadow-md transition-colors"
            >
              Sign Out to Terminal Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-[#F7FAFC] flex flex-col overflow-hidden">
      <div className="flex flex-1 h-full overflow-hidden">
        {/* Sidebar for Desktop matching Screen 5 */}
        <aside className="hidden lg:flex flex-col w-64 h-full shrink-0 bg-white border-r border-slate-200/80 shadow-xs select-none z-30">
          {/* Brand Hub */}
          <div className="h-14 px-4 border-b border-slate-200/80 flex items-center justify-between bg-white">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#123B5D] text-white flex items-center justify-center font-black text-base shadow-xs border border-[#C9A227]/30">
                +
              </div>
              <div>
                <div className="font-extrabold text-[#123B5D] text-sm tracking-tight leading-none truncate max-w-[125px]" title={settings?.hospitalName || 'Central HQ'}>
                  {settings?.hospitalName ? settings.hospitalName.split(' ')[0] + ' HQ' : 'Central HQ'}
                </div>
                <div className="text-[10px] text-[#159A9C] font-bold uppercase tracking-wider mt-0.5">
                  Admin Console
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#edf7f4] text-[#2E8B70] text-[10px] font-semibold border border-[#2E8B70]/30">
              <span className="w-1.5 h-1.5 rounded-full bg-[#2E8B70] animate-pulse"></span>
              <span>Online</span>
            </div>
          </div>

          {/* Navigation Links Grouped with Category Titles */}
          <nav className="p-3 space-y-4 flex-1 overflow-y-auto text-xs">
            {navSections.map((section) => (
              <div key={section.title} className="space-y-1">
                <div className="px-3 py-1 text-[10px] font-bold text-slate-400 tracking-wider uppercase">
                  {section.title}
                </div>
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentAdminTab === item.id;

                  return (
                    <button
                      key={item.id}
                      onClick={() => handleNavClick(item.id)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-lg font-medium transition-colors ${
                        isActive
                          ? 'bg-[#123B5D] text-white shadow-xs font-semibold'
                          : 'text-slate-600 hover:bg-[#eaf2f8]/60 hover:text-[#123B5D]'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon
                          className={`w-4 h-4 shrink-0 ${
                            isActive ? 'text-[#159A9C]' : 'text-slate-400 group-hover:text-[#123B5D]'
                          }`}
                        />
                        <span>{item.label}</span>
                      </div>

                      {item.badge !== undefined && (
                        <span
                          className={`text-[10px] font-bold px-1.5 py-0.2 rounded font-mono ${
                            isActive
                              ? 'bg-[#faecec] text-[#D95C5C]'
                              : 'bg-[#faecec] text-[#D95C5C] border border-[#D95C5C]/30'
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            ))}
          </nav>

          {/* Bottom Admin Profile Card */}
          <div className="p-3 border-t border-slate-200/80 bg-[#F7FAFC]">
            <div className="flex items-center gap-2.5 p-2 rounded-lg bg-white border border-slate-200/80 shadow-2xs">
              <div className="w-8 h-8 rounded-lg bg-[#123B5D] text-white flex items-center justify-center text-xs font-bold shrink-0 border border-[#C9A227]/30">
                DR
              </div>
              <div className="overflow-hidden flex-1">
                <div className="font-bold text-[#123B5D] text-xs truncate">
                  Dr. Ramesh
                </div>
                <div className="text-[10px] text-slate-500 truncate" title={settings?.email || 'admin@medicare.com'}>
                  {settings?.email || 'Central Administrator'}
                </div>
              </div>
              <button
                onClick={logout}
                className="p-1.5 rounded text-slate-400 hover:text-[#D95C5C] hover:bg-[#faecec] transition-colors"
                title="Logout"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </aside>

        {/* Mobile Sidebar Drawer */}
        {mobileMenuOpen && (
          <div
            className="fixed inset-0 z-50 bg-[#0c2942]/60 backdrop-blur-xs lg:hidden flex"
            onClick={() => setMobileMenuOpen(false)}
          >
            <div
              className="w-72 bg-white h-full flex flex-col shadow-2xl p-4 space-y-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <div className="flex items-center gap-2 font-bold text-[#123B5D] text-sm">
                  <div className="w-7 h-7 bg-[#123B5D] text-white rounded-lg flex items-center justify-center font-bold">
                    +
                  </div>
                  <span className="truncate max-w-[170px]" title={settings?.hospitalName || 'Central HQ'}>
                    {settings?.hospitalName || 'MediCare Central HQ'}
                  </span>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:bg-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4 overflow-y-auto flex-1 text-xs">
                {navSections.map((sec) => (
                  <div key={sec.title} className="space-y-1">
                    <div className="px-2 py-0.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      {sec.title}
                    </div>
                    {sec.items.map((item) => {
                      const Icon = item.icon;
                      const isActive = currentAdminTab === item.id;
                      return (
                        <button
                          key={item.id}
                          onClick={() => handleNavClick(item.id)}
                          className={`w-full flex items-center justify-between px-3 py-2 rounded-lg font-medium ${
                            isActive
                              ? 'bg-[#123B5D] text-white font-semibold'
                              : 'text-slate-600 hover:bg-slate-100'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <Icon className="w-4 h-4" />
                            <span>{item.label}</span>
                          </div>
                          {item.badge !== undefined && (
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#faecec] text-[#D95C5C]">
                              {item.badge}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                ))}
              </div>

              <div className="pt-2 border-t border-slate-200">
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    loginStaffMember('staff-1');
                  }}
                  className="w-full py-2 bg-[#eef8f8] text-[#159A9C] hover:bg-[#dff3f3] rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors border border-[#159A9C]/30"
                >
                  <ArrowRightLeft className="w-3.5 h-3.5" />
                  <span>Open Branch 1 Terminal</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden bg-[#F7FAFC]">
          {/* Top Bar for Mobile & Breadcrumbs with crisp h-12 (48px) height */}
          <div className="bg-white border-b border-slate-200/80 px-4 h-12 flex items-center justify-between shadow-2xs shrink-0">
            <div className="flex items-center gap-2.5">
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="lg:hidden p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50"
              >
                <Menu className="w-4 h-4" />
              </button>
              <div className="flex items-center gap-1.5 text-xs text-slate-500">
                <span className="text-slate-400">Admin</span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
                <span className="font-bold text-[#123B5D] capitalize">
                  {currentAdminTab.replace('-', ' ')}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              {lowStockCount > 0 && (
                <button
                  onClick={() => setCurrentAdminTab('low-stock')}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#faecec] text-[#D95C5C] border border-[#D95C5C]/30 text-xs font-semibold hover:bg-[#faecec]/80 transition-colors cursor-pointer"
                >
                  <AlertTriangle className="w-3.5 h-3.5 text-[#D95C5C]" />
                  <span className="hidden sm:inline">{lowStockCount} Low Stock Alerts</span>
                  <span className="sm:hidden font-mono">{lowStockCount}</span>
                </button>
              )}
            </div>
          </div>

          {/* Active Screen View */}
          <main className="flex-1 p-4 md:p-6 overflow-y-auto bg-[#F7FAFC]">
            <div className="max-w-7xl mx-auto">
              {currentAdminTab === 'dashboard' && <AdminDashboard />}
              {currentAdminTab === 'branches' && <BranchManagement />}
              {currentAdminTab === 'products' && <ProductManagement />}
              {currentAdminTab === 'stock-update' && <StockManagement />}
              {currentAdminTab === 'branch-stock' && <BranchStockView />}
              {currentAdminTab === 'low-stock' && <LowStockAlerts />}
              {currentAdminTab === 'invoices' && <InvoiceList />}
              {currentAdminTab === 'daily-transactions' && <DailyTransactions />}
              {currentAdminTab === 'reports' && <ReportsView />}
              {currentAdminTab === 'staff' && <StaffManagement />}
              {currentAdminTab === 'settings' && <AdminSettings />}
            </div>
          </main>
        </div>
      </div>

      {/* Global Invoice Detail Modal for Admin Portal */}
      {selectedInvoice && (
        <InvoiceDetailModal
          invoice={selectedInvoice}
          onClose={() => setSelectedInvoice(null)}
        />
      )}
    </div>
  );
};
