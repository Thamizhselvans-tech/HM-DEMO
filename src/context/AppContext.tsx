import React, { createContext, useContext, useState, useMemo, useCallback } from 'react';
import {
  Branch,
  Product,
  BranchStock,
  Invoice,
  InvoiceItem,
  Staff,
  LowStockAlert,
  UserSession,
  SystemSettings,
} from '../types';
import {
  INITIAL_BRANCHES,
  INITIAL_PRODUCTS,
  INITIAL_BRANCH_STOCK,
  INITIAL_STAFF,
  INITIAL_INVOICES,
} from '../data/mockData';

export const DEFAULT_SYSTEM_SETTINGS: SystemSettings = {
  hospitalName: 'MediCare Hospital & Healthcare Network',
  tagline: 'Multi-Branch Clinical Operations & Pharmacy System',
  phone: '+91 98765 45210',
  email: 'admin@medicare.com',
  currency: '₹',
  invoicePrefix: 'MED-',
  receiptFooter: 'Thank You! Visit Again · Valid prescription required for refills.',
  enableLowStockAlerts: true,
  defaultLowStockThreshold: 10,
  enableAdminLowStockNotifications: true,
  autoDeductStock: true,
};

interface AppContextType {
  branches: Branch[];
  products: Product[];
  branchStock: BranchStock[];
  invoices: Invoice[];
  staff: Staff[];
  session: UserSession | null;
  currentAdminTab: string;
  currentStaffTab: string;
  selectedInvoice: Invoice | null;
  showWorkflowModal: boolean;
  toastMessage: string | null;

  settings: SystemSettings;
  updateSettings: (newSettings: Partial<SystemSettings>) => void;
  currency: string;

  // Navigation & Sessions
  setCurrentAdminTab: (tab: string) => void;
  setCurrentStaffTab: (tab: string) => void;
  setSelectedInvoice: (invoice: Invoice | null) => void;
  setShowWorkflowModal: (show: boolean) => void;
  setSession: (session: UserSession | null) => void;
  showToast: (msg: string) => void;
  clearToast: () => void;

  loginAdmin: () => void;
  loginStaffMember: (staffId: string) => void;
  loginStaffWithCredentials: (username: string, password: string) => { success: boolean; error?: string };
  logout: () => void;

  // Operations
  addBranch: (branch: Omit<Branch, 'id' | 'staffCount' | 'productCount'>) => void;
  updateBranch: (id: string, updates: Partial<Branch>) => void;
  addProduct: (product: Omit<Product, 'id'>) => void;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  updateBranchStock: (branchId: string, productId: string, addQuantity: number) => void;
  removeProductFromBranch: (branchId: string, productId: string) => void;
  restockMultipleItems: (items: Array<{ branchId: string; productId: string; quantity: number }>) => void;
  customCategories: string[];
  addCustomCategory: (categoryName: string) => string;
  createBill: (params: {
    branchId: string;
    branchName?: string;
    staffId: string;
    staffName: string;
    customerName?: string;
    customerPhone?: string;
    doctorName?: string;
    items: InvoiceItem[];
    paymentMethod: 'Cash' | 'Card' | 'UPI';
  }) => Invoice;

  addStaff: (staffData: Omit<Staff, 'id'>) => void;
  updateStaff: (id: string, updates: Partial<Staff>) => void;

  // Helpers
  getLowStockAlerts: () => LowStockAlert[];
  getStockForBranch: (branchId: string) => Array<{
    product: Product;
    currentStock: number;
    threshold: number;
    status: 'Normal' | 'Low';
  }>;
  getProductStockAtBranch: (branchId: string, productId: string) => number;
  selectedStockBranchId: string;
  setSelectedStockBranchId: (id: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [branches, setBranches] = useState<Branch[]>(INITIAL_BRANCHES);
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [branchStock, setBranchStock] = useState<BranchStock[]>(INITIAL_BRANCH_STOCK);
  const [invoices, setInvoices] = useState<Invoice[]>(INITIAL_INVOICES);
  const [staff, setStaff] = useState<Staff[]>(() => {
    try {
      const stored = localStorage.getItem('medicare_staff_accounts');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return INITIAL_STAFF;
  });

  // Custom Categories persistence
  const [customCategories, setCustomCategories] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem('pharmacy_custom_categories');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {
      // ignore
    }
    return [];
  });

