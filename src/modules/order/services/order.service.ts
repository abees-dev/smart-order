import type {
  CreateOrderData,
  Order,
  OrderFilters,
  OrderStatus,
  UpdateOrderData,
} from "../types";
import type { ApiResponsePagination } from "@/types/response";
import axiosInstance from "@/utils/axios";
import type { Customer } from "@/modules/customer";
import type { Product } from "@/modules/product";
import type { Supply } from "@/modules/supplies";

export class OrderService {
  // Get all orders with filters and pagination (infinite loading)
  static async getAllOrders(
    filters: OrderFilters = {}
  ): Promise<ApiResponsePagination<Order[]>> {
    return axiosInstance.get("/orders", { params: filters });
  }

  static async getOrdersSelection(): Promise<{
    customers: Customer[];
    products: Product[];
    supplies: Supply[];
  }> {
    return axiosInstance.get("/orders/selection");
  }

  // Get order by ID
  static async getOrderById(id: string): Promise<Order | null> {
    return axiosInstance.get(`/orders/${id}`);
  }

  // Create new order
  static async createOrder(data: CreateOrderData): Promise<string> {
    return axiosInstance.post("/orders", data);
  }

  // Update order
  static async updateOrder(id: string, data: UpdateOrderData): Promise<void> {
    return axiosInstance.patch(`/orders/${id}`, data);
  }

  // Change invoice status
  static async changeOrderStatus(
    id: string,
    newStatus: OrderStatus
  ): Promise<void> {
    return axiosInstance.post(`/orders/${id}/change-status`, {
      status: newStatus,
    });
  }

  // Delete invoice (only drafts)
  static async deleteOrder(id: string): Promise<void> {
    return axiosInstance.delete(`/orders/${id}`);
  }
}
