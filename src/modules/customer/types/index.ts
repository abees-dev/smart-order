import type { Timestamp } from "firebase/firestore";

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
  notes?: string;
  isActive: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface CreateCustomerData {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
  notes?: string;
}

export interface UpdateCustomerData extends Partial<CreateCustomerData> {
  isActive?: boolean;
}

export interface CustomerFilters {
  search?: string;
  city?: string;
  country?: string;
  isActive?: boolean;
}

export interface CustomerListState {
  customers: Customer[];
  loading: boolean;
  error: string | null;
  total: number;
  page: number;
  pageSize: number;
}

export interface CustomerFormState {
  loading: boolean;
  error: string | null;
}
