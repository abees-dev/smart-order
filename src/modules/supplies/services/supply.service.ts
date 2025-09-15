import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
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
} from "../types";

const SUPPLIES_COLLECTION = "supplies";
const STOCK_MOVEMENTS_COLLECTION = "stock_movements";
const SUPPLY_IMPORTS_COLLECTION = "supply_imports";

export class SupplyService {
  private static suppliesRef = collection(db, SUPPLIES_COLLECTION);
  private static stockMovementsRef = collection(db, STOCK_MOVEMENTS_COLLECTION);

  static async getAllSupplies(
    filters: SupplyFilters = {},
    pageSize = 100,
    lastDoc?: DocumentSnapshot
  ): Promise<{
    supplies: Supply[];
    hasMore: boolean;
    lastDoc?: DocumentSnapshot;
  }> {
    try {
      const constraints: QueryConstraint[] = [];

      // Add filters
      if (filters.category) {
        constraints.push(where("category", "==", filters.category));
      }
      if (filters.supplierId) {
        constraints.push(where("supplierId", "==", filters.supplierId));
      }
      if (filters.location) {
        constraints.push(where("location", "==", filters.location));
      }
      if (filters.isActive !== undefined) {
        constraints.push(where("isActive", "==", filters.isActive));
      }
      if (filters.lowStock) {
        // Note: This will be filtered client-side as Firestore doesn't support
        // cross-field comparisons directly
      }

      // Add ordering and pagination
      constraints.push(orderBy("createdAt", "asc"));
      constraints.push(limit(pageSize + 1)); // Get one extra to check if there are more

      if (lastDoc) {
        constraints.push(startAfter(lastDoc));
      }

      const q = query(this.suppliesRef, ...constraints);
      const querySnapshot = await getDocs(q);
      const docs = querySnapshot.docs;

      let supplies = docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Supply[];

      // Client-side filtering for complex queries
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        supplies = supplies.filter(
          (supply) =>
            supply.name.toLowerCase().includes(searchTerm) ||
            supply.sku.toLowerCase().includes(searchTerm)
        );
      }

      if (filters.lowStock) {
        supplies = supplies.filter(
          (supply) => supply.currentStock <= supply.minStock
        );
      }

      const hasMore = supplies.length > pageSize;
      if (hasMore) {
        supplies = supplies.slice(0, pageSize);
      }

      return {
        supplies,
        hasMore,
        lastDoc: supplies.length > 0 ? docs[supplies.length - 1] : undefined,
      };
    } catch (error) {
      console.error("Error fetching supplies:", error);
      throw new Error("Không thể tải danh sách vật tư");
    }
  }

  static async getSuppliesWithPagination(
    filters: SupplyFilters = {},
    pageSize = 10,
    page = 1
  ): Promise<{
    supplies: Supply[];
    hasMore: boolean;
    total: number;
    lastDoc?: DocumentSnapshot;
  }> {
    try {
      const constraints: QueryConstraint[] = [];

      // Add filters
      if (filters.category) {
        constraints.push(where("category", "==", filters.category));
      }
      if (filters.supplierId) {
        constraints.push(where("supplierId", "==", filters.supplierId));
      }
      if (filters.location) {
        constraints.push(where("location", "==", filters.location));
      }
      if (filters.isActive !== undefined) {
        constraints.push(where("isActive", "==", filters.isActive));
      }

      // Add search filter (simple text search on name)
      if (filters.search) {
        constraints.push(where("name", ">=", filters.search));
        constraints.push(where("name", "<=", filters.search + "\uf8ff"));
        constraints.push(orderBy("name"));
      } else {
        // Add ordering only when not searching
        constraints.push(orderBy("createdAt", "desc"));
      }

      // Get total count
      const countQuery = query(this.suppliesRef, ...constraints);
      const countSnapshot = await getCountFromServer(countQuery);
      const total = countSnapshot.data().count;

      // Get paginated data
      const skip = (page - 1) * pageSize;
      constraints.push(limit(pageSize));

      // For pagination in Firestore, we need to use cursor-based pagination
      // Since traditional offset doesn't exist, we'll simulate it by getting documents up to the skip point
      let querySnapshot;
      if (skip > 0) {
        const skipQuery = query(
          this.suppliesRef,
          ...constraints.slice(0, -1), // Remove limit constraint
          limit(skip)
        );
        const skipSnapshot = await getDocs(skipQuery);
        const lastVisible = skipSnapshot.docs[skipSnapshot.docs.length - 1];

        if (lastVisible) {
          const finalQuery = query(
            this.suppliesRef,
            ...constraints.slice(0, -1), // Remove limit constraint
            startAfter(lastVisible),
            limit(pageSize)
          );
          querySnapshot = await getDocs(finalQuery);
        } else {
          // If no documents to skip, return empty result
          return {
            supplies: [],
            hasMore: false,
            total,
            lastDoc: undefined,
          };
        }
      } else {
        const finalQuery = query(this.suppliesRef, ...constraints);
        querySnapshot = await getDocs(finalQuery);
      }

      let supplies: Supply[] = [];
      querySnapshot.forEach((doc) => {
        supplies.push({ id: doc.id, ...doc.data() } as Supply);
      });

      // Client-side filtering for complex queries that Firestore doesn't support directly
      if (filters.lowStock) {
        supplies = supplies.filter(
          (supply) => supply.currentStock <= supply.minStock
        );
      }

      const hasMore = total > page * pageSize;
      const lastDoc = querySnapshot.docs[querySnapshot.docs.length - 1];

      return {
        supplies,
        hasMore,
        total,
        lastDoc,
      };
    } catch (error) {
      console.error("Error getting supplies with pagination:", error);
      throw new Error("Không thể tải danh sách vật tư");
    }
  }

  static async getSupplyById(id: string): Promise<Supply | null> {
    try {
      const docRef = doc(this.suppliesRef, id);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        return {
          id: docSnap.id,
          ...docSnap.data(),
        } as Supply;
      }

      return null;
    } catch (error) {
      console.error("Error fetching supply:", error);
      throw new Error("Không thể tải thông tin vật tư");
    }
  }

  static async createSupply(data: CreateSupplyData): Promise<string> {
    try {
      // Check if SKU already exists
      const existingSku = await this.getSupplyBySku(data.sku);
      if (existingSku) {
        throw new Error("Mã SKU đã tồn tại");
      }

      const now = Timestamp.now();
      const supplyData = {
        ...data,
        isActive: true,
        createdAt: now,
        updatedAt: now,
      };

      const docRef = await addDoc(this.suppliesRef, supplyData);
      return docRef.id;
    } catch (error) {
      console.error("Error creating supply:", error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("Không thể tạo vật tư mới");
    }
  }

  static async updateSupply(id: string, data: UpdateSupplyData): Promise<void> {
    try {
      // If updating SKU, check if it already exists
      if (data.sku) {
        const existingSku = await this.getSupplyBySku(data.sku);
        if (existingSku && existingSku.id !== id) {
          throw new Error("Mã SKU đã tồn tại");
        }
      }

      const docRef = doc(this.suppliesRef, id);
      const updateData = {
        ...data,
        updatedAt: Timestamp.now(),
      };

      await updateDoc(docRef, updateData);
    } catch (error) {
      console.error("Error updating supply:", error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("Không thể cập nhật vật tư");
    }
  }

  static async deleteSupply(id: string): Promise<void> {
    try {
      const docRef = doc(this.suppliesRef, id);
      await deleteDoc(docRef);
    } catch (error) {
      console.error("Error deleting supply:", error);
      throw new Error("Không thể xóa vật tư");
    }
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
  ): Promise<string> {
    try {
      const batch = writeBatch(db);
      const now = Timestamp.now();

      // Validate that all supplies exist
      const suppliesExist = await Promise.all(
        data.items.map((item) => this.getSupplyById(item.supplyId))
      );

      const missingSupplies = suppliesExist
        .map((supply, index) => ({ supply, index }))
        .filter(({ supply }) => !supply)
        .map(({ index }) => data.items[index].supplyId);

      if (missingSupplies.length > 0) {
        throw new Error(
          `Không tìm thấy vật tư với ID: ${missingSupplies.join(", ")}`
        );
      }

      // Get supply details for import items
      const itemsWithDetails = await Promise.all(
        data.items.map(async (item) => {
          const supply = await this.getSupplyById(item.supplyId);
          const subtotalPrice = item.quantity * item.unitPrice;
          const vatAmount = subtotalPrice * (item.vatRate / 100);
          const totalPrice = subtotalPrice + vatAmount;

          return {
            ...item,
            supplyName: supply!.name,
            sku: supply!.sku,
            totalPrice,
          };
        })
      );

      // Calculate total amount from all items (already includes VAT per item)
      const totalAmount = itemsWithDetails.reduce(
        (sum, item) => sum + item.totalPrice,
        0
      );

      // Create import record
      const importData: Omit<SupplyImport, "id"> = {
        importDate: now,
        invoiceNumber: data.invoiceNumber,
        supplierId: data.supplierId,
        totalAmount,
        status: "pending",
        notes: data.notes,
        items: itemsWithDetails,
        createdAt: now,
        updatedAt: now,
      };

      const importRef = doc(collection(db, SUPPLY_IMPORTS_COLLECTION));
      batch.set(importRef, importData);

      await batch.commit();
      return importRef.id;
    } catch (error) {
      console.error("Error creating supply import:", error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("Không thể tạo phiếu nhập kho");
    }
  }

  static async completeSupplyImport(importId: string): Promise<void> {
    try {
      const batch = writeBatch(db);

      // Get import details
      const importDoc = await getDoc(
        doc(db, SUPPLY_IMPORTS_COLLECTION, importId)
      );
      if (!importDoc.exists()) {
        throw new Error("Không tìm thấy phiếu nhập kho");
      }

      const importData = importDoc.data() as SupplyImport;
      if (importData.status !== "pending") {
        throw new Error("Phiếu nhập kho đã được xử lý hoặc đã hủy");
      }

      // Update stock for each item and create stock movements
      for (const item of importData.items) {
        const supply = await this.getSupplyById(item.supplyId);
        if (!supply) continue;

        // Update supply stock and purchase price
        const supplyRef = doc(db, SUPPLIES_COLLECTION, item.supplyId);
        batch.update(supplyRef, {
          currentStock: supply.currentStock + item.quantity,
          purchasePrice: item.unitPrice, // Update purchase price to latest
          updatedAt: Timestamp.now(),
        });

        // Create stock movement
        const movementRef = doc(collection(db, STOCK_MOVEMENTS_COLLECTION));
        batch.set(movementRef, {
          supplyId: item.supplyId,
          type: "import",
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          totalValue: item.totalPrice,
          invoiceNumber: importData.invoiceNumber,
          reason: `Nhập kho từ nhà cung cấp ID: ${importData.supplierId}`,
          performedBy: "system",
          createdAt: Timestamp.now(),
        });
      }

      // Update import status
      const importRef = doc(db, SUPPLY_IMPORTS_COLLECTION, importId);
      batch.update(importRef, {
        status: "completed",
        updatedAt: Timestamp.now(),
      });

      await batch.commit();
    } catch (error) {
      console.error("Error completing supply import:", error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("Không thể hoàn thành nhập kho");
    }
  }

  static async getAllSupplyImports(
    filters: SupplyImportFilters = {},
    pageSize = 10,
    lastDoc?: DocumentSnapshot
  ): Promise<{
    imports: SupplyImport[];
    hasMore: boolean;
    lastDoc?: DocumentSnapshot;
  }> {
    try {
      const constraints: QueryConstraint[] = [];

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

      constraints.push(orderBy("importDate", "desc"));
      constraints.push(limit(pageSize + 1));

      if (lastDoc) {
        constraints.push(startAfter(lastDoc));
      }

      const q = query(
        collection(db, SUPPLY_IMPORTS_COLLECTION),
        ...constraints
      );
      const querySnapshot = await getDocs(q);
      const docs = querySnapshot.docs;

      let imports = docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as SupplyImport[];

      // Client-side filtering for search
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        imports = imports.filter(
          (imp) =>
            imp.invoiceNumber.toLowerCase().includes(searchTerm) ||
            imp.supplierId.toLowerCase().includes(searchTerm)
        );
      }

      const hasMore = imports.length > pageSize;
      if (hasMore) {
        imports = imports.slice(0, pageSize);
      }

      return {
        imports,
        hasMore,
        lastDoc: imports.length > 0 ? docs[imports.length - 1] : undefined,
      };
    } catch (error) {
      console.error("Error fetching supply imports:", error);
      throw new Error("Không thể tải danh sách phiếu nhập kho");
    }
  }

  static async getSupplyImportById(id: string): Promise<SupplyImport | null> {
    try {
      const docRef = doc(db, SUPPLY_IMPORTS_COLLECTION, id);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        return {
          id: docSnap.id,
          ...docSnap.data(),
        } as SupplyImport;
      }

      return null;
    } catch (error) {
      console.error("Error fetching supply import:", error);
      throw new Error("Không thể tải thông tin phiếu nhập kho");
    }
  }

  static async updateSupplyImport(
    importId: string,
    data: UpdateSupplyImportData
  ): Promise<void> {
    try {
      const importRef = doc(db, SUPPLY_IMPORTS_COLLECTION, importId);
      const importDoc = await getDoc(importRef);

      if (!importDoc.exists()) {
        throw new Error("Không tìm thấy phiếu nhập kho");
      }

      const importData = importDoc.data() as SupplyImport;
      if (importData.status !== "pending") {
        throw new Error("Chỉ có thể chỉnh sửa phiếu nhập kho đang chờ xử lý");
      }

      // Calculate total amount if items are updated
      let totalAmount = importData.totalAmount;
      if (data.items) {
        totalAmount = data.items.reduce(
          (sum: number, item) => sum + item.totalPrice,
          0
        );
      }

      const updateData = {
        ...data,
        totalAmount,
        updatedAt: Timestamp.now(),
      };

      await updateDoc(importRef, updateData);
    } catch (error) {
      console.error("Error updating supply import:", error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("Không thể cập nhật phiếu nhập kho");
    }
  }

  static async cancelSupplyImport(importId: string): Promise<void> {
    try {
      const importRef = doc(db, SUPPLY_IMPORTS_COLLECTION, importId);
      const importDoc = await getDoc(importRef);

      if (!importDoc.exists()) {
        throw new Error("Không tìm thấy phiếu nhập kho");
      }

      const importData = importDoc.data() as SupplyImport;
      if (importData.status !== "pending") {
        throw new Error("Chỉ có thể hủy phiếu nhập kho đang chờ xử lý");
      }

      await updateDoc(importRef, {
        status: "cancelled",
        updatedAt: Timestamp.now(),
      });
    } catch (error) {
      console.error("Error cancelling supply import:", error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("Không thể hủy phiếu nhập kho");
    }
  }
}
