import { useState } from "react";
import { Timestamp } from "firebase/firestore";
import { useInputInvoices } from "../hooks/use-invoice";
import { EnhancedTable, type ResponsiveTableColumn } from "@/components/tables";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatCurrency, formatDate } from "@/utils/format";
import {
  TrendingDown,
  Search,
  Filter,
  Eye,
  Receipt,
  Building,
  RefreshCw,
} from "lucide-react";
import type { InputInvoice, InvoiceFilters, TaxType } from "../types";

export function InputInvoiceListPage() {
  const [filters, setFilters] = useState<Omit<InvoiceFilters, "type">>({});

  const { state, refreshInvoices, loadMore, hasMore } = useInputInvoices(
    filters,
    20
  );

  // Define table columns for input invoices
  const columns: ResponsiveTableColumn<InputInvoice>[] = [
    {
      key: "invoiceNumber",
      title: "Số hoá đơn",
      dataIndex: "invoiceNumber",
      render: (value) => (
        <div className="font-mono font-medium">{value as string}</div>
      ),
    },
    {
      key: "supplierName",
      title: "Nhà cung cấp",
      dataIndex: "supplierName",
      render: (value) => (
        <div>
          <div className="font-medium">{value as string}</div>
          <div className="text-sm text-muted-foreground flex items-center gap-1">
            <Building className="h-3 w-3" />
            Nhà cung cấp
          </div>
        </div>
      ),
    },
    {
      key: "invoiceDate",
      title: "Ngày nhập",
      dataIndex: "invoiceDate",
      render: (value) => formatDate(value as Date | Timestamp),
    },
    {
      key: "status",
      title: "Trạng thái",
      dataIndex: "status",
      render: (value) => {
        const statusMap = {
          pending: { label: "Chờ xử lý", variant: "secondary" as const },
          completed: { label: "Đã hoàn thành", variant: "default" as const },
          cancelled: { label: "Đã hủy", variant: "destructive" as const },
        };
        const status = statusMap[value as keyof typeof statusMap];
        return <Badge variant={status.variant}>{status.label}</Badge>;
      },
    },
    {
      key: "taxType",
      title: "Thuế",
      dataIndex: "taxType",
      render: (value) => (
        <Badge variant={value === "taxed" ? "default" : "outline"}>
          {value === "taxed" ? "Có thuế" : "Không thuế"}
        </Badge>
      ),
    },
    {
      key: "subtotal",
      title: "Tiền hàng",
      dataIndex: "subtotal",
      align: "right",
      render: (value) => (
        <div className="font-medium">{formatCurrency(value as number)}</div>
      ),
    },
    {
      key: "vatAmount",
      title: "VAT",
      dataIndex: "vatAmount",
      align: "right",
      render: (value) => (
        <div className="font-medium text-orange-600">
          {formatCurrency(value as number)}
        </div>
      ),
    },
    {
      key: "totalAmount",
      title: "Tổng tiền",
      dataIndex: "totalAmount",
      align: "right",
      render: (value) => (
        <div className="font-bold text-green-600">
          {formatCurrency(value as number)}
        </div>
      ),
    },
    {
      key: "actions",
      title: "Thao tác",
      render: () => (
        <Button variant="ghost" size="sm">
          <Eye className="h-4 w-4" />
        </Button>
      ),
    },
  ];

  const handleFilterChange = (
    key: keyof Omit<InvoiceFilters, "type">,
    value: string | undefined
  ) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value || undefined,
    }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <TrendingDown className="h-6 w-6 text-red-600" />
            Hoá đơn đầu vào
          </h1>
          <p className="text-muted-foreground">
            Quản lý hoá đơn nhập hàng từ nhà cung cấp
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={refreshInvoices}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Làm mới
          </Button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Tổng hoá đơn
                </p>
                <p className="text-2xl font-bold">
                  {state.total.toLocaleString()}
                </p>
              </div>
              <Receipt className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Tổng giá trị
                </p>
                <p className="text-2xl font-bold text-red-600">
                  {formatCurrency(
                    state.invoices.reduce(
                      (sum, inv) => sum + inv.totalAmount,
                      0
                    )
                  )}
                </p>
              </div>
              <TrendingDown className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Tổng VAT
                </p>
                <p className="text-2xl font-bold text-orange-600">
                  {formatCurrency(
                    state.invoices.reduce((sum, inv) => sum + inv.vatAmount, 0)
                  )}
                </p>
              </div>
              <Receipt className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Bộ lọc
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Tìm kiếm</label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Số hoá đơn, nhà cung cấp..."
                  value={filters.search || ""}
                  onChange={(e) => handleFilterChange("search", e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Loại thuế</label>
              <Select
                value={filters.taxType || "all"}
                onValueChange={(value) =>
                  handleFilterChange(
                    "taxType",
                    value === "all" ? undefined : (value as TaxType)
                  )
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  <SelectItem value="taxed">Có thuế</SelectItem>
                  <SelectItem value="non-taxed">Không thuế</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Invoice Table */}
      <EnhancedTable<InputInvoice>
        dataSource={state.invoices}
        columns={columns}
        loading={state.loading}
        onLoadMore={loadMore}
        hasMore={hasMore}
        searchable={false}
        actions={[]}
        emptyText={
          <div className="text-center py-8">
            <Receipt className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-lg font-medium">Chưa có hoá đơn nào</p>
            <p className="text-muted-foreground">
              Các hoá đơn nhập hàng sẽ hiển thị ở đây
            </p>
          </div>
        }
      />
    </div>
  );
}
