import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  Plus,
  Search,
  MoreHorizontal,
  Pencil,
  Trash2,
  Eye,
  UserCheck,
  UserX,
  Filter,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ResponsiveTable,
  type ResponsiveTableColumn,
} from "@/components/tables";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useSuppliers, useSupplierForm } from "../hooks/use-supplier";
import { SupplierFormDialog } from "./supplier-form-dialog";
import { SupplierDetailDialog } from "./supplier-detail-dialog";
import { DeleteSupplierDialog } from "./delete-supplier-dialog";
import { SupplierFilterSheet } from "./supplier-filter-sheet";
import type { Supplier, SupplierFilters } from "../types";
import { useDocumentTitle } from "@/hooks/use-document-title";

export function SuppliersListPage() {
  const { t } = useTranslation();
  useDocumentTitle();

  // Set document title manually for this page
  useEffect(() => {
    document.title = `${t("suppliers.title")} - ${t("app.title")}`;
  }, [t]);

  const [filters, setFilters] = useState<SupplierFilters>({});
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(
    null
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showFilterSheet, setShowFilterSheet] = useState(false);

  const { suppliers, loading, error, refreshSuppliers } = useSuppliers(filters);

  const { toggleSupplierStatus } = useSupplierForm();

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setFilters((prev) => ({ ...prev, search: value }));
  };

  const handleCreateSupplier = () => {
    setSelectedSupplier(null);
    setShowCreateDialog(true);
  };

  const handleEditSupplier = (supplier: Supplier) => {
    setSelectedSupplier(supplier);
    setShowEditDialog(true);
  };

  const handleViewSupplier = (supplier: Supplier) => {
    setSelectedSupplier(supplier);
    setShowDetailDialog(true);
  };

  const handleDeleteSupplier = (supplier: Supplier) => {
    setSelectedSupplier(supplier);
    setShowDeleteDialog(true);
  };

  const handleToggleStatus = async (supplier: Supplier) => {
    try {
      await toggleSupplierStatus(supplier.id);
      refreshSuppliers();
    } catch (error) {
      console.error("Error toggling supplier status:", error);
    }
  };

  const handleFormSuccess = () => {
    setShowCreateDialog(false);
    setShowEditDialog(false);
    setSelectedSupplier(null);
    refreshSuppliers();
  };

  const handleDeleteSuccess = () => {
    setShowDeleteDialog(false);
    setSelectedSupplier(null);
    refreshSuppliers();
  };

  const handleFiltersApply = (newFilters: SupplierFilters) => {
    setFilters(newFilters);
    setShowFilterSheet(false);
  };

  // Define table columns
  const columns: ResponsiveTableColumn<Supplier>[] = [
    {
      key: "name",
      title: t("suppliers.name"),
      dataIndex: "name",
      className: "font-medium",
    },
    {
      key: "contactPerson",
      title: t("suppliers.contactPerson"),
      className: "hidden sm:table-cell",
      render: (_, record) => record.contactPerson || "-",
    },
    {
      key: "phone",
      title: t("suppliers.phone"),
      dataIndex: "phone",
      className: "hidden md:table-cell",
    },
    {
      key: "email",
      title: t("suppliers.email"),
      className: "hidden lg:table-cell",
      render: (_, record) => record.email || "-",
    },
    {
      key: "city",
      title: t("suppliers.city"),
      dataIndex: "city",
      className: "hidden lg:table-cell",
    },
    {
      key: "status",
      title: t("common.status"),
      className: "hidden sm:table-cell",
      render: (_, record) => (
        <Badge variant={record.isActive ? "default" : "secondary"}>
          {record.isActive ? t("common.active") : t("common.inactive")}
        </Badge>
      ),
    },
    {
      key: "actions",
      title: "",
      className: "w-[50px]",
      render: (_, record) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => handleViewSupplier(record)}>
              <Eye className="mr-2 h-4 w-4" />
              {t("common.view")}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleEditSupplier(record)}>
              <Pencil className="mr-2 h-4 w-4" />
              {t("common.edit")}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleToggleStatus(record)}>
              {record.isActive ? (
                <>
                  <UserX className="mr-2 h-4 w-4" />
                  {t("suppliers.deactivate")}
                </>
              ) : (
                <>
                  <UserCheck className="mr-2 h-4 w-4" />
                  {t("suppliers.activate")}
                </>
              )}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => handleDeleteSupplier(record)}
              className="text-destructive"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              {t("common.delete")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {t("suppliers.title")}
          </h1>
          <p className="text-muted-foreground">{t("suppliers.description")}</p>
        </div>
        <Button onClick={handleCreateSupplier}>
          <Plus className="mr-2 h-4 w-4" />
          {t("suppliers.add")}
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>{t("common.search")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder={t("suppliers.searchPlaceholder")}
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Button variant="outline" onClick={() => setShowFilterSheet(true)}>
              <Filter className="mr-2 h-4 w-4" />
              {t("common.filter")}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Suppliers Table */}
      <Card>
        <CardContent className="p-0">
          {loading && suppliers.length === 0 ? (
            <div className="p-6 space-y-4">
              {Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className="flex items-center space-x-4">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-[250px]" />
                    <Skeleton className="h-4 w-[200px]" />
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="p-6 text-center">
              <p className="text-destructive">{error}</p>
              <Button
                variant="outline"
                onClick={refreshSuppliers}
                className="mt-2"
              >
                {t("common.retry")}
              </Button>
            </div>
          ) : suppliers.length === 0 ? (
            <div className="p-6 text-center">
              <p className="text-muted-foreground mb-4">
                {t("suppliers.noSuppliers")}
              </p>
              <Button onClick={handleCreateSupplier}>
                <Plus className="mr-2 h-4 w-4" />
                {t("suppliers.addFirst")}
              </Button>
            </div>
          ) : (
            <>
              <ResponsiveTable
                dataSource={suppliers}
                columns={columns}
                loading={loading}
                rowKey="id"
              />
            </>
          )}
        </CardContent>
      </Card>

      {/* Dialogs */}
      <SupplierFormDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onSuccess={handleFormSuccess}
      />

      <SupplierFormDialog
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        onSuccess={handleFormSuccess}
        supplier={selectedSupplier}
      />

      <SupplierDetailDialog
        open={showDetailDialog}
        onOpenChange={setShowDetailDialog}
        supplier={selectedSupplier}
        onEdit={handleEditSupplier}
      />

      <DeleteSupplierDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        onSuccess={handleDeleteSuccess}
        supplier={selectedSupplier}
      />

      <SupplierFilterSheet
        open={showFilterSheet}
        onOpenChange={setShowFilterSheet}
        onApply={handleFiltersApply}
        initialFilters={filters}
      />
    </div>
  );
}
