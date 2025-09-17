import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import {
  LineChartIcon,
  BarChartIcon,
  PieChartIcon,
  TrendingUpIcon,
  ActivityIcon,
} from "lucide-react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import type { ChartData } from "../types";

interface ReportChartProps {
  data: ChartData[];
  loading?: boolean;
}

type ChartType = "line" | "area" | "bar" | "pie";
type DataType = "revenue" | "profit" | "vat" | "costs";

const CHART_COLORS = {
  input: "#ef4444", // red-500
  output: "#22c55e", // green-500
  profit: "#3b82f6", // blue-500
  netProfit: "#8b5cf6", // violet-500
  additionalCosts: "#f97316", // orange-500
  inputVat: "#ec4899", // pink-500
  outputVat: "#10b981", // emerald-500
  netVat: "#6366f1", // indigo-500
};

const PIE_COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];

export function ReportChart({ data, loading }: ReportChartProps) {
  const [chartType, setChartType] = useState<ChartType>("line");
  const [dataType, setDataType] = useState<DataType>("revenue");

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ActivityIcon className="h-5 w-5" />
            Biểu đồ báo cáo
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="text-center py-12">
            <TrendingUpIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              Không có dữ liệu để hiển thị biểu đồ
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Format data for display
  const formattedData = data.map((item) => ({
    ...item,
    month: format(new Date(item.period + "-01"), "MMM yyyy", { locale: vi }),
  }));

  // Custom tooltip formatter
  const formatTooltipValue = (value: number) => {
    return value.toLocaleString("vi-VN") + "₫";
  };

  // Prepare pie chart data based on latest month
  const latestData = data[data.length - 1];
  const pieData = latestData
    ? [
        {
          name: "Hóa đơn đầu vào",
          value: latestData.inputAmount,
          color: CHART_COLORS.input,
        },
        {
          name: "Chi phí phát sinh",
          value: latestData.additionalCosts,
          color: CHART_COLORS.additionalCosts,
        },
        {
          name: "Lợi nhuận ròng",
          value: Math.max(0, latestData.netProfit),
          color: CHART_COLORS.netProfit,
        },
      ].filter((item) => item.value > 0)
    : [];

  const renderChart = () => {
    switch (chartType) {
      case "line":
        return (
          <LineChart data={formattedData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis
              tickFormatter={(value) => (value / 1000000).toFixed(0) + "M"}
            />
            <Tooltip formatter={formatTooltipValue} />
            <Legend />

            {dataType === "revenue" && (
              <>
                <Line
                  type="monotone"
                  dataKey="inputAmount"
                  stroke={CHART_COLORS.input}
                  strokeWidth={2}
                  name="Hóa đơn đầu vào"
                />
                <Line
                  type="monotone"
                  dataKey="outputAmount"
                  stroke={CHART_COLORS.output}
                  strokeWidth={2}
                  name="Hóa đơn đầu ra"
                />
              </>
            )}

            {dataType === "profit" && (
              <>
                <Line
                  type="monotone"
                  dataKey="profit"
                  stroke={CHART_COLORS.profit}
                  strokeWidth={2}
                  name="Lợi nhuận gộp"
                />
                <Line
                  type="monotone"
                  dataKey="netProfit"
                  stroke={CHART_COLORS.netProfit}
                  strokeWidth={2}
                  name="Lợi nhuận ròng"
                />
                <Line
                  type="monotone"
                  dataKey="additionalCosts"
                  stroke={CHART_COLORS.additionalCosts}
                  strokeWidth={2}
                  name="Chi phí phát sinh"
                />
              </>
            )}

            {dataType === "vat" && (
              <>
                <Line
                  type="monotone"
                  dataKey="inputVat"
                  stroke={CHART_COLORS.inputVat}
                  strokeWidth={2}
                  name="VAT đầu vào"
                />
                <Line
                  type="monotone"
                  dataKey="outputVat"
                  stroke={CHART_COLORS.outputVat}
                  strokeWidth={2}
                  name="VAT đầu ra"
                />
                <Line
                  type="monotone"
                  dataKey="netVat"
                  stroke={CHART_COLORS.netVat}
                  strokeWidth={2}
                  name="VAT phải nộp"
                />
              </>
            )}
          </LineChart>
        );

      case "area":
        return (
          <AreaChart data={formattedData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis
              tickFormatter={(value) => (value / 1000000).toFixed(0) + "M"}
            />
            <Tooltip formatter={formatTooltipValue} />
            <Legend />

            {dataType === "revenue" && (
              <>
                <Area
                  type="monotone"
                  dataKey="inputAmount"
                  stackId="1"
                  stroke={CHART_COLORS.input}
                  fill={CHART_COLORS.input}
                  fillOpacity={0.6}
                  name="Hóa đơn đầu vào"
                />
                <Area
                  type="monotone"
                  dataKey="outputAmount"
                  stackId="2"
                  stroke={CHART_COLORS.output}
                  fill={CHART_COLORS.output}
                  fillOpacity={0.6}
                  name="Hóa đơn đầu ra"
                />
              </>
            )}

            {dataType === "profit" && (
              <>
                <Area
                  type="monotone"
                  dataKey="additionalCosts"
                  stackId="1"
                  stroke={CHART_COLORS.additionalCosts}
                  fill={CHART_COLORS.additionalCosts}
                  fillOpacity={0.6}
                  name="Chi phí phát sinh"
                />
                <Area
                  type="monotone"
                  dataKey="netProfit"
                  stackId="1"
                  stroke={CHART_COLORS.netProfit}
                  fill={CHART_COLORS.netProfit}
                  fillOpacity={0.6}
                  name="Lợi nhuận ròng"
                />
              </>
            )}
          </AreaChart>
        );

      case "bar":
        return (
          <BarChart data={formattedData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis
              tickFormatter={(value) => (value / 1000000).toFixed(0) + "M"}
            />
            <Tooltip formatter={formatTooltipValue} />
            <Legend />

            {dataType === "revenue" && (
              <>
                <Bar
                  dataKey="inputAmount"
                  fill={CHART_COLORS.input}
                  name="Hóa đơn đầu vào"
                />
                <Bar
                  dataKey="outputAmount"
                  fill={CHART_COLORS.output}
                  name="Hóa đơn đầu ra"
                />
              </>
            )}

            {dataType === "profit" && (
              <>
                <Bar
                  dataKey="profit"
                  fill={CHART_COLORS.profit}
                  name="Lợi nhuận gộp"
                />
                <Bar
                  dataKey="additionalCosts"
                  fill={CHART_COLORS.additionalCosts}
                  name="Chi phí phát sinh"
                />
                <Bar
                  dataKey="netProfit"
                  fill={CHART_COLORS.netProfit}
                  name="Lợi nhuận ròng"
                />
              </>
            )}
          </BarChart>
        );

      case "pie":
        return (
          <PieChart>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {pieData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.color || PIE_COLORS[index % PIE_COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip formatter={formatTooltipValue} />
            <Legend />
          </PieChart>
        );

      default:
        return null;
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-center gap-2">
            <ActivityIcon className="h-5 w-5" />
            <CardTitle>Biểu đồ báo cáo</CardTitle>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {/* Data Type Selector */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground whitespace-nowrap">
                Dữ liệu:
              </span>
              <Select
                value={dataType}
                onValueChange={(value: DataType) => setDataType(value)}
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="revenue">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                      Doanh thu
                    </div>
                  </SelectItem>
                  <SelectItem value="profit">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                      Lợi nhuận
                    </div>
                  </SelectItem>
                  <SelectItem value="vat">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                      VAT
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Chart Type Selector */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground whitespace-nowrap">
                Loại:
              </span>
              <div className="flex border rounded-lg overflow-hidden">
                <Button
                  variant={chartType === "line" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setChartType("line")}
                  className="rounded-none"
                >
                  <LineChartIcon className="h-4 w-4" />
                </Button>
                <Button
                  variant={chartType === "area" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setChartType("area")}
                  className="rounded-none"
                >
                  <ActivityIcon className="h-4 w-4" />
                </Button>
                <Button
                  variant={chartType === "bar" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setChartType("bar")}
                  className="rounded-none"
                >
                  <BarChartIcon className="h-4 w-4" />
                </Button>
                <Button
                  variant={chartType === "pie" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setChartType("pie")}
                  className="rounded-none"
                >
                  <PieChartIcon className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Data Summary */}
        {latestData && (
          <div className="flex flex-wrap gap-4 mt-4 p-4 bg-muted/30 rounded-lg">
            <div className="text-center">
              <div className="text-sm text-muted-foreground">
                Tháng hiện tại
              </div>
              <div className="font-semibold">
                {format(new Date(latestData.period + "-01"), "MM/yyyy", {
                  locale: vi,
                })}
              </div>
            </div>
            <div className="text-center">
              <div className="text-sm text-muted-foreground">Doanh thu</div>
              <div className="font-semibold text-green-600">
                {latestData.outputAmount.toLocaleString("vi-VN")}₫
              </div>
            </div>
            <div className="text-center">
              <div className="text-sm text-muted-foreground">Lợi nhuận</div>
              <div
                className={`font-semibold ${
                  latestData.netProfit >= 0 ? "text-blue-600" : "text-red-600"
                }`}
              >
                {latestData.netProfit.toLocaleString("vi-VN")}₫
              </div>
            </div>
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="h-96">
          <ResponsiveContainer width="100%" height="100%">
            {renderChart() || <div>No chart available</div>}
          </ResponsiveContainer>
        </div>

        {chartType === "pie" && latestData && (
          <div className="mt-6 p-4 bg-muted/30 rounded-lg border">
            <h4 className="font-medium mb-3">Chi tiết phân bổ</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Chi phí đầu vào:</span>
                <span className="font-medium text-red-600">
                  {latestData.inputAmount.toLocaleString("vi-VN")}₫
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">
                  Chi phí phát sinh:
                </span>
                <span className="font-medium text-orange-600">
                  {latestData.additionalCosts.toLocaleString("vi-VN")}₫
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Lợi nhuận ròng:</span>
                <span
                  className={`font-medium ${
                    latestData.netProfit >= 0
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {Math.max(0, latestData.netProfit).toLocaleString("vi-VN")}₫
                </span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
