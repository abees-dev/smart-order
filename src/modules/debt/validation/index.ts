import { z } from "zod";

export const createDebtSchema = z.object({
  type: z.enum(["sales", "purchase"], {
    message: "Loại công nợ là bắt buộc",
  }),
  referenceId: z
    .string()
    .min(1, "Mã tham chiếu là bắt buộc")
    .max(100, "Mã tham chiếu không được vượt quá 100 ký tự"),
  referenceNumber: z
    .string()
    .min(1, "Số tham chiếu là bắt buộc")
    .max(100, "Số tham chiếu không được vượt quá 100 ký tự"),
  dueDate: z.date().optional(),
  isInstallmentPayment: z.boolean().optional(),
  description: z
    .string()
    .max(255, "Mô tả không được vượt quá 255 ký tự")
    .optional()
    .or(z.literal("")),
  notes: z
    .string()
    .max(500, "Ghi chú không được vượt quá 500 ký tự")
    .optional()
    .or(z.literal("")),
});

export const updateDebtSchema = createDebtSchema.partial();

export const debtFiltersSchema = z.object({
  search: z.string().optional(),
  type: z.enum(["sales", "purchase"]).optional(),
  hasInstallment: z.boolean().optional(),
});

export const debtPaymentSchema = z.object({
  amount: z
    .number()
    .min(0.01, "Số tiền thanh toán phải lớn hơn 0")
    .max(999999999, "Số tiền thanh toán không được vượt quá 999,999,999"),
  paymentDate: z.date().optional(),
  notes: z
    .string()
    .max(500, "Ghi chú không được vượt quá 500 ký tự")
    .optional()
    .or(z.literal("")),
});

export type CreateDebtFormData = z.infer<typeof createDebtSchema>;
export type UpdateDebtFormData = z.infer<typeof updateDebtSchema>;
export type DebtFiltersData = z.infer<typeof debtFiltersSchema>;
export type DebtPaymentFormData = z.infer<typeof debtPaymentSchema>;
