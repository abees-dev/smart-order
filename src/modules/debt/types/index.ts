export interface Debt {
  id: string;
  type: string;
  referenceId: string;
  referenceNumber: string;
  customerId: string;
  customerName: string;
  supplierId: string | null;
  supplierName: string | null;
  status: string;
  dueDate: string;
  isInstallmentPayment: boolean;
  totalAmount: number;
  description: string;
  notes: string;
  search: string;
  createdAt: string;
  updatedAt: string;
  customer: ReferenceType | null;
  supplier: ReferenceType | null;
  referenceRecord: ReferenceRecord;
  payments: DebtPayment[];
}

export interface DebtPayment {
  id: string;
  debtId: string;
  amount: number;
  paymentDate: string;
  paymentMethod: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface ReferenceType {
  id: string;
  name: string;
}

export interface ReferenceRecord {
  id: string;
  referenceNumber: string;
  totalAmount: number;
  status: string;
}

export interface DebtFilters {
  search?: string;
  type?: "sales" | "purchase";
  status?: "pending" | "partial" | "paid" | "overdue";
  customerId?: string;
  supplierId?: string;
  dueDateFrom?: Date;
  dueDateTo?: Date;
  page?: number;
  limit?: number;
}
