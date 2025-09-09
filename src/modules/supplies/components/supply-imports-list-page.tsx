import { useState, useMemo } from "react";
import { Eye, CheckCircle, XCircle, Clock, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useDocumentTitle } from "@/hooks/use-document-title";
import { useSupplyImports } from "../hooks/use-supply";
import { useSuppliersByIds } from "@/hooks/use-supplier-select";
import {
  ResponsiveTable,
  useResponsiveTableColumns,
  type ResponsiveTableColumn,
} from "@/components/tables";
import type { SupplyImport } from "../types";

export function SupplyImportsListPage() {
  useDocumentTitle();

  const [searchTerm, setSearchTerm] = useState("");

  const { imports, loading, error, filters, updateFilters } =
    useSupplyImports();

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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return (
          <Badge variant="default" className="bg-green-100 text-green-800">
            <CheckCircle className="w-3 h-3 mr-1" />
            Đã hoàn thành
          </Badge>
        );
      case "cancelled":
        return (
          <Badge variant="destructive">
            <XCircle className="w-3 h-3 mr-1" />
            Đã hủy
          </Badge>
        );
      default:
        return (
          <Badge variant="outline">
            <Clock className="w-3 h-3 mr-1" />
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
      render: (value) => <div className="font-medium">{value as string}</div>,
    }),
    createColumn({
      key: "supplier",
      title: "Nhà cung cấp",
      render: (_, importItem) => (
        <div className="text-sm">{getSupplierName(importItem.supplierId)}</div>
      ),
    }),
    createColumn({
      key: "status",
      title: "Trạng thái",
      dataIndex: "status",
      render: (value) => getStatusBadge(value as string),
    }),
    createColumn({
      key: "totalAmount",
      title: "Tổng giá trị",
      dataIndex: "totalAmount",
      align: "right",
      render: (value) => (
        <div className="font-medium">
          {new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
          }).format(value as number)}
        </div>
      ),
    }),
    createColumn({
      key: "createdAt",
      title: "Ngày tạo",
      dataIndex: "createdAt",
      render: (value) => (
        <div className="text-sm">
          {(value as { toDate: () => Date }).toDate().toLocaleString("vi-VN")}
        </div>
      ),
    }),
    createColumn({
      key: "actions",
      title: "Thao tác",
      render: (_, record) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => console.log("View import:", record.id)}
        >
          <Eye className="h-4 w-4" />
        </Button>
      ),
    }),
  ];

  if (loading && imports.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Danh sách phiếu nhập vật tư
            </h1>
            <p className="text-muted-foreground">
              Theo dõi các phiếu nhập vật tư vào kho
            </p>
          </div>
        </div>
        <div className="flex justify-center py-8">
          <div className="text-center">Đang tải...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Danh sách phiếu nhập vật tư
            </h1>
            <p className="text-muted-foreground">
              Theo dõi các phiếu nhập vật tư vào kho
            </p>
          </div>
        </div>
        <div className="flex justify-center py-8">
          <div className="text-center text-red-600">{error}</div>
        </div>
      </div>
    );
  }

  const pendingCount = imports.filter((imp) => imp.status === "pending").length;
  const totalValue = imports
    .filter((imp) => imp.status === "completed")
    .reduce((sum, imp) => sum + imp.totalAmount, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Danh sách phiếu nhập vật tư
          </h1>
          <p className="text-muted-foreground">
            Theo dõi các phiếu nhập vật tư vào kho
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Tổng phiếu nhập
            </CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{imports.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Đang chờ</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {pendingCount}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng giá trị</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {new Intl.NumberFormat("vi-VN", {
                style: "currency",
                currency: "VND",
              }).format(totalValue)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <div className="flex gap-4 mb-6">
        <div className="flex-1">
          <Input
            placeholder="Tìm kiếm theo số hóa đơn hoặc nhà cung cấp..."
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            className="max-w-sm"
          />
        </div>
      </div>

      {/* Import Table */}
      <ResponsiveTable
        dataSource={imports}
        columns={columns}
        loading={loading}
        emptyText={
          <div className="text-center py-8">
            <div className="text-lg font-medium">Chưa có phiếu nhập nào</div>
            <div className="text-muted-foreground">
              Tạo phiếu nhập đầu tiên để bắt đầu.
            </div>
          </div>
        }
        rowKey="id"
      />
    </div>
  );
}
