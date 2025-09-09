import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Loader2,
  Edit3,
  Package,
  MapPin,
  AlertTriangle,
  DollarSign,
  Info,
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
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SupplierSelectField } from "@/components/forms";
import { useSupplyActions } from "../hooks/use-supply";
import { useSuppliersByIds } from "@/hooks/use-supplier-select";
import { updateSupplySchema, type UpdateSupplyFormData } from "../validation";
import type { Supply } from "../types";

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
          maxStock: supply.maxStock,
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

  if (!supply) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[85vh] overflow-y-auto">
        <DialogHeader className="pb-6 border-b">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div className="space-y-2">
              <DialogTitle className="flex items-center gap-3 text-xl">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Package className="h-6 w-6 text-primary" />
                </div>
                {supply.name}
              </DialogTitle>
              <DialogDescription className="text-sm">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono bg-muted px-2 py-1 rounded text-xs">
                    {supply.sku}
                  </span>
                  <span>•</span>
                  <Badge variant="secondary" className="text-xs">
                    {supply.category}
                  </Badge>
                  {supply.location && (
                    <>
                      <span>•</span>
                      <span className="flex items-center gap-1 text-xs">
                        <MapPin className="h-3 w-3" />
                        {supply.location}
                      </span>
                    </>
                  )}
                </div>
              </DialogDescription>
            </div>
            <div className="flex items-center gap-2">
              {stockStatus && (
                <Badge
                  variant={stockStatus.color}
                  className="flex items-center gap-1 px-3 py-1"
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
              {!isEditing && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-1"
                >
                  <Edit3 className="h-4 w-4" />
                  Chỉnh sửa
                </Button>
              )}
            </div>
          </div>
        </DialogHeader>

        {!isEditing ? (
          <div className="space-y-6">
            {/* Enhanced Stock Information */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="border-l-4 border-l-blue-500">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Package className="h-5 w-5 text-blue-600" />
                    Thông tin tồn kho
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <p className="text-sm text-blue-600 font-medium mb-1">
                        Tồn kho hiện tại
                      </p>
                      <p className="text-3xl font-bold text-blue-700">
                        {supply.currentStock}
                      </p>
                      <p className="text-sm text-blue-600">{supply.unit}</p>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">
                          Tối thiểu:
                        </span>
                        <span className="font-semibold">
                          {supply.minStock} {supply.unit}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">
                          Tối đa:
                        </span>
                        <span className="font-semibold">
                          {supply.maxStock} {supply.unit}
                        </span>
                      </div>
                      <div className="w-full">
                        <div className="flex justify-between text-xs text-muted-foreground mb-1">
                          <span>0</span>
                          <span>{supply.maxStock}</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-3">
                          <div
                            className={`h-3 rounded-full transition-all ${
                              supply.currentStock / supply.maxStock <= 0.2
                                ? "bg-red-500"
                                : supply.currentStock / supply.maxStock <= 0.5
                                ? "bg-yellow-500"
                                : "bg-green-500"
                            }`}
                            style={{
                              width: `${Math.min(
                                (supply.currentStock / supply.maxStock) * 100,
                                100
                              )}%`,
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-green-500">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-green-600" />
                    Thông tin giá cả
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                      <span className="text-sm font-medium text-red-600">
                        Giá mua:
                      </span>
                      <span className="text-lg font-bold text-red-700">
                        {new Intl.NumberFormat("vi-VN", {
                          style: "currency",
                          currency: "VND",
                        }).format(supply.purchasePrice)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                      <span className="text-sm font-medium text-green-600">
                        Giá bán:
                      </span>
                      <span className="text-lg font-bold text-green-700">
                        {new Intl.NumberFormat("vi-VN", {
                          style: "currency",
                          currency: "VND",
                        }).format(supply.salePrice)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                      <span className="text-sm font-medium text-purple-600">
                        Lợi nhuận:
                      </span>
                      <span className="text-lg font-bold text-purple-700">
                        {Math.round(
                          ((supply.salePrice - supply.purchasePrice) /
                            supply.purchasePrice) *
                            100
                        )}
                        %
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                      <span className="text-sm font-medium text-blue-600">
                        Giá trị kho:
                      </span>
                      <span className="text-lg font-bold text-blue-700">
                        {new Intl.NumberFormat("vi-VN", {
                          style: "currency",
                          currency: "VND",
                        }).format(supply.currentStock * supply.purchasePrice)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* General Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Thông tin chung</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {supply.description && (
                  <div>
                    <p className="text-sm text-muted-foreground">Mô tả</p>
                    <p className="text-sm">{supply.description}</p>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {supply.supplierId && (
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Nhà cung cấp
                      </p>
                      <p className="text-sm">
                        {getSupplierName(supply.supplierId)}
                      </p>
                    </div>
                  )}

                  {supply.location && (
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Vị trí lưu trữ
                      </p>
                      <p className="text-sm">{supply.location}</p>
                    </div>
                  )}
                </div>

                <div>
                  <p className="text-sm text-muted-foreground">Trạng thái</p>
                  <Badge variant={supply.isActive ? "default" : "outline"}>
                    {supply.isActive ? "Đang hoạt động" : "Ngừng hoạt động"}
                  </Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-muted-foreground">
                  <div>
                    <p>
                      Ngày tạo:{" "}
                      {supply.createdAt.toDate().toLocaleDateString("vi-VN")}
                    </p>
                  </div>
                  <div>
                    <p>
                      Cập nhật cuối:{" "}
                      {supply.updatedAt.toDate().toLocaleDateString("vi-VN")}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  render={({ field }) => (
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
                        placeholder="Mô tả chi tiết về vật tư..."
                        rows={3}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Danh mục *</FormLabel>
                      <FormControl>
                        <Input placeholder="Ví dụ: Văn phòng phẩm" {...field} />
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
                        <Input placeholder="Ví dụ: cái, kg, lít" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
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
                  name="maxStock"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tồn kho tối đa *</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="1"
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
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="purchasePrice"
                  render={({ field }) => (
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
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="salePrice"
                  render={({ field }) => (
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
                      <FormMessage />
                    </FormItem>
                  )}
                />
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
                        <Input placeholder="Ví dụ: Kho A - Kệ 1" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {error && (
                <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
                  {error}
                </div>
              )}
            </form>
          </Form>
        )}

        <DialogFooter>
          {!isEditing ? (
            <>
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Đóng
              </Button>
              <Button onClick={() => setIsEditing(true)}>
                <Edit3 className="mr-2 h-4 w-4" />
                Chỉnh sửa
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={() => setIsEditing(false)}>
                Hủy
              </Button>
              <Button onClick={form.handleSubmit(onSubmit)} disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Cập nhật
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
