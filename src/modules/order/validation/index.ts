import { z } from "zod";

export const orderItemSchema = z.object({
  type: z.enum(["product", "supply"], {
    message: "Loại mặt hàng không hợp lệ",
  }),
  itemId: z.string().min(1, "Vui lòng chọn sản phẩm/vật tư"),
  quantity: z.number().min(1, "Số lượng phải lớn hơn 0"),
  unitPrice: z.number().min(0, "Đơn giá không được âm"),

  totalPrice: z.number().min(0, "Tổng giá không được âm"),
  description: z
    .string()
    .max(200, "Mô tả không được vượt quá 200 ký tự")
    .optional()
    .or(z.literal("")),
});

export const createOrderSchema = z.object({
  orderNumber: z
    .string()
    .min(1, "Số đơn hàng là bắt buộc")
    .max(50, "Số đơn hàng không được vượt quá 50 ký tự")
    .regex(
      /^[A-Z0-9-]+$/,
      "Số đơn hàng chỉ được chứa chữ in hoa, số và dấu gạch ngang"
    ),
  customerId: z.string().optional().or(z.literal("")),
  customerName: z
    .string()
    .max(100, "Tên khách hàng không được vượt quá 100 ký tự")
    .optional()
    .or(z.literal("")),
  items: z
    .array(orderItemSchema)
    .min(1, "Phải có ít nhất 1 mặt hàng trong đơn hàng")
    .max(50, "Không được vượt quá 50 mặt hàng trong 1 đơn hàng"),
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

export const updateOrderSchema = createOrderSchema.partial().extend({
  status: z
    .enum(["draft", "confirmed", "exported", "completed", "cancelled"])
    .optional(),
});

export const orderFiltersSchema = z.object({
  status: z
    .enum(["draft", "confirmed", "exported", "completed", "cancelled"])
    .optional(),
  customerId: z.string().optional(),
  dateFrom: z.date().optional(),
  dateTo: z.date().optional(),
  search: z.string().optional(),
});

export const changeOrderStatusSchema = z.object({
  orderId: z.string().min(1, "ID đơn hàng là bắt buộc"),
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
export type CreateOrderFormData = z.infer<typeof createOrderSchema>;
export type UpdateOrderFormData = z.infer<typeof updateOrderSchema>;
export type OrderFiltersFormData = z.infer<typeof orderFiltersSchema>;
export type ChangeOrderStatusFormData = z.infer<typeof changeOrderStatusSchema>;
export type OrderItemFormData = z.infer<typeof orderItemSchema>;

// Cost Incurred validation schemas
export const createCostIncurredSchema = z.object({
  orderId: z.string().min(1, "ID đơn hàng là bắt buộc"),
  costType: z.enum(["material", "labor", "equipment", "transport", "other"], {
    message: "Loại chi phí không hợp lệ",
  }),
  description: z
    .string()
    .min(1, "Mô tả là bắt buộc")
    .max(200, "Mô tả không được vượt quá 200 ký tự"),
  amount: z.number().min(0.01, "Số tiền phải lớn hơn 0"),
  quantity: z.number().min(0.01, "Số lượng phải lớn hơn 0").optional(),
  unitPrice: z.number().min(0, "Đơn giá không được âm").optional(),
  invoiceNumber: z
    .string()
    .max(50, "Số hóa đơn không được vượt quá 50 ký tự")
    .optional()
    .or(z.literal("")),
  incurredDate: z.string().min(1, "Ngày phát sinh là bắt buộc"),
  notes: z
    .string()
    .max(500, "Ghi chú không được vượt quá 500 ký tự")
    .optional()
    .or(z.literal("")),
});

export const updateCostIncurredSchema = createCostIncurredSchema.partial();

export const costIncurredFiltersSchema = z.object({
  orderId: z.string().optional(),
  costType: z
    .enum(["material", "labor", "equipment", "transport", "other"])
    .optional(),
  dateFrom: z.date().optional(),
  dateTo: z.date().optional(),
  search: z.string().optional(),
});

// Cost Incurred form data types
export type CreateCostIncurredFormData = z.infer<
  typeof createCostIncurredSchema
>;
export type UpdateCostIncurredFormData = z.infer<
  typeof updateCostIncurredSchema
>;
export type CostIncurredFiltersFormData = z.infer<
  typeof costIncurredFiltersSchema
>;
