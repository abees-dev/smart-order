import { z } from "zod";

export const productSupplySchema = z.object({
  supplyId: z.string().min(1, "ID vật tư không được để trống"),
  supplyName: z.string().min(1, "Tên vật tư không được để trống"),
  quantity: z.number().min(0.01, "Số lượng phải lớn hơn 0"),
  unit: z.string().min(1, "Đơn vị không được để trống"),
});

export const createProductSchema = z.object({
  productCode: z
    .string()
    .min(2, "Mã sản phẩm phải có ít nhất 2 ký tự")
    .max(20, "Mã sản phẩm không được quá 20 ký tự")
    .regex(
      /^[A-Z0-9-_.]+$/i,
      "Mã sản phẩm chỉ được chứa chữ cái, số, dấu gạch ngang, gạch dưới và dấu chấm"
    ),
  name: z.string().min(2, "Tên sản phẩm phải có ít nhất 2 ký tự"),
  description: z.string().optional(),
  category: z.string().min(2, "Danh mục phải có ít nhất 2 ký tự"),
  price: z.number().min(0, "Giá bán phải lớn hơn hoặc bằng 0"),
  cost: z.number().min(0, "Giá vốn phải lớn hơn hoặc bằng 0").optional(),
  supplies: z.array(productSupplySchema).optional().default([]),
});

export const updateProductSchema = createProductSchema.partial().extend({
  isActive: z.boolean().optional(),
});

export const productFilterSchema = z.object({
  category: z.string().optional(),
  isActive: z.boolean().optional(),
  hasSupplies: z.boolean().optional(),
  search: z.string().optional(),
  searchBy: z.enum(["name", "productCode", "both"]).optional().default("both"),
});

export type CreateProductFormData = z.infer<typeof createProductSchema>;
export type UpdateProductFormData = z.infer<typeof updateProductSchema>;
export type ProductFiltersFormData = z.infer<typeof productFilterSchema>;
export type ProductSupplyFormData = z.infer<typeof productSupplySchema>;
