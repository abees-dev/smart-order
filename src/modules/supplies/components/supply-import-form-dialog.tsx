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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SupplierSelectField } from "@/components/forms";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useSupplyImportActions, useSupplies } from "../hooks/use-supply";
import {
  createSupplyImportSchema,
  type CreateSupplyImportFormData,
} from "../validation";
import { SupplyFormDialog } from "./supply-form-dialog";

interface SupplyImportFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function SupplyImportFormDialog({
  open,
  onOpenChange,
  onSuccess,
}: SupplyImportFormDialogProps) {
  const { createImport, loading, error } = useSupplyImportActions();
  const { supplies, loading: suppliesLoading, refreshSupplies } = useSupplies();
  const [showSupplyForm, setShowSupplyForm] = useState(false);

  const form = useForm<CreateSupplyImportFormData>({
    resolver: zodResolver(createSupplyImportSchema),
    defaultValues: {
      invoiceNumber: "",
      supplierId: "",
      notes: "",
      items: [
        {
          supplyId: "",
          quantity: 0,
          unitPrice: 0,
          totalPrice: 0,
        },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  });

  const onSubmit = async (data: CreateSupplyImportFormData) => {
    try {
      await createImport(data);
      form.reset();
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error("Error creating supply import:", error);
    }
  };

  const handleSupplyCreated = () => {
    refreshSupplies();
    setShowSupplyForm(false);
  };

  console.log("Supplies:", supplies);

  const addItem = () => {
    append({
      supplyId: "",
      quantity: 0,
      unitPrice: 0,
      totalPrice: 0,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[900px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Tạo phiếu nhập vật tư
          </DialogTitle>
          <DialogDescription>
            Thêm thông tin phiếu nhập vật tư mới
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Import Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Thông tin phiếu nhập</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="invoiceNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Số hóa đơn *</FormLabel>
                      <FormControl>
                        <Input placeholder="Nhập số hóa đơn" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="supplierId"
                  render={({ field, fieldState }) => (
                    <SupplierSelectField
                      field={field}
                      fieldState={fieldState}
                      label="Nhà cung cấp *"
                      placeholder="Chọn nhà cung cấp"
                      allowCreate
                      onCreateNew={() => {
                        // TODO: Open supplier creation dialog
                        console.log("Open supplier creation dialog");
                      }}
                    />
                  )}
                />

                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ghi chú</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Ghi chú về phiếu nhập..."
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Import Items */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">
                    Danh sách vật tư nhập
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {fields.map((field, index) => (
                  <div
                    key={field.id}
                    className="border rounded-lg p-4 space-y-4"
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">Vật tư #{index + 1}</h4>
                      {fields.length > 1 && (
                        <Button
                          type="button"
                          onClick={() => remove(index)}
                          variant="outline"
                          size="sm"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-start">
                      <FormField
                        control={form.control}
                        name={`items.${index}.supplyId`}
                        render={({ field }) => {
                          const selectedSupply = supplies.find(
                            (s) => s.id === field.value
                          );
                          return (
                            <FormItem className="md:col-span-2">
                              <FormLabel>Chọn vật tư *</FormLabel>
                              <div className="flex gap-2">
                                <FormControl className="flex-1">
                                  <Select
                                    value={field.value}
                                    onValueChange={(value) => {
                                      field.onChange(value);
                                      // Auto-fill supply info when selected
                                      const selectedSupply = supplies.find(
                                        (s) => s.id === value
                                      );
                                      if (selectedSupply) {
                                        form.setValue(
                                          `items.${index}.unitPrice`,
                                          selectedSupply.purchasePrice
                                        );
                                        const quantity = form.getValues(
                                          `items.${index}.quantity`
                                        );
                                        form.setValue(
                                          `items.${index}.totalPrice`,
                                          quantity *
                                            selectedSupply.purchasePrice
                                        );
                                      }
                                    }}
                                    disabled={suppliesLoading}
                                  >
                                    <SelectTrigger style={{ width: "240px" }}>
                                      <SelectValue
                                        placeholder={
                                          suppliesLoading
                                            ? "Đang tải..."
                                            : "Chọn vật tư"
                                        }
                                      >
                                        {field.value && selectedSupply && (
                                          <div className="flex items-center justify-between w-[190px]">
                                            <span className="font-medium text-sm truncate">
                                              {selectedSupply.name}
                                            </span>
                                          </div>
                                        )}
                                      </SelectValue>
                                    </SelectTrigger>
                                    <SelectContent>
                                      {supplies.map((supply) => (
                                        <SelectItem
                                          key={supply.id}
                                          value={supply.id}
                                        >
                                          <div className="flex flex-col">
                                            <span className="font-medium">
                                              {supply.name}
                                            </span>
                                            <span className="text-sm text-muted-foreground">
                                              {supply.sku} - {supply.unit} -
                                              Giá:{" "}
                                              {supply.purchasePrice.toLocaleString(
                                                "vi-VN"
                                              )}
                                              đ
                                            </span>
                                          </div>
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </FormControl>
                              </div>
                              {selectedSupply && (
                                <div className="text-sm text-muted-foreground mt-1">
                                  Tồn kho: {selectedSupply.currentStock}{" "}
                                  {selectedSupply.unit}
                                  {selectedSupply.currentStock <=
                                    selectedSupply.minStock && (
                                    <span className="text-orange-500 ml-2">
                                      (Sắp hết hàng)
                                    </span>
                                  )}
                                </div>
                              )}
                              <FormMessage />
                            </FormItem>
                          );
                        }}
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
                                placeholder="0"
                                {...field}
                                onChange={(e) => {
                                  const quantity =
                                    parseInt(e.target.value) || 0;
                                  field.onChange(quantity);
                                  const unitPrice = form.getValues(
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
                            <FormLabel>Giá nhập *</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min="0"
                                step="0.01"
                                placeholder="0"
                                {...field}
                                onChange={(e) => {
                                  const unitPrice =
                                    parseFloat(e.target.value) || 0;
                                  field.onChange(unitPrice);
                                  const quantity = form.getValues(
                                    `items.${index}.quantity`
                                  );
                                  form.setValue(
                                    `items.${index}.totalPrice`,
                                    unitPrice * quantity
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
                        name={`items.${index}.totalPrice`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Tổng giá</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                disabled
                                placeholder="0"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {error && <div className="text-red-600 text-sm">{error}</div>}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Hủy
              </Button>
              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Tạo phiếu nhập
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
