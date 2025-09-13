import { useState, useEffect, useCallback } from "react";
import { ReportService, AdditionalCostService } from "../services";
import type {
  ReportState,
  ReportFilters,
  AdditionalCost,
  CreateAdditionalCostData,
  UpdateAdditionalCostData,
  MonthlyReport,
  ComparisonReport,
} from "../types";

// Hook chính cho báo cáo
export function useReports() {
  const [state, setState] = useState<ReportState>({
    summary: null,
    chartData: [],
    monthlyReports: [],
    additionalCosts: [],
    loading: false,
    error: null,
    filters: {
      period: "monthly",
      includeAdditionalCosts: true,
    },
  });

  const setFilters = useCallback((filters: Partial<ReportFilters>) => {
    setState((prev) => ({
      ...prev,
      filters: { ...prev.filters, ...filters },
    }));
  }, []);

  const setError = useCallback((error: string | null) => {
    setState((prev) => ({ ...prev, error }));
  }, []);

  const setLoading = useCallback((loading: boolean) => {
    setState((prev) => ({ ...prev, loading }));
  }, []);

  // Tải báo cáo theo bộ lọc
  const loadReports = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { filters } = state;
      let dateFrom: Date;
      let dateTo: Date;

      // Xác định khoảng thời gian
      if (filters.period === "custom" && filters.dateFrom && filters.dateTo) {
        dateFrom = filters.dateFrom;
        dateTo = filters.dateTo;
      } else if (filters.month) {
        const [year, month] = filters.month.split("-");
        dateFrom = new Date(parseInt(year), parseInt(month) - 1, 1);
        dateTo = new Date(parseInt(year), parseInt(month), 0);
      } else {
        // Mặc định là tháng hiện tại
        const now = new Date();
        dateFrom = new Date(now.getFullYear(), now.getMonth(), 1);
        dateTo = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      }

      const period =
        filters.month ||
        `${dateFrom.getFullYear()}-${String(dateFrom.getMonth() + 1).padStart(
          2,
          "0"
        )}`;

      // Tải summary
      const summary = await ReportService.generateSummary(
        period,
        dateFrom,
        dateTo
      );

      // Tải chart data cho 12 tháng gần nhất
      const months: string[] = [];
      const currentDate = new Date();
      for (let i = 11; i >= 0; i--) {
        const date = new Date(
          currentDate.getFullYear(),
          currentDate.getMonth() - i,
          1
        );
        months.push(
          `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
            2,
            "0"
          )}`
        );
      }
      const chartData = await ReportService.generateChartData(months);

      // Tải chi phí phát sinh nếu cần
      let additionalCosts: AdditionalCost[] = [];
      if (filters.includeAdditionalCosts) {
        additionalCosts = await AdditionalCostService.getByPeriod(
          dateFrom,
          dateTo
        );
      }

      setState((prev) => ({
        ...prev,
        summary,
        chartData,
        additionalCosts,
        loading: false,
      }));
    } catch (error) {
      console.error("Error loading reports:", error);
      setError(
        error instanceof Error ? error.message : "Có lỗi xảy ra khi tải báo cáo"
      );
      setLoading(false);
    }
  }, [state.filters, setLoading, setError]);

  // Tải báo cáo tháng chi tiết
  const loadMonthlyReport = useCallback(
    async (month: string): Promise<MonthlyReport | null> => {
      try {
        setLoading(true);
        setError(null);

        const monthlyReport = await ReportService.generateMonthlyReport(month);
        return monthlyReport;
      } catch (error) {
        console.error("Error loading monthly report:", error);
        setError(
          error instanceof Error
            ? error.message
            : "Có lỗi xảy ra khi tải báo cáo tháng"
        );
        return null;
      } finally {
        setLoading(false);
      }
    },
    [setLoading, setError]
  );

  // Load khi filters thay đổi
  useEffect(() => {
    loadReports();
  }, [loadReports]);

  return {
    ...state,
    setFilters,
    loadReports,
    loadMonthlyReport,
    setError,
  };
}

