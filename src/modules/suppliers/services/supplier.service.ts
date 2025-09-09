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
    pageSize = 10
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
      constraints.push(limit(pageSize));

      const q = query(this.collectionRef, ...constraints);
      const querySnapshot = await getDocs(q);

      const suppliers: Supplier[] = [];
      querySnapshot.forEach((doc) => {
        const supplier = {
          id: doc.id,
          ...doc.data(),
        } as Supplier;

        // Client-side filtering for search term
        if (
          supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          supplier.phone.includes(searchTerm) ||
          (supplier.email &&
            supplier.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (supplier.contactPerson &&
            supplier.contactPerson
              .toLowerCase()
              .includes(searchTerm.toLowerCase()))
        ) {
          suppliers.push(supplier);
        }
      });

      return suppliers;
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
      const q = query(
        this.collectionRef,
        where("isActive", "==", true),
        orderBy("name")
      );
      const querySnapshot = await getDocs(q);

      const suppliers: Supplier[] = [];
      querySnapshot.forEach((doc) => {
        suppliers.push({
          id: doc.id,
          ...doc.data(),
        } as Supplier);
      });

      return suppliers;
    } catch (error) {
      console.error("Error getting active suppliers:", error);
      throw new Error("Không thể tải danh sách nhà cung cấp đang hoạt động");
    }
  }
}
