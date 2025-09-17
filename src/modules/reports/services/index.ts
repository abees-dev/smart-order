import axiosInstance from "@/utils/axios";
import type {
  ReportSummary,
  ChartData,
  MonthlyReport,
  SupplierSummary,
  CustomerSummary,
  ProductSummary,
  InvoiceBreakdown,
  ComparisonReport,
  InputInvoice,
  OutputInvoice,
} from "../types";

// Service cho báo cáo
export class ReportService {
  // Tạo báo cáo tổng quan
  static async generateSummary(
    period: "daily" | "weekly" | "monthly" | "quarterly" | "yearly",
    dateFrom: Date,
    dateTo: Date
  ): Promise<ReportSummary> {
    const params = new URLSearchParams({
      period,
      dateFrom: dateFrom.toISOString(),
      dateTo: dateTo.toISOString(),
    });

    const response: ReportSummary = await axiosInstance.get(
      `/reports/summary?${params}`
    );
    return response;
  }

  // Tạo dữ liệu biểu đồ theo khoảng thời gian
  static async generateChartData(
    period: "daily" | "weekly" | "monthly" | "quarterly" | "yearly",
    dateFrom: Date,
    dateTo: Date
  ): Promise<ChartData[]> {
    const params = new URLSearchParams({
      period,
      dateFrom: dateFrom.toISOString(),
      dateTo: dateTo.toISOString(),
    });

    const response: ChartData[] = await axiosInstance.get(
      `/reports/chart-data?${params}`
    );
    return response;
  }

  // Lấy báo cáo tháng đầy đủ
  static async generateMonthlyReport(month: string): Promise<MonthlyReport> {
    const response: MonthlyReport = await axiosInstance.get(
      `/reports/monthly?month=${month}`
    );
    return response;
  }

  // So sánh báo cáo giữa hai kỳ
  static async generateComparisonReport(
    currentPeriod: string,
    previousPeriod: string
  ): Promise<ComparisonReport> {
    const params = new URLSearchParams({
      currentPeriod,
      previousPeriod,
    });

    const response: ComparisonReport = await axiosInstance.get(
      `/reports/comparison?${params}`
    );
    return response;
  }

  // Lấy top nhà cung cấp
  static async getTopSuppliers(
    dateFrom: Date,
    dateTo: Date,
    limit = 10
  ): Promise<SupplierSummary[]> {
    const params = new URLSearchParams({
      dateFrom: dateFrom.toISOString(),
      dateTo: dateTo.toISOString(),
      limit: limit.toString(),
    });

    const response: SupplierSummary[] = await axiosInstance.get(
      `/reports/top-suppliers?${params}`
    );
    return response;
  }

  // Lấy top khách hàng
  static async getTopCustomers(
    dateFrom: Date,
    dateTo: Date,
    limit = 10
  ): Promise<CustomerSummary[]> {
    const params = new URLSearchParams({
      dateFrom: dateFrom.toISOString(),
      dateTo: dateTo.toISOString(),
      limit: limit.toString(),
    });

    const response: CustomerSummary[] = await axiosInstance.get(
      `/reports/top-customers?${params}`
    );
    return response;
  }

  // Lấy top sản phẩm/vật tư
  static async getTopProducts(
    dateFrom: Date,
    dateTo: Date,
    limit = 10
  ): Promise<ProductSummary[]> {
    const params = new URLSearchParams({
      dateFrom: dateFrom.toISOString(),
      dateTo: dateTo.toISOString(),
      limit: limit.toString(),
    });

    const response: ProductSummary[] = await axiosInstance.get(
      `/reports/top-products?${params}`
    );
    return response;
  }

  // Phân tích hóa đơn
  static async getInvoiceBreakdown(
    period: "daily" | "weekly" | "monthly" | "quarterly" | "yearly",
    dateFrom: Date,
    dateTo: Date
  ): Promise<InvoiceBreakdown> {
    const params = new URLSearchParams({
      period,
      dateFrom: dateFrom.toISOString(),
      dateTo: dateTo.toISOString(),
    });

    const response: InvoiceBreakdown = await axiosInstance.get(
      `/reports/invoice-breakdown?${params}`
    );
    return response;
  }

  // Lấy hóa đơn đầu vào
  static async getInputInvoices(
    period: "daily" | "weekly" | "monthly" | "quarterly" | "yearly",
    dateFrom: Date,
    dateTo: Date
  ): Promise<InputInvoice[]> {
    const params = new URLSearchParams({
      period,
      dateFrom: dateFrom.toISOString(),
      dateTo: dateTo.toISOString(),
    });

    const response: InputInvoice[] = await axiosInstance.get(
      `/reports/input-invoices?${params}`
    );
    return response;
  }

  // Lấy hóa đơn đầu ra
  static async getOutputInvoices(
    period: "daily" | "weekly" | "monthly" | "quarterly" | "yearly",
    dateFrom: Date,
    dateTo: Date
  ): Promise<OutputInvoice[]> {
    const params = new URLSearchParams({
      period,
      dateFrom: dateFrom.toISOString(),
      dateTo: dateTo.toISOString(),
    });

    const response: OutputInvoice[] = await axiosInstance.get(
      `/reports/output-invoices?${params}`
    );
    return response;
  }
}
