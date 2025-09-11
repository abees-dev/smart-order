import { useState, useMemo } from "react";
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
import { useSuppliersByIds } from "@/hooks/use-supplier-select";
import { SUPPLY_CATEGORY_MAP } from "../utils/supply-categrory";

export function SuppliesListPage() {
  useDocumentTitle();

  const [filters, setFilters] = useState<SupplyFilters>({});
  const [showFormDialog, setShowFormDialog] = useState(false);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedSupply, setSelectedSupply] = useState<Supply | null>(null);

  const { supplies, loading, refreshSupplies, loadMoreSupplies, hasMore } =
    useSupplies(filters);

  // Get supplier IDs from supplies and fetch supplier data
  const supplierIds = useMemo(
    () => supplies.map((supply) => supply.supplierId),
    [supplies]
  );

  const { getSupplierName } = useSuppliersByIds(supplierIds);
  const { createColumn, createCurrencyColumn } =
    useEnhancedTableColumns<Supply>();

  const handleSearch = (value: string) => {
    setFilters((prev) => ({ ...prev, search: value || undefined }));
  };

  const handleFormSuccess = () => {
    refreshSupplies();
    setSelectedSupply(null);
    setShowFormDialog(false);
  };

  const handleDeleteSuccess = () => {
    refreshSupplies();
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
      return { label: "Hết hàng", color: "destructive" as const };
    }
    if (supply.currentStock <= supply.minStock * 1.5) {
      return { label: "Sắp hết", color: "outline" as const };
    }
    return { label: "Còn hàng", color: "default" as const };
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
              <Badge variant={status.color} className="text-xs">
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
            <Badge variant={status.color} className="text-xs mb-2">
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
          <div className="truncate">
            {getSupplierName(record.supplierId) || (
              <span className="text-muted-foreground">Chưa có</span>
            )}
          </div>
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
              <Badge variant={status.color} className="text-xs">
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
          <p className="font-medium">
            {getSupplierName(record.supplierId) || "Chưa có"}
          </p>
        </div>
      </div>
    );
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Vật tư</h1>
          <p className="text-muted-foreground">
            Quản lý danh sách vật tư của cửa hàng
          </p>
        </div>
        <Button onClick={() => setShowFormDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Thêm vật tư
        </Button>
      </div>

      <EnhancedTable<Supply>
        title="Danh sách vật tư"
        columns={columns}
        dataSource={supplies}
        actions={tableActions}
        loading={loading}
        searchable
        onSearchChange={handleSearch}
        searchPlaceholder="Tìm kiếm vật tư..."
        emptyText="Không tìm thấy vật tư nào"
        mobileCardRender={mobileCardRender}
        hasMore={hasMore}
        onLoadMore={loadMoreSupplies}
        rowKey="id"
      />

      {/* Dialogs */}

      {showFormDialog && (
        <SupplyFormDialog
          open={showFormDialog}
          onOpenChange={setShowFormDialog}
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
            refreshSupplies();
          }}
        />
      )}

      <DeleteSupplyDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        supply={selectedSupply}
        onSuccess={handleDeleteSuccess}
      />

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
