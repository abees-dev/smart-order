import axiosInstance from "@/utils/axios";
import type { CreateDebtFormData, DebtPaymentFormData } from "../validation";
import type { Debt, DebtFilters } from "../types";
import type { ApiResponsePagination } from "@/types/response";

export class DebtService {
  static async createDebt(data: CreateDebtFormData) {
    return axiosInstance.post("/debts", data);
  }
  static async getAllDebts(query: DebtFilters) {
    return axiosInstance.get("/debts", { params: query }) as Promise<
      ApiResponsePagination<Debt[]>
    >;
  }
  static async createDebtPayment(debtId: string, data: DebtPaymentFormData) {
    return axiosInstance.post(`/debts/${debtId}/payments`, data);
  }
}
