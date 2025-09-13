import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  TrendingUpIcon,
  TrendingDownIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  MinusIcon,
  RefreshCwIcon,
} from "lucide-react";
import type { ComparisonReport } from "../types";

interface ComparisonReportCardProps {
  comparison: ComparisonReport | null;
  loading?: boolean;
  onLoad: () => void;
}

export function ComparisonReportCard({
  comparison,
  loading,
  onLoad,
}: ComparisonReportCardProps) {
  if (!comparison && !loading) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>So sánh với tháng trước</CardTitle>
            <Button onClick={onLoad} disabled={loading}>
              <RefreshCwIcon className="h-4 w-4 mr-2" />
              Tải so sánh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <TrendingUpIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              Nhấn "Tải so sánh" để xem báo cáo so sánh với tháng trước
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mr-2"></div>
            <span>Đang tải báo cáo so sánh...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!comparison) {
    return null;
  }

  const formatGrowth = (value: number) => {
    const isPositive = value > 0;
    const isNegative = value < 0;
    const isZero = value === 0;

    return {
      value: Math.abs(value),
      isPositive,
      isNegative,
      isZero,
      text: isZero
        ? "0%"
        : `${isPositive ? "+" : "-"}${Math.abs(value).toFixed(1)}%`,
      color: isPositive
        ? "text-green-600"
        : isNegative
        ? "text-red-600"
        : "text-muted-foreground",
      icon: isPositive ? ArrowUpIcon : isNegative ? ArrowDownIcon : MinusIcon,
    };
  };

  const inputGrowth = formatGrowth(comparison.growth.inputAmount);
  const outputGrowth = formatGrowth(comparison.growth.outputAmount);
  const profitGrowth = formatGrowth(comparison.growth.profit);
  const netProfitGrowth = formatGrowth(comparison.growth.netProfit);

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>So sánh với tháng trước</CardTitle>
            <Button variant="outline" onClick={onLoad} disabled={loading}>
              <RefreshCwIcon className="h-4 w-4 mr-2" />
              Làm mới
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Main Comparison */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Current Period */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Tháng hiện tại</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">
                  Hóa đơn đầu vào
                </span>
                <span className="font-semibold">
                  {comparison.currentPeriod.totalInputAmount.toLocaleString(
                    "vi-VN"
                  )}
                  ₫
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">
                  Hóa đơn đầu ra
                </span>
                <span className="font-semibold">
                  {comparison.currentPeriod.totalOutputAmount.toLocaleString(
                    "vi-VN"
                  )}
                  ₫
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">
                  Lợi nhuận gộp
                </span>
                <span className="font-semibold">
                  {comparison.currentPeriod.profit.toLocaleString("vi-VN")}₫
                </span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t">
                <span className="text-sm font-medium">Lợi nhuận ròng</span>
                <span
                  className={`font-bold ${
                    comparison.currentPeriod.netProfit >= 0
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {comparison.currentPeriod.netProfit.toLocaleString("vi-VN")}₫
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Previous Period */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Tháng trước</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">
                  Hóa đơn đầu vào
                </span>
                <span className="font-semibold">
                  {comparison.previousPeriod.totalInputAmount.toLocaleString(
                    "vi-VN"
                  )}
                  ₫
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">
                  Hóa đơn đầu ra
                </span>
                <span className="font-semibold">
                  {comparison.previousPeriod.totalOutputAmount.toLocaleString(
                    "vi-VN"
                  )}
                  ₫
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">
                  Lợi nhuận gộp
                </span>
                <span className="font-semibold">
                  {comparison.previousPeriod.profit.toLocaleString("vi-VN")}₫
                </span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t">
                <span className="text-sm font-medium">Lợi nhuận ròng</span>
                <span
                  className={`font-bold ${
                    comparison.previousPeriod.netProfit >= 0
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {comparison.previousPeriod.netProfit.toLocaleString("vi-VN")}₫
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Growth Analysis */}
      <Card>
        <CardHeader>
          <CardTitle>Phân tích tăng trưởng</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Input Growth */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Hóa đơn đầu vào</span>
                <div className="flex items-center gap-1">
                  <inputGrowth.icon
                    className={`h-4 w-4 ${inputGrowth.color}`}
                  />
                  <span
                    className={`text-sm font-semibold ${inputGrowth.color}`}
                  >
                    {inputGrowth.text}
                  </span>
                </div>
              </div>
              <Progress
                value={Math.min(100, inputGrowth.value)}
                className="h-2"
              />
              <p className="text-xs text-muted-foreground">
                {inputGrowth.isPositive
                  ? "Tăng"
                  : inputGrowth.isNegative
                  ? "Giảm"
                  : "Không đổi"}{" "}
                so với tháng trước
              </p>
            </div>

            {/* Output Growth */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Hóa đơn đầu ra</span>
                <div className="flex items-center gap-1">
                  <outputGrowth.icon
                    className={`h-4 w-4 ${outputGrowth.color}`}
                  />
                  <span
                    className={`text-sm font-semibold ${outputGrowth.color}`}
                  >
                    {outputGrowth.text}
                  </span>
                </div>
              </div>
              <Progress
                value={Math.min(100, outputGrowth.value)}
                className="h-2"
              />
              <p className="text-xs text-muted-foreground">
                {outputGrowth.isPositive
                  ? "Tăng"
                  : outputGrowth.isNegative
                  ? "Giảm"
                  : "Không đổi"}{" "}
                so với tháng trước
              </p>
            </div>

            {/* Profit Growth */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Lợi nhuận gộp</span>
                <div className="flex items-center gap-1">
                  <profitGrowth.icon
                    className={`h-4 w-4 ${profitGrowth.color}`}
                  />
                  <span
                    className={`text-sm font-semibold ${profitGrowth.color}`}
                  >
                    {profitGrowth.text}
                  </span>
                </div>
              </div>
              <Progress
                value={Math.min(100, profitGrowth.value)}
                className="h-2"
              />
              <p className="text-xs text-muted-foreground">
                {profitGrowth.isPositive
                  ? "Tăng"
                  : profitGrowth.isNegative
                  ? "Giảm"
                  : "Không đổi"}{" "}
                so với tháng trước
              </p>
            </div>

            {/* Net Profit Growth */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Lợi nhuận ròng</span>
                <div className="flex items-center gap-1">
                  <netProfitGrowth.icon
                    className={`h-4 w-4 ${netProfitGrowth.color}`}
                  />
                  <span
                    className={`text-sm font-semibold ${netProfitGrowth.color}`}
                  >
                    {netProfitGrowth.text}
                  </span>
                </div>
              </div>
              <Progress
                value={Math.min(100, netProfitGrowth.value)}
                className="h-2"
              />
              <p className="text-xs text-muted-foreground">
                {netProfitGrowth.isPositive
                  ? "Tăng"
                  : netProfitGrowth.isNegative
                  ? "Giảm"
                  : "Không đổi"}{" "}
                so với tháng trước
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Performance Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Tổng kết hiệu suất</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
              <div>
                <p className="font-medium">Đánh giá tổng quan</p>
                <p className="text-sm text-muted-foreground">
                  Dựa trên các chỉ số tăng trưởng chính
                </p>
              </div>
              <div className="text-right">
                {netProfitGrowth.isPositive ? (
                  <Badge className="bg-green-100 text-green-800">
                    <TrendingUpIcon className="h-3 w-3 mr-1" />
                    Tích cực
                  </Badge>
                ) : netProfitGrowth.isNegative ? (
                  <Badge variant="destructive">
                    <TrendingDownIcon className="h-3 w-3 mr-1" />
                    Cần cải thiện
                  </Badge>
                ) : (
                  <Badge variant="secondary">
                    <MinusIcon className="h-3 w-3 mr-1" />
                    Ổn định
                  </Badge>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="text-center p-3 border rounded-lg">
                <div className="font-semibold">Doanh thu</div>
                <div className={outputGrowth.color}>
                  {outputGrowth.isPositive
                    ? "Tăng trưởng tốt"
                    : outputGrowth.isNegative
                    ? "Cần tăng cường bán hàng"
                    : "Duy trì ổn định"}
                </div>
              </div>
              <div className="text-center p-3 border rounded-lg">
                <div className="font-semibold">Chi phí</div>
                <div
                  className={
                    inputGrowth.isPositive
                      ? "text-orange-600"
                      : "text-green-600"
                  }
                >
                  {inputGrowth.isPositive
                    ? "Chi phí tăng"
                    : inputGrowth.isNegative
                    ? "Tiết kiệm chi phí"
                    : "Chi phí ổn định"}
                </div>
              </div>
              <div className="text-center p-3 border rounded-lg">
                <div className="font-semibold">Hiệu quả</div>
                <div className={netProfitGrowth.color}>
                  {netProfitGrowth.isPositive
                    ? "Hiệu quả tăng"
                    : netProfitGrowth.isNegative
                    ? "Cần cải thiện"
                    : "Duy trì hiệu quả"}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
