import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Edit3, Package } from "lucide-react";
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
import { useSupplyActions } from "../hooks/use-supply";
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
          supplier: supply.supplier || "",
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
      <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                {supply.name}
              </DialogTitle>
              <DialogDescription>
                Mã SKU: {supply.sku} • Danh mục: {supply.category}
              </DialogDescription>
            </div>
            {stockStatus && (
              <Badge variant={stockStatus.color}>{stockStatus.label}</Badge>
            )}
          </div>
        </DialogHeader>

        {!isEditing ? (
          <div className="space-y-6">
            {/* Stock Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Thông tin tồn kho</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Tồn kho hiện tại
                    </p>
                    <p className="text-2xl font-bold">
                      {supply.currentStock} {supply.unit}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Tối thiểu</p>
                    <p className="text-lg font-semibold">
                      {supply.minStock} {supply.unit}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Tối đa</p>
                    <p className="text-lg font-semibold">
                      {supply.maxStock} {supply.unit}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Giá mua</p>
                    <p className="text-lg font-semibold text-red-600">
                      {new Intl.NumberFormat("vi-VN", {
                        style: "currency",
                        currency: "VND",
                      }).format(supply.purchasePrice)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Giá bán</p>
                    <p className="text-lg font-semibold text-green-600">
                      {new Intl.NumberFormat("vi-VN", {
                        style: "currency",
                        currency: "VND",
                      }).format(supply.salePrice)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

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
                  {supply.supplier && (
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Nhà cung cấp
                      </p>
                      <p className="text-sm">{supply.supplier}</p>
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
                  name="supplier"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nhà cung cấp</FormLabel>
                      <FormControl>
                        <Input placeholder="Tên nhà cung cấp" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
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
