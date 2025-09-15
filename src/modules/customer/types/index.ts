import type { Timestamp } from "firebase/firestore";

export interface Customer {
  id: string;
  name: string;
  email?: string;
  phone: string;
  address: string;
  city: string;
  country: string;
  contactPerson?: string;
  notes?: string;
  customerCode?: string;
  taxCode?: string;
  isActive: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface CreateCustomerData {
  name: string;
  email?: string;
  phone: string;
  address: string;
  city: string;
  country: string;
  contactPerson?: string;
  notes?: string;
  customerCode?: string;
  taxCode?: string;
}

export interface UpdateCustomerData extends Partial<CreateCustomerData> {
  isActive?: boolean;
}

export interface CustomerFilters {
  search?: string;
  city?: string;
  country?: string;
  isActive?: boolean;
  page?: number;
  limit?: number;
}
