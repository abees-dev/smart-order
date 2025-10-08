import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Form, FormField } from "@/components/ui/form";
import DialogResponsive from "@/components/ui/dialog-responsive";
import FormTextField from "@/components/forms/form-textfield";
import { FormSelectField } from "@/components/forms/form-select";
import { FormDatePicker } from "@/components/forms/form-date-picker";
import MaintenanceSuppliesSelect from "./maintenance-supplies-select";
import { formatCurrency } from "@/utils/format";
import {
  createMaintenanceSchema,
  type CreateMaintenanceFormData,
} from "../../validation";
import { OrderService } from "../../services/order.service";
import type { MaintenanceRecord } from "../../types";

interface MaintenanceFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orderId: string;
  onSuccess?: () => void;
  maintenanceRecord?: MaintenanceRecord | null;
}

const maintenanceTypeOptions = [
  {
    value: "warranty",
    label: "Bảo hành",
    description: "Bảo trì theo chế độ bảo hành",
  },
  {
    value: "paid",
    label: "Trả phí",
    description: "Bảo trì có tính phí",
  },
];

const MaintenanceFormDialog = ({
  open,
  onOpenChange,
  orderId,
  onSuccess,
  maintenanceRecord,
}: MaintenanceFormDialogProps) => {
  const queryClient = useQueryClient();

  const form = useForm<CreateMaintenanceFormData>({
    resolver: zodResolver(createMaintenanceSchema),
    defaultValues: {
      orderId,
      maintenanceType: maintenanceRecord?.maintenanceType || "warranty",
      description: maintenanceRecord?.description || "",
      cost: maintenanceRecord?.cost || 0,
      supplies: maintenanceRecord?.suppliesData || [],
      performedBy: maintenanceRecord?.performedBy || "",
      performedDate: maintenanceRecord?.performedDate
        ? new Date(maintenanceRecord?.performedDate)
        : new Date(),
      notes: maintenanceRecord?.notes || "",
    },
  });

  const maintenanceType = form.watch("maintenanceType");
  const isPaidMaintenance = maintenanceType === "paid";

  const isEditMode = Boolean(maintenanceRecord);

  const createMaintenanceMutation = useMutation({
    mutationFn: (data: {
      orderId: string;
      maintenanceType: "warranty" | "paid";
      description: string;
      cost: number;
      supplyId?: string;
      performedBy?: string;
      performedDate: string;
      notes?: string;
    }) => OrderService.createMaintenance(data),
    onSuccess: () => {
      toast.success("Tạo bảo trì thành công");
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["order", orderId] });
      form.reset();
      onSuccess?.();
      onOpenChange(false);
    },
    onError: (error: Error) => {
      toast.error(error?.message || "Có lỗi xảy ra khi tạo bảo trì");
    },
  });

  const updateMaintenanceMutation = useMutation({
    mutationFn: (data: {
      orderId: string;
      maintenanceType: "warranty" | "paid";
      description: string;
      cost: number;
      supplyId?: string;
      performedBy?: string;
      performedDate: string;
      notes?: string;
    }) => OrderService.updateMaintenance(maintenanceRecord?.id as string, data),
    onSuccess: () => {
      toast.success("Cập nhật bảo trì thành công");
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["order", orderId] });
      form.reset();
      onSuccess?.();
      onOpenChange(false);
    },
    onError: (error: Error) => {
      toast.error(error?.message || "Có lỗi xảy ra khi tạo bảo trì");
    },
  });

  const onSubmit = (data: CreateMaintenanceFormData) => {
    // Set cost to 0 for warranty maintenance
    if (data.maintenanceType === "warranty") {
      data.cost = 0;
    }

    // Convert dates to ISO strings
    const formattedData = {
      ...data,
      performedDate: data.performedDate.toISOString().split("T")[0],
    };

    if (isEditMode) {
      updateMaintenanceMutation.mutate(formattedData);
      return;
    }
    createMaintenanceMutation.mutate(formattedData);
  };

  const handleCancel = () => {
    form.reset();
    onOpenChange(false);
  };

  return (
    <DialogResponsive
      title={isEditMode ? "Cập nhật bảo trì" : "Tạo bảo trì mới"}
      description={
        isEditMode
          ? "Cập nhật thông tin bảo trì cho đơn hàng"
          : "Nhập thông tin bảo trì cho đơn hàng"
      }
      open={open}
      onOpenChange={onOpenChange}
      formId="maintenance-form"
      actions={{
        submit: {
          label: isEditMode ? "Cập nhật" : "Tạo",
          loading: createMaintenanceMutation.isPending,
        },
        cancel: {
          label: "Hủy",
          onClick: handleCancel,
        },
      }}
    >
      <Form {...form}>
        <form
          id="maintenance-form"
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-6"
        >
          <FormField
            control={form.control}
            name="maintenanceType"
            render={({ field, fieldState }) => (
              <FormSelectField
                field={field}
                fieldState={fieldState}
                label="Loại bảo trì"
                placeholder="Chọn loại bảo trì..."
                options={maintenanceTypeOptions}
                required
              />
            )}
          />
          <FormTextField
            control={form.control}
            name="description"
            label="Mô tả bảo trì"
            placeholder="Nhập mô tả chi tiết về công việc bảo trì..."
            type="textarea"
            required
            helpText="Mô tả chi tiết về nội dung bảo trì cần thực hiện"
          />
          <MaintenanceSuppliesSelect
            control={form.control}
            setValue={form.setValue}
            getValues={form.getValues}
            className="space-y-4"
          />
          {isPaidMaintenance && (
            <FormTextField
              control={form.control}
              name="cost"
              label="Chi phí bảo trì"
              placeholder="0"
              type="number"
              required
              helpText="Chi phí bảo trì (VNĐ) - bắt buộc với bảo trì trả phí"
              min="0"
              step="1000"
            />
          )}
          <FormTextField
            control={form.control}
            name="performedBy"
            label="Người thực hiện"
            placeholder="Nhập tên người thực hiện bảo trì..."
            helpText="Tên kỹ thuật viên hoặc đơn vị thực hiện bảo trì"
          />
          <FormDatePicker
            control={form.control}
            name="performedDate"
            label="Ngày thực hiện"
            placeholder="Chọn ngày thực hiện..."
            required
            helpText="Ngày thực hiện công việc bảo trì"
          />

          <FormTextField
            control={form.control}
            name="notes"
            label="Ghi chú"
            placeholder="Nhập ghi chú bổ sung..."
            type="textarea"
            helpText="Các ghi chú bổ sung về quá trình bảo trì"
          />
          {/* Cost Preview */}
          {isPaidMaintenance && (
            <div className="rounded-lg border bg-muted/50 p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Chi phí bảo trì:</span>
                <span className="text-lg font-semibold text-primary">
                  {formatCurrency(form.watch("cost") || 0)}
                </span>
              </div>
              {(form.watch("supplies")?.length ?? 0) > 0 && (
                <div className="mt-2 text-xs text-muted-foreground">
                  Sử dụng {form.watch("supplies")?.length} vật tư
                </div>
              )}
            </div>
          )}
          {!isPaidMaintenance && (
            <div className="rounded-lg border bg-green-50 p-4 dark:bg-green-950/20">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-green-700 dark:text-green-300">
                  Bảo trì bảo hành:
                </span>
                <span className="text-lg font-semibold text-green-700 dark:text-green-300">
                  Miễn phí
                </span>
              </div>
              {(form.watch("supplies")?.length ?? 0) > 0 && (
                <div className="mt-2 text-xs text-green-600 dark:text-green-400">
                  Sử dụng {form.watch("supplies")?.length} vật tư
                </div>
              )}
            </div>
          )}
        </form>
      </Form>
    </DialogResponsive>
  );
};

export default MaintenanceFormDialog;
