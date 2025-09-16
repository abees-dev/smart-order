import {
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

import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useIsMobile } from "@/hooks/use-mobile";
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
}: SupplyDetailDialogProps) {
  const isMobile = useIsMobile();

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
                {/* {getSupplierName(supply.supplierId)} */}
                {supply.supplier?.name || "Chưa có"}
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
            {detailsContent}
          </div>
          <div className="flex flex-col-reverse sm:flex-row gap-3 p-4 border-t">
            <>
              <Button type="button" variant="outline" className="flex-1">
                Hủy bỏ
              </Button>
            </>
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
        {detailsContent}
        <DialogFooter className="border-t pt-6">
          <div className="flex flex-col-reverse sm:flex-row gap-3 w-full justify-end">
            <Button
              type="button"
              variant="outline"
              className="flex-1 sm:flex-none"
              onClick={() => onOpenChange(false)}
            >
              Hủy bỏ
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
