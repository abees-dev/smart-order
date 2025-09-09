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
} from "firebase/firestore";
import { db } from "@/config/firebase";
import type {
  Supplier,
  CreateSupplierData,
  UpdateSupplierData,
  SupplierFilters,
} from "../types";

const COLLECTION_NAME = "suppliers";

export class SupplierService {
  private static collectionRef = collection(db, COLLECTION_NAME);

  static async getAllSuppliers(
    filters: SupplierFilters = {},
    pageSize = 10,
    lastDoc?: DocumentSnapshot
  ): Promise<{
    suppliers: Supplier[];
    hasMore: boolean;
    lastDoc?: DocumentSnapshot;
  }> {
    try {
      const constraints: QueryConstraint[] = [];

      // Add filters
      if (filters.city) {
        constraints.push(where("city", "==", filters.city));
      }
      if (filters.country) {
        constraints.push(where("country", "==", filters.country));
      }
      if (filters.isActive !== undefined) {
        constraints.push(where("isActive", "==", filters.isActive));
      }

      // Add ordering
      constraints.push(orderBy("createdAt", "desc"));

      // Add pagination
      constraints.push(limit(pageSize));
      if (lastDoc) {
        constraints.push(startAfter(lastDoc));
      }

      const q = query(this.collectionRef, ...constraints);
      const querySnapshot = await getDocs(q);

      const suppliers: Supplier[] = [];
      querySnapshot.forEach((doc) => {
        suppliers.push({
          id: doc.id,
          ...doc.data(),
        } as Supplier);
      });

      // Check if there are more documents
      const hasMore = querySnapshot.docs.length === pageSize;
      const newLastDoc = querySnapshot.docs[querySnapshot.docs.length - 1];

      return {
        suppliers,
        hasMore,
        lastDoc: newLastDoc,
      };
    } catch (error) {
      console.error("Error getting suppliers:", error);
      throw new Error("Không thể tải danh sách nhà cung cấp");
    }
  }

  static async searchSuppliers(
    searchTerm: string,
    filters: SupplierFilters = {},
    pageSize = 50
  ): Promise<Supplier[]> {
    try {
      const constraints: QueryConstraint[] = [];

      // Add filters
      if (filters.city) {
        constraints.push(where("city", "==", filters.city));
      }
      if (filters.country) {
        constraints.push(where("country", "==", filters.country));
      }
      if (filters.isActive !== undefined) {
        constraints.push(where("isActive", "==", filters.isActive));
      }

      // Add ordering
      constraints.push(orderBy("name"));
      constraints.push(limit(pageSize * 2)); // Fetch more for better search results

      const q = query(this.collectionRef, ...constraints);
      const querySnapshot = await getDocs(q);

      const allSuppliers: Supplier[] = [];
      querySnapshot.forEach((doc) => {
        const supplier = {
          id: doc.id,
          ...doc.data(),
        } as Supplier;
        allSuppliers.push(supplier);
      });

      // Advanced search logic with scoring
      const searchTermLower = searchTerm.toLowerCase().trim();
      const results = allSuppliers
        .map((supplier) => {
          let score = 0;
          const nameMatch = supplier.name.toLowerCase();
          const phoneMatch = supplier.phone || "";
          const emailMatch = (supplier.email || "").toLowerCase();
          const contactMatch = (supplier.contactPerson || "").toLowerCase();

          // Exact match gets highest score
          if (nameMatch === searchTermLower) score += 100;
          else if (nameMatch.startsWith(searchTermLower)) score += 80;
          else if (nameMatch.includes(searchTermLower)) score += 60;

          // Phone number exact match
          if (phoneMatch.includes(searchTerm)) score += 90;

          // Email match
          if (emailMatch === searchTermLower) score += 70;
          else if (emailMatch.includes(searchTermLower)) score += 50;

          // Contact person match
          if (contactMatch === searchTermLower) score += 60;
          else if (contactMatch.includes(searchTermLower)) score += 40;

          // Fuzzy search for name (for typos)
          if (score === 0) {
            const words = searchTermLower.split(" ");
            for (const word of words) {
              if (word.length > 2 && nameMatch.includes(word)) {
                score += 30;
              }
            }
          }

          return { supplier, score };
        })
        .filter(({ score }) => score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, pageSize)
        .map(({ supplier }) => supplier);

      return results;
    } catch (error) {
      console.error("Error searching suppliers:", error);
      throw new Error("Không thể tìm kiếm nhà cung cấp");
    }
  }

