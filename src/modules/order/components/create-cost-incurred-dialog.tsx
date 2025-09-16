import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCreateCostIncurred } from "../hooks/use-cost-incurred";
import {
  createCostIncurredSchema,
  type CreateCostIncurredFormData,
} from "../validation";
import { COST_TYPE_LABELS } from "../types";
import { toast } from "sonner";
import { calculateAmount } from "./cost-incurred-utils";

interface CreateCostIncurredDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orderId: string;
}

export function CreateCostIncurredDialog({
  open,
  onOpenChange,
  orderId,
}: CreateCostIncurredDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const createMutation = useCreateCostIncurred();

  const form = useForm<CreateCostIncurredFormData>({
    resolver: zodResolver(createCostIncurredSchema),
    defaultValues: {
      orderId,
      costType: "material",
      description: "",
      amount: 0,
      quantity: undefined,
      unitPrice: undefined,
      invoiceNumber: "",
      incurredDate: new Date().toISOString().split("T")[0],
      notes: "",
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
      await createMutation.mutateAsync(data);
      toast.success("Đã tạo chi phí phát sinh mới");
      form.reset();
      onOpenChange(false);
    } catch {
      toast.error("Không thể tạo chi phí phát sinh");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Tạo chi phí phát sinh mới</DialogTitle>
          <DialogDescription>
            Nhập thông tin chi phí phát sinh cho đơn hàng này
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                        {Object.entries(COST_TYPE_LABELS).map(
                          ([value, label]) => (
                            <SelectItem key={value} value={value}>
                              {label}
                            </SelectItem>
                          )
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="incurredDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ngày phát sinh *</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mô tả *</FormLabel>
                  <FormControl>
                    <Input placeholder="Mô tả chi phí phát sinh" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="quantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Số lượng</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="0"
                        {...field}
                        onChange={(e) => {
                          field.onChange(
                            e.target.value
                              ? parseFloat(e.target.value)
                              : undefined
                          );
                          handleQuantityUnitPriceChange();
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="unitPrice"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Đơn giá</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="0"
                        {...field}
                        onChange={(e) => {
                          field.onChange(
                            e.target.value
                              ? parseFloat(e.target.value)
                              : undefined
                          );
                          handleQuantityUnitPriceChange();
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tổng tiền *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="0"
                        {...field}
                        onChange={(e) => {
                          field.onChange(
                            e.target.value ? parseFloat(e.target.value) : 0
                          );
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="invoiceNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Số hóa đơn</FormLabel>
                    <FormControl>
                      <Input placeholder="Số hóa đơn" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ghi chú</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Ghi chú thêm về chi phí này..."
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Hủy
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Đang tạo..." : "Tạo chi phí"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
