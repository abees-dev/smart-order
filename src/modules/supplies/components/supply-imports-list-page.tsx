import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  Package,
  Plus,
  Download,
  FileText,
  Edit,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { useDocumentTitle } from "@/hooks/use-document-title";
import {
  EnhancedTable,
  useEnhancedTableColumns,
  type ResponsiveTableColumn,
  type TableAction,
} from "@/components/tables";
import { SupplyImportFormDialog } from "./supply-import-form-dialog";
import type { SupplyImport } from "../types";
import { useIsMobile } from "@/hooks/use-mobile";
import { useSupplyImports, useSupplySummary } from "../hooks/use-supply-import";
import {
  useAddToWarehouseSupply,
  useCancelSupplyImport,
  useCompleteSupplyImport,
  useDeleteSupplyImport,
} from "../hooks/use-supply-import-actions";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import SupplyStatusBadge from "./supply-status-badge";

export function SupplyImportsListPage() {
  useDocumentTitle();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [selectedImport, setSelectedImport] = useState<SupplyImport | null>(
    null
  );
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [page, setPage] = useState(1);
  const changePage = (newPage: number) => {
    setPage(newPage);
  };
  const isMobile = useIsMobile();

  const { summary } = useSupplySummary();

  const {
    loading,
    error,
    suppliesImports: imports,
    hasNextPage,
    fetchNextPage,
    pagination,
    isFetching,
    refetchSuppliesImports,
  } = useSupplyImports({
    page: page,
    limit: 10,
  });

  const { addToWarehouseSupply } = useAddToWarehouseSupply({
    onSuccess: () => {
      refetchSuppliesImports();
      queryClient.invalidateQueries({
        predicate(query) {
          return query.queryKey[0] === "supplies";
        },
      });
      toast.success("Nhập kho thành công");
    },
    onError: (error) => {
      console.error("Failed to add to warehouse:", error);
      toast.error("Nhập kho thất bại, vui lòng thử lại");
    },
  });

  const { completeSupplyImport } = useCompleteSupplyImport({
    onSuccess: () => {
      refetchSuppliesImports();
      toast.success("Hoàn thành phiếu nhập thành công");
    },
    onError: (error) => {
      console.error("Failed to complete import:", error);
      toast.error("Hoàn thành phiếu nhập thất bại, vui lòng thử lại");
    },
  });

  const { cancelSupplyImport } = useCancelSupplyImport({
    onSuccess: () => {
      refetchSuppliesImports();
      toast.success("Hủy phiếu nhập thành công");
    },
    onError: (error) => {
      console.error("Failed to cancel import:", error);
      toast.error("Hủy phiếu nhập thất bại, vui lòng thử lại");
    },
  });

  const { deleteSupplyImport } = useDeleteSupplyImport({
    onSuccess: () => {
      refetchSuppliesImports();
      queryClient.invalidateQueries({
        predicate(query) {
          return query.queryKey[0] === "supplies";
        },
      });
      toast.success("Xóa phiếu nhập thành công");
    },
    onError: (error) => {
      console.error("Failed to delete import:", error);
      toast.error("Xóa phiếu nhập thất bại, vui lòng thử lại");
    },
  });

  const { createColumn, createCurrencyColumn } =
    useEnhancedTableColumns<SupplyImport>();

  const handleViewImport = (importRecord: SupplyImport) => {
    // Navigate to detail page instead of opening dialog
    navigate(`/dashboard/supplies/imports/${importRecord.id}`);
  };

  const handleEditImport = (importRecord: SupplyImport) => {
    setSelectedImport(importRecord);
    setShowEditDialog(true);
  };

  const handleAddToWarehouse = async (importRecord: SupplyImport) => {
    addToWarehouseSupply(importRecord.id);
  };

  const handleCompleteImport = async (importRecord: SupplyImport) => {
    completeSupplyImport(importRecord.id);
  };

  const handleCancelImport = async (importRecord: SupplyImport) => {
    cancelSupplyImport(importRecord.id);
  };

  const handleDeleteImport = (importRecord: SupplyImport) => {
    deleteSupplyImport(importRecord.id);
  };

  const handleCreateImport = () => {
    setShowCreateDialog(true);
  };

  const handleDialogSuccess = () => {
    refetchSuppliesImports();
    setShowEditDialog(false);
    setShowCreateDialog(false);
    setSelectedImport(null);
  };

  // Define table columns
  const columns: ResponsiveTableColumn<SupplyImport>[] = [
    createColumn({
      key: "import",
      title: "Thông tin phiếu nhập",
      render: (_, record: SupplyImport) => (
        <div className="space-y-1">
          <div className="font-semibold text-foreground">
            <span className="bg-muted px-2 py-1 rounded text-xs mr-2">
              {record.invoiceNumber}
            </span>
          </div>
          <div className="text-sm text-muted-foreground w-[420px] truncate">
            Nhà cung cấp: {record.supplier?.name || "-"}
          </div>
          <div className="flex items-center gap-2 sm:hidden">
            <SupplyStatusBadge status={record.status} />
          </div>
          <div className="text-sm font-semibold text-blue-600 sm:hidden">
            {new Intl.NumberFormat("vi-VN", {
              style: "currency",
              currency: "VND",
              notation: "compact",
            }).format(record.totalAmount)}
          </div>
          <div className="text-xs text-muted-foreground sm:hidden">
            {new Date(record.createdAt).toLocaleDateString("vi-VN")}
          </div>
        </div>
      ),
    }),
    createColumn({
      key: "status",
      title: "Trạng thái",
      responsive: false,
      align: "center",
      render: (_, record: SupplyImport) => (
        <SupplyStatusBadge status={record.status} />
      ),
    }),
    createCurrencyColumn("totalAmount", "Tổng giá trị"),
    createColumn({
      key: "createdAt",
      title: "Ngày tạo",
      responsive: false,
      render: (_, record: SupplyImport) => (
        <div className="text-sm text-muted-foreground">
          {new Date(record.importDate).toLocaleDateString("vi-VN")}
        </div>
      ),
    }),
  ];

  // Define table actions
  const tableActions: TableAction<SupplyImport>[] = [
    {
      key: "view",
      label: "Xem chi tiết",
      icon: Eye,
      onClick: (record) => handleViewImport(record),
    },
    {
      key: "edit",
      label: "Chỉnh sửa",
      icon: Edit,
      onClick: (record) => handleEditImport(record),
      show: (record) =>
        record.status === "pending" || record.status === "warehouse",
    },
    {
      key: "warehouse",
      label: "Nhập kho",
      icon: CheckCircle,
      variant: "default",
      onClick: (record) => handleAddToWarehouse(record),
      show: (record) => record.status === "pending",
    },
    {
      key: "complete",
      label: "Hoàn thành",
      icon: CheckCircle,
      variant: "default",
      onClick: (record) => handleCompleteImport(record),
      show: (record) => record.status === "warehouse",
    },
    {
      key: "cancel",
      label: "Hủy phiếu nhập",
      icon: XCircle,
      variant: "destructive",
      onClick: (record) => handleCancelImport(record),
      show: (record) => record.status === "pending",
    },
    {
      key: "delete",
      label: "Xóa",
      icon: Trash2,
      variant: "destructive",
      onClick: (record) => handleDeleteImport(record),
      show: (record) => record.status !== "completed",
    },
  ];

  // Mobile card renderer
  const mobileCardRender = (record: SupplyImport) => (
    <div className="space-y-3">
      <div className="flex items-start justify-between">
        <div className="space-y-1 flex-1">
          <div className="text-xs bg-muted/50 px-2 py-1 rounded w-fit">
            {record.invoiceNumber}
          </div>
          <div className="flex items-center gap-2">
            <SupplyStatusBadge status={record.status} />
          </div>
        </div>
      </div>

      <div className="space-y-2 text-sm">
        <div>
          <span className="text-muted-foreground">Nhà cung cấp:</span>
          <p className="font-medium">{record.supplier?.name || "-"}</p>
        </div>

        <div>
          <span className="text-muted-foreground">Tổng giá trị:</span>
          <p className="font-semibold text-blue-600">
            {new Intl.NumberFormat("vi-VN", {
              style: "currency",
              currency: "VND",
            }).format(record.totalAmount)}
          </p>
        </div>

        <div>
          <span className="text-muted-foreground">Ngày tạo:</span>
          <p className="font-medium">
            {new Date(record.createdAt).toLocaleDateString("vi-VN")}
          </p>
        </div>
      </div>
    </div>
  );

  if (loading && imports.length === 0) {
    return (
      <div className="space-y-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start gap-3">
          <div>
            <h1 className="text-lg font-semibold">Phiếu nhập vật tư</h1>
            <p className="text-sm text-muted-foreground">
              Quản lý phiếu nhập kho
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Xuất Excel
            </Button>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Tạo phiếu nhập
            </Button>
          </div>
        </div>

        {/* Stats Cards Skeleton */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Search Skeleton */}
        <div className="flex gap-4">
          <Skeleton className="h-10 w-80" />
          <Skeleton className="h-10 w-24" />
        </div>

        {/* Table Skeleton */}
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className="flex justify-between items-center">
                  <div className="flex gap-4">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                  <Skeleton className="h-4 w-24" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        {/* Breadcrumb */}
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Phiếu nhập vật tư</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start gap-3">
          <div>
            <h1 className="text-lg font-semibold">Phiếu nhập vật tư</h1>
            <p className="text-sm text-muted-foreground">
              Quản lý phiếu nhập kho
            </p>
          </div>
        </div>

        {/* Error State */}
        <Card className="border-destructive/50">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <XCircle className="h-12 w-12 text-destructive mb-4" />
            <h3 className="text-lg font-semibold mb-2">Có lỗi xảy ra</h3>
            <p className="text-muted-foreground text-center mb-4">{error}</p>
            <Button onClick={() => window.location.reload()} variant="outline">
              Thử lại
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start gap-3">
        <div>
          <h1 className="text-lg font-semibold">Phiếu nhập vật tư</h1>
          <p className="text-sm text-muted-foreground">
            Quản lý phiếu nhập kho
          </p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" onClick={handleCreateImport}>
            <Plus className="h-4 w-4 mr-2" />
            Tạo phiếu nhập
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="hover:shadow-sm transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              Tổng phiếu
            </CardTitle>
            <Package className="h-3 w-3 text-muted-foreground" />
          </CardHeader>
          <CardContent className="pb-2">
            <div className="text-xl font-bold">{summary?.totalImports}</div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-sm transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              Đang chờ
            </CardTitle>
            <Clock className="h-3 w-3 text-orange-500" />
          </CardHeader>
          <CardContent className="pb-2">
            <div className="text-xl font-bold text-orange-600">
              {summary?.pendingImports}
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-sm transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              Hoàn thành
            </CardTitle>
            <CheckCircle className="h-3 w-3 text-green-500" />
          </CardHeader>
          <CardContent className="pb-2">
            <div className="text-xl font-bold text-green-600">
              {summary?.completedImports}
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-sm transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              Tổng giá trị
            </CardTitle>
            <FileText className="h-3 w-3 text-blue-500" />
          </CardHeader>
          <CardContent className="pb-2">
            <div className="text-lg font-bold text-blue-600">
              {new Intl.NumberFormat("vi-VN", {
                style: "currency",
                currency: "VND",
              }).format(summary?.totalAmountCompleted || 0)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Import Table */}
      <div>
        <EnhancedTable<SupplyImport>
          title=""
          columns={columns}
          dataSource={imports}
          actions={tableActions}
          loading={loading}
          searchable={false}
          emptyText={"Chưa có phiếu nhập nào"}
          mobileCardRender={mobileCardRender}
          rowKey="id"
          hasMore={hasNextPage}
          onLoadMore={fetchNextPage}
          loadingMore={isFetching}
          onDoubleClick={(record) => {
            handleViewImport(record);
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
        />
      </div>

      {/* Dialogs */}
      <SupplyImportFormDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onSuccess={handleDialogSuccess}
      />

      {/* Edit Dialog */}
      {showEditDialog && selectedImport && (
        <SupplyImportFormDialog
          open={showEditDialog}
          onOpenChange={setShowEditDialog}
          onSuccess={handleDialogSuccess}
          editImport={selectedImport}
        />
      )}
    </div>
  );
}

export default SupplyImportsListPage;
