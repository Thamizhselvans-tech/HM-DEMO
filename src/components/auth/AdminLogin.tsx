import React, { useState } from 'react';
import {
  Mail,
  User,
  Lock,
  Eye,
  EyeOff,
  LogIn,
  Shield,
  ShieldAlert,
  ShieldCheck,
  AlertCircle,
  Loader2,
  ArrowRight,
  CheckCircle2,
  Building2,
  X,
  HelpCircle,
  KeyRound,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { FormLabel, FieldError, RequiredAsterisk } from '../common/FormComponents';
import { validateRequired, validateEmail, validatePassword } from '../../utils/validation';

interface Props {
  onSwitchToStaff: () => void;
}

export const AdminLogin: React.FC<Props> = ({ onSwitchToStaff }) => {
  const { loginAdmin } = useApp();

  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [showForgotModal, setShowForgotModal] = useState(false);

  // Accepted mock administrative credentials
  const validUsernames = ['admin', 'admin@medicare.com', 'admin@gmail.com', 'dr.ramesh', 'admin@medicare.health'];
  const validPasswords = ['admin123', 'admin'];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    const newFieldErrors: Record<string, string> = {};

    const trimmedUser = usernameOrEmail.trim();
    if (!trimmedUser) {
      newFieldErrors.user = 'Please enter your administrative username or email address.';
    } else if (trimmedUser.includes('@') && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedUser)) {
      newFieldErrors.user = 'Please enter a valid email address.';
    }

    if (!password) {
      newFieldErrors.password = 'Please enter your administrative password.';
    } else if (password.length < 4) {
      newFieldErrors.password = 'Password must contain at least 4 characters.';
    }

    if (Object.keys(newFieldErrors).length > 0) {
      setFieldErrors(newFieldErrors);
      return;
    }

    setFieldErrors({});
    setIsLoading(true);

    // Simulate realistic hospital directory authentication delay
    setTimeout(() => {
      const normalizedUser = usernameOrEmail.trim().toLowerCase();
      const isUserValid = validUsernames.includes(normalizedUser);
      const isPasswordValid = validPasswords.includes(password);

      if (isUserValid && isPasswordValid) {
        setIsLoading(false);
        loginAdmin();
      } else {
        setIsLoading(false);
        setErrorMessage(
          'Authentication Failed: Invalid administrative credentials. Please verify your username/email and password, or contact Hospital IT Security.'
        );
      }
    }, 650);
  };

  const handleFillDemo = () => {
    setUsernameOrEmail('admin@medicare.com');
    setPassword('admin123');
    setFieldErrors({});
    setErrorMessage(null);
  };

  return (
    <div className="w-full max-w-md mx-auto my-6 animate-in fade-in duration-300">
      {/* Main Login Card */}
      <div className="bg-white rounded-2xl shadow-xl shadow-slate-900/5 border border-slate-200/90 overflow-hidden">
        {/* Hospital Branding Header */}
        <div className="bg-[#123B5D] px-8 pt-8 pb-7 text-white text-center relative overflow-hidden border-b border-[#0c2942]">
          {/* Subtle decorative background pattern */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-white/10 via-transparent to-transparent pointer-events-none" />

          {/* Hospital Logo / Cross Emblem */}
          <div className="relative z-10">
            <div className="w-14 h-14 bg-white text-[#123B5D] rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-md border-2 border-[#C9A227]/40">
              <span className="font-black text-3xl text-[#123B5D] leading-none select-none">+</span>
            </div>

            <div className="inline-block">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#C9A227] border border-[#C9A227]/40 px-2 py-0.5 rounded-full bg-[#C9A227]/15">
                Central Management System
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white mt-2 leading-none uppercase">
              CENTRAL ADMIN PORTAL
            </h1>
            <p className="text-xs text-slate-300 font-medium mt-1.5">
              Multi-Branch Hospital & Healthcare Network
            </p>

            <div className="inline-flex items-center gap-1.5 mt-3.5 bg-white/10 px-3 py-1 rounded-full text-[11px] text-slate-200 border border-white/15">
              <ShieldCheck className="w-3.5 h-3.5 text-[#159A9C]" />
              <span>Full System Management & Audit Console</span>
            </div>
          </div>
        </div>

        {/* Login Form Section */}
        <div className="p-6 sm:p-8 bg-white">
          <div className="mb-5 text-center sm:text-left">
            <h2 className="text-base font-bold text-[#123B5D] tracking-tight">Admin Sign In</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Enter administrative credentials to manage branches, inventory, and billing operations.
            </p>
          </div>

          {/* Validation & Error Message Alert */}
          {errorMessage && (
            <div
              className="mb-5 p-3.5 bg-[#faecec] border border-[#D95C5C]/30 text-[#D95C5C] rounded-xl text-xs flex items-start gap-2.5 animate-in fade-in slide-in-from-top-1"
              role="alert"
            >
              <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5 text-[#D95C5C]" />
              <div className="flex-1 font-medium leading-relaxed">{errorMessage}</div>
              <button
                type="button"
                onClick={() => setErrorMessage(null)}
                className="text-[#D95C5C]/70 hover:text-[#D95C5C] p-0.5 transition-colors"
                aria-label="Dismiss error"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {/* Username or Email Input */}
            <div>
              <FormLabel
                label="Username or Email Address"
                required
                htmlFor="admin-username"
                className="block text-xs font-semibold text-slate-700 mb-1.5"
              />
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  id="admin-username"
                  type="text"
                  autoComplete="username"
                  disabled={isLoading}
                  value={usernameOrEmail}
                  onChange={(e) => {
                    setUsernameOrEmail(e.target.value);
                    if (fieldErrors.user) {
                      setFieldErrors((prev) => {
                        const { user: _, ...rest } = prev;
                        return rest;
                      });
                    }
                    if (errorMessage) setErrorMessage(null);
                  }}
                  placeholder="admin or admin@medicare.com"
                  className={`w-full pl-9 pr-3.5 py-2.5 text-xs sm:text-sm rounded-xl border focus:outline-none transition-colors disabled:opacity-60 disabled:cursor-not-allowed placeholder:text-slate-400 font-medium ${
                    fieldErrors.user
                      ? 'border-red-500 bg-red-50/20 focus:ring-2 focus:ring-red-400 focus:border-red-500 text-slate-900'
                      : 'border-slate-300 focus:ring-2 focus:ring-[#159A9C] focus:border-[#159A9C] bg-[#F7FAFC] text-slate-900'
                  }`}
                />
              </div>
              <FieldError error={fieldErrors.user} />
            </div>

            {/* Password Input with Show/Hide Toggle */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <FormLabel
                  label="Password"
                  required
                  htmlFor="admin-password"
                  className="block text-xs font-semibold text-slate-700"
                />
                <button
                  type="button"
                  onClick={() => setShowForgotModal(true)}
                  className="text-[11px] font-semibold text-[#159A9C] hover:text-[#0f7a7c] transition-colors"
                >
                  Forgot Password?
                </button>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="admin-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  disabled={isLoading}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (fieldErrors.password) {
                      setFieldErrors((prev) => {
                        const { password: _, ...rest } = prev;
                        return rest;
                      });
                    }
                    if (errorMessage) setErrorMessage(null);
                  }}
                  placeholder="••••••••••••"
                  className={`w-full pl-9 pr-10 py-2.5 text-xs sm:text-sm rounded-xl border focus:outline-none transition-colors disabled:opacity-60 disabled:cursor-not-allowed placeholder:text-slate-400 font-medium ${
                    fieldErrors.password
                      ? 'border-red-500 bg-red-50/20 focus:ring-2 focus:ring-red-400 focus:border-red-500 text-slate-900'
                      : 'border-slate-300 focus:ring-2 focus:ring-[#159A9C] focus:border-[#159A9C] bg-[#F7FAFC] text-slate-900'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition-colors disabled:opacity-50"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <FieldError error={fieldErrors.password} />
            </div>

            {/* Remember Me Checkbox */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  disabled={isLoading}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 text-[#159A9C] focus:ring-[#159A9C] cursor-pointer"
                />
                <span className="text-xs text-slate-600 font-medium">Remember this workstation</span>
              </label>
              <span className="text-[11px] text-slate-400 hidden sm:inline">Encrypted Session</span>
            </div>

            {/* Professional Login Button with Loading State */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 px-4 bg-[#159A9C] hover:bg-[#0f7a7c] active:bg-[#0c6466] text-white rounded-xl font-bold text-xs sm:text-sm shadow-md shadow-[#159A9C]/20 hover:shadow transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>Authenticating Credentials...</span>
                  </>
                ) : (
                  <>
                    <LogIn className="w-4 h-4 text-white" />
                    <span>LOGIN</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Quick Demo Helper & Autofill */}
          <div className="mt-5 pt-4 border-t border-slate-100">
            <div className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs">
              <div className="text-slate-600 truncate">
                <span className="font-semibold text-slate-700">Demo Admin:</span>{' '}
                <span className="font-mono text-slate-500">admin@medicare.com / admin123</span>
              </div>
              <button
                type="button"
                onClick={handleFillDemo}
                className="shrink-0 px-2.5 py-1 bg-white hover:bg-[#edf7f4] text-[#159A9C] hover:text-[#0f7a7c] border border-slate-200 hover:border-[#159A9C]/40 rounded-lg text-[11px] font-bold transition-colors"
              >
                Auto-fill
              </button>
            </div>
          </div>

          {/* Switch to Staff Portal */}
          <div className="mt-4 pt-3 text-center border-t border-slate-100">
            <button
              type="button"
              onClick={onSwitchToStaff}
              className="text-xs text-[#123B5D] hover:text-[#159A9C] font-semibold inline-flex items-center gap-1.5 transition-colors"
            >
              <span>Are you a Branch Billing Cashier? Switch to Staff POS</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#159A9C]" />
            </button>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0c2942]/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 p-6 space-y-4 text-slate-900">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#fdf6e9] text-[#D99A24] flex items-center justify-center border border-[#D99A24]/30">
                  <KeyRound className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#123B5D]">Administrator Credential Recovery</h3>
                  <p className="text-[11px] text-slate-500 font-normal">
                    Hospital Information Security Governance
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowForgotModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors"
                aria-label="Close dialog"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-600 leading-relaxed">
              <p>
                For compliance with hospital data security policies and HIPAA audit regulations,
                central administrator passwords cannot be reset automatically via public email.
              </p>

              <div className="p-3 bg-[#F7FAFC] rounded-xl border border-slate-200 space-y-1.5">
                <div className="font-semibold text-slate-800">Hospital IT Security Contacts:</div>
                <div className="flex items-center justify-between text-slate-600">
                  <span>IT Security Helpdesk:</span>
                  <span className="font-mono font-bold text-[#123B5D]">Ext. #4001</span>
                </div>
                <div className="flex items-center justify-between text-slate-600">
                  <span>Emergency Email:</span>
                  <span className="font-mono text-[#159A9C]">it-security@medicare.health</span>
                </div>
                <div className="flex items-center justify-between text-slate-600">
                  <span>Authorized Superadmin:</span>
                  <span className="font-semibold text-slate-700">Dr. Ramesh Kumar (HQ)</span>
                </div>
              </div>

              <div className="p-2.5 bg-[#edf7f4] border border-[#2E8B70]/30 rounded-xl text-[11px] text-[#2E8B70] flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>
                  Demo Credentials for testing: <strong>admin@medicare.com</strong> with password <strong>admin123</strong>
                </span>
              </div>
            </div>

            <div className="pt-2 flex gap-2">
              <button
                type="button"
                onClick={() => {
                  handleFillDemo();
                  setShowForgotModal(false);
                }}
                className="flex-1 py-2 px-3 rounded-xl bg-[#159A9C] hover:bg-[#0f7a7c] text-white text-xs font-bold shadow-xs transition-colors"
              >
                Use Demo Credentials
              </button>
              <button
                type="button"
                onClick={() => setShowForgotModal(false)}
                className="py-2 px-4 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-semibold transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