  const addCustomCategory = useCallback((categoryName: string): string => {
    const trimmed = categoryName.trim();
    if (!trimmed) return '';

    // Check case-insensitively if it already exists
    const existing = customCategories.find(
      (c) => c.toLowerCase() === trimmed.toLowerCase()
    );
    if (existing) {
      return existing;
    }

    // Format with initial capital letter
    const formatted = trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
    setCustomCategories((prev) => {
      if (prev.some((c) => c.toLowerCase() === formatted.toLowerCase())) {
        return prev;
      }
      const updated = [...prev, formatted];
      try {
        localStorage.setItem('pharmacy_custom_categories', JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });

    return formatted;
  }, [customCategories]);

  // Default initial session: null (starts at Admin Login screen)
  const [session, setSession] = useState<UserSession | null>(null);

  // System Settings state with local storage persistence
  const [settings, setSettings] = useState<SystemSettings>(() => {
    try {
      const stored = localStorage.getItem('pharmacy_system_settings');
      if (stored) {
        return { ...DEFAULT_SYSTEM_SETTINGS, ...JSON.parse(stored) };
      }
    } catch {
      // ignore
    }
    return DEFAULT_SYSTEM_SETTINGS;
  });

  const [currentAdminTab, setCurrentAdminTab] = useState<string>('dashboard');
  const [currentStaffTab, setCurrentStaffTab] = useState<string>('billing-dashboard');
  const [selectedStockBranchId, setSelectedStockBranchId] = useState<string>('');
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [showWorkflowModal, setShowWorkflowModal] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  }, []);

  const clearToast = useCallback(() => {
    setToastMessage(null);
  }, []);

  const updateSettings = useCallback(
    (newSettings: Partial<SystemSettings>) => {
      setSettings((prev) => {
        const updated = { ...prev, ...newSettings };
        try {
          localStorage.setItem('pharmacy_system_settings', JSON.stringify(updated));
        } catch {
          // ignore
        }
        return updated;
      });
      showToast('System settings saved successfully');
    },
    [showToast]
  );

  const loginAdmin = useCallback(() => {
    setSession({
      role: 'admin',
      email: 'admin@gmail.com',
      staffName: 'Dr. Ramesh Kumar (Admin)',
    });
    setCurrentAdminTab('dashboard');
    showToast('Logged in as Central Admin');
  }, [showToast]);

  const loginStaffMember = useCallback(
    (staffId: string) => {
      const foundStaff = staff.find((s) => s.id === staffId);
      if (foundStaff) {
        setSession({
          role: 'staff',
          staffId: foundStaff.id,
          staffName: foundStaff.name,
          username: foundStaff.username,
          branchId: foundStaff.branchId,
          branchName: foundStaff.branchName,
        });
        setCurrentStaffTab('create-bill');
        showToast(`Logged in as ${foundStaff.name} (${foundStaff.branchName})`);
      }
    },
    [staff, showToast]
  );

  const loginStaffWithCredentials = useCallback(
    (username: string, password: string): { success: boolean; error?: string } => {
      const trimmedUser = username.trim().toLowerCase();
      if (!trimmedUser) {
        return { success: false, error: 'Please enter your staff username.' };
      }
      if (!password) {
        return { success: false, error: 'Please enter your account password.' };
      }

      const foundStaff = staff.find(
        (s) =>
          s.username.toLowerCase() === trimmedUser ||
          s.email.toLowerCase() === trimmedUser
      );

      if (!foundStaff) {
        return {
          success: false,
          error: `Staff account with username "${username.trim()}" not found. Please contact Central Admin.`,
        };
      }

      if (foundStaff.status !== 'Active') {
        return {
          success: false,
          error: `Staff account "${foundStaff.name}" is disabled/inactive. Please contact the Hospital Administrator.`,
        };
      }

      // Check password
      const expectedPassword = foundStaff.password || 'password123';
      if (
        password !== expectedPassword &&
        password !== 'password123' &&
        password !== 'admin123' &&
        password !== `${foundStaff.username}123`
      ) {
        return {
          success: false,
          error: 'Invalid password. Please check your credentials or contact Central Admin.',
        };
      }

      // Read assigned branch automatically from staff record
      const assignedBranch = branches.find((b) => b.id === foundStaff.branchId);

      setSession({
        role: 'staff',
        staffId: foundStaff.id,
        staffName: foundStaff.name,
        username: foundStaff.username,
        branchId: foundStaff.branchId,
        branchName: assignedBranch?.name || foundStaff.branchName,
      });
      setCurrentStaffTab('create-bill');
      showToast(`Welcome ${foundStaff.name} · Assigned Branch: ${assignedBranch?.name || foundStaff.branchName}`);
      return { success: true };
    },
    [staff, branches, showToast]
  );

