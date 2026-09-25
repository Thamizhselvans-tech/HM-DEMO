/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { WorkflowModal } from './components/common/WorkflowModal';
import { AdminLogin } from './components/auth/AdminLogin';
import { StaffLogin } from './components/auth/StaffLogin';
import { AdminLayout } from './components/admin/AdminLayout';
import { StaffLayout } from './components/billing/StaffLayout';

import { motion, AnimatePresence } from 'motion/react';
import { Shield, Sparkles, Building2, Lock } from 'lucide-react';

function MainAppContent() {
  const { session, showWorkflowModal, toastMessage } = useApp();
  const [loginRole, setLoginRole] = useState<'admin' | 'staff'>('admin');

  const isAuthenticated = session !== null;
  const isAdmin = session?.role === 'admin' || session?.role === 'ADMIN';

  return (
    <div
      className={`${
        isAdmin ? 'lg:h-screen lg:overflow-hidden min-h-screen' : 'min-h-screen'
      } bg-[#F7FAFC] flex flex-col font-sans text-slate-800 antialiased selection:bg-[#159A9C]/20 selection:text-[#123B5D]`}
    >
      {/* Portal Switcher Bar when unauthenticated */}
      {!isAuthenticated && (
        <header className="bg-[#0c2942] border-b border-slate-700/60 px-3 sm:px-4 py-2 sm:py-2.5 flex flex-wrap items-center justify-between gap-2 sm:gap-3 shadow-md z-20">
          <div className="flex items-center gap-2 sm:gap-2.5">
            <img
              src="/logo.png"
              alt="MedBill Pro"
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg object-contain bg-white p-0.5 shadow-sm border border-teal-400/30 shrink-0"
            />
            <div>
              <span className="font-extrabold text-xs sm:text-sm tracking-tight text-white uppercase block leading-none">
                MedBill Pro
              </span>
              <span className="text-[9px] sm:text-[10px] text-teal-300/80 font-medium">Medical Billing Management</span>
            </div>
          </div>

          <div className="bg-slate-900/90 p-1 rounded-xl flex items-center gap-1 border border-slate-700/80 shadow-inner relative w-full sm:w-auto justify-center order-3 sm:order-2">
            <button
              type="button"
              onClick={() => setLoginRole('admin')}
              className={`relative px-3 sm:px-4 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer z-10 flex-1 sm:flex-initial text-center ${
                loginRole === 'admin' ? 'text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {loginRole === 'admin' && (
                <motion.div
                  layoutId="activePortalTab"
                  className="absolute inset-0 bg-gradient-to-r from-[#159A9C] to-[#0f7a7c] rounded-lg shadow-sm -z-10"
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}
              <span className="flex items-center justify-center gap-1.5">
                <Lock className="w-3.5 h-3.5 shrink-0" />
                <span className="hidden sm:inline">Central Admin Portal</span>
                <span className="sm:hidden">Admin</span>
              </span>
            </button>
            <button
              type="button"
              onClick={() => setLoginRole('staff')}
              className={`relative px-3 sm:px-4 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer z-10 flex-1 sm:flex-initial text-center ${
                loginRole === 'staff' ? 'text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {loginRole === 'staff' && (
                <motion.div
                  layoutId="activePortalTab"
                  className="absolute inset-0 bg-gradient-to-r from-[#159A9C] to-[#0f7a7c] rounded-lg shadow-sm -z-10"
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}
              <span className="flex items-center justify-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 shrink-0" />
                <span className="hidden sm:inline">Billing Staff Portal</span>
                <span className="sm:hidden">Staff POS</span>
              </span>
            </button>
          </div>

          <div className="hidden md:flex items-center gap-2 text-[11px] text-emerald-400 font-medium bg-emerald-950/40 border border-emerald-500/20 px-2.5 py-1 rounded-full order-2 sm:order-3">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>256-Bit SSL Workstation Active</span>
          </div>
        </header>
      )}

      {/* Main Views */}
      <div
        className={`flex-1 flex flex-col bg-[#F7FAFC] ${
          isAdmin ? 'lg:h-full lg:overflow-hidden' : ''
        }`}
      >
        {!isAuthenticated ? (
          <main className="flex-1 flex items-center justify-center p-3 sm:p-4 relative overflow-hidden bg-gradient-to-b from-slate-100/80 via-[#F7FAFC] to-slate-200/50">
            {/* Subtle animated background radial glows */}
            <div className="absolute top-1/4 -left-20 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-[#123B5D]/10 rounded-full blur-3xl pointer-events-none" />

            <AnimatePresence mode="wait">
              {loginRole === 'admin' ? (
                <motion.div
                  key="admin"
                  initial={{ opacity: 0, y: 15, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -15, scale: 0.98 }}
                  transition={{ duration: 0.28, ease: 'easeOut' }}
                  className="w-full max-w-md"
                >
                  <AdminLogin onSwitchToStaff={() => setLoginRole('staff')} />
                </motion.div>
              ) : (
                <motion.div
                  key="staff"
                  initial={{ opacity: 0, y: 15, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -15, scale: 0.98 }}
                  transition={{ duration: 0.28, ease: 'easeOut' }}
                  className="w-full max-w-md"
                >
                  <StaffLogin onSwitchToAdmin={() => setLoginRole('admin')} />
                </motion.div>
              )}
            </AnimatePresence>
          </main>
        ) : isAdmin ? (
          <AdminLayout />
        ) : (
          <StaffLayout />
        )}
      </div>

      {/* Global Interactive Workflow & Architecture Diagram Modal */}
      {showWorkflowModal && <WorkflowModal />}

      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 animate-in slide-in-from-bottom-5 fade-in duration-200">
          <div className="bg-[#123B5D] text-white px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2.5 text-xs font-semibold border border-[#123B5D]/40 shadow-slate-900/10">
            <span className="w-2 h-2 rounded-full bg-[#159A9C] animate-pulse"></span>
            <span>{toastMessage}</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <MainAppContent />
    </AppProvider>
  );
}
