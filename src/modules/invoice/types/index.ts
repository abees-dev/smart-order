import type { Timestamp } from "firebase/firestore";

export type InvoiceStatus =
  | "draft" // Nháp - vừa tạo
  | "confirmed" // Đã xác nhận
  | "exported" // Đã xuất kho (sẽ trừ vật tư)
  | "completed" // Hoàn thành
  | "cancelled"; // Đã hủy

export type InvoiceItemType = "product" | "supply";

export interface InvoiceItem {
  id?: string; // for temporary ID during creation
  type: InvoiceItemType; // product hoặc supply
  itemId: string; // productId hoặc supplyId
  itemName: string;
  itemCode: string; // productCode hoặc sku
  category: string; // category của item
  quantity: number;
  unitPrice: number; // giá tự field hoặc nhập thủ công
  totalPrice: number; // quantity * unitPrice
  description?: string;
}

export interface Invoice {
  id: string;
  invoiceNumber: string; // Số hóa đơn - unique
  customerId?: string; // optional khách hàng
  customerName?: string;
  status: InvoiceStatus;
  items: InvoiceItem[];
  subtotal: number; // tổng tiền chưa VAT
  vatRate: number; // % VAT
  vatAmount: number; // tiền VAT
  totalAmount: number; // tổng cuối cùng
  notes?: string;
  createdBy?: string;
  exportedAt?: Timestamp; // thời gian xuất kho
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface CreateInvoiceData {
  invoiceNumber: string;
  customerId?: string;
  customerName?: string;
  items: Omit<InvoiceItem, "id" | "itemName" | "itemCode">[];
  vatRate: number;
  notes?: string;
}

export interface UpdateInvoiceData {
  customerId?: string;
  customerName?: string;
  items?: Omit<InvoiceItem, "id" | "itemName" | "itemCode">[];
  vatRate?: number;
  notes?: string;
  status?: InvoiceStatus;
}

export interface InvoiceFilters {
  status?: InvoiceStatus;
  customerId?: string;
  dateFrom?: Date;
  dateTo?: Date;
  search?: string; // tìm theo invoiceNumber hoặc customerName
}

export interface InvoiceListState {
  invoices: Invoice[];
  loading: boolean;
  error: string | null;
  hasMore: boolean;
  total: number;
}

export interface InvoiceFormState {
  loading: boolean;
  error: string | null;
}

// Status transition rules
export const INVOICE_STATUS_TRANSITIONS: Record<
  InvoiceStatus,
  InvoiceStatus[]
> = {
  draft: ["confirmed", "cancelled"],
  confirmed: ["exported", "cancelled"],
  exported: ["completed", "cancelled"],
  completed: [], // Không thể chuyển từ completed
  cancelled: [], // Không thể chuyển từ cancelled
};

// Status labels for UI
export const INVOICE_STATUS_LABELS: Record<InvoiceStatus, string> = {
  draft: "Nháp",
  confirmed: "Đã xác nhận",
  exported: "Đã xuất kho",
  completed: "Hoàn thành",
  cancelled: "Đã hủy",
};

// Status colors for badges
export const INVOICE_STATUS_COLORS: Record<
  InvoiceStatus,
  "default" | "secondary" | "destructive" | "outline"
> = {
  draft: "outline",
  confirmed: "secondary",
  exported: "default",
  completed: "default",
  cancelled: "destructive",
};
