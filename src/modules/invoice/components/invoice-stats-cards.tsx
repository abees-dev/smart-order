import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useInvoiceStats } from "../hooks/use-invoice";
import { formatCurrency } from "@/utils/format";
import {
  TrendingUp,
  TrendingDown,
  Receipt,
  FileText,
  DollarSign,
  Percent,
} from "lucide-react";

export function InvoiceStatsCards() {
  const { state } = useInvoiceStats();

  if (state.loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-7 w-24 mb-1" />
              <Skeleton className="h-3 w-16" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (state.error || !state.stats) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="text-center text-muted-foreground">
              Không thể tải thống kê
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { stats } = state;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Input Invoices */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Hoá đơn đầu vào</CardTitle>
          <TrendingDown className="h-4 w-4 text-red-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {stats.totalInputInvoices.toLocaleString()}
          </div>
          <div className="text-xs text-muted-foreground">
            {formatCurrency(stats.totalInputAmount)}
          </div>
          <div className="flex gap-1 mt-2">
            <Badge variant="secondary" className="text-xs">
              Có thuế: {formatCurrency(stats.taxedInputAmount)}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Output Invoices */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Hoá đơn đầu ra</CardTitle>
          <TrendingUp className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {stats.totalOutputInvoices.toLocaleString()}
          </div>
          <div className="text-xs text-muted-foreground">
            {formatCurrency(stats.totalOutputAmount)}
          </div>
          <div className="flex gap-1 mt-2">
            <Badge variant="default" className="text-xs">
              Có thuế: {formatCurrency(stats.taxedOutputAmount)}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* VAT Input */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">VAT đầu vào</CardTitle>
          <Receipt className="h-4 w-4 text-orange-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-600">
            {formatCurrency(stats.totalVatInput)}
          </div>
          <div className="text-xs text-muted-foreground">
            Thuế đầu vào được khấu trừ
          </div>
        </CardContent>
      </Card>

      {/* VAT Output */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">VAT đầu ra</CardTitle>
          <FileText className="h-4 w-4 text-blue-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">
            {formatCurrency(stats.totalVatOutput)}
          </div>
          <div className="text-xs text-muted-foreground">
            Thuế đầu ra phải nộp
          </div>
        </CardContent>
      </Card>

      {/* Net VAT */}
      <Card className="md:col-span-2 lg:col-span-2">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            VAT ròng phải nộp
          </CardTitle>
          <Percent className="h-4 w-4 text-purple-600" />
        </CardHeader>
        <CardContent>
          <div
            className={`text-2xl font-bold ${
              stats.totalVatOutput - stats.totalVatInput >= 0
                ? "text-orange-600"
                : "text-green-600"
            }`}
          >
            {formatCurrency(stats.totalVatOutput - stats.totalVatInput)}
          </div>
          <div className="text-xs text-muted-foreground">
            {stats.totalVatOutput - stats.totalVatInput >= 0
              ? "Cần nộp thêm VAT"
              : "Được hoàn thuế VAT"}
          </div>
          <div className="flex gap-2 mt-2">
            <div className="text-xs">
              <span className="text-muted-foreground">Đầu ra:</span>
              <span className="font-medium ml-1">
                {formatCurrency(stats.totalVatOutput)}
              </span>
            </div>
            <div className="text-xs">
              <span className="text-muted-foreground">Đầu vào:</span>
              <span className="font-medium ml-1">
                {formatCurrency(stats.totalVatInput)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Revenue Summary */}
      <Card className="md:col-span-2 lg:col-span-2">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Tổng quan doanh thu
          </CardTitle>
          <DollarSign className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">
            {formatCurrency(stats.totalOutputAmount - stats.totalInputAmount)}
          </div>
          <div className="text-xs text-muted-foreground">
            Lợi nhuận gộp (Doanh thu - Chi phí)
          </div>
          <div className="grid grid-cols-2 gap-4 mt-2">
            <div>
              <div className="text-xs text-muted-foreground">Doanh thu</div>
              <div className="font-medium text-green-600">
                {formatCurrency(stats.totalOutputAmount)}
              </div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Chi phí</div>
              <div className="font-medium text-red-600">
                {formatCurrency(stats.totalInputAmount)}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
