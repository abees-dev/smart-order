import type { Timestamp } from "firebase/firestore";

export type InvoiceType = "input" | "output";
export type TaxType = "taxed" | "non-taxed"; // có thuế / không thuế

// Hoá đơn đầu vào - từ supply imports
export interface InputInvoice {
  id: string; // supply import id
  invoiceNumber: string;
  invoiceDate: Timestamp; // importDate
  supplierName: string;
  supplierId: string;
  subtotal: number; // tổng tiền chưa VAT
  vatAmount: number; // tổng tiền VAT
  totalAmount: number; // tổng cuối cùng
  taxType: TaxType; // có thuế nếu có ít nhất 1 item có VAT > 0
  status: "pending" | "completed" | "cancelled";
  notes?: string;
  items: InputInvoiceItem[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface InputInvoiceItem {
  supplyId: string;
  supplyName: string;
  sku: string;
  quantity: number;
  unitPrice: number;
  vatRate: number;
  vatAmount: number; // unitPrice * quantity * (vatRate/100)
  subtotal: number; // unitPrice * quantity (chưa VAT)
  totalPrice: number; // subtotal + vatAmount
}

// Hoá đơn đầu ra - từ completed orders
export interface OutputInvoice {
  id: string; // order id
  invoiceNumber: string; // orderNumber
  orderNumber: string;
  invoiceDate: Timestamp; // completedAt hoặc updatedAt
  customerName?: string;
  customerId?: string;
  subtotal: number; // subtotal từ order
  vatAmount: number; // vatAmount từ order
  totalAmount: number; // totalAmount từ order
  taxType: TaxType; // có thuế nếu vatRate > 0
  vatRate: number; // vatRate từ order
  status: "completed"; // chỉ lấy completed orders
  notes?: string;
  items: OutputInvoiceItem[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
  exportedAt?: Timestamp;
}

export interface OutputInvoiceItem {
  itemId: string; // productId hoặc supplyId
  itemName: string;
  itemCode: string; // productCode hoặc sku
  itemType: "product" | "supply";
  category: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  description?: string;
}

// Unified invoice view for listing
export interface InvoiceView {
  id: string;
  type: InvoiceType;
  invoiceNumber: string;
  invoiceDate: Timestamp;
  partnerName: string; // supplier name hoặc customer name
  partnerId?: string;
  subtotal: number;
  vatAmount: number;
  totalAmount: number;
  taxType: TaxType;
  status: string;
  createdAt: Timestamp;
}

// Filters
export interface InvoiceFilters {
  taxType?: TaxType; // taxed / non-taxed
  partnerId?: string; // supplierId hoặc customerId
  dateFrom?: Date;
  dateTo?: Date;
  search?: string; // tìm theo invoice number hoặc partner name
  page?: number;
  limit?: number;
}

export interface InvoiceListState {
  invoices: InvoiceView[];
  loading: boolean;
  error: string | null;
  hasMore: boolean;
  total: number;
  page: number;
  pageSize: number;
}

// Statistics
export interface InvoiceStats {
  totalInputInvoices: number;
  totalOutputInvoices: number;
  totalInputAmount: number;
  totalOutputAmount: number;
  taxedInputAmount: number;
  nonTaxedInputAmount: number;
  taxedOutputAmount: number;
  nonTaxedOutputAmount: number;
  totalVatInput: number;
  totalVatOutput: number;
}

// Tax summary by period
export interface TaxSummary {
  period: string; // YYYY-MM format
  inputVat: number; // VAT đầu vào
  outputVat: number; // VAT đầu ra
  netVat: number; // VAT phải nộp (outputVat - inputVat)
}
