import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormField } from "@/components/ui";
import DialogResponsive from "@/components/ui/dialog-responsive";
import FormTextField from "@/components/forms/form-textfield";
import { FormSelect } from "@/components/forms/form-select";
import { FormDatePicker } from "@/components/forms/form-date-picker";
import { createDebtSchema, type CreateDebtFormData } from "../validation";
import type { Debt } from "../types";
import React from "react";
import { OrderSelectField, SupplyImportSelect } from "@/components/forms";
import { useCreateDebt } from "../hooks/use-debt";

interface DebtsFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  debt?: Debt | null;
  onSuccess?: () => void;
}

const DebtsFormDialog: React.FC<DebtsFormDialogProps> = ({
  open,
  onOpenChange,
  debt,
  onSuccess,
}) => {
  const isEditMode = !!debt;
  const { mutateAsync: createDebt } = useCreateDebt();

  const form = useForm<CreateDebtFormData>({
    resolver: zodResolver(createDebtSchema),
    defaultValues: {
      type: "sales",
      referenceId: "",
      referenceNumber: "",
      dueDate: undefined,
      isInstallmentPayment: undefined,
      description: "",
      notes: "",
    },
  });

  const {
    watch,
    formState: { isSubmitting },
  } = form;

  // Reset form when dialog opens/closes or debt changes
  useEffect(() => {
    if (open) {
      if (debt) {
        form.reset({
          type: (debt.type as "sales" | "purchase") || "sales",
          referenceId: debt.referenceId || "",
          referenceNumber: debt.referenceRecord.referenceNumber || "",
          dueDate: debt.dueDate ? new Date(debt.dueDate) : undefined,
          description: debt.description || "",
          notes: debt.notes || "",
        });
      } else {
        form.reset({
          type: "sales",
          referenceId: "",
          referenceNumber: "",
          dueDate: undefined,
          description: "",
          notes: "",
        });
      }
    }
  }, [open, debt, form]);

  const onSubmit = async (data: CreateDebtFormData) => {
    try {
      // Convert empty strings to undefined for optional fields
      const cleanedData = {
        ...data,
        description: data.description?.trim() || "",
        notes: data.notes?.trim() || "",
      };

      if (isEditMode && debt) {
        // TODO: Implement update logic
        console.log("Update debt:", { id: debt.id, data: cleanedData });
      } else {
        await createDebt(cleanedData);
      }

      onSuccess?.();
      onOpenChange(false);
    } catch (error) {
      console.error("Error submitting debt form:", error);
    }
  };

  const debtTypeOptions = [
    { value: "sales", label: "Công nợ bán hàng" },
    { value: "purchase", label: "Công nợ mua hàng" },
  ];

  return (
    <DialogResponsive
      open={open}
      onOpenChange={onOpenChange}
      title={isEditMode ? "Chỉnh sửa công nợ" : "Thêm công nợ mới"}
      description={
        isEditMode ? "Cập nhật thông tin công nợ" : "Nhập thông tin công nợ mới"
      }
      formId="debt-form"
      actions={{
        cancel: {
          label: "Hủy",
          onClick: () => onOpenChange(false),
          disabled: isSubmitting,
        },
        submit: {
          label: isEditMode ? "Cập nhật" : "Tạo",
          loading: isSubmitting,
          disabled: isSubmitting,
        },
      }}
    >
      <Form {...form}>
        <form
          id="debt-form"
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-4 sm:space-y-6"
          noValidate
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-start">
            <FormSelect
              options={debtTypeOptions}
              value={form.watch("type")}
              onValueChange={(value) =>
                form.setValue("type", value as "sales" | "purchase")
              }
              label="Loại công nợ"
              placeholder="Chọn loại công nợ"
              required
            />

            <FormField
              control={form.control}
              name={"referenceId"}
              render={({ field, fieldState }) => {
                return watch("type") === "sales" ? (
                  <OrderSelectField
                    field={field}
                    fieldState={fieldState}
                    label="Đơn hàng"
                    placeholder="Chọn đơn hàng"
                    required
                  />
                ) : (
                  <SupplyImportSelect
                    field={field}
                    fieldState={fieldState}
                    label="Phiếu nhập"
                    placeholder="Chọn phiếu nhập"
                    required
                  />
                );
              }}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-start">
            <FormTextField
              control={form.control}
              name="referenceNumber"
              label="Số tham chiếu"
              placeholder="Nhập số tham chiếu"
              required
            />

            <FormDatePicker
              control={form.control}
              name="dueDate"
              label="Ngày đến hạn"
              placeholder="Chọn ngày đến hạn"
            />
          </div>

          <FormTextField
            control={form.control}
            name="description"
            label="Mô tả"
            placeholder="Nhập mô tả công nợ"
            helpText="Mô tả chi tiết về công nợ"
          />

          <FormTextField
            control={form.control}
            name="notes"
            label="Ghi chú"
            placeholder="Nhập ghi chú"
            type="textarea"
            rows={3}
            helpText="Ghi chú thêm về công nợ"
          />
        </form>
      </Form>
    </DialogResponsive>
  );
};

export default DebtsFormDialog;
