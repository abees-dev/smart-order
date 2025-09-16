import {
  collection,
  doc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  Timestamp,
  DocumentSnapshot,
  QueryConstraint,
  writeBatch,
  getCountFromServer,
} from "firebase/firestore";
import { db } from "@/config/firebase";
import type {
  Supply,
  CreateSupplyData,
  UpdateSupplyData,
  SupplyFilters,
  StockMovement,
  CreateStockMovementData,
  SupplyImport,
  CreateSupplyImportData,
  UpdateSupplyImportData,
  SupplyImportFilters,
  SupplyImportSummary,
} from "../types";
import type { ApiResponsePagination } from "@/types/response";
import axiosInstance from "@/utils/axios";

const SUPPLIES_COLLECTION = "supplies";
const STOCK_MOVEMENTS_COLLECTION = "stock_movements";
const SUPPLY_IMPORTS_COLLECTION = "supply_imports";

export class SupplyService {
  private static suppliesRef = collection(db, SUPPLIES_COLLECTION);
  private static stockMovementsRef = collection(db, STOCK_MOVEMENTS_COLLECTION);

  static async getAllSupplies(
    filters: SupplyFilters = {}
  ): Promise<ApiResponsePagination<Supply[]>> {
    return axiosInstance.get("/supplies", { params: filters });
  }

  static async getSuppliesSelection(): Promise<Supply[]> {
    return await axiosInstance.get("/supplies/selection");
  }

  static async getSupplyById(id: string): Promise<Supply | null> {
    const response = await axiosInstance.get(`/supplies/${id}`);
    return response.data;
  }

  static async createSupply(data: CreateSupplyData): Promise<unknown> {
    return axiosInstance.post("/supplies", data);
  }

  static async updateSupply(id: string, data: UpdateSupplyData): Promise<void> {
    return axiosInstance.patch(`/supplies/${id}`, data);
  }

  static async deleteSupply(id: string): Promise<void> {
    return axiosInstance.delete(`/supplies/${id}`);
  }

