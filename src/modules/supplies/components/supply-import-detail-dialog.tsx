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
  Printer,
  X,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useIsMobile } from "@/hooks/use-mobile";
import type { SupplyImport } from "../types";
import type { Timestamp } from "firebase/firestore";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

interface SupplyImportDetailDialogProps {
  importRecord: SupplyImport | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SupplyImportDetailDialog({
  importRecord,
  open,
  onOpenChange,
}: SupplyImportDetailDialogProps) {
  const isMobile = useIsMobile();

  if (!importRecord) return null;

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

  const totalQuantity = importRecord.items.reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  const totalItems = importRecord.items.length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={`${
          isMobile ? "max-w-[95vw] max-h-[95vh] p-4" : "max-w-4xl max-h-[90vh]"
        }`}
      >
        <DialogHeader>
          <DialogTitle
            className={`flex items-center gap-2 ${
              isMobile ? "text-lg" : "text-xl"
            }`}
          >
            <Package className={`${isMobile ? "h-4 w-4" : "h-5 w-5"}`} />
            Chi tiết phiếu nhập hàng
          </DialogTitle>
        </DialogHeader>

        <div
          className={`${
            isMobile
              ? "max-h-[calc(95vh-6rem)] overflow-y-auto"
              : "max-h-[calc(90vh-8rem)] overflow-y-auto"
          }`}
        >
          <div className={`space-y-4 ${isMobile ? "" : "pr-4"}`}>
            {/* Header Info */}
            <Card>
              <CardHeader className={`${isMobile ? "pb-3" : "pb-4"}`}>
                <CardTitle
                  className={`flex ${
                    isMobile ? "flex-col gap-2" : "items-center justify-between"
                  } ${isMobile ? "text-base" : "text-lg"}`}
                >
                  <span className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Thông tin phiếu nhập
                  </span>
                  {getStatusBadge(importRecord.status)}
                </CardTitle>
              </CardHeader>
              <CardContent className={`space-y-${isMobile ? "3" : "4"}`}>
                <div
                  className={`grid grid-cols-1 ${
                    isMobile ? "gap-3" : "md:grid-cols-2 lg:grid-cols-3 gap-4"
                  }`}
                >
                  <div className="space-y-2">
                    <div
                      className={`flex items-center gap-2 ${
                        isMobile ? "text-xs" : "text-sm"
                      } font-medium text-muted-foreground`}
                    >
                      <Hash className="h-3 w-3" />
                      Số hóa đơn
                    </div>
                    <div
                      className={`font-semibold ${
                        isMobile ? "text-base" : "text-lg"
                      }`}
                    >
                      {importRecord.invoiceNumber}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div
                      className={`flex items-center gap-2 ${
                        isMobile ? "text-xs" : "text-sm"
                      } font-medium text-muted-foreground`}
                    >
                      <Building className="h-3 w-3" />
                      Nhà cung cấp
                    </div>
                    <div className="font-semibold break-words">
                      {/* {getSupplierName(importRecord.supplierId)} */}
                      {importRecord.supplierId || "Chưa có"}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div
                      className={`flex items-center gap-2 ${
                        isMobile ? "text-xs" : "text-sm"
                      } font-medium text-muted-foreground`}
                    >
                      <Calendar className="h-3 w-3" />
                      Ngày nhập
                    </div>
                    <div className="font-semibold">
                      {formatDate(importRecord.importDate)}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div
                      className={`flex items-center gap-2 ${
                        isMobile ? "text-xs" : "text-sm"
                      } font-medium text-muted-foreground`}
                    >
                      <DollarSign className="h-3 w-3" />
                      Tổng giá trị
                    </div>
                    <div
                      className={`font-semibold ${
                        isMobile ? "text-base" : "text-lg"
                      } text-green-600`}
                    >
                      {formatCurrency(importRecord.totalAmount)}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div
                      className={`flex items-center gap-2 ${
                        isMobile ? "text-xs" : "text-sm"
                      } font-medium text-muted-foreground`}
                    >
                      <Package className="h-3 w-3" />
                      Tổng số lượng
                    </div>
                    <div className="font-semibold">
                      {totalQuantity.toLocaleString("vi-VN")}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div
                      className={`flex items-center gap-2 ${
                        isMobile ? "text-xs" : "text-sm"
                      } font-medium text-muted-foreground`}
                    >
                      <FileText className="h-3 w-3" />
                      Số mặt hàng
                    </div>
                    <div className="font-semibold">{totalItems}</div>
                  </div>
                </div>

                {importRecord.notes && (
                  <>
                    <Separator />
                    <div className="space-y-2">
                      <div
                        className={`flex items-center gap-2 ${
                          isMobile ? "text-xs" : "text-sm"
                        } font-medium text-muted-foreground`}
                      >
                        <MessageSquare className="h-3 w-3" />
                        Ghi chú
                      </div>
                      <div
                        className={`p-3 bg-muted rounded-lg ${
                          isMobile ? "text-xs" : "text-sm"
                        }`}
                      >
                        {importRecord.notes}
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Items List */}
            <Card>
              <CardHeader>
                <CardTitle
                  className={`flex items-center gap-2 ${
                    isMobile ? "text-base" : "text-lg"
                  }`}
                >
                  <Package className="h-4 w-4" />
                  Danh sách hàng hóa ({totalItems} mặt hàng)
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {isMobile ? (
                  // Mobile: Card-based layout
                  <div className="space-y-3 p-4">
                    {importRecord.items.map((item, index) => (
                      <Card
                        key={`${item.supplyId}-${index}`}
                        className="border-l-4 border-l-primary"
                      >
                        <CardContent className="p-3 space-y-2">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="font-medium text-sm">
                                {item.supplyName}
                              </div>
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
                              <span className="text-muted-foreground">
                                Số lượng:{" "}
                              </span>
                              <span className="font-semibold">
                                {item.quantity.toLocaleString("vi-VN")}
                              </span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">
                                VAT:{" "}
                              </span>
                              <span className="font-semibold">
                                {item.vatRate}%
                              </span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">
                                Đơn giá:{" "}
                              </span>
                              <span className="font-semibold">
                                {formatCurrency(item.unitPrice)}
                              </span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">
                                Thành tiền:{" "}
                              </span>
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
                  </div>
                ) : (
                  // Desktop: Table layout
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b bg-muted/50">
                          <th className="text-left p-4 font-medium">STT</th>
                          <th className="text-left p-4 font-medium">
                            Tên hàng hóa
                          </th>
                          <th className="text-left p-4 font-medium">SKU</th>
                          <th className="text-right p-4 font-medium">
                            Số lượng
                          </th>
                          <th className="text-right p-4 font-medium">
                            Đơn giá
                          </th>
                          <th className="text-right p-4 font-medium">
                            VAT (%)
                          </th>
                          <th className="text-right p-4 font-medium">
                            Thành tiền
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {importRecord.items.map((item, index) => (
                          <tr
                            key={`${item.supplyId}-${index}`}
                            className="border-b"
                          >
                            <td className="p-4 text-sm">{index + 1}</td>
                            <td className="p-4">
                              <div className="font-medium">
                                {item.supplyName}
                              </div>
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
                )}
              </CardContent>
            </Card>

            {/* Timestamps */}
            <Card>
              <CardContent className={`${isMobile ? "pt-4" : "pt-6"}`}>
                <div
                  className={`grid grid-cols-1 ${
                    isMobile ? "gap-3" : "md:grid-cols-2 gap-4"
                  } ${isMobile ? "text-xs" : "text-sm"}`}
                >
                  <div className="space-y-1">
                    <div className="font-medium text-muted-foreground">
                      Ngày tạo
                    </div>
                    <div className={isMobile ? "text-sm" : ""}>
                      {formatDate(importRecord.createdAt)}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="font-medium text-muted-foreground">
                      Cập nhật lần cuối
                    </div>
                    <div className={isMobile ? "text-sm" : ""}>
                      {formatDate(importRecord.updatedAt)}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div
          className={`flex ${
            isMobile ? "flex-col-reverse gap-2" : "justify-end gap-2"
          } pt-4 border-t`}
        >
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className={isMobile ? "w-full" : ""}
          >
            {isMobile && <X className="h-4 w-4 mr-2" />}
            Đóng
          </Button>
          <Button
            onClick={() => {
              // TODO: Implement print functionality
              console.log("Print import:", importRecord.id);
            }}
            className={isMobile ? "w-full" : ""}
          >
            {isMobile && <Printer className="h-4 w-4 mr-2" />}
            In phiếu nhập
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
