import type { Timestamp } from "firebase/firestore";

export interface Supplier {
  id: string;
  name: string;
  email?: string;
  phone: string;
  address: string;
  city: string;
  country: string;
  contactPerson?: string;
  taxNumber?: string;
  bankAccount?: string;
  bankName?: string;
  paymentTerms?: string;
  notes?: string;
  isActive: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface CreateSupplierData {
  name: string;
  email?: string;
  phone?: string;
  address: string;
  city?: string;
  country: string;
  contactPerson?: string;
  taxNumber?: string;
  bankAccount?: string;
  bankName?: string;
  paymentTerms?: string;
  notes?: string;
}

export interface UpdateSupplierData extends Partial<CreateSupplierData> {
  isActive?: boolean;
}

export interface SupplierFilters {
  search?: string;
  city?: string;
  country?: string;
  isActive?: boolean;
}

export interface SupplierListState {
  suppliers: Supplier[];
  loading: boolean;
  error: string | null;
  total: number;
  page: number;
  pageSize: number;
}

export interface SupplierFormState {
  loading: boolean;
  error: string | null;
}

export interface SupplierDetailState {
  supplier: Supplier | null;
  loading: boolean;
  error: string | null;
}
