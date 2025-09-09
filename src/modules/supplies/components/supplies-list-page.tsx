import { useState, useMemo } from "react";
import { Plus, Search, Filter, Package, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useDocumentTitle } from "@/hooks/use-document-title";
import { useSupplies } from "../hooks/use-supply";
import { SupplyFormDialog } from "./supply-form-dialog";
import { SupplyDetailDialog } from "./supply-detail-dialog";
import { DeleteSupplyDialog } from "./delete-supply-dialog";
import { SupplyFilterSheet } from "./supply-filter-sheet";
import { SupplyImportFormDialog } from "./supply-import-form-dialog";
import {
  ResponsiveTable,
  useResponsiveTableColumns,
  type ResponsiveTableColumn,
} from "@/components/tables";
import type { Supply, SupplyFilters } from "../types";
import { useSuppliersByIds } from "@/hooks/use-supplier-select";

export function SuppliesListPage() {
  useDocumentTitle();

  const [searchTerm, setSearchTerm] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedSupply, setSelectedSupply] = useState<Supply | null>(null);
  const [supplyToDelete, setSupplyToDelete] = useState<Supply | null>(null);

  const { supplies, loading, error, filters, updateFilters, refreshSupplies } =
    useSupplies();

  // Get supplier IDs from supplies and fetch supplier data
  const supplierIds = useMemo(
    () => supplies.map((supply) => supply.supplierId),
    [supplies]
  );

  const { getSupplierName } = useSuppliersByIds(supplierIds);

  const { createColumn } = useResponsiveTableColumns<Supply>();

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    updateFilters({ ...filters, search: value || undefined });
  };

  const handleFilterChange = (newFilters: SupplyFilters) => {
    updateFilters(newFilters);
    setIsFilterOpen(false);
  };

  const handleSupplyCreated = () => {
    setIsFormOpen(false);
    refreshSupplies();
  };

  const handleSupplyUpdated = () => {
    setSelectedSupply(null);
    refreshSupplies();
  };

  const handleSupplyDeleted = () => {
    setSupplyToDelete(null);
    refreshSupplies();
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

  const columns: ResponsiveTableColumn<Supply>[] = [
    createColumn({
      key: "sku",
      title: "Mã SKU",
      render: (_, supply) => (
        <div className="font-mono text-sm">{supply.sku}</div>
      ),
    }),
    createColumn({
      key: "name",
      title: "Tên vật tư",
      render: (_, supply) => (
        <div>
          <div className="font-medium">{supply.name}</div>
          <div className="text-sm text-muted-foreground">{supply.category}</div>
        </div>
      ),
    }),
    createColumn({
      key: "stock",
      title: "Tồn kho",
      render: (_, supply) => {
        const status = getStockStatus(supply);
        return (
          <div className="text-center">
            <div className="font-medium">
              {supply.currentStock} {supply.unit}
            </div>
            <Badge variant={status.color} className="text-xs">
              {status.label}
            </Badge>
          </div>
        );
      },
    }),
    createColumn({
      key: "prices",
      title: "Giá mua / Giá bán",
      render: (_, supply) => (
        <div className="text-right">
          <div className="text-sm">
            <div className="text-blue-600">
              {new Intl.NumberFormat("vi-VN", {
                style: "currency",
                currency: "VND",
              }).format(supply.purchasePrice)}
            </div>
            <div className="text-green-600">
              {new Intl.NumberFormat("vi-VN", {
                style: "currency",
                currency: "VND",
              }).format(supply.salePrice)}
            </div>
          </div>
        </div>
      ),
    }),
    createColumn({
      key: "supplier",
      title: "Nhà cung cấp",
      render: (_, supply) => (
        <div className="text-sm">{getSupplierName(supply.supplierId)}</div>
      ),
    }),
    createColumn({
      key: "actions",
      title: "Thao tác",
      render: (_, supply) => (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSelectedSupply(supply)}
          >
            Xem
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-destructive"
            onClick={() => setSupplyToDelete(supply)}
          >
            Xóa
          </Button>
        </div>
      ),
    }),
  ];

  const lowStockCount = supplies.filter(
    (supply) => supply.currentStock <= supply.minStock
  ).length;

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Quản lý vật tư</h1>
          <p className="text-muted-foreground">
            Quản lý kho vật tư và theo dõi tồn kho
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setIsImportOpen(true)} variant="outline">
            <Package className="mr-2 h-4 w-4" />
            Nhập vật tư
          </Button>
          <Button onClick={() => setIsFormOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Thêm vật tư
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng vật tư</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{supplies.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sắp hết hàng</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {lowStockCount}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Tổng giá trị kho
            </CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Intl.NumberFormat("vi-VN", {
                style: "currency",
                currency: "VND",
                notation: "compact",
              }).format(
                supplies.reduce(
                  (sum, supply) =>
                    sum + supply.currentStock * supply.purchasePrice,
                  0
                )
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <div className="flex items-center gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Tìm kiếm theo tên hoặc SKU..."
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-8"
          />
        </div>
        <Button
          variant="outline"
          onClick={() => setIsFilterOpen(true)}
          className="flex items-center gap-2"
        >
          <Filter className="h-4 w-4" />
          Lọc
        </Button>
      </div>

      {error && (
        <div className="mb-4 p-4 text-sm text-destructive bg-destructive/10 rounded-md">
          {error}
        </div>
      )}

      <ResponsiveTable
        dataSource={supplies}
        columns={columns}
        loading={loading}
        rowKey="id"
        emptyText="Không có vật tư nào"
      />

      <SupplyFormDialog
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        onSuccess={handleSupplyCreated}
      />

      <SupplyDetailDialog
        supply={selectedSupply}
        open={!!selectedSupply}
        onOpenChange={(open: boolean) => !open && setSelectedSupply(null)}
        onSuccess={handleSupplyUpdated}
      />

      <DeleteSupplyDialog
        supply={supplyToDelete}
        open={!!supplyToDelete}
        onOpenChange={(open: boolean) => !open && setSupplyToDelete(null)}
        onSuccess={handleSupplyDeleted}
      />

      <SupplyImportFormDialog
        open={isImportOpen}
        onOpenChange={setIsImportOpen}
        onSuccess={refreshSupplies}
      />

      <SupplyFilterSheet
        open={isFilterOpen}
        onOpenChange={setIsFilterOpen}
        filters={filters}
        onFiltersChange={handleFilterChange}
      />
    </div>
  );
}