  static async getSupplierById(id: string): Promise<Supplier | null> {
    try {
      const docRef = doc(this.collectionRef, id);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        return {
          id: docSnap.id,
          ...docSnap.data(),
        } as Supplier;
      }

      return null;
    } catch (error) {
      console.error("Error getting supplier:", error);
      throw new Error("Không thể tải thông tin nhà cung cấp");
    }
  }

  static async createSupplier(data: CreateSupplierData): Promise<string> {
    try {
      const now = Timestamp.now();
      const supplierData = {
        ...data,
        isActive: true,
        createdAt: now,
        updatedAt: now,
      };

      const docRef = await addDoc(this.collectionRef, supplierData);
      return docRef.id;
    } catch (error) {
      console.error("Error creating supplier:", error);
      throw new Error("Không thể tạo nhà cung cấp");
    }
  }

  static async updateSupplier(
    id: string,
    data: UpdateSupplierData
  ): Promise<void> {
    try {
      const docRef = doc(this.collectionRef, id);
      const updateData = {
        ...data,
        updatedAt: Timestamp.now(),
      };

      await updateDoc(docRef, updateData);
    } catch (error) {
      console.error("Error updating supplier:", error);
      throw new Error("Không thể cập nhật nhà cung cấp");
    }
  }

  static async deleteSupplier(id: string): Promise<void> {
    try {
      const docRef = doc(this.collectionRef, id);
      await deleteDoc(docRef);
    } catch (error) {
      console.error("Error deleting supplier:", error);
      throw new Error("Không thể xóa nhà cung cấp");
    }
  }

  static async toggleSupplierStatus(id: string): Promise<void> {
    try {
      const supplier = await this.getSupplierById(id);
      if (!supplier) {
        throw new Error("Nhà cung cấp không tồn tại");
      }

      await this.updateSupplier(id, {
        isActive: !supplier.isActive,
      });
    } catch (error) {
      console.error("Error toggling supplier status:", error);
      throw new Error("Không thể thay đổi trạng thái nhà cung cấp");
    }
  }

  static async getSuppliersByIds(ids: string[]): Promise<Supplier[]> {
    try {
      if (ids.length === 0) return [];

      const suppliers: Supplier[] = [];

      // Firestore has a limit of 10 items for 'in' queries
      const chunks = [];
      for (let i = 0; i < ids.length; i += 10) {
        chunks.push(ids.slice(i, i + 10));
      }

      for (const chunk of chunks) {
        const q = query(
          this.collectionRef,
          where(
            "__name__",
            "in",
            chunk.map((id) => doc(this.collectionRef, id))
          )
        );
        const querySnapshot = await getDocs(q);

        querySnapshot.forEach((doc) => {
          suppliers.push({
            id: doc.id,
            ...doc.data(),
          } as Supplier);
        });
      }

      return suppliers;
    } catch (error) {
      console.error("Error getting suppliers by IDs:", error);
      throw new Error("Không thể tải danh sách nhà cung cấp");
    }
  }

  static async getActiveSuppliers(): Promise<Supplier[]> {
    try {
      // Try simpler query first - just filter by isActive without orderBy
      const q = query(this.collectionRef, where("isActive", "==", true));
      const querySnapshot = await getDocs(q);

      const suppliers: Supplier[] = [];
      querySnapshot.forEach((doc) => {
        suppliers.push({
          id: doc.id,
          ...doc.data(),
        } as Supplier);
      });

      // Sort on client side to avoid composite index issues
      suppliers.sort((a, b) => a.name.localeCompare(b.name));

      return suppliers;
    } catch (error) {
      console.error("Error getting active suppliers:", error);

      try {
        return await this.getAllSuppliersNoFilter().then((suppliers) =>
          suppliers.filter((s) => s.isActive === true)
        );
      } catch (fallbackError) {
        console.error("Fallback also failed:", fallbackError);
        throw new Error("Không thể tải danh sách nhà cung cấp đang hoạt động");
      }
    }
  }

  // Debug method to get all suppliers without any filter
  static async getAllSuppliersNoFilter(): Promise<Supplier[]> {
    try {
      const q = query(this.collectionRef, orderBy("name"));
      const querySnapshot = await getDocs(q);

      const suppliers: Supplier[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        console.log("📋 Supplier data:", {
          id: doc.id,
          name: data.name,
          isActive: data.isActive,
          hasIsActive: "isActive" in data,
        });

        suppliers.push({
          id: doc.id,
          ...data,
        } as Supplier);
      });

      return suppliers;
    } catch (error) {
      console.error("Error getting all suppliers:", error);
      throw new Error("Không thể tải danh sách nhà cung cấp");
    }
  }
}
