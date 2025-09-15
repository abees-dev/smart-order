import { useState } from "react";
import type { DateRange } from "react-day-picker";
import { useOutputInvoicesWithPagination } from "../hooks/use-invoice";
import {
  EnhancedTable,
  type ResponsiveTableColumn,
  useEnhancedTableColumns,
  type TableAction,
} from "@/components/tables";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatCurrency, formatDate } from "@/utils/format";
import {
  TrendingUp,
  Search,
  Eye,
  Receipt,
  User,
  RefreshCw,
  ShoppingCart,
  Calendar,
} from "lucide-react";
import type { OutputInvoice, InvoiceFilters, TaxType } from "../types";

export function OutputInvoiceListPage() {
  const [dateRange, setDateRange] = useState<DateRange | undefined>();

  const {
    outputInvoices,
    loading,
    error,
    hasMore,
    loadMore,
    refreshOutputInvoices,
    total,
    page,
    pageSize,
    changePage,
    isMobile,
    loadingMore,
    filters,
    updateFilters,
  } = useOutputInvoicesWithPagination({}, 7);

  const { createColumn, createCurrencyColumn } =
    useEnhancedTableColumns<OutputInvoice>();

  const handleSearch = (value: string) => {
    updateFilters({ ...filters, search: value || undefined });
  };

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
              <Badge variant="default">Hoàn thành</Badge>
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
      key: "customerName",
      title: "Khách hàng",
      responsive: false,
      render: (_, record: OutputInvoice) => (
        <div>
          <div className="font-medium">{record.customerName || "Khách lẻ"}</div>
          <div className="text-sm text-muted-foreground flex items-center gap-1">
            <User className="h-3 w-3" />
            Khách hàng
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
          pending: { label: "Chờ xử lý", variant: "secondary" as const },
          completed: { label: "Đã hoàn thành", variant: "default" as const },
          cancelled: { label: "Đã hủy", variant: "destructive" as const },
        };
        const status = statusMap[record.status as keyof typeof statusMap];
        return <Badge variant={status.variant}>{status.label}</Badge>;
      },
    }),
    createColumn({
      key: "taxType",
      title: "Thuế",
      responsive: false,
      align: "center",
      render: (_, record: OutputInvoice) => (
        <Badge variant={record.taxType === "taxed" ? "default" : "outline"}>
          {record.taxType === "taxed" ? "Có thuế" : "Không thuế"}
        </Badge>
      ),
    }),
    createCurrencyColumn("subtotal", "Tiền hàng"),
    createCurrencyColumn("vatAmount", "VAT"),
    createCurrencyColumn("totalAmount", "Tổng tiền"),
  ];

  const handleFilterChange = (
    key: keyof Omit<InvoiceFilters, "type">,
    value: string | undefined
  ) => {
    updateFilters({
      ...filters,
      [key]: value || undefined,
    });
  };

  const handleDateRangeChange = (range: DateRange | undefined) => {
    setDateRange(range);
    updateFilters({
      ...filters,
      dateFrom: range?.from,
      dateTo: range?.to,
    });
  };

  // Define table actions
  const tableActions: TableAction<OutputInvoice>[] = [
    {
      key: "view",
      label: "Xem chi tiết",
      icon: Eye,
      onClick: (record) => {
        console.log("View invoice:", record.id);
      },
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

  if (error) {
    return (
      <div className="p-6">
        <div className="text-center text-red-600">
          <p>{error}</p>
          <Button onClick={refreshOutputInvoices} className="mt-2">
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
          <Button variant="outline" onClick={refreshOutputInvoices}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Làm mới
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng hóa đơn</CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{total.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Tổng doanh thu
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(
                outputInvoices.reduce((sum, inv) => sum + inv.totalAmount, 0)
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tiền hàng</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(
                outputInvoices.reduce((sum, inv) => sum + inv.subtotal, 0)
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng VAT</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(
                outputInvoices.reduce((sum, inv) => sum + inv.vatAmount, 0)
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Tìm kiếm hóa đơn..."
                value={filters.search || ""}
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
                {/* Add customer options here */}
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
      </Card>

      {/* Output Invoices Table */}
      <EnhancedTable<OutputInvoice>
        title=""
        columns={columns}
        dataSource={outputInvoices}
        actions={tableActions}
        loading={loading}
        searchable={false}
        emptyText="Không có hóa đơn đầu ra nào"
        mobileCardRender={mobileCardRender}
        rowKey="id"
        hasMore={hasMore}
        onLoadMore={loadMore}
        loadingMore={loadingMore}
        pagination={
          !isMobile
            ? {
                current: page,
                pageSize: pageSize,
                total: total,
                onChange: (newPage: number) => changePage(newPage),
              }
            : undefined
        }
      />
    </div>
  );
}
