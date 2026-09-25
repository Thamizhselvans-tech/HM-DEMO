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

function MainAppContent() {
  const { session, showWorkflowModal, toastMessage } = useApp();
  const [loginRole, setLoginRole] = useState<'admin' | 'staff'>('admin');

  const isAuthenticated = session !== null;
  const isAdmin = session?.role === 'admin' || session?.role === 'ADMIN';

  return (
    <div
      className={`${
        isAdmin ? 'h-screen overflow-hidden' : 'min-h-screen'
      } bg-[#F7FAFC] flex flex-col font-sans text-slate-800 antialiased selection:bg-[#159A9C]/20 selection:text-[#123B5D]`}
    >
      {/* Portal Switcher Bar when unauthenticated */}
      {!isAuthenticated && (
        <div className="bg-[#0c2942] border-b border-slate-700/60 px-4 py-2 flex items-center justify-center">
          <div className="bg-slate-800/80 p-1 rounded-xl flex items-center gap-1 border border-slate-700">
            <button
              type="button"
              onClick={() => setLoginRole('admin')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                loginRole === 'admin'
                  ? 'bg-[#159A9C] text-white shadow-xs'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/60'
              }`}
            >
              Central Admin Portal
            </button>
            <button
              type="button"
              onClick={() => setLoginRole('staff')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                loginRole === 'staff'
                  ? 'bg-[#159A9C] text-white shadow-xs'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/60'
              }`}
            >
              Billing Staff Portal
            </button>
          </div>
        </div>
      )}

      {/* Main Views */}
      <div
        className={`flex-1 flex flex-col bg-[#F7FAFC] ${
          isAdmin ? 'h-full overflow-hidden' : ''
        }`}
      >
        {!isAuthenticated ? (
          <main className="flex-1 flex items-center justify-center p-4">
            {loginRole === 'admin' ? (
              <AdminLogin onSwitchToStaff={() => setLoginRole('staff')} />
            ) : (
              <StaffLogin onSwitchToAdmin={() => setLoginRole('admin')} />
            )}
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
