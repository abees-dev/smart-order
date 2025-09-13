import { useState } from "react";
import {
  Plus,
  Eye,
  Edit,
  Trash2,
  CheckCircle,
  Truck,
  Package,
  X,
  FileEdit,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  EnhancedTable,
  useEnhancedTableColumns,
  type ResponsiveTableColumn,
  type TableAction,
} from "@/components/tables";
import { useConfirmDialog } from "@/components/ui/confirm-dialog";
import { toast } from "sonner";
import { OrderFormDialog } from "./order-form-dialog";
import {
  ORDER_STATUS_COLORS,
  ORDER_STATUS_LABELS,
  type Order,
  type OrderFilters,
  type OrderStatus,
} from "../types";
import { useOrderActions, useOrders } from "../hooks/use-order";

export function OrdersListPage() {
  const [filters, setFilters] = useState<OrderFilters>({});
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showFormDialog, setShowFormDialog] = useState(false);

  const { showConfirm, ConfirmDialog } = useConfirmDialog();

  const {
    orders,
    loading,
    error,
    hasMore,
    refreshOrders,
    loadMore,
    changePage,
    isMobile,
    loadingMore,
    page,
    total,
    pageSize,
  } = useOrders(filters);

  const { deleteOrder, changeOrderStatus } = useOrderActions();
  const { createColumn, createCurrencyColumn, createDateColumn } =
    useEnhancedTableColumns<Order>();

  const handleSearch = (value: string) => {
    setFilters((prev) => ({ ...prev, search: value || undefined }));
  };

  const handleStatusFilter = (status: OrderStatus | "all") => {
    setFilters((prev) => ({
      ...prev,
      status: status === "all" ? undefined : status,
    }));
  };

  const handleDeleteOrder = async (order: Order) => {
    showConfirm({
      title: "Xác nhận xóa đơn hàng",
      description: `Bạn có chắc chắn muốn xóa đơn ${order.orderNumber}?\n\nHành động này không thể hoàn tác.`,
      confirmText: "Xóa đơn hàng",
      cancelText: "Hủy",
      variant: "destructive",
      onConfirm: async () => {
        try {
          await deleteOrder(order.id);
          refreshOrders();
          toast.success("Đơn hàng đã được xóa thành công.");
        } catch (error) {
          console.error("Error deleting order:", error);
          toast.error("Có lỗi xảy ra khi xóa đơn hàng.");
        }
      },
    });
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

    let description = `Bạn có chắc chắn muốn ${actionMessage} đơn hàng ${order.orderNumber}?`;

    if (newStatus === "cancelled" && order.status === "exported") {
      description +=
        "\n\n⚠️ Đơn hàng này đã được xuất kho. Khi hủy, hệ thống sẽ tự động hoàn lại số tồn kho của các vật tư đã xuất.";
    } else if (newStatus === "exported") {
      description +=
        "\n\n📦 Hệ thống sẽ tự động trừ tồn kho của các vật tư trong đơn hàng này.";
    }

    const variant = newStatus === "cancelled" ? "destructive" : "warning";

    showConfirm({
      title: `${
        actionMessage.charAt(0).toUpperCase() + actionMessage.slice(1)
      } đơn hàng`,
      description,
      confirmText:
        actionMessage.charAt(0).toUpperCase() + actionMessage.slice(1),
      cancelText: "Hủy",
      variant,
      onConfirm: async () => {
        try {
          await changeOrderStatus(order.id, newStatus);
          refreshOrders();

          if (newStatus === "cancelled" && order.status === "exported") {
            toast.success(
              `Đơn hàng đã được hủy thành công. Tồn kho đã được hoàn lại.`
            );
          } else if (newStatus === "exported") {
            toast.success(
              `Đơn hàng đã được xuất kho thành công. Tồn kho đã được cập nhật.`
            );
          } else {
            toast.success(`Đơn hàng đã được ${actionMessage} thành công.`);
          }
        } catch (error) {
          console.error("Error changing status:", error);
          const errorMessage =
            error instanceof Error
              ? error.message
              : "Có lỗi xảy ra khi thay đổi trạng thái đơn hàng";
          toast.error(errorMessage);
        }
      },
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

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
    createColumn({
      key: "orderInfo",
      title: "Thông tin đơn hàng",
      render: (_, record: Order) => (
        <div className="space-y-1">
          <div className="font-medium text-blue-600">{record.orderNumber}</div>
          <div className="text-sm text-muted-foreground">
            {record.customerName || "Khách lẻ"}
          </div>
          <div className="sm:hidden">
            <Badge
              variant={ORDER_STATUS_COLORS[record.status]}
              className="gap-1"
            >
              {(() => {
                const StatusIcon = getStatusIcon(record.status);
                return <StatusIcon className="h-3 w-3" />;
              })()}
              {ORDER_STATUS_LABELS[record.status]}
            </Badge>
          </div>
          <div className="text-sm font-medium text-green-600 sm:hidden">
            {formatCurrency(record.totalAmount)}
          </div>
        </div>
      ),
    }),
    createColumn({
      key: "orderNumber",
      title: "Số đơn hàng",
      dataIndex: "orderNumber",
      responsive: false,
      render: (value) => (
        <div className="font-medium text-blue-600">{value as string}</div>
      ),
    }),
    createColumn({
      key: "customerName",
      title: "Khách hàng",
      dataIndex: "customerName",
      responsive: false,
      render: (value) => <div>{(value as string) || "Khách lẻ"}</div>,
    }),
    createColumn({
      key: "status",
      title: "Trạng thái",
      dataIndex: "status",
      responsive: false,
      align: "center",
      width: 120,
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
    }),
    createCurrencyColumn("totalAmount", "Tổng tiền"),
    createDateColumn("createdAt", "Ngày tạo"),
  ];

  // Define table actions
  const tableActions: TableAction<Order>[] = [
    {
      key: "view",
      label: "Xem chi tiết",
      icon: Eye,
      onClick: () => {
        // TODO: Implement view detail dialog
        toast.info("Chức năng xem chi tiết đang được phát triển");
      },
    },
    {
      key: "edit",
      label: "Chỉnh sửa",
      icon: Edit,
      onClick: (record) => {
        setSelectedOrder(record);
        setShowFormDialog(true);
      },
      show: (record) => record.status === "draft",
    },
    {
      key: "confirm",
      label: "Xác nhận",
      icon: CheckCircle,
      onClick: (record) => handleStatusChange(record, "confirmed"),
      show: (record) => record.status === "draft",
    },
    {
      key: "export",
      label: "Xuất kho",
      icon: Truck,
      onClick: (record) => handleStatusChange(record, "exported"),
      show: (record) => record.status === "confirmed",
    },
    {
      key: "complete",
      label: "Hoàn thành",
      icon: Package,
      onClick: (record) => handleStatusChange(record, "completed"),
      show: (record) => record.status === "exported",
    },
    {
      key: "cancel",
      label: "Hủy đơn",
      icon: X,
      variant: "destructive",
      onClick: (record) => handleStatusChange(record, "cancelled"),
      show: (record) =>
        record.status === "draft" ||
        record.status === "confirmed" ||
        record.status === "exported",
    },
    {
      key: "delete",
      label: "Xóa",
      icon: Trash2,
      variant: "destructive",
      onClick: (record) => handleDeleteOrder(record),
      show: (record) =>
        record.status === "draft" || record.status === "cancelled",
    },
  ];

  // Mobile card renderer
  const mobileCardRender = (record: Order) => (
    <div className="space-y-3">
      <div className="flex items-start justify-between">
        <div className="space-y-1 flex-1">
          <h3 className="font-semibold text-base">{record.orderNumber}</h3>
          <div className="text-sm text-muted-foreground">
            {record.customerName || "Khách lẻ"}
          </div>
          <Badge variant={ORDER_STATUS_COLORS[record.status]} className="gap-1">
            {(() => {
              const StatusIcon = getStatusIcon(record.status);
              return <StatusIcon className="h-3 w-3" />;
            })()}
            {ORDER_STATUS_LABELS[record.status]}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 text-sm">
        <div>
          <span className="text-muted-foreground">Tổng tiền:</span>
          <p className="font-semibold text-green-600">
            {formatCurrency(record.totalAmount)}
          </p>
        </div>
        <div>
          <span className="text-muted-foreground">Ngày tạo:</span>
          <p className="font-medium">
            {record.createdAt.toDate().toLocaleDateString("vi-VN")}
          </p>
        </div>
      </div>

      {record.notes && (
        <div className="text-sm">
          <span className="text-muted-foreground">Ghi chú:</span>
          <p className="font-medium line-clamp-2">{record.notes}</p>
        </div>
      )}
    </div>
  );

  if (error) {
    return (
      <div className="p-6">
        <div className="text-center text-red-600">
          <p>{error}</p>
          <Button onClick={refreshOrders} className="mt-2">
            Thử lại
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <EnhancedTable<Order>
        title="Đơn hàng"
        description="Quản lý danh sách đơn hàng của cửa hàng"
        columns={columns}
        dataSource={orders}
        rowKey="id"
        loading={loading}
        emptyText="Không tìm thấy đơn hàng nào"
        actions={tableActions}
        hasMore={hasMore}
        onLoadMore={loadMore}
        isMobile={isMobile}
        loadingMore={loadingMore}
        searchValue={filters.search || ""}
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
        searchable
        searchPlaceholder="Tìm kiếm đơn hàng..."
        onSearchChange={handleSearch}
        mobileCardRender={mobileCardRender}
        headerActions={
          <div className="flex items-center gap-2">
            <Select
              value={filters.status || "all"}
              onValueChange={handleStatusFilter}
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
            <Button onClick={() => setShowFormDialog(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Tạo đơn hàng
            </Button>
          </div>
        }
      />

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
            toast.success(
              `Đơn hàng đã được ${
                selectedOrder ? "cập nhật" : "tạo"
              } thành công.`
            );
          }}
        />
      )}

      {ConfirmDialog}
    </div>
  );
}
