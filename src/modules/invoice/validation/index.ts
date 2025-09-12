import { z } from "zod";

export const invoiceItemSchema = z.object({
  type: z.enum(["product", "supply"], {
    message: "Loại mặt hàng không hợp lệ",
  }),
  itemId: z.string().min(1, "Vui lòng chọn sản phẩm/vật tư"),
  category: z.string().min(1, "Danh mục là bắt buộc"),
  quantity: z
    .number()
    .min(1, "Số lượng phải lớn hơn 0")
    .max(999999, "Số lượng quá lớn"),
  unitPrice: z
    .number()
    .min(0, "Đơn giá không được âm")
    .max(99999999, "Đơn giá quá lớn"),
  totalPrice: z
    .number()
    .min(0, "Tổng giá không được âm")
    .max(99999999, "Tổng giá quá lớn"),
  description: z
    .string()
    .max(200, "Mô tả không được vượt quá 200 ký tự")
    .optional()
    .or(z.literal("")),
});

export const createInvoiceSchema = z.object({
  invoiceNumber: z
    .string()
    .min(1, "Số hóa đơn là bắt buộc")
    .max(50, "Số hóa đơn không được vượt quá 50 ký tự")
    .regex(
      /^[A-Z0-9-]+$/,
      "Số hóa đơn chỉ được chứa chữ in hoa, số và dấu gạch ngang"
    ),
  customerId: z.string().optional().or(z.literal("")),
  customerName: z
    .string()
    .max(100, "Tên khách hàng không được vượt quá 100 ký tự")
    .optional()
    .or(z.literal("")),
  items: z
    .array(invoiceItemSchema)
    .min(1, "Phải có ít nhất 1 mặt hàng trong hóa đơn")
    .max(50, "Không được vượt quá 50 mặt hàng trong 1 hóa đơn"),
  vatRate: z
    .number()
    .min(0, "Thuế VAT không được âm")
    .max(100, "Thuế VAT không được quá 100%"),
  notes: z
    .string()
    .max(500, "Ghi chú không được vượt quá 500 ký tự")
    .optional()
    .or(z.literal("")),
});

export const updateInvoiceSchema = createInvoiceSchema.partial().extend({
  status: z
    .enum(["draft", "confirmed", "exported", "completed", "cancelled"])
    .optional(),
});

export const invoiceFiltersSchema = z.object({
  status: z
    .enum(["draft", "confirmed", "exported", "completed", "cancelled"])
    .optional(),
  customerId: z.string().optional(),
  dateFrom: z.date().optional(),
  dateTo: z.date().optional(),
  search: z.string().optional(),
});

export const changeInvoiceStatusSchema = z.object({
  invoiceId: z.string().min(1, "ID hóa đơn là bắt buộc"),
  newStatus: z.enum(
    ["draft", "confirmed", "exported", "completed", "cancelled"],
    {
      message: "Trạng thái không hợp lệ",
    }
  ),
  reason: z
    .string()
    .max(200, "Lý do không được vượt quá 200 ký tự")
    .optional()
    .or(z.literal("")),
});

// Form data types inferred from schemas
export type CreateInvoiceFormData = z.infer<typeof createInvoiceSchema>;
export type UpdateInvoiceFormData = z.infer<typeof updateInvoiceSchema>;
export type InvoiceFiltersFormData = z.infer<typeof invoiceFiltersSchema>;
export type ChangeInvoiceStatusFormData = z.infer<
  typeof changeInvoiceStatusSchema
>;
export type InvoiceItemFormData = z.infer<typeof invoiceItemSchema>;