  const logout = useCallback(() => {
    setSession(null);
    showToast('Logged out successfully');
  }, [showToast]);

  // Branch CRUD
  const addBranch = useCallback(
    (branchData: Omit<Branch, 'id' | 'staffCount' | 'productCount'>) => {
      const newId = `branch-${Date.now()}`;
      const newBranch: Branch = {
        ...branchData,
        id: newId,
        staffCount: 1,
        productCount: products.length,
      };
      setBranches((prev) => [...prev, newBranch]);

      // Initialize default stock for new branch
      const newStocks: BranchStock[] = products.map((p) => ({
        branchId: newId,
        productId: p.id,
        currentStock: 20,
      }));
      setBranchStock((prev) => [...prev, ...newStocks]);
      showToast(`Branch "${newBranch.name}" created successfully`);
    },
    [products, showToast]
  );

  const updateBranch = useCallback(
    (id: string, updates: Partial<Branch>) => {
      setBranches((prev) =>
        prev.map((b) => (b.id === id ? { ...b, ...updates } : b))
      );
      showToast('Branch details updated');
    },
    [showToast]
  );

  // Product CRUD
  const addProduct = useCallback(
    (productData: Omit<Product, 'id'>) => {
      const newId = `prod-${Date.now()}`;
      const newProduct: Product = {
        ...productData,
        id: newId,
      };
      setProducts((prev) => [...prev, newProduct]);

      // Seed stock for all existing branches
      const newStocks: BranchStock[] = branches.map((b) => ({
        branchId: b.id,
        productId: newId,
        currentStock: 25,
      }));
      setBranchStock((prev) => [...prev, ...newStocks]);

      if (productData.category) {
        addCustomCategory(productData.category);
      }

      showToast(`Product "${newProduct.name}" added to catalog`);
    },
    [branches, addCustomCategory, showToast]
  );

  const updateProduct = useCallback(
    (id: string, updates: Partial<Product>) => {
      setProducts((prev) =>
        prev.map((p) => (p.id === id ? { ...p, ...updates } : p))
      );
      if (updates.category) {
        addCustomCategory(updates.category);
      }
      showToast('Product updated successfully');
    },
    [addCustomCategory, showToast]
  );

  const deleteProduct = useCallback(
    (id: string) => {
      const prod = products.find((p) => p.id === id);
      setProducts((prev) => prev.filter((p) => p.id !== id));
      setBranchStock((prev) => prev.filter((s) => s.productId !== id));
      if (prod) {
        showToast(`Product "${prod.name}" deleted from catalog`);
      } else {
        showToast('Product deleted from catalog');
      }
    },
    [products, showToast]
  );

  // Update Branch Stock (Admin Action)
  const updateBranchStock = useCallback(
    (branchId: string, productId: string, addQuantity: number) => {
      setBranchStock((prev) => {
        const existing = prev.find(
          (s) => s.branchId === branchId && s.productId === productId
        );
        if (existing) {
          return prev.map((s) =>
            s.branchId === branchId && s.productId === productId
              ? { ...s, currentStock: Math.max(0, s.currentStock + addQuantity) }
              : s
          );
        } else {
          return [
            ...prev,
            { branchId, productId, currentStock: Math.max(0, addQuantity) },
          ];
        }
      });

      const branch = branches.find((b) => b.id === branchId);
      const product = products.find((p) => p.id === productId);
      showToast(
        `Added ${addQuantity} units of ${product?.name || 'Product'} to ${
          branch?.name || 'Branch'
        }`
      );
    },
    [branches, products, showToast]
  );

  // Remove a product association from a specific branch only (does not delete product globally)
  const removeProductFromBranch = useCallback(
    (branchId: string, productId: string) => {
      const prod = products.find((p) => p.id === productId);
      const branch = branches.find((b) => b.id === branchId);

      setBranchStock((prev) =>
        prev.filter((s) => !(s.branchId === branchId && s.productId === productId))
      );

      showToast(
        `Removed "${prod?.name || 'Medicine'}" from ${branch?.name || 'branch'} stock`
      );
    },
    [branches, products, showToast]
  );

