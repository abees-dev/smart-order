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

  static async getProductsWithPagination(
    filters: ProductFilters = {},
    pageSize = 10,
    page = 1
  ): Promise<{
    products: Product[];
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
      if (filters.isActive !== undefined) {
        constraints.push(where("isActive", "==", filters.isActive));
      }
      if (filters.hasSupplies !== undefined) {
        if (filters.hasSupplies) {
          constraints.push(where("supplies", "!=", null));
        }
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
      const countQuery = query(this.productsRef, ...constraints);
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
          this.productsRef,
          ...constraints.slice(0, -1), // Remove limit constraint
          limit(skip)
        );
        const skipSnapshot = await getDocs(skipQuery);
        const lastVisible = skipSnapshot.docs[skipSnapshot.docs.length - 1];

        if (lastVisible) {
          const finalQuery = query(
            this.productsRef,
            ...constraints.slice(0, -1), // Remove limit constraint
            startAfter(lastVisible),
            limit(pageSize)
          );
          querySnapshot = await getDocs(finalQuery);
        } else {
          // If no documents to skip, return empty result
          return {
            products: [],
            hasMore: false,
            total,
            lastDoc: undefined,
          };
        }
      } else {
        const finalQuery = query(this.productsRef, ...constraints);
        querySnapshot = await getDocs(finalQuery);
      }

      const products: Product[] = [];
      querySnapshot.forEach((doc) => {
        products.push({ id: doc.id, ...doc.data() } as Product);
      });

      const hasMore = total > page * pageSize;
      const lastDoc = querySnapshot.docs[querySnapshot.docs.length - 1];

      return {
        products,
        hasMore,
        total,
        lastDoc,
      };
    } catch (error) {
      console.error("Error getting products with pagination:", error);
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

  // Check if product code already exists
  static async isProductCodeExists(
    productCode: string,
    excludeId?: string
  ): Promise<boolean> {
    try {
      const q = query(
        this.productsRef,
        where("productCode", "==", productCode)
      );

      const querySnapshot = await getDocs(q);

      if (excludeId) {
        // When updating, exclude the current product from the check
        return querySnapshot.docs.some((doc) => doc.id !== excludeId);
      }

      return !querySnapshot.empty;
    } catch (error) {
      console.error("Error checking product code:", error);
      throw new Error("Không thể kiểm tra mã sản phẩm");
    }
  }

  // Search products by product code
  static async searchByProductCode(productCode: string): Promise<Product[]> {
    try {
      const q = query(
        this.productsRef,
        where("productCode", ">=", productCode),
        where("productCode", "<=", productCode + "\uf8ff"),
        orderBy("productCode")
      );

      const querySnapshot = await getDocs(q);
      const products: Product[] = [];

      querySnapshot.forEach((doc) => {
        products.push({ id: doc.id, ...doc.data() } as Product);
      });

      return products;
    } catch (error) {
      console.error("Error searching products by code:", error);
      throw new Error("Không thể tìm kiếm sản phẩm theo mã");
    }
  }

  // Get product by product code (exact match)
  static async getProductByCode(productCode: string): Promise<Product | null> {
    try {
      const q = query(
        this.productsRef,
        where("productCode", "==", productCode)
      );

      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const doc = querySnapshot.docs[0];
        return { id: doc.id, ...doc.data() } as Product;
      }

      return null;
    } catch (error) {
      console.error("Error getting product by code:", error);
      throw new Error("Không thể tải sản phẩm theo mã");
    }
  }
}
