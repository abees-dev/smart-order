import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useCreateCostIncurred,
  useUpdateCostIncurred,
} from "../hooks/use-cost-incurred";
import {
  createCostIncurredSchema,
  type CreateCostIncurredFormData,
} from "../validation";
import { COST_TYPE_LABELS, type CostIncurred } from "../types";
import { toast } from "sonner";
import { calculateAmount } from "./cost-incurred-utils";
import { FormDatePicker, FormTextField } from "@/components/forms";
import { useQueryClient } from "@tanstack/react-query";
import DialogResponsive from "@/components/ui/dialog-responsive";

interface CreateCostIncurredDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orderId: string;
  costIncurred?: CostIncurred;
}

export function CreateCostIncurredDialog({
  open,
  onOpenChange,
  orderId,
  costIncurred,
}: CreateCostIncurredDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const createMutation = useCreateCostIncurred();
  const updateMutation = useUpdateCostIncurred();
  const isEditMode = Boolean(costIncurred);
  const queryClient = useQueryClient();

  const form = useForm<CreateCostIncurredFormData>({
    resolver: zodResolver(createCostIncurredSchema),
    defaultValues: {
      orderId: orderId,
      costType: costIncurred?.costType || "material",
      description: costIncurred?.description || "",
      amount: costIncurred?.amount || 0,
      quantity: costIncurred?.quantity || 0,
      unitPrice: costIncurred?.unitPrice || 0,
      invoiceNumber: costIncurred?.invoiceNumber || "",
      incurredDate: costIncurred?.incurredDate
        ? new Date(costIncurred.incurredDate)
        : new Date(),
      notes: costIncurred?.notes || "",
    },
  });

  const { watch, setValue } = form;
  const quantity = watch("quantity");
  const unitPrice = watch("unitPrice");

  // Auto-calculate amount when quantity or unitPrice changes
  const handleQuantityUnitPriceChange = () => {
    if (quantity && unitPrice) {
      const calculatedAmount = calculateAmount(quantity, unitPrice);
      setValue("amount", calculatedAmount);
    }
  };

  const onSubmit = async (data: CreateCostIncurredFormData) => {
    setIsSubmitting(true);
    try {
      if (isEditMode && costIncurred) {
        await updateMutation.mutateAsync({
          id: costIncurred.id as string,
          data,
        });
        toast.success("Đã cập nhật chi phí phát sinh");
        onOpenChange(false);
        queryClient.invalidateQueries({
          queryKey: ["order", orderId],
        });
        return;
      }
      await createMutation.mutateAsync(data);
      queryClient.invalidateQueries({
        queryKey: ["order", orderId],
      });
      toast.success("Đã tạo chi phí phát sinh mới");
      form.reset();
      onOpenChange(false);
    } catch {
      toast.error("Không thể tạo chi phí phát sinh");
    } finally {
      setIsSubmitting(false);
    }
  };

  const formContent = (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
          <FormField
            control={form.control}
            name="costType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Loại chi phí *</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn loại chi phí" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {Object.entries(COST_TYPE_LABELS).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormDatePicker
            name="incurredDate"
            label="Ngày phát sinh"
            required
            placeholder="Chọn ngày phát sinh"
            control={form.control}
          />
        </div>

        <FormTextField
          name="description"
          control={form.control}
          label="Mô tả"
          required
          placeholder="Mô tả chi phí phát sinh"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
          <FormTextField
            control={form.control}
            name="quantity"
            label="Số lượng"
            required
            type="number"
            onChange={(e) => {
              const value = e.target.value ? parseFloat(e.target.value) : 0;
              setValue("quantity", value);
              handleQuantityUnitPriceChange();
            }}
          />

          <FormTextField
            control={form.control}
            name="unitPrice"
            label="Đơn giá"
            required
            type="number"
            onChange={(e) => {
              const value = e.target.value ? parseFloat(e.target.value) : 0;
              setValue("unitPrice", value);
              handleQuantityUnitPriceChange();
            }}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
          <FormTextField
            control={form.control}
            name="amount"
            label="Tổng tiền"
            required
            type="number"
            disabled
          />

          <FormTextField
            control={form.control}
            name="invoiceNumber"
            label="Số hóa đơn"
            placeholder="Nếu có"
            type="text"
          />
        </div>

        <FormTextField
          control={form.control}
          name="notes"
          type="textarea"
          placeholder="Ghi chú thêm về chi phí này..."
          rows={3}
        />
      </form>
    </Form>
  );

  return (
    <>
      <DialogResponsive
        open={open}
        onOpenChange={onOpenChange}
        title={
          isEditMode ? "Chỉnh sửa chi phí phát sinh" : "Tạo chi phí phát sinh"
        }
        description={
          isEditMode
            ? "Cập nhật thông tin chi phí phát sinh cho đơn hàng"
            : "Thêm chi phí phát sinh cho đơn hàng"
        }
        actions={{
          cancel: {
            label: "Hủy",
            onClick: () => onOpenChange(false),
            disabled: isSubmitting,
          },
          submit: {
            label: isEditMode ? "Cập nhật" : "Tạo",
            onClick: form.handleSubmit(onSubmit),
            disabled: isSubmitting,
            loading: isSubmitting,
          },
        }}
      >
        {formContent}
      </DialogResponsive>
    </>
  );
}
