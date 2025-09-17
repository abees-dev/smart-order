import type {
  Supply,
  CreateSupplyData,
  UpdateSupplyData,
  SupplyFilters,
  SupplyImport,
  CreateSupplyImportData,
  UpdateSupplyImportData,
  SupplyImportFilters,
  SupplyImportSummary,
} from "../types";
import type { ApiResponsePagination } from "@/types/response";
import axiosInstance from "@/utils/axios";

export class SupplyService {
  static async getAllSupplies(
    filters: SupplyFilters = {}
  ): Promise<ApiResponsePagination<Supply[]>> {
    return axiosInstance.get("/supplies", { params: filters });
  }

  static async getSuppliesSelection(): Promise<Supply[]> {
    return await axiosInstance.get("/supplies/selection");
  }

  static async getSupplyById(id: string): Promise<Supply | null> {
    const response = await axiosInstance.get(`/supplies/${id}`);
    return response.data;
  }

  static async createSupply(data: CreateSupplyData): Promise<unknown> {
    return axiosInstance.post("/supplies", data);
  }

  static async updateSupply(id: string, data: UpdateSupplyData): Promise<void> {
    return axiosInstance.patch(`/supplies/${id}`, data);
  }

  static async deleteSupply(id: string): Promise<void> {
    return axiosInstance.delete(`/supplies/${id}`);
  }

  // Supply Import methods
  static async createSupplyImport(
    data: CreateSupplyImportData
  ): Promise<unknown> {
    return axiosInstance.post("/supplies/imports", data);
  }

  static async completeSupplyImport(importId: string): Promise<void> {
    return axiosInstance.patch(`/supplies/imports/${importId}`, {
      status: "completed",
    });
  }

  static async addToWarehouseSupply(importId: string): Promise<void> {
    return axiosInstance.post(`/supplies/imports/${importId}/add-to-warehouse`);
  }

  static async getAllSupplyImports(
    filters: SupplyImportFilters = {}
  ): Promise<ApiResponsePagination<SupplyImport[]>> {
    return axiosInstance.get("/supplies/imports", { params: filters });
  }

  static async getSupplySummary(): Promise<SupplyImportSummary> {
    return axiosInstance.get("/supplies/imports/summary");
  }

  static async getSupplyImportById(id: string): Promise<SupplyImport | null> {
    return await axiosInstance.get(`/supplies/imports/${id}`);
  }

  static async updateSupplyImport(
    importId: string,
    data: UpdateSupplyImportData
  ): Promise<void> {
    return axiosInstance.patch(`/supplies/imports/${importId}`, data);
  }

  static async cancelSupplyImport(importId: string): Promise<void> {
    return axiosInstance.patch(`/supplies/imports/${importId}`, {
      status: "cancelled",
    });
  }

  static async deleteSupplyImport(importId: string): Promise<void> {
    return axiosInstance.delete(`/supplies/imports/${importId}`);
  }
}
