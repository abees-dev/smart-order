import { useState } from "react";
import {
  EnhancedTable,
  type ResponsiveTableColumn,
  useEnhancedTableColumns,
  type TableAction,
} from "@/components/tables";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency, formatDate } from "@/utils/format";
import {
  TrendingDown,
  Eye,
  Receipt,
  Building,
  RefreshCw,
  Calendar,
} from "lucide-react";
import type { InputInvoice } from "../types";
import { useInputInvoices } from "../hooks/use-invoice";
import { useIsMobile } from "@/hooks/use-mobile";

export function InputInvoiceListPage() {
  const [page, setPage] = useState(1);
  const changePage = (newPage: number) => {
    setPage(newPage);
  };

  const isMobile = useIsMobile();
  const {
    inputInvoices,
    loading,
    error,
    fetchNextPage,
    hasNextPage,
    isFetching,
    pagination,
    refetchInputInvoices,
  } = useInputInvoices({
    page,
    limit: 10,
  });

  const { createColumn, createCurrencyColumn } =
    useEnhancedTableColumns<InputInvoice>();

  // Define table columns for input invoices
  const columns: ResponsiveTableColumn<InputInvoice>[] = [
    createColumn({
      key: "invoice",
      title: "Thông tin hóa đơn",
      render: (_, record: InputInvoice) => (
        <div className="space-y-1">
          <div className="font-semibold text-foreground">
            <span className="bg-muted px-2 py-1 rounded text-xs mr-2">
              {record.invoiceNumber}
            </span>
          </div>
          <div className="text-sm text-muted-foreground">
            {record.supplierName}
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
      key: "supplierName",
      title: "Nhà cung cấp",
      responsive: false,
      render: (_, record: InputInvoice) => (
        <div>
          <div className="font-medium">{record.supplierName}</div>
          <div className="text-sm text-muted-foreground flex items-center gap-1">
            <Building className="h-3 w-3" />
            Nhà cung cấp
          </div>
        </div>
      ),
    }),
    createColumn({
      key: "invoiceDate",
      title: "Ngày nhập",
      responsive: false,
      render: (_, record: InputInvoice) => formatDate(record.invoiceDate),
    }),
    createColumn({
      key: "status",
      title: "Trạng thái",
      responsive: false,
      align: "center",
      render: (_, record: InputInvoice) => {
        const statusMap = {
          pending: { label: "Chờ xử lý", variant: "warning" as const },
          completed: { label: "Đã hoàn thành", variant: "success" as const },
          cancelled: { label: "Đã hủy", variant: "error" as const },
        };
        const status = statusMap[record.status as keyof typeof statusMap];
        return (
          <Badge variant={"outline"} color={status.variant}>
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
      render: (_, record: InputInvoice) => (
        <Badge variant={record.taxType === "taxed" ? "default" : "outline"}>
          {record.taxType === "taxed" ? "Có thuế" : "Không thuế"}
        </Badge>
      ),
    }),
    createCurrencyColumn("subtotal", "Tiền hàng"),
    createCurrencyColumn("vatAmount", "VAT"),
    createCurrencyColumn("totalAmount", "Tổng tiền"),
  ];

  // Define table actions
  const tableActions: TableAction<InputInvoice>[] = [
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
  const mobileCardRender = (record: InputInvoice) => (
    <div className="space-y-3">
      <div className="flex items-start justify-between">
        <div className="space-y-1 flex-1">
          <h3 className="font-semibold text-base">{record.invoiceNumber}</h3>
          <p className="text-sm text-muted-foreground">{record.supplierName}</p>
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
          <Button
            onClick={() => {
              refetchInputInvoices();
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
          <h1 className="text-2xl font-bold">Hóa đơn đầu vào</h1>
          <p className="text-muted-foreground">
            Quản lý hóa đơn từ các phiếu nhập hàng
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => {
              refetchInputInvoices();
            }}
          >
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
            <div className="text-2xl font-bold">{"Update this"}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng giá trị</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(
                inputInvoices.reduce((sum, inv) => sum + inv.totalAmount, 0)
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tiền hàng</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(
                inputInvoices.reduce((sum, inv) => sum + inv.subtotal, 0)
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
                inputInvoices.reduce((sum, inv) => sum + inv.vatAmount, 0)
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Input Invoices Table */}
      <EnhancedTable<InputInvoice>
        title=""
        columns={columns}
        dataSource={inputInvoices}
        actions={tableActions}
        loading={loading}
        searchable={false}
        emptyText="Không có hóa đơn đầu vào nào"
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
