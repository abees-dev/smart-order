import {
  collection,
  doc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  writeBatch,
  Timestamp,
  DocumentSnapshot,
  QueryConstraint,
  getCountFromServer,
} from "firebase/firestore";
import { db } from "@/config/firebase";
import type {
  CreateOrderData,
  Order,
  OrderFilters,
  OrderStatus,
  UpdateOrderData,
} from "../types";
import { ProductService } from "@/modules/product/services/product.service";
import { SupplyService } from "@/modules/supplies/services/supply.service";

const ORDER_COLLECTION = "orders";
const STOCK_MOVEMENTS_COLLECTION = "stock_movements";

export class OrderService {
  private static ordersRef = collection(db, ORDER_COLLECTION);

  // Get all orders with filters and pagination (infinite loading)
  static async getAllOrders(
    filters: OrderFilters = {},
    pageSize = 20,
    lastDoc?: DocumentSnapshot
  ): Promise<{
    orders: Order[];
    hasMore: boolean;
    lastDoc?: DocumentSnapshot;
  }> {
    try {
      const constraints: QueryConstraint[] = [
        orderBy("createdAt", "desc"),
        limit(pageSize),
      ];

      // Apply filters
      if (filters.status) {
        constraints.push(where("status", "==", filters.status));
      }

      if (filters.customerId) {
        constraints.push(where("customerId", "==", filters.customerId));
      }

      if (filters.dateFrom) {
        constraints.push(
          where("createdAt", ">=", Timestamp.fromDate(filters.dateFrom))
        );
      }

      if (filters.dateTo) {
        constraints.push(
          where("createdAt", "<=", Timestamp.fromDate(filters.dateTo))
        );
      }

      if (lastDoc) {
        constraints.push(startAfter(lastDoc));
      }

      const q = query(this.ordersRef, ...constraints);
      const querySnapshot = await getDocs(q);

      let orders: Order[] = [];
      querySnapshot.forEach((doc) => {
        orders.push({
          id: doc.id,
          ...doc.data(),
        } as Order);
      });

      // Client-side search filter (for order number and customer name)
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        orders = orders.filter(
          (order) =>
            order.orderNumber.toLowerCase().includes(searchLower) ||
            (order.customerName &&
              order.customerName.toLowerCase().includes(searchLower))
        );
      }

      const hasMore = querySnapshot.docs.length === pageSize;
      const newLastDoc = querySnapshot.docs[querySnapshot.docs.length - 1];

      return {
        orders,
        hasMore,
        lastDoc: newLastDoc,
      };
    } catch (error) {
      console.error("Error fetching orders:", error);
      return {
        orders: [],
        hasMore: false,
        lastDoc: undefined,
      };
    }
  }

  // Get orders with traditional pagination (desktop)
  static async getOrdersWithPagination(
    filters: OrderFilters = {},
    pageSize = 20,
    page = 1
  ): Promise<{
    orders: Order[];
    hasMore: boolean;
    total: number;
    lastDoc?: DocumentSnapshot;
  }> {
    try {
      const constraints: QueryConstraint[] = [orderBy("createdAt", "desc")];

      // Apply filters (excluding search for now)
      if (filters.status) {
        constraints.push(where("status", "==", filters.status));
      }

      if (filters.customerId) {
        constraints.push(where("customerId", "==", filters.customerId));
      }

      if (filters.dateFrom) {
        constraints.push(
          where("createdAt", ">=", Timestamp.fromDate(filters.dateFrom))
        );
      }

      if (filters.dateTo) {
        constraints.push(
          where("createdAt", "<=", Timestamp.fromDate(filters.dateTo))
        );
      }

      // Get total count (without search filter for performance)
      let total = 0;
      if (!filters.search) {
        const countQuery = query(this.ordersRef, ...constraints);
        const countSnapshot = await getCountFromServer(countQuery);
        total = countSnapshot.data().count;
      }

      // Get paginated data
      const skip = (page - 1) * pageSize;
      constraints.push(limit(pageSize));

      let querySnapshot;
      if (skip > 0) {
        const skipQuery = query(
          this.ordersRef,
          ...constraints.slice(0, -1),
          limit(skip)
        );
        const skipSnapshot = await getDocs(skipQuery);
        if (skipSnapshot.docs.length > 0) {
          const lastSkipDoc = skipSnapshot.docs[skipSnapshot.docs.length - 1];
          const paginatedQuery = query(
            this.ordersRef,
            ...constraints.slice(0, -1),
            startAfter(lastSkipDoc),
            limit(pageSize)
          );
          querySnapshot = await getDocs(paginatedQuery);
        } else {
          return {
            orders: [],
            hasMore: false,
            total: 0,
            lastDoc: undefined,
          };
        }
      } else {
        const paginatedQuery = query(this.ordersRef, ...constraints);
        querySnapshot = await getDocs(paginatedQuery);
      }

      let orders: Order[] = [];
      querySnapshot.forEach((doc) => {
        orders.push({
          id: doc.id,
          ...doc.data(),
        } as Order);
      });

      // Apply client-side search filter if needed
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        orders = orders.filter(
          (order) =>
            order.orderNumber.toLowerCase().includes(searchLower) ||
            (order.customerName &&
              order.customerName.toLowerCase().includes(searchLower))
        );

        // For search, we need to estimate total by loading all data
        if (total === 0) {
          const allQuery = query(this.ordersRef, ...constraints.slice(0, -1));
          const allSnapshot = await getDocs(allQuery);
          let allOrders: Order[] = [];
          allSnapshot.forEach((doc) => {
            allOrders.push({
              id: doc.id,
              ...doc.data(),
            } as Order);
          });

          allOrders = allOrders.filter(
            (order) =>
              order.orderNumber.toLowerCase().includes(searchLower) ||
              (order.customerName &&
                order.customerName.toLowerCase().includes(searchLower))
          );
          total = allOrders.length;
        }
      }

      const hasMore = skip + orders.length < total;
      const newLastDoc = querySnapshot.docs[querySnapshot.docs.length - 1];

      return {
        orders,
        hasMore,
        total,
        lastDoc: newLastDoc,
      };
    } catch (error) {
      console.error("Error getting orders with pagination:", error);
      return {
        orders: [],
        hasMore: false,
        total: 0,
        lastDoc: undefined,
      };
    }
  }

  // Get order by ID
  static async getOrderById(id: string): Promise<Order | null> {
    try {
      const docRef = doc(this.ordersRef, id);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        return {
          id: docSnap.id,
          ...docSnap.data(),
        } as Order;
      }

      return null;
    } catch (error) {
      console.error("Error fetching order:", error);
      throw new Error("Không thể tải thông tin đơn hàng");
    }
  }

  // Check if order number exists
  static async checkOrderNumberExists(orderNumber: string): Promise<boolean> {
    try {
      const q = query(this.ordersRef, where("orderNumber", "==", orderNumber));
      const querySnapshot = await getDocs(q);
      return !querySnapshot.empty;
    } catch (error) {
      console.error("Error checking order number:", error);
      return false;
    }
  }

  // Create new order
  static async createOrder(data: CreateOrderData): Promise<string> {
    try {
      const batch = writeBatch(db);

      // Check if order number already exists
      const numberExists = await this.checkOrderNumberExists(data.orderNumber);
      if (numberExists) {
        throw new Error("Số đơn hàng đã tồn tại");
      }

      // Enrich items with product/supply details
      const enrichedItems = await Promise.all(
        data.items.map(async (item) => {
          if (item.type === "product") {
            const product = await ProductService.getProductById(item.itemId);
            if (!product) {
              throw new Error(`Không tìm thấy sản phẩm với ID: ${item.itemId}`);
            }
            return {
              ...item,
              itemName: product.name,
              itemCode: product.productCode,
              totalPrice: item.quantity * item.unitPrice,
            };
          } else {
            const supply = await SupplyService.getSupplyById(item.itemId);
            if (!supply) {
              throw new Error(`Không tìm thấy vật tư với ID: ${item.itemId}`);
            }
            return {
              ...item,
              itemName: supply.name,
              itemCode: supply.sku,
              totalPrice: item.quantity * item.unitPrice,
            };
          }
        })
      );

      // Calculate totals
      const subtotal = enrichedItems.reduce(
        (sum, item) => sum + item.totalPrice,
        0
      );
      const vatAmount = subtotal * (data.vatRate / 100);
      const totalAmount = subtotal + vatAmount;

      const now = Timestamp.now();
      const orderData: Omit<Order, "id"> = {
        orderNumber: data.orderNumber,
        customerId: data.customerId || "",
        customerName: data.customerName || "",
        status: "draft" as OrderStatus,
        items: enrichedItems,
        subtotal,
        vatRate: data.vatRate,
        vatAmount,
        totalAmount,
        notes: data.notes || "",
        createdAt: now,
        updatedAt: now,
      };

      const docRef = doc(this.ordersRef);
      batch.set(docRef, orderData);

      await batch.commit();
      return docRef.id;
    } catch (error) {
      console.error("Error creating order:", error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("Không thể tạo đơn hàng");
    }
  }

  // Update order
  static async updateOrder(id: string, data: UpdateOrderData): Promise<void> {
    try {
      const docRef = doc(this.ordersRef, id);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        throw new Error("Không tìm thấy đơn hàng");
      }

      const currentOrder = docSnap.data() as Order;

      // Only allow updates for draft orders
      if (currentOrder.status !== "draft") {
        throw new Error("Chỉ có thể chỉnh sửa đơn hàng ở trạng thái nháp");
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const updateData: Record<string, any> = {
        ...data,
        updatedAt: Timestamp.now(),
      };

      // If items are updated, recalculate totals
      if (data.items) {
        const enrichedItems = await Promise.all(
          data.items.map(async (item) => {
            if (item.type === "product") {
              const product = await ProductService.getProductById(item.itemId);
              if (!product) {
                throw new Error(
                  `Không tìm thấy sản phẩm với ID: ${item.itemId}`
                );
              }
              return {
                ...item,
                itemName: product.name,
                itemCode: product.productCode,
                totalPrice: item.quantity * item.unitPrice,
              };
            } else {
              const supply = await SupplyService.getSupplyById(item.itemId);
              if (!supply) {
                throw new Error(`Không tìm thấy vật tư với ID: ${item.itemId}`);
              }
              return {
                ...item,
                itemName: supply.name,
                itemCode: supply.sku,
                totalPrice: item.quantity * item.unitPrice,
              };
            }
          })
        );

        const subtotal = enrichedItems.reduce(
          (sum, item) => sum + item.totalPrice,
          0
        );
        const vatRate = data.vatRate ?? currentOrder.vatRate;
        const vatAmount = subtotal * (vatRate / 100);
        const totalAmount = subtotal + vatAmount;

        updateData.items = enrichedItems;
        updateData.subtotal = subtotal;
        updateData.vatAmount = vatAmount;
        updateData.totalAmount = totalAmount;
      }

      await updateDoc(docRef, updateData);
    } catch (error) {
      console.error("Error updating invoice:", error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("Không thể cập nhật hóa đơn");
    }
  }

  // Change invoice status
  static async changeOrderStatus(
    id: string,
    newStatus: OrderStatus
  ): Promise<void> {
    try {
      const docRef = doc(this.ordersRef, id);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        throw new Error("Không tìm thấy đơn hàng");
      }

      const currentOrder = docSnap.data() as Order;
      const currentStatus = currentOrder.status;

      // Import the transitions constant properly
      const transitions: Record<OrderStatus, OrderStatus[]> = {
        draft: ["confirmed", "cancelled"],
        confirmed: ["exported", "cancelled"],
        exported: ["completed", "cancelled"],
        completed: [],
        cancelled: [],
      };

      // Check if status transition is allowed
      if (!transitions[currentStatus].includes(newStatus)) {
        throw new Error(
          `Không thể chuyển từ trạng thái "${currentStatus}" sang "${newStatus}"`
        );
      }

      const batch = writeBatch(db);
      const now = Timestamp.now();

      const updateData: Partial<Order> = {
        status: newStatus,
        updatedAt: now,
      };

      // If changing to exported, set exportedAt and reduce stock
      if (newStatus === "exported") {
        updateData.exportedAt = now;

        // Reduce stock for supplies used in products
        for (const item of currentOrder.items) {
          if (item.type === "supply") {
            // Direct supply reduction
            await this.reduceSupplyStock(item.itemId, item.quantity, batch);
          } else if (item.type === "product") {
            // Get product details to find required supplies
            const product = await ProductService.getProductById(item.itemId);
            if (product && product.supplies) {
              for (const productSupply of product.supplies) {
                const requiredQuantity = productSupply.quantity * item.quantity;
                await this.reduceSupplyStock(
                  productSupply.supplyId,
                  requiredQuantity,
                  batch
                );
              }
            }
          }
        }
      }

      // If changing to cancelled and was previously exported, restore stock
      if (newStatus === "cancelled" && currentStatus === "exported") {
        updateData.cancelledAt = now;

        // Restore stock for supplies that were reduced
        for (const item of currentOrder.items) {
          if (item.type === "supply") {
            // Direct supply restoration
            await this.restoreSupplyStock(item.itemId, item.quantity, batch);
          } else if (item.type === "product") {
            // Get product details to find required supplies
            const product = await ProductService.getProductById(item.itemId);
            if (product && product.supplies) {
              for (const productSupply of product.supplies) {
                const requiredQuantity = productSupply.quantity * item.quantity;
                await this.restoreSupplyStock(
                  productSupply.supplyId,
                  requiredQuantity,
                  batch
                );
              }
            }
          }
        }
      }

      // If changing to cancelled from other statuses (not exported)
      if (newStatus === "cancelled" && currentStatus !== "exported") {
        updateData.cancelledAt = now;
      }

      batch.update(docRef, updateData);
      await batch.commit();
    } catch (error) {
      console.error("Error changing invoice status:", error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("Không thể thay đổi trạng thái hóa đơn");
    }
  }

  // Helper method to reduce supply stock
  private static async reduceSupplyStock(
    supplyId: string,
    quantity: number,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    batch: any
  ): Promise<void> {
    const supply = await SupplyService.getSupplyById(supplyId);
    if (!supply) {
      throw new Error(`Không tìm thấy vật tư với ID: ${supplyId}`);
    }

    if (supply.currentStock < quantity) {
      throw new Error(
        `Không đủ tồn kho cho vật tư "${supply.name}". Tồn kho hiện tại: ${supply.currentStock}, cần: ${quantity}`
      );
    }

    const supplyRef = doc(db, "supplies", supplyId);
    batch.update(supplyRef, {
      currentStock: supply.currentStock - quantity,
      updatedAt: Timestamp.now(),
    });

    // Create stock movement record
    const stockMovementRef = doc(collection(db, STOCK_MOVEMENTS_COLLECTION));
    batch.set(stockMovementRef, {
      supplyId,
      type: "out",
      quantity,
      reason: "Xuất kho theo hóa đơn",
      performedBy: "system",
      createdAt: Timestamp.now(),
    });
  }

  // Helper method to restore supply stock (when cancelling exported invoice)
  private static async restoreSupplyStock(
    supplyId: string,
    quantity: number,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    batch: any
  ): Promise<void> {
    const supply = await SupplyService.getSupplyById(supplyId);
    if (!supply) {
      throw new Error(`Không tìm thấy vật tư với ID: ${supplyId}`);
    }

    const supplyRef = doc(db, "supplies", supplyId);
    batch.update(supplyRef, {
      currentStock: supply.currentStock + quantity,
      updatedAt: Timestamp.now(),
    });

    // Create stock movement record for restoration
    const stockMovementRef = doc(collection(db, STOCK_MOVEMENTS_COLLECTION));
    batch.set(stockMovementRef, {
      supplyId,
      type: "in",
      quantity,
      reason: "Hoàn lại tồn kho do hủy hóa đơn",
      performedBy: "system",
      createdAt: Timestamp.now(),
    });
  }

  // Delete invoice (only drafts)
  static async deleteOrder(id: string): Promise<void> {
    try {
      const docRef = doc(this.ordersRef, id);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        throw new Error("Không tìm thấy đơn hàng");
      }

      const order = docSnap.data() as Order;
      if (order.status !== "draft") {
        throw new Error("Chỉ có thể xóa đơn hàng ở trạng thái nháp");
      }

      await deleteDoc(docRef);
    } catch (error) {
      console.error("Error deleting order:", error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("Không thể xóa đơn hàng");
    }
  }

  // Get order statistics
  static async getOrderStats(): Promise<{
    total: number;
    byStatus: Record<OrderStatus, number>;
    totalRevenue: number;
  }> {
    try {
      const querySnapshot = await getDocs(this.ordersRef);
      const orders = querySnapshot.docs.map((doc) => doc.data() as Order);

      const stats = {
        total: orders.length,
        byStatus: {
          draft: 0,
          confirmed: 0,
          exported: 0,
          completed: 0,
          cancelled: 0,
        } as Record<OrderStatus, number>,
        totalRevenue: 0,
      };

      orders.forEach((order) => {
        stats.byStatus[order.status]++;
        if (order.status === "completed") {
          stats.totalRevenue += order.totalAmount;
        }
      });

      return stats;
    } catch (error) {
      console.error("Error getting invoice stats:", error);
      throw new Error("Không thể tải thống kê hóa đơn");
    }
  }
}