// Hook cho chi phí phát sinh
export function useAdditionalCosts() {
  const [costs, setCosts] = useState<AdditionalCost[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadCosts = useCallback(async (dateFrom?: Date, dateTo?: Date) => {
    try {
      setLoading(true);
      setError(null);

      let result: AdditionalCost[];
      if (dateFrom && dateTo) {
        result = await AdditionalCostService.getByPeriod(dateFrom, dateTo);
      } else {
        // Mặc định tải tháng hiện tại
        const now = new Date();
        const from = new Date(now.getFullYear(), now.getMonth(), 1);
        const to = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        result = await AdditionalCostService.getByPeriod(from, to);
      }

      setCosts(result);
    } catch (err) {
      console.error("Error loading additional costs:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Có lỗi xảy ra khi tải chi phí phát sinh"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  const createCost = useCallback(
    async (data: CreateAdditionalCostData): Promise<boolean> => {
      try {
        setLoading(true);
        setError(null);

        const newCost = await AdditionalCostService.create(data);
        setCosts((prev) => [newCost, ...prev]);

        return true;
      } catch (err) {
        console.error("Error creating additional cost:", err);
        setError(
          err instanceof Error
            ? err.message
            : "Có lỗi xảy ra khi tạo chi phí phát sinh"
        );
        return false;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const updateCost = useCallback(
    async (data: UpdateAdditionalCostData): Promise<boolean> => {
      try {
        setLoading(true);
        setError(null);

        await AdditionalCostService.update(data);

        // Reload costs to get fresh data
        await loadCosts();

        return true;
      } catch (err) {
        console.error("Error updating additional cost:", err);
        setError(
          err instanceof Error
            ? err.message
            : "Có lỗi xảy ra khi cập nhật chi phí phát sinh"
        );
        return false;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const deleteCost = useCallback(async (id: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      await AdditionalCostService.delete(id);
      setCosts((prev) => prev.filter((cost) => cost.id !== id));

      return true;
    } catch (err) {
      console.error("Error deleting additional cost:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Có lỗi xảy ra khi xóa chi phí phát sinh"
      );
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const loadCostsByOrder = useCallback(async (orderId: string) => {
    try {
      setLoading(true);
      setError(null);

      const result = await AdditionalCostService.getByOrderId(orderId);
      setCosts(result);
    } catch (err) {
      console.error("Error loading costs by order:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Có lỗi xảy ra khi tải chi phí theo đơn hàng"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    costs,
    loading,
    error,
    loadCosts,
    createCost,
    updateCost,
    deleteCost,
    loadCostsByOrder,
    setError,
  };
}

// Hook cho so sánh báo cáo
export function useComparisonReport() {
  const [comparison, setComparison] = useState<ComparisonReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadComparison = useCallback(
    async (currentPeriod: string, previousPeriod: string) => {
      try {
        setLoading(true);
        setError(null);

        const result = await ReportService.generateComparisonReport(
          currentPeriod,
          previousPeriod
        );
        setComparison(result);
      } catch (err) {
        console.error("Error loading comparison report:", err);
        setError(
          err instanceof Error
            ? err.message
            : "Có lỗi xảy ra khi tải báo cáo so sánh"
        );
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return {
    comparison,
    loading,
    error,
    loadComparison,
    setError,
  };
}

// Hook cho export báo cáo
export function useReportExport() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const exportReport = useCallback(
    async (
      format: "excel" | "pdf" | "csv",
      period: string,
      includeCharts = true,
      includeDetails = true
    ) => {
      try {
        setLoading(true);
        setError(null);

        // TODO: Implement export functionality
        console.log("Exporting report:", {
          format,
          period,
          includeCharts,
          includeDetails,
        });

        // Tạm thời chỉ log, sau này sẽ implement thực tế
        await new Promise((resolve) => setTimeout(resolve, 2000));

        return true;
      } catch (err) {
        console.error("Error exporting report:", err);
        setError(
          err instanceof Error ? err.message : "Có lỗi xảy ra khi xuất báo cáo"
        );
        return false;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return {
    loading,
    error,
    exportReport,
    setError,
  };
}
