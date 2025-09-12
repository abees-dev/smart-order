import type { Timestamp, DocumentSnapshot } from "firebase/firestore";

export interface ProductSupply {
  supplyId: string;
  supplyName: string;
  quantity: number;
  unit: string;
  purchasePrice?: number; // optional purchase price at the time of adding the supply
}

export interface Product {
  id: string;
  productCode: string; // Mã sản phẩm - unique identifier
  name: string;
  description?: string; // Supports markdown
  category: string;
  price: number;
  cost?: number;
  supplies?: ProductSupply[]; // Optional supplies used to make this product
  isActive: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface CreateProductData {
  productCode: string;
  name: string;
  description?: string;
  category: string;
  price: number;
  cost?: number;
  supplies?: ProductSupply[];
}

export interface UpdateProductData extends Partial<CreateProductData> {
  isActive?: boolean;
}

export interface ProductFilters {
  category?: string;
  isActive?: boolean;
  hasSupplies?: boolean;
  search?: string; // search by name or productCode
  searchBy?: "name" | "productCode" | "both"; // specify what to search by
}

export interface ProductListState {
  products: Product[];
  loading: boolean;
  error: string | null;
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
  lastDoc?: DocumentSnapshot;
}

export interface ProductFormState {
  loading: boolean;
  error: string | null;
}
