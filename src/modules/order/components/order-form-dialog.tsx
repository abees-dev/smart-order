import { useState, useEffect } from "react";
import { Plus, X } from "lucide-react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FormSelectField } from "@/components/forms/form-select";
import { createOrderSchema, type CreateOrderFormData } from "../validation";
import type { Order } from "../types";
import type { Product } from "../../product/types";
import type { Supply } from "../../supplies/types";
import type { Customer } from "../../customer/types";
import { generateOrderNumber } from "@/utils";
import { useOrderSelectionMenu } from "../hooks/use-order-selection";
import { useCreateOrder, useUpdateOrder } from "../hooks/user-order-actions";
import { toast } from "sonner";
import FormTextField from "@/components/forms/form-textfield";

interface OrderFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  editOrder?: Order | null;
}

export function OrderFormDialog({
  open,
  onOpenChange,
  onSuccess,
  editOrder = null,
}: OrderFormDialogProps) {
  const { createOrder, isPending: loadingCreateOrder } = useCreateOrder({
    onSuccess: () => {
      onSuccess();
      onOpenChange(false);
      toast.success("Tạo đơn hàng thành công");
    },
    onError: (error) => {
      console.error("Error creating order:", error);
    },
  });
  const { updateOrder, isPending: loadingUpdateOrder } = useUpdateOrder({
    onSuccess: () => {
      onSuccess();
      onOpenChange(false);
    },
    onError: (error) => {
      console.error("Error updating order:", error);
      toast.error("Cập nhật đơn hàng thất bại");
    },
  });

  const loading = loadingCreateOrder || loadingUpdateOrder;

  const [products, setProducts] = useState<Product[]>([]);
  const [supplies, setSupplies] = useState<Supply[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);

  const { data: ordersSelection, loading: loadingItems } =
    useOrderSelectionMenu();

  useEffect(() => {
    if (!loadingItems) {
      setCustomers(ordersSelection?.customers || []);
      setProducts(ordersSelection?.products || []);
      setSupplies(ordersSelection?.supplies || []);
    }
  }, [loadingItems]);

  // Options for form selects
  const itemTypeOptions = [
    { value: "product", label: "Sản phẩm" },
    { value: "supply", label: "Vật tư" },
  ];

  const vatRateOptions = [
    { value: "0", label: "0%" },
    { value: "5", label: "5%" },
    { value: "8", label: "8%" },
    { value: "10", label: "10%" },
  ];

  // Helper functions for dynamic options
  const getProductOptions = () =>
    products.map((product) => ({
      value: product.id,
      label: `${product.name} - ${new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
      }).format(product.price)}`,
      description: product.productCode,
      metadata: { price: product.price, category: product.category },
    }));

  const getSupplyOptions = () =>
    supplies.map((supply) => ({
      value: supply.id,
      label: `${supply.name} - ${new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
      }).format(supply.salePrice)}`,
      description: supply.sku,
      metadata: { price: supply.salePrice, category: supply.category },
    }));

  const getCustomerOptions = () =>
    customers.map((customer) => ({
      value: customer.id,
      label: customer.name,
      description: `${customer.phone} - ${customer.address}`,
    }));

  const form = useForm<CreateOrderFormData>({
    resolver: zodResolver(createOrderSchema),
    defaultValues: {
      orderNumber: "",
      customerId: "",
      customerName: "",
      vatRate: 10,
      notes: "",
      items: [
        {
          type: "product",
          itemId: "",
          quantity: 1,
          unitPrice: 0,
          totalPrice: 0,
          description: "",
        },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  });

  useEffect(() => {
    if (open && !editOrder) {
      form.setValue("orderNumber", generateOrderNumber());
    }
  }, [open, editOrder, form]);

  // Fill form when editing
  useEffect(() => {
    if (editOrder) {
      form.reset({
        orderNumber: editOrder.orderNumber,
        customerId: editOrder.customerId || "",
        customerName: editOrder.customerName || "",
        vatRate: editOrder.vatRate,
        notes: editOrder.notes || "",
        items: editOrder.items.map((item) => ({
          type: item.type,
          itemId: item.itemId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          totalPrice: item.totalPrice,
          description: item.description || "",
        })),
      });
    }
  }, [editOrder, form]);

  const addItem = () => {
    append({
      type: "product",
      itemId: "",
      quantity: 1,
      unitPrice: 0,
      totalPrice: 0,
      description: "",
    });
  };

  const removeItem = (index: number) => {
    if (fields.length > 1) {
      remove(index);
    }
  };

  const calculateTotal = () => {
    const items = form.watch("items");
    const subtotal = items.reduce((sum, item) => {
      return sum + item.quantity * item.unitPrice;
    }, 0);
    const vatRate = form.watch("vatRate") || 0;
    const vatAmount = subtotal * (vatRate / 100);
    const totalAmount = subtotal + vatAmount;

    return { subtotal, vatAmount, totalAmount };
  };

  const onSubmit = async (data: CreateOrderFormData) => {
    // Enrich items with itemCode and itemName
    const enrichedItems = data.items.map((item) => {
      return {
        ...item,
        category: undefined,
      };
    });

    const enrichedData = {
      ...data,
      items: enrichedItems,
    };

    if (editOrder) {
      updateOrder({ id: editOrder.id, data: enrichedData });
    } else {
      createOrder(enrichedData);
    }
  };

  const handleClose = () => {
    form.reset({
      orderNumber: "",
      customerId: "",
      customerName: "",
      vatRate: 10,
      notes: "",
      items: [
        {
          type: "product",
          itemId: "",
          quantity: 1,
          unitPrice: 0,
          totalPrice: 0,
          description: "",
        },
      ],
    });
    onOpenChange(false);
  };

  const { subtotal, vatAmount, totalAmount } = calculateTotal();

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[900px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editOrder ? "Chỉnh sửa đơn hàng" : "Tạo đơn hàng mới"}
          </DialogTitle>
          <DialogDescription>
            {editOrder
              ? "Cập nhật thông tin đơn hàng"
              : "Nhập thông tin để tạo đơn hàng mới"}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormTextField
                control={form.control}
                name="orderNumber"
                label="Số đơn hàng"
                placeholder="ORD-20241201-123456"
                required
              />

              <FormField
                control={form.control}
                name="customerId"
                render={({ field, fieldState }) => (
                  <FormSelectField
                    field={{
                      ...field,
                      onChange: (value: string) => {
                        field.onChange(value);
                        // Auto-fill customer name from selected customer
                        const selectedCustomer = customers.find(
                          (c) => c.id === value
                        );
                        if (selectedCustomer) {
                          form.setValue("customerName", selectedCustomer.name);
                        } else {
                          form.setValue("customerName", "");
                        }
                      },
                    }}
                    fieldState={fieldState}
                    options={getCustomerOptions()}
                    label="Khách hàng"
                    placeholder="Chọn khách hàng..."
                    clearable={true}
                  />
                )}
              />
            </div>

            {/* Items */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Danh sách hàng hóa
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addItem}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Thêm mặt hàng
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {fields.map((field, index) => (
                  <div
                    key={field.id}
                    className="p-4 border rounded-lg space-y-4 relative"
                  >
                    {fields.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute top-2 right-2"
                        onClick={() => removeItem(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}

                    <div className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name={`items.${index}.type`}
                          render={({ field, fieldState }) => (
                            <FormSelectField
                              field={{
                                ...field,
                                onChange: (value: string) => {
                                  field.onChange(value);
                                  // Reset item selection when type changes
                                  form.setValue(`items.${index}.itemId`, "");
                                  form.setValue(`items.${index}.unitPrice`, 0);
                                  form.setValue(`items.${index}.totalPrice`, 0);
                                },
                              }}
                              fieldState={fieldState}
                              options={itemTypeOptions}
                              label="Loại"
                              placeholder="Chọn loại"
                              required
                              clearable={false}
                            />
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`items.${index}.itemId`}
                          render={({ field, fieldState }) => {
                            const itemType = form.watch(`items.${index}.type`);
                            const options =
                              itemType === "product"
                                ? getProductOptions()
                                : getSupplyOptions();

                            return (
                              <FormSelectField
                                field={{
                                  ...field,
                                  onChange: (value: string) => {
                                    const selectedItem =
                                      itemType === "product"
                                        ? products.find((p) => p.id === value)
                                        : supplies.find((s) => s.id === value);

                                    if (selectedItem) {
                                      field.onChange(value);
                                      const unitPrice =
                                        itemType === "product"
                                          ? (selectedItem as Product).price
                                          : (selectedItem as Supply).salePrice;

                                      form.setValue(
                                        `items.${index}.unitPrice`,
                                        unitPrice
                                      );

                                      // Calculate total price
                                      const quantity = form.watch(
                                        `items.${index}.quantity`
                                      );
                                      form.setValue(
                                        `items.${index}.totalPrice`,
                                        quantity * unitPrice
                                      );
                                    }
                                  },
                                }}
                                fieldState={fieldState}
                                options={options}
                                label={
                                  itemType === "product" ? "Sản phẩm" : "Vật tư"
                                }
                                placeholder={
                                  loadingItems
                                    ? "Đang tải..."
                                    : `Chọn ${
                                        itemType === "product"
                                          ? "sản phẩm"
                                          : "vật tư"
                                      } (${options.length} có sẵn)`
                                }
                                searchPlaceholder="Tìm kiếm..."
                                emptyMessage="Không tìm thấy kết quả"
                                loading={loadingItems}
                                disabled={loadingItems}
                                required
                                clearable={false}
                              />
                            );
                          }}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name={`items.${index}.quantity`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Số lượng</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  min="1"
                                  {...field}
                                  onChange={(e) => {
                                    const quantity =
                                      parseInt(e.target.value) || 1;
                                    field.onChange(quantity);
                                    // Auto-calculate total price
                                    const unitPrice = form.watch(
                                      `items.${index}.unitPrice`
                                    );
                                    form.setValue(
                                      `items.${index}.totalPrice`,
                                      quantity * unitPrice
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
                          name={`items.${index}.unitPrice`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Đơn giá</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  min="0"
                                  {...field}
                                  onChange={(e) => {
                                    const unitPrice =
                                      parseFloat(e.target.value) || 0;
                                    field.onChange(unitPrice);
                                    // Auto-calculate total price
                                    const quantity = form.watch(
                                      `items.${index}.quantity`
                                    );
                                    form.setValue(
                                      `items.${index}.totalPrice`,
                                      quantity * unitPrice
                                    );
                                  }}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>

                    <FormField
                      control={form.control}
                      name={`items.${index}.description`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Mô tả</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="Mô tả sản phẩm/vật tư"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="text-right">
                      <span className="font-medium">
                        Thành tiền:{" "}
                        {new Intl.NumberFormat("vi-VN", {
                          style: "currency",
                          currency: "VND",
                        }).format(form.watch(`items.${index}.totalPrice`) || 0)}
                      </span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Additional Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="vatRate"
                render={({ field, fieldState }) => (
                  <FormSelectField
                    field={{
                      ...field,
                      value: field.value?.toString() || "",
                      onChange: (value: string) => {
                        field.onChange(parseFloat(value));
                      },
                    }}
                    fieldState={fieldState}
                    options={vatRateOptions}
                    label="Thuế VAT (%)"
                    placeholder="Chọn mức thuế VAT"
                    required
                    clearable={false}
                  />
                )}
              />

              <div></div>

              <FormTextField
                control={form.control}
                name="notes"
                label="Ghi chú"
                placeholder="Ghi chú thêm về hóa đơn"
                rows={3}
              />
            </div>

            {/* Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Tổng kết</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span>Tạm tính:</span>
                  <span>
                    {new Intl.NumberFormat("vi-VN", {
                      style: "currency",
                      currency: "VND",
                    }).format(subtotal)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>VAT ({form.watch("vatRate") || 0}%):</span>
                  <span>
                    {new Intl.NumberFormat("vi-VN", {
                      style: "currency",
                      currency: "VND",
                    }).format(vatAmount)}
                  </span>
                </div>
                <div className="flex justify-between font-bold text-lg">
                  <span>Tổng cộng:</span>
                  <span className="text-green-600">
                    {new Intl.NumberFormat("vi-VN", {
                      style: "currency",
                      currency: "VND",
                    }).format(totalAmount)}
                  </span>
                </div>
              </CardContent>
            </Card>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleClose}>
                Hủy
              </Button>
              <Button type="submit" disabled={loading}>
                {loading
                  ? "Đang lưu..."
                  : editOrder
                  ? "Cập nhật"
                  : "Tạo đơn hàng"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
