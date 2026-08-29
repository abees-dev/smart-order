import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Pencil,
  CopyPlus,
  Trash2,
  Package,
  DollarSign,
  Box,
  Calendar,
  Info,
  TrendingUp,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { useDocumentTitle } from "@/hooks/use-document-title";
import { PermissionGuard, usePermissions } from "@/components/guards";
import { Actions, Resources } from "@/constants";
import { PRODUCT_CATEGORIES_MAP } from "@/constants/category";
import { formatDate } from "@/utils";

import { useProduct } from "../hooks/use-product";
import { useDuplicateProduct } from "../hooks/use-product-actions";
import { ProductFormDialog } from "./product-form-dialog";
import { DeleteProductDialog } from "./delete-product-dialog";

export function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { hasPermission } = usePermissions();

  useDocumentTitle();

  const { product, loading, error } = useProduct(id);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const { duplicateProduct, loading: duplicating } = useDuplicateProduct({
    onSuccess: () => {
      toast.success("Nhân bản sản phẩm thành công");
      navigate("/dashboard/products");
    },
    onError: (err) => {
      toast.error("Lỗi khi nhân bản sản phẩm: " + err.message);
    },
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const handleBack = () => {
    navigate("/dashboard/products");
  };

  const handleDuplicate = () => {
    if (product?.id) {
      duplicateProduct(product.id);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-4 lg:p-6 space-y-6 max-w-7xl">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10 rounded-lg" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Skeleton className="h-48 w-full rounded-xl" />
            <Skeleton className="h-64 w-full rounded-xl" />
          </div>
          <div className="space-y-6">
            <Skeleton className="h-40 w-full rounded-xl" />
            <Skeleton className="h-32 w-full rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="container mx-auto p-4 lg:p-6 space-y-6 max-w-7xl">
        <Button variant="ghost" onClick={handleBack} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Quay lại danh sách sản phẩm
        </Button>
        <Alert variant="destructive">
          <AlertDescription>
            {error || "Không tìm thấy sản phẩm yêu cầu"}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const cost = product.cost || 0;
  const margin = product.price - cost;
  const marginPercent = cost > 0 ? ((margin / cost) * 100).toFixed(1) : "N/A";

  return (
    <PermissionGuard
      resource={Resources.PRODUCTS}
      action={Actions.DETAIL}
      fallback={
        <div className="container mx-auto p-4 lg:p-6">
          <Alert variant="destructive">
            <AlertDescription>
              Bạn không có quyền xem chi tiết sản phẩm này.
            </AlertDescription>
          </Alert>
        </div>
      }
    >
      <div className="container mx-auto p-4 lg:p-6 space-y-6 max-w-7xl">
        {/* Top Navigation & Action Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="icon"
              onClick={handleBack}
              title="Quay lại danh sách sản phẩm"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl font-bold tracking-tight text-foreground">
                  {product.name}
                </h1>
                <Badge variant={product.isActive ? "default" : "secondary"}>
                  {product.isActive ? "Đang hoạt động" : "Tạm dừng"}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground flex items-center gap-2 mt-0.5">
                Mã SP:{" "}
                <span className="font-mono bg-muted px-2 py-0.5 rounded text-foreground font-medium">
                  {product.productCode}
                </span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto flex-wrap">
            {hasPermission(Resources.PRODUCTS, Actions.CREATE) && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleDuplicate}
                disabled={duplicating}
                className="gap-2"
              >
                <CopyPlus className="h-4 w-4" />
                <span>Nhân bản</span>
              </Button>
            )}
            {hasPermission(Resources.PRODUCTS, Actions.CREATE) && (
              <Button
                variant="default"
                size="sm"
                onClick={() => setShowEditDialog(true)}
                className="gap-2"
              >
                <Pencil className="h-4 w-4" />
                <span>Chỉnh sửa</span>
              </Button>
            )}
            {hasPermission(Resources.PRODUCTS, Actions.DELETE) && (
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setShowDeleteDialog(true)}
                className="gap-2"
              >
                <Trash2 className="h-4 w-4" />
                <span>Xóa</span>
              </Button>
            )}
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Details & Supplies */}
          <div className="lg:col-span-2 space-y-6">
            {/* General Information Card */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2 text-primary">
                  <Info className="h-5 w-5" />
                  Thông tin cơ bản
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Tên sản phẩm</p>
                    <p className="font-medium text-foreground">{product.name}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Mã sản phẩm</p>
                    <p className="font-mono font-medium text-foreground">
                      {product.productCode}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Danh mục</p>
                    <Badge variant="secondary">
                      {PRODUCT_CATEGORIES_MAP[product.category] || product.category}
                    </Badge>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Trạng thái kinh doanh</p>
                    <Badge
                      variant={product.isActive ? "default" : "outline"}
                      className="w-fit"
                    >
                      {product.isActive ? "Đang hoạt động" : "Tạm dừng"}
                    </Badge>
                  </div>
                </div>

                {product.description && (
                  <div className="space-y-2 pt-2 border-t">
                    <p className="text-sm text-muted-foreground font-medium">
                      Mô tả chi tiết
                    </p>
                    <div className="border rounded-lg p-4 bg-muted/30 prose prose-sm max-w-none dark:prose-invert">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {product.description}
                      </ReactMarkdown>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Supplies / Bill of Materials (BOM) */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2 text-primary">
                    <Box className="h-5 w-5" />
                    Vật tư sản xuất (Định mức)
                  </CardTitle>
                  <Badge variant="outline" className="font-medium">
                    {product.supplies?.length || 0} vật tư
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                {product.supplies && product.supplies.length > 0 ? (
                  <div className="divide-y border rounded-lg overflow-hidden">
                    <div className="bg-muted/50 grid grid-cols-12 px-4 py-2 text-xs font-semibold text-muted-foreground">
                      <div className="col-span-6">Tên vật tư</div>
                      <div className="col-span-3 text-center">Đơn vị</div>
                      <div className="col-span-3 text-right">Số lượng cần</div>
                    </div>
                    {product.supplies.map((supply, idx) => (
                      <div
                        key={idx}
                        className="grid grid-cols-12 px-4 py-3 items-center hover:bg-muted/20 transition-colors text-sm"
                      >
                        <div className="col-span-6 flex items-center gap-3">
                          <Package className="h-4 w-4 text-muted-foreground shrink-0" />
                          <span className="font-medium">{supply.supplyName}</span>
                        </div>
                        <div className="col-span-3 text-center text-muted-foreground">
                          {supply.unit}
                        </div>
                        <div className="col-span-3 text-right font-semibold text-foreground">
                          {supply.quantity} {supply.unit}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground border border-dashed rounded-lg">
                    <Box className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>Sản phẩm này chưa cấu hình vật tư sản xuất.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Pricing & Timestamps */}
          <div className="space-y-6">
            {/* Pricing Information Card */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2 text-primary">
                  <DollarSign className="h-5 w-5" />
                  Thông tin giá & Lợi nhuận
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20 space-y-1">
                  <p className="text-xs font-medium text-green-600 dark:text-green-400">
                    Giá bán
                  </p>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {formatCurrency(product.price)}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-lg bg-muted/50 border space-y-1">
                    <p className="text-xs text-muted-foreground">Giá vốn (Cost)</p>
                    <p className="text-lg font-semibold text-foreground">
                      {cost > 0 ? formatCurrency(cost) : "Chưa có"}
                    </p>
                  </div>

                  <div className="p-3 rounded-lg bg-muted/50 border space-y-1">
                    <p className="text-xs text-muted-foreground">Lợi nhuận gộp</p>
                    <p className="text-lg font-semibold text-blue-600 dark:text-blue-400">
                      {cost > 0 ? formatCurrency(margin) : "N/A"}
                    </p>
                  </div>
                </div>

                {cost > 0 && (
                  <div className="flex items-center justify-between p-3 rounded-lg bg-blue-500/10 border border-blue-500/20 text-sm">
                    <span className="flex items-center gap-1.5 text-blue-700 dark:text-blue-300 font-medium">
                      <TrendingUp className="h-4 w-4" />
                      Tỷ suất lợi nhuận
                    </span>
                    <span className="font-bold text-blue-700 dark:text-blue-300">
                      {marginPercent}%
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* System Timestamps */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2 text-primary">
                  <Calendar className="h-5 w-5" />
                  Lịch sử hệ thống
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex justify-between items-center py-1 border-b">
                  <span className="text-muted-foreground">Ngày tạo:</span>
                  <span className="font-medium">{formatDate(product.createdAt)}</span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-muted-foreground">Cập nhật lần cuối:</span>
                  <span className="font-medium">{formatDate(product.updatedAt)}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Edit Dialog */}
        {showEditDialog && (
          <ProductFormDialog
            open={showEditDialog}
            onOpenChange={setShowEditDialog}
            product={product}
            mode="edit"
            onSuccess={() => {
              setShowEditDialog(false);
              toast.success("Cập nhật sản phẩm thành công");
              window.location.reload();
            }}
          />
        )}

        {/* Delete Dialog */}
        {showDeleteDialog && (
          <DeleteProductDialog
            open={showDeleteDialog}
            onOpenChange={setShowDeleteDialog}
            product={product}
            onSuccess={() => {
              setShowDeleteDialog(false);
              toast.success("Xóa sản phẩm thành công");
              navigate("/dashboard/products");
            }}
          />
        )}
      </div>
    </PermissionGuard>
  );
}

export default ProductDetailPage;
