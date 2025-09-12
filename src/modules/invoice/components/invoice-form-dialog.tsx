import { useState, useEffect } from "react";
import { Plus, X } from "lucide-react";
import { useForm } from "react-hook-form";
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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useInvoiceActions } from "../hooks/use-invoice";
import { createInvoiceSchema, type CreateInvoiceFormData } from "../validation";
import type { Invoice, InvoiceItemType } from "../types";
import { ProductService } from "../../product/services/product.service";
import { SupplyService } from "../../supplies/services/supply.service";
import type { Product } from "../../product/types";
import type { Supply } from "../../supplies/types";

interface InvoiceFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  editInvoice?: Invoice | null;
}

interface FormInvoiceItem {
  type: InvoiceItemType;
  itemId: string;
  itemName: string;
  category: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  description?: string;
}

export function InvoiceFormDialog({
  open,
  onOpenChange,
  onSuccess,
  editInvoice = null,
}: InvoiceFormDialogProps) {
  const { createInvoice, updateInvoice, loading, error } = useInvoiceActions();

  const [items, setItems] = useState<FormInvoiceItem[]>([
    {
      type: "product",
      itemId: "",
      itemName: "",
      category: "goods",
      quantity: 1,
      unitPrice: 0,
      totalPrice: 0,
      description: "",
    },
  ]);

  const [products, setProducts] = useState<Product[]>([]);
  const [supplies, setSupplies] = useState<Supply[]>([]);
  const [loadingItems, setLoadingItems] = useState(false);

  const form = useForm<CreateInvoiceFormData>({
    resolver: zodResolver(createInvoiceSchema),
    defaultValues: {
      invoiceNumber: "",
      customerName: "",
      vatRate: 10,
      notes: "",
      items: items,
    },
  });

  // Generate invoice number
  const generateInvoiceNumber = () => {
    const date = new Date();
    const timestamp = date.getTime().toString().slice(-6);
    return `INV-${date.getFullYear()}${(date.getMonth() + 1)
      .toString()
      .padStart(2, "0")}${date
      .getDate()
      .toString()
      .padStart(2, "0")}-${timestamp}`;
  };

  useEffect(() => {
    if (open && !editInvoice) {
      form.setValue("invoiceNumber", generateInvoiceNumber());
    }
  }, [open, editInvoice, form]);

  // Fetch products and supplies
  useEffect(() => {
    const fetchItems = async () => {
      setLoadingItems(true);
      try {
        const [productsResponse, suppliesResponse] = await Promise.all([
          ProductService.getAllProducts({}, 100),
          SupplyService.getAllSupplies({ category: "goods" }, 100),
        ]);

        setProducts(productsResponse.products);
        setSupplies(suppliesResponse.supplies);
      } catch (error) {
        console.error("Error fetching items:", error);
      } finally {
        setLoadingItems(false);
      }
    };

    if (open) {
      fetchItems();
    }
  }, [open]);

  // Fill form when editing
  useEffect(() => {
    if (editInvoice) {
      form.reset({
        invoiceNumber: editInvoice.invoiceNumber,
        customerName: editInvoice.customerName || "",
        vatRate: editInvoice.vatRate,
        notes: editInvoice.notes || "",
        items: editInvoice.items.map((item) => ({
          type: item.type,
          itemId: item.itemId,
          category: item.category,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          description: item.description || "",
        })),
      });
      setItems(
        editInvoice.items.map((item) => ({
          type: item.type,
          itemId: item.itemId,
          itemName: item.itemName || "",
          category: item.category,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          totalPrice: item.totalPrice,
          description: item.description || "",
        }))
      );
    }
  }, [editInvoice, form]);

  const addItem = () => {
    const newItem: FormInvoiceItem = {
      type: "product",
      itemId: "",
      itemName: "",
      category: "goods",
      quantity: 1,
      unitPrice: 0,
      totalPrice: 0,
      description: "",
    };
    setItems([...items, newItem]);
    form.setValue("items", [...form.getValues("items"), newItem]);
  };

  const removeItem = (index: number) => {
    if (items.length > 1) {
      const newItems = items.filter((_, i) => i !== index);
      setItems(newItems);
      form.setValue("items", newItems);
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updateItem = (
    index: number,
    field: keyof FormInvoiceItem,
    value: any
  ) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    // Auto-calculate totalPrice when quantity or unitPrice changes
    if (field === "quantity" || field === "unitPrice") {
      newItems[index].totalPrice =
        newItems[index].quantity * newItems[index].unitPrice;
    }
    setItems(newItems);
    form.setValue("items", newItems);
  };

  const calculateTotal = () => {
    const subtotal = items.reduce((sum, item) => {
      return sum + item.quantity * item.unitPrice;
    }, 0);
    const vatRate = form.watch("vatRate") || 0;
    const vatAmount = subtotal * (vatRate / 100);
    const totalAmount = subtotal + vatAmount;

    return { subtotal, vatAmount, totalAmount };
  };

  const onSubmit = async (data: CreateInvoiceFormData) => {
    try {
      // Enrich items with itemCode and itemName
      const enrichedItems = data.items.map((item) => {
        const selectedItem =
          item.type === "product"
            ? products.find((p) => p.id === item.itemId)
            : supplies.find((s) => s.id === item.itemId);

        return {
          ...item,
          itemName: selectedItem?.name || "",
          itemCode:
            item.type === "product"
              ? (selectedItem as Product)?.productCode || ""
              : (selectedItem as Supply)?.sku || "",
        };
      });

      const enrichedData = {
        ...data,
        items: enrichedItems,
      };

      if (editInvoice) {
        await updateInvoice(editInvoice.id, enrichedData);
      } else {
        await createInvoice(enrichedData);
      }
      onSuccess();
    } catch (error) {
      console.error("Error saving invoice:", error);
    }
  };

  const handleClose = () => {
    form.reset();
    setItems([
      {
        type: "product",
        itemId: "",
        itemName: "",
        category: "goods",
        quantity: 1,
        unitPrice: 0,
        totalPrice: 0,
        description: "",
      },
    ]);
    onOpenChange(false);
  };

  const { subtotal, vatAmount, totalAmount } = calculateTotal();

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editInvoice ? "Chỉnh sửa hóa đơn" : "Tạo hóa đơn mới"}
          </DialogTitle>
          <DialogDescription>
            {editInvoice
              ? "Cập nhật thông tin hóa đơn"
              : "Nhập thông tin để tạo hóa đơn mới"}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="invoiceNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Số hóa đơn *</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="INV-20241201-123456" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="customerName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tên khách hàng</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Nhập tên khách hàng" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
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
                {items.map((item, index) => (
                  <div
                    key={index}
                    className="p-4 border rounded-lg space-y-4 relative"
                  >
                    {items.length > 1 && (
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

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                      <div>
                        <Label>Loại</Label>
                        <Select
                          value={item.type}
                          onValueChange={(value) => {
                            updateItem(index, "type", value as InvoiceItemType);
                            // Reset item selection when type changes
                            updateItem(index, "itemId", "");
                            updateItem(index, "itemName", "");
                            updateItem(index, "unitPrice", 0);
                            updateItem(index, "category", "goods");
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="product">Sản phẩm</SelectItem>
                            <SelectItem value="supply">Vật tư</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label>
                          {item.type === "product" ? "Sản phẩm" : "Vật tư"}
                        </Label>
                        <Select
                          value={item.itemId}
                          onValueChange={(value) => {
                            const selectedItem =
                              item.type === "product"
                                ? products.find((p) => p.id === value)
                                : supplies.find((s) => s.id === value);

                            if (selectedItem) {
                              updateItem(index, "itemId", value);
                              updateItem(index, "itemName", selectedItem.name);
                              updateItem(
                                index,
                                "unitPrice",
                                item.type === "product"
                                  ? (selectedItem as Product).price
                                  : (selectedItem as Supply).salePrice
                              );
                              updateItem(
                                index,
                                "category",
                                selectedItem.category
                              );
                            }
                          }}
                          disabled={loadingItems}
                        >
                          <SelectTrigger>
                            <SelectValue
                              placeholder={
                                loadingItems ? "Đang tải..." : "Chọn mặt hàng"
                              }
                            />
                          </SelectTrigger>
                          <SelectContent>
                            {item.type === "product"
                              ? products.map((product) => (
                                  <SelectItem
                                    key={product.id}
                                    value={product.id}
                                  >
                                    {product.name} -{" "}
                                    {new Intl.NumberFormat("vi-VN", {
                                      style: "currency",
                                      currency: "VND",
                                    }).format(product.price)}
                                  </SelectItem>
                                ))
                              : supplies.map((supply) => (
                                  <SelectItem key={supply.id} value={supply.id}>
                                    {supply.name} -{" "}
                                    {new Intl.NumberFormat("vi-VN", {
                                      style: "currency",
                                      currency: "VND",
                                    }).format(supply.salePrice)}
                                  </SelectItem>
                                ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label>Danh mục</Label>
                        <Select
                          value={item.category}
                          onValueChange={(value) =>
                            updateItem(index, "category", value)
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="goods">Hàng hóa</SelectItem>
                            <SelectItem value="supplies">Vật tư</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label>Số lượng</Label>
                        <Input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) =>
                            updateItem(
                              index,
                              "quantity",
                              parseInt(e.target.value) || 1
                            )
                          }
                        />
                      </div>

                      <div>
                        <Label>Đơn giá</Label>
                        <Input
                          type="number"
                          min="0"
                          value={item.unitPrice}
                          onChange={(e) =>
                            updateItem(
                              index,
                              "unitPrice",
                              parseFloat(e.target.value) || 0
                            )
                          }
                        />
                      </div>
                    </div>

                    <div>
                      <Label>Mô tả</Label>
                      <Input
                        value={item.description}
                        onChange={(e) =>
                          updateItem(index, "description", e.target.value)
                        }
                        placeholder="Mô tả sản phẩm/vật tư"
                      />
                    </div>

                    <div className="text-right">
                      <span className="font-medium">
                        Thành tiền:{" "}
                        {new Intl.NumberFormat("vi-VN", {
                          style: "currency",
                          currency: "VND",
                        }).format(item.quantity * item.unitPrice)}
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
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Thuế VAT (%)</FormLabel>
                    <FormControl>
                      <Select
                        value={field.value?.toString()}
                        onValueChange={(value) =>
                          field.onChange(parseFloat(value))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="0">0%</SelectItem>
                          <SelectItem value="5">5%</SelectItem>
                          <SelectItem value="8">8%</SelectItem>
                          <SelectItem value="10">10%</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div></div>

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Ghi chú</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="Ghi chú thêm về hóa đơn"
                        rows={3}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
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

            {error && <div className="text-red-600 text-sm">{error}</div>}

            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleClose}>
                Hủy
              </Button>
              <Button type="submit" disabled={loading}>
                {loading
                  ? "Đang lưu..."
                  : editInvoice
                  ? "Cập nhật"
                  : "Tạo hóa đơn"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
