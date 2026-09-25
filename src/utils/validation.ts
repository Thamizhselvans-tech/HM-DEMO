/**
 * Global Form Validation Utilities for MediCare Hospital System
 * Strictly enforces standardized validation rules across all forms:
 * - Red asterisk (*) on required fields
 * - Phone number: strictly 10 numeric digits, no symbols/spaces/+91 inside input
 * - Email format validation
 * - Password & password confirmation validation
 * - Positive and non-negative numeric/currency boundaries
 */

export const sanitizeDigitsOnly = (input: string, maxLen = 10): string => {
  return input.replace(/\D/g, '').slice(0, maxLen);
};

export const sanitizePhoneInput = (input: string): string => {
  return sanitizeDigitsOnly(input, 10);
};

export const validateRequired = (
  value: string | number | null | undefined,
  fieldLabel: string
): string | null => {
  if (value === null || value === undefined || String(value).trim() === '') {
    return `Please enter the ${fieldLabel.toLowerCase()}.`;
  }
  return null;
};

export const validatePhone = (
  phone: string | null | undefined,
  isRequired: boolean = false,
  fieldLabel: string = 'Phone number'
): string | null => {
  const clean = (phone || '').trim();

  if (!clean) {
    if (isRequired) {
      return `Please enter the ${fieldLabel.toLowerCase()}.`;
    }
    return null;
  }

  // Check if non-numeric characters exist
  if (/\D/.test(clean)) {
    return 'Phone number can contain digits only.';
  }

  // Exactly 10 digits
  if (clean.length !== 10) {
    return 'Phone number must contain exactly 10 digits.';
  }

  return null;
};

export const validateEmail = (
  email: string | null | undefined,
  isRequired: boolean = false,
  fieldLabel: string = 'Email address'
): string | null => {
  const clean = (email || '').trim();

  if (!clean) {
    if (isRequired) {
      return `Please enter the ${fieldLabel.toLowerCase()}.`;
    }
    return null;
  }

  // Basic email pattern check: user@domain.tld
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(clean)) {
    return 'Please enter a valid email address.';
  }

  return null;
};

export const validatePassword = (
  password: string | null | undefined,
  isRequired: boolean = true,
  minLength: number = 4
): string | null => {
  if (!password || password.trim() === '') {
    if (isRequired) {
      return 'Please enter the password.';
    }
    return null;
  }

  if (password.length < minLength) {
    return `Password must contain at least ${minLength} characters.`;
  }

  return null;
};

export const validatePasswordMatch = (
  password: string,
  confirmPassword: string
): string | null => {
  if (!confirmPassword) {
    return 'Please confirm your password.';
  }
  if (password !== confirmPassword) {
    return 'Passwords do not match.';
  }
  return null;
};

export const validateQuantity = (
  value: number | string | null | undefined,
  fieldLabel: string = 'Quantity'
): string | null => {
  if (value === null || value === undefined || value === '') {
    return `Please enter the ${fieldLabel.toLowerCase()}.`;
  }
  const num = Number(value);
  if (isNaN(num) || !Number.isInteger(num) || num <= 0) {
    return `${fieldLabel} must be a positive whole number.`;
  }
  return null;
};

export const validateStock = (
  value: number | string | null | undefined,
  fieldLabel: string = 'Stock'
): string | null => {
  if (value === null || value === undefined || value === '') {
    return `Please enter the ${fieldLabel.toLowerCase()}.`;
  }
  const num = Number(value);
  if (isNaN(num) || !Number.isInteger(num) || num < 0) {
    return `${fieldLabel} must be zero or a positive whole number.`;
  }
  return null;
};

export const validateAlertThreshold = (
  value: number | string | null | undefined,
  fieldLabel: string = 'Alert Threshold'
): string | null => {
  if (value === null || value === undefined || value === '') {
    return `Please enter the ${fieldLabel.toLowerCase()}.`;
  }
  const num = Number(value);
  if (isNaN(num) || !Number.isInteger(num) || num < 0) {
    return `${fieldLabel} must be zero or a positive whole number.`;
  }
  return null;
};

export const validateSellingRate = (
  value: number | string | null | undefined,
  fieldLabel: string = 'Selling Rate'
): string | null => {
  if (value === null || value === undefined || value === '') {
    return `Please enter the ${fieldLabel.toLowerCase()}.`;
  }
  const num = Number(value);
  if (isNaN(num) || num < 0) {
    return `${fieldLabel} must be a valid non-negative monetary value.`;
  }
  return null;
};
