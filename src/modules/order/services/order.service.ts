import type {
  CreateOrderData,
  Order,
  OrderFilters,
  OrderStatus,
  UpdateOrderData,
  CostIncurred,
  CreateCostIncurredData,
  UpdateCostIncurredData,
  CostIncurredFilters,
  OrderCostCalculation,
  CheckStockResponse,
  InsufficientStockResponse,
  ChangeStatusSuccessResponse,
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

  static async getOrdersSelection(fields: Array<string> = []): Promise<{
    customers: Customer[];
    products: Product[];
    supplies: Supply[];
    orders: Order[];
  }> {
    return axiosInstance.get("/orders/selection", {
      params: fields.length > 0 ? { fields: fields.join(",") } : {},
    });
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

  // Change order status
  static async changeOrderStatus(
    id: string,
    newStatus: OrderStatus
  ): Promise<ChangeStatusSuccessResponse | InsufficientStockResponse> {
    return axiosInstance.post(`/orders/${id}/change-status`, {
      status: newStatus,
    });
  }

  // Check stock availability before order export
  static async checkStockAvailability(
    orderId: string
  ): Promise<CheckStockResponse> {
    return axiosInstance.get(`/orders/${orderId}/check-stock`);
  }

  // Delete invoice (only drafts)
  static async deleteOrder(id: string): Promise<void> {
    return axiosInstance.delete(`/orders/${id}`);
  }

  // Cost Incurred methods
  static async getCostIncurredByOrderId(
    orderId: string,
    filters: CostIncurredFilters = {}
  ): Promise<ApiResponsePagination<CostIncurred[]>> {
    return axiosInstance.get(`/orders/${orderId}/cost-incurred`, {
      params: filters,
    });
  }

  static async getAllCostIncurred(
    filters: CostIncurredFilters = {}
  ): Promise<ApiResponsePagination<CostIncurred[]>> {
    return axiosInstance.get("/cost-incurred", { params: filters });
  }

  static async getCostIncurredById(id: string): Promise<CostIncurred | null> {
    return axiosInstance.get(`/cost-incurred/${id}`);
  }

  static async createCostIncurred(
    data: CreateCostIncurredData
  ): Promise<string> {
    return axiosInstance.post("/costs-incurred", data);
  }

  static async updateCostIncurred(
    id: string,
    data: UpdateCostIncurredData
  ): Promise<void> {
    return axiosInstance.patch(`/cost-incurred/${id}`, data);
  }

  static async deleteCostIncurred(id: string): Promise<void> {
    return axiosInstance.delete(`/cost-incurred/${id}`);
  }

  // Order Cost Calculation
  static async getOrderCostCalculation(
    orderId: string
  ): Promise<OrderCostCalculation> {
    return axiosInstance.get(`/supplies/orders/${orderId}/cost-calculation`);
  }
}
