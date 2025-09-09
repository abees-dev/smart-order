import { z } from "zod";

export const createSupplySchema = z.object({
  name: z
    .string()
    .min(2, "Tên vật tư phải có ít nhất 2 ký tự")
    .max(100, "Tên vật tư không được vượt quá 100 ký tự"),
  sku: z
    .string()
    .min(2, "Mã SKU phải có ít nhất 2 ký tự")
    .max(50, "Mã SKU không được vượt quá 50 ký tự")
    .regex(
      /^[A-Z0-9\-_]+$/,
      "Mã SKU chỉ được chứa chữ hoa, số, gạch ngang và gạch dưới"
    ),
  description: z
    .string()
    .max(500, "Mô tả không được vượt quá 500 ký tự")
    .optional()
    .or(z.literal("")),
  category: z
    .string()
    .min(2, "Danh mục phải có ít nhất 2 ký tự")
    .max(50, "Danh mục không được vượt quá 50 ký tự"),
  unit: z
    .string()
    .min(1, "Đơn vị tính là bắt buộc")
    .max(20, "Đơn vị tính không được vượt quá 20 ký tự"),
  currentStock: z
    .number()
    .min(0, "Tồn kho hiện tại không được âm")
    .max(999999, "Tồn kho hiện tại quá lớn"),
  minStock: z
    .number()
    .min(0, "Tồn kho tối thiểu không được âm")
    .max(999999, "Tồn kho tối thiểu quá lớn"),
  purchasePrice: z
    .number()
    .min(0, "Giá mua không được âm")
    .max(99999999, "Giá mua quá lớn"),
  salePrice: z
    .number()
    .min(0, "Giá bán không được âm")
    .max(99999999, "Giá bán quá lớn"),
  supplierId: z.string().optional().or(z.literal("")),
  location: z
    .string()
    .max(100, "Vị trí lưu trữ không được vượt quá 100 ký tự")
    .optional()
    .or(z.literal("")),
});

export const updateSupplySchema = createSupplySchema.partial().extend({
  isActive: z.boolean().optional(),
});

export const supplyFiltersSchema = z.object({
  category: z.string().optional(),
  supplierId: z.string().optional(),
  location: z.string().optional(),
  isActive: z.boolean().optional(),
  lowStock: z.boolean().optional(),
  search: z.string().optional(),
});

export const stockMovementSchema = z.object({
  supplyId: z.string().min(1, "ID vật tư là bắt buộc"),
  type: z.enum(["in", "out", "adjustment", "import"], {
    message: "Loại giao dịch không hợp lệ",
  }),
  quantity: z
    .number()
    .min(1, "Số lượng phải lớn hơn 0")
    .max(999999, "Số lượng quá lớn"),
  unitPrice: z.number().min(0, "Giá đơn vị không được âm").optional(),
  totalValue: z.number().min(0, "Tổng giá trị không được âm").optional(),
  invoiceNumber: z
    .string()
    .max(50, "Số hóa đơn không được vượt quá 50 ký tự")
    .optional()
    .or(z.literal("")),
  reason: z
    .string()
    .max(255, "Lý do không được vượt quá 255 ký tự")
    .optional()
    .or(z.literal("")),
  performedBy: z
    .string()
    .max(100, "Người thực hiện không được vượt quá 100 ký tự")
    .optional()
    .or(z.literal("")),
});

export const supplyImportItemSchema = z.object({
  supplyId: z.string().min(1, "ID vật tư là bắt buộc"),
  quantity: z
    .number()
    .min(1, "Số lượng phải lớn hơn 0")
    .max(999999, "Số lượng quá lớn"),
  unitPrice: z
    .number()
    .min(0, "Giá đơn vị không được âm")
    .max(99999999, "Giá đơn vị quá lớn"),
  vatRate: z
    .number()
    .min(0, "Thuế VAT không được âm")
    .max(100, "Thuế VAT không được quá 100%"),
  totalPrice: z
    .number()
    .min(0, "Tổng giá không được âm")
    .max(99999999, "Tổng giá quá lớn"),
});

export const createSupplyImportSchema = z.object({
  invoiceNumber: z
    .string()
    .min(1, "Số hóa đơn là bắt buộc")
    .max(50, "Số hóa đơn không được vượt quá 50 ký tự"),
  supplierId: z.string().min(1, "Nhà cung cấp là bắt buộc"),
  notes: z
    .string()
    .max(500, "Ghi chú không được vượt quá 500 ký tự")
    .optional()
    .or(z.literal("")),
  items: z
    .array(supplyImportItemSchema)
    .min(1, "Phải có ít nhất 1 vật tư để nhập"),
});

export const updateSupplyImportSchema = createSupplyImportSchema
  .partial()
  .extend({
    status: z.enum(["pending", "completed", "cancelled"]).optional(),
  });

export const supplyImportFiltersSchema = z.object({
  supplierId: z.string().optional(),
  status: z.enum(["pending", "completed", "cancelled"]).optional(),
  search: z.string().optional(),
});

export type CreateSupplyFormData = z.infer<typeof createSupplySchema>;
export type UpdateSupplyFormData = z.infer<typeof updateSupplySchema>;
export type SupplyFiltersData = z.infer<typeof supplyFiltersSchema>;
export type StockMovementFormData = z.infer<typeof stockMovementSchema>;
export type SupplyImportItemFormData = z.infer<typeof supplyImportItemSchema>;
export type CreateSupplyImportFormData = z.infer<
  typeof createSupplyImportSchema
>;
export type UpdateSupplyImportFormData = z.infer<
  typeof updateSupplyImportSchema
>;
export type SupplyImportFiltersData = z.infer<typeof supplyImportFiltersSchema>;
