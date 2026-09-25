import React from 'react';
import { sanitizePhoneInput } from '../../utils/validation';

export const RequiredAsterisk: React.FC = () => (
  <span className="text-red-500 font-bold ml-0.5" aria-hidden="true">
    *
  </span>
);

interface FormLabelProps {
  label: string;
  required?: boolean;
  htmlFor?: string;
  className?: string;
  children?: React.ReactNode;
}

export const FormLabel: React.FC<FormLabelProps> = ({
  label,
  required = false,
  htmlFor,
  className = 'block font-semibold text-slate-700 mb-1',
  children,
}) => {
  return (
    <label htmlFor={htmlFor} className={className}>
      {label}
      {required && <RequiredAsterisk />}
      {children}
    </label>
  );
};

export const FieldError: React.FC<{ error?: string | null }> = ({ error }) => {
  if (!error) return null;
  return (
    <p className="text-[11px] text-red-500 mt-1 font-medium flex items-center gap-1 animate-in fade-in duration-150">
      <span>{error}</span>
    </p>
  );
};

interface PhoneInputProps {
  id?: string;
  value: string;
  onChange: (val: string) => void;
  error?: string | null;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  required?: boolean;
}

export const PhoneInput: React.FC<PhoneInputProps> = ({
  id,
  value,
  onChange,
  error,
  placeholder = '9876543210',
  disabled = false,
  className = '',
  required = false,
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only accept numeric digits and max 10 chars
    const sanitized = sanitizePhoneInput(e.target.value);
    onChange(sanitized);
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text');
    const sanitized = sanitizePhoneInput(pasted);
    onChange(sanitized);
  };

  return (
    <div className="w-full">
      <div className="flex rounded-lg shadow-2xs">
        <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-slate-300 bg-slate-100 text-slate-600 text-xs font-semibold select-none font-mono">
          +91
        </span>
        <input
          id={id}
          type="tel"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={10}
          value={value}
          onChange={handleChange}
          onPaste={handlePaste}
          disabled={disabled}
          placeholder={placeholder}
          required={required}
          className={`w-full px-3 py-2 border rounded-r-lg text-xs font-mono font-medium focus:outline-none transition-colors ${
            error
              ? 'border-red-500 bg-red-50/20 text-slate-900 focus:ring-2 focus:ring-red-400 focus:border-red-500'
              : 'border-slate-300 focus:ring-2 focus:ring-[#159A9C] focus:border-[#159A9C] bg-white text-slate-900'
          } ${disabled ? 'opacity-60 cursor-not-allowed bg-slate-100' : ''} ${className}`}
        />
      </div>
      <FieldError error={error} />
    </div>
  );
};
