import React, { useState } from 'react';
import {
  User,
  Lock,
  Unlock,
  Building2,
  LogIn,
  Eye,
  EyeOff,
  AlertCircle,
  Loader2,
  HelpCircle,
  ArrowRight,
  ShieldCheck,
  Shield,
  X,
  KeyRound,
  LockKeyhole,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useApp } from '../../context/AppContext';

interface Props {
  onSwitchToAdmin: () => void;
}

export const StaffLogin: React.FC<Props> = ({ onSwitchToAdmin }) => {
  const { loginStaffWithCredentials, settings } = useApp();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberTerminal, setRememberTerminal] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showForgotModal, setShowForgotModal] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const trimmedUser = username.trim();
    if (!trimmedUser) {
      setErrorMessage('Please enter your billing staff username.');
      return;
    }
    if (!password) {
      setErrorMessage('Please enter your password.');
      return;
    }

    setIsLoading(true);

    // Simulate realistic credential verification
    setTimeout(() => {
      const result = loginStaffWithCredentials(trimmedUser, password);
      setIsLoading(false);

      if (!result.success) {
        setErrorMessage(result.error || 'Invalid username or password. Please verify your credentials.');
      }
    }, 450);
  };

  const handleFillDemo = (demoUser: string) => {
    setUsername(demoUser);
    setPassword('password123');
    setErrorMessage(null);
  };

  const isPasswordReady = password.length >= 4;

  return (
    <motion.div
      animate={errorMessage ? { x: [-8, 8, -6, 6, -3, 3, 0] } : { x: 0 }}
      transition={{ duration: 0.45 }}
      className="w-full max-w-md mx-auto my-6"
    >
      {/* Main Staff Login Card */}
      <div className="bg-white rounded-3xl shadow-2xl shadow-slate-900/10 border border-slate-200/90 overflow-hidden transition-all duration-300">
        {/* Header: Dedicated Billing Staff Terminal Header with Animated Lock */}
        <div className="bg-gradient-to-br from-[#0c2942] via-[#123B5D] to-[#154c79] px-8 pt-8 pb-7 text-white text-center relative overflow-hidden border-b border-[#0c2942]">
          {/* Subtle gradient pattern */}
          <div className="absolute -top-12 -right-12 w-44 h-44 bg-[#159A9C]/20 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-[#C9A227]/15 rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10 flex flex-col items-center">
            {/* MedBill Pro Brand Logo */}
            <div className="mb-3">
              <img
                src="/logo.png"
                alt="MedBill Pro"
                className="h-14 sm:h-16 w-auto object-contain bg-white rounded-2xl p-1.5 shadow-lg border-2 border-white/30"
              />
            </div>

            {/* Terminal Emblem & Animated Lock */}
            <div className="relative mb-3">
              {/* Pulsing security ring */}
              <motion.div
                animate={{
                  scale: [1, 1.1, 1],
                  opacity: [0.35, 0.7, 0.35],
                  rotate: isLoading ? 360 : 0,
                }}
                transition={{
                  scale: { duration: 3, repeat: Infinity, ease: 'easeInOut' },
                  opacity: { duration: 3, repeat: Infinity, ease: 'easeInOut' },
                  rotate: { duration: 1.5, repeat: Infinity, ease: 'linear' },
                }}
                className={`absolute -inset-2 rounded-2xl border-2 ${
                  errorMessage
                    ? 'border-red-400/60'
                    : isPasswordReady
                    ? 'border-emerald-400/60'
                    : 'border-[#159A9C]/40'
                } pointer-events-none`}
              />

              <div className="w-16 h-16 bg-white text-[#159A9C] rounded-2xl flex items-center justify-center shadow-lg border-2 border-[#159A9C]/40 relative overflow-hidden">
                <AnimatePresence mode="wait">
                  {isLoading ? (
                    <motion.div
                      key="loading"
                      initial={{ scale: 0.5, rotate: -90, opacity: 0 }}
                      animate={{ scale: 1, rotate: 0, opacity: 1 }}
                      exit={{ scale: 0.5, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Loader2 className="w-7 h-7 text-[#159A9C] animate-spin" />
                    </motion.div>
                  ) : showPassword ? (
                    <motion.div
                      key="unlock"
                      initial={{ scale: 0.7, rotate: -20, opacity: 0 }}
                      animate={{ scale: 1, rotate: 0, opacity: 1 }}
                      exit={{ scale: 0.7, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Unlock className="w-7 h-7 text-[#C9A227]" />
                    </motion.div>
                  ) : isPasswordReady ? (
                    <motion.div
                      key="locked-secure"
                      initial={{ scale: 0.7, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.7, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="relative"
                    >
                      <LockKeyhole className="w-7 h-7 text-emerald-600" />
                      <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white"></span>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="terminal-icon"
                      initial={{ scale: 0.7, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.7, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Building2 className="w-7 h-7 text-[#159A9C]" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            <div className="inline-block">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#C9A227] border border-[#C9A227]/40 px-2.5 py-0.5 rounded-full bg-[#C9A227]/15 shadow-xs">
                Hospital Billing Counter
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white mt-2 leading-none uppercase">
              BILLING STAFF PORTAL
            </h1>
            <p className="text-xs text-slate-300 font-medium mt-1.5">
              {settings?.hospitalName || 'MediCare Hospital & Healthcare Network'}
            </p>

            <div className="inline-flex items-center gap-1.5 mt-3.5 bg-white/10 px-3.5 py-1 rounded-full text-[11px] text-slate-200 border border-white/15 backdrop-blur-xs">
              <ShieldCheck className="w-3.5 h-3.5 text-[#159A9C]" />
              <span>Automated Branch Assignment on Sign-In</span>
            </div>
          </div>
        </div>

        {/* Login Form Body */}
        <div className="p-6 sm:p-8 bg-white">
          <div className="mb-5 text-center sm:text-left">
            <h2 className="text-base font-bold text-[#123B5D] tracking-tight">Staff Sign In</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Enter your assigned username and password to open your branch billing terminal.
            </p>
          </div>

          {/* Error Banner */}
          {errorMessage && (
            <div
              className="mb-5 p-3.5 bg-[#faecec] border border-[#D95C5C]/30 text-[#D95C5C] rounded-xl text-xs flex items-start gap-2.5 animate-in fade-in slide-in-from-top-1"
              role="alert"
            >
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-[#D95C5C]" />
              <div className="flex-1 font-medium leading-relaxed">{errorMessage}</div>
              <button
                type="button"
                onClick={() => setErrorMessage(null)}
                className="text-[#D95C5C]/70 hover:text-[#D95C5C] p-0.5 transition-colors cursor-pointer"
                aria-label="Dismiss error"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {/* Username Input (Strictly no manual branch selection dropdown) */}
            <div>
              <label
                htmlFor="staff-username"
                className="block text-xs font-semibold text-slate-700 mb-1.5"
              >
                Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  id="staff-username"
                  type="text"
                  autoComplete="username"
                  autoFocus
                  disabled={isLoading}
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    if (errorMessage) setErrorMessage(null);
                  }}
                  placeholder="e.g. arun"
                  className="w-full pl-9 pr-3 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#159A9C] focus:border-[#159A9C] bg-[#F7FAFC] text-slate-900 transition-colors disabled:opacity-60 disabled:cursor-not-allowed placeholder:text-slate-400 font-medium"
                />
              </div>
            </div>

            {/* Password Input with Show/Hide Toggle & Live Lock Status */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <label
                    htmlFor="staff-password"
                    className="block text-xs font-semibold text-slate-700"
                  >
                    Password
                  </label>
                  {password.length > 0 && (
                    <motion.span
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md flex items-center gap-1 border ${
                        isPasswordReady
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-amber-50 text-amber-700 border-amber-200'
                      }`}
                    >
                      {isPasswordReady ? (
                        <>
                          <ShieldCheck className="w-3 h-3 text-emerald-600" />
                          <span>Terminal Key Ready</span>
                        </>
                      ) : (
                        <>
                          <Lock className="w-3 h-3 text-amber-600" />
                          <span>Min 4 Chars</span>
                        </>
                      )}
                    </motion.span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => setShowForgotModal(true)}
                  className="text-xs text-[#159A9C] hover:text-[#0f7a7c] font-semibold transition-colors cursor-pointer"
                >
                  Forgot Password?
                </button>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className={`w-4 h-4 transition-colors ${isPasswordReady ? 'text-emerald-500' : 'text-slate-400'}`} />
                </div>
                <input
                  id="staff-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  disabled={isLoading}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errorMessage) setErrorMessage(null);
                  }}
                  placeholder="••••••••••••"
                  className={`w-full pl-9 pr-10 py-2.5 text-xs sm:text-sm rounded-xl border focus:outline-none transition-all disabled:opacity-60 disabled:cursor-not-allowed placeholder:text-slate-400 font-medium ${
                    isPasswordReady
                      ? 'border-emerald-300 focus:ring-2 focus:ring-[#159A9C] focus:border-[#159A9C] bg-white text-slate-900 shadow-xs'
                      : 'border-slate-300 focus:ring-2 focus:ring-[#159A9C] focus:border-[#159A9C] bg-[#F7FAFC] text-slate-900'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition-colors disabled:opacity-50 cursor-pointer"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4 text-[#C9A227]" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember Terminal Checkbox */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberTerminal}
                  disabled={isLoading}
                  onChange={(e) => setRememberTerminal(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 text-[#159A9C] focus:ring-[#159A9C] cursor-pointer"
                />
                <span className="text-xs text-slate-600 font-medium">Remember terminal session</span>
              </label>
              <span className="text-[11px] text-emerald-600 font-medium bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100 flex items-center gap-1">
                <Shield className="w-3 h-3 text-emerald-500" />
                POS Counter Active
              </span>
            </div>

            {/* Submit LOGIN Button */}
            <div className="pt-2">
              <motion.button
                whileHover={{ scale: isLoading ? 1 : 1.012 }}
                whileTap={{ scale: isLoading ? 1 : 0.985 }}
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 px-4 bg-gradient-to-r from-[#159A9C] via-[#108385] to-[#0c6466] hover:from-[#138d8f] hover:to-[#0a5254] text-white rounded-xl font-bold text-xs sm:text-sm shadow-lg shadow-[#159A9C]/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed border border-teal-400/30"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>Verifying Staff Credentials...</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4 text-white" />
                    <span>OPEN COUNTER TERMINAL</span>
                  </>
                )}
              </motion.button>
            </div>
          </form>

          {/* Quick Staff Fast Access Helper for Testing */}
          <div className="mt-5 pt-4 border-t border-slate-100">
            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2 text-center">
              Quick Test Billing Staff (Password: password123)
            </div>
            <div className="grid grid-cols-3 gap-2">
              <motion.button
                whileHover={{ y: -2, scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                type="button"
                onClick={() => handleFillDemo('arun')}
                className="p-2 text-center rounded-xl border border-slate-200 hover:bg-[#eef8f8] hover:border-[#159A9C]/40 text-slate-700 text-xs transition-colors cursor-pointer shadow-xs"
              >
                <div className="font-bold text-[#159A9C]">arun</div>
                <div className="text-[10px] text-slate-500 truncate">Branch 1 (Chennai)</div>
              </motion.button>
              <motion.button
                whileHover={{ y: -2, scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                type="button"
                onClick={() => handleFillDemo('priya')}
                className="p-2 text-center rounded-xl border border-slate-200 hover:bg-[#eef8f8] hover:border-[#159A9C]/40 text-slate-700 text-xs transition-colors cursor-pointer shadow-xs"
              >
                <div className="font-bold text-[#159A9C]">priya</div>
                <div className="text-[10px] text-slate-500 truncate">Branch 2 (Cbe)</div>
              </motion.button>
              <motion.button
                whileHover={{ y: -2, scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                type="button"
                onClick={() => handleFillDemo('karthik')}
                className="p-2 text-center rounded-xl border border-slate-200 hover:bg-[#eef8f8] hover:border-[#159A9C]/40 text-slate-700 text-xs transition-colors cursor-pointer shadow-xs"
              >
                <div className="font-bold text-[#159A9C]">karthik</div>
                <div className="text-[10px] text-slate-500 truncate">Branch 3 (Clinic)</div>
              </motion.button>
            </div>
          </div>

          {/* Switch to Admin Portal */}
          <div className="mt-4 pt-3 text-center border-t border-slate-100">
            <button
              type="button"
              onClick={onSwitchToAdmin}
              className="text-xs text-[#123B5D] hover:text-[#159A9C] font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <span>Hospital Administrator? Go to Central Admin Portal</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#159A9C]" />
            </button>
          </div>
        </div>

        {/* Security & Compliance Footer */}
        <div className="bg-slate-50 px-6 py-2.5 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500 font-medium">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-[#159A9C]" />
            <span>Multi-Branch POS Isolation</span>
          </div>
          <span>Counter Audit Session Active</span>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0c2942]/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 p-6 space-y-4 text-slate-900">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#eef8f8] text-[#159A9C] flex items-center justify-center border border-[#159A9C]/30">
                  <KeyRound className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#123B5D]">Billing Staff Credential Recovery</h3>
                  <p className="text-[11px] text-slate-500 font-normal">
                    Assigned Branch Counter Access
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowForgotModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                aria-label="Close dialog"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-600 leading-relaxed">
              <p>
                Staff accounts are provisioned and managed by the <strong>Central Hospital Administrator</strong>.
                If you forgot your password or cannot access your counter:
              </p>

              <div className="p-3 bg-[#F7FAFC] rounded-xl border border-slate-200 space-y-2">
                <div className="font-semibold text-slate-800">Support Steps:</div>
                <ul className="list-disc pl-4 space-y-1 text-slate-600">
                  <li>Ask your Branch Supervisor or Admin to update your password in <strong>Staff Management</strong>.</li>
                  <li>Call the Central Hospital Administration Desk.</li>
                  <li>Default demo password for seeded accounts is <code className="bg-slate-200 px-1.5 py-0.5 rounded font-mono text-[#123B5D]">password123</code>.</li>
                </ul>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setShowForgotModal(false)}
                className="w-full py-2 bg-[#123B5D] hover:bg-[#0c2942] text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                Return to Login
              </button>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};
