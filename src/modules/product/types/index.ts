import type { Timestamp, DocumentSnapshot } from "firebase/firestore";

export interface ProductSupply {
  supplyId: string;
  supplyName: string;
  quantity: number;
  unit: string;
}

export interface Product {
  id: string;
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
  search?: string; // search by name
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
