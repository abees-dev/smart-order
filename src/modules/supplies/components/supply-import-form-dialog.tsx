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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useSupplyImportActions } from "../hooks/use-supply";
import {
  createSupplyImportSchema,
  type CreateSupplyImportFormData,
} from "../validation";

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

  const form = useForm<CreateSupplyImportFormData>({
    resolver: zodResolver(createSupplyImportSchema),
    defaultValues: {
      invoiceNumber: "",
      supplier: "",
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
                  name="supplier"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nhà cung cấp *</FormLabel>
                      <FormControl>
                        <Input placeholder="Tên nhà cung cấp" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
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
                  <Button type="button" onClick={addItem} variant="outline">
                    <Plus className="h-4 w-4 mr-2" />
                    Thêm vật tư
                  </Button>
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

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <FormField
                        control={form.control}
                        name={`items.${index}.supplyId`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Mã vật tư *</FormLabel>
                            <FormControl>
                              <Input placeholder="Mã vật tư" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
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
    </Dialog>
  );
}
