import React, { useState, useEffect } from 'react';
import {
  Settings,
  Building2,
  FileText,
  Sliders,
  Bell,
  CheckCircle,
  Save,
  Printer,
  RotateCcw,
  Sparkles,
  Receipt,
  Phone,
  Mail,
  ShieldCheck,
} from 'lucide-react';
import { useApp, DEFAULT_SYSTEM_SETTINGS } from '../../context/AppContext';
import { FormLabel, PhoneInput, FieldError, RequiredAsterisk } from '../common/FormComponents';
import {
  validateRequired,
  validatePhone,
  validateEmail,
  validateAlertThreshold,
  sanitizePhoneInput,
} from '../../utils/validation';

export const AdminSettings: React.FC = () => {
  const { settings, updateSettings, showToast } = useApp();

  const [hospitalName, setHospitalName] = useState(settings.hospitalName);
  const [tagline, setTagline] = useState(settings.tagline);
  const [phone, setPhone] = useState(sanitizePhoneInput(settings.phone || '9876545210'));
  const [email, setEmail] = useState(settings.email);
  const [currency, setCurrency] = useState(settings.currency);
  const [invoicePrefix, setInvoicePrefix] = useState(settings.invoicePrefix);
  const [receiptFooter, setReceiptFooter] = useState(settings.receiptFooter);
  const [defaultThreshold, setDefaultThreshold] = useState<number | string>(settings.defaultLowStockThreshold || 10);
  const [enableLowStockAlerts, setEnableLowStockAlerts] = useState(settings.enableLowStockAlerts);
  const [autoDeductStock, setAutoDeductStock] = useState(settings.autoDeductStock !== false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Sync if settings in context change
  useEffect(() => {
    setHospitalName(settings.hospitalName);
    setTagline(settings.tagline);
    setPhone(sanitizePhoneInput(settings.phone || '9876545210'));
    setEmail(settings.email);
    setCurrency(settings.currency);
    setInvoicePrefix(settings.invoicePrefix);
    setReceiptFooter(settings.receiptFooter);
    setDefaultThreshold(settings.defaultLowStockThreshold || 10);
    setEnableLowStockAlerts(settings.enableLowStockAlerts);
    setAutoDeductStock(settings.autoDeductStock !== false);
  }, [settings]);

  const handleSave = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    const newErrors: Record<string, string> = {};

    const nameErr = validateRequired(hospitalName, 'Hospital / Organization Name');
    if (nameErr) newErrors.hospitalName = nameErr;

    const phoneErr = validatePhone(phone, true, 'Phone number');
    if (phoneErr) newErrors.phone = phoneErr;

    const emailErr = validateEmail(email, true, 'Admin Email');
    if (emailErr) newErrors.email = emailErr;

    const currencyErr = validateRequired(currency, 'Currency Symbol');
    if (currencyErr) newErrors.currency = currencyErr;

    const thresholdErr = validateAlertThreshold(defaultThreshold, 'Default Low Stock Threshold');
    if (thresholdErr) newErrors.defaultThreshold = thresholdErr;

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    const sanitizedName = hospitalName.trim() || 'MediCare Hospital & Healthcare Network';
    const sanitizedCurrency = currency.trim() || '₹';
    const sanitizedThreshold = Math.max(1, Number(defaultThreshold) || 10);

    updateSettings({
      hospitalName: sanitizedName,
      tagline: tagline.trim(),
      phone: phone.trim(),
      email: email.trim(),
      currency: sanitizedCurrency,
      invoicePrefix: invoicePrefix.trim(),
      receiptFooter: receiptFooter.trim() || 'Thank You! Visit Again · Valid prescription required for refills.',
      defaultLowStockThreshold: sanitizedThreshold,
      enableLowStockAlerts,
      autoDeductStock,
    });
    showToast('Hospital settings updated successfully.');
  };

  const handleResetDefaults = () => {
    setHospitalName(DEFAULT_SYSTEM_SETTINGS.hospitalName);
    setTagline(DEFAULT_SYSTEM_SETTINGS.tagline);
    setPhone(sanitizePhoneInput(DEFAULT_SYSTEM_SETTINGS.phone));
    setEmail(DEFAULT_SYSTEM_SETTINGS.email);
    setCurrency(DEFAULT_SYSTEM_SETTINGS.currency);
    setInvoicePrefix(DEFAULT_SYSTEM_SETTINGS.invoicePrefix);
    setReceiptFooter(DEFAULT_SYSTEM_SETTINGS.receiptFooter);
    setDefaultThreshold(DEFAULT_SYSTEM_SETTINGS.defaultLowStockThreshold);
    setEnableLowStockAlerts(DEFAULT_SYSTEM_SETTINGS.enableLowStockAlerts);
    setAutoDeductStock(DEFAULT_SYSTEM_SETTINGS.autoDeductStock !== false);
    setErrors({});

    updateSettings(DEFAULT_SYSTEM_SETTINGS);
    showToast('Settings reset to system defaults');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200">
        <div>
          <h2 className="text-xl font-bold text-[#123B5D] tracking-tight flex items-center gap-2">
            <Settings className="w-5 h-5 text-[#159A9C]" />
            <span>Hospital & System Settings</span>
          </h2>
          <p className="text-xs text-slate-500">
            Configure central branding, customer invoice headers, receipt slips, stock deduction rules, and alert thresholds
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={handleResetDefaults}
            className="px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-600 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs"
            title="Reset to factory defaults"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Defaults</span>
          </button>

          <button
            type="button"
            onClick={() => handleSave()}
            className="px-4 py-1.5 bg-[#159A9C] hover:bg-[#0f7a7c] text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save Changes</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Settings Form (2 Cols) */}
        <form onSubmit={handleSave} className="lg:col-span-2 space-y-6">
          {/* Hospital Branding */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-[#159A9C]" />
                <h3 className="font-bold text-[#123B5D] text-xs uppercase tracking-wider">
                  1. Organization & Network Identity
                </h3>
              </div>
              <span className="text-[10px] bg-[#eef8f8] text-[#159A9C] px-2 py-0.5 rounded font-medium">
                Dynamic Branding
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <FormLabel label="Hospital / Organization Name" required htmlFor="hospital-name" />
                <input
                  id="hospital-name"
                  type="text"
                  value={hospitalName}
                  onChange={(e) => {
                    setHospitalName(e.target.value);
                    if (errors.hospitalName) {
                      setErrors((prev) => {
                        const { hospitalName: _, ...rest } = prev;
                        return rest;
                      });
                    }
                  }}
                  placeholder="e.g. Apollo Care Hospital"
                  className={`w-full px-3 py-2 border rounded-lg text-xs focus:outline-none transition-colors ${
                    errors.hospitalName
                      ? 'border-red-500 bg-red-50/20 focus:ring-2 focus:ring-red-400 focus:border-red-500'
                      : 'border-slate-300 focus:ring-2 focus:ring-[#159A9C] focus:border-[#159A9C]'
                  }`}
                />
                <FieldError error={errors.hospitalName} />
                <p className="text-[10px] text-slate-400 mt-1">
                  Appears in invoice headers, customer slips, and central hospital branding
                </p>
              </div>

              <div>
                <FormLabel label="Tagline / Subheading" htmlFor="hospital-tagline" />
                <input
                  id="hospital-tagline"
                  type="text"
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  placeholder="e.g. Multi-Branch Clinical Operations & Pharmacy System"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-[#159A9C] focus:border-[#159A9C] focus:outline-none"
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  Displayed beneath the organization name on customer invoices & receipts
                </p>
              </div>

              <div>
                <FormLabel label="Central Contact Phone" required htmlFor="central-phone" />
                <PhoneInput
                  id="central-phone"
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
                <p className="text-[10px] text-slate-400 mt-1">
                  Central HQ inquiry number printed in customer invoice contact information
                </p>
              </div>

              <div>
                <FormLabel label="Central Admin Email" required htmlFor="central-email" />
                <input
                  id="central-email"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errors.email) {
                      setErrors((prev) => {
                        const { email: _, ...rest } = prev;
                        return rest;
                      });
                    }
                  }}
                  placeholder="e.g. admin@apollocare.com"
                  className={`w-full px-3 py-2 border rounded-lg text-xs focus:outline-none transition-colors ${
                    errors.email
                      ? 'border-red-500 bg-red-50/20 focus:ring-2 focus:ring-red-400 focus:border-red-500'
                      : 'border-slate-300 focus:ring-2 focus:ring-[#159A9C] focus:border-[#159A9C]'
                  }`}
                />
                <FieldError error={errors.email} />
                <p className="text-[10px] text-slate-400 mt-1">
                  Central administrative contact for hospital management communications
                </p>
              </div>
            </div>
          </div>

          {/* Billing & Invoice Receipt Configuration */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#2E8B70]" />
                <h3 className="font-bold text-[#123B5D] text-xs uppercase tracking-wider">
                  2. Customer Invoice & Receipt Parameters
                </h3>
              </div>
              <span className="text-[10px] bg-[#edf7f4] text-[#2E8B70] px-2 py-0.5 rounded font-medium">
                Thermal & Slip Format
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <FormLabel label="Currency Symbol" required htmlFor="currency-symbol" />
                <input
                  id="currency-symbol"
                  type="text"
                  value={currency}
                  onChange={(e) => {
                    setCurrency(e.target.value);
                    if (errors.currency) {
                      setErrors((prev) => {
                        const { currency: _, ...rest } = prev;
                        return rest;
                      });
                    }
                  }}
                  placeholder="e.g. ₹, $, €, £"
                  className={`w-full px-3 py-2 border rounded-lg text-xs font-mono font-bold focus:outline-none transition-colors ${
                    errors.currency
                      ? 'border-red-500 bg-red-50/20 focus:ring-2 focus:ring-red-400 focus:border-red-500'
                      : 'border-slate-300 focus:ring-2 focus:ring-[#159A9C] focus:border-[#159A9C]'
                  }`}
                />
                <FieldError error={errors.currency} />
                <p className="text-[10px] text-slate-400 mt-1">
                  Symbol applied to all price tags, totals, item rates, and customer bills
                </p>
              </div>

              <div>
                <FormLabel label="Invoice Number Prefix" htmlFor="invoice-prefix" />
                <input
                  id="invoice-prefix"
                  type="text"
                  value={invoicePrefix}
                  onChange={(e) => setInvoicePrefix(e.target.value)}
                  placeholder="e.g. MED-, INV-, AP-"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono font-semibold focus:ring-2 focus:ring-[#159A9C] focus:border-[#159A9C] focus:outline-none"
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  Prepended to all newly generated invoices (e.g. {invoicePrefix || ''}1006)
                </p>
              </div>

              <div className="md:col-span-2">
                <FormLabel label="Printed Receipt Footer Message" htmlFor="receipt-footer" />
                <textarea
                  id="receipt-footer"
                  rows={2}
                  value={receiptFooter}
                  onChange={(e) => setReceiptFooter(e.target.value)}
                  placeholder="Thank You! Visit Again · Valid prescription required for refills."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-[#159A9C] focus:border-[#159A9C] focus:outline-none"
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  Custom closing note printed at the bottom of customer receipts & downloaded slips
                </p>
              </div>
            </div>
          </div>

          {/* Stock Management & Automation Rules */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-[#159A9C]" />
                <h3 className="font-bold text-[#123B5D] text-xs uppercase tracking-wider">
                  3. Stock Automation & Alert Controls
                </h3>
              </div>
              <span className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-medium">
                Inventory Engine
              </span>
            </div>

            <div className="space-y-3.5 text-xs">
              {/* Real-time deduction */}
              <div className="flex items-center justify-between p-3.5 bg-[#F7FAFC] rounded-xl border border-slate-200 hover:border-slate-300 transition-colors">
                <div className="pr-4">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-900">
                      Automatic Real-Time Stock Deduction
                    </span>
                    <span
                      className={`text-[10px] px-2 py-0.2 rounded font-bold ${
                        autoDeductStock
                          ? 'bg-[#edf7f4] text-[#2E8B70]'
                          : 'bg-amber-50 text-amber-700'
                      }`}
                    >
                      {autoDeductStock ? 'ACTIVE' : 'PAUSED'}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    Instantly decrements branch-specific shelf inventory whenever staff creates a customer bill
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer shrink-0">
                  <input
                    type="checkbox"
                    checked={autoDeductStock}
                    onChange={(e) => setAutoDeductStock(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-10 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#159A9C]"></div>
                </label>
              </div>

              {/* Low stock alerts */}
              <div className="flex items-center justify-between p-3.5 bg-[#F7FAFC] rounded-xl border border-slate-200 hover:border-slate-300 transition-colors">
                <div className="pr-4">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-900">
                      Low Stock Threshold Triggers & Alerts
                    </span>
                    <span
                      className={`text-[10px] px-2 py-0.2 rounded font-bold ${
                        enableLowStockAlerts
                          ? 'bg-[#faecec] text-[#D95C5C]'
                          : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {enableLowStockAlerts ? 'MONITORING' : 'DISABLED'}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    Generates warning badges and notifications in Admin Portal when branch units drop below threshold
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer shrink-0">
                  <input
                    type="checkbox"
                    checked={enableLowStockAlerts}
                    onChange={(e) => setEnableLowStockAlerts(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-10 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#159A9C]"></div>
                </label>
              </div>

              {/* Default Threshold Input */}
              <div className="flex items-center justify-between p-3.5 bg-[#F7FAFC] rounded-xl border border-slate-200">
                <div>
                  <div className="font-semibold text-slate-900">
                    Default Low Stock Threshold
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    Fallback alert threshold (units) applied to medicines that do not have an individual limit set
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <input
                    type="number"
                    min="1"
                    max="1000"
                    value={defaultThreshold}
                    onChange={(e) => setDefaultThreshold(Math.max(1, parseInt(e.target.value, 10) || 1))}
                    className="w-20 px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-mono font-bold text-center focus:ring-2 focus:ring-[#159A9C] focus:border-[#159A9C] focus:outline-none"
                  />
                  <span className="text-slate-500 text-xs font-medium">units</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={handleResetDefaults}
              className="px-4 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold transition-colors"
            >
              Reset to Defaults
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-[#159A9C] hover:bg-[#0f7a7c] text-white rounded-lg text-xs font-bold shadow-xs transition-colors flex items-center gap-2"
            >
              <CheckCircle className="w-4 h-4" />
              <span>Save Configuration</span>
            </button>
          </div>
        </form>

        {/* Live Customer Invoice / Receipt Preview (1 Col) */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Receipt className="w-4 h-4 text-[#159A9C]" />
                <h3 className="font-bold text-[#123B5D] text-xs">Live Invoice & Slip Preview</h3>
              </div>
              <span className="inline-flex items-center gap-1 text-[10px] text-[#2E8B70] bg-[#edf7f4] px-2 py-0.5 rounded-full font-bold">
                <Sparkles className="w-3 h-3" />
                <span>Live Rendering</span>
              </span>
            </div>

            {/* Simulated Receipt Preview Box */}
            <div className="mt-3 bg-[#F8FAFC] border border-dashed border-slate-300 rounded-xl p-4 text-xs font-mono space-y-3 select-none">
              {/* Receipt Header */}
              <div className="text-center pb-3 border-b border-slate-200 font-sans">
                <img
                  src="/logo.png"
                  alt="MedBill Pro"
                  className="inline-block w-8 h-8 object-contain mb-1"
                />
                <div className="font-extrabold text-[#123B5D] text-sm uppercase tracking-tight leading-tight">
                  {hospitalName.trim() || 'HOSPITAL NAME'}
                </div>
                {tagline.trim() && (
                  <div className="text-[10px] text-slate-500 font-medium leading-tight mt-0.5">
                    {tagline.trim()}
                  </div>
                )}
                <div className="text-[10px] font-bold text-[#159A9C] mt-1">
                  Branch 1 - Main Hospital
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">
                  Central Phone: {phone.trim() || '+91 98765 45210'}
                </div>
                <div className="text-[9px] text-slate-400 mt-0.5">
                  DL No: DL-2026-HOSP-01 · GSTIN: 33AAAAA0000A1Z5
                </div>
              </div>

              {/* Meta items */}
              <div className="text-[11px] space-y-0.5 text-slate-700">
                <div className="flex justify-between">
                  <span className="text-slate-400">Bill No:</span>
                  <span className="font-bold text-[#123B5D]">#{invoicePrefix}1006</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Date/Time:</span>
                  <span>25 Sep 2026 10:30 AM</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Patient:</span>
                  <span>Walk-in Patient</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Cashier:</span>
                  <span>Staff Member</span>
                </div>
              </div>

              {/* Sample Table */}
              <div className="pt-2 border-t border-slate-200 text-[11px]">
                <div className="flex justify-between font-bold text-slate-800 pb-1 border-b border-slate-200">
                  <span>Item</span>
                  <span className="text-right">Qty × Rate</span>
                  <span className="text-right">Amount</span>
                </div>
                <div className="py-1 space-y-1 text-slate-600">
                  <div className="flex justify-between">
                    <span className="truncate max-w-[110px]">Paracetamol 500mg</span>
                    <span className="text-right">2 × {currency}10</span>
                    <span className="text-right font-bold text-slate-800">{currency}20.00</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="truncate max-w-[110px]">Amoxicillin 250mg</span>
                    <span className="text-right">1 × {currency}45</span>
                    <span className="text-right font-bold text-slate-800">{currency}45.00</span>
                  </div>
                </div>
                <div className="pt-2 border-t border-slate-300 flex justify-between items-center font-bold text-slate-900">
                  <span>TOTAL:</span>
                  <span className="text-sm font-black text-[#123B5D]">
                    {currency}65.00
                  </span>
                </div>
              </div>

              {/* Status Note */}
              <div className="pt-2 border-t border-slate-200 text-center text-[10px] space-y-1">
                <div className="text-slate-500 font-medium">
                  {autoDeductStock ? (
                    <span className="text-[#2E8B70] font-semibold">
                      * Real-Time Stock Deduction: Active *
                    </span>
                  ) : (
                    <span className="text-amber-700 font-semibold">
                      * Real-Time Stock Deduction: Paused *
                    </span>
                  )}
                </div>
                <div className="font-semibold text-slate-700 italic">
                  "{receiptFooter.trim() || 'Thank You! Visit Again'}"
                </div>
              </div>
            </div>

            {/* Quick Summary Badges */}
            <div className="mt-4 pt-3 border-t border-slate-100 space-y-2 text-xs">
              <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                System Status Summary
              </div>
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className="p-2 rounded-lg bg-slate-50 border border-slate-200">
                  <span className="text-slate-400 block text-[10px]">Prefix & Number</span>
                  <span className="font-mono font-bold text-[#123B5D]">{invoicePrefix}XXXX</span>
                </div>
                <div className="p-2 rounded-lg bg-slate-50 border border-slate-200">
                  <span className="text-slate-400 block text-[10px]">Active Currency</span>
                  <span className="font-mono font-bold text-[#159A9C]">{currency}</span>
                </div>
                <div className="p-2 rounded-lg bg-slate-50 border border-slate-200">
                  <span className="text-slate-400 block text-[10px]">Stock Deduction</span>
                  <span className={`font-semibold ${autoDeductStock ? 'text-[#2E8B70]' : 'text-amber-600'}`}>
                    {autoDeductStock ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
                <div className="p-2 rounded-lg bg-slate-50 border border-slate-200">
                  <span className="text-slate-400 block text-[10px]">Low Stock Limit</span>
                  <span className="font-semibold text-slate-800">≤ {defaultThreshold} units</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
