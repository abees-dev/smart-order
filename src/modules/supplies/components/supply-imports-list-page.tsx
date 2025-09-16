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
  Search,
  Edit,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { useDocumentTitle } from "@/hooks/use-document-title";
import { useSupplyImports, useSupplyImportActions } from "../hooks/use-supply";
import {
  EnhancedTable,
  useEnhancedTableColumns,
  type ResponsiveTableColumn,
  type TableAction,
} from "@/components/tables";
import { SupplyImportFilterSheet } from "./supply-import-filter-sheet";
import { SupplyImportFormDialog } from "./supply-import-form-dialog";
import type { SupplyImport } from "../types";

export function SupplyImportsListPage() {
  useDocumentTitle();
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedImport, setSelectedImport] = useState<SupplyImport | null>(
    null
  );
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  const {
    imports,
    loading,
    error,
    hasMore,
    loadMore,
    refreshImports,
    total,
    page,
    pageSize,
    changePage,
    isMobile,
    loadingMore,
    filters,
    updateFilters,
  } = useSupplyImports({}, 7);

  const {
    error: actionError,
    completeImport,
    cancelImport,
  } = useSupplyImportActions();

  const { createColumn, createCurrencyColumn } =
    useEnhancedTableColumns<SupplyImport>();

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    updateFilters({ ...filters, search: value || undefined });
  };

  const handleViewImport = (importRecord: SupplyImport) => {
    // Navigate to detail page instead of opening dialog
    navigate(`/dashboard/supplies/imports/${importRecord.id}`);
  };

  const handleEditImport = (importRecord: SupplyImport) => {
    setSelectedImport(importRecord);
    setShowEditDialog(true);
  };

  const handleCompleteImport = async (importRecord: SupplyImport) => {
    try {
      await completeImport(importRecord.id);
      refreshImports();
      console.log("Import completed successfully");
    } catch (error) {
      console.error("Failed to complete import:", error);
    }
  };

  const handleCancelImport = async (importRecord: SupplyImport) => {
    try {
      await cancelImport(importRecord.id);
      refreshImports();
      console.log("Import cancelled successfully");
    } catch (error) {
      console.error("Failed to cancel import:", error);
    }
  };

  const handleDeleteImport = (importRecord: SupplyImport) => {
    // TODO: Implement delete functionality (if needed)
    console.log("Delete import:", importRecord.id);
  };

  const handleCreateImport = () => {
    setShowCreateDialog(true);
  };

  const handleDialogSuccess = () => {
    refreshImports();
    setShowEditDialog(false);
    setShowCreateDialog(false);
    setSelectedImport(null);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return (
          <Badge
            variant="default"
            className="bg-green-100 text-green-800 hover:bg-green-200 transition-colors"
          >
            <CheckCircle className="w-3 h-3 mr-1" />
            Đã hoàn thành
          </Badge>
        );
      case "cancelled":
        return (
          <Badge
            variant="destructive"
            className="hover:bg-destructive/90 transition-colors"
          >
            <XCircle className="w-3 h-3 mr-1" />
            Đã hủy
          </Badge>
        );
      default:
        return (
          <Badge
            variant="outline"
            className="border-orange-200 text-orange-700 hover:bg-orange-50 transition-colors"
          >
            <Clock className="w-3 h-3 mr-1 animate-pulse" />
            Đang chờ
          </Badge>
        );
    }
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
          <div className="text-sm text-muted-foreground">
            Nhà cung cấp: {record.supplierId || "Chưa xác định"}
          </div>
          <div className="flex items-center gap-2 sm:hidden">
            {getStatusBadge(record.status)}
          </div>
          <div className="text-sm font-semibold text-blue-600 sm:hidden">
            {new Intl.NumberFormat("vi-VN", {
              style: "currency",
              currency: "VND",
              notation: "compact",
            }).format(record.totalAmount)}
          </div>
          <div className="text-xs text-muted-foreground sm:hidden">
            {record.createdAt.toDate().toLocaleDateString("vi-VN")}
          </div>
        </div>
      ),
    }),
    createColumn({
      key: "status",
      title: "Trạng thái",
      responsive: false,
      align: "center",
      render: (_, record: SupplyImport) => getStatusBadge(record.status),
    }),
    createCurrencyColumn("totalAmount", "Tổng giá trị"),
    createColumn({
      key: "createdAt",
      title: "Ngày tạo",
      responsive: false,
      render: (_, record: SupplyImport) => (
        <div className="text-sm text-muted-foreground">
          {record.createdAt.toDate().toLocaleDateString("vi-VN")}
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
      show: (record) => record.status === "pending",
    },
    {
      key: "complete",
      label: "Hoàn thành",
      icon: CheckCircle,
      variant: "default",
      onClick: (record) => handleCompleteImport(record),
      show: (record) => record.status === "pending",
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
            {getStatusBadge(record.status)}
          </div>
        </div>
      </div>

      <div className="space-y-2 text-sm">
        <div>
          <span className="text-muted-foreground">Nhà cung cấp:</span>
          <p className="font-medium">{record.supplierId || "Chưa xác định"}</p>
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
            {record.createdAt.toDate().toLocaleDateString("vi-VN")}
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

  const pendingCount = imports.filter((imp) => imp.status === "pending").length;
  const completedCount = imports.filter(
    (imp) => imp.status === "completed"
  ).length;
  const totalValue = imports
    .filter((imp) => imp.status === "completed")
    .reduce((sum, imp) => sum + imp.totalAmount, 0);

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
            <div className="text-xl font-bold">{imports.length}</div>
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
              {pendingCount}
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
              {completedCount}
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
              }).format(totalValue)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter Toolbar */}
      <Card>
        <CardContent className="pt-4 pb-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Tìm kiếm số hóa đơn, nhà cung cấp..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10 h-9"
              />
            </div>
            <div className="flex gap-2">
              <SupplyImportFilterSheet
                filters={filters}
                onFiltersChange={updateFilters}
              />
            </div>
          </div>

          {/* Active Filters Display */}
          {(searchTerm ||
            filters.status ||
            filters.supplierId ||
            filters.dateFrom ||
            filters.dateTo) && (
            <div className="flex items-center gap-2 mt-4 pt-4 border-t">
              <span className="text-sm text-muted-foreground">
                Bộ lọc đang áp dụng:
              </span>
              <div className="flex flex-wrap gap-2">
                {searchTerm && (
                  <Badge variant="secondary" className="gap-1">
                    Tìm kiếm: "{searchTerm}"
                    <button
                      onClick={() => handleSearch("")}
                      className="ml-1 hover:bg-muted rounded-full"
                    >
                      <XCircle className="h-3 w-3" />
                    </button>
                  </Badge>
                )}
                {filters.status && (
                  <Badge variant="secondary" className="gap-1">
                    Trạng thái:{" "}
                    {filters.status === "pending"
                      ? "Đang chờ"
                      : filters.status === "completed"
                      ? "Đã hoàn thành"
                      : "Đã hủy"}
                    <button
                      onClick={() =>
                        updateFilters({ ...filters, status: undefined })
                      }
                      className="ml-1 hover:bg-muted rounded-full"
                    >
                      <XCircle className="h-3 w-3" />
                    </button>
                  </Badge>
                )}
                {filters.supplierId && (
                  <Badge variant="secondary" className="gap-1">
                    Nhà cung cấp: {filters.supplierId}
                    <button
                      onClick={() =>
                        updateFilters({ ...filters, supplierId: undefined })
                      }
                      className="ml-1 hover:bg-muted rounded-full"
                    >
                      <XCircle className="h-3 w-3" />
                    </button>
                  </Badge>
                )}
                {(filters.dateFrom || filters.dateTo) && (
                  <Badge variant="secondary" className="gap-1">
                    Thời gian:{" "}
                    {filters.dateFrom?.toDate().toLocaleDateString("vi-VN")} -{" "}
                    {filters.dateTo?.toDate().toLocaleDateString("vi-VN")}
                    <button
                      onClick={() =>
                        updateFilters({
                          ...filters,
                          dateFrom: undefined,
                          dateTo: undefined,
                        })
                      }
                      className="ml-1 hover:bg-muted rounded-full"
                    >
                      <XCircle className="h-3 w-3" />
                    </button>
                  </Badge>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Import Table */}
      <div>
        <EnhancedTable<SupplyImport>
          title=""
          columns={columns}
          dataSource={imports}
          actions={tableActions}
          loading={loading}
          searchable={false}
          emptyText={
            searchTerm
              ? "Không tìm thấy phiếu nhập nào"
              : "Chưa có phiếu nhập nào"
          }
          mobileCardRender={mobileCardRender}
          rowKey="id"
          hasMore={hasMore}
          onLoadMore={loadMore}
          loadingMore={loadingMore}
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
        />
      </div>

      {/* Action Error Alert */}
      {actionError && (
        <Alert variant="destructive" className="mb-4">
          <XCircle className="h-4 w-4" />
          <AlertDescription>{actionError}</AlertDescription>
        </Alert>
      )}

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
