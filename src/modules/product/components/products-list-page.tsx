import { useState } from "react";
import { Plus, Eye, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDocumentTitle } from "@/hooks/use-document-title";
import {
  EnhancedTable,
  useEnhancedTableColumns,
  type ResponsiveTableColumn,
  type TableAction,
} from "@/components/tables";

import { useProducts } from "../hooks/use-product";
import { ProductFormDialog } from "./product-form-dialog";
import { ProductDetailDialog } from "./product-detail-dialog";
import { DeleteProductDialog } from "./delete-product-dialog";
import type { Product, ProductFilters } from "../types";
import ReactMarkdown from "react-markdown";

export function ProductsListPage() {
  useDocumentTitle();

  const [filters, setFilters] = useState<ProductFilters>({});
  const [showFormDialog, setShowFormDialog] = useState(false);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const { state, refreshProducts, loadMore, hasMore } = useProducts(filters);
  const { createColumn, createCurrencyColumn } =
    useEnhancedTableColumns<Product>();

  const handleSearch = (value: string) => {
    setFilters((prev) => ({ ...prev, search: value || undefined }));
  };

  const handleFormSuccess = () => {
    refreshProducts();
    setSelectedProduct(null);
  };

  const handleDeleteSuccess = () => {
    refreshProducts();
    setSelectedProduct(null);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const truncateText = (text: string, maxLength: number = 50) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  // Define table columns
  const columns: ResponsiveTableColumn<Product>[] = [
    createColumn({
      key: "product",
      title: "Thông tin sản phẩm",
      render: (_, record: Product) => (
        <div className="space-y-1">
          <div className="font-semibold text-foreground">{record.name}</div>
          <div className="text-sm text-muted-foreground">
            <span className="px-2 py-1 bg-muted rounded-md text-xs">
              {record.category}
            </span>
          </div>
          {record.description && (
            <div className="text-xs text-muted-foreground sm:hidden line-clamp-2">
              {truncateText(record.description)}
            </div>
          )}
          <div className="flex items-center gap-2 sm:hidden text-xs">
            <span className="font-semibold text-green-600">
              {formatCurrency(record.price)}
            </span>
            {record.supplies && record.supplies.length > 0 && (
              <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded-md">
                {record.supplies.length} vật tư
              </span>
            )}
          </div>
        </div>
      ),
    }),
    createColumn({
      key: "description",
      title: "Mô tả",
      responsive: false,
      render: (_, record: Product) => (
        <div className="max-w-xs">
          {record.description ? (
            <div className="text-sm text-muted-foreground line-clamp-2">
              <ReactMarkdown>
                {truncateText(record.description, 80)}
              </ReactMarkdown>
            </div>
          ) : (
            <span className="text-muted-foreground">-</span>
          )}
        </div>
      ),
    }),
    createCurrencyColumn("price", "Giá bán"),
    createColumn({
      key: "supplies",
      title: "Vật tư",
      responsive: false,
      align: "center",
      render: (_, record: Product) => (
        <div>
          {record.supplies && record.supplies.length > 0 ? (
            <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded-md text-xs">
              {record.supplies.length} vật tư
            </span>
          ) : (
            <span className="text-muted-foreground">-</span>
          )}
        </div>
      ),
    }),
    createColumn({
      key: "status",
      title: "Trạng thái",
      align: "center",
      render: (_, record: Product) => (
        <span
          className={`px-2 py-1 rounded-md text-xs font-medium ${
            record.isActive
              ? "bg-green-50 text-green-700"
              : "bg-gray-50 text-gray-700"
          }`}
        >
          {record.isActive ? "Hoạt động" : "Tạm dừng"}
        </span>
      ),
    }),
  ];

  // Define table actions
  const tableActions: TableAction<Product>[] = [
    {
      key: "view",
      label: "Xem chi tiết",
      icon: Eye,
      onClick: (record) => {
        setSelectedProduct(record);
        setShowDetailDialog(true);
      },
    },
    {
      key: "edit",
      label: "Chỉnh sửa",
      icon: Pencil,
      onClick: (record) => {
        setSelectedProduct(record);
        setShowFormDialog(true);
      },
    },
    {
      key: "delete",
      label: "Xóa",
      icon: Trash2,
      variant: "destructive",
      onClick: (record) => {
        setSelectedProduct(record);
        setShowDeleteDialog(true);
      },
    },
  ];

  // Mobile card renderer
  const mobileCardRender = (record: Product) => (
    <div className="space-y-3">
      <div className="flex items-start justify-between">
        <div className="space-y-1 flex-1">
          <h3 className="font-semibold text-base">{record.name}</h3>
          <div className="flex items-center gap-2">
            <span className="px-2 py-1 bg-muted rounded-md text-xs">
              {record.category}
            </span>
            <span
              className={`px-2 py-1 rounded-md text-xs font-medium ${
                record.isActive
                  ? "bg-green-50 text-green-700"
                  : "bg-gray-50 text-gray-700"
              }`}
            >
              {record.isActive ? "Hoạt động" : "Tạm dừng"}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 text-sm">
        <div>
          <span className="text-muted-foreground">Giá bán:</span>
          <p className="font-semibold text-green-600">
            {formatCurrency(record.price)}
          </p>
        </div>
        <div>
          <span className="text-muted-foreground">Vật tư:</span>
          <p className="font-medium">{record.supplies?.length || 0} vật tư</p>
        </div>
      </div>

      {record.description && (
        <div className="text-sm">
          <span className="text-muted-foreground">Mô tả:</span>
          <p className="font-medium line-clamp-2">
            {truncateText(record.description, 100)}
          </p>
        </div>
      )}
    </div>
  );

  return (
    <div className="p-6 space-y-6">
      {/* <SupplierSelect /> */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Sản phẩm</h1>
          <p className="text-muted-foreground">
            Quản lý danh sách sản phẩm của cửa hàng
          </p>
        </div>
        <Button onClick={() => setShowFormDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Thêm sản phẩm
        </Button>
      </div>

      <EnhancedTable<Product>
        title="Danh sách sản phẩm"
        columns={columns}
        dataSource={state.products}
        actions={tableActions}
        loading={state.loading}
        searchable
        onSearchChange={handleSearch}
        searchPlaceholder="Tìm kiếm sản phẩm..."
        emptyText="Không tìm thấy sản phẩm nào"
        mobileCardRender={mobileCardRender}
        hasMore={hasMore}
        onLoadMore={loadMore}
        rowKey="id"
      />

      {/* Dialogs */}
      <ProductFormDialog
        open={showFormDialog}
        onOpenChange={setShowFormDialog}
        onSuccess={handleFormSuccess}
        product={selectedProduct}
        mode={selectedProduct ? "edit" : "create"}
      />

      <ProductDetailDialog
        open={showDetailDialog}
        onOpenChange={setShowDetailDialog}
        product={selectedProduct}
        onEdit={() => {
          setShowDetailDialog(false);
          setShowFormDialog(true);
        }}
        onDelete={() => {
          setShowDetailDialog(false);
          setShowDeleteDialog(true);
        }}
      />

      <DeleteProductDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        product={selectedProduct}
        onSuccess={handleDeleteSuccess}
      />
    </div>
  );
}
