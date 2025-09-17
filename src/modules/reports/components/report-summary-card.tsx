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
  FileTextIcon,
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
      {/* Enhanced Header */}
      <Card className="border-l-4 border-l-blue-500">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle className="text-xl flex items-center gap-2">
                <CheckCircleIcon className="h-5 w-5" />
                Tóm tắt báo cáo - {period}
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Phân tích chi tiết tình hình tài chính trong kỳ
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Badge
                variant={summary.netProfit >= 0 ? "default" : "destructive"}
                className="px-3 py-1 text-sm"
              >
                {summary.netProfit >= 0 ? (
                  <CheckCircleIcon className="h-4 w-4 mr-1" />
                ) : (
                  <AlertTriangleIcon className="h-4 w-4 mr-1" />
                )}
                {summary.netProfit >= 0 ? "Có lãi" : "Thua lỗ"}
              </Badge>
              <div className="text-right">
                <div className="text-sm text-muted-foreground">
                  Tỷ suất lợi nhuận
                </div>
                <div
                  className={`font-bold ${
                    netProfitMargin >= 0 ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {netProfitMargin.toFixed(1)}%
                </div>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Enhanced Revenue & Expenses */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-l-4 border-l-red-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <TrendingDownIcon className="h-5 w-5 text-red-500" />
              Hóa đơn đầu vào
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                <span className="text-sm font-medium text-muted-foreground">
                  Tổng giá trị
                </span>
                <span className="text-xl font-bold text-red-600">
                  {summary.totalInputAmount.toLocaleString("vi-VN")}₫
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-sm font-medium text-muted-foreground">
                  VAT đầu vào
                </span>
                <span className="font-bold text-gray-700">
                  {summary.totalInputVat.toLocaleString("vi-VN")}₫
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">
                  Số lượng hóa đơn
                </span>
                <Badge variant="secondary" className="bg-red-100 text-red-700">
                  <ReceiptIcon className="h-3 w-3 mr-1" />
                  {summary.inputInvoiceCount}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <TrendingUpIcon className="h-5 w-5 text-green-500" />
              Hóa đơn đầu ra
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                <span className="text-sm font-medium text-muted-foreground">
                  Tổng giá trị
                </span>
                <span className="text-xl font-bold text-green-600">
                  {summary.totalOutputAmount.toLocaleString("vi-VN")}₫
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-sm font-medium text-muted-foreground">
                  VAT đầu ra
                </span>
                <span className="font-bold text-gray-700">
                  {summary.totalOutputVat.toLocaleString("vi-VN")}₫
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">
                  Số lượng hóa đơn
                </span>
                <Badge
                  variant="secondary"
                  className="bg-green-100 text-green-700"
                >
                  <ReceiptIcon className="h-3 w-3 mr-1" />
                  {summary.outputInvoiceCount}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Profit Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <DollarSignIcon className="h-5 w-5 text-blue-500" />
              Phân tích lợi nhuận
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Lợi nhuận gộp</span>
                  <span
                    className={`text-lg font-bold ${
                      summary.profit >= 0 ? "text-blue-600" : "text-red-600"
                    }`}
                  >
                    {summary.profit.toLocaleString("vi-VN")}₫
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs text-muted-foreground">
                  <span>Tỷ suất lợi nhuận gộp</span>
                  <span className="font-medium">
                    {profitMargin.toFixed(1)}%
                  </span>
                </div>
                <Progress
                  value={Math.max(0, Math.min(100, profitMargin))}
                  className="h-2"
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Chi phí phát sinh</span>
                  <span className="text-lg font-bold text-orange-600">
                    {summary.additionalCosts.toLocaleString("vi-VN")}₫
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs text-muted-foreground">
                  <span>% của lợi nhuận gộp</span>
                  <span className="font-medium">
                    {additionalCostRatio.toFixed(1)}%
                  </span>
                </div>
                <Progress
                  value={Math.max(0, Math.min(100, additionalCostRatio))}
                  className="h-2"
                />
              </div>

              <div className="space-y-2 pt-3 border-t">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Lợi nhuận ròng</span>
                  <span
                    className={`text-xl font-bold ${
                      summary.netProfit >= 0 ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {summary.netProfit.toLocaleString("vi-VN")}₫
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs text-muted-foreground">
                  <span>Tỷ suất lợi nhuận ròng</span>
                  <span
                    className={`font-medium ${
                      netProfitMargin >= 0 ? "text-green-600" : "text-red-600"
                    }`}
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

        <Card className="border-l-4 border-l-purple-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <FileTextIcon className="h-5 w-5 text-purple-500" />
              Thông tin VAT
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-green-50 rounded-lg text-center">
                  <div className="text-xs text-muted-foreground mb-1">
                    VAT đầu ra
                  </div>
                  <div className="font-bold text-green-600">
                    {summary.totalOutputVat.toLocaleString("vi-VN")}₫
                  </div>
                </div>
                <div className="p-3 bg-red-50 rounded-lg text-center">
                  <div className="text-xs text-muted-foreground mb-1">
                    VAT đầu vào
                  </div>
                  <div className="font-bold text-red-600">
                    -{summary.totalInputVat.toLocaleString("vi-VN")}₫
                  </div>
                </div>
              </div>

              <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                <div className="flex justify-between items-center">
                  <span className="font-medium">VAT phải nộp</span>
                  <span
                    className={`text-xl font-bold ${
                      summary.netVat >= 0 ? "text-orange-600" : "text-green-600"
                    }`}
                  >
                    {summary.netVat.toLocaleString("vi-VN")}₫
                  </span>
                </div>
                {summary.netVat < 0 && (
                  <p className="text-sm text-green-600 mt-2 font-medium">
                    * Được hoàn VAT
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-indigo-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <CheckCircleIcon className="h-5 w-5 text-indigo-500" />
              Hiệu suất kinh doanh
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-center p-4 bg-indigo-50 rounded-lg">
                <div className="text-3xl font-bold text-indigo-600">
                  {summary.inputInvoiceCount + summary.outputInvoiceCount}
                </div>
                <p className="text-sm text-muted-foreground font-medium">
                  Tổng số hóa đơn
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-red-50 rounded-lg">
                  <div className="text-xl font-bold text-red-600">
                    {summary.inputInvoiceCount}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    HĐ đầu vào
                  </div>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <div className="text-xl font-bold text-green-600">
                    {summary.outputInvoiceCount}
                  </div>
                  <div className="text-xs text-muted-foreground">HĐ đầu ra</div>
                </div>
              </div>

              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="text-center">
                  <div className="text-lg font-bold text-blue-600">
                    {summary.outputInvoiceCount > 0
                      ? (
                          summary.totalOutputAmount / summary.outputInvoiceCount
                        ).toLocaleString("vi-VN")
                      : "0"}
                    ₫
                  </div>
                  <p className="text-sm text-muted-foreground font-medium">
                    Giá trị trung bình/hóa đơn ra
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
