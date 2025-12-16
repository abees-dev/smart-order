import { useState } from "react";
import {
  Pencil,
  Trash2,
  Eye,
  CircleDollarSign,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  EnhancedTable,
  useEnhancedTableColumns,
  type ResponsiveTableColumn,
  type TableAction,
} from "@/components/tables";
import DebtsFormDialog from "./debts-form-dialog";
import DebtFilter from "./filter/DebtFilter";
import { useDebts, useDeleteDebt } from "../hooks/use-debt";
import type { Debt, DebtPayment, DebtFilters } from "../types";
import { useConfirmDialog } from "@/components/ui/confirm-dialog";
import { formatCurrency, formatDate } from "@/utils/format";
import { useIsMobile } from "@/hooks/use-mobile";
import { PageHeader } from "@/components/PageHeader";
import DebtsPaymentFormDialog from "./debts-payment-form-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";

const DebtsListPage = () => {
  const [isOpenCreateDebt, setIsOpenCreateDebt] = useState(false);
  const [isOpenCreatePaymentDebt, setIsOpenCreatePaymentDebt] = useState(false);
  const [selectedDebt, setSelectedDebt] = useState<Debt | null>(null);
  const [editingPayment, setEditingPayment] = useState<DebtPayment | null>(
    null
  );
  const [filters, setFilters] = useState<DebtFilters>({});
  const [expandedMobileCards, setExpandedMobileCards] = useState<Set<string>>(
    new Set()
  );
  const isMobile = useIsMobile();

  const {
    debts,
    loading,
    error,
    refetchDebts,
    fetchNextPage,
    hasNextPage,
    pagination,
  } = useDebts(filters);
  const { mutateAsync: deleteDebt } = useDeleteDebt();
  const { showConfirm, ConfirmDialog } = useConfirmDialog();
  const { createColumn } = useEnhancedTableColumns<Debt>();

  const changePage = (newPage: number) => {
    setFilters((prev) => ({ ...prev, page: newPage }));
  };

  // Status color mapping for Badge component
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return { variant: "outline" as const, color: "warning" as const };
      case "partial":
        return { variant: "secondary" as const, color: undefined };
      case "paid":
        return { variant: "outline" as const, color: "success" as const };
      case "overdue":
        return { variant: "destructive" as const, color: undefined };
      default:
        return { variant: "outline" as const, color: undefined };
    }
  };

  // Type color mapping
  const getTypeBadge = (type: string) => {
    switch (type) {
      case "sales":
        return { variant: "default" as const, color: undefined };
      case "purchase":
        return { variant: "secondary" as const, color: undefined };
      default:
        return { variant: "outline" as const, color: undefined };
    }
  };

  // Define table columns
  const columns: ResponsiveTableColumn<Debt>[] = [
    createColumn({
      key: "reference",
      title: "Thông tin tham chiếu",
      render: (_, record: Debt) => (
        <div className="space-y-1">
          <div className="font-semibold text-foreground">
            {record.referenceNumber}
          </div>
          <div className="font-sm text-muted-foreground">
            {record.referenceRecord.referenceNumber}
          </div>
          <div className="text-sm text-muted-foreground">
            {record.type === "sales"
              ? record.customer?.name
              : record.supplier?.name}
          </div>
        </div>
      ),
    }),
    createColumn({
      key: "type",
      title: "Loại",
      responsive: false,
      render: (_, record: Debt) => (
        <Badge
          variant="outline"
          color={record.type === "sales" ? "info" : "warning"}
        >
          {record.type === "sales" ? "Bán hàng" : "Mua hàng"}
        </Badge>
      ),
    }),
    createColumn({
      key: "amount",
      title: "Số tiền",
      responsive: false,
      render: (_, record: Debt) => (
        <div className="text-right">
          <div className="font-semibold">
            {formatCurrency(record.totalAmount)}
          </div>
        </div>
      ),
    }),
    createColumn({
      key: "amountRemaining",
      title: "Số tiền còn lại",
      responsive: false,
      render: (_, record: Debt) => {
        const amountRemaining =
          record.totalAmount -
          record.payments.reduce((acc, payment) => acc + payment.amount, 0);
        return (
          <div className="text-right">
            <div className="font-semibold">
              {formatCurrency(amountRemaining)}
            </div>
          </div>
        );
      },
    }),
    createColumn({
      key: "status",
      title: "Trạng thái",
      responsive: false,
      render: (_, record: Debt) => (
        <Badge {...getStatusBadge(record.status)}>
          {record.status === "pending" && "Chờ thanh toán"}
          {record.status === "partial" && "Thanh toán một phần"}
          {record.status === "paid" && "Đã thanh toán"}
          {record.status === "overdue" && "Quá hạn"}
        </Badge>
      ),
    }),
    createColumn({
      key: "dueDate",
      title: "Ngày đến hạn",
      responsive: true,
      render: (_, record: Debt) => (
        <div className="text-sm">{formatDate(record.dueDate)}</div>
      ),
    }),
    createColumn({
      key: "description",
      title: "Mô tả",
      responsive: true,
      render: (_, record: Debt) => (
        <div className="text-sm text-muted-foreground max-w-[200px] truncate">
          {record.description || "-"}
        </div>
      ),
    }),
  ];

  // Define table actions
  const tableActions: TableAction<Debt>[] = [
    {
      key: "view",
      label: "Xem chi tiết",
      icon: Eye,
      show: () => false,
      onClick: () => {},
    },
    {
      key: "add-payment",
      label: "Ghi nhận thanh toán",
      icon: CircleDollarSign,
      onClick: (record) => {
        setIsOpenCreatePaymentDebt(true);
        setSelectedDebt(record);
      },
    },
    {
      key: "edit",
      label: "Chỉnh sửa",
      icon: Pencil,
      show: () => false,

      onClick: () => {},
    },
    {
      key: "delete",
      label: "Xóa",
      icon: Trash2,
      variant: "destructive",
      show: () => true, // Only show delete if no payments exist
      onClick: (record) => {
        showConfirm({
          title: "Xác nhận xóa công nợ",
          description: `Bạn có chắc chắn muốn xóa công nợ "${record.referenceNumber}"? Hành động này không thể hoàn tác.`,
          confirmText: "Xóa",
          cancelText: "Hủy",
          variant: "destructive",
          onConfirm: async () => {
            await deleteDebt(record.id);
          },
        });
      },
    },
  ];

  const subColumns: ResponsiveTableColumn<DebtPayment>[] = [
    {
      key: "paymentDate",
      title: "Ngày thanh toán",
      render: (_, record) => formatDate(record.paymentDate),
    },
    {
      key: "amount",
      title: "Số tiền",
      render: (_, record) => (
        <div className="text-right">
          <div className="font-semibold">{formatCurrency(record.amount)}</div>
        </div>
      ),
    },
    {
      key: "notes",
      title: "Ghi chú",
      render: (_, record) => (
        <div className="text-sm text-muted-foreground max-w-[200px] truncate">
          {record.notes || "-"}
        </div>
      ),
    },
  ];

  // Helper function to find the debt that contains a specific payment
  const findDebtByPayment = (payment: DebtPayment): Debt | undefined => {
    return debts.find((debt) => debt.payments.some((p) => p.id === payment.id));
  };

  const subTableActions: TableAction<DebtPayment>[] = [
    {
      key: "edit-payment",
      label: "Chỉnh sửa",
      icon: Pencil,
      onClick: (payment) => {
        const parentDebt = findDebtByPayment(payment);
        if (parentDebt) {
          setEditingPayment(payment);
          setSelectedDebt(parentDebt);
          setIsOpenCreatePaymentDebt(true);
        }
      },
    },
  ];

  // Mobile payment item component
  const MobilePaymentItem = ({
    payment,
    record,
  }: {
    payment: DebtPayment;
    record: Debt;
  }) => (
    <div className="flex items-center justify-between p-3 border rounded-lg bg-background/50">
      <div className="space-y-1 flex-1">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">
            {formatDate(payment.paymentDate)}
          </span>
          <span className="font-semibold text-green-600">
            {formatCurrency(payment.amount)}
          </span>
        </div>
        {payment.notes && (
          <p className="text-xs text-muted-foreground">{payment.notes}</p>
        )}
      </div>
      <div className="ml-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={() => {
                setEditingPayment(payment);
                setSelectedDebt(record);
                setIsOpenCreatePaymentDebt(true);
              }}
            >
              <Pencil className="h-4 w-4 mr-2" />
              Chỉnh sửa
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );

  // Mobile card renderer with expandable payments
  const mobileCardRender = (record: Debt) => {
    const remainingAmount =
      record.totalAmount -
      record.payments.reduce((acc, payment) => acc + payment.amount, 0);
    const hasPayments = record.payments && record.payments.length > 0;
    const isExpanded = expandedMobileCards.has(record.id);

    return (
      <div className="space-y-3">
        {/* Main debt info */}
        <div className="flex items-start justify-between">
          <div className="space-y-1 flex-1">
            <h3 className="font-semibold text-base">
              {record.referenceNumber}
            </h3>
            <div className="text-xs text-muted-foreground">
              {record.referenceRecord.referenceNumber}
            </div>
            <div className="flex gap-1 flex-wrap">
              <Badge {...getTypeBadge(record.type)} className="text-xs">
                {record.type === "sales" ? "Bán hàng" : "Mua hàng"}
              </Badge>
              <Badge {...getStatusBadge(record.status)} className="text-xs">
                {record.status === "pending" && "Chờ thanh toán"}
                {record.status === "partial" && "Thanh toán một phần"}
                {record.status === "paid" && "Đã thanh toán"}
                {record.status === "overdue" && "Quá hạn"}
              </Badge>
            </div>
          </div>
          <div className="ml-2 text-right">
            <div className="font-semibold text-base">
              {formatCurrency(record.totalAmount)}
            </div>
            {remainingAmount > 0 && (
              <div className="text-sm text-muted-foreground">
                Còn lại: {formatCurrency(remainingAmount)}
              </div>
            )}
          </div>
        </div>

        {/* Customer/Supplier and due date */}
        <div className="grid grid-cols-1 gap-2 text-sm">
          <div>
            <span className="text-muted-foreground">
              {record.type === "sales" ? "Khách hàng:" : "Nhà cung cấp:"}
            </span>
            <p className="font-medium">
              {record.type === "sales"
                ? record.customerName
                : record.supplierName}
            </p>
          </div>
          <div>
            <span className="text-muted-foreground">Ngày đến hạn:</span>
            <p className="font-medium">{formatDate(record.dueDate)}</p>
          </div>
          {record.description && (
            <div>
              <span className="text-muted-foreground">Mô tả:</span>
              <p className="font-medium">{record.description}</p>
            </div>
          )}
        </div>

        {/* Payment history section */}
        {hasPayments && (
          <div className="border-t pt-3">
            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  setExpandedMobileCards((prev) => {
                    const newSet = new Set(prev);
                    if (isExpanded) {
                      newSet.delete(record.id);
                    } else {
                      newSet.add(record.id);
                    }
                    return newSet;
                  });
                }}
                className="text-sm font-medium h-auto p-0 justify-start"
              >
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4 mr-2" />
                ) : (
                  <ChevronRight className="h-4 w-4 mr-2" />
                )}
                Lịch sử thanh toán ({record.payments.length})
              </Button>
              <Button
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedDebt(record);
                  setIsOpenCreatePaymentDebt(true);
                }}
                className="text-xs"
              >
                <CircleDollarSign className="h-3 w-3 mr-1" />
                Thanh toán
              </Button>
            </div>

            {/* Expandable payment list */}
            {isExpanded && (
              <div className="mt-3 space-y-2">
                {record.payments.map((payment) => (
                  <MobilePaymentItem
                    key={payment.id}
                    payment={payment}
                    record={record}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Add payment button for debts without payments */}
        {!hasPayments && (
          <div className="border-t pt-3 flex justify-between items-center">
            <span className="text-sm text-muted-foreground">
              Chưa có thanh toán nào
            </span>
            <Button
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedDebt(record);
                setIsOpenCreatePaymentDebt(true);
              }}
              className="text-xs"
            >
              <CircleDollarSign className="h-3 w-3 mr-1" />
              Thanh toán
            </Button>
          </div>
        )}
      </div>
    );
  };

  if (error) {
    return (
      <div className="p-6">
        <div className="text-center text-red-600">
          <p>{error}</p>
          <Button onClick={() => refetchDebts()} className="mt-2">
            Thử lại
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Công nợ"
        description="Quản lý công nợ của khách hàng và nhà cung cấp"
        onCreateAction={() => setIsOpenCreateDebt(true)}
        shouldCreateAction={true}
        createActionLabel="Thêm công nợ"
        filterActions={
          <DebtFilter filters={filters} onFiltersChange={setFilters} />
        }
      />

      <EnhancedTable<Debt>
        columns={columns}
        dataSource={debts}
        subTable={{
          hasSubData(record) {
            return record.payments && record.payments.length > 0;
          },
          getSubData(record) {
            return record.payments;
          },
          columns: subColumns,
          actions: subTableActions,
          className: "w-full",
        }}
        rowKey="id"
        loading={loading}
        emptyText="Không tìm thấy công nợ nào"
        actions={tableActions}
        hasMore={hasNextPage}
        onLoadMore={fetchNextPage}
        isMobile={isMobile}
        loadingMore={loading}
        preserveExpandedOnUpdate={false}
        mobileCardRender={mobileCardRender}
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

      {isOpenCreateDebt && (
        <DebtsFormDialog
          open={isOpenCreateDebt}
          onOpenChange={setIsOpenCreateDebt}
          onSuccess={() => {
            setIsOpenCreateDebt(false);
            refetchDebts();
          }}
        />
      )}
      {isOpenCreatePaymentDebt && selectedDebt && (
        <DebtsPaymentFormDialog
          open={isOpenCreatePaymentDebt}
          onOpenChange={(open) => {
            if (!open) {
              setSelectedDebt(null);
              setEditingPayment(null);
            }
            setIsOpenCreatePaymentDebt(open);
          }}
          debtId={selectedDebt.id}
          maxAmount={
            selectedDebt.totalAmount -
            selectedDebt.payments.reduce((sum, p) => sum + p.amount, 0) +
            (editingPayment?.amount || 0) // Add back the amount if editing
          }
          editingPayment={editingPayment || undefined}
        />
      )}

      {ConfirmDialog}
    </div>
  );
};

export default DebtsListPage;
