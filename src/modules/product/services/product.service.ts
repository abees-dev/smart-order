import type {
  Product,
  CreateProductData,
  UpdateProductData,
  ProductFilters,
} from "../types";
import type { ApiResponsePagination } from "@/types/response";
import axiosInstance from "@/utils/axios";

export class ProductService {
  static async getAllProducts(
    filters: ProductFilters = {}
  ): Promise<ApiResponsePagination<Product[]>> {
    return axiosInstance.get("/products", { params: filters });
  }

  static async getProductById(id: string): Promise<Product | null> {
    return await axiosInstance.get(`/products/${id}`);
  }

  static async createProduct(data: CreateProductData): Promise<Product> {
    return await axiosInstance.post("/products", data);
  }

  static async updateProduct(
    id: string,
    data: UpdateProductData
  ): Promise<Product> {
    return await axiosInstance.patch(`/products/${id}`, data);
  }

  static async deleteProduct(id: string): Promise<void> {
    return await axiosInstance.delete(`/products/${id}`);
  }
}
