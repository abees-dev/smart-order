import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Loader2,
  Package,
  TrendingUp,
  DollarSign,
  MapPin,
  AlertTriangle,
} from "lucide-react";
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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { SupplierSelectField } from "@/components/forms";
import { useSupplyActions } from "../hooks/use-supply";
import { createSupplySchema, type CreateSupplyFormData } from "../validation";

interface SupplyFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function SupplyFormDialog({
  open,
  onOpenChange,
  onSuccess,
}: SupplyFormDialogProps) {
  const { createSupply, loading, error } = useSupplyActions();

  const form = useForm<CreateSupplyFormData>({
    resolver: zodResolver(createSupplySchema),
    defaultValues: {
      name: "",
      sku: "",
      description: "",
      category: "",
      unit: "",
      currentStock: 0,
      minStock: 0,
      maxStock: 0,
      purchasePrice: 0,
      salePrice: 0,
      supplierId: "",
      location: "",
    },
  });

  const onSubmit = async (data: CreateSupplyFormData) => {
    try {
      await createSupply(data);
      form.reset();
      onSuccess();
    } catch (error) {
      console.error("Error creating supply:", error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] sm:max-w-[600px] lg:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-4 lg:pb-6 border-b">
          <div className="flex items-center gap-2 lg:gap-3">
            <div className="p-1.5 lg:p-2 bg-primary/10 rounded-lg">
              <Package className="h-4 w-4 lg:h-5 lg:w-5 text-primary" />
            </div>
            <div>
              <DialogTitle className="text-lg lg:text-xl">
                Thêm vật tư mới
              </DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground hidden sm:block">
                Tạo một vật tư mới trong hệ thống quản lý kho
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <Form {...form}>
          <form
            noValidate
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-6 lg:space-y-8"
          >
            {/* Basic Information Section */}
            <div className="space-y-3 lg:space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-muted">
                <Package className="h-3 w-3 lg:h-4 lg:w-4 text-primary" />
                <h3 className="font-semibold text-sm text-primary">
                  Thông tin cơ bản
                </h3>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 lg:gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tên vật tư *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Nhập tên vật tư"
                          className="h-10 lg:h-11"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="sku"
                  render={({ field, formState: { errors } }) => (
                    <FormItem>
                      <FormLabel>Mã SKU *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Ví dụ: VT-001"
                          className="h-10 lg:h-11 font-mono"
                          {...field}
                          onChange={(e) =>
                            field.onChange(e.target.value.toUpperCase())
                          }
                        />
                      </FormControl>
                      {!errors.sku && (
                        <FormDescription>
                          Mã định danh duy nhất cho vật tư
                        </FormDescription>
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 lg:gap-4">
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Danh mục *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Ví dụ: Điện tử, Vật liệu xây dựng..."
                          className="h-11"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="unit"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Đơn vị tính *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Ví dụ: cái, kg, lít..."
                          className="h-11"
                          {...field}
                        />
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
                    <FormLabel>Mô tả</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Mô tả chi tiết về vật tư, công dụng, đặc điểm..."
                        rows={3}
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Stock Management Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-muted">
                <TrendingUp className="h-4 w-4 text-primary" />
                <h3 className="font-semibold text-sm text-primary">
                  Quản lý tồn kho
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="currentStock"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tồn kho hiện tại *</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="0"
                          className="h-11"
                          placeholder="0"
                          {...field}
                          onChange={(e) =>
                            field.onChange(parseFloat(e.target.value) || 0)
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="minStock"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tồn kho tối thiểu *</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="0"
                          className="h-11"
                          placeholder="0"
                          {...field}
                          onChange={(e) =>
                            field.onChange(parseFloat(e.target.value) || 0)
                          }
                        />
                      </FormControl>
                      <FormDescription>
                        Cảnh báo khi tồn kho dưới mức này
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="maxStock"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tồn kho tối đa *</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="1"
                          className="h-11"
                          placeholder="0"
                          {...field}
                          onChange={(e) =>
                            field.onChange(parseFloat(e.target.value) || 0)
                          }
                        />
                      </FormControl>
                      <FormDescription>
                        Mức tồn kho tối đa trong kho
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Pricing Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-muted">
                <DollarSign className="h-4 w-4 text-primary" />
                <h3 className="font-semibold text-sm text-primary">
                  Thông tin giá cả
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="purchasePrice"
                  render={({ field, formState: { errors } }) => (
                    <FormItem>
                      <FormLabel>Giá mua *</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          className="h-11"
                          placeholder="0"
                          {...field}
                          onChange={(e) =>
                            field.onChange(parseFloat(e.target.value) || 0)
                          }
                        />
                      </FormControl>
                      {!errors.purchasePrice && (
                        <FormDescription>
                          Giá mua vào từ nhà cung cấp (VND)
                        </FormDescription>
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="salePrice"
                  render={({ field, formState: { errors } }) => (
                    <FormItem>
                      <FormLabel>Giá bán *</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          className="h-11"
                          placeholder="0"
                          {...field}
                          onChange={(e) =>
                            field.onChange(parseFloat(e.target.value) || 0)
                          }
                        />
                      </FormControl>
                      {!errors.salePrice && (
                        <FormDescription>
                          Giá bán ra cho khách hàng (VND)
                        </FormDescription>
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Additional Information Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-muted">
                <MapPin className="h-4 w-4 text-primary" />
                <h3 className="font-semibold text-sm text-primary">
                  Thông tin bổ sung
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="supplierId"
                  render={({ field, fieldState }) => (
                    <SupplierSelectField
                      field={field}
                      fieldState={fieldState}
                      label="Nhà cung cấp"
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
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Vị trí lưu trữ</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Ví dụ: Kho A - Kệ 1"
                          className="h-11"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>Vị trí cụ thể trong kho</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 border border-destructive/20 p-4 rounded-lg">
                <AlertTriangle className="h-4 w-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <DialogFooter className="border-t pt-6 mt-8">
              <div className="flex flex-col-reverse sm:flex-row gap-3 w-full">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  className="flex-1 sm:flex-none"
                  disabled={loading}
                >
                  Hủy bỏ
                </Button>
                <Button
                  type="submit"
                  disabled={loading}
                  className="flex-1 sm:flex-none"
                >
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {loading ? "Đang tạo..." : "Tạo vật tư"}
                </Button>
              </div>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
