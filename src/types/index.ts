export interface Branch {
  id: string;
  name: string;
  code: string;
  city: string;
  location: string;
  address: string;
  phone: string;
  staffCount: number;
  productCount: number;
  status: 'Active' | 'Inactive';
}

export interface Product {
  id: string;
  name: string;
  category: string;
  rate: number;
  threshold: number;
  status: 'Active' | 'Inactive';
  unit?: string;
  batchNo?: string;
}

export interface BranchStock {
  branchId: string;
  productId: string;
  currentStock: number;
}

export interface InvoiceItem {
  productId: string;
  productName: string;
  rate: number;
  quantity: number;
  amount: number;
}

export type BillItemInput = InvoiceItem;

export interface Invoice {
  id: string;
  billNo: string;
  branchId: string;
  branchName: string;
  staffId: string;
  staffName: string;
  customerName?: string;
  customerPhone?: string;
  doctorName?: string;
  dateTime: string; // e.g. "24 Sep 2026 10:30 AM"
  date: string; // "2026-09-24"
  time: string; // "10:30 AM"
  items: InvoiceItem[];
  totalItems: number;
  grandTotal: number;
  paymentMethod: 'Cash' | 'Card' | 'UPI';
}

export interface Staff {
  id: string;
  name: string;
  username: string;
  email: string;
  phone: string;
  branchId: string;
  branchName: string;
  role: 'Admin' | 'Billing Staff' | 'ADMIN' | 'BILLING_STAFF';
  status: 'Active' | 'Inactive';
  password?: string;
}

export interface LowStockAlert {
  id: string;
  branchId: string;
  branchName: string;
  productId: string;
  productName: string;
  currentStock: number;
  threshold: number;
}

export type UserRole = 'admin' | 'staff' | 'ADMIN' | 'BILLING_STAFF';

export interface UserSession {
  role: UserRole;
  staffId?: string;
  staffName?: string;
  branchId?: string;
  branchName?: string;
  email?: string;
  username?: string;
}

export interface SystemSettings {
  hospitalName: string;
  tagline: string;
  phone: string;
  email: string;
  currency: string;
  invoicePrefix: string;
  receiptFooter: string;
  enableLowStockAlerts: boolean;
  defaultLowStockThreshold: number;
  enableAdminLowStockNotifications: boolean;
  autoDeductStock?: boolean;
}
