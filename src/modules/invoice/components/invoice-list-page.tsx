import { useState } from "react";
import { Timestamp } from "firebase/firestore";
import { useInvoices } from "../hooks/use-invoice";
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
  FileText,
  Receipt,
  Search,
  Filter,
  Eye,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import type { InvoiceView, InvoiceFilters, TaxType } from "../types";

export function InvoiceListPage() {
  const [filters, setFilters] = useState<InvoiceFilters>({});

  const { state, refreshInvoices, loadMore, hasMore } = useInvoices(
    filters,
    20
  );

  // Define table columns
  const columns: ResponsiveTableColumn<InvoiceView>[] = [
    {
      key: "invoiceNumber",
      title: "Số hoá đơn",
      dataIndex: "invoiceNumber",
      render: (value) => (
        <div className="font-mono font-medium">{value as string}</div>
      ),
    },
    {
      key: "type",
      title: "Loại",
      dataIndex: "type",
      render: (value) => (
        <Badge variant={value === "input" ? "secondary" : "default"}>
          {value === "input" ? (
            <>
              <TrendingDown className="h-3 w-3 mr-1" />
              Đầu vào
            </>
          ) : (
            <>
              <TrendingUp className="h-3 w-3 mr-1" />
              Đầu ra
            </>
          )}
        </Badge>
      ),
    },
    {
      key: "partnerName",
      title: "Đối tác",
      dataIndex: "partnerName",
      render: (value, record) => (
        <div>
          <div className="font-medium">{value as string}</div>
          <div className="text-sm text-muted-foreground">
            {record.type === "input" ? "Nhà cung cấp" : "Khách hàng"}
          </div>
        </div>
      ),
    },
    {
      key: "invoiceDate",
      title: "Ngày hoá đơn",
      dataIndex: "invoiceDate",
      render: (value) => formatDate(value as Date | Timestamp),
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
      render: (_, record) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => alert(`View invoice ${record.id}`)}
        >
          <Eye className="h-4 w-4" />
        </Button>
      ),
    },
  ];

  const handleFilterChange = (
    key: keyof InvoiceFilters,
    value: string | undefined
  ) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value || undefined,
    }));
  };

  const resetFilters = () => {
    setFilters({});
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Quản lý hoá đơn</h1>
          <p className="text-muted-foreground">
            Theo dõi hoá đơn đầu vào và đầu ra của doanh nghiệp
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={refreshInvoices}>
            <Receipt className="h-4 w-4 mr-2" />
            Làm mới
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      {/* <InvoiceStatsCards /> */}

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
                  placeholder="Số hoá đơn, tên đối tác..."
                  value={filters.search || ""}
                  onChange={(e) => handleFilterChange("search", e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Loại hoá đơn</label>
              <Select
                value={filters.type || "all"}
                onValueChange={(value) =>
                  handleFilterChange(
                    "type",
                    value === "all" ? undefined : value
                  )
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  <SelectItem value="input">Hoá đơn đầu vào</SelectItem>
                  <SelectItem value="output">Hoá đơn đầu ra</SelectItem>
                </SelectContent>
              </Select>
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

            <div className="space-y-2">
              <label className="text-sm font-medium">Thao tác</label>
              <Button
                variant="outline"
                onClick={resetFilters}
                className="w-full"
              >
                Xoá bộ lọc
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Invoice Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Danh sách hoá đơn ({state.total})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <EnhancedTable<InvoiceView>
            dataSource={state.invoices}
            columns={columns}
            loading={state.loading}
            onLoadMore={loadMore}
            hasMore={hasMore}
            searchable={false} // Sử dụng filter riêng
            actions={[]}
          />
        </CardContent>
      </Card>

      {/* Invoice Detail Dialog */}
      {/* {selectedInvoice && (
        <InvoiceDetailDialog
          invoiceId={selectedInvoice.id}
          invoiceType={selectedInvoice.type}
          open={!!selectedInvoice}
          onOpenChange={(open: boolean) => !open && setSelectedInvoice(null)}
        />
      )} */}
    </div>
  );
}
