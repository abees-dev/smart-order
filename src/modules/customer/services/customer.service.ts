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
  getCountFromServer,
} from "firebase/firestore";
import { db } from "@/config/firebase";
import type {
  Customer,
  CreateCustomerData,
  UpdateCustomerData,
  CustomerFilters,
} from "../types";
import { normalizeText } from "@/utils";

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

  static async getCustomersWithPagination(
    filters: CustomerFilters = {},
    pageSize = 10,
    page = 1
  ): Promise<{
    customers: Customer[];
    hasMore: boolean;
    total: number;
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

      // Get total count
      const countQuery = query(this.collectionRef, ...constraints);
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
          this.collectionRef,
          ...constraints.slice(0, -1),
          limit(skip)
        );
        const skipSnapshot = await getDocs(skipQuery);
        if (skipSnapshot.docs.length > 0) {
          const lastSkipDoc = skipSnapshot.docs[skipSnapshot.docs.length - 1];
          const paginatedQuery = query(
            this.collectionRef,
            ...constraints.slice(0, -1),
            startAfter(lastSkipDoc),
            limit(pageSize)
          );
          querySnapshot = await getDocs(paginatedQuery);
        } else {
          // If no documents to skip, return empty result
          return {
            customers: [],
            hasMore: false,
            total,
            lastDoc: undefined,
          };
        }
      } else {
        const paginatedQuery = query(this.collectionRef, ...constraints);
        querySnapshot = await getDocs(paginatedQuery);
      }

      const customers: Customer[] = [];
      querySnapshot.forEach((doc) => {
        customers.push({
          id: doc.id,
          ...doc.data(),
        } as Customer);
      });

      const hasMore = skip + customers.length < total;
      const newLastDoc = querySnapshot.docs[querySnapshot.docs.length - 1];

      return {
        customers,
        hasMore,
        total,
        lastDoc: newLastDoc,
      };
    } catch (error) {
      console.error("Error getting customers with pagination:", error);
      return {
        customers: [],
        hasMore: false,
        total: 0,
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

  // Helper method to clean data for Firebase
  private static cleanCustomerData(
    data: CreateCustomerData
  ): Partial<CreateCustomerData> {
    const cleaned: Partial<CreateCustomerData> = {};

    // Always include required fields
    cleaned.name = data.name;
    cleaned.phone = data.phone;
    cleaned.address = data.address;
    cleaned.city = data.city;
    cleaned.country = data.country;

    // Only include optional fields if they have values
    if (data.email && data.email.trim() !== "") {
      cleaned.email = data.email;
    }
    if (data.contactPerson && data.contactPerson.trim() !== "") {
      cleaned.contactPerson = data.contactPerson;
    }
    if (data.notes && data.notes.trim() !== "") {
      cleaned.notes = data.notes;
    }

    return cleaned;
  }

  static async createCustomer(data: CreateCustomerData): Promise<Customer> {
    try {
      const now = Timestamp.now();
      const cleanedData = this.cleanCustomerData(data);
      const customerData = {
        ...cleanedData,
        isActive: true,
        createdAt: now,
        updatedAt: now,
        search: normalizeText(cleanedData.name || ""),
      };

      const docRef = await addDoc(this.collectionRef, customerData);

      return {
        id: docRef.id,
        ...customerData,
      } as Customer;
    } catch (error) {
      console.error("Error creating customer:", error);
      throw new Error("Không thể tạo khách hàng mới");
    }
  }

  // Helper method to clean update data for Firebase
  private static cleanUpdateData(
    data: UpdateCustomerData
  ): Partial<UpdateCustomerData> {
    const cleaned: Partial<UpdateCustomerData> = {};

    // Handle all possible fields
    if (data.name !== undefined) cleaned.name = data.name;
    if (data.phone !== undefined) cleaned.phone = data.phone;
    if (data.address !== undefined) cleaned.address = data.address;
    if (data.city !== undefined) cleaned.city = data.city;
    if (data.country !== undefined) cleaned.country = data.country;
    if (data.isActive !== undefined) cleaned.isActive = data.isActive;

    // Only include optional fields if they have values
    if (data.email !== undefined) {
      if (data.email && data.email.trim() !== "") {
        cleaned.email = data.email;
      }
      // If email is empty string, we want to remove it from Firebase
      // We'll handle this by setting it to firebase.firestore.FieldValue.delete()
    }

    if (data.contactPerson !== undefined) {
      if (data.contactPerson && data.contactPerson.trim() !== "") {
        cleaned.contactPerson = data.contactPerson;
      }
    }

    if (data.notes !== undefined) {
      if (data.notes && data.notes.trim() !== "") {
        cleaned.notes = data.notes;
      }
    }
    if (data.customerCode !== undefined) {
      cleaned.customerCode = data.customerCode.trim();
    }
    if (data.taxCode !== undefined) {
      cleaned.taxCode = data.taxCode.trim();
    }

    return cleaned;
  }

  static async updateCustomer(
    id: string,
    data: UpdateCustomerData
  ): Promise<Customer> {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      const cleanedData = this.cleanUpdateData(data);
      const updateData = {
        ...cleanedData,
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
