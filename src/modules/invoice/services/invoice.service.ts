import {
  collection,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  getDocs,
  doc,
  getDoc,
  QueryConstraint,
  DocumentSnapshot,
  Timestamp,
} from "firebase/firestore";
import { db } from "@/config/firebase";
import type {
  InputInvoice,
  OutputInvoice,
  InvoiceView,
  InvoiceFilters,
  InvoiceStats,
  TaxSummary,
  TaxType,
} from "../types";
import type { SupplyImport } from "@/modules/supplies/types";
import type { Order } from "@/modules/order/types";
import { COLLECTIONS } from "@/constants";

export class InvoiceService {
  // Transform supply import to input invoice
  private static transformToInputInvoice(
    supplyImport: SupplyImport,
    supplierName: string
  ): InputInvoice {
    // Tính toán subtotal, VAT và total
    let subtotal = 0;
    let vatAmount = 0;

    const items = supplyImport.items.map((item) => {
      const itemSubtotal = item.quantity * item.unitPrice;
      const itemVatAmount = itemSubtotal * (item.vatRate / 100);

      subtotal += itemSubtotal;
      vatAmount += itemVatAmount;

      return {
        supplyId: item.supplyId,
        supplyName: item.supplyName,
        sku: item.sku,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        vatRate: item.vatRate,
        vatAmount: itemVatAmount,
        subtotal: itemSubtotal,
        totalPrice: itemSubtotal + itemVatAmount,
      };
    });

    // Xác định có thuế hay không (có ít nhất 1 item có VAT > 0)
    const taxType: TaxType = items.some((item) => item.vatRate > 0)
      ? "taxed"
      : "non-taxed";

    return {
      id: supplyImport.id,
      invoiceNumber: supplyImport.invoiceNumber,
      invoiceDate: supplyImport.importDate,
      supplierName,
      supplierId: supplyImport.supplierId,
      subtotal,
      vatAmount,
      totalAmount: subtotal + vatAmount,
      taxType,
      status: supplyImport.status,
      notes: supplyImport.notes,
      items,
      createdAt: supplyImport.createdAt,
      updatedAt: supplyImport.updatedAt,
    };
  }

  // Transform order to output invoice
  private static transformToOutputInvoice(
    order: Order,
    customerName?: string
  ): OutputInvoice {
    const items = order.items.map((item) => ({
      itemId: item.itemId,
      itemName: item.itemName,
      itemCode: item.itemCode,
      itemType: item.type,
      category: item.category,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      totalPrice: item.totalPrice,
      description: item.description,
    }));

    const taxType: TaxType = order.vatRate > 0 ? "taxed" : "non-taxed";

    return {
      id: order.id,
      invoiceNumber: order.orderNumber,
      invoiceDate: order.updatedAt, // hoặc có thể dùng completedAt nếu có
      customerName: customerName || order.customerName,
      customerId: order.customerId,
      subtotal: order.subtotal,
      vatAmount: order.vatAmount,
      totalAmount: order.totalAmount,
      taxType,
      vatRate: order.vatRate,
      status: "completed",
      notes: order.notes,
      items,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      exportedAt: order.exportedAt,
    };
  }

  // Transform to unified view for listing
  private static transformToInvoiceView(
    invoice: InputInvoice | OutputInvoice,
    type: "input" | "output"
  ): InvoiceView {
    const isInput = type === "input";
    const inputInv = invoice as InputInvoice;
    const outputInv = invoice as OutputInvoice;

    return {
      id: invoice.id,
      type,
      invoiceNumber: invoice.invoiceNumber,
      invoiceDate: invoice.invoiceDate,
      partnerName: isInput
        ? inputInv.supplierName
        : outputInv.customerName || "Khách lẻ",
      partnerId: isInput ? inputInv.supplierId : outputInv.customerId,
      subtotal: invoice.subtotal,
      vatAmount: invoice.vatAmount,
      totalAmount: invoice.totalAmount,
      taxType: invoice.taxType,
      status: invoice.status,
      createdAt: invoice.createdAt,
    };
  }

