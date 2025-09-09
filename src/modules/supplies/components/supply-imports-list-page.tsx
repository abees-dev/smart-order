import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  Package,
  Plus,
  Download,
  TrendingUp,
  FileText,
  Search,
  MoreHorizontal,
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { useSuppliersByIds } from "@/hooks/use-supplier-select";
import {
  ResponsiveTable,
  useResponsiveTableColumns,
  type ResponsiveTableColumn,
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

  const { imports, loading, error, filters, updateFilters, refreshImports } =
    useSupplyImports();

  const {
    loading: actionLoading,
    error: actionError,
    completeImport,
    cancelImport,
  } = useSupplyImportActions();

  // Get supplier IDs from imports and fetch supplier data
  const supplierIds = useMemo(
    () => imports.map((imp) => imp.supplierId),
    [imports]
  );

  const { getSupplierName } = useSuppliersByIds(supplierIds);

  const { createColumn } = useResponsiveTableColumns<SupplyImport>();

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

  const columns: ResponsiveTableColumn<SupplyImport>[] = [
    createColumn({
      key: "invoiceNumber",
      title: "Số hóa đơn",
      dataIndex: "invoiceNumber",
      width: 150,
      render: (value) => (
        <div className="font-medium text-sm">{value as string}</div>
      ),
    }),
    createColumn({
      key: "supplier",
      title: "Nhà cung cấp",
      width: 200,
      render: (_, importItem) => (
        <div className="text-sm font-medium text-gray-700">
          {getSupplierName(importItem.supplierId) || "Chưa xác định"}
        </div>
      ),
    }),
    createColumn({
      key: "status",
      title: "Trạng thái",
      dataIndex: "status",
      width: 140,
      render: (value) => getStatusBadge(value as string),
    }),
    createColumn({
      key: "totalAmount",
      title: "Tổng giá trị",
      dataIndex: "totalAmount",
      align: "right",
      width: 150,
      render: (value) => (
        <div className="font-semibold text-blue-600">
          {new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
            notation: "compact",
            maximumFractionDigits: 1,
          }).format(value as number)}
        </div>
      ),
    }),
    createColumn({
      key: "createdAt",
      title: "Ngày tạo",
      dataIndex: "createdAt",
      width: 120,
      render: (value) => (
        <div className="text-sm text-gray-600">
          {(value as { toDate: () => Date })
            .toDate()
            .toLocaleDateString("vi-VN")}
        </div>
      ),
    }),
    createColumn({
      key: "actions",
      title: "Thao tác",
      width: 80,
      render: (_, record) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={() => handleViewImport(record)}>
              <Eye className="h-4 w-4 mr-2" />
              Xem chi tiết
            </DropdownMenuItem>
            {record.status === "pending" && (
              <>
                <DropdownMenuItem onClick={() => handleEditImport(record)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Chỉnh sửa
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => handleCompleteImport(record)}
                  className="text-green-600"
                  disabled={actionLoading}
                >
                  {actionLoading ? (
                    <Clock className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <CheckCircle className="h-4 w-4 mr-2" />
                  )}
                  Hoàn thành
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleCancelImport(record)}
                  className="text-red-600"
                  disabled={actionLoading}
                >
                  {actionLoading ? (
                    <Clock className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <XCircle className="h-4 w-4 mr-2" />
                  )}
                  Hủy phiếu nhập
                </DropdownMenuItem>
              </>
            )}
            {record.status !== "completed" && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => handleDeleteImport(record)}
                  className="text-red-600"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Xóa
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    }),
  ];

  if (loading && imports.length === 0) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Danh sách phiếu nhập vật tư
            </h1>
            <p className="text-muted-foreground">
              Theo dõi các phiếu nhập vật tư vào kho
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
      <div className="space-y-6">
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
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Danh sách phiếu nhập vật tư
            </h1>
            <p className="text-muted-foreground">
              Theo dõi các phiếu nhập vật tư vào kho
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Danh sách phiếu nhập vật tư
          </h1>
          <p className="text-muted-foreground">
            Theo dõi các phiếu nhập vật tư vào kho
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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Tổng phiếu nhập
            </CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{imports.length}</div>
            <div className="flex items-center text-xs text-muted-foreground mt-1">
              <TrendingUp className="h-3 w-3 mr-1" />
              Tất cả phiếu
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Đang chờ</CardTitle>
            <Clock className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {pendingCount}
            </div>
            <div className="flex items-center text-xs text-muted-foreground mt-1">
              Cần xử lý
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Đã hoàn thành</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {completedCount}
            </div>
            <div className="flex items-center text-xs text-muted-foreground mt-1">
              Thành công
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng giá trị</CardTitle>
            <FileText className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-blue-600">
              {new Intl.NumberFormat("vi-VN", {
                style: "currency",
                currency: "VND",
                notation: "compact",
              }).format(totalValue)}
            </div>
            <div className="flex items-center text-xs text-muted-foreground mt-1">
              Đã nhập kho
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter Toolbar */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Tìm kiếm theo số hóa đơn hoặc nhà cung cấp..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10"
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
                    Nhà cung cấp: {getSupplierName(filters.supplierId)}
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
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold">
              Phiếu nhập vật tư ({imports.length})
            </CardTitle>
            {imports.length > 0 && (
              <div className="flex items-center text-sm text-muted-foreground">
                Hiển thị {imports.length} kết quả
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <ResponsiveTable
            dataSource={imports}
            columns={columns}
            loading={loading}
            emptyText={
              <div className="text-center py-12">
                <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <div className="text-lg font-medium mb-2">
                  {searchTerm
                    ? "Không tìm thấy phiếu nhập nào"
                    : "Chưa có phiếu nhập nào"}
                </div>
                <div className="text-muted-foreground mb-4">
                  {searchTerm
                    ? `Không có phiếu nhập nào khớp với "${searchTerm}"`
                    : "Tạo phiếu nhập đầu tiên để bắt đầu quản lý vật tư."}
                </div>
                {!searchTerm && (
                  <Button onClick={handleCreateImport}>
                    <Plus className="h-4 w-4 mr-2" />
                    Tạo phiếu nhập đầu tiên
                  </Button>
                )}
              </div>
            }
            rowKey="id"
          />
        </CardContent>
      </Card>

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

      {/* TODO: Add edit dialog when available */}
      {showEditDialog && selectedImport && (
        <SupplyImportFormDialog
          open={showEditDialog}
          onOpenChange={setShowEditDialog}
          onSuccess={handleDialogSuccess}
          // TODO: Pass selected import data when edit functionality is available
        />
      )}
    </div>
  );
}
