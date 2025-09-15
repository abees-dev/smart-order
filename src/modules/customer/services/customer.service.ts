import type {
  Customer,
  CreateCustomerData,
  UpdateCustomerData,
  CustomerFilters,
} from "../types";
import axiosInstance from "@/utils/axios";
import type { ApiResponsePagination } from "@/types/response";

export class CustomerService {
  static async getAllCustomers(
    filters: CustomerFilters = {}
  ): Promise<ApiResponsePagination<Customer[]>> {
    return await axiosInstance.get("/customers", { params: filters });
  }

  static async createCustomer(data: CreateCustomerData): Promise<Customer> {
    return await axiosInstance.post("/customers", data);
  }

  private static cleanUpdateData(
    data: UpdateCustomerData
  ): Partial<UpdateCustomerData> {
    const cleaned: Partial<UpdateCustomerData> = {};

    // Handle all possible fields
    if (data.name !== undefined) cleaned.name = data.name;
    if (data.phone !== undefined) cleaned.phone = data.phone;
    if (data.address !== undefined) cleaned.address = data.address;
    if (data.city !== undefined) cleaned.city = data.city;
    if (data.country !== undefined) cleaned.country = data.country;
    if (data.isActive !== undefined) cleaned.isActive = data.isActive;

    if (data.email !== undefined) {
      if (data.email && data.email.trim() !== "") {
        cleaned.email = data.email;
      }
    }

    if (data.contactPerson !== undefined) {
      if (data.contactPerson && data.contactPerson.trim() !== "") {
        cleaned.contactPerson = data.contactPerson;
      }
    }

    if (data.notes !== undefined) {
      if (data.notes && data.notes.trim() !== "") {
        cleaned.notes = data.notes;
      }
    }
    if (data.customerCode !== undefined) {
      cleaned.customerCode = data.customerCode.trim();
    }
    if (data.taxCode !== undefined) {
      cleaned.taxCode = data.taxCode.trim();
    }

    return cleaned;
  }

  static async updateCustomer(
    id: string,
    data: UpdateCustomerData
  ): Promise<unknown> {
    return await axiosInstance.patch(
      `/customers/${id}`,
      this.cleanUpdateData(data)
    );
  }

  static async deleteCustomer(id: string): Promise<unknown> {
    return await axiosInstance.delete(`/customers/${id}`);
  }
}
