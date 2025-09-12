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
  CheckCircle,
  Truck,
  Package,
  X,
  AlertCircle,
  FileEdit,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
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
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ResponsiveTable,
  type ResponsiveTableColumn,
} from "@/components/tables";
import { OrderFormDialog } from "./order-form-dialog";
import {
  ORDER_STATUS_COLORS,
  ORDER_STATUS_LABELS,
  type Order,
  type OrderFilters,
  type OrderStatus,
} from "../types";
import { useOrderActions, useOrders } from "../hooks/use-order";
// import { InvoiceDetailDialog } from "./invoice-detail-dialog";

export function OrdersListPage() {
  const [filters, setFilters] = useState<OrderFilters>({});
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showFormDialog, setShowFormDialog] = useState(false);
  const [showDetailDialog, setShowDetailDialog] = useState(false);

  const { orders, loading, error, hasMore, refreshOrders, loadMoreOrders } =
    useOrders(filters);

  const { deleteOrder, changeOrderStatus } = useOrderActions();

  const handleSearch = () => {
    setFilters((prev) => ({ ...prev, search: searchTerm }));
  };

  const handleStatusFilter = (status: OrderStatus | "all") => {
    setFilters((prev) => ({
      ...prev,
      status: status === "all" ? undefined : status,
    }));
  };

  const handleDeleteInvoice = async (order: Order) => {
    if (
      window.confirm(`Bạn có chắc chắn muốn xóa hóa đơn ${order.orderNumber}?`)
    ) {
      try {
        await deleteOrder(order.id);
        refreshOrders();
      } catch (error) {
        console.error("Error deleting order:", error);
      }
    }
  };

  const handleStatusChange = async (order: Order, newStatus: OrderStatus) => {
    const statusMessages: Record<Exclude<OrderStatus, "draft">, string> = {
      confirmed: "xác nhận",
      exported: "xuất kho",
      completed: "hoàn thành",
      cancelled: "hủy",
    };

    const actionMessage =
      statusMessages[newStatus as keyof typeof statusMessages];

    // Special message for cancelling exported order
    let confirmMessage = `Bạn có chắc chắn muốn ${actionMessage} hóa đơn ${order.orderNumber}?`;

    if (newStatus === "cancelled" && order.status === "exported") {
      confirmMessage +=
        "\n\n⚠️ Hóa đơn này đã được xuất kho. Khi hủy, hệ thống sẽ tự động hoàn lại số tồn kho của các vật tư đã xuất.";
    } else if (newStatus === "exported") {
      confirmMessage +=
        "\n\n📦 Hệ thống sẽ tự động trừ tồn kho của các vật tư trong hóa đơn này.";
    }

    if (window.confirm(confirmMessage)) {
      try {
        await changeOrderStatus(order.id, newStatus);
        refreshOrders();

        // Show success message with inventory info
        if (newStatus === "cancelled" && order.status === "exported") {
          alert("✅ Hóa đơn đã được hủy thành công. Tồn kho đã được hoàn lại.");
        } else if (newStatus === "exported") {
          alert(
            "✅ Hóa đơn đã được xuất kho thành công. Tồn kho đã được cập nhật."
          );
        }
      } catch (error) {
        console.error("Error changing status:", error);
        if (error instanceof Error) {
          alert(`❌ Lỗi: ${error.message}`);
        } else {
          alert("❌ Có lỗi xảy ra khi thay đổi trạng thái hóa đơn");
        }
      }
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  // Helper function to get status icon
  const getStatusIcon = (status: OrderStatus) => {
    const statusIcons = {
      draft: FileEdit,
      confirmed: CheckCircle,
      exported: Truck,
      completed: Package,
      cancelled: X,
    };

    return statusIcons[status];
  };

  // Define table columns
  const columns: ResponsiveTableColumn<Order>[] = [
    {
      key: "orderNumber",
      title: "Số đơn hàng",
      dataIndex: "orderNumber",
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
      render: (value) => {
        const status = value as OrderStatus;
        const StatusIcon = getStatusIcon(status);
        return (
          <Badge variant={ORDER_STATUS_COLORS[status]} className="gap-1">
            <StatusIcon className="h-3 w-3" />
            {ORDER_STATUS_LABELS[status]}
          </Badge>
        );
      },
    },
    {
      key: "inventoryStatus",
      title: "Tồn kho",
      render: (_, record) => {
        const status = record.status as OrderStatus;
        if (status === "exported") {
          return (
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge
                  variant="outline"
                  className="gap-1 text-orange-600 border-orange-200"
                >
                  <Truck className="h-3 w-3" />
                  Đã trừ kho
                </Badge>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-sm">Tồn kho đã được trừ khi xuất hàng</p>
              </TooltipContent>
            </Tooltip>
          );
        } else if (status === "cancelled" && record.exportedAt) {
          return (
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge
                  variant="outline"
                  className="gap-1 text-green-600 border-green-200"
                >
                  <Package className="h-3 w-3" />
                  Đã hoàn kho
                </Badge>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-sm">Tồn kho đã được hoàn lại do hủy đơn</p>
              </TooltipContent>
            </Tooltip>
          );
        } else if (status === "completed") {
          return (
            <Badge
              variant="outline"
              className="gap-1 text-blue-600 border-blue-200"
            >
              <CheckCircle className="h-3 w-3" />
              Đã giao
            </Badge>
          );
        }
        return (
          <Badge
            variant="outline"
            className="gap-1 text-gray-500 border-gray-200"
          >
            <AlertCircle className="h-3 w-3" />
            Chưa ảnh hưởng
          </Badge>
        );
      },
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
          <DropdownMenuContent align="end" className="w-48">
            {/* View Details */}
            <DropdownMenuItem
              onClick={() => {
                setSelectedOrder(record);
                setShowDetailDialog(true);
              }}
            >
              <Eye className="mr-2 h-4 w-4" />
              Xem chi tiết
            </DropdownMenuItem>

            {/* Edit (only for draft) */}
            {record.status === "draft" && (
              <DropdownMenuItem
                onClick={() => {
                  setSelectedOrder(record);
                  setShowFormDialog(true);
                }}
              >
                <Edit className="mr-2 h-4 w-4" />
                Chỉnh sửa
              </DropdownMenuItem>
            )}

            {/* Status Actions */}
            {record.status === "draft" && (
              <>
                <DropdownMenuItem
                  onClick={() => handleStatusChange(record, "confirmed")}
                  className="text-green-600"
                >
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Xác nhận đơn hàng
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleStatusChange(record, "cancelled")}
                  className="text-red-600"
                >
                  <X className="mr-2 h-4 w-4" />
                  Hủy đơn hàng
                </DropdownMenuItem>
              </>
            )}

            {record.status === "confirmed" && (
              <>
                <DropdownMenuItem
                  onClick={() => handleStatusChange(record, "exported")}
                  className="text-blue-600"
                >
                  <Truck className="mr-2 h-4 w-4" />
                  Xuất kho
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleStatusChange(record, "cancelled")}
                  className="text-red-600"
                >
                  <X className="mr-2 h-4 w-4" />
                  Hủy đơn hàng
                </DropdownMenuItem>
              </>
            )}

            {record.status === "exported" && (
              <>
                <DropdownMenuItem
                  onClick={() => handleStatusChange(record, "completed")}
                  className="text-purple-600"
                >
                  <Package className="mr-2 h-4 w-4" />
                  Hoàn thành
                </DropdownMenuItem>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <DropdownMenuItem
                      onClick={() => handleStatusChange(record, "cancelled")}
                      className="text-red-600"
                    >
                      <X className="mr-2 h-4 w-4" />
                      Hủy đơn hàng
                    </DropdownMenuItem>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-sm">
                      ⚠️ Hủy hóa đơn đã xuất kho sẽ hoàn lại tồn kho
                    </p>
                  </TooltipContent>
                </Tooltip>
              </>
            )}

            {/* Status indicator for completed/cancelled */}
            {(record.status === "completed" ||
              record.status === "cancelled") && (
              <DropdownMenuItem disabled className="text-muted-foreground">
                {record.status === "completed" ? (
                  <>
                    <Package className="mr-2 h-4 w-4" />
                    Đã hoàn thành
                  </>
                ) : (
                  <>
                    <AlertCircle className="mr-2 h-4 w-4" />
                    Đã hủy
                  </>
                )}
              </DropdownMenuItem>
            )}

            {/* Delete (only for draft) */}
            {record.status === "draft" && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => handleDeleteInvoice(record)}
                  className="text-red-600 focus:text-red-600"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Xóa hóa đơn
                </DropdownMenuItem>
              </>
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
              <Button onClick={refreshOrders}>Thử lại</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <TooltipProvider>
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
          <Tooltip>
            <TooltipTrigger asChild>
              <Button onClick={() => setShowFormDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Tạo hóa đơn mới
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Tạo hóa đơn bán hàng mới</p>
            </TooltipContent>
          </Tooltip>
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
                  handleStatusFilter(value as OrderStatus | "all")
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
            dataSource={orders}
            columns={columns}
            loading={loading}
            emptyText="Không có hóa đơn nào"
          />
          {hasMore && !loading && (
            <div className="p-4 text-center">
              <Button variant="outline" onClick={loadMoreOrders}>
                Tải thêm
              </Button>
            </div>
          )}
        </div>

        {/* Dialogs */}
        {showFormDialog && (
          <OrderFormDialog
            open={showFormDialog}
            onOpenChange={(open) => {
              setShowFormDialog(open);
              if (!open) {
                setSelectedOrder(null);
              }
            }}
            editOrder={selectedOrder}
            onSuccess={() => {
              refreshOrders();
              setShowFormDialog(false);
              setSelectedOrder(null);
            }}
          />
        )}

        {selectedOrder && showDetailDialog && (
          <div>Detail Dialog - To be implemented</div>
        )}
      </div>
    </TooltipProvider>
  );
}
