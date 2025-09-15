import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Plus, Trash2, Package } from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SupplierSelectField, SupplySelectField } from "@/components/forms";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useSupplyImportActions } from "../hooks/use-supply";
import {
  createSupplyImportSchema,
  type CreateSupplyImportFormData,
} from "../validation";
import { SupplyFormDialog } from "./supply-form-dialog";
import type { Supply, SupplyImport } from "../types";
import FormTextField from "@/components/forms/form-textfield";

interface SupplyImportFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  editImport?: SupplyImport | null;
}

export function SupplyImportFormDialog({
  open,
  onOpenChange,
  onSuccess,
  editImport = null,
}: SupplyImportFormDialogProps) {
  const { createImport, updateImport, loading, error } =
    useSupplyImportActions();
  const [showSupplyForm, setShowSupplyForm] = useState(false);

  const isEditing = !!editImport;

  const form = useForm<CreateSupplyImportFormData>({
    resolver: zodResolver(createSupplyImportSchema),
    defaultValues:
      isEditing && editImport
        ? {
            invoiceNumber: editImport.invoiceNumber,
            supplierId: editImport.supplierId,
            notes: editImport.notes || "",
            items: editImport.items.map((item) => ({
              supplyId: item.supplyId,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              vatRate: item.vatRate,
              totalPrice: item.totalPrice,
            })),
          }
        : {
            invoiceNumber: "",
            supplierId: "",
            notes: "",
            items: [
              {
                supplyId: "",
                quantity: 1,
                unitPrice: 0,
                vatRate: 0,
                totalPrice: 0,
              },
            ],
          },
    mode: "onChange", // Enable real-time validation
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  });

  const onSubmit = async (data: CreateSupplyImportFormData) => {
    try {
      // Validate items before submitting
      const hasInvalidItems = data.items.some(
        (item) => !item.supplyId || item.quantity <= 0 || item.unitPrice < 0
      );

      if (hasInvalidItems) {
        form.setError("items", {
          message: "Vui lòng điền đầy đủ thông tin cho tất cả vật tư",
        });
        return;
      }

      if (isEditing && editImport) {
        await updateImport(editImport.id, data);
      } else {
        await createImport(data);
      }

      // Reset form and close dialog
      form.reset({
        invoiceNumber: "",
        supplierId: "",
        notes: "",
        items: [
          {
            supplyId: "",
            quantity: 1,
            unitPrice: 0,
            vatRate: 0,
            totalPrice: 0,
          },
        ],
      });

      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error("Error saving supply import:", error);
      // Error is already handled by the hook
    }
  };

  const handleSupplyCreated = () => {
    setShowSupplyForm(false);
  };

  const addItem = () => {
    append({
      supplyId: "",
      quantity: 1,
      unitPrice: 0,
      vatRate: 0,
      totalPrice: 0,
    });
  };

  const removeItem = (index: number) => {
    const currentItem = form.getValues(`items.${index}`);
    const hasData =
      currentItem.supplyId ||
      currentItem.quantity > 1 ||
      currentItem.unitPrice > 0;

    if (hasData) {
      const confirmed = window.confirm(
        "Bạn có chắc chắn muốn xóa vật tư này? Dữ liệu đã nhập sẽ bị mất."
      );
      if (!confirmed) return;
    }

    remove(index);
  };

  const handleVatChange = (index: number, vatRate: number) => {
    const quantity = form.getValues(`items.${index}.quantity`);
    const unitPrice = form.getValues(`items.${index}.unitPrice`);
    if (quantity > 0 && unitPrice > 0) {
      const subtotal = quantity * unitPrice;
      const vatAmount = subtotal * (vatRate / 100);
      const totalPrice = subtotal + vatAmount;
      form.setValue(`items.${index}.totalPrice`, totalPrice);
    }
  };
  const handleUnitPriceChange = (index: number, unitPrice: number) => {
    const quantity = form.getValues(`items.${index}.quantity`);
    const vatRate = form.getValues(`items.${index}.vatRate`) || 0;
    if (quantity > 0) {
      const subtotal = unitPrice * quantity;
      const vatAmount = subtotal * (vatRate / 100);
      const totalPrice = subtotal + vatAmount;
      form.setValue(`items.${index}.totalPrice`, totalPrice);
    }
  };

  const handleQuantityChange = (index: number, quantity: number) => {
    const unitPrice = form.getValues(`items.${index}.unitPrice`);
    const vatRate = form.getValues(`items.${index}.vatRate`) || 0;
    if (unitPrice > 0) {
      const subtotal = quantity * unitPrice;
      const vatAmount = subtotal * (vatRate / 100);
      const totalPrice = subtotal + vatAmount;
      form.setValue(`items.${index}.totalPrice`, totalPrice);
    }
  };
  const handleSelectSupply = (supply: Supply | null, index: number) => {
    if (supply) {
      // Auto-fill supply info when selected
      form.setValue(`items.${index}.unitPrice`, supply.purchasePrice);
      const quantity = form.getValues(`items.${index}.quantity`);
      const vatRate = form.getValues(`items.${index}.vatRate`) || 0;
      if (quantity > 0) {
        const subtotal = quantity * supply.purchasePrice;
        const vatAmount = subtotal * (vatRate / 100);
        const totalPrice = subtotal + vatAmount;
        form.setValue(`items.${index}.totalPrice`, totalPrice);
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[900px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            {isEditing
              ? "Chỉnh sửa phiếu nhập vật tư"
              : "Tạo phiếu nhập vật tư"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Cập nhật thông tin phiếu nhập vật tư và các sản phẩm."
              : "Tạo phiếu nhập kho mới cho vật tư. Vui lòng điền đầy đủ thông tin số hóa đơn, nhà cung cấp và danh sách vật tư cần nhập."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            noValidate
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-6"
          >
            {/* Import Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Thông tin phiếu nhập</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormTextField
                  name="invoiceNumber"
                  label="Số hóa đơn"
                  required
                  placeholder="Nhập số hóa đơn"
                  control={form.control}
                />

                <FormField
                  control={form.control}
                  name="supplierId"
                  render={({ field, fieldState }) => (
                    <SupplierSelectField
                      field={field}
                      fieldState={fieldState}
                      label="Nhà cung cấp"
                      placeholder="Chọn nhà cung cấp"
                      required
                    />
                  )}
                />
                <FormTextField
                  name="notes"
                  label="Ghi chú"
                  placeholder="Nhập ghi chú"
                  control={form.control}
                  type="textarea"
                  rows={3}
                />
              </CardContent>
            </Card>

            {/* Import Items */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">
                    Danh sách vật tư nhập ({fields.length} mặt hàng)
                  </CardTitle>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setShowSupplyForm(true)}
                      className="flex items-center gap-2"
                    >
                      <Package className="h-4 w-4" />
                      Thêm vật tư mới
                    </Button>
                    <Button
                      type="button"
                      onClick={addItem}
                      size="sm"
                      className="flex items-center gap-2"
                    >
                      <Plus className="h-4 w-4" />
                      Thêm mặt hàng
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {fields.map((field, index) => (
                  <div
                    key={field.id}
                    className="border rounded-lg p-4 space-y-4"
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-base">
                        Vật tư #{index + 1}
                      </h4>
                      <div className="flex gap-1">
                        <Button
                          type="button"
                          onClick={() => {
                            const currentItem = form.getValues(
                              `items.${index}`
                            );
                            append({
                              supplyId: currentItem.supplyId,
                              quantity: currentItem.quantity,
                              unitPrice: currentItem.unitPrice,
                              vatRate: currentItem.vatRate,
                              totalPrice: currentItem.totalPrice,
                            });
                          }}
                          variant="ghost"
                          size="sm"
                          title="Nhân bản mục này"
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                        {fields.length > 1 && (
                          <Button
                            type="button"
                            onClick={() => removeItem(index)}
                            variant="ghost"
                            size="sm"
                            title="Xóa mục này"
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-start">
                      <FormField
                        control={form.control}
                        name={`items.${index}.supplyId`}
                        render={({ field, fieldState }) => (
                          <SupplySelectField
                            field={field}
                            fieldState={fieldState}
                            label="Chọn vật tư *"
                            placeholder="Chọn vật tư"
                            required
                            className="md:col-span-2"
                            onSupplySelect={(supply) =>
                              handleSelectSupply(supply, index)
                            }
                          />
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`items.${index}.quantity`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Số lượng *</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min="1"
                                placeholder="Số lượng"
                                {...field}
                                onChange={(e) => {
                                  const quantity =
                                    parseInt(e.target.value) || 0;
                                  field.onChange(quantity);
                                  handleQuantityChange(index, quantity);
                                }}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`items.${index}.unitPrice`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Giá nhập (VNĐ) *</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min="0"
                                step="1000"
                                placeholder="Giá đơn vị"
                                {...field}
                                onChange={(e) => {
                                  const unitPrice =
                                    parseFloat(e.target.value) || 0;
                                  field.onChange(unitPrice);
                                  handleUnitPriceChange(index, unitPrice);
                                }}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`items.${index}.vatRate`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>VAT (%)</FormLabel>
                            <Select
                              onValueChange={(value) => {
                                field.onChange(parseInt(value));
                                handleVatChange(index, parseInt(value));
                              }}
                              value={field.value?.toString()}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Chọn VAT" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="0">0%</SelectItem>
                                <SelectItem value="5">5%</SelectItem>
                                <SelectItem value="8">8%</SelectItem>
                                <SelectItem value="10">10%</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`items.${index}.totalPrice`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Thành tiền (VNĐ)</FormLabel>
                            <FormControl>
                              <Input
                                disabled
                                placeholder="Tự động tính"
                                value={
                                  field.value?.toLocaleString("vi-VN") || "0"
                                }
                                className="bg-muted"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                ))}

                {/* Total Summary */}
                {fields.length > 0 &&
                  (() => {
                    const items = form.watch("items");
                    const subtotal = items.reduce((total, item) => {
                      const itemSubtotal =
                        (item.quantity || 0) * (item.unitPrice || 0);
                      return total + itemSubtotal;
                    }, 0);

                    const totalVat = items.reduce((total, item) => {
                      const itemSubtotal =
                        (item.quantity || 0) * (item.unitPrice || 0);
                      const itemVat =
                        itemSubtotal * ((item.vatRate || 0) / 100);
                      return total + itemVat;
                    }, 0);

                    const grandTotal = subtotal + totalVat;

                    return (
                      <div className="border-t pt-4 mt-4">
                        <div className="bg-muted/50 p-4 rounded-lg">
                          <div className="space-y-2">
                            <div className="flex justify-between items-center">
                              <span>Tạm tính:</span>
                              <span>
                                {subtotal.toLocaleString("vi-VN")} VNĐ
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span>Tổng VAT:</span>
                              <span>
                                {totalVat.toLocaleString("vi-VN")} VNĐ
                              </span>
                            </div>
                            <div className="border-t pt-2">
                              <div className="flex justify-between items-center text-lg font-semibold">
                                <span>Tổng cộng:</span>
                                <span className="text-blue-600">
                                  {grandTotal.toLocaleString("vi-VN")} VNĐ
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="text-sm text-muted-foreground mt-3">
                            Tổng số mặt hàng: {fields.length}
                          </div>
                        </div>
                      </div>
                    );
                  })()}
              </CardContent>
            </Card>

            {error && (
              <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-lg text-sm">
                <strong>Lỗi:</strong> {error}
              </div>
            )}

            <DialogFooter className="gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={loading}
              >
                Hủy
              </Button>
              <Button
                type="submit"
                disabled={loading || fields.length === 0}
                className="min-w-32"
              >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {loading
                  ? isEditing
                    ? "Đang cập nhật..."
                    : "Đang tạo..."
                  : isEditing
                  ? "Cập nhật phiếu nhập"
                  : "Tạo phiếu nhập"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>

      <SupplyFormDialog
        open={showSupplyForm}
        onOpenChange={setShowSupplyForm}
        onSuccess={handleSupplyCreated}
        mode="create"
      />
    </Dialog>
  );
}
