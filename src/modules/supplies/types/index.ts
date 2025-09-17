import type { Timestamp } from "firebase/firestore";

export interface Supply {
  id: string;
  name: string;
  sku: string;
  description?: string;
  category: string;
  unit: string; // e.g., "kg", "piece", "liter", etc.
  currentStock: number;
  minStock: number; // minimum stock level for alerts
  purchasePrice: number; // giá mua
  salePrice: number; // giá bán
  supplierId?: string;
  location?: string; // storage location
  expiryDate?: Timestamp;
  isActive: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  supplier: {
    id: string;
    name: string;
  } | null;
}

export interface CreateSupplyData {
  name: string;
  sku: string;
  description?: string;
  category: string;
  unit: string;
  currentStock: number;
  minStock: number;
  purchasePrice: number;
  salePrice: number;
  supplierId?: string;
  location?: string;
  expiryDate?: Timestamp;
}

export interface UpdateSupplyData extends Partial<CreateSupplyData> {
  isActive?: boolean;
}

export interface SupplyFilters {
  category?: string;
  supplierId?: string;
  location?: string;
  isActive?: boolean;
  lowStock?: boolean; // filter for supplies below minimum stock
  search?: string; // search by name or SKU
  page?: number;
  limit?: number;
}

export interface SupplyListState {
  supplies: Supply[];
  loading: boolean;
  error: string | null;
  hasMore: boolean;
  total: number;
  page: number;
  pageSize: number;
}

export interface SupplyFormState {
  loading: boolean;
  error: string | null;
}

export interface StockMovement {
  id: string;
  supplyId: string;
  type: "in" | "out" | "adjustment" | "import"; // thêm type "import"
  quantity: number;
  unitPrice?: number; // giá nhập cho từng lần nhập
  totalValue?: number; // tổng giá trị giao dịch
  invoiceNumber?: string; // số hóa đơn
  reason?: string;
  performedBy?: string;
  createdAt: Timestamp;
}

export interface CreateStockMovementData {
  supplyId: string;
  type: "in" | "out" | "adjustment" | "import";
  quantity: number;
  unitPrice?: number;
  totalValue?: number;
  invoiceNumber?: string;
  reason?: string;
  performedBy?: string;
}

export interface SupplyImport {
  id: string;
  importDate: Date;
  invoiceNumber: string;
  supplierId: string;
  totalAmount: number;
  status: "pending" | "completed" | "cancelled" | "warehouse";
  notes?: string;
  items: SupplyImportItem[];
  supplier: {
    id: string;
    name: string;
  } | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface SupplyImportItem {
  supplyId: string;
  supplyName: string;
  sku: string;
  quantity: number;
  unitPrice: number;
  vatRate: number;
  totalPrice: number;
}

export interface CreateSupplyImportData {
  importDate: Date;
  invoiceNumber: string;
  supplierId: string;
  notes?: string;
  items: Omit<SupplyImportItem, "supplyName" | "sku">[];
}

export interface UpdateSupplyImportData
  extends Partial<CreateSupplyImportData> {
  status?: "pending" | "completed" | "warehouse" | "cancelled";
}

export interface SupplyImportFilters {
  supplierId?: string;
  status?: "pending" | "completed" | "warehouse" | "cancelled";
  dateFrom?: Timestamp;
  dateTo?: Timestamp;
  search?: string;
  page?: number;
  limit?: number;
}

export interface SupplyImportSummary {
  totalImports: number;
  pendingImports: number;
  completedImports: number;
  cancelledImports: number;
  totalAmountCompleted: number;
  totalAmountPending: number;
}
