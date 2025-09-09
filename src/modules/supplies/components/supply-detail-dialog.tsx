import { useState } from "react";
import { useForm } from "react-hook-form";
import {
  Loader2,
  Edit3,
  Package,
  MapPin,
  AlertTriangle,
  DollarSign,
  TrendingUp,
  Calendar,
  FileText,
  User,
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
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
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
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { SupplierSelectField } from "@/components/forms";
import { useIsMobile } from "@/hooks/use-mobile";
import { useSupplyActions } from "../hooks/use-supply";
import { useSuppliersByIds } from "@/hooks/use-supplier-select";
import { updateSupplySchema, type UpdateSupplyFormData } from "../validation";
import type { Supply } from "../types";
import { zodResolver } from "@hookform/resolvers/zod";

interface SupplyDetailDialogProps {
  supply: Supply | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function SupplyDetailDialog({
  supply,
  open,
  onOpenChange,
  onSuccess,
}: SupplyDetailDialogProps) {
  const isMobile = useIsMobile();
  const [isEditing, setIsEditing] = useState(false);
  const { updateSupply, loading, error } = useSupplyActions();

  // Get supplier name for display
  const { getSupplierName } = useSuppliersByIds(
    supply?.supplierId ? [supply.supplierId] : []
  );

  const form = useForm<UpdateSupplyFormData>({
    resolver: zodResolver(updateSupplySchema),
    values: supply
      ? {
          name: supply.name,
          sku: supply.sku,
          description: supply.description || "",
          category: supply.category,
          unit: supply.unit,
          currentStock: supply.currentStock,
          minStock: supply.minStock,
          purchasePrice: supply.purchasePrice,
          salePrice: supply.salePrice,
          supplierId: supply.supplierId || "",
          location: supply.location || "",
          isActive: supply.isActive,
        }
      : undefined,
  });

  const onSubmit = async (data: UpdateSupplyFormData) => {
    if (!supply) return;

    try {
      await updateSupply(supply.id, data);
      setIsEditing(false);
      onSuccess();
    } catch (error) {
      console.error("Error updating supply:", error);
    }
  };

  const getStockStatus = () => {
    if (!supply) return null;

    if (supply.currentStock <= supply.minStock) {
      return { label: "Hết hàng", color: "destructive" as const };
    }
    if (supply.currentStock <= supply.minStock * 1.5) {
      return { label: "Sắp hết", color: "outline" as const };
    }
    return { label: "Còn hàng", color: "default" as const };
  };

  const stockStatus = getStockStatus();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const formatDate = (timestamp: any) => {
    if (!timestamp) return "";
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return new Intl.DateTimeFormat("vi-VN", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }).format(date);
    } catch {
      return "";
    }
  };

  if (!supply) return null;

  const detailsContent = (
    <div className="space-y-4">
      {/* Status Badge */}
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-semibold">{supply.name}</h3>
          <p className="text-sm text-muted-foreground">
            SKU: {supply.sku} • ID: {supply.id}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={supply.isActive ? "default" : "secondary"}>
            {supply.isActive ? "Đang hoạt động" : "Ngừng hoạt động"}
          </Badge>
          {stockStatus && (
            <Badge
              variant={stockStatus.color}
              className="flex items-center gap-1"
            >
              {stockStatus.color === "destructive" && (
                <AlertTriangle className="h-3 w-3" />
              )}
              {stockStatus.color === "outline" && (
                <AlertTriangle className="h-3 w-3" />
              )}
              {stockStatus.color === "default" && (
                <Package className="h-3 w-3" />
              )}
              {stockStatus.label}
            </Badge>
          )}
        </div>
      </div>

      <Separator />

      {/* Stock Information */}
      <div className="space-y-3">
        <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
          Thông tin tồn kho
        </h4>

        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <Package className="h-4 w-4 text-muted-foreground" />
            <div className="text-sm">
              <span className="font-semibold">{supply.currentStock}</span>{" "}
              {supply.unit}
              <span className="text-muted-foreground ml-2">(Hiện tại)</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            <div className="text-sm">
              <span>Tối thiểu: </span>
              <span className="font-semibold">
                {supply.minStock} {supply.unit}
              </span>
            </div>
          </div>
        </div>
      </div>

      <Separator />

      {/* Pricing Information */}
      <div className="space-y-3">
        <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
          Thông tin giá cả
        </h4>

        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <DollarSign className="h-4 w-4 text-muted-foreground" />
            <div className="text-sm">
              <span className="text-muted-foreground">Giá mua:</span>
              <span className="ml-2 font-semibold">
                {new Intl.NumberFormat("vi-VN", {
                  style: "currency",
                  currency: "VND",
                }).format(supply.purchasePrice)}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <DollarSign className="h-4 w-4 text-muted-foreground" />
            <div className="text-sm">
              <span className="text-muted-foreground">Giá bán:</span>
              <span className="ml-2 font-semibold">
                {new Intl.NumberFormat("vi-VN", {
                  style: "currency",
                  currency: "VND",
                }).format(supply.salePrice)}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
            <div className="text-sm">
              <span className="text-muted-foreground">Lợi nhuận:</span>
              <span className="ml-2 font-semibold">
                {Math.round(
                  ((supply.salePrice - supply.purchasePrice) /
                    supply.purchasePrice) *
                    100
                )}
                %
              </span>
            </div>
          </div>
        </div>
      </div>

      <Separator />

      {/* General Information */}
      <div className="space-y-3">
        <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
          Thông tin chung
        </h4>

        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <Package className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">{supply.category}</span>
          </div>

          {supply.description && (
            <div className="flex items-start gap-3">
              <FileText className="h-4 w-4 text-muted-foreground mt-0.5" />
              <p className="text-sm text-muted-foreground">
                {supply.description}
              </p>
            </div>
          )}

          {supply.supplierId && (
            <div className="flex items-center gap-3">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">
                {getSupplierName(supply.supplierId)}
              </span>
            </div>
          )}

          {supply.location && (
            <div className="flex items-center gap-3">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{supply.location}</span>
            </div>
          )}
        </div>
      </div>

      <Separator />

      {/* Timestamps */}
      <div className="space-y-3">
        <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
          Thông tin thời gian
        </h4>

        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <div className="text-sm">
              <span className="text-muted-foreground">Ngày tạo:</span>
              <span className="ml-2">{formatDate(supply.createdAt)}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <div className="text-sm">
              <span className="text-muted-foreground">Cập nhật cuối:</span>
              <span className="ml-2">{formatDate(supply.updatedAt)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const editFormContent = (
    <Form {...form}>
      <form
        noValidate
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-6"
      >
        {/* Basic Information Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-muted">
            <Package className="h-4 w-4 text-primary" />
            <h3 className="font-semibold text-sm text-primary">
              Thông tin cơ bản
            </h3>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tên vật tư *</FormLabel>
                  <FormControl>
                    <Input placeholder="Nhập tên vật tư" {...field} />
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

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Danh mục *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ví dụ: Điện tử, Vật liệu xây dựng..."
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
                    <Input placeholder="Ví dụ: cái, kg, lít..." {...field} />
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
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
                    <Input placeholder="Ví dụ: Kho A - Kệ 1" {...field} />
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
      </form>
    </Form>
  );

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent>
          <DrawerHeader className="text-left">
            <DrawerTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Chi tiết vật tư
            </DrawerTitle>
            <DrawerDescription>
              Thông tin chi tiết về vật tư trong hệ thống
            </DrawerDescription>
          </DrawerHeader>
          <div className="px-4 pb-4 max-h-[80vh] overflow-y-auto">
            {!isEditing ? detailsContent : editFormContent}
          </div>
          <div className="flex flex-col-reverse sm:flex-row gap-3 p-4 border-t">
            {!isEditing ? (
              <>
                <Button
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  className="flex-1"
                >
                  Đóng
                </Button>
                <Button onClick={() => setIsEditing(true)} className="flex-1">
                  <Edit3 className="mr-2 h-4 w-4" />
                  Chỉnh sửa
                </Button>
              </>
            ) : (
              <>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditing(false)}
                  className="flex-1"
                  disabled={loading}
                >
                  Hủy bỏ
                </Button>
                <Button
                  onClick={form.handleSubmit(onSubmit)}
                  disabled={loading}
                  className="flex-1"
                >
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {loading ? "Đang cập nhật..." : "Cập nhật vật tư"}
                </Button>
              </>
            )}
          </div>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Chi tiết vật tư
          </DialogTitle>
          <DialogDescription>
            Thông tin chi tiết về vật tư trong hệ thống
          </DialogDescription>
        </DialogHeader>
        {!isEditing ? detailsContent : editFormContent}
        <DialogFooter className="border-t pt-6">
          {!isEditing ? (
            <div className="flex flex-col-reverse sm:flex-row gap-3 w-full justify-end">
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="flex-1 sm:flex-none"
              >
                Đóng
              </Button>
              <Button
                onClick={() => setIsEditing(true)}
                className="flex-1 sm:flex-none"
              >
                <Edit3 className="mr-2 h-4 w-4" />
                Chỉnh sửa
              </Button>
            </div>
          ) : (
            <div className="flex flex-col-reverse sm:flex-row gap-3 w-full justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditing(false)}
                className="flex-1 sm:flex-none"
                disabled={loading}
              >
                Hủy bỏ
              </Button>
              <Button
                onClick={form.handleSubmit(onSubmit)}
                disabled={loading}
                className="flex-1 sm:flex-none"
              >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {loading ? "Đang cập nhật..." : "Cập nhật vật tư"}
              </Button>
            </div>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
