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
  vatRate: number; // % VAT cho từng item
  vatAmount?: number; // tiền VAT cho item = subtotal * (vatRate/100)
  subtotal?: number; // quantity * unitPrice (chưa VAT)
  totalPrice?: number; // subtotal + vatAmount
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
  parentOrderId?: string | null;
}

export interface CreateOrderData {
  orderNumber: string;
  customerId?: string;
  customerName?: string;
  items: Omit<
    OrderItem,
    "id" | "orderId" | "createdAt" | "updatedAt" | "itemData"
  >[];
  notes?: string;
}

export interface UpdateOrderData {
  customerId?: string;
  customerName?: string;
  items?: Omit<
    OrderItem,
    "id" | "orderId" | "createdAt" | "updatedAt" | "itemData"
  >[];
  vatRate?: number; // Default VAT rate for order
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

export type MaintenanceType = "warranty" | "paid";

export interface MaintenanceSupply {
  supplyId: string;
  quantity: number;
  unitPrice?: number;
  notes?: string;
}

export interface MaintenanceRecord {
  id?: string;
  orderId: string;
  maintenanceType: MaintenanceType;
  description: string;
  cost: number;
  vatRate?: number;
  supplies?: MaintenanceSupply[]; // multiple supplies selection
  performedBy?: string;
  performedDate: string;
  nextMaintenanceDate?: string;
  notes?: string;
  createdBy?: string | null;
  createdAt?: Date | string;
  updatedAt?: Date | string;
  // Extended fields from API response
  suppliesData?: Array<{
    id: string;
    name: string;
    sku?: string;
    unit?: string;
    quantity: number;
    notes?: string;
  }> | null;
  status?: "scheduled" | "in_progress" | "completed" | "cancelled";
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
  incurredDate: Date;
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

// Order Cost Calculation interfaces
export interface SupplyBreakdown {
  supplyId: string;
  supplyName: string;
  sku: string;
  quantityPerProduct: number;
  totalQuantityNeeded: number;
  unitCost: number;
  totalCost: number;
  source: "import" | "purchase_price";
  currentStock?: number;
}

export interface OrderCostBreakdown {
  type: "supply" | "product";
  itemId: string;
  itemName: string;
  sku: string;
  quantity: number;
  unitCost: number;
  totalCost: number;
  source: "import" | "manual";
  supplies?: SupplyBreakdown[]; // Only present when type is "product"
}

export interface OrderCostCalculation {
  orderId: string;
  orderNumber: string;
  materialCost: number;
  additionalCosts: number;
  totalCost: number;
  totalRevenue: number;
  profit: number;
  profitMargin: string;
  costBreakdown: OrderCostBreakdown[];
  hasImportData: boolean;
}

// Stock Shortage Management Interfaces
export interface ProductContext {
  productId: string;
  productName: string;
  productCode: string;
  quantityPerProduct: number;
}

export interface SupplyShortage {
  type: "supply";
  supplyId: string;
  supplyName: string;
  sku: string;
  orderItemQuantity: number;
  available: number;
  required: number;
  shortage: number;
  usedInProduct?: ProductContext | null;
  error?: string;
}

// Check Stock Availability Response
export interface CheckStockResponse {
  orderId: string;
  orderNumber: string;
  canExport: boolean;
  stockShortages: SupplyShortage[];
  totalShortages: number;
  message: string;
  statusCode: number;
}

// Change Order Status - Insufficient Stock Response
export interface InsufficientStockResponse {
  message: string;
  statusCode: number;
  stockShortages: SupplyShortage[];
  totalShortages: number;
  orderNumber: string;
}

// Change Order Status - Success Response
export interface ChangeStatusSuccessResponse {
  message: string;
  statusCode: number;
}
