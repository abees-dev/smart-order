import { z } from "zod";

// Schema cho bộ lọc báo cáo
export const reportFiltersSchema = z
  .object({
    period: z.enum(["monthly", "quarterly", "yearly", "custom"]),
    dateFrom: z.date().optional(),
    dateTo: z.date().optional(),
    month: z.string().optional(),
    year: z.string().optional(),
    invoiceType: z.enum(["input", "output"]).optional(),
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
