import { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Plus, Pencil, Trash2, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  EnhancedTable,
  useEnhancedTableColumns,
  type ResponsiveTableColumn,
  type TableAction,
} from "@/components/tables";
import { useSuppliers } from "../hooks/use-supplier";
import { SupplierFormDialog } from "./supplier-form-dialog";
import { SupplierDetailDialog } from "./supplier-detail-dialog";
import { DeleteSupplierDialog } from "./delete-supplier-dialog";
import { SupplierFilterSheet } from "./supplier-filter-sheet";
import type { Supplier, SupplierFilters } from "../types";
import { useDocumentTitle } from "@/hooks/use-document-title";
import { useIsMobile } from "@/hooks/use-mobile";
import { debounce } from "lodash";
import { PermissionGuard, usePermissions } from "@/components/guards";
import { Actions, Resources } from "@/constants";

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
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showFilterSheet, setShowFilterSheet] = useState(false);
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const isMobile = useIsMobile();
  const { hasPermission } = usePermissions();
  const changePage = (newPage: number) => {
    setPage(newPage);
  };

  const {
    suppliers,
    loading,
    error,
    refetchSuppliers,
    hasNextPage,
    fetchNextPage,
    pagination,
  } = useSuppliers({
    ...filters,
    page: page,
    limit: 10,
    search: searchTerm || undefined,
  });
  const { createColumn, createStatusColumn } =
    useEnhancedTableColumns<Supplier>();

  const debouncedSearchTerm = useCallback(
    debounce((term: string) => {
      setSearchTerm(term);
    }, 300),
    []
  );
  const handleSearch = (value: string) => {
    setFilters((prev) => ({ ...prev, search: value || undefined }));
    debouncedSearchTerm(value);
  };

  // Define table columns
  const columns: ResponsiveTableColumn<Supplier>[] = [
    createColumn({
      key: "supplier",
      title: t("suppliers.supplierInfo"),
      render: (_, record: Supplier) => (
        <div className="space-y-1">
          <div className="font-semibold text-foreground">{record.name}</div>
          {record.contactPerson && (
            <div className="text-sm text-muted-foreground">
              {t("suppliers.contactPerson")}: {record.contactPerson}
            </div>
          )}
          <div className="flex items-center gap-2 text-xs text-muted-foreground sm:hidden">
            <span>{record.phone}</span>
            {record.email && (
              <>
                <span>•</span>
                <span>{record.email}</span>
              </>
            )}
          </div>
        </div>
      ),
    }),
    createColumn({
      key: "phone",
      title: t("suppliers.phone"),
      dataIndex: "phone",
      responsive: false,
    }),
    createColumn({
      key: "email",
      title: t("suppliers.email"),
      responsive: false,
      render: (_, record: Supplier) => (
        <span className="text-sm">{record.email || "-"}</span>
      ),
    }),
    createColumn({
      key: "city",
      title: t("suppliers.city"),
      dataIndex: "city",
      responsive: false,
    }),
    createStatusColumn("isActive", t("common.status")),
  ];

  // Define table actions
  const tableActions: TableAction<Supplier>[] = [
    {
      key: "view",
      label: t("common.view"),
      icon: Eye,
      onClick: (record) => {
        setSelectedSupplier(record);
        setShowDetailDialog(true);
      },
      show: () => hasPermission(Resources.SUPPLIERS, Actions.DETAIL),
    },
    {
      key: "edit",
      label: t("common.edit"),
      icon: Pencil,
      onClick: (record) => {
        setSelectedSupplier(record);
        setShowEditDialog(true);
      },
      show: () => hasPermission(Resources.SUPPLIERS, Actions.UPDATE),
    },
    {
      key: "delete",
      label: t("common.delete"),
      icon: Trash2,
      variant: "destructive",
      show: () => hasPermission(Resources.SUPPLIERS, Actions.DELETE),
      onClick: (record) => {
        setSelectedSupplier(record);
        setShowDeleteDialog(true);
      },
    },
  ];

  // Mobile card renderer
  const mobileCardRender = (record: Supplier) => (
    <div className="space-y-3">
      <div className="flex items-start justify-between">
        <div className="space-y-1 flex-1">
          <h3 className="font-semibold text-base">{record.name}</h3>
          {record.contactPerson && (
            <p className="text-sm text-muted-foreground">
              {t("suppliers.contactPerson")}: {record.contactPerson}
            </p>
          )}
        </div>
        <div className="ml-2">
          {createStatusColumn("isActive", "Status").render?.(
            record.isActive,
            record,
            0
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 text-sm">
        <div>
          <span className="text-muted-foreground">Điện thoại:</span>
          <p className="font-medium">{record.phone}</p>
        </div>
        <div>
          <span className="text-muted-foreground">Thành phố:</span>
          <p className="font-medium">{record.city}</p>
        </div>
      </div>

      {record.email && (
        <div className="text-sm">
          <span className="text-muted-foreground">Email:</span>
          <p className="font-medium">{record.email}</p>
        </div>
      )}
    </div>
  );

  const handleSupplierCreated = () => {
    setShowCreateDialog(false);
    refetchSuppliers();
  };

  const handleSupplierUpdated = () => {
    setShowEditDialog(false);
    setSelectedSupplier(null);
    refetchSuppliers();
  };

  const handleSupplierDeleted = () => {
    setShowDeleteDialog(false);
    setSelectedSupplier(null);
    refetchSuppliers();
  };

  const handleFiltersApply = (newFilters: SupplierFilters) => {
    setFilters(newFilters);
    setShowFilterSheet(false);
  };

  if (error) {
    return (
      <div className="p-6">
        <div className="text-center text-red-600">
          <p>{error}</p>
          <Button
            onClick={() => {
              refetchSuppliers();
            }}
            className="mt-2"
          >
            {t("common.retry")}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <EnhancedTable<Supplier>
        title={t("suppliers.title")}
        description={t("suppliers.description")}
        columns={columns}
        dataSource={suppliers}
        rowKey="id"
        loading={loading}
        emptyText={t("suppliers.noSuppliers")}
        actions={tableActions}
        searchable
        searchPlaceholder={t("suppliers.searchPlaceholder")}
        onSearchChange={handleSearch}
        mobileCardRender={mobileCardRender}
        hasMore={hasNextPage}
        onLoadMore={fetchNextPage}
        searchValue={filters.search || ""}
        onDoubleClick={(record) => {
          if (hasPermission(Resources.SUPPLIERS, Actions.DETAIL)) {
            setSelectedSupplier(record);
            setShowDetailDialog(true);
          }
        }}
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
        headerActions={
          <div className="flex items-center gap-2">
            {/* <Button variant="outline" onClick={() => setShowFilterSheet(true)}>
              <Filter className="mr-2 h-4 w-4" />
              {t("common.filter")}
            </Button> */}
            <PermissionGuard
              resource={Resources.SUPPLIERS}
              action={Actions.CREATE}
              fallback={null}
            >
              <Button onClick={() => setShowCreateDialog(true)}>
                <Plus className="mr-2 h-4 w-4" />
                {t("suppliers.add")}
              </Button>
            </PermissionGuard>
          </div>
        }
      />

      {/* Dialogs */}
      <SupplierFormDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onSuccess={handleSupplierCreated}
      />

      <SupplierFormDialog
        open={showEditDialog}
        onOpenChange={(open: boolean) => {
          setShowEditDialog(open);
          if (!open) setSelectedSupplier(null);
        }}
        onSuccess={handleSupplierUpdated}
        supplier={selectedSupplier}
      />

      <SupplierDetailDialog
        open={showDetailDialog}
        onOpenChange={(open: boolean) => {
          setShowDetailDialog(open);
          if (!open) setSelectedSupplier(null);
        }}
        supplier={selectedSupplier}
        onEdit={(supplier) => {
          setSelectedSupplier(supplier);
          setShowEditDialog(true);
          setShowDetailDialog(false);
        }}
      />

      <DeleteSupplierDialog
        open={showDeleteDialog}
        onOpenChange={(open: boolean) => {
          setShowDeleteDialog(open);
          if (!open) setSelectedSupplier(null);
        }}
        onSuccess={handleSupplierDeleted}
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

export default SuppliersListPage;
