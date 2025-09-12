import { useState } from "react";
import {
  FileText,
  Plus,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  MoreHorizontal,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ResponsiveTable,
  type ResponsiveTableColumn,
} from "@/components/tables";
import { useInvoices, useInvoiceActions } from "../hooks/use-invoice";
import { InvoiceFormDialog } from "./invoice-form-dialog";
// import { InvoiceDetailDialog } from "./invoice-detail-dialog";
import type { Invoice, InvoiceFilters, InvoiceStatus } from "../types";
import { INVOICE_STATUS_LABELS, INVOICE_STATUS_COLORS } from "../types";

export function InvoicesListPage() {
  const [filters, setFilters] = useState<InvoiceFilters>({});
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [showFormDialog, setShowFormDialog] = useState(false);
  const [showDetailDialog, setShowDetailDialog] = useState(false);

  const {
    invoices,
    loading,
    error,
    hasMore,
    refreshInvoices,
    loadMoreInvoices,
  } = useInvoices(filters);
  const { deleteInvoice, changeInvoiceStatus } = useInvoiceActions();

  const handleSearch = () => {
    setFilters((prev) => ({ ...prev, search: searchTerm }));
  };

  const handleStatusFilter = (status: InvoiceStatus | "all") => {
    setFilters((prev) => ({
      ...prev,
      status: status === "all" ? undefined : status,
    }));
  };

  const handleDeleteInvoice = async (invoice: Invoice) => {
    if (
      window.confirm(
        `Bạn có chắc chắn muốn xóa hóa đơn ${invoice.invoiceNumber}?`
      )
    ) {
      try {
        await deleteInvoice(invoice.id);
        refreshInvoices();
      } catch (error) {
        console.error("Error deleting invoice:", error);
      }
    }
  };

  const handleStatusChange = async (
    invoice: Invoice,
    newStatus: InvoiceStatus
  ) => {
    try {
      await changeInvoiceStatus(invoice.id, newStatus);
      refreshInvoices();
    } catch (error) {
      console.error("Error changing status:", error);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  // Define table columns
  const columns: ResponsiveTableColumn<Invoice>[] = [
    {
      key: "invoiceNumber",
      title: "Số hóa đơn",
      dataIndex: "invoiceNumber",
      render: (value) => (
        <div className="font-medium text-blue-600">{value as string}</div>
      ),
    },
    {
      key: "customerName",
      title: "Khách hàng",
      dataIndex: "customerName",
      render: (value) => <div>{(value as string) || "Khách lẻ"}</div>,
    },
    {
      key: "status",
      title: "Trạng thái",
      dataIndex: "status",
      render: (value) => (
        <Badge variant={INVOICE_STATUS_COLORS[value as InvoiceStatus]}>
          {INVOICE_STATUS_LABELS[value as InvoiceStatus]}
        </Badge>
      ),
    },
    {
      key: "totalAmount",
      title: "Tổng tiền",
      dataIndex: "totalAmount",
      render: (value) => (
        <div className="font-medium text-green-600">
          {formatCurrency(value as number)}
        </div>
      ),
    },
    {
      key: "createdAt",
      title: "Ngày tạo",
      dataIndex: "createdAt",
      render: (_, record) => (
        <div>{record.createdAt.toDate().toLocaleDateString("vi-VN")}</div>
      ),
    },
    {
      key: "actions",
      title: "Thao tác",
      render: (_, record) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={() => {
                setSelectedInvoice(record);
                setShowDetailDialog(true);
              }}
            >
              <Eye className="mr-2 h-4 w-4" />
              Xem chi tiết
            </DropdownMenuItem>
            {record.status === "draft" && (
              <DropdownMenuItem
                onClick={() => {
                  setSelectedInvoice(record);
                  setShowFormDialog(true);
                }}
              >
                <Edit className="mr-2 h-4 w-4" />
                Chỉnh sửa
              </DropdownMenuItem>
            )}
            {record.status === "draft" && (
              <DropdownMenuItem
                onClick={() => handleStatusChange(record, "confirmed")}
              >
                Xác nhận
              </DropdownMenuItem>
            )}
            {record.status === "confirmed" && (
              <DropdownMenuItem
                onClick={() => handleStatusChange(record, "exported")}
              >
                Xuất kho
              </DropdownMenuItem>
            )}
            {record.status === "exported" && (
              <DropdownMenuItem
                onClick={() => handleStatusChange(record, "completed")}
              >
                Hoàn thành
              </DropdownMenuItem>
            )}
            {record.status === "draft" && (
              <DropdownMenuItem
                onClick={() => handleDeleteInvoice(record)}
                className="text-red-600"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Xóa
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  if (error) {
    return (
      <div className="container mx-auto p-4">
        <Card>
          <CardContent className="flex items-center justify-center h-96">
            <div className="text-center">
              <p className="text-red-600 mb-4">{error}</p>
              <Button onClick={refreshInvoices}>Thử lại</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start gap-3">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <FileText className="h-6 w-6" />
            Quản lý hóa đơn
          </h1>
          <p className="text-muted-foreground">
            Quản lý hóa đơn bán hàng và xuất kho
          </p>
        </div>
        <Button onClick={() => setShowFormDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Tạo hóa đơn mới
        </Button>
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
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="flex gap-2">
                <Input
                  placeholder="Tìm theo số hóa đơn hoặc tên khách hàng..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                />
                <Button variant="outline" onClick={handleSearch}>
                  <Search className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <Select
              value={filters.status || "all"}
              onValueChange={(value) =>
                handleStatusFilter(value as InvoiceStatus | "all")
              }
            >
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Lọc theo trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả trạng thái</SelectItem>
                <SelectItem value="draft">Nháp</SelectItem>
                <SelectItem value="confirmed">Đã xác nhận</SelectItem>
                <SelectItem value="exported">Đã xuất kho</SelectItem>
                <SelectItem value="completed">Hoàn thành</SelectItem>
                <SelectItem value="cancelled">Đã hủy</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <div>
        <ResponsiveTable
          dataSource={invoices}
          columns={columns}
          loading={loading}
          emptyText="Không có hóa đơn nào"
        />
        {hasMore && !loading && (
          <div className="p-4 text-center">
            <Button variant="outline" onClick={loadMoreInvoices}>
              Tải thêm
            </Button>
          </div>
        )}
      </div>

      {/* Dialogs */}
      {showFormDialog && (
        <InvoiceFormDialog
          open={showFormDialog}
          onOpenChange={(open) => {
            setShowFormDialog(open);
            if (!open) {
              setSelectedInvoice(null);
            }
          }}
          editInvoice={selectedInvoice}
          onSuccess={() => {
            refreshInvoices();
            setShowFormDialog(false);
            setSelectedInvoice(null);
          }}
        />
      )}

      {selectedInvoice && showDetailDialog && (
        <div>Detail Dialog - To be implemented</div>
      )}
    </div>
  );
}
