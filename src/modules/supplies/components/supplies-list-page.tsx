import { useState, useMemo } from "react";
import {
  Plus,
  Search,
  Filter,
  Package,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Warehouse,
  Eye,
  Edit,
  Trash2,
  MoreVertical,
  Download,
  BarChart3,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
        <div className="font-mono text-sm font-medium bg-muted/50 px-2 py-1 rounded">
          {supply.sku}
        </div>
      ),
    }),
    createColumn({
      key: "name",
      title: "Tên vật tư",
      render: (_, supply) => (
        <div className="min-w-[180px] lg:min-w-[200px]">
          <div className="font-semibold text-sm lg:text-base mb-1 line-clamp-2">
            {supply.name}
          </div>
          <div className="flex flex-col lg:flex-row lg:items-center gap-1 lg:gap-2">
            <Badge variant="secondary" className="text-xs w-fit">
              {supply.category}
            </Badge>
            {supply.location && (
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Warehouse className="h-3 w-3" />
                <span className="truncate">{supply.location}</span>
              </span>
            )}
          </div>
        </div>
      ),
    }),
    createColumn({
      key: "stock",
      title: "Tồn kho",
      render: (_, supply) => {
        const status = getStockStatus(supply);
        const stockPercentage = (supply.currentStock / supply.maxStock) * 100;
        return (
          <div className="text-center min-w-[100px] lg:min-w-[120px]">
            <div className="font-bold text-sm lg:text-lg mb-1">
              {supply.currentStock} {supply.unit}
            </div>
            <div className="flex items-center justify-center gap-1 lg:gap-2 mb-1 lg:mb-2">
              <Badge
                variant={status.color}
                className="text-xs flex items-center gap-1 px-1 lg:px-2"
              >
                {status.color === "destructive" && (
                  <TrendingDown className="h-3 w-3" />
                )}
                {status.color === "outline" && (
                  <AlertTriangle className="h-3 w-3" />
                )}
                {status.color === "default" && (
                  <TrendingUp className="h-3 w-3" />
                )}
                <span className="hidden lg:inline">{status.label}</span>
              </Badge>
            </div>
            <div className="w-full bg-muted rounded-full h-1 lg:h-1.5 mb-1">
              <div
                className={`h-1 lg:h-1.5 rounded-full transition-all ${
                  stockPercentage <= 20
                    ? "bg-red-500"
                    : stockPercentage <= 50
                    ? "bg-yellow-500"
                    : "bg-green-500"
                }`}
                style={{ width: `${Math.min(stockPercentage, 100)}%` }}
              />
            </div>
            <div className="text-xs text-muted-foreground hidden lg:block">
              Min: {supply.minStock} • Max: {supply.maxStock}
            </div>
          </div>
        );
      },
    }),
    createColumn({
      key: "prices",
      title: "Giá mua / Giá bán",
      render: (_, supply) => (
        <div className="text-right min-w-[120px] lg:min-w-[140px]">
          <div className="space-y-1">
            <div className="text-xs lg:text-sm">
              <span className="text-muted-foreground text-xs hidden lg:inline">
                Mua:
              </span>
              <div className="font-semibold text-blue-600 text-xs lg:text-sm">
                {new Intl.NumberFormat("vi-VN", {
                  style: "currency",
                  currency: "VND",
                  notation: "compact",
                }).format(supply.purchasePrice)}
              </div>
            </div>
            <div className="text-xs lg:text-sm">
              <span className="text-muted-foreground text-xs hidden lg:inline">
                Bán:
              </span>
              <div className="font-semibold text-green-600 text-xs lg:text-sm">
                {new Intl.NumberFormat("vi-VN", {
                  style: "currency",
                  currency: "VND",
                  notation: "compact",
                }).format(supply.salePrice)}
              </div>
            </div>
          </div>
          <div className="text-xs text-muted-foreground mt-1 lg:mt-2 hidden lg:block">
            Lợi nhuận:{" "}
            {Math.round(
              ((supply.salePrice - supply.purchasePrice) /
                supply.purchasePrice) *
                100
            )}
            %
          </div>
        </div>
      ),
    }),
    createColumn({
      key: "supplier",
      title: "Nhà cung cấp",
      render: (_, supply) => (
        <div className="min-w-[100px] lg:min-w-[120px]">
          <div className="text-xs lg:text-sm font-medium truncate">
            {getSupplierName(supply.supplierId) || "Chưa có"}
          </div>
        </div>
      ),
    }),
    createColumn({
      key: "actions",
      title: "Thao tác",
      render: (_, supply) => (
        <div className="flex items-center justify-end">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem
                onClick={() => setSelectedSupply(supply)}
                className="flex items-center gap-2"
              >
                <Eye className="h-4 w-4" />
                Xem chi tiết
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  setSelectedSupply(supply);
                  // Add edit mode trigger here
                }}
                className="flex items-center gap-2"
              >
                <Edit className="h-4 w-4" />
                Chỉnh sửa
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => setSupplyToDelete(supply)}
                className="flex items-center gap-2 text-destructive focus:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
                Xóa vật tư
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
    }),
  ];

  const lowStockCount = supplies.filter(
    (supply) => supply.currentStock <= supply.minStock
  ).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20">
      <div className="container mx-auto px-4 py-6 space-y-8">
        {/* Modern Header Section */}
        <div className="relative">
          {/* Background decoration */}

          <div className="relative bg-white/80 backdrop-blur-sm border border-white/20 rounded-2xl p-6 shadow-lg shadow-black/5">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="space-y-3">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl blur-lg opacity-20"></div>
                    <div className="relative bg-gradient-to-br from-blue-500 to-purple-600 p-3 rounded-2xl">
                      <Package className="h-7 w-7 text-white" />
                    </div>
                  </div>
                  <div>
                    <h1 className="text-2xl lg:text-3xl xl:text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent">
                      Quản lý vật tư
                    </h1>
                    <p className="text-sm lg:text-base text-gray-600 mt-1">
                      Theo dõi tồn kho thông minh và hiệu quả
                    </p>
                  </div>
                </div>

                {/* Quick stats preview */}
                <div className="flex items-center gap-6 text-sm text-gray-600 mt-4">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                    <span>{supplies.length} vật tư</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                    <span>{lowStockCount} sắp hết</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    <span>
                      {new Set(supplies.map((s) => s.category)).size} danh mục
                    </span>
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex flex-col sm:flex-row gap-3 lg:gap-4">
                <Button onClick={() => setIsImportOpen(true)} variant="outline">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-purple-50 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <Download className="h-4 w-4 mr-2 relative z-10" />
                  <span className="relative z-10">Nhập vật tư</span>
                </Button>
                <Button onClick={() => setIsFormOpen(true)}>
                  <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <Plus className="h-4 w-4 mr-2 relative z-10" />
                  <span className="relative z-10 font-medium">
                    Thêm vật tư mới
                  </span>
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Modern Beautiful Table Section */}
        <Card className="relative overflow-hidden border-0 bg-white/90">
          {/* Gradient header background */}

          <CardHeader className="relative px-4 lg:px-8 py-5 lg:py-6 border-b border-gray-100/60">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="space-y-2">
                <CardTitle className="flex items-center gap-3 text-lg lg:text-xl">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-slate-400 to-slate-600 rounded-lg blur-sm opacity-20"></div>
                    <div className="relative bg-gradient-to-br from-slate-500 to-slate-700 p-2 rounded-lg">
                      <Warehouse className="h-5 w-5 lg:h-6 lg:w-6 text-white" />
                    </div>
                  </div>
                  <div>
                    <span className="bg-gradient-to-r from-slate-800 to-slate-900 bg-clip-text text-transparent font-bold">
                      Danh sách vật tư
                    </span>
                    <div className="hidden sm:block">
                      <p className="text-sm text-gray-600 font-normal mt-1">
                        Quản lý {supplies.length} vật tư trong kho một cách
                        thông minh
                      </p>
                    </div>
                  </div>
                </CardTitle>

                {/* Mobile title */}
                <div className="sm:hidden">
                  <p className="text-sm text-gray-600">
                    {supplies.length} vật tư • {lowStockCount} sắp hết
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Button variant="outline">
                  <BarChart3 className="h-4 w-4 text-gray-500 group-hover:text-purple-600" />
                  <span className="text-sm font-medium text-gray-700 group-hover:text-purple-700">
                    Phân tích
                  </span>
                </Button>
              </div>
            </div>
          </CardHeader>

          {error && (
            <div className="m-3 lg:m-4 p-3 lg:p-4 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <CardContent className="p-0">
            <ResponsiveTable
              dataSource={supplies}
              columns={columns}
              loading={loading}
              rowKey="id"
              emptyText="Không tìm thấy vật tư nào phù hợp"
              className="border-0"
            />
          </CardContent>
        </Card>

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
    </div>
  );
}
