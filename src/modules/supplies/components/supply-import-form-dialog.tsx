import { useState, useRef } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Trash2, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { VAT_RATE_OPTIONS } from "@/constants/vat";

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
import {
  SupplierSelectField,
  SupplySelectField,
  OrderSelectField,
  FormDatePicker,
} from "@/components/forms";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  createSupplyImportSchema,
  type CreateSupplyImportFormData,
} from "../validation";
import { SupplyFormDialog } from "./supply-form-dialog";
import type { Supply, SupplyImport } from "../types";
import FormTextField from "@/components/forms/form-textfield";
import {
  useCreateSupplyImport,
  useUpdateSupplyImport,
} from "../hooks/use-supply-import-actions";
import { t } from "i18next";
import { toast } from "sonner";
import DialogResponsive from "@/components/ui/dialog-responsive";
import { useIsMobile } from "@/hooks/use-mobile";

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
  const [error, setError] = useState<string | null>(null);
  const isMobile = useIsMobile();
  const itemsContainerRef = useRef<HTMLDivElement>(null);
  const { createSupplyImport, isLoading: loadingCreateSupplyImport } =
    useCreateSupplyImport({
      onSuccess: () => {
        onSuccess();
        form.reset({
          invoiceNumber: "",
          importDate: new Date(),
          supplierId: "",
          notes: "",
          items: [
            {
              supplyId: "",
              quantity: 1,
              unitPrice: 0,
              vatRate: 0,
              totalPrice: 0,
              orderId: "",
            },
          ],
        });
        onOpenChange(false);
      },
      onError: (error) => {
        console.error("Failed to create supply import:", error);
        setError(error.message || t("Tạo phiếu nhập thất bại"));
      },
    });

  const { updateSupplyImport, isLoading: loadingUpdateSupplyImport } =
    useUpdateSupplyImport({
      onSuccess: () => {
        onSuccess();
        onOpenChange(false);
        toast.success("Cập nhật phiếu nhập thành công");
      },
      onError: (error) => {
        console.error("Failed to update supply import:", error);
        setError(error.message || t("Cập nhật phiếu nhập thất bại"));
      },
    });
  const loading = loadingCreateSupplyImport || loadingUpdateSupplyImport;
  const [showSupplyForm, setShowSupplyForm] = useState(false);

  const isEditing = !!editImport;

  const form = useForm<CreateSupplyImportFormData>({
    resolver: zodResolver(createSupplyImportSchema),
    defaultValues:
      isEditing && editImport
        ? {
            invoiceNumber: editImport.invoiceNumber,
            importDate: new Date(editImport.importDate),
            supplierId: editImport.supplierId,
            notes: editImport.notes || "",
            items: editImport.items.map((item) => ({
              supplyId: item.supplyId,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              vatRate: item.vatRate,
              totalPrice: item.totalPrice,
              orderId: item.orderId || "",
            })),
          }
        : {
            invoiceNumber: "",
            importDate: new Date(),
            supplierId: "",
            notes: "",
            items: [
              {
                supplyId: "",
                quantity: 1,
                unitPrice: 0,
                vatRate: 0,
                totalPrice: 0,
                orderId: "",
              },
            ],
          },
    mode: "onChange", // Enable real-time validation
  });

  const { fields, append, prepend, remove } = useFieldArray({
    control: form.control,
    name: "items",
  });

  const onSubmit = async (data: CreateSupplyImportFormData) => {
    const hasInvalidItems = data.items.some(
      (item) => !item.supplyId || item.quantity <= 0 || item.unitPrice < 0,
    );

    if (hasInvalidItems) {
      form.setError("items", {
        message: "Vui lòng điền đầy đủ thông tin cho tất cả vật tư",
      });
      return;
    }

    if (isEditing && editImport) {
      updateSupplyImport({
        importId: editImport.id,
        data,
      });
    } else {
      createSupplyImport(data);
    }
  };

  const handleSupplyCreated = () => {
    setShowSupplyForm(false);
  };

  const addItem = () => {
    prepend({
      supplyId: "",
      quantity: 1,
      unitPrice: 0,
      vatRate: 0,
      totalPrice: 0,
      orderId: "",
    });

    // Scroll to the newly added item at top
    setTimeout(() => {
      if (itemsContainerRef.current) {
        const firstItem = itemsContainerRef.current.firstElementChild as HTMLElement;
        if (firstItem) {
          firstItem.scrollIntoView({
            behavior: "smooth",
            block: "nearest",
          });
        }
      }
    }, 50);
  };

  const removeItem = (index: number) => {
    const currentItem = form.getValues(`items.${index}`);
    const hasData =
      currentItem.supplyId ||
      currentItem.quantity > 1 ||
      currentItem.unitPrice > 0;

    if (hasData) {
      const confirmed = window.confirm(
        "Bạn có chắc chắn muốn xóa vật tư này? Dữ liệu đã nhập sẽ bị mất.",
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

  const formContent = (
    <Form {...form}>
      <form
        noValidate
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-6"
        id="supply-import-form"
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

            <FormDatePicker
              name="importDate"
              label="Ngày nhập"
              required
              placeholder="Chọn ngày nhập"
              control={form.control}
              helpText="Ngày thực hiện nhập kho"
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

        {isMobile && (
          <div className="flex gap-2 sticky top-0 bg-background py-2 z-10 justify-end">
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
        )}

        {/* Import Items */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between flex-wrap gap-2 relative">
              <CardTitle className="text-lg">
                Danh sách vật tư nhập ({fields.length} mặt hàng)
              </CardTitle>
              {!isMobile && (
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
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div ref={itemsContainerRef} className="space-y-4">
              {fields.map((field, index) => (
                <div key={field.id} className="border rounded-lg p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-base">
                      Vật tư #{index + 1}
                    </h4>
                    <div className="flex gap-1">
                      <Button
                        type="button"
                        onClick={() => {
                          const currentItem = form.getValues(`items.${index}`);
                          append({
                            supplyId: currentItem.supplyId,
                            quantity: currentItem.quantity,
                            unitPrice: currentItem.unitPrice,
                            vatRate: currentItem.vatRate,
                            totalPrice: currentItem.totalPrice,
                            orderId: currentItem.orderId || "",
                          });

                          // Scroll to the newly duplicated item
                          // setTimeout(() => {
                          //   if (itemsContainerRef.current) {
                          //     const items = itemsContainerRef.current.children;
                          //     const lastItem = items[
                          //       items.length - 1
                          //     ] as HTMLElement;
                          //     if (lastItem) {
                          //       lastItem.scrollIntoView({
                          //         behavior: "smooth",
                          //         block: "center",
                          //       });
                          //     }
                          //   }
                          // }, 100);
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

                  <div className="grid grid-cols-1 md:grid-cols-6 gap-4 items-start">
                    <FormField
                      control={form.control}
                      name={`items.${index}.supplyId`}
                      render={({ field, fieldState }) => (
                        <SupplySelectField
                          field={field}
                          fieldState={fieldState}
                          label="Chọn vật tư"
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
                      name={`items.${index}.orderId`}
                      render={({ field, fieldState }) => (
                        <OrderSelectField
                          field={field}
                          fieldState={fieldState}
                          label="Đơn hàng"
                          placeholder="Chọn đơn hàng"
                          className="md:col-span-2"
                        />
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-start">
                    {/* <FormField
                    control={form.control}
                    name={`items.${index}.quantity`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Số lượng *</FormLabel>
                        <FormControl autoFocus={false}>
                          <Input
                            type="number"
                            min="1"
                            placeholder="Số lượng"
                            {...field}
                            onChange={(e) => {
                              const quantity = parseInt(e.target.value) || 0;
                              field.onChange(quantity);
                              handleQuantityChange(index, quantity);
                            }}
                            autoFocus={false}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  /> */}
                    <FormTextField
                      name={`items.${index}.quantity`}
                      label="Số lượng"
                      placeholder="Số lượng"
                      control={form.control}
                      type="number"
                      onChange={(e) => {
                        const quantity = parseFloat(e.target.value) || 0;
                        handleQuantityChange(index, quantity);
                      }}
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
                              {VAT_RATE_OPTIONS.map((option) => (
                                <SelectItem
                                  key={option.value}
                                  value={option.value}
                                >
                                  {option.label}
                                </SelectItem>
                              ))}
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
            </div>

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
                  const itemVat = itemSubtotal * ((item.vatRate || 0) / 100);
                  return total + itemVat;
                }, 0);

                const grandTotal = subtotal + totalVat;

                return (
                  <div className="border-t pt-4 mt-4">
                    <div className="bg-muted/50 p-4 rounded-lg">
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span>Tạm tính:</span>
                          <span>{subtotal.toLocaleString("vi-VN")} VNĐ</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span>Tổng VAT:</span>
                          <span>{totalVat.toLocaleString("vi-VN")} VNĐ</span>
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
      </form>
    </Form>
  );

  const formDescription = isEditing
    ? "Cập nhật thông tin phiếu nhập vật tư và các sản phẩm."
    : "Tạo phiếu nhập kho mới cho vật tư. Vui lòng điền đầy đủ thông tin số hóa đơn, nhà cung cấp và danh sách vật tư cần nhập.";

  return (
    <div>
      <DialogResponsive
        title={
          <div className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            {isEditing
              ? "Chỉnh sửa phiếu nhập vật tư"
              : "Tạo phiếu nhập vật tư"}
          </div>
        }
        description={!isMobile ? formDescription : undefined}
        open={open}
        onOpenChange={onOpenChange}
        className="sm:max-w-4xl"
        actions={{
          cancel: {
            label: "Hủy",
            onClick: () => onOpenChange(false),
            disabled: loading,
          },
          submit: {
            label: isEditing
              ? loading
                ? "Đang cập nhật..."
                : "Cập nhật phiếu nhập"
              : loading
                ? "Đang tạo..."
                : "Tạo phiếu nhập",
            disabled: loading || fields.length === 0,
            loading: loading,
          },
        }}
        formId="supply-import-form"
      >
        {formContent}
      </DialogResponsive>

      <SupplyFormDialog
        open={showSupplyForm}
        onOpenChange={setShowSupplyForm}
        onSuccess={handleSupplyCreated}
        mode="create"
      />
    </div>
  );
}
