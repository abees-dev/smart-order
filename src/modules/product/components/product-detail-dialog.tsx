import {
  Edit,
  Trash2,
  Package,
  DollarSign,
  Box,
  Calendar,
  Info,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Product } from "../types";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface ProductDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: Product | null;
  onEdit?: () => void;
  onDelete?: () => void;
}

export function ProductDetailDialog({
  open,
  onOpenChange,
  product,
  onEdit,
  onDelete,
}: ProductDetailDialogProps) {
  if (!product) return null;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const formatDate = (date: { toDate: () => Date }) => {
    return date.toDate().toLocaleString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <DialogTitle className="text-xl">{product.name}</DialogTitle>
          </div>
        </DialogHeader>

        <div className="space-y-6 lg:space-y-8">
          {/* Basic Information Section */}
          <div className="space-y-3 lg:space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-muted">
              <Info className="h-3 w-3 lg:h-4 lg:w-4 text-primary" />
              <h3 className="font-semibold text-sm text-primary">
                Thông tin cơ bản
              </h3>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 lg:gap-4">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Danh mục</p>
                <Badge variant="secondary" className="w-fit">
                  {product.category}
                </Badge>
              </div>

              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Trạng thái</p>
                <Badge
                  variant={product.isActive ? "default" : "secondary"}
                  className="w-fit"
                >
                  {product.isActive ? "Đang hoạt động" : "Tạm dừng"}
                </Badge>
              </div>
            </div>

            {product.description && (
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Mô tả sản phẩm</p>
                <div className="border rounded-lg p-4 bg-muted/50 prose prose-sm max-w-none">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {product.description}
                  </ReactMarkdown>
                </div>
              </div>
            )}
          </div>

          {/* Pricing Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-muted">
              <DollarSign className="h-4 w-4 text-primary" />
              <h3 className="font-semibold text-sm text-primary">
                Thông tin giá cả
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Giá bán</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(product.price)}
                </p>
              </div>

              {product.cost && (
                <>
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Giá vốn</p>
                    <p className="text-xl font-semibold text-orange-600">
                      {formatCurrency(product.cost)}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Lợi nhuận</p>
                    <div>
                      <p className="text-xl font-bold text-blue-600">
                        {formatCurrency(product.price - product.cost)}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        (
                        {(
                          ((product.price - product.cost) / product.cost) *
                          100
                        ).toFixed(1)}
                        %)
                      </p>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Supplies Section */}
          {product.supplies && product.supplies.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-muted">
                <Box className="h-4 w-4 text-primary" />
                <h3 className="font-semibold text-sm text-primary">
                  Vật tư sản xuất
                </h3>
                <Badge variant="outline" className="text-xs">
                  {product.supplies.length} vật tư
                </Badge>
              </div>

              <div className="grid gap-3">
                {product.supplies.map((supply, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 border rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Package className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{supply.supplyName}</p>
                        <p className="text-sm text-muted-foreground">
                          Đơn vị: {supply.unit}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg">{supply.quantity}</p>
                      <p className="text-sm text-muted-foreground">
                        {supply.unit}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Timestamps Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-muted">
              <Calendar className="h-4 w-4 text-primary" />
              <h3 className="font-semibold text-sm text-primary">
                Lịch sử thay đổi
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="space-y-1">
                <p className="text-muted-foreground">Ngày tạo</p>
                <p className="font-medium">{formatDate(product.createdAt)}</p>
              </div>
              <div className="space-y-1">
                <p className="text-muted-foreground">Cập nhật lần cuối</p>
                <p className="font-medium">{formatDate(product.updatedAt)}</p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
            <div className="flex gap-3 flex-1">
              {onEdit && (
                <Button onClick={onEdit} className="flex-1 sm:flex-initial">
                  <Edit className="h-4 w-4 mr-2" />
                  Chỉnh sửa
                </Button>
              )}
              {onDelete && (
                <Button
                  variant="destructive"
                  onClick={onDelete}
                  className="flex-1 sm:flex-initial"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Xóa
                </Button>
              )}
            </div>
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="sm:w-auto"
            >
              Đóng
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
