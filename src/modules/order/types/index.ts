import type { Timestamp } from "firebase/firestore";

export type OrderStatus =
  | "draft" // Nháp - vừa tạo
  | "confirmed" // Đã xác nhận
  | "exported" // Đã xuất kho (sẽ trừ vật tư)
  | "completed" // Hoàn thành
  | "cancelled"; // Đã hủy

export type OrderItemType = "product" | "supply";

export interface OrderItem {
  id?: string; // for temporary ID during creation
  type: OrderItemType; // product hoặc supply
  itemId: string; // productId hoặc supplyId
  quantity: number;
  unitPrice: number; // giá tự field hoặc nhập thủ công
  totalPrice: number; // quantity * unitPrice
  description?: string;
}

export interface Order {
  id: string;
  orderNumber: string; // Số đơn hàng - unique
  customerId?: string; // optional khách hàng
  customerName?: string;
  status: OrderStatus;
  items: OrderItem[];
  subtotal: number; // tổng tiền chưa VAT
  vatRate: number; // % VAT
  vatAmount: number; // tiền VAT
  totalAmount: number; // tổng cuối cùng
  notes?: string;
  createdBy?: string;
  exportedAt?: Timestamp; // thời gian xuất kho
  cancelledAt?: Timestamp; // thời gian hủy
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface CreateOrderData {
  orderNumber: string;
  customerId?: string;
  customerName?: string;
  items: Omit<OrderItem, "id" | "itemName" | "itemCode">[];
  vatRate: number;
  notes?: string;
}

export interface UpdateOrderData {
  customerId?: string;
  customerName?: string;
  items?: Omit<OrderItem, "id" | "itemName" | "itemCode">[];
  vatRate?: number;
  notes?: string;
  status?: OrderStatus;
}

export interface OrderFilters {
  status?: OrderStatus;
  customerId?: string;
  dateFrom?: Date;
  dateTo?: Date;
  search?: string;
  page?: number;
  limit?: number;
}

export interface OrderListState {
  orders: Order[];
  loading: boolean;
  error: string | null;
  hasMore: boolean;
  total: number;
  page: number;
  pageSize: number;
}

export interface OrderFormState {
  loading: boolean;
  error: string | null;
}

// Status transition rules
export const ORDER_STATUS_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  draft: ["confirmed", "cancelled"],
  confirmed: ["exported", "cancelled"],
  exported: ["completed", "cancelled"],
  completed: [], // Không thể chuyển từ completed
  cancelled: [], // Không thể chuyển từ cancelled
};

// Status labels for UI
export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  draft: "Nháp",
  confirmed: "Đã xác nhận",
  exported: "Đã xuất kho",
  completed: "Hoàn thành",
  cancelled: "Đã hủy",
};

// Status colors for badges
export const ORDER_STATUS_COLORS: Record<
  OrderStatus,
  "info" | "success" | "warning" | "error" | "violet" | "neutral"
> = {
  draft: "neutral",
  confirmed: "warning",
  exported: "info",
  completed: "success",
  cancelled: "error",
};
