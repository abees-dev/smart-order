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
  Customer,
  CreateCustomerData,
  UpdateCustomerData,
  CustomerFilters,
} from "../types";

const COLLECTION_NAME = "customers";

export class CustomerService {
  private static collectionRef = collection(db, COLLECTION_NAME);

  static async getAllCustomers(
    filters: CustomerFilters = {},
    pageSize = 10,
    lastDoc?: DocumentSnapshot
  ): Promise<{
    customers: Customer[];
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

      // Add search filter (simple text search on name)
      if (filters.search) {
        constraints.push(where("name", ">=", filters.search));
        constraints.push(where("name", "<=", filters.search + "\uf8ff"));
        constraints.push(orderBy("name"));
      } else {
        // Add ordering only when not searching
        constraints.push(orderBy("createdAt", "desc"));
      }

      constraints.push(limit(pageSize));

      if (lastDoc) {
        constraints.push(startAfter(lastDoc));
      }

      const q = query(this.collectionRef, ...constraints);
      const querySnapshot = await getDocs(q);

      const customers: Customer[] = [];
      querySnapshot.forEach((doc) => {
        customers.push({
          id: doc.id,
          ...doc.data(),
        } as Customer);
      });

      const hasMore = querySnapshot.docs.length === pageSize;
      const newLastDoc = querySnapshot.docs[querySnapshot.docs.length - 1];

      return {
        customers,
        hasMore,
        lastDoc: newLastDoc,
      };
    } catch (error) {
      console.error("Error getting customers:", error);
      // Return empty result with debug info instead of throwing to prevent infinite loading
      console.error("Firebase error details:", error);
      return {
        customers: [],
        hasMore: false,
        lastDoc: undefined,
      };
    }
  }

  static async getCustomerById(id: string): Promise<Customer> {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        throw new Error("Khách hàng không tồn tại");
      }

      return {
        id: docSnap.id,
        ...docSnap.data(),
      } as Customer;
    } catch (error) {
      console.error("Error getting customer:", error);
      throw new Error("Không thể tải thông tin khách hàng");
    }
  }

  static async createCustomer(data: CreateCustomerData): Promise<Customer> {
    try {
      const now = Timestamp.now();
      const customerData = {
        ...data,
        isActive: true,
        createdAt: now,
        updatedAt: now,
      };

      const docRef = await addDoc(this.collectionRef, customerData);

      return {
        id: docRef.id,
        ...customerData,
      };
    } catch (error) {
      console.error("Error creating customer:", error);
      throw new Error("Không thể tạo khách hàng mới");
    }
  }

  static async updateCustomer(
    id: string,
    data: UpdateCustomerData
  ): Promise<Customer> {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      const updateData = {
        ...data,
        updatedAt: Timestamp.now(),
      };

      await updateDoc(docRef, updateData);

      // Get updated document
      return await this.getCustomerById(id);
    } catch (error) {
      console.error("Error updating customer:", error);
      throw new Error("Không thể cập nhật thông tin khách hàng");
    }
  }

  static async deleteCustomer(id: string): Promise<void> {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      await deleteDoc(docRef);
    } catch (error) {
      console.error("Error deleting customer:", error);
      throw new Error("Không thể xóa khách hàng");
    }
  }

  static async toggleCustomerStatus(id: string): Promise<Customer> {
    try {
      const customer = await this.getCustomerById(id);
      return await this.updateCustomer(id, { isActive: !customer.isActive });
    } catch (error) {
      console.error("Error toggling customer status:", error);
      throw new Error("Không thể thay đổi trạng thái khách hàng");
    }
  }

  static async searchCustomers(searchTerm: string): Promise<Customer[]> {
    try {
      const { customers } = await this.getAllCustomers(
        { search: searchTerm },
        50 // Return more results for search
      );
      return customers;
    } catch (error) {
      console.error("Error searching customers:", error);
      throw new Error("Không thể tìm kiếm khách hàng");
    }
  }
}
