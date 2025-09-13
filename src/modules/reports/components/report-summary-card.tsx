import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  TrendingUpIcon,
  TrendingDownIcon,
  DollarSignIcon,
  ReceiptIcon,
  AlertTriangleIcon,
  CheckCircleIcon,
} from "lucide-react";
import type { ReportSummary } from "../types";

interface ReportSummaryCardProps {
  summary: ReportSummary | null;
  loading?: boolean;
  period: string;
}

export function ReportSummaryCard({
  summary,
  loading,
  period,
}: ReportSummaryCardProps) {
  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!summary) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center py-8">
            <AlertTriangleIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Không có dữ liệu báo cáo</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const profitMargin =
    summary.totalOutputAmount > 0
      ? (summary.profit / summary.totalOutputAmount) * 100
      : 0;

  const netProfitMargin =
    summary.totalOutputAmount > 0
      ? (summary.netProfit / summary.totalOutputAmount) * 100
      : 0;

  const additionalCostRatio =
    summary.profit > 0 ? (summary.additionalCosts / summary.profit) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Tóm tắt báo cáo - {period}</span>
            <Badge variant={summary.netProfit >= 0 ? "default" : "destructive"}>
              {summary.netProfit >= 0 ? (
                <CheckCircleIcon className="h-4 w-4 mr-1" />
              ) : (
                <AlertTriangleIcon className="h-4 w-4 mr-1" />
              )}
              {summary.netProfit >= 0 ? "Có lãi" : "Thua lỗ"}
            </Badge>
          </CardTitle>
        </CardHeader>
      </Card>

      {/* Revenue & Expenses */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingDownIcon className="h-5 w-5 text-red-500" />
              Hóa đơn đầu vào
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">
                  Tổng giá trị
                </span>
                <span className="font-semibold">
                  {summary.totalInputAmount.toLocaleString("vi-VN")}₫
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">
                  VAT đầu vào
                </span>
                <span className="font-semibold">
                  {summary.totalInputVat.toLocaleString("vi-VN")}₫
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">
                  Số lượng hóa đơn
                </span>
                <Badge variant="secondary">
                  <ReceiptIcon className="h-3 w-3 mr-1" />
                  {summary.inputInvoiceCount}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUpIcon className="h-5 w-5 text-green-500" />
              Hóa đơn đầu ra
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">
                  Tổng giá trị
                </span>
                <span className="font-semibold">
                  {summary.totalOutputAmount.toLocaleString("vi-VN")}₫
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">
                  VAT đầu ra
                </span>
                <span className="font-semibold">
                  {summary.totalOutputVat.toLocaleString("vi-VN")}₫
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">
                  Số lượng hóa đơn
                </span>
                <Badge variant="secondary">
                  <ReceiptIcon className="h-3 w-3 mr-1" />
                  {summary.outputInvoiceCount}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Profit Analysis */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSignIcon className="h-5 w-5 text-blue-500" />
              Phân tích lợi nhuận
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Lợi nhuận gộp</span>
                  <span className="font-semibold">
                    {summary.profit.toLocaleString("vi-VN")}₫
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs text-muted-foreground">
                  <span>Tỷ suất lợi nhuận</span>
                  <span>{profitMargin.toFixed(1)}%</span>
                </div>
                <Progress
                  value={Math.max(0, Math.min(100, profitMargin))}
                  className="h-2"
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Chi phí phát sinh</span>
                  <span className="font-semibold text-orange-600">
                    {summary.additionalCosts.toLocaleString("vi-VN")}₫
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs text-muted-foreground">
                  <span>% của lợi nhuận gộp</span>
                  <span>{additionalCostRatio.toFixed(1)}%</span>
                </div>
                <Progress
                  value={Math.max(0, Math.min(100, additionalCostRatio))}
                  className="h-2"
                />
              </div>

              <div className="space-y-1 pt-2 border-t">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Lợi nhuận ròng</span>
                  <span
                    className={`font-bold ${
                      summary.netProfit >= 0 ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {summary.netProfit.toLocaleString("vi-VN")}₫
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs text-muted-foreground">
                  <span>Tỷ suất lợi nhuận ròng</span>
                  <span
                    className={
                      netProfitMargin >= 0 ? "text-green-600" : "text-red-600"
                    }
                  >
                    {netProfitMargin.toFixed(1)}%
                  </span>
                </div>
                <Progress
                  value={Math.max(0, Math.min(100, Math.abs(netProfitMargin)))}
                  className="h-2"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">VAT cần nộp</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">
                  VAT đầu ra
                </span>
                <span className="text-sm">
                  {summary.totalOutputVat.toLocaleString("vi-VN")}₫
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">
                  VAT đầu vào
                </span>
                <span className="text-sm">
                  -{summary.totalInputVat.toLocaleString("vi-VN")}₫
                </span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t">
                <span className="font-medium">VAT phải nộp</span>
                <span
                  className={`font-bold ${
                    summary.netVat >= 0 ? "text-orange-600" : "text-green-600"
                  }`}
                >
                  {summary.netVat.toLocaleString("vi-VN")}₫
                </span>
              </div>
              {summary.netVat < 0 && (
                <p className="text-xs text-green-600 mt-2">* Được hoàn VAT</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Hiệu suất hoạt động</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">
                  {summary.inputInvoiceCount + summary.outputInvoiceCount}
                </div>
                <p className="text-xs text-muted-foreground">Tổng số hóa đơn</p>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Hóa đơn đầu vào</span>
                  <span>{summary.inputInvoiceCount}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Hóa đơn đầu ra</span>
                  <span>{summary.outputInvoiceCount}</span>
                </div>
              </div>

              <div className="pt-2 border-t">
                <div className="text-center">
                  <div className="text-lg font-semibold">
                    {summary.outputInvoiceCount > 0
                      ? (
                          summary.totalOutputAmount / summary.outputInvoiceCount
                        ).toLocaleString("vi-VN")
                      : "0"}
                    ₫
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Giá trị TB/hóa đơn ra
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
