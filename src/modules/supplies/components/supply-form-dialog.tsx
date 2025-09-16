import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Package,
  TrendingUp,
  DollarSign,
  MapPin,
  AlertTriangle,
} from "lucide-react";
import { Form, FormField } from "@/components/ui/form";
import { FormSelectField, SupplierSelectField } from "@/components/forms";
import {
  createSupplySchema,
  updateSupplySchema,
  type CreateSupplyFormData,
  type UpdateSupplyFormData,
} from "../validation";
import type { Supply } from "../types";
import { SUPPLY_CATEGORIES } from "../utils/supply-categrory";
import FormTextField from "@/components/forms/form-textfield";
import { useCreateSupply, useUpdateSupply } from "../hooks/use-supply-actions";
import { useState } from "react";
import DialogResponsive from "@/components/ui/dialog-responsive";

interface SupplyFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  supply?: Supply;
  mode?: "create" | "edit";
}

export function SupplyFormDialog({
  open,
  onOpenChange,
  onSuccess,
  supply,
  mode = "create",
}: SupplyFormDialogProps) {
  const [error, setError] = useState<string | null>(null);
  const { createSupply, loading: createSupplyLoading } = useCreateSupply({
    onSuccess: () => {
      onSuccess();
      form.reset();
    },
    onError: (error) => {
      console.error("Error creating supply:", error);
      setError(error.message);
    },
  });

  const { updateSupply, loading: updateSupplyLoading } = useUpdateSupply({
    onSuccess: () => {
      onSuccess();
      form.reset();
    },
    onError: (error) => {
      console.error("Error updating supply:", error);
      setError(error.message);
    },
  });

  const loading = createSupplyLoading || updateSupplyLoading;
  const isEditMode = mode === "edit" && supply;

  const form = useForm<CreateSupplyFormData | UpdateSupplyFormData>({
    resolver: zodResolver(isEditMode ? updateSupplySchema : createSupplySchema),
    defaultValues: {
      name: supply?.name ?? "",
      sku: supply?.sku ?? "",
      description: supply?.description ?? "",
      category: supply?.category ?? "",
      unit: supply?.unit ?? "",
      currentStock: supply?.currentStock ?? 0,
      minStock: supply?.minStock ?? 0,
      purchasePrice: supply?.purchasePrice ?? 0,
      salePrice: supply?.salePrice ?? 0,
      supplierId: supply?.supplierId ?? undefined,
      location: supply?.location ?? "",
    },
  });

  const onSubmit = async (
    data: CreateSupplyFormData | UpdateSupplyFormData
  ) => {
    if (isEditMode && supply) {
      updateSupply({
        id: supply.id,
        data: {
          ...data,
          supplierId: data.supplierId || undefined,
          sku: data?.sku?.toUpperCase(),
        } as UpdateSupplyFormData,
      });
    } else {
      createSupply({
        ...data,
        sku: data?.sku?.toUpperCase(),
      } as CreateSupplyFormData);
    }
  };

  const formContent = (
    <Form {...form}>
      <form
        noValidate
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-6 lg:space-y-8"
        id="supply-form"
      >
        {/* Basic Information Section */}
        <div className="space-y-3 lg:space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-muted">
            <Package className="h-3 w-3 lg:h-4 lg:w-4 text-primary" />
            <h3 className="font-semibold text-sm text-primary">
              Thông tin cơ bản
            </h3>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 lg:gap-4 items-start">
            <FormTextField
              name="name"
              placeholder="Nhập tên vật tư"
              control={form.control}
              label="Tên vật tư"
              required
            />

            <FormTextField
              name="sku"
              placeholder="Nhập mã SKU"
              control={form.control}
              label="Mã SKU"
              required
              helpText="Mã định danh duy nhất cho vật tư"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 lg:gap-4 items-start">
            <FormField
              control={form.control}
              name="category"
              render={({ field, fieldState }) => (
                <FormSelectField
                  fieldState={fieldState}
                  field={field}
                  label="Danh mục *"
                  placeholder="Chọn danh mục"
                  options={SUPPLY_CATEGORIES.map((cat) => ({
                    value: cat.id,
                    label: cat.name,
                  }))}
                />
              )}
            />

            <FormTextField
              name="unit"
              placeholder="Ví dụ: cái, kg, lít..."
              control={form.control}
              label="Đơn vị tính"
              required
            />
          </div>

          <FormTextField
            name="description"
            placeholder="Mô tả chi tiết về vật tư, công dụng, đặc điểm..."
            control={form.control}
            label="Mô tả"
            type="textarea"
            rows={3}
          />
        </div>

        {/* Stock Management Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-muted">
            <TrendingUp className="h-4 w-4 text-primary" />
            <h3 className="font-semibold text-sm text-primary">
              Quản lý tồn kho
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
            <FormTextField
              control={form.control}
              name="currentStock"
              label="Tồn kho hiện tại"
              placeholder="0"
              type="number"
              min="0"
              required
            />
            <FormTextField
              control={form.control}
              name="maxStock"
              label="Tồn kho tối đa"
              placeholder="0"
              type="number"
              min="0"
            />
          </div>
        </div>

        {/* Pricing Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-muted">
            <DollarSign className="h-4 w-4 text-primary" />
            <h3 className="font-semibold text-sm text-primary">
              Thông tin giá cả
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
            <FormTextField
              control={form.control}
              name="purchasePrice"
              label="Giá mua"
              placeholder="0"
              type="number"
              min="0"
              required
              helpText="Giá mua vào từ nhà cung cấp (VND)"
            />

            <FormTextField
              control={form.control}
              name="salePrice"
              label="Giá bán"
              type="number"
              min="0"
              step="1"
              placeholder="0"
              required
              helpText="Giá bán ra cho khách hàng (VND)"
            />
          </div>
        </div>

        {/* Additional Information Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-muted">
            <MapPin className="h-4 w-4 text-primary" />
            <h3 className="font-semibold text-sm text-primary">
              Thông tin bổ sung
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
            <FormField
              control={form.control}
              name="supplierId"
              render={({ field, fieldState }) => (
                <SupplierSelectField
                  field={field}
                  fieldState={fieldState}
                  label="Nhà cung cấp"
                  placeholder="Chọn nhà cung cấp"
                  allowCreate
                  onCreateNew={() => {
                    // TODO: Open supplier creation dialog
                    console.log("Open supplier creation dialog");
                  }}
                />
              )}
            />

            <FormTextField
              control={form.control}
              name="location"
              label="Vị trí lưu trữ"
              placeholder="Nhập vị trí lưu trữ"
              helpText="Vị trí cụ thể trong kho"
            />
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 border border-destructive/20 p-4 rounded-lg">
            <AlertTriangle className="h-4 w-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </form>
    </Form>
  );

  return (
    <DialogResponsive
      open={open}
      onOpenChange={onOpenChange}
      title={isEditMode ? "Cập nhật vật tư" : "Thêm vật tư mới"}
      description={
        isEditMode
          ? "Cập nhật thông tin vật tư trong hệ thống quản lý kho"
          : "Tạo một vật tư mới trong hệ thống quản lý kho"
      }
      actions={{
        cancel: {
          label: "Hủy bỏ",
          onClick: () => onOpenChange(false),
        },
        submit: {
          label: isEditMode
            ? loading
              ? "Đang cập nhật..."
              : "Cập nhật vật tư"
            : loading
            ? "Đang tạo..."
            : "Tạo vật tư",
          disabled: loading,
          loading: loading,
        },
      }}
      formId="supply-form"
    >
      {formContent}
    </DialogResponsive>
  );
}
