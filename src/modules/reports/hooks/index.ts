import { useState, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { ReportService } from "../services";
import type { ReportFilters, MonthlyReport, ComparisonReport } from "../types";

// Query keys for better cache management
const QUERY_KEYS = {
  reports: {
    summary: (filters: ReportFilters) => ["reports", "summary", filters],
    chartData: (dateFrom: Date, dateTo: Date) => [
      "reports",
      "chart-data",
      { dateFrom, dateTo },
    ],
    monthly: (month: string) => ["reports", "monthly", month],
    comparison: (current: string, previous: string) => [
      "reports",
      "comparison",
      { current, previous },
    ],
  },
  additionalCosts: {
    all: () => ["additional-costs"],
    byPeriod: (
      dateFrom: Date,
      dateTo: Date,
      orderId?: string,
      costType?: string
    ) => [
      "additional-costs",
      "by-period",
      { dateFrom, dateTo, orderId, costType },
    ],
    byOrderId: (orderId: string) => ["additional-costs", "by-order", orderId],
  },
};

export function useReports() {
  const [filters, setFilters] = useState<ReportFilters>({
    period: "monthly",
    includeAdditionalCosts: true,
  });

  // Calculate date range from filters with stable keys
  const getDateRange = useCallback(() => {
    if (filters.period === "custom" && filters.dateFrom && filters.dateTo) {
      return {
        dateFrom: filters.dateFrom,
        dateTo: filters.dateTo,
        dateFromKey: filters.dateFrom.toISOString().split("T")[0],
        dateToKey: filters.dateTo.toISOString().split("T")[0],
      };
    } else if (filters.month) {
      const [year, month] = filters.month.split("-");
      const dateFrom = new Date(parseInt(year), parseInt(month) - 1, 1);
      const dateTo = new Date(parseInt(year), parseInt(month), 0);
      return {
        dateFrom,
        dateTo,
        dateFromKey: dateFrom.toISOString().split("T")[0],
        dateToKey: dateTo.toISOString().split("T")[0],
      };
    } else {
      // Default to current month - use stable date calculation
      const now = new Date();
      const year = now.getFullYear();
      const month = now.getMonth();
      const dateFrom = new Date(year, month, 1);
      const dateTo = new Date(year, month + 1, 0);
      return {
        dateFrom,
        dateTo,
        dateFromKey: dateFrom.toISOString().split("T")[0],
        dateToKey: dateTo.toISOString().split("T")[0],
      };
    }
  }, [filters.period, filters.dateFrom, filters.dateTo, filters.month]);

  const { dateFrom, dateTo, dateFromKey, dateToKey } = getDateRange();

  // Summary query
  const {
    data: summary,
    isLoading: summaryLoading,
    error: summaryError,
  } = useQuery({
    queryKey: [
      "reports",
      "summary",
      filters.period,
      dateFromKey,
      dateToKey,
      filters.includeAdditionalCosts,
    ],
    queryFn: () =>
      ReportService.generateSummary(
        filters.period === "custom" ? "monthly" : filters.period,
        dateFrom,
        dateTo
      ),
    enabled: !!dateFrom && !!dateTo,
  });

  // Chart data query - get last 12 months with stable calculation
  const chartDataRange = useCallback(() => {
    // Use a fixed reference point to avoid constant recalculation
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();

    const endDate = new Date(year, month + 1, 0); // Last day of current month
    const startDate = new Date(year, month - 11, 1); // First day of 12 months ago

    return {
      startDate,
      endDate,
      startDateKey: `${startDate.getFullYear()}-${String(
        startDate.getMonth() + 1
      ).padStart(2, "0")}-01`,
      endDateKey: `${endDate.getFullYear()}-${String(
        endDate.getMonth() + 1
      ).padStart(2, "0")}-${String(endDate.getDate()).padStart(2, "0")}`,
    };
  }, []); // Empty deps array since we want this to be stable

  const { startDate, endDate, startDateKey, endDateKey } = chartDataRange();

  const {
    data: chartData = [],
    isLoading: chartLoading,
    error: chartError,
  } = useQuery({
    queryKey: ["reports", "chart-data", startDateKey, endDateKey],
    queryFn: () =>
      ReportService.generateChartData("monthly", startDate, endDate),
  });

  const loading = summaryLoading || chartLoading;
  const error = summaryError?.message || chartError?.message || null;

  // Load monthly report function
  const loadMonthlyReport = useCallback(
    async (month: string): Promise<MonthlyReport | null> => {
      try {
        return await ReportService.generateMonthlyReport(month);
      } catch (error) {
        console.error("Error loading monthly report:", error);
        return null;
      }
    },
    []
  );

  return {
    summary,
    chartData,
    loading,
    error,
    filters,
    setFilters,
    loadMonthlyReport,
  };
}

export function useComparisonReport() {
  const [comparisonData, setComparisonData] = useState<{
    comparison: ComparisonReport | null;
    loading: boolean;
    error: string | null;
  }>({
    comparison: null,
    loading: false,
    error: null,
  });

  const loadComparison = useCallback(
    async (currentPeriod: string, previousPeriod: string) => {
      try {
        setComparisonData((prev) => ({ ...prev, loading: true, error: null }));
        const comparison = await ReportService.generateComparisonReport(
          currentPeriod,
          previousPeriod
        );
        setComparisonData({ comparison, loading: false, error: null });
      } catch (error) {
        console.error("Error loading comparison report:", error);
        setComparisonData({
          comparison: null,
          loading: false,
          error:
            error instanceof Error
              ? error.message
              : "Có lỗi xảy ra khi tải báo cáo so sánh",
        });
      }
    },
    []
  );

  return {
    comparison: comparisonData.comparison,
    loading: comparisonData.loading,
    error: comparisonData.error,
    loadComparison,
  };
}

// Hook for monthly report details
export function useMonthlyReport(month: string) {
  return useQuery({
    queryKey: QUERY_KEYS.reports.monthly(month),
    queryFn: () => ReportService.generateMonthlyReport(month),
    enabled: !!month,
  });
}

// Hook for top suppliers
export function useTopSuppliers(dateFrom: Date, dateTo: Date, limit = 10) {
  return useQuery({
    queryKey: ["reports", "top-suppliers", { dateFrom, dateTo, limit }],
    queryFn: () => ReportService.getTopSuppliers(dateFrom, dateTo, limit),
    enabled: !!dateFrom && !!dateTo,
  });
}

// Hook for top customers
export function useTopCustomers(dateFrom: Date, dateTo: Date, limit = 10) {
  return useQuery({
    queryKey: ["reports", "top-customers", { dateFrom, dateTo, limit }],
    queryFn: () => ReportService.getTopCustomers(dateFrom, dateTo, limit),
    enabled: !!dateFrom && !!dateTo,
  });
}

// Hook for top products
export function useTopProducts(dateFrom: Date, dateTo: Date, limit = 10) {
  return useQuery({
    queryKey: ["reports", "top-products", { dateFrom, dateTo, limit }],
    queryFn: () => ReportService.getTopProducts(dateFrom, dateTo, limit),
    enabled: !!dateFrom && !!dateTo,
  });
}
