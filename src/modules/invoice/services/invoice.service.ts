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
} from "firebase/firestore";
import { db } from "@/config/firebase";
import type {
  Invoice,
  CreateInvoiceData,
  UpdateInvoiceData,
  InvoiceFilters,
  InvoiceStatus,
} from "../types";
import { ProductService } from "@/modules/product/services/product.service";
import { SupplyService } from "@/modules/supplies/services/supply.service";

const INVOICES_COLLECTION = "invoices";

export class InvoiceService {
  private static invoicesRef = collection(db, INVOICES_COLLECTION);

  // Get all invoices with filters and pagination
  static async getAllInvoices(
    filters: InvoiceFilters = {},
    pageSize = 20,
    lastDoc?: DocumentSnapshot
  ): Promise<{
    invoices: Invoice[];
    hasMore: boolean;
    lastDoc?: DocumentSnapshot;
  }> {
    try {
      const constraints: QueryConstraint[] = [
        orderBy("createdAt", "desc"),
        limit(pageSize + 1),
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

      const q = query(this.invoicesRef, ...constraints);
      const querySnapshot = await getDocs(q);
      const docs = querySnapshot.docs;

      let invoices = docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Invoice[];

      // Client-side search filter (for invoice number and customer name)
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        invoices = invoices.filter(
          (invoice) =>
            invoice.invoiceNumber.toLowerCase().includes(searchLower) ||
            (invoice.customerName &&
              invoice.customerName.toLowerCase().includes(searchLower))
        );
      }

      const hasMore = invoices.length > pageSize;
      if (hasMore) {
        invoices = invoices.slice(0, pageSize);
      }

      return {
        invoices,
        hasMore,
        lastDoc: invoices.length > 0 ? docs[invoices.length - 1] : undefined,
      };
    } catch (error) {
      console.error("Error fetching invoices:", error);
      throw new Error("Không thể tải danh sách hóa đơn");
    }
  }

  // Get invoice by ID
  static async getInvoiceById(id: string): Promise<Invoice | null> {
    try {
      const docRef = doc(this.invoicesRef, id);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        return {
          id: docSnap.id,
          ...docSnap.data(),
        } as Invoice;
      }

      return null;
    } catch (error) {
      console.error("Error fetching invoice:", error);
      throw new Error("Không thể tải thông tin hóa đơn");
    }
  }

  // Check if invoice number exists
  static async checkInvoiceNumberExists(
    invoiceNumber: string
  ): Promise<boolean> {
    try {
      const q = query(
        this.invoicesRef,
        where("invoiceNumber", "==", invoiceNumber)
      );
      const querySnapshot = await getDocs(q);
      return !querySnapshot.empty;
    } catch (error) {
      console.error("Error checking invoice number:", error);
      return false;
    }
  }

  // Create new invoice
  static async createInvoice(data: CreateInvoiceData): Promise<string> {
    try {
      const batch = writeBatch(db);

      // Check if invoice number already exists
      const numberExists = await this.checkInvoiceNumberExists(
        data.invoiceNumber
      );
      if (numberExists) {
        throw new Error("Số hóa đơn đã tồn tại");
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
      const invoiceData: Omit<Invoice, "id"> = {
        invoiceNumber: data.invoiceNumber,
        customerId: data.customerId || "",
        customerName: data.customerName || "",
        status: "draft" as InvoiceStatus,
        items: enrichedItems,
        subtotal,
        vatRate: data.vatRate,
        vatAmount,
        totalAmount,
        notes: data.notes || "",
        createdAt: now,
        updatedAt: now,
      };

      const docRef = doc(this.invoicesRef);
      batch.set(docRef, invoiceData);

      await batch.commit();
      return docRef.id;
    } catch (error) {
      console.error("Error creating invoice:", error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("Không thể tạo hóa đơn");
    }
  }

  // Update invoice
  static async updateInvoice(
    id: string,
    data: UpdateInvoiceData
  ): Promise<void> {
    try {
      const docRef = doc(this.invoicesRef, id);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        throw new Error("Không tìm thấy hóa đơn");
      }

      const currentInvoice = docSnap.data() as Invoice;

      // Only allow updates for draft invoices
      if (currentInvoice.status !== "draft") {
        throw new Error("Chỉ có thể chỉnh sửa hóa đơn ở trạng thái nháp");
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
        const vatRate = data.vatRate ?? currentInvoice.vatRate;
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
  static async changeInvoiceStatus(
    id: string,
    newStatus: InvoiceStatus
  ): Promise<void> {
    try {
      const docRef = doc(this.invoicesRef, id);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        throw new Error("Không tìm thấy hóa đơn");
      }

      const currentInvoice = docSnap.data() as Invoice;
      const currentStatus = currentInvoice.status;

      // Import the transitions constant properly
      const transitions: Record<InvoiceStatus, InvoiceStatus[]> = {
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

      const updateData: Partial<Invoice> = {
        status: newStatus,
        updatedAt: now,
      };

      // If changing to exported, set exportedAt and reduce stock
      if (newStatus === "exported") {
        updateData.exportedAt = now;

        // Reduce stock for supplies used in products
        for (const item of currentInvoice.items) {
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
    const stockMovementRef = doc(collection(db, "stockMovements"));
    batch.set(stockMovementRef, {
      supplyId,
      type: "out",
      quantity,
      reason: "Xuất kho theo hóa đơn",
      performedBy: "system",
      createdAt: Timestamp.now(),
    });
  }

  // Delete invoice (only drafts)
  static async deleteInvoice(id: string): Promise<void> {
    try {
      const docRef = doc(this.invoicesRef, id);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        throw new Error("Không tìm thấy hóa đơn");
      }

      const invoice = docSnap.data() as Invoice;
      if (invoice.status !== "draft") {
        throw new Error("Chỉ có thể xóa hóa đơn ở trạng thái nháp");
      }

      await deleteDoc(docRef);
    } catch (error) {
      console.error("Error deleting invoice:", error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("Không thể xóa hóa đơn");
    }
  }

  // Get invoice statistics
  static async getInvoiceStats(): Promise<{
    total: number;
    byStatus: Record<InvoiceStatus, number>;
    totalRevenue: number;
  }> {
    try {
      const querySnapshot = await getDocs(this.invoicesRef);
      const invoices = querySnapshot.docs.map((doc) => doc.data() as Invoice);

      const stats = {
        total: invoices.length,
        byStatus: {
          draft: 0,
          confirmed: 0,
          exported: 0,
          completed: 0,
          cancelled: 0,
        } as Record<InvoiceStatus, number>,
        totalRevenue: 0,
      };

      invoices.forEach((invoice) => {
        stats.byStatus[invoice.status]++;
        if (invoice.status === "completed") {
          stats.totalRevenue += invoice.totalAmount;
        }
      });

      return stats;
    } catch (error) {
      console.error("Error getting invoice stats:", error);
      throw new Error("Không thể tải thống kê hóa đơn");
    }
  }
}
