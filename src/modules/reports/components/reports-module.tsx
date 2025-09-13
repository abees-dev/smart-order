import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  TrendingUpIcon,
  TrendingDownIcon,
  DollarSignIcon,
  FileTextIcon,
  PlusIcon,
  DownloadIcon,
} from "lucide-react";
import { ReportSummaryCard } from "./report-summary-card";
import { ReportChart } from "./report-chart";
import { ReportFilters } from "./report-filters";
import { AdditionalCostsList } from "./additional-costs-list";
import { MonthlyReportDetails } from "./monthly-report-details";
import { ComparisonReportCard } from "./comparison-report-card";
import { AddCostDialog } from "./add-cost-dialog";
import { useReports, useAdditionalCosts, useComparisonReport } from "../hooks";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

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
    costs: additionalCosts,
    loading: costsLoading,
    createCost,
    updateCost,
    deleteCost,
    loadCosts,
  } = useAdditionalCosts();

  const {
    comparison,
    loading: comparisonLoading,
    loadComparison,
  } = useComparisonReport();

  const [activeTab, setActiveTab] = useState("overview");
  const [showAddCostDialog, setShowAddCostDialog] = useState(false);
  const [selectedMonthReport, setSelectedMonthReport] = useState<string | null>(
    null
  );

  const handleFilterChange = (newFilters: Partial<typeof filters>) => {
    setFilters(newFilters);
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
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Báo cáo</h1>
          <p className="text-muted-foreground">
            Theo dõi hóa đơn đầu vào, đầu ra và chi phí phát sinh
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={handleLoadComparison}
            disabled={comparisonLoading}
          >
            <TrendingUpIcon className="h-4 w-4 mr-2" />
            So sánh tháng trước
          </Button>
          <Button variant="outline" onClick={handleExportReport}>
            <DownloadIcon className="h-4 w-4 mr-2" />
            Xuất báo cáo
          </Button>
          <Button onClick={() => setShowAddCostDialog(true)}>
            <PlusIcon className="h-4 w-4 mr-2" />
            Thêm chi phí
          </Button>
        </div>
      </div>

      {/* Filters */}
      <ReportFilters
        filters={filters}
        onChange={handleFilterChange}
        loading={loading}
      />

      {/* Error */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <p className="text-red-600">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Quick Stats */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <TrendingDownIcon className="h-8 w-8 text-red-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">
                    Hóa đơn đầu vào
                  </p>
                  <div className="text-2xl font-bold">
                    {summary.totalInputAmount.toLocaleString("vi-VN")}₫
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {summary.inputInvoiceCount} hóa đơn
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <TrendingUpIcon className="h-8 w-8 text-green-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">
                    Hóa đơn đầu ra
                  </p>
                  <div className="text-2xl font-bold">
                    {summary.totalOutputAmount.toLocaleString("vi-VN")}₫
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {summary.outputInvoiceCount} hóa đơn
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <DollarSignIcon className="h-8 w-8 text-blue-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">
                    Lợi nhuận gộp
                  </p>
                  <div className="text-2xl font-bold">
                    {summary.profit.toLocaleString("vi-VN")}₫
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Chưa trừ chi phí phát sinh
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <FileTextIcon className="h-8 w-8 text-purple-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">
                    Lợi nhuận ròng
                  </p>
                  <div className="text-2xl font-bold">
                    {summary.netProfit.toLocaleString("vi-VN")}₫
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Sau trừ chi phí phát sinh
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Tổng quan</TabsTrigger>
          <TabsTrigger value="chart">Biểu đồ</TabsTrigger>
          <TabsTrigger value="costs">Chi phí phát sinh</TabsTrigger>
          <TabsTrigger value="details">Chi tiết tháng</TabsTrigger>
          <TabsTrigger value="comparison">So sánh</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <ReportSummaryCard
            summary={summary}
            loading={loading}
            period={currentPeriodText}
          />
        </TabsContent>

        <TabsContent value="chart" className="space-y-4">
          <ReportChart data={chartData} loading={loading} />
        </TabsContent>

        <TabsContent value="costs" className="space-y-4">
          <AdditionalCostsList
            costs={additionalCosts}
            loading={costsLoading}
            onUpdate={updateCost}
            onDelete={deleteCost}
            onRefresh={loadCosts}
          />
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

      {/* Add Cost Dialog */}
      <AddCostDialog
        open={showAddCostDialog}
        onOpenChange={setShowAddCostDialog}
        onSubmit={createCost}
        loading={costsLoading}
      />
    </div>
  );
}