  // Get input invoices from supply imports
  static async getInputInvoices(
    filters: Omit<InvoiceFilters, "type"> = {},
    pageSize = 10,
    lastDoc?: DocumentSnapshot
  ): Promise<{
    invoices: InputInvoice[];
    hasMore: boolean;
    lastDoc?: DocumentSnapshot;
  }> {
    try {
      const constraints: QueryConstraint[] = [];

      // Filters
      if (filters.partnerId) {
        constraints.push(where("supplierId", "==", filters.partnerId));
      }

      if (filters.dateFrom) {
        constraints.push(
          where("importDate", ">=", Timestamp.fromDate(filters.dateFrom))
        );
      }

      if (filters.dateTo) {
        constraints.push(
          where("importDate", "<=", Timestamp.fromDate(filters.dateTo))
        );
      }

      constraints.push(orderBy("importDate", "desc"));
      constraints.push(limit(pageSize + 1));
      constraints.push(where("status", "==", "completed"));

      if (lastDoc) {
        constraints.push(startAfter(lastDoc));
      }

      const q = query(
        collection(db, COLLECTIONS.SUPPLY_IMPORTS),
        ...constraints
      );
      const querySnapshot = await getDocs(q);
      const docs = querySnapshot.docs;

      // Get supplier names
      const supplierIds = [
        ...new Set(docs.map((doc) => doc.data().supplierId)),
      ];
      const supplierDocs = await Promise.all(
        supplierIds.map((id) => getDoc(doc(db, COLLECTIONS.SUPPLIERS, id)))
      );
      const supplierMap = new Map(
        supplierDocs.map((doc) => [
          doc.id,
          doc.exists() ? doc.data().name : "Không xác định",
        ])
      );

      let invoices = docs.map((docSnap) => {
        const supplyImport = {
          id: docSnap.id,
          ...docSnap.data(),
        } as SupplyImport;
        const supplierName =
          supplierMap.get(supplyImport.supplierId) || "Không xác định";
        return this.transformToInputInvoice(supplyImport, supplierName);
      });

      // Client-side filtering
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        invoices = invoices.filter(
          (inv) =>
            inv.invoiceNumber.toLowerCase().includes(searchTerm) ||
            inv.supplierName.toLowerCase().includes(searchTerm)
        );
      }

      if (filters.taxType) {
        invoices = invoices.filter((inv) => inv.taxType === filters.taxType);
      }
      console.log("Filtered input invoices:", invoices);

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
      console.error("Error fetching input invoices:", error);
      throw new Error("Không thể tải danh sách hoá đơn đầu vào");
    }
  }

  // Get output invoices from completed orders
  static async getOutputInvoices(
    filters: Omit<InvoiceFilters, "type"> = {},
    pageSize = 10,
    lastDoc?: DocumentSnapshot
  ): Promise<{
    invoices: OutputInvoice[];
    hasMore: boolean;
    lastDoc?: DocumentSnapshot;
  }> {
    try {
      const constraints: QueryConstraint[] = [];

      // Only completed orders
      constraints.push(where("status", "==", "completed"));

      // Filters
      if (filters.partnerId) {
        constraints.push(where("customerId", "==", filters.partnerId));
      }

      if (filters.dateFrom) {
        constraints.push(
          where("updatedAt", ">=", Timestamp.fromDate(filters.dateFrom))
        );
      }

      if (filters.dateTo) {
        constraints.push(
          where("updatedAt", "<=", Timestamp.fromDate(filters.dateTo))
        );
      }

      constraints.push(orderBy("updatedAt", "desc"));
      constraints.push(limit(pageSize + 1));

      if (lastDoc) {
        constraints.push(startAfter(lastDoc));
      }

      const q = query(collection(db, COLLECTIONS.ORDERS), ...constraints);
      const querySnapshot = await getDocs(q);
      const docs = querySnapshot.docs;

      // Get customer names for orders that have customerId
      const customerIds = [
        ...new Set(docs.map((doc) => doc.data().customerId).filter(Boolean)),
      ];
      const customerDocs = await Promise.all(
        customerIds.map((id) => getDoc(doc(db, COLLECTIONS.CUSTOMERS, id)))
      );
      const customerMap = new Map(
        customerDocs.map((doc) => [
          doc.id,
          doc.exists() ? doc.data().name : "Không xác định",
        ])
      );

      let invoices = docs.map((docSnap) => {
        const order = { id: docSnap.id, ...docSnap.data() } as Order;
        const customerName = order.customerId
          ? customerMap.get(order.customerId)
          : order.customerName;
        return this.transformToOutputInvoice(order, customerName);
      });

      // Client-side filtering
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        invoices = invoices.filter(
          (inv) =>
            inv.invoiceNumber.toLowerCase().includes(searchTerm) ||
            (inv.customerName &&
              inv.customerName.toLowerCase().includes(searchTerm))
        );
      }

      if (filters.taxType) {
        invoices = invoices.filter((inv) => inv.taxType === filters.taxType);
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
      console.error("Error fetching output invoices:", error);
      throw new Error("Không thể tải danh sách hoá đơn đầu ra");
    }
  }

  // Get all invoices (both input and output) as unified view
  static async getAllInvoices(
    filters: InvoiceFilters = {},
    pageSize = 10
  ): Promise<{
    invoices: InvoiceView[];
    hasMore: boolean;
    total: number;
  }> {
    try {
      const results = await Promise.all([
        filters.type === "output"
          ? { invoices: [], hasMore: false }
          : this.getInputInvoices(filters, Math.ceil(pageSize / 2)),
        filters.type === "input"
          ? { invoices: [], hasMore: false }
          : this.getOutputInvoices(filters, Math.ceil(pageSize / 2)),
      ]);

      const [inputResult, outputResult] = results;

      // Transform to unified view
      const inputViews = inputResult.invoices.map((inv) =>
        this.transformToInvoiceView(inv, "input")
      );
      const outputViews = outputResult.invoices.map((inv) =>
        this.transformToInvoiceView(inv, "output")
      );

      // Combine and sort by date
      const allInvoices = [...inputViews, ...outputViews].sort(
        (a, b) => b.invoiceDate.toMillis() - a.invoiceDate.toMillis()
      );

      // Apply pagination
      const hasMore = allInvoices.length > pageSize;
      const invoices = hasMore ? allInvoices.slice(0, pageSize) : allInvoices;

      return {
        invoices,
        hasMore,
        total: allInvoices.length,
      };
    } catch (error) {
      console.error("Error fetching all invoices:", error);
      throw new Error("Không thể tải danh sách hoá đơn");
    }
  }

  // Get invoice by ID and type
  static async getInvoiceById(
    id: string,
    type: "input" | "output"
  ): Promise<InputInvoice | OutputInvoice | null> {
    try {
      if (type === "input") {
        const docRef = doc(db, COLLECTIONS.SUPPLY_IMPORTS, id);
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) return null;

        const supplyImport = {
          id: docSnap.id,
          ...docSnap.data(),
        } as SupplyImport;

        // Get supplier name
        const supplierDoc = await getDoc(
          doc(db, COLLECTIONS.SUPPLIERS, supplyImport.supplierId)
        );
        const supplierName = supplierDoc.exists()
          ? supplierDoc.data().name
          : "Không xác định";

        return this.transformToInputInvoice(supplyImport, supplierName);
      } else {
        const docRef = doc(db, COLLECTIONS.ORDERS, id);
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) return null;

        const order = { id: docSnap.id, ...docSnap.data() } as Order;

        if (order.status !== "completed") return null;

        // Get customer name if exists
        let customerName = order.customerName;
        if (order.customerId) {
          const customerDoc = await getDoc(
            doc(db, COLLECTIONS.CUSTOMERS, order.customerId)
          );
          if (customerDoc.exists()) {
            customerName = customerDoc.data().name;
          }
        }

        return this.transformToOutputInvoice(order, customerName);
      }
    } catch (error) {
      console.error("Error fetching invoice by ID:", error);
      throw new Error("Không thể tải thông tin hoá đơn");
    }
  }

  // Get invoice statistics
  static async getInvoiceStats(
    dateFrom?: Date,
    dateTo?: Date
  ): Promise<InvoiceStats> {
    try {
      const [inputResult, outputResult] = await Promise.all([
        this.getInputInvoices({ dateFrom, dateTo }, 1000),
        this.getOutputInvoices({ dateFrom, dateTo }, 1000),
      ]);

      const inputInvoices = inputResult.invoices;
      const outputInvoices = outputResult.invoices;

      // Tính toán thống kê
      const totalInputAmount = inputInvoices.reduce(
        (sum, inv) => sum + inv.totalAmount,
        0
      );
      const totalOutputAmount = outputInvoices.reduce(
        (sum, inv) => sum + inv.totalAmount,
        0
      );

      const taxedInputAmount = inputInvoices
        .filter((inv) => inv.taxType === "taxed")
        .reduce((sum, inv) => sum + inv.totalAmount, 0);

      const nonTaxedInputAmount = inputInvoices
        .filter((inv) => inv.taxType === "non-taxed")
        .reduce((sum, inv) => sum + inv.totalAmount, 0);

      const taxedOutputAmount = outputInvoices
        .filter((inv) => inv.taxType === "taxed")
        .reduce((sum, inv) => sum + inv.totalAmount, 0);

      const nonTaxedOutputAmount = outputInvoices
        .filter((inv) => inv.taxType === "non-taxed")
        .reduce((sum, inv) => sum + inv.totalAmount, 0);

      const totalVatInput = inputInvoices.reduce(
        (sum, inv) => sum + inv.vatAmount,
        0
      );
      const totalVatOutput = outputInvoices.reduce(
        (sum, inv) => sum + inv.vatAmount,
        0
      );

      return {
        totalInputInvoices: inputInvoices.length,
        totalOutputInvoices: outputInvoices.length,
        totalInputAmount,
        totalOutputAmount,
        taxedInputAmount,
        nonTaxedInputAmount,
        taxedOutputAmount,
        nonTaxedOutputAmount,
        totalVatInput,
        totalVatOutput,
      };
    } catch (error) {
      console.error("Error fetching invoice stats:", error);
      throw new Error("Không thể tải thống kê hoá đơn");
    }
  }

  // Get tax summary by month
  static async getTaxSummary(
    year: number,
    month?: number
  ): Promise<TaxSummary[]> {
    try {
      const startDate = month
        ? new Date(year, month - 1, 1)
        : new Date(year, 0, 1);

      const endDate = month ? new Date(year, month, 0) : new Date(year, 11, 31);

      const [inputResult, outputResult] = await Promise.all([
        this.getInputInvoices({ dateFrom: startDate, dateTo: endDate }, 1000),
        this.getOutputInvoices({ dateFrom: startDate, dateTo: endDate }, 1000),
      ]);

      // Group by month
      const monthlyData = new Map<
        string,
        { inputVat: number; outputVat: number }
      >();

      // Process input invoices
      inputResult.invoices.forEach((inv) => {
        const period = inv.invoiceDate.toDate().toISOString().substring(0, 7); // YYYY-MM
        const current = monthlyData.get(period) || {
          inputVat: 0,
          outputVat: 0,
        };
        current.inputVat += inv.vatAmount;
        monthlyData.set(period, current);
      });

      // Process output invoices
      outputResult.invoices.forEach((inv) => {
        const period = inv.invoiceDate.toDate().toISOString().substring(0, 7); // YYYY-MM
        const current = monthlyData.get(period) || {
          inputVat: 0,
          outputVat: 0,
        };
        current.outputVat += inv.vatAmount;
        monthlyData.set(period, current);
      });

      // Convert to array and sort
      return Array.from(monthlyData.entries())
        .map(([period, data]) => ({
          period,
          inputVat: data.inputVat,
          outputVat: data.outputVat,
          netVat: data.outputVat - data.inputVat, // VAT phải nộp
        }))
        .sort((a, b) => a.period.localeCompare(b.period));
    } catch (error) {
      console.error("Error fetching tax summary:", error);
      throw new Error("Không thể tải tóm tắt thuế");
    }
  }
}
