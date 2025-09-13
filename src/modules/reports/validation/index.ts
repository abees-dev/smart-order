import { z } from "zod";

// Schema cho chi phí phát sinh
export const createAdditionalCostSchema = z.object({
  orderId: z.string().optional(),
  costType: z.string().min(1, "Loại chi phí là bắt buộc"),
  description: z.string().min(1, "Mô tả chi phí là bắt buộc"),
  amount: z.number().min(0.01, "Số tiền phải lớn hơn 0"),
  date: z.date({
    message: "Ngày phát sinh là bắt buộc",
  }),
  notes: z.string().optional(),
});

export const updateAdditionalCostSchema = createAdditionalCostSchema
  .partial()
  .extend({
    id: z.string().min(1, "ID là bắt buộc"),
  });

// Schema cho bộ lọc báo cáo
export const reportFiltersSchema = z
  .object({
    period: z.enum(["monthly", "quarterly", "yearly", "custom"]),
    dateFrom: z.date().optional(),
    dateTo: z.date().optional(),
    month: z.string().optional(),
    year: z.string().optional(),
    invoiceType: z.enum(["input", "output"]).optional(),
    includeAdditionalCosts: z.boolean().optional(),
  })
  .refine(
    (data) => {
      if (data.period === "custom") {
        return data.dateFrom && data.dateTo;
      }
      return true;
    },
    {
      message:
        "Khi chọn khoảng thời gian tùy chỉnh, phải chọn ngày bắt đầu và kết thúc",
      path: ["dateFrom"],
    }
  );

// Schema cho xuất báo cáo
export const exportOptionsSchema = z.object({
  format: z.enum(["excel", "pdf", "csv"]),
  period: z.string().min(1, "Khoảng thời gian là bắt buộc"),
  includeCharts: z.boolean().default(true),
  includeDetails: z.boolean().default(true),
});

// Type inference
export type CreateAdditionalCostFormData = z.infer<
  typeof createAdditionalCostSchema
>;
export type UpdateAdditionalCostFormData = z.infer<
  typeof updateAdditionalCostSchema
>;
export type ReportFiltersFormData = z.infer<typeof reportFiltersSchema>;
export type ExportOptionsFormData = z.infer<typeof exportOptionsSchema>;

// Cost type options
export const costTypeOptions = [
  { value: "shipping", label: "Vận chuyển" },
  { value: "packaging", label: "Đóng gói" },
  { value: "labor", label: "Nhân công" },
  { value: "marketing", label: "Marketing" },
  { value: "utilities", label: "Tiện ích" },
  { value: "maintenance", label: "Bảo trì" },
  { value: "insurance", label: "Bảo hiểm" },
  { value: "tax", label: "Thuế phí" },
  { value: "other", label: "Khác" },
];
