import { z } from "zod";

export const createSupplierSchema = z.object({
  name: z
    .string()
    .min(2, "Tên nhà cung cấp phải có ít nhất 2 ký tự")
    .max(100, "Tên nhà cung cấp không được vượt quá 100 ký tự"),
  email: z
    .string()
    .email("Email không hợp lệ")
    .max(255, "Email không được vượt quá 255 ký tự")
    .optional()
    .or(z.literal("")),
  phone: z
    .string()
    .min(10, "Số điện thoại phải có ít nhất 10 số")
    .max(15, "Số điện thoại không được vượt quá 15 số")
    .regex(
      /^[0-9+\-\s()]+$/,
      "Số điện thoại chỉ được chứa số và các ký tự đặc biệt"
    ),
  address: z
    .string()
    .min(5, "Địa chỉ phải có ít nhất 5 ký tự")
    .max(255, "Địa chỉ không được vượt quá 255 ký tự"),
  city: z
    .string()
    .min(2, "Thành phố phải có ít nhất 2 ký tự")
    .max(100, "Thành phố không được vượt quá 100 ký tự"),
  country: z
    .string()
    .min(2, "Quốc gia phải có ít nhất 2 ký tự")
    .max(100, "Quốc gia không được vượt quá 100 ký tự"),
  contactPerson: z
    .string()
    .max(100, "Tên người liên hệ không được vượt quá 100 ký tự")
    .optional()
    .or(z.literal("")),
  taxNumber: z
    .string()
    .max(50, "Mã số thuế không được vượt quá 50 ký tự")
    .optional()
    .or(z.literal("")),
  bankAccount: z
    .string()
    .max(50, "Số tài khoản ngân hàng không được vượt quá 50 ký tự")
    .optional()
    .or(z.literal("")),
  bankName: z
    .string()
    .max(100, "Tên ngân hàng không được vượt quá 100 ký tự")
    .optional()
    .or(z.literal("")),
  paymentTerms: z
    .string()
    .max(255, "Điều khoản thanh toán không được vượt quá 255 ký tự")
    .optional()
    .or(z.literal("")),
  notes: z
    .string()
    .max(1000, "Ghi chú không được vượt quá 1000 ký tự")
    .optional()
    .or(z.literal("")),
});

export const updateSupplierSchema = createSupplierSchema.partial().extend({
  isActive: z.boolean().optional(),
});

export const supplierFiltersSchema = z.object({
  search: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
  isActive: z.boolean().optional(),
});

export type CreateSupplierFormData = z.infer<typeof createSupplierSchema>;
export type UpdateSupplierFormData = z.infer<typeof updateSupplierSchema>;
export type SupplierFiltersFormData = z.infer<typeof supplierFiltersSchema>;
