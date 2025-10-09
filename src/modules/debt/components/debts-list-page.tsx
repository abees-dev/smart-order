import { useState } from "react";
import { Pencil, Trash2, Eye, CircleDollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  EnhancedTable,
  useEnhancedTableColumns,
  type ResponsiveTableColumn,
  type TableAction,
} from "@/components/tables";
import DebtsFormDialog from "./debts-form-dialog";
import { useDebts } from "../hooks/use-debt";
import type { Debt, DebtPayment } from "../types";
import { formatCurrency, formatDate } from "@/utils/format";
import { useIsMobile } from "@/hooks/use-mobile";
import { PageHeader } from "@/components/PageHeader";
import DebtsPaymentFormDialog from "./debts-payment-form-dialog";

const DebtsListPage = () => {
  const [isOpenCreateDebt, setIsOpenCreateDebt] = useState(false);
  const [isOpenCreatePaymentDebt, setIsOpenCreatePaymentDebt] = useState(false);
  const [selectedDebt, setSelectedDebt] = useState<Debt | null>(null);
  const isMobile = useIsMobile();

  const { debts, loading, error, refetchDebts, fetchNextPage, hasNextPage } =
    useDebts({});
  const { createColumn } = useEnhancedTableColumns<Debt>();

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
            {record.referenceRecord.referenceNumber}
          </div>
          <div className="text-sm text-muted-foreground">
            {record.type === "sales"
              ? record.customerName
              : record.supplierName}
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
      show: () => false,
      onClick: () => {},
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
  // Mobile card renderer
  const mobileCardRender = (record: Debt) => (
    <div className="space-y-3">
      <div className="flex items-start justify-between">
        <div className="space-y-1 flex-1">
          <h3 className="font-semibold text-base">{record.referenceNumber}</h3>
          <div className="flex gap-1">
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
          <div className="font-semibold">
            {formatCurrency(record.totalAmount)}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-2 text-sm">
        <div>
          <span className="text-muted-foreground">
            Khách hàng/Nhà cung cấp:
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
    </div>
  );

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
        }}
        rowKey="id"
        loading={loading}
        emptyText="Không tìm thấy công nợ nào"
        actions={tableActions}
        hasMore={hasNextPage}
        onLoadMore={fetchNextPage}
        isMobile={isMobile}
        loadingMore={loading}
        mobileCardRender={mobileCardRender}
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
            }
            setIsOpenCreatePaymentDebt(open);
          }}
          debtId={selectedDebt.id}
          maxAmount={
            selectedDebt.totalAmount -
            selectedDebt.payments.reduce((sum, p) => sum + p.amount, 0)
          }
        />
      )}
    </div>
  );
};

export default DebtsListPage;