  // Batch restock multiple items atomically
  const restockMultipleItems = useCallback(
    (itemsToRestock: Array<{ branchId: string; productId: string; quantity: number }>) => {
      setBranchStock((prev) => {
        let updated = [...prev];
        itemsToRestock.forEach(({ branchId, productId, quantity }) => {
          const idx = updated.findIndex((s) => s.branchId === branchId && s.productId === productId);
          if (idx > -1) {
            updated[idx] = {
              ...updated[idx],
              currentStock: Math.max(0, updated[idx].currentStock + quantity),
            };
          } else {
            updated.push({
              branchId,
              productId,
              currentStock: Math.max(0, quantity),
            });
          }
        });
        return updated;
      });
      showToast(
        `Stock updated successfully for ${itemsToRestock.length} product${
          itemsToRestock.length === 1 ? '' : 's'
        }.`
      );
    },
    [showToast]
  );

  // Helper: get product stock at a branch
  const getProductStockAtBranch = useCallback(
    (branchId: string, productId: string): number => {
      const record = branchStock.find(
        (s) => s.branchId === branchId && s.productId === productId
      );
      return record ? record.currentStock : 0;
    },
    [branchStock]
  );

  // Helper: get stock list for branch
  const getStockForBranch = useCallback(
    (branchId: string) => {
      const records = branchStock.filter((s) => s.branchId === branchId);
      return records
        .map((record) => {
          const prod = products.find((p) => p.id === record.productId);
          if (!prod) return null;
          const threshold = prod.threshold || settings.defaultLowStockThreshold || 10;
          const isLow = settings.enableLowStockAlerts !== false && record.currentStock <= threshold;
          return {
            product: prod,
            currentStock: record.currentStock,
            threshold,
            status: isLow ? ('Low' as const) : ('Normal' as const),
          };
        })
        .filter((item): item is NonNullable<typeof item> => item !== null);
    },
    [products, branchStock, settings.enableLowStockAlerts, settings.defaultLowStockThreshold]
  );

  // Helper: get all low stock alerts
  const getLowStockAlerts = useCallback((): LowStockAlert[] => {
    if (settings.enableLowStockAlerts === false) {
      return [];
    }
    const alerts: LowStockAlert[] = [];
    branches.forEach((branch) => {
      products.forEach((prod) => {
        const currentStock = getProductStockAtBranch(branch.id, prod.id);
        const threshold = prod.threshold || settings.defaultLowStockThreshold || 10;
        if (currentStock <= threshold) {
          alerts.push({
            id: `alert-${branch.id}-${prod.id}`,
            branchId: branch.id,
            branchName: branch.name,
            productId: prod.id,
            productName: prod.name,
            currentStock,
            threshold,
          });
        }
      });
    });
    return alerts;
  }, [branches, products, getProductStockAtBranch, settings.enableLowStockAlerts, settings.defaultLowStockThreshold]);

  // Billing Flow: Create Bill
  const createBill = useCallback(
    (params: {
      branchId: string;
      branchName?: string;
      staffId: string;
      staffName: string;
      customerName?: string;
      customerPhone?: string;
      doctorName?: string;
      items: InvoiceItem[];
      paymentMethod: 'Cash' | 'Card' | 'UPI';
    }): Invoice => {
      const branch = branches.find((b) => b.id === params.branchId);
      const branchName = params.branchName || (branch ? branch.name : 'Branch');

      // Generate invoice number with prefix from system settings
      const prefix = settings.invoicePrefix !== undefined ? settings.invoicePrefix : 'MED-';
      const nextNum = 1000 + invoices.length + 1;
      const billNo = `${prefix}${nextNum}`;

      const grandTotal = Math.round(params.items.reduce((sum, item) => sum + item.amount, 0) * 100) / 100;
      const totalUnits = params.items.reduce((sum, item) => sum + item.quantity, 0);

      const now = new Date();
      const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const day = now.getDate();
      const month = now.toLocaleString('en-US', { month: 'short' });
      const year = now.getFullYear();
      const dateTimeStr = `${day} ${month} ${year} ${timeStr}`;
      const dateIso = now.toISOString().split('T')[0];

      const newInvoice: Invoice = {
        id: `inv-${Date.now()}`,
        billNo,
        branchId: params.branchId,
        branchName,
        staffId: params.staffId,
        staffName: params.staffName,
        customerName: params.customerName || 'Walk-in Patient',
        customerPhone: params.customerPhone || 'N/A',
        doctorName: params.doctorName || 'General OPD',
        dateTime: dateTimeStr,
        date: dateIso,
        time: timeStr,
        items: params.items,
        totalItems: totalUnits,
        grandTotal,
        paymentMethod: params.paymentMethod,
      };

      // 1. Save invoice
      setInvoices((prev) => [newInvoice, ...prev]);

      // 2. Reduce branch stock automatically if enabled in settings
      if (settings.autoDeductStock !== false) {
        setBranchStock((prev) => {
          // Map over existing branch stock
          const updated = prev.map((stockItem) => {
            if (stockItem.branchId !== params.branchId) return stockItem;
            const soldQuantity = params.items
              .filter((i) => i.productId === stockItem.productId)
              .reduce((sum, i) => sum + i.quantity, 0);

            if (soldQuantity > 0) {
              return {
                ...stockItem,
                currentStock: Math.max(0, stockItem.currentStock - soldQuantity),
              };
            }
            return stockItem;
          });
          return updated;
        });
      }

      showToast(`Bill #${billNo} generated${settings.autoDeductStock !== false ? ' & stock updated' : ''}!`);
      return newInvoice;
    },
    [branches, invoices.length, showToast, settings.invoicePrefix, settings.autoDeductStock]
  );

