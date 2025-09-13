import { z } from "zod";

export const createCustomerSchema = z.object({
  name: z
    .string()
    .min(2, "Tên khách hàng phải có ít nhất 2 ký tự")
    .max(100, "Tên khách hàng không được vượt quá 100 ký tự"),
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
    .max(100, "Người liên hệ không được vượt quá 100 ký tự")
    .optional()
    .or(z.literal("")),
  notes: z
    .string()
    .max(500, "Ghi chú không được vượt quá 500 ký tự")
    .optional()
    .or(z.literal("")),
  customerCode: z
    .string()
    .max(100, "Mã khách hàng không vượt quá 100 ký tự")
    .optional()
    .or(z.literal("")),
  taxCode: z
    .string()
    .max(100, "Mã số thuế không vượt quá 100 ký tự")
    .optional()
    .or(z.literal("")),
});

export const updateCustomerSchema = createCustomerSchema.partial().extend({
  isActive: z.boolean().optional(),
});

export const customerFiltersSchema = z.object({
  search: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
  isActive: z.boolean().optional(),
});

export type CreateCustomerFormData = z.infer<typeof createCustomerSchema>;
export type UpdateCustomerFormData = z.infer<typeof updateCustomerSchema>;
export type CustomerFiltersData = z.infer<typeof customerFiltersSchema>;
