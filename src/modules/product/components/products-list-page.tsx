import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
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
import { PRODUCT_CATEGORIES_MAP } from "@/constants/category";
import { useIsMobile } from "@/hooks/use-mobile";

export function ProductsListPage() {
  const { t } = useTranslation();
  useDocumentTitle();

  // Set document title manually for this page
  useEffect(() => {
    document.title = `${t("products.title")} - ${t("app.title")}`;
  }, [t]);

  const [filters, setFilters] = useState<ProductFilters>({});
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [page, setPage] = useState(1);
  const isMobile = useIsMobile();
  const changePage = (newPage: number) => {
    setPage(newPage);
  };

  const {
    products,
    loading,
    error,
    fetchNextPage,
    hasNextPage,
    isFetching,
    pagination,
    refetchProducts,
  } = useProducts({
    ...filters,
    page: page,
  });

  const { createColumn, createCurrencyColumn, createStatusColumn } =
    useEnhancedTableColumns<Product>();

  const handleSearch = (value: string) => {
    setFilters((prev) => ({ ...prev, search: value || undefined }));
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
      title: t("products.productInfo") || "Thông tin sản phẩm",
      render: (_, record: Product) => (
        <div className="space-y-1">
          <div className="font-semibold text-foreground">{record.name}</div>
          <div className="text-xs text-muted-foreground mb-1">
            <span className="font-mono bg-muted px-2 py-1 rounded">
              {record.productCode}
            </span>
          </div>
          <div className="text-sm text-muted-foreground">
            <span className="px-2 py-1 bg-muted rounded-md text-xs">
              {PRODUCT_CATEGORIES_MAP[record.category] || record.category}
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
      key: "productCode",
      title: t("products.productCode") || "Mã sản phẩm",
      responsive: false,
      render: (_, record: Product) => (
        <span className="font-mono text-sm bg-muted px-2 py-1 rounded">
          {record.productCode}
        </span>
      ),
    }),
    createColumn({
      key: "description",
      title: t("products.productDescription") || "Mô tả",
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
    createCurrencyColumn("price", t("products.price") || "Giá bán"),
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
    createStatusColumn("isActive", t("common.status") || "Trạng thái"),
  ];

  // Define table actions
  const tableActions: TableAction<Product>[] = [
    {
      key: "view",
      label: t("common.view") || "Xem chi tiết",
      icon: Eye,
      onClick: (record) => {
        setSelectedProduct(record);
        setShowDetailDialog(true);
      },
    },
    {
      key: "edit",
      label: t("common.edit") || "Chỉnh sửa",
      icon: Pencil,
      onClick: (record) => {
        setSelectedProduct(record);
        setShowEditDialog(true);
      },
    },
    {
      key: "delete",
      label: t("common.delete") || "Xóa",
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
            {createStatusColumn("isActive", "Status").render?.(
              record.isActive,
              record,
              0
            )}
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

  const handleProductCreated = () => {
    setShowCreateDialog(false);
    refetchProducts();
  };

  const handleProductUpdated = () => {
    setShowEditDialog(false);
    setSelectedProduct(null);
    refetchProducts();
  };

  const handleProductDeleted = () => {
    setShowDeleteDialog(false);
    setSelectedProduct(null);
    refetchProducts();
  };

  if (error) {
    return (
      <div className="p-6">
        <div className="text-center text-red-600">
          <p>{error}</p>
          <Button
            onClick={() => {
              refetchProducts();
            }}
            className="mt-2"
          >
            {t("common.retry") || "Thử lại"}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <EnhancedTable<Product>
        title={t("products.title") || "Sản phẩm"}
        description={
          t("products.description") || "Quản lý danh sách sản phẩm của cửa hàng"
        }
        columns={columns}
        dataSource={products}
        rowKey="id"
        loading={loading}
        emptyText={
          t("products.noProductsFound") || "Không tìm thấy sản phẩm nào"
        }
        actions={tableActions}
        hasMore={hasNextPage}
        onLoadMore={fetchNextPage}
        isMobile={isMobile}
        loadingMore={isFetching}
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
          t("products.searchPlaceholder") || "Tìm kiếm sản phẩm..."
        }
        onSearchChange={handleSearch}
        mobileCardRender={mobileCardRender}
        headerActions={
          <div className="flex items-center gap-2">
            <Button onClick={() => setShowCreateDialog(true)}>
              <Plus className="mr-2 h-4 w-4" />
              {t("products.addProduct") || "Thêm sản phẩm"}
            </Button>
          </div>
        }
      />

      {showCreateDialog && (
        <ProductFormDialog
          open={showCreateDialog}
          onOpenChange={setShowCreateDialog}
          onSuccess={handleProductCreated}
          mode="create"
        />
      )}

      {showEditDialog && (
        <ProductFormDialog
          open={showEditDialog}
          onOpenChange={(open: boolean) => {
            setShowEditDialog(open);
            if (!open) setSelectedProduct(null);
          }}
          product={selectedProduct}
          onSuccess={handleProductUpdated}
          mode="edit"
        />
      )}

      {showDetailDialog && (
        <ProductDetailDialog
          open={showDetailDialog}
          onOpenChange={(open: boolean) => {
            setShowDetailDialog(open);
            if (!open) setSelectedProduct(null);
          }}
          product={selectedProduct}
          onEdit={() => {
            setShowDetailDialog(false);
            setShowEditDialog(true);
          }}
          onDelete={() => {
            setShowDetailDialog(false);
            setShowDeleteDialog(true);
          }}
        />
      )}

      <DeleteProductDialog
        open={showDeleteDialog}
        onOpenChange={(open: boolean) => {
          setShowDeleteDialog(open);
          if (!open) setSelectedProduct(null);
        }}
        product={selectedProduct}
        onSuccess={handleProductDeleted}
      />
    </div>
  );
}

export default ProductsListPage;
