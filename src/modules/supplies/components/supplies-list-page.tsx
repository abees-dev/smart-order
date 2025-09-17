import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Plus, Eye, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useDocumentTitle } from "@/hooks/use-document-title";
import {
  EnhancedTable,
  useEnhancedTableColumns,
  type ResponsiveTableColumn,
  type TableAction,
} from "@/components/tables";
import { useSupplies } from "../hooks/use-supply";
import { SupplyFormDialog } from "./supply-form-dialog";
import { SupplyDetailDialog } from "./supply-detail-dialog";
import { DeleteSupplyDialog } from "./delete-supply-dialog";
import type { Supply, SupplyFilters } from "../types";
import { SUPPLY_CATEGORY_MAP } from "../utils/supply-categrory";
import { useIsMobile } from "@/hooks/use-mobile";

export function SuppliesListPage() {
  const { t } = useTranslation();
  useDocumentTitle();

  // Set document title manually for this page
  useEffect(() => {
    document.title = `${t("supplies.title") || "Vật tư"} - ${t("app.title")}`;
  }, [t]);

  const [filters, setFilters] = useState<SupplyFilters>({});
  const [showFormDialog, setShowFormDialog] = useState(false);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedSupply, setSelectedSupply] = useState<Supply | null>(null);
  const isMobile = useIsMobile();
  const [page, setPage] = useState(1);
  const changePage = (newPage: number) => {
    setPage(newPage);
  };

  const {
    loading,
    error,
    supplies,
    fetchNextPage,
    hasNextPage,
    isFetching: loadingMore,
    pagination,
    refetchSupplies,
  } = useSupplies({
    ...filters,
    page: page,
    limit: 10,
  });

  const { createColumn, createCurrencyColumn } =
    useEnhancedTableColumns<Supply>();

  const handleSearch = (value: string) => {
    setFilters((prev) => ({ ...prev, search: value || undefined }));
  };

  const handleFormSuccess = () => {
    refetchSupplies();
    setSelectedSupply(null);
    setShowFormDialog(false);
  };

  const handleDeleteSuccess = () => {
    refetchSupplies();
    setSelectedSupply(null);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const getStockStatus = (supply: Supply) => {
    if (supply.currentStock <= supply.minStock) {
      return { label: "Hết hàng", color: "error" as const };
    }
    if (supply.currentStock <= supply.minStock * 1.5) {
      return { label: "Sắp hết", color: "warning" as const };
    }
    return { label: "Còn hàng", color: "info" as const };
  };

  // Define table columns
  const columns: ResponsiveTableColumn<Supply>[] = [
    createColumn({
      key: "supply",
      title: "Thông tin vật tư",
      render: (_, record: Supply) => {
        const status = getStockStatus(record);
        return (
          <div className="space-y-1">
            <div className="font-semibold text-foreground max-w-[360px] min-w-24 truncate">
              {record.name}
            </div>
            <div className="text-sm text-muted-foreground">
              <span className="px-2 py-1 bg-muted rounded-md text-xs mr-2">
                {SUPPLY_CATEGORY_MAP[record.category] || record.category}
              </span>
              <span className="text-xs bg-muted/50 px-2 py-1 rounded">
                {record.sku}
              </span>
            </div>
            <div className="flex items-center gap-2 sm:hidden text-xs">
              <span className="font-semibold">
                {record.currentStock} {record.unit}
              </span>
              <Badge
                variant={"outline"}
                color={status.color}
                className="text-xs"
              >
                {status.label}
              </Badge>
            </div>
            <div className="flex items-center gap-2 sm:hidden text-xs">
              <span className="text-muted-foreground">Mua:</span>
              <span className="font-semibold text-blue-600">
                {formatCurrency(record.purchasePrice)}
              </span>
              <span className="text-muted-foreground">Bán:</span>
              <span className="font-semibold text-green-600">
                {formatCurrency(record.salePrice)}
              </span>
            </div>
          </div>
        );
      },
    }),
    createColumn({
      key: "stock",
      title: "Tồn kho",
      responsive: false,
      align: "center",
      render: (_, record: Supply) => {
        const status = getStockStatus(record);
        return (
          <div className="text-center">
            <div className="font-bold text-lg mb-1">
              {record.currentStock} {record.unit}
            </div>
            <Badge
              variant={"outline"}
              color={status.color}
              className="text-xs mb-2"
            >
              {status.label}
            </Badge>
            <div className="text-xs text-muted-foreground">
              Tối thiểu: {record.minStock} {record.unit}
            </div>
          </div>
        );
      },
    }),
    createCurrencyColumn("purchasePrice", "Giá mua"),
    createCurrencyColumn("salePrice", "Giá bán"),
    createColumn({
      key: "supplier",
      title: "Nhà cung cấp",
      responsive: false,
      render: (_, record: Supply) => (
        <div className="text-sm max-w-48 min-w-24">
          <div className="truncate">{record.supplier?.name || "-"}</div>
        </div>
      ),
    }),
  ];

  // Define table actions
  const tableActions: TableAction<Supply>[] = [
    {
      key: "view",
      label: "Xem chi tiết",
      icon: Eye,
      onClick: (record) => {
        setSelectedSupply(record);
        setShowDetailDialog(true);
      },
    },
    {
      key: "edit",
      label: "Chỉnh sửa",
      icon: Pencil,
      onClick: (record) => {
        setSelectedSupply(record);
        setShowFormDialog(true);
      },
    },
    {
      key: "delete",
      label: "Xóa",
      icon: Trash2,
      variant: "destructive",
      onClick: (record) => {
        setSelectedSupply(record);
        setShowDeleteDialog(true);
      },
    },
  ];

  // Mobile card renderer
  const mobileCardRender = (record: Supply) => {
    const status = getStockStatus(record);
    return (
      <div className="space-y-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1 flex-1">
            <div className="text-xs bg-muted/50 px-2 py-1 rounded w-fit">
              {record.sku}
            </div>
            <h3 className="font-semibold text-base line-clamp-2">
              {record.name}
            </h3>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-xs">
                {SUPPLY_CATEGORY_MAP[record.category] || record.category}
              </Badge>
              <Badge
                variant={"outline"}
                color={status.color}
                className="text-xs"
              >
                {status.label}
              </Badge>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <span className="text-muted-foreground">Tồn kho:</span>
            <p className="font-semibold">
              {record.currentStock} {record.unit}
            </p>
          </div>
          <div>
            <span className="text-muted-foreground">Tối thiểu:</span>
            <p className="font-medium">
              {record.minStock} {record.unit}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <span className="text-muted-foreground">Giá mua:</span>
            <p className="font-semibold text-blue-600">
              {formatCurrency(record.purchasePrice)}
            </p>
          </div>
          <div>
            <span className="text-muted-foreground">Giá bán:</span>
            <p className="font-semibold text-green-600">
              {formatCurrency(record.salePrice)}
            </p>
          </div>
        </div>

        {record.location && (
          <div className="text-sm">
            <span className="text-muted-foreground">Vị trí:</span>
            <p className="font-medium">{record.location}</p>
          </div>
        )}

        <div className="text-sm">
          <span className="text-muted-foreground">Nhà cung cấp:</span>
          <p className="font-medium">{record.supplier?.name || "-"}</p>
        </div>
      </div>
    );
  };

  return (
    <div className="p-6 space-y-6">
      {error && (
        <div className="text-center text-red-600">
          <p>{error}</p>
          <Button
            onClick={() => {
              refetchSupplies();
            }}
            className="mt-2"
          >
            {t("common.retry") || "Thử lại"}
          </Button>
        </div>
      )}

      <EnhancedTable<Supply>
        title={t("supplies.title") || "Vật tư"}
        description={
          t("supplies.description") || "Quản lý danh sách vật tư của cửa hàng"
        }
        columns={columns}
        dataSource={supplies}
        rowKey="id"
        loading={loading}
        emptyText={t("supplies.noSuppliesFound") || "Không tìm thấy vật tư nào"}
        actions={tableActions}
        hasMore={hasNextPage}
        onLoadMore={fetchNextPage}
        isMobile={isMobile}
        loadingMore={loadingMore}
        searchValue={filters.search || ""}
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
        searchable
        searchPlaceholder={
          t("supplies.searchPlaceholder") || "Tìm kiếm vật tư..."
        }
        onSearchChange={handleSearch}
        mobileCardRender={mobileCardRender}
        headerActions={
          <div className="flex items-center gap-2">
            <Button
              onClick={() => {
                setShowFormDialog(true);
                setSelectedSupply(null);
              }}
            >
              <Plus className="mr-2 h-4 w-4" />
              {t("supplies.addSupply")}
            </Button>
          </div>
        }
      />

      {/* Dialogs */}

      {showFormDialog && (
        <SupplyFormDialog
          open={showFormDialog}
          onOpenChange={(open) => {
            setShowFormDialog(open);
            if (!open) setSelectedSupply(null);
          }}
          onSuccess={handleFormSuccess}
          supply={selectedSupply || undefined}
          mode={selectedSupply ? "edit" : "create"}
        />
      )}

      {showDetailDialog && (
        <SupplyDetailDialog
          open={showDetailDialog}
          onOpenChange={setShowDetailDialog}
          supply={selectedSupply}
          onSuccess={() => {
            setShowDetailDialog(false);
            refetchSupplies();
          }}
        />
      )}

      {showDeleteDialog && (
        <DeleteSupplyDialog
          open={showDeleteDialog}
          onOpenChange={setShowDeleteDialog}
          supply={selectedSupply}
          onSuccess={handleDeleteSuccess}
        />
      )}
    </div>
  );
}

export default SuppliesListPage;
