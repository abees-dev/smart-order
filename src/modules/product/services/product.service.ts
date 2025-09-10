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
  Product,
  CreateProductData,
  UpdateProductData,
  ProductFilters,
} from "../types";

const PRODUCTS_COLLECTION = "products";

export class ProductService {
  private static productsRef = collection(db, PRODUCTS_COLLECTION);

  static async getAllProducts(
    filters: ProductFilters = {},
    pageSize = 10,
    lastDoc?: DocumentSnapshot
  ): Promise<{
    products: Product[];
    hasMore: boolean;
    lastDoc?: DocumentSnapshot;
  }> {
    try {
      const constraints: QueryConstraint[] = [];

      // Apply filters
      if (filters.category) {
        constraints.push(where("category", "==", filters.category));
      }

      if (filters.isActive !== undefined) {
        constraints.push(where("isActive", "==", filters.isActive));
      }

      if (filters.hasSupplies !== undefined) {
        if (filters.hasSupplies) {
          constraints.push(where("supplies", "!=", null));
        } else {
          constraints.push(where("supplies", "==", null));
        }
      }

      if (filters.search) {
        constraints.push(where("name", ">=", filters.search));
        constraints.push(where("name", "<=", filters.search + "\uf8ff"));
      }

      // Add ordering and pagination
      constraints.push(orderBy("name"));
      constraints.push(limit(pageSize));

      if (lastDoc) {
        constraints.push(startAfter(lastDoc));
      }

      const q = query(this.productsRef, ...constraints);
      const querySnapshot = await getDocs(q);

      const products: Product[] = [];
      querySnapshot.forEach((doc) => {
        products.push({ id: doc.id, ...doc.data() } as Product);
      });

      const hasMore = querySnapshot.docs.length === pageSize;
      const newLastDoc = querySnapshot.docs[querySnapshot.docs.length - 1];

      return {
        products,
        hasMore,
        lastDoc: newLastDoc,
      };
    } catch (error) {
      console.error("Error getting products:", error);
      throw new Error("Không thể tải danh sách sản phẩm");
    }
  }

  static async getProductById(id: string): Promise<Product | null> {
    try {
      const docRef = doc(this.productsRef, id);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as Product;
      }

      return null;
    } catch (error) {
      console.error("Error getting product:", error);
      throw new Error("Không thể tải thông tin sản phẩm");
    }
  }

  static async createProduct(data: CreateProductData): Promise<Product> {
    try {
      const now = Timestamp.now();
      const productData = {
        ...data,
        isActive: true,
        createdAt: now,
        updatedAt: now,
      };

      const docRef = await addDoc(this.productsRef, productData);
      return { id: docRef.id, ...productData } as Product;
    } catch (error) {
      console.error("Error creating product:", error);
      throw new Error("Không thể tạo sản phẩm mới");
    }
  }

  static async updateProduct(
    id: string,
    data: UpdateProductData
  ): Promise<Product> {
    try {
      const docRef = doc(this.productsRef, id);
      const updateData = {
        ...data,
        updatedAt: Timestamp.now(),
      };

      await updateDoc(docRef, updateData);

      const updatedDoc = await getDoc(docRef);
      if (updatedDoc.exists()) {
        return { id: updatedDoc.id, ...updatedDoc.data() } as Product;
      }

      throw new Error("Sản phẩm không tồn tại sau khi cập nhật");
    } catch (error) {
      console.error("Error updating product:", error);
      throw new Error("Không thể cập nhật sản phẩm");
    }
  }

  static async deleteProduct(id: string): Promise<void> {
    try {
      const docRef = doc(this.productsRef, id);
      await deleteDoc(docRef);
    } catch (error) {
      console.error("Error deleting product:", error);
      throw new Error("Không thể xóa sản phẩm");
    }
  }

  static async getProductsByCategory(category: string): Promise<Product[]> {
    try {
      const q = query(
        this.productsRef,
        where("category", "==", category),
        where("isActive", "==", true),
        orderBy("name")
      );

      const querySnapshot = await getDocs(q);
      const products: Product[] = [];

      querySnapshot.forEach((doc) => {
        products.push({ id: doc.id, ...doc.data() } as Product);
      });

      return products;
    } catch (error) {
      console.error("Error getting products by category:", error);
      throw new Error("Không thể tải sản phẩm theo danh mục");
    }
  }

  static async getActiveProducts(): Promise<Product[]> {
    try {
      const q = query(
        this.productsRef,
        where("isActive", "==", true),
        orderBy("name")
      );

      const querySnapshot = await getDocs(q);
      const products: Product[] = [];

      querySnapshot.forEach((doc) => {
        products.push({ id: doc.id, ...doc.data() } as Product);
      });

      return products;
    } catch (error) {
      console.error("Error getting active products:", error);
      throw new Error("Không thể tải danh sách sản phẩm hoạt động");
    }
  }
}