  static async getSupplyBySku(sku: string): Promise<Supply | null> {
    try {
      const q = query(this.suppliesRef, where("sku", "==", sku), limit(1));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const doc = querySnapshot.docs[0];
        return {
          id: doc.id,
          ...doc.data(),
        } as Supply;
      }

      return null;
    } catch (error) {
      console.error("Error fetching supply by SKU:", error);
      throw new Error("Không thể tìm vật tư theo SKU");
    }
  }

  static async getCategories(): Promise<string[]> {
    try {
      const q = query(this.suppliesRef, where("isActive", "==", true));
      const querySnapshot = await getDocs(q);

      const categories = new Set<string>();
      querySnapshot.docs.forEach((doc) => {
        const data = doc.data();
        if (data.category) {
          categories.add(data.category);
        }
      });

      return Array.from(categories).sort();
    } catch (error) {
      console.error("Error fetching categories:", error);
      throw new Error("Không thể tải danh sách danh mục");
    }
  }

  // Stock Movement methods
  static async addStockMovement(
    data: CreateStockMovementData
  ): Promise<string> {
    try {
      const batch = writeBatch(db);

      // Get current supply data
      const supply = await this.getSupplyById(data.supplyId);
      if (!supply) {
        throw new Error("Vật tư không tồn tại");
      }

      // Calculate new stock based on movement type
      let newStock = supply.currentStock;
      if (data.type === "in") {
        newStock += data.quantity;
      } else if (data.type === "out") {
        newStock -= data.quantity;
        if (newStock < 0) {
          throw new Error("Không đủ tồn kho để xuất");
        }
      } else if (data.type === "adjustment") {
        newStock = data.quantity;
      }

      // Create stock movement record
      const movementData = {
        ...data,
        createdAt: Timestamp.now(),
      };
      const movementRef = doc(this.stockMovementsRef);
      batch.set(movementRef, movementData);

      // Update supply stock
      const supplyRef = doc(this.suppliesRef, data.supplyId);
      batch.update(supplyRef, {
        currentStock: newStock,
        updatedAt: Timestamp.now(),
      });

      await batch.commit();
      return movementRef.id;
    } catch (error) {
      console.error("Error adding stock movement:", error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("Không thể thực hiện giao dịch kho");
    }
  }

  static async getStockMovements(
    supplyId: string,
    pageSize = 10,
    lastDoc?: DocumentSnapshot
  ): Promise<{
    movements: StockMovement[];
    hasMore: boolean;
    lastDoc?: DocumentSnapshot;
  }> {
    try {
      const constraints: QueryConstraint[] = [
        where("supplyId", "==", supplyId),
        orderBy("createdAt", "desc"),
        limit(pageSize + 1),
      ];

      if (lastDoc) {
        constraints.push(startAfter(lastDoc));
      }

      const q = query(this.stockMovementsRef, ...constraints);
      const querySnapshot = await getDocs(q);
      const docs = querySnapshot.docs;

      let movements = docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as StockMovement[];

      const hasMore = movements.length > pageSize;
      if (hasMore) {
        movements = movements.slice(0, pageSize);
      }

      return {
        movements,
        hasMore,
        lastDoc: movements.length > 0 ? docs[movements.length - 1] : undefined,
      };
    } catch (error) {
      console.error("Error fetching stock movements:", error);
      throw new Error("Không thể tải lịch sử giao dịch kho");
    }
  }

  // Supply Import methods
  static async createSupplyImport(
    data: CreateSupplyImportData
  ): Promise<unknown> {
    return axiosInstance.post("/supplies/imports", data);
  }

  static async completeSupplyImport(importId: string): Promise<void> {
    return axiosInstance.patch(`/supplies/imports/${importId}`, {
      status: "completed",
    });
  }

  static async addToWarehouseSupply(importId: string): Promise<void> {
    return axiosInstance.post(`/supplies/imports/${importId}/add-to-warehouse`);
  }

  static async getAllSupplyImports(
    filters: SupplyImportFilters = {}
  ): Promise<ApiResponsePagination<SupplyImport[]>> {
    return axiosInstance.get("/supplies/imports", { params: filters });
  }

  static async getSupplySummary(): Promise<SupplyImportSummary> {
    return axiosInstance.get("/supplies/imports/summary");
  }

  static async getSupplyImportById(id: string): Promise<SupplyImport | null> {
    return await axiosInstance.get(`/supplies/imports/${id}`);
  }

  static async updateSupplyImport(
    importId: string,
    data: UpdateSupplyImportData
  ): Promise<void> {
    return axiosInstance.patch(`/supplies/imports/${importId}`, data);
  }

  static async cancelSupplyImport(importId: string): Promise<void> {
    return axiosInstance.patch(`/supplies/imports/${importId}`, {
      status: "cancelled",
    });
  }

  static async getSupplyImportsWithPagination(
    filters: SupplyImportFilters = {},
    pageSize = 10,
    page = 1
  ): Promise<{
    imports: SupplyImport[];
    hasMore: boolean;
    total: number;
    lastDoc?: DocumentSnapshot;
  }> {
    try {
      const constraints: QueryConstraint[] = [];

      // Add filters
      if (filters.supplierId) {
        constraints.push(where("supplierId", "==", filters.supplierId));
      }
      if (filters.status) {
        constraints.push(where("status", "==", filters.status));
      }
      if (filters.dateFrom) {
        constraints.push(where("importDate", ">=", filters.dateFrom));
      }
      if (filters.dateTo) {
        constraints.push(where("importDate", "<=", filters.dateTo));
      }

      // Add search filter (simple text search on invoiceNumber)
      if (filters.search) {
        constraints.push(where("invoiceNumber", ">=", filters.search));
        constraints.push(
          where("invoiceNumber", "<=", filters.search + "\uf8ff")
        );
        constraints.push(orderBy("invoiceNumber"));
      } else {
        // Add ordering only when not searching
        constraints.push(orderBy("importDate", "desc"));
      }

      // Get total count
      const countQuery = query(
        collection(db, SUPPLY_IMPORTS_COLLECTION),
        ...constraints
      );
      const countSnapshot = await getCountFromServer(countQuery);
      const total = countSnapshot.data().count;

      // Get paginated data
      const skip = (page - 1) * pageSize;
      constraints.push(limit(pageSize));

      // For pagination in Firestore, we need to use cursor-based pagination
      if (skip > 0) {
        const skipQuery = query(
          collection(db, SUPPLY_IMPORTS_COLLECTION),
          ...constraints.slice(0, -1), // Remove limit constraint
          limit(skip)
        );
        const skipSnapshot = await getDocs(skipQuery);

        if (skipSnapshot.docs.length > 0) {
          const lastVisible = skipSnapshot.docs[skipSnapshot.docs.length - 1];
          constraints.push(startAfter(lastVisible));
        }
      }

      const q = query(
        collection(db, SUPPLY_IMPORTS_COLLECTION),
        ...constraints
      );
      const querySnapshot = await getDocs(q);

      let imports = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as SupplyImport[];

      // Client-side filtering for complex search if needed
      if (filters.search && !filters.search.match(/^[a-zA-Z0-9\-_]+$/)) {
        const searchTerm = filters.search.toLowerCase();
        imports = imports.filter(
          (imp) =>
            imp.invoiceNumber.toLowerCase().includes(searchTerm) ||
            imp.supplierId.toLowerCase().includes(searchTerm)
        );
      }

      const hasMore = total > page * pageSize;

      return {
        imports,
        hasMore,
        total,
        lastDoc:
          imports.length > 0
            ? querySnapshot.docs[imports.length - 1]
            : undefined,
      };
    } catch (error) {
      console.error("Error fetching supply imports with pagination:", error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("Không thể tải danh sách phiếu nhập kho");
    }
  }
}
