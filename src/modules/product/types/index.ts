export interface ProductSupply {
  supplyId: string;
  quantity: number;
  unit: string;
  purchasePrice?: number; // optional purchase price at the time of adding the supply
  supplyName?: string; // optional supply name for easier reference
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
  createdAt: Date;
  updatedAt: Date;
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
  isActive?: boolean;
  search?: string; // search by name or productCode
  page?: number;
  limit?: number;
  category?: string;
}

export interface ProductFormState {
  loading: boolean;
  error: string | null;
}
