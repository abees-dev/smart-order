import { Form } from "@/components/ui";
import DialogResponsive from "@/components/ui/dialog-responsive";
import FormTextField from "@/components/forms/form-textfield";
import { FormDatePicker } from "@/components/forms/form-date-picker";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { debtPaymentSchema, type DebtPaymentFormData } from "../validation";
import { useCreateDebtPayment, useEditDebtPayment } from "../hooks/use-debt";
import type { DebtPayment } from "../types";

interface DebtsPaymentFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  maxAmount?: number;
  debtId: string;
  editingPayment?: DebtPayment;
}

const DebtsPaymentFormDialog = ({
  open,
  onOpenChange,
  maxAmount = 999999999,
  debtId,
  editingPayment,
}: DebtsPaymentFormDialogProps) => {
  const isEditing = !!editingPayment;

  const form = useForm<DebtPaymentFormData>({
    resolver: zodResolver(debtPaymentSchema),
    defaultValues: {
      amount: editingPayment?.amount || 0,
      paymentDate: editingPayment?.paymentDate
        ? new Date(editingPayment.paymentDate)
        : new Date(),
      notes: editingPayment?.notes || "",
    },
  });

  const {
    handleSubmit,
    formState: { isSubmitting },
    watch,
  } = form;

  const amount = watch("amount");
  const { mutateAsync: createDebtPayment } = useCreateDebtPayment();
  const { mutateAsync: editDebtPayment } = useEditDebtPayment();

  const handleFormSubmit = async (data: DebtPaymentFormData) => {
    try {
      if (isEditing && editingPayment) {
        await editDebtPayment({ paymentId: editingPayment.id, data });
      } else {
        await createDebtPayment({ debtId, data });
      }
      onOpenChange(false);
      form.reset();
    } catch (error) {
      console.error("Error submitting payment:", error);
    }
  };

  return (
    <DialogResponsive
      open={open}
      onOpenChange={onOpenChange}
      title={isEditing ? "Chỉnh sửa thanh toán" : "Ghi nhận thanh toán"}
      description={
        isEditing
          ? "Chỉnh sửa thông tin thanh toán"
          : "Ghi nhận thanh toán cho khoản nợ"
      }
      formId="debt-payment-form"
      actions={{
        submit: {
          label: "Lưu",
          disabled: isSubmitting || !amount || amount <= 0,
          loading: isSubmitting,
          onClick: handleSubmit(handleFormSubmit),
        },
        cancel: { label: "Hủy", onClick: () => onOpenChange(false) },
      }}
    >
      <Form {...form}>
        <form id="debt-payment-form" className="space-y-4" noValidate>
          <FormTextField
            control={form.control}
            name="amount"
            label="Số tiền thanh toán"
            placeholder="Nhập số tiền thanh toán"
            type="number"
            required
            min="0.01"
            step="0.01"
            helpText={
              maxAmount !== 999999999
                ? `Số tiền tối đa: ${maxAmount.toLocaleString("vi-VN")} VNĐ`
                : undefined
            }
          />

          <FormDatePicker
            control={form.control}
            name="paymentDate"
            label="Ngày thanh toán"
            placeholder="Chọn ngày thanh toán"
            helpText="Để trống sẽ sử dụng ngày hiện tại"
          />

          <FormTextField
            control={form.control}
            name="notes"
            label="Ghi chú"
            placeholder="Nhập ghi chú (tùy chọn)"
            type="textarea"
            rows={3}
            helpText="Ghi chú thêm về khoản thanh toán này"
          />
        </form>
      </Form>
    </DialogResponsive>
  );
};

export default DebtsPaymentFormDialog;
