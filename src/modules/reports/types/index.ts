export type ReportPeriod =
  | "daily"
  | "weekly"
  | "monthly"
  | "quarterly"
  | "yearly"
  | "custom";
export type InvoiceType = "input" | "output";

// Báo cáo tổng quan
export interface ReportSummary {
  period: string; // YYYY-MM format or period_dateFrom_dateTo
  totalInputAmount: number; // Tổng tiền hóa đơn đầu vào
  totalOutputAmount: number; // Tổng tiền hóa đơn đầu ra
  totalInputVat: number; // Tổng VAT đầu vào
  totalOutputVat: number; // Tổng VAT đầu ra
  netVat: number; // VAT phải nộp (outputVat - inputVat)
  profit: number; // Lợi nhuận = totalOutputAmount - totalInputAmount
  additionalCosts: number; // Chi phí phát sinh
  netProfit: number; // Lợi nhuận ròng = profit - additionalCosts
  inputInvoiceCount: number; // Số lượng hóa đơn đầu vào
  outputInvoiceCount: number; // Số lượng hóa đơn đầu ra
}

// Chi phí phát sinh (Updated for API)
export interface AdditionalCost {
  id: string;
  orderId?: string; // Liên kết với đơn hàng (nếu có)
  costType: string; // Loại chi phí: "transport", "labor", "materials", "other"
  description: string; // Mô tả chi phí
  amount: number; // Số tiền
  quantity: number; // Số lượng
  unitPrice: number; // Đơn giá
  supplier?: string; // Nhà cung cấp
  invoiceNumber?: string; // Số hóa đơn
  incurredDate: string; // Ngày phát sinh (ISO string)
  notes?: string;
  createdBy?: string; // Người tạo
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
}

// Data cho biểu đồ
export interface ChartData {
  period: string; // YYYY-MM
  inputAmount: number;
  outputAmount: number;
  profit: number;
  additionalCosts: number;
  netProfit: number;
  inputVat: number;
  outputVat: number;
  netVat: number;
}

// Chi tiết báo cáo theo tháng
export interface MonthlyReport {
  period: string; // YYYY-MM
  summary: ReportSummary;
  topSuppliers: SupplierSummary[];
  topCustomers: CustomerSummary[];
  topProducts: ProductSummary[];
  additionalCosts: AdditionalCost[];
  invoiceBreakdown: InvoiceBreakdown;
}

// Tóm tắt nhà cung cấp (Updated for API)
export interface SupplierSummary {
  supplierId: string;
  supplierName: string;
  totalAmount: number;
  totalVat: number;
  invoiceCount: number;
  lastInvoiceDate: string; // ISO string
}

// Tóm tắt khách hàng (Updated for API)
export interface CustomerSummary {
  customerId?: string;
  customerName?: string;
  totalAmount: number;
  totalVat: number;
  invoiceCount: number;
  lastInvoiceDate: string; // ISO string
}

// Tóm tắt sản phẩm
export interface ProductSummary {
  itemId: string;
  itemName: string;
  itemType: "product" | "supply";
  category: string;
  quantitySold: number;
  totalRevenue: number;
  averagePrice: number;
}

// Phân tích hóa đơn
export interface InvoiceBreakdown {
  input: {
    taxed: number; // Hóa đơn có thuế
    nonTaxed: number; // Hóa đơn không thuế
    totalCount: number;
  };
  output: {
    taxed: number;
    nonTaxed: number;
    totalCount: number;
  };
}

// Bộ lọc báo cáo (Updated for API)
export interface ReportFilters {
  period: ReportPeriod;
  dateFrom?: Date;
  dateTo?: Date;
  month?: string; // YYYY-MM format
  year?: string; // YYYY format
  invoiceType?: InvoiceType;
  includeAdditionalCosts?: boolean;
}

// State cho báo cáo
export interface ReportState {
  summary: ReportSummary | null;
  chartData: ChartData[];
  monthlyReports: MonthlyReport[];
  additionalCosts: AdditionalCost[];
  loading: boolean;
  error: string | null;
  filters: ReportFilters;
}

// Form data cho chi phí phát sinh (Updated for API)
export interface CreateAdditionalCostData {
  orderId?: string;
  costType: string;
  description: string;
  amount: number;
  quantity: number;
  unitPrice: number;
  supplier?: string;
  invoiceNumber?: string;
  incurredDate: Date; // Will be converted to ISO string
  notes?: string;
}

export interface UpdateAdditionalCostData
  extends Partial<CreateAdditionalCostData> {
  id: string;
}

// Báo cáo so sánh
export interface ComparisonReport {
  currentPeriod: ReportSummary;
  previousPeriod: ReportSummary;
  growth: {
    inputAmount: number; // % tăng trưởng
    outputAmount: number;
    profit: number;
    netProfit: number;
  };
}

// Export options
export interface ExportOptions {
  format: "excel" | "pdf" | "csv";
  period: string;
  includeCharts: boolean;
  includeDetails: boolean;
}

// Additional interfaces for API responses
export interface InputInvoice {
  id: string;
  supplierId: string;
  supplierName: string;
  totalAmount: number;
  vatAmount: number;
  taxType: "taxed" | "non-taxed";
  items: InvoiceItem[];
  createdAt: string; // ISO string
  status: string;
}

export interface OutputInvoice {
  id: string;
  customerId?: string;
  customerName?: string;
  totalAmount: number;
  vatAmount: number;
  taxType: "taxed" | "non-taxed";
  items: InvoiceItem[];
  createdAt: string; // ISO string
  status: string;
}

export interface InvoiceItem {
  itemId: string;
  itemName: string;
  itemType: "product" | "supply";
  category: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}
