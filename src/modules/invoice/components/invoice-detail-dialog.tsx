import { useInvoiceDetail } from "../hooks/use-invoice";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency, formatDate } from "@/utils/format";
import {
  Building,
  Calendar,
  Receipt,
  Hash,
  TrendingUp,
  TrendingDown,
  User,
  Package,
} from "lucide-react";
import type { InputInvoice, OutputInvoice } from "../types";

interface InvoiceDetailDialogProps {
  invoiceId: string;
  invoiceType: "input" | "output";
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function InvoiceDetailDialog({
  invoiceId,
  invoiceType,
  open,
  onOpenChange,
}: InvoiceDetailDialogProps) {
  const { state } = useInvoiceDetail(invoiceId, invoiceType);

  const isInput = invoiceType === "input";
  const invoice = state.invoice as InputInvoice | OutputInvoice;

  if (state.loading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              <Skeleton className="h-6 w-40" />
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-20" />
              ))}
            </div>
            <Skeleton className="h-40" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (state.error || !invoice) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Lỗi</DialogTitle>
          </DialogHeader>
          <div className="text-center py-4">
            <p className="text-muted-foreground">
              {state.error || "Không tìm thấy hoá đơn"}
            </p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isInput ? (
              <>
                <TrendingDown className="h-5 w-5 text-red-600" />
                Chi tiết hoá đơn đầu vào
              </>
            ) : (
              <>
                <TrendingUp className="h-5 w-5 text-green-600" />
                Chi tiết hoá đơn đầu ra
              </>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Invoice Header Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                  <Hash className="h-4 w-4" />
                  Số hoá đơn
                </div>
                <div className="font-mono font-bold text-lg">
                  {invoice.invoiceNumber}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                  <Calendar className="h-4 w-4" />
                  Ngày hoá đơn
                </div>
                <div className="font-semibold">
                  {formatDate(invoice.invoiceDate)}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                  {isInput ? (
                    <>
                      <Building className="h-4 w-4" />
                      Nhà cung cấp
                    </>
                  ) : (
                    <>
                      <User className="h-4 w-4" />
                      Khách hàng
                    </>
                  )}
                </div>
                <div className="font-semibold">
                  {isInput
                    ? (invoice as InputInvoice).supplierName
                    : (invoice as OutputInvoice).customerName || "Khách lẻ"}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                  <Receipt className="h-4 w-4" />
                  Loại thuế
                </div>
                <Badge
                  variant={invoice.taxType === "taxed" ? "default" : "outline"}
                >
                  {invoice.taxType === "taxed" ? "Có thuế" : "Không thuế"}
                </Badge>
              </CardContent>
            </Card>
          </div>

          {/* Items Table */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Chi tiết mặt hàng
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-3 font-medium">STT</th>
                      <th className="text-left p-3 font-medium">
                        Tên hàng hóa
                      </th>
                      <th className="text-left p-3 font-medium">Mã</th>
                      <th className="text-right p-3 font-medium">Số lượng</th>
                      <th className="text-right p-3 font-medium">Đơn giá</th>
                      {isInput && (
                        <th className="text-right p-3 font-medium">VAT (%)</th>
                      )}
                      <th className="text-right p-3 font-medium">Thành tiền</th>
                    </tr>
                  </thead>
                  <tbody>
                    {isInput
                      ? (invoice as InputInvoice).items.map((item, index) => (
                          <tr
                            key={`${item.supplyId}-${index}`}
                            className="border-b"
                          >
                            <td className="p-3">{index + 1}</td>
                            <td className="p-3 font-medium">
                              {item.supplyName}
                            </td>
                            <td className="p-3 font-mono text-sm">
                              {item.sku}
                            </td>
                            <td className="p-3 text-right">
                              {item.quantity.toLocaleString("vi-VN")}
                            </td>
                            <td className="p-3 text-right">
                              {formatCurrency(item.unitPrice)}
                            </td>
                            <td className="p-3 text-right">{item.vatRate}%</td>
                            <td className="p-3 text-right font-semibold text-green-600">
                              {formatCurrency(item.totalPrice)}
                            </td>
                          </tr>
                        ))
                      : (invoice as OutputInvoice).items.map((item, index) => (
                          <tr
                            key={`${item.itemId}-${index}`}
                            className="border-b"
                          >
                            <td className="p-3">{index + 1}</td>
                            <td className="p-3 font-medium">{item.itemName}</td>
                            <td className="p-3 font-mono text-sm">
                              {item.itemCode}
                            </td>
                            <td className="p-3 text-right">
                              {item.quantity.toLocaleString("vi-VN")}
                            </td>
                            <td className="p-3 text-right">
                              {formatCurrency(item.unitPrice)}
                            </td>
                            <td className="p-3 text-right font-semibold text-green-600">
                              {formatCurrency(item.totalPrice)}
                            </td>
                          </tr>
                        ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Tổng kết</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Tổng tiền hàng:</span>
                  <span className="font-semibold">
                    {formatCurrency(invoice.subtotal)}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Thuế VAT:</span>
                  <span className="font-semibold text-orange-600">
                    {formatCurrency(invoice.vatAmount)}
                  </span>
                </div>

                <Separator />

                <div className="flex justify-between items-center text-lg">
                  <span className="font-semibold">Tổng cộng:</span>
                  <span className="font-bold text-green-600">
                    {formatCurrency(invoice.totalAmount)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notes */}
          {invoice.notes && (
            <Card>
              <CardHeader>
                <CardTitle>Ghi chú</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{invoice.notes}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
