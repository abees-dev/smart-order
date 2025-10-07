import {
  useOutputInvoices,
  useOutputInvoiceSummary,
} from "../hooks/use-invoice";
import {
  EnhancedTable,
  type ResponsiveTableColumn,
  useEnhancedTableColumns,
  type TableAction,
} from "@/components/tables";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency, formatDate } from "@/utils/format";
import {
  TrendingUp,
  Eye,
  Receipt,
  RefreshCw,
  ShoppingCart,
  Banknote,
} from "lucide-react";
import type { OutputInvoice } from "../types";
import { useIsMobile } from "@/hooks/use-mobile";
import { usePermissions } from "@/components/guards";
import { Actions, Resources } from "@/constants";
import { useFilterStore } from "@/stores/filter.store";
const KEY = Resources.INVOICES + "_OUTPUT";
export function OutputInvoiceListPage() {
  const { filters, updateFilter } = useFilterStore();
  const isMobile = useIsMobile();
  const changePage = (newPage: number) => {
    updateFilter(KEY, { page: newPage });
  };
  const { hasPermission } = usePermissions();

  const {
    outputInvoices,
    refetchOutputInvoices,
    fetchNextPage,
    hasNextPage,
    pagination,
    isFetching,
    error,
  } = useOutputInvoices({
    page: filters[KEY]?.page || 1,
    limit: 10,
  });

  // Get summary data from API
  const {
    summary,
    loading: summaryLoading,
    error: summaryError,
    refetchSummary,
  } = useOutputInvoiceSummary({});

  const { createColumn, createCurrencyColumn } =
    useEnhancedTableColumns<OutputInvoice>();

  // Define table columns for output invoices
  const columns: ResponsiveTableColumn<OutputInvoice>[] = [
    createColumn({
      key: "invoice",
      title: "Thông tin hóa đơn",
      render: (_, record: OutputInvoice) => (
        <div className="space-y-1">
          <div className="font-semibold text-foreground">
            <span className="bg-muted px-2 py-1 rounded text-xs mr-2">
              {record.invoiceNumber}
            </span>
          </div>
          <div className="text-sm text-muted-foreground">
            {record.customerName || "Khách lẻ"}
          </div>
          <div className="flex items-center gap-2 sm:hidden">
            {record.status === "completed" ? (
              <Badge variant="outline" color="success">
                Hoàn thành
              </Badge>
            ) : record.status === "cancelled" ? (
              <Badge variant="destructive">Đã hủy</Badge>
            ) : (
              <Badge variant="secondary">Chờ xử lý</Badge>
            )}
            <Badge variant={record.taxType === "taxed" ? "default" : "outline"}>
              {record.taxType === "taxed" ? "Có thuế" : "Không thuế"}
            </Badge>
          </div>
          <div className="text-sm font-semibold text-green-600 sm:hidden">
            {formatCurrency(record.totalAmount)}
          </div>
          <div className="text-xs text-muted-foreground sm:hidden">
            {formatDate(record.invoiceDate)}
          </div>
        </div>
      ),
    }),

    createColumn({
      key: "invoiceDate",
      title: "Ngày bán",
      responsive: false,
      render: (_, record: OutputInvoice) => formatDate(record.invoiceDate),
    }),
    createColumn({
      key: "status",
      title: "Trạng thái",
      responsive: false,
      align: "center",
      render: (_, record: OutputInvoice) => {
        const statusMap = {
          pending: { label: "Chờ xử lý", variant: "warning" as const },
          completed: { label: "Đã hoàn thành", variant: "success" as const },
          cancelled: { label: "Đã hủy", variant: "error" as const },
        };
        const status = statusMap[record.status as keyof typeof statusMap];
        return (
          <Badge color={status.variant} variant={"outline"}>
            {status.label}
          </Badge>
        );
      },
    }),
    createColumn({
      key: "taxType",
      title: "Thuế",
      responsive: false,
      align: "center",
      render: (_, record: OutputInvoice) => (
        <Badge
          variant={"outline"}
          color={record.taxType === "taxed" ? "info" : "neutral"}
        >
          {record.taxType === "taxed" ? "Có thuế" : "Không thuế"}
        </Badge>
      ),
    }),
    createCurrencyColumn("subtotal", "Tiền hàng"),
    createCurrencyColumn("vatAmount", "VAT"),
    createCurrencyColumn("totalAmount", "Tổng tiền"),
  ];
  // Define table actions
  const tableActions: TableAction<OutputInvoice>[] = [
    {
      key: "view",
      label: "Xem chi tiết",
      icon: Eye,
      onClick: (record) => {
        console.log("View invoice:", record.id);
      },
      show: () => hasPermission(Resources.INVOICES, Actions.DETAIL),
    },
  ];

  // Mobile card renderer
  const mobileCardRender = (record: OutputInvoice) => (
    <div className="space-y-3">
      <div className="flex items-start justify-between">
        <div className="space-y-1 flex-1">
          <h3 className="font-semibold text-base">{record.invoiceNumber}</h3>
          <p className="text-sm text-muted-foreground">
            {record.customerName || "Khách lẻ"}
          </p>
        </div>
        <div className="text-right">
          <p className="font-semibold text-green-600">
            {formatCurrency(record.totalAmount)}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 text-sm">
        <div>
          <span className="text-muted-foreground">Tiền hàng:</span>
          <p className="font-medium">{formatCurrency(record.subtotal)}</p>
        </div>
        <div>
          <span className="text-muted-foreground">VAT:</span>
          <p className="font-medium">{formatCurrency(record.vatAmount)}</p>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <Badge
          variant={
            record.status === "completed"
              ? "default"
              : record.status === "cancelled"
              ? "destructive"
              : "secondary"
          }
        >
          {record.status === "completed"
            ? "Hoàn thành"
            : record.status === "cancelled"
            ? "Đã hủy"
            : "Chờ xử lý"}
        </Badge>
        <span className="text-xs text-muted-foreground">
          {formatDate(record.invoiceDate)}
        </span>
      </div>
    </div>
  );

  if (error || summaryError) {
    return (
      <div className="">
        <div className="text-center text-red-600">
          <p>{error || summaryError}</p>
          <Button
            onClick={() => {
              refetchOutputInvoices();
              refetchSummary();
            }}
            className="mt-2"
          >
            Thử lại
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start gap-3">
        <div>
          <h1 className="text-2xl font-bold">Hóa đơn đầu ra</h1>
          <p className="text-muted-foreground">
            Quản lý hóa đơn từ các đơn hàng đã hoàn thành
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            disabled={isFetching || summaryLoading}
            onClick={() => {
              refetchOutputInvoices();
              refetchSummary();
            }}
          >
            <RefreshCw
              className={`mr-2 h-4 w-4 ${
                isFetching || summaryLoading ? "animate-spin" : ""
              }`}
            />
            Làm mới
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Total Invoices Card */}
        <Card className="hover:shadow-md transition-all duration-200 hover:scale-[1.02]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium">Tổng hóa đơn</CardTitle>
            <div className="h-8 w-8 rounded-full bg-muted/50 flex items-center justify-center hover:bg-muted transition-colors">
              <Receipt className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            {summaryLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-8 w-20 animate-pulse" />
                <Skeleton className="h-4 w-32 animate-pulse" />
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold transition-colors">
                  {summary.totalCount.toLocaleString()}
                </div>
                <div className="text-xs text-muted-foreground flex items-center gap-2 mt-1">
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-muted/50">
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    Có thuế: {summary.taxedCount}
                  </span>
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-muted/50">
                    <div className="w-2 h-2 rounded-full bg-gray-400"></div>
                    Không thuế: {summary.nonTaxedCount}
                  </span>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Total Revenue Card */}
        <Card className="hover:shadow-md transition-all duration-200 hover:scale-[1.02]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium">
              Tổng doanh thu
            </CardTitle>
            <div className="h-8 w-8 rounded-full bg-muted/50 flex items-center justify-center hover:bg-muted transition-colors">
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            {summaryLoading ? (
              <Skeleton className="h-8 w-32 animate-pulse" />
            ) : (
              <div className="text-2xl font-bold transition-colors">
                {formatCurrency(summary.totalAmount)}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Subtotal Card */}
        <Card className="hover:shadow-md transition-all duration-200 hover:scale-[1.02]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium">Tiền hàng</CardTitle>
            <div className="h-8 w-8 rounded-full bg-muted/50 flex items-center justify-center hover:bg-muted transition-colors">
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            {summaryLoading ? (
              <Skeleton className="h-8 w-32 animate-pulse" />
            ) : (
              <div className="text-2xl font-bold transition-colors">
                {formatCurrency(summary.totalSubtotal)}
              </div>
            )}
          </CardContent>
        </Card>

        {/* VAT Card */}
        <Card className="hover:shadow-md transition-all duration-200 hover:scale-[1.02]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Tổng VAT
            </CardTitle>
            <div className="h-8 w-8 rounded-full bg-muted/50 flex items-center justify-center hover:bg-muted transition-colors">
              <Banknote className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            {summaryLoading ? (
              <Skeleton className="h-8 w-32 animate-pulse" />
            ) : (
              <div className="text-2xl font-bold transition-colors">
                {formatCurrency(summary.totalVatAmount)}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      {/* <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Tìm kiếm hóa đơn..."
                // value={filters.search || ""}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-9"
              />
            </div>

            <Select
              value={filters.partnerId || "all"}
              onValueChange={(value) =>
                handleFilterChange("partnerId", value || undefined)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Chọn khách hàng" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả khách hàng</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={filters.taxType || "all"}
              onValueChange={(value) =>
                handleFilterChange("taxType", (value as TaxType) || undefined)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Loại thuế" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                <SelectItem value="taxed">Có thuế</SelectItem>
                <SelectItem value="tax_free">Không thuế</SelectItem>
              </SelectContent>
            </Select>

            <DateRangePicker
              date={dateRange}
              onDateChange={handleDateRangeChange}
            />
          </div>
        </CardContent>
      </Card> */}

      {/* Output Invoices Table */}
      <EnhancedTable<OutputInvoice>
        title=""
        columns={columns}
        dataSource={outputInvoices}
        actions={tableActions}
        loading={isFetching}
        searchable={false}
        emptyText="Không có hóa đơn đầu ra nào"
        mobileCardRender={mobileCardRender}
        rowKey="id"
        hasMore={hasNextPage}
        onLoadMore={fetchNextPage}
        loadingMore={isFetching}
        pagination={
          !isMobile
            ? {
                current: pagination.page,
                pageSize: pagination.limit,
                total: pagination.total,
                onChange: (newPage: number) => changePage(newPage),
              }
            : undefined
        }
      />
    </div>
  );
}

export default OutputInvoiceListPage;
