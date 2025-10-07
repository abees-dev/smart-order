import { useState } from "react";
import {
  Eye,
  Edit,
  Trash2,
  CheckCircle,
  Truck,
  Package,
  X,
  FileEdit,
  Receipt,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

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
  type OrderStatus,
  type SupplyShortage,
} from "../types";
import { useOrders } from "../hooks/use-order";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  useChangeOrderStatus,
  useDeleteOrder,
} from "../hooks/user-order-actions";
import { CreateCostIncurredDialog } from "./create-cost-incurred-dialog";
import { useNavigate } from "react-router-dom";
import { Actions, Resources, ROUTES } from "@/constants";
import { StockShortageModal } from "./stock-shortage-modal";
import { usePermissions } from "@/components/guards";
import { PageHeader } from "@/components/PageHeader";
import OrderFilter from "./filter/OrderFilter";
import { useFilterStore } from "@/stores/filter.store";

const FILTER_KEY = Resources.ORDERS;
export function OrdersListPage() {
  const navigate = useNavigate();
  const { updateFilter, filters } = useFilterStore();
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showFormDialog, setShowFormDialog] = useState(false);
  const [showCreateCostIncurredDialog, setShowCreateCostIncurredDialog] =
    useState(false);
  const [showStockShortageModal, setShowStockShortageModal] = useState(false);
  const [stockShortages, setStockShortages] = useState<SupplyShortage[]>([]);
  const [orderNumber, setOrderNumber] = useState<string>("");
  const { showConfirm, ConfirmDialog } = useConfirmDialog();
  const isMobile = useIsMobile(); // useIsMobile();
  const changePage = (newPage: number) => {
    updateFilter(FILTER_KEY, { ...filters[FILTER_KEY], page: newPage });
  };
  const {
    orders,
    loading,
    error,
    hasNextPage,
    fetchNextPage,
    isFetching,
    pagination,
    refetchOrders,
  } = useOrders({
    ...filters[FILTER_KEY],
    page: filters[FILTER_KEY]?.page || 1,
  });

  const { deleteOrder } = useDeleteOrder({});
  const { createColumn, createCurrencyColumn, createDateColumn } =
    useEnhancedTableColumns<Order>();

  const { hasPermission } = usePermissions();

  const { changeOrderStatus } = useChangeOrderStatus({
    onSuccess: () => {
      refetchOrders();
      setShowStockShortageModal(false);
    },
    onError: (error) => {
      toast.error(
        error instanceof Error
          ? error.message
          : "Có lỗi xảy ra khi thay đổi trạng thái đơn hàng"
      );
    },
    onStockShortage: (shortages, orderNumber) => {
      setShowStockShortageModal(true);
      setStockShortages(shortages);
      setOrderNumber(orderNumber);
    },
  });

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
          refetchOrders();
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
        changeOrderStatus({ orderId: order.id, status: newStatus });
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
          <Badge
            variant={"outline"}
            color={ORDER_STATUS_COLORS[status]}
            className="gap-1"
          >
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
      show: () => hasPermission(Resources.ORDERS, Actions.DETAIL),
      onClick: (record) => {
        navigate(ROUTES.DASHBOARD.ORDERS + `/${record.id}`);
      },
    },
    {
      key: "cost-incurred",
      label: "Chi phí phát sinh",
      icon: Receipt,
      show: (record) =>
        record.status !== "draft" &&
        hasPermission(Resources.COST_INCURRED, Actions.CREATE),
      onClick: (record) => {
        setShowCreateCostIncurredDialog(true);
        setSelectedOrder(record);
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
      show: (record) =>
        record.status !== "cancelled" &&
        hasPermission(Resources.ORDERS, Actions.UPDATE),
    },
    {
      key: "confirm",
      label: "Xác nhận",
      icon: CheckCircle,
      onClick: (record) => handleStatusChange(record, "confirmed"),
      show: (record) =>
        record.status === "draft" &&
        hasPermission(Resources.ORDERS, Actions.UPDATE),
    },
    {
      key: "export",
      label: "Xuất kho",
      icon: Truck,
      onClick: (record) => handleStatusChange(record, "exported"),
      show: (record) =>
        record.status === "confirmed" &&
        hasPermission(Resources.ORDERS, Actions.UPDATE),
    },
    {
      key: "complete",
      label: "Hoàn thành",
      icon: Package,
      onClick: (record) => handleStatusChange(record, "completed"),
      show: (record) =>
        record.status === "exported" &&
        hasPermission(Resources.ORDERS, Actions.UPDATE),
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
        (record.status === "exported" &&
          hasPermission(Resources.ORDERS, Actions.UPDATE)),
    },
    {
      key: "delete",
      label: "Xóa",
      icon: Trash2,
      variant: "destructive",
      onClick: (record) => handleDeleteOrder(record),
      show: (record) =>
        (record.status === "draft" || record.status === "cancelled") &&
        hasPermission(Resources.ORDERS, Actions.DELETE),
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
          <Badge
            variant={"outline"}
            color={ORDER_STATUS_COLORS[record.status]}
            className="gap-1"
          >
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
            {new Date(record.createdAt).toLocaleDateString("vi-VN")}
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
      <div className="">
        <div className="text-center text-red-600">
          <p>{error}</p>
          <Button
            onClick={() => {
              refetchOrders();
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
      <PageHeader
        shouldCreateAction={true}
        onCreateAction={() => {
          setShowFormDialog(true);
        }}
        createActionLabel="Tạo đơn hàng"
        title="Đơn hàng"
        description="Quản lý đơn hàng"
        filterActions={
          <OrderFilter
            filters={filters[FILTER_KEY] || {}}
            onFiltersChange={(filters) => {
              updateFilter(FILTER_KEY, { ...filters, page: 1 });
            }}
          />
        }
      />
      <EnhancedTable<Order>
        columns={columns}
        dataSource={orders}
        rowKey="id"
        loading={loading}
        emptyText="Không tìm thấy đơn hàng nào"
        actions={tableActions}
        hasMore={hasNextPage}
        onLoadMore={fetchNextPage}
        isMobile={isMobile}
        loadingMore={isFetching}
        onDoubleClick={(record) => {
          if (!hasPermission(Resources.ORDERS, Actions.DETAIL)) return;
          navigate(ROUTES.DASHBOARD.ORDERS + `/${record.id}`);
        }}
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
        mobileCardRender={mobileCardRender}
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
            refetchOrders();
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
      {selectedOrder && showCreateCostIncurredDialog && (
        <CreateCostIncurredDialog
          open={showCreateCostIncurredDialog}
          onOpenChange={(open) => {
            setShowCreateCostIncurredDialog(open);
            if (!open) {
              setSelectedOrder(null);
            }
          }}
          orderId={selectedOrder.id}
        />
      )}

      {showStockShortageModal && (
        <StockShortageModal
          isOpen={showStockShortageModal}
          onClose={() => setShowStockShortageModal(false)}
          shortages={stockShortages}
          orderNumber={orderNumber}
        />
      )}

      {ConfirmDialog}
    </div>
  );
}