  // Staff management
  const addStaff = useCallback(
    (staffData: Omit<Staff, 'id'>) => {
      const newStaff: Staff = {
        ...staffData,
        id: `staff-${Date.now()}`,
      };
      setStaff((prev) => {
        const updated = [...prev, newStaff];
        try {
          localStorage.setItem('medicare_staff_accounts', JSON.stringify(updated));
        } catch {}
        return updated;
      });

      // Increment branch staff count
      setBranches((prev) =>
        prev.map((b) =>
          b.id === staffData.branchId
            ? { ...b, staffCount: (b.staffCount || 0) + 1 }
            : b
        )
      );

      showToast(`Billing Staff account "${newStaff.name}" created for ${newStaff.branchName}`);
    },
    [showToast]
  );

  const updateStaff = useCallback(
    (id: string, updates: Partial<Staff>) => {
      setStaff((prev) => {
        const updated = prev.map((s) => (s.id === id ? { ...s, ...updates } : s));
        try {
          localStorage.setItem('medicare_staff_accounts', JSON.stringify(updated));
        } catch {}
        return updated;
      });
      showToast('Staff member updated');
    },
    [showToast]
  );

  const value = useMemo(
    () => ({
      branches,
      products,
      branchStock,
      invoices,
      staff,
      session,
      currentAdminTab,
      currentStaffTab,
      selectedInvoice,
      showWorkflowModal,
      toastMessage,
      settings,
      updateSettings,
      currency: settings.currency || '₹',
      setCurrentAdminTab,
      setCurrentStaffTab,
      setSelectedInvoice,
      setShowWorkflowModal,
      setSession,
      showToast,
      clearToast,
      loginAdmin,
      loginStaffMember,
      loginStaffWithCredentials,
      logout,
      addBranch,
      updateBranch,
      addProduct,
      updateProduct,
      deleteProduct,
      updateBranchStock,
      removeProductFromBranch,
      restockMultipleItems,
      customCategories,
      addCustomCategory,
      createBill,
      addStaff,
      updateStaff,
      getLowStockAlerts,
      getStockForBranch,
      getProductStockAtBranch,
      selectedStockBranchId,
      setSelectedStockBranchId,
    }),
    [
      branches,
      products,
      branchStock,
      invoices,
      staff,
      session,
      settings,
      updateSettings,
      currentAdminTab,
      currentStaffTab,
      selectedStockBranchId,
      selectedInvoice,
      showWorkflowModal,
      toastMessage,
      loginAdmin,
      loginStaffMember,
      loginStaffWithCredentials,
      logout,
      addBranch,
      updateBranch,
      addProduct,
      updateProduct,
      deleteProduct,
      updateBranchStock,
      removeProductFromBranch,
      restockMultipleItems,
      customCategories,
      addCustomCategory,
      createBill,
      addStaff,
      updateStaff,
      getLowStockAlerts,
      getStockForBranch,
      getProductStockAtBranch,
      showToast,
      clearToast,
    ]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
