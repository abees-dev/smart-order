export type OrderStatus =
  | "draft" // Nháp - vừa tạo
  | "confirmed" // Đã xác nhận
  | "exported" // Đã xuất kho (sẽ trừ vật tư)
  | "completed" // Hoàn thành
  | "cancelled"; // Đã hủy

export type OrderItemType = "product" | "supply";

export interface OrderItem {
  id?: string; // for temporary ID during creation
  orderId?: string;
  type: OrderItemType; // product hoặc supply
  itemId: string; // productId hoặc supplyId
  quantity: number;
  unitPrice: number; // giá tự field hoặc nhập thủ công
  totalPrice: number; // quantity * unitPrice
  description?: string;
  createdAt?: Date | string;
  updatedAt?: Date | string;
  itemData?: {
    id: string;
    name: string;
    sku?: string;
    description?: string;
    category?: string;
    unit?: string;
    currentStock?: number;
    minStock?: number;
    purchasePrice?: number;
    salePrice?: number;
    supplierId?: string;
    location?: string;
    expiryDate?: Date | string | null;
    isActive?: boolean;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    supplier?: {
      id: string;
      name: string;
    };
  };
}

export interface Order {
  id: string;
  orderNumber: string; // Số đơn hàng - unique
  customerId?: string | null; // optional khách hàng
  customerName?: string;
  status: OrderStatus;
  items: OrderItem[];
  subtotal: number; // tổng tiền chưa VAT
  vatRate: number; // % VAT
  vatAmount: number; // tiền VAT
  totalAmount: number; // tổng cuối cùng
  notes?: string | null;
  createdBy?: string | null;
  exportedAt?: Date | string | null; // thời gian xuất kho
  cancelledAt?: Date | string | null; // thời gian hủy
  createdAt: Date | string;
  updatedAt: Date | string;
  // Extended fields from API response
  customer?: {
    id: string;
    name: string;
  } | null;
  costsIncurred?: CostIncurred[];
  maintenanceHistory?: MaintenanceRecord[];
  costSummary?: {
    totalCostsIncurred: number;
    costsByType: Record<string, number>;
  };
  maintenanceSummary?: {
    totalMaintenanceCost: number;
    maintenanceCountByType: Record<string, number>;
    lastMaintenanceDate: Date | string | null;
    upcomingMaintenance: Date | string | null;
  };
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

// Cost Incurred types and interfaces
export type CostType =
  | "material"
  | "labor"
  | "equipment"
  | "transport"
  | "other";

export interface CostIncurred {
  id?: string;
  orderId: string;
  costType: CostType;
  description: string;
  amount: number;
  quantity?: number;
  unitPrice?: number;
  supplier?: string;
  invoiceNumber?: string;
  incurredDate: string;
  notes?: string;
  createdBy?: string | null;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

export interface MaintenanceRecord {
  id?: string;
  orderId: string;
  maintenanceType: string;
  description: string;
  cost: number;
  performedBy?: string;
  performedDate: string;
  nextMaintenanceDate?: string;
  notes?: string;
  createdBy?: string | null;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

export interface CreateCostIncurredData {
  orderId: string;
  costType: CostType;
  description: string;
  amount: number;
  quantity?: number;
  unitPrice?: number;
  supplier?: string;
  invoiceNumber?: string;
  incurredDate: string;
  notes?: string;
}

export type UpdateCostIncurredData = Partial<CreateCostIncurredData>;

export interface CostIncurredFilters {
  orderId?: string;
  costType?: CostType;
  dateFrom?: Date;
  dateTo?: Date;
  search?: string;
  page?: number;
  limit?: number;
}

// Cost type labels for UI
export const COST_TYPE_LABELS: Record<CostType, string> = {
  material: "Vật liệu",
  labor: "Nhân công",
  equipment: "Thiết bị",
  transport: "Vận chuyển",
  other: "Khác",
};

// Cost type colors for badges
export const COST_TYPE_COLORS: Record<
  CostType,
  "info" | "success" | "warning" | "error" | "violet" | "neutral"
> = {
  material: "info",
  labor: "success",
  equipment: "warning",
  transport: "violet",
  other: "neutral",
};
