import { useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Package,
  Calendar,
  FileText,
  Building,
  Clock,
  CheckCircle,
  XCircle,
  DollarSign,
  Hash,
  MessageSquare,
  ArrowLeft,
  MoreHorizontal,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useSuppliersByIds } from "@/hooks/use-supplier-select";
import { useIsMobile } from "@/hooks/use-mobile";
import { useDocumentTitle } from "@/hooks/use-document-title";
import {
  useSupplyImportById,
  useSupplyImportActions,
} from "../hooks/use-supply";
import type { SupplyImport } from "../types";
import type { Timestamp } from "firebase/firestore";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

export function SupplyImportDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  useDocumentTitle();

  // Get supply import data
  const { importRecord, loading, error, refetch } = useSupplyImportById(
    id || ""
  );

  const {
    error: actionError,
    completeImport,
    cancelImport,
  } = useSupplyImportActions();

  // Get supplier information
  const supplierIds = useMemo(
    () => (importRecord ? [importRecord.supplierId] : []),
    [importRecord]
  );
  const { getSupplierName } = useSuppliersByIds(supplierIds);

  const handleBack = () => {
    navigate("/dashboard/supplies/imports");
  };

  const handleComplete = async () => {
    if (!importRecord) return;
    try {
      await completeImport(importRecord.id);
      refetch();
    } catch (error) {
      console.error("Failed to complete import:", error);
    }
  };

  const handleCancel = async () => {
    if (!importRecord) return;
    try {
      await cancelImport(importRecord.id);
      refetch();
    } catch (error) {
      console.error("Failed to cancel import:", error);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-200">
            <CheckCircle className="w-3 h-3 mr-1" />
            Đã hoàn thành
          </Badge>
        );
      case "cancelled":
        return (
          <Badge variant="destructive">
            <XCircle className="w-3 h-3 mr-1" />
            Đã hủy
          </Badge>
        );
      default:
        return (
          <Badge
            variant="outline"
            className="border-orange-200 text-orange-700"
          >
            <Clock className="w-3 h-3 mr-1" />
            Đang chờ
          </Badge>
        );
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const formatDate = (timestamp: Timestamp | Date | string | number) => {
    if (!timestamp) return "N/A";
    const date =
      timestamp && typeof timestamp === "object" && "toDate" in timestamp
        ? timestamp.toDate()
        : new Date(timestamp);
    return format(date, "dd/MM/yyyy HH:mm", { locale: vi });
  };

  if (loading) {
    return <SupplyImportDetailSkeleton />;
  }

  if (error || !importRecord) {
    return (
      <div className="container mx-auto p-4 space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={handleBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Quay lại
          </Button>
        </div>
        <Alert variant="destructive">
          <AlertDescription>
            {error || "Không tìm thấy phiếu nhập hàng"}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const totalQuantity = importRecord.items.reduce(
    (sum, item) => sum + item.quantity,
    0
  );
  const totalItems = importRecord.items.length;

  return (
    <div className="container mx-auto p-4 space-y-6 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col space-y-4">
        {/* Breadcrumb & Back Button */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={handleBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              {isMobile ? "" : "Quay lại"}
            </Button>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {importRecord.status === "pending" && (
                  <>
                    <DropdownMenuItem onClick={handleComplete}>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Hoàn thành
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={handleCancel}
                      className="text-red-600"
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Hủy phiếu
                    </DropdownMenuItem>
                  </>
                )}

                {importRecord.status !== "pending" && (
                  <div className="px-3 py-2 text-sm text-muted-foreground">
                    Không có hành động nào khả dụng
                  </div>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Title & Status */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">
              Chi tiết phiếu nhập hàng
            </h1>
            <p className="text-muted-foreground text-sm sm:text-base">
              {importRecord.invoiceNumber}
            </p>
          </div>
          {getStatusBadge(importRecord.status)}
        </div>
      </div>

      {actionError && (
        <Alert variant="destructive">
          <AlertDescription>{actionError}</AlertDescription>
        </Alert>
      )}

      {/* Content */}
      {isMobile ? (
        <MobileDetailView
          importRecord={importRecord}
          supplierName={getSupplierName(importRecord.supplierId)}
          formatCurrency={formatCurrency}
          formatDate={formatDate}
          totalQuantity={totalQuantity}
          totalItems={totalItems}
        />
      ) : (
        <DesktopDetailView
          importRecord={importRecord}
          supplierName={getSupplierName(importRecord.supplierId)}
          formatCurrency={formatCurrency}
          formatDate={formatDate}
          totalQuantity={totalQuantity}
          totalItems={totalItems}
        />
      )}
    </div>
  );
}

// Mobile Version
function MobileDetailView({
  importRecord,
  supplierName,
  formatCurrency,
  formatDate,
  totalQuantity,
  totalItems,
}: {
  importRecord: SupplyImport;
  supplierName: string | null;
  formatCurrency: (amount: number) => string;
  formatDate: (timestamp: Timestamp | Date | string | number) => string;
  totalQuantity: number;
  totalItems: number;
}) {
  return (
    <div className="space-y-4">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-3">
        <Card>
          <CardContent className="p-3">
            <div className="text-xs text-muted-foreground">Tổng giá trị</div>
            <div className="text-lg font-bold text-green-600">
              {formatCurrency(importRecord.totalAmount)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3">
            <div className="text-xs text-muted-foreground">Số mặt hàng</div>
            <div className="text-lg font-bold">{totalItems}</div>
          </CardContent>
        </Card>
      </div>

      {/* Basic Info */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Thông tin cơ bản
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Nhà cung cấp:</span>
            <span className="text-sm font-medium break-words max-w-[60%] text-right">
              {supplierName || "Chưa xác định"}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Ngày nhập:</span>
            <span className="text-sm font-medium">
              {formatDate(importRecord.importDate)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Tổng SL:</span>
            <span className="text-sm font-medium">
              {totalQuantity.toLocaleString("vi-VN")}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Notes */}
      {importRecord.notes && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Ghi chú
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm p-3 bg-muted rounded-lg">
              {importRecord.notes}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Items */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Package className="h-4 w-4" />
            Hàng hóa ({totalItems})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {importRecord.items.map((item, index) => (
            <Card
              key={`${item.supplyId}-${index}`}
              className="border-l-4 border-l-primary"
            >
              <CardContent className="p-3 space-y-2">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="font-medium text-sm">{item.supplyName}</div>
                    <div className="text-xs text-muted-foreground">
                      {item.sku}
                    </div>
                  </div>
                  <Badge variant="outline" className="ml-2 text-xs">
                    #{index + 1}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-muted-foreground">SL: </span>
                    <span className="font-semibold">
                      {item.quantity.toLocaleString("vi-VN")}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">VAT: </span>
                    <span className="font-semibold">{item.vatRate}%</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Đơn giá: </span>
                    <span className="font-semibold">
                      {formatCurrency(item.unitPrice)}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Thành tiền: </span>
                    <span className="font-semibold text-green-600">
                      {formatCurrency(item.totalPrice)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {/* Mobile Total */}
          <Card className="bg-muted/30 border-2 border-primary/20">
            <CardContent className="p-3">
              <div className="flex justify-between items-center">
                <span className="font-bold text-sm">Tổng cộng:</span>
                <div className="text-right">
                  <div className="font-bold text-sm">
                    {totalQuantity.toLocaleString("vi-VN")} sản phẩm
                  </div>
                  <div className="font-bold text-base text-green-600">
                    {formatCurrency(importRecord.totalAmount)}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </CardContent>
      </Card>

      {/* Timestamps */}
      <Card>
        <CardContent className="pt-4">
          <div className="grid grid-cols-1 gap-3 text-xs">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Ngày tạo:</span>
              <span className="font-medium">
                {formatDate(importRecord.createdAt)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Cập nhật:</span>
              <span className="font-medium">
                {formatDate(importRecord.updatedAt)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Desktop Version
function DesktopDetailView({
  importRecord,
  supplierName,
  formatCurrency,
  formatDate,
  totalQuantity,
  totalItems,
}: {
  importRecord: SupplyImport;
  supplierName: string | null;
  formatCurrency: (amount: number) => string;
  formatDate: (timestamp: Timestamp | Date | string | number) => string;
  totalQuantity: number;
  totalItems: number;
}) {
  return (
    <div className="grid grid-cols-12 gap-6">
      {/* Left Column - Main Content */}
      <div className="col-span-8 space-y-6">
        {/* Basic Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Thông tin phiếu nhập
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <Hash className="h-3 w-3" />
                  Số hóa đơn
                </div>
                <div className="font-semibold text-lg">
                  {importRecord.invoiceNumber}
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <Building className="h-3 w-3" />
                  Nhà cung cấp
                </div>
                <div className="font-semibold">
                  {supplierName || "Chưa xác định"}
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  Ngày nhập
                </div>
                <div className="font-semibold">
                  {formatDate(importRecord.importDate)}
                </div>
              </div>
            </div>

            {importRecord.notes && (
              <>
                <Separator className="my-6" />
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                    <MessageSquare className="h-3 w-3" />
                    Ghi chú
                  </div>
                  <div className="p-3 bg-muted rounded-lg text-sm">
                    {importRecord.notes}
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Items Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Danh sách hàng hóa ({totalItems} mặt hàng)
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="text-left p-4 font-medium">STT</th>
                    <th className="text-left p-4 font-medium">Tên hàng hóa</th>
                    <th className="text-left p-4 font-medium">SKU</th>
                    <th className="text-right p-4 font-medium">Số lượng</th>
                    <th className="text-right p-4 font-medium">Đơn giá</th>
                    <th className="text-right p-4 font-medium">VAT (%)</th>
                    <th className="text-right p-4 font-medium">Thành tiền</th>
                  </tr>
                </thead>
                <tbody>
                  {importRecord.items.map((item, index) => (
                    <tr key={`${item.supplyId}-${index}`} className="border-b">
                      <td className="p-4 text-sm">{index + 1}</td>
                      <td className="p-4">
                        <div className="font-medium">{item.supplyName}</div>
                      </td>
                      <td className="p-4 text-sm text-muted-foreground">
                        {item.sku}
                      </td>
                      <td className="p-4 text-right font-medium">
                        {item.quantity.toLocaleString("vi-VN")}
                      </td>
                      <td className="p-4 text-right">
                        {formatCurrency(item.unitPrice)}
                      </td>
                      <td className="p-4 text-right">{item.vatRate}%</td>
                      <td className="p-4 text-right font-semibold text-green-600">
                        {formatCurrency(item.totalPrice)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-primary/20 bg-muted/30">
                    <td colSpan={3} className="p-4 font-semibold">
                      Tổng cộng
                    </td>
                    <td className="p-4 text-right font-bold">
                      {totalQuantity.toLocaleString("vi-VN")}
                    </td>
                    <td colSpan={2}></td>
                    <td className="p-4 text-right font-bold text-lg text-green-600">
                      {formatCurrency(importRecord.totalAmount)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Right Column - Summary */}
      <div className="col-span-4 space-y-6">
        {/* Summary Stats */}
        <Card>
          <CardHeader>
            <CardTitle>Tổng quan</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <DollarSign className="h-3 w-3" />
                Tổng giá trị
              </div>
              <div className="font-semibold text-2xl text-green-600">
                {formatCurrency(importRecord.totalAmount)}
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <Package className="h-3 w-3" />
                Tổng số lượng
              </div>
              <div className="font-semibold text-xl">
                {totalQuantity.toLocaleString("vi-VN")}
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <FileText className="h-3 w-3" />
                Số mặt hàng
              </div>
              <div className="font-semibold text-xl">{totalItems}</div>
            </div>
          </CardContent>
        </Card>

        {/* Timestamps */}
        <Card>
          <CardHeader>
            <CardTitle>Thông tin thời gian</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1">
              <div className="font-medium text-muted-foreground text-sm">
                Ngày tạo
              </div>
              <div className="text-sm">
                {formatDate(importRecord.createdAt)}
              </div>
            </div>
            <div className="space-y-1">
              <div className="font-medium text-muted-foreground text-sm">
                Cập nhật lần cuối
              </div>
              <div className="text-sm">
                {formatDate(importRecord.updatedAt)}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Loading Skeleton
function SupplyImportDetailSkeleton() {
  return (
    <div className="container mx-auto p-4 space-y-6 max-w-7xl">
      <div className="flex items-center gap-4">
        <Skeleton className="h-8 w-20" />
        <Skeleton className="h-4 w-64" />
      </div>

      <div className="flex justify-between items-center">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-32" />
        </div>
        <Skeleton className="h-6 w-24" />
      </div>

      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-8 space-y-6">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-48" />
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-6">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-6 w-32" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-56" />
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="col-span-4 space-y-6">
          {Array.from({ length: 2 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-24" />
              </CardHeader>
              <CardContent className="space-y-4">
                {Array.from({ length: 3 }).map((_, j) => (
                  <div key={j} className="space-y-2">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-6 w-28" />
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
