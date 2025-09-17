import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  TrendingUpIcon,
  TrendingDownIcon,
  DollarSignIcon,
  FileTextIcon,
  DownloadIcon,
  BarChart3Icon,
  AlertCircleIcon,
  RefreshCwIcon,
} from "lucide-react";
import { ReportSummaryCard } from "./report-summary-card";
import { ReportChart } from "./report-chart";
import { ReportFilters } from "./report-filters";
import { MonthlyReportDetails } from "./monthly-report-details";
import { ComparisonReportCard } from "./comparison-report-card";
import { useReports, useComparisonReport } from "../hooks";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

// Quick stats card component for better reusability
interface QuickStatCardProps {
  title: string;
  value: number;
  subtitle: string;
  icon: React.ReactNode;
  loading?: boolean;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

function QuickStatCard({
  title,
  value,
  subtitle,
  icon,
  loading,
  trend,
}: QuickStatCardProps) {
  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center space-x-4">
            <Skeleton className="h-10 w-10 rounded-lg" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-3 w-20" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="transition-all duration-200 hover:shadow-md">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex-shrink-0">{icon}</div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                {title}
              </p>
              <div className="flex items-center space-x-2">
                <div className="text-2xl font-bold">
                  {value.toLocaleString("vi-VN")}₫
                </div>
                {trend && (
                  <Badge
                    variant={trend.isPositive ? "default" : "destructive"}
                    className="text-xs"
                  >
                    {trend.isPositive ? "+" : ""}
                    {trend.value.toFixed(1)}%
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function ReportsModule() {
  const {
    summary,
    chartData,
    loading,
    error,
    filters,
    setFilters,
    loadMonthlyReport,
  } = useReports();

  const {
    comparison,
    loading: comparisonLoading,
    loadComparison,
  } = useComparisonReport();

  const [activeTab, setActiveTab] = useState("overview");
  const [selectedMonthReport, setSelectedMonthReport] = useState<string | null>(
    null
  );

  const handleFilterChange = (newFilters: Partial<typeof filters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  const handleLoadComparison = async () => {
    if (filters.month) {
      const [year, month] = filters.month.split("-");
      const prevMonth =
        parseInt(month) === 1
          ? `${parseInt(year) - 1}-12`
          : `${year}-${String(parseInt(month) - 1).padStart(2, "0")}`;

      await loadComparison(filters.month, prevMonth);
    }
  };

  const handleExportReport = () => {
    // TODO: Implement export functionality
    console.log("Export report");
  };

  const currentPeriodText = filters.month
    ? format(new Date(filters.month + "-01"), "MMMM yyyy", { locale: vi })
    : "Tháng hiện tại";

  return (
    <div className="container mx-auto space-y-6 p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Báo cáo tài chính
          </h1>
          <p className="text-muted-foreground">
            Theo dõi doanh thu, chi phí và lợi nhuận kinh doanh
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleLoadComparison}
            disabled={comparisonLoading || !filters.month}
            className="flex items-center gap-2"
          >
            {comparisonLoading ? (
              <RefreshCwIcon className="h-4 w-4 animate-spin" />
            ) : (
              <BarChart3Icon className="h-4 w-4" />
            )}
            So sánh tháng trước
          </Button>
          <Button variant="outline" size="sm" onClick={handleExportReport}>
            <DownloadIcon className="h-4 w-4 mr-2" />
            Xuất báo cáo
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border p-4">
        <ReportFilters
          filters={filters}
          onChange={handleFilterChange}
          loading={loading}
        />
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertCircleIcon className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <QuickStatCard
          title="Tổng thu (đầu ra)"
          value={summary?.totalOutputAmount || 0}
          subtitle={`${summary?.outputInvoiceCount || 0} hóa đơn`}
          icon={<TrendingUpIcon className="h-8 w-8 text-green-500" />}
          loading={loading}
        />
        <QuickStatCard
          title="Tổng chi (đầu vào)"
          value={summary?.totalInputAmount || 0}
          subtitle={`${summary?.inputInvoiceCount || 0} hóa đơn`}
          icon={<TrendingDownIcon className="h-8 w-8 text-red-500" />}
          loading={loading}
        />
        <QuickStatCard
          title="Lợi nhuận gộp"
          value={summary?.profit || 0}
          subtitle="Chưa trừ chi phí phát sinh"
          icon={<DollarSignIcon className="h-8 w-8 text-blue-500" />}
          loading={loading}
        />
        <QuickStatCard
          title="Lợi nhuận ròng"
          value={summary?.netProfit || 0}
          subtitle={`Chi phí phát sinh: ${(
            summary?.additionalCosts || 0
          ).toLocaleString("vi-VN")}₫`}
          icon={<FileTextIcon className="h-8 w-8 text-purple-500" />}
          loading={loading}
        />
      </div>

      {/* VAT Information Card */}
      {summary && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileTextIcon className="h-5 w-5" />
              Thông tin VAT
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="text-center sm:text-left">
                <p className="text-sm text-muted-foreground">VAT đầu vào</p>
                <p className="text-xl font-semibold text-red-600">
                  {summary.totalInputVat.toLocaleString("vi-VN")}₫
                </p>
              </div>
              <div className="text-center sm:text-left">
                <p className="text-sm text-muted-foreground">VAT đầu ra</p>
                <p className="text-xl font-semibold text-green-600">
                  {summary.totalOutputVat.toLocaleString("vi-VN")}₫
                </p>
              </div>
              <div className="text-center sm:text-left">
                <p className="text-sm text-muted-foreground">VAT phải nộp</p>
                <p
                  className={`text-xl font-semibold ${
                    summary.netVat >= 0 ? "text-orange-600" : "text-blue-600"
                  }`}
                >
                  {summary.netVat.toLocaleString("vi-VN")}₫
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Content Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-4"
      >
        <div className="overflow-x-auto">
          <TabsList className="grid w-full grid-cols-4 min-w-[500px]">
            <TabsTrigger value="overview">Tổng quan</TabsTrigger>
            <TabsTrigger value="chart">Biểu đồ</TabsTrigger>
            <TabsTrigger value="details">Chi tiết tháng</TabsTrigger>
            <TabsTrigger value="comparison">So sánh</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="overview" className="space-y-4">
          <ReportSummaryCard
            summary={summary || null}
            loading={loading}
            period={currentPeriodText}
          />
        </TabsContent>

        <TabsContent value="chart" className="space-y-4">
          <ReportChart data={chartData} loading={loading} />
        </TabsContent>

        <TabsContent value="details" className="space-y-4">
          <MonthlyReportDetails
            selectedMonth={selectedMonthReport || filters.month || ""}
            onMonthChange={setSelectedMonthReport}
            onLoadReport={loadMonthlyReport}
          />
        </TabsContent>

        <TabsContent value="comparison" className="space-y-4">
          <ComparisonReportCard
            comparison={comparison}
            loading={comparisonLoading}
            onLoad={handleLoadComparison}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
