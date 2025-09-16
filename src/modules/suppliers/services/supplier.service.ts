import type {
  Supplier,
  CreateSupplierData,
  UpdateSupplierData,
  SupplierFilters,
} from "../types";
import type { ApiResponsePagination } from "@/types/response";
import axiosInstance from "@/utils/axios";

export class SupplierService {
  static async getAllSuppliers(
    filters: SupplierFilters = {}
  ): Promise<ApiResponsePagination<Supplier[]>> {
    return await axiosInstance.get("/suppliers", { params: filters });
  }

  static async getSupplierById(id: string): Promise<Supplier | null> {
    return await axiosInstance.get(`/suppliers/${id}`);
  }

  static async createSupplier(data: CreateSupplierData) {
    return await axiosInstance.post("/suppliers", data);
  }

  static async updateSupplier(
    id: string,
    data: UpdateSupplierData
  ): Promise<void> {
    return await axiosInstance.patch(`/suppliers/${id}`, data);
  }

  static async deleteSupplier(id: string): Promise<void> {
    return await axiosInstance.delete(`/suppliers/${id}`);
  }

  static async toggleSupplierStatus(id: string): Promise<void> {
    try {
      const supplier = await this.getSupplierById(id);
      if (!supplier) {
        throw new Error("Nhà cung cấp không tồn tại");
      }

      await this.updateSupplier(id, {
        isActive: !supplier.isActive,
      });
    } catch (error) {
      console.error("Error toggling supplier status:", error);
      throw new Error("Không thể thay đổi trạng thái nhà cung cấp");
    }
  }

  static async getAllSuppliersSelection(): Promise<Supplier[]> {
    return axiosInstance.get("/suppliers/selection");
  }
}
