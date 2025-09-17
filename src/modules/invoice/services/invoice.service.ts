import type {
  InputInvoice,
  OutputInvoice,
  InvoiceFilters,
  InputInvoiceSummary,
  OutputInvoiceSummary,
} from "../types";
import type { ApiResponsePagination } from "@/types/response";
import axiosInstance from "@/utils/axios";

export class InvoiceService {
  // Get input invoices from supply imports
  static async getInputInvoices(
    filters: Omit<InvoiceFilters, "type"> = {}
  ): Promise<ApiResponsePagination<InputInvoice[]>> {
    return axiosInstance.get("/invoice/input", { params: { ...filters } });
  }

  // Get output invoices from completed orders
  static async getOutputInvoices(
    filters: Omit<InvoiceFilters, "type"> = {}
  ): Promise<ApiResponsePagination<OutputInvoice[]>> {
    return axiosInstance.get("/invoice/output", { params: { ...filters } });
  }

  // Get input invoice summary
  static async getInputInvoiceSummary(
    filters: Omit<InvoiceFilters, "type"> = {}
  ): Promise<InputInvoiceSummary> {
    return axiosInstance.get("/invoice/input/summary", {
      params: { ...filters },
    });
  }

  // Get output invoice summary
  static async getOutputInvoiceSummary(
    filters: Omit<InvoiceFilters, "type"> = {}
  ): Promise<OutputInvoiceSummary> {
    return axiosInstance.get("/invoice/output/summary", {
      params: { ...filters },
    });
  }
}
