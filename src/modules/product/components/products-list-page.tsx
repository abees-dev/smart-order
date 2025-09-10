import { useState } from "react";
import {
  Plus,
  Search,
  Eye,
  Pencil,
  Trash2,
  MoreHorizontal,
  Package,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useDocumentTitle } from "@/hooks/use-document-title";
import {
  ResponsiveTable,
  useResponsiveTableColumns,
  type ResponsiveTableColumn,
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
  const { createColumn, createMobileHiddenColumn } =
    useResponsiveTableColumns<Product>();

  const handleSearch = (value: string) => {
    setFilters((prev) => ({ ...prev, search: value || undefined }));
  };

  const handleEditProduct = (product: Product) => {
    setSelectedProduct(product);
    setShowFormDialog(true);
  };

  const handleViewProduct = (product: Product) => {
    setSelectedProduct(product);
    setShowDetailDialog(true);
  };

  const handleDeleteProduct = (product: Product) => {
    setSelectedProduct(product);
    setShowDeleteDialog(true);
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
      render: (_, record) => (
        <div className="space-y-1">
          <div className="font-medium">{record.name}</div>
          <div className="text-sm text-muted-foreground">
            <Badge variant="secondary" className="text-xs">
              {record.category}
            </Badge>
          </div>
          {record.description && (
            <div className="text-xs text-muted-foreground sm:hidden line-clamp-2">
              {truncateText(record.description)}
            </div>
          )}
          <div className="flex items-center gap-2 sm:hidden">
            <span className="font-semibold text-green-600">
              {formatCurrency(record.price)}
            </span>
            {record.supplies && record.supplies.length > 0 && (
              <Badge variant="outline" className="text-xs">
                {record.supplies.length} vật tư
              </Badge>
            )}
          </div>
        </div>
      ),
    }),
    createMobileHiddenColumn({
      key: "description",
      title: "Mô tả",
      render: (_, record) => (
        <div className="max-w-xs">
          {record.description ? (
            <div className="text-sm text-muted-foreground line-clamp-2 prose prose-sm max-w-none">
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
    createMobileHiddenColumn({
      key: "price",
      title: "Giá bán",
      render: (_, record) => (
        <div className="text-right">
          <div className="font-semibold text-green-600">
            {formatCurrency(record.price)}
          </div>
          {record.cost && (
            <div className="text-sm text-muted-foreground">
              Vốn: {formatCurrency(record.cost)}
            </div>
          )}
        </div>
      ),
    }),
    createMobileHiddenColumn({
      key: "supplies",
      title: "Vật tư",
      render: (_, record) => (
        <div className="text-center">
          {record.supplies && record.supplies.length > 0 ? (
            <Badge variant="outline" className="text-xs">
              {record.supplies.length} vật tư
            </Badge>
          ) : (
            <span className="text-muted-foreground">-</span>
          )}
        </div>
      ),
    }),
    createColumn({
      key: "status",
      title: "Trạng thái",
      render: (_, record) => (
        <Badge
          variant={record.isActive ? "default" : "secondary"}
          className="text-xs"
        >
          {record.isActive ? "Hoạt động" : "Tạm dừng"}
        </Badge>
      ),
    }),
    createColumn({
      key: "actions",
      title: "Thao tác",
      width: 60,
      align: "center",
      render: (_, record) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => handleViewProduct(record)}>
              <Eye className="mr-2 h-4 w-4" />
              Xem chi tiết
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleEditProduct(record)}>
              <Pencil className="mr-2 h-4 w-4" />
              Chỉnh sửa
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-red-600"
              onClick={() => handleDeleteProduct(record)}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Xóa
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    }),
  ];

  return (
    <div className="p-6 space-y-6">
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

      <Card>
        <CardHeader>
          <CardTitle>Danh sách sản phẩm</CardTitle>
          <div className="flex items-center space-x-2">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Tìm kiếm sản phẩm..."
                className="pl-9"
                onChange={(e) => handleSearch(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-3 sm:p-6">
          {state.loading && state.products.length === 0 ? (
            <div className="space-y-4">
              <div className="text-center text-muted-foreground">
                Đang tải...
              </div>
              <div className="space-y-2">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            </div>
          ) : (
            <>
              <ResponsiveTable<Product>
                columns={columns}
                dataSource={state.products}
                rowKey="id"
                loading={state.loading}
                emptyText="Không tìm thấy sản phẩm nào"
              />

              {hasMore && (
                <div className="flex justify-center pt-4">
                  <Button
                    variant="outline"
                    onClick={loadMore}
                    disabled={state.loading}
                  >
                    {state.loading ? "Đang tải..." : "Tải thêm"}
                  </Button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

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
