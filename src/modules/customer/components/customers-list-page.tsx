import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Plus, Pencil, Trash2, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  EnhancedTable,
  useEnhancedTableColumns,
  type ResponsiveTableColumn,
  type TableAction,
} from "@/components/tables";

import { useCustomers, useCustomerActions } from "../hooks/use-customer";
import { CustomerFormDialog } from "./customer-form-dialog";
import { CustomerDetailDialog } from "./customer-detail-dialog";
import { DeleteCustomerDialog } from "./delete-customer-dialog";
import { CustomerFilterSheet } from "./customer-filter-sheet";
import type { Customer, CustomerFilters } from "../types";
import { useDocumentTitle } from "@/hooks/use-document-title";

export function CustomersListPage() {
  const { t } = useTranslation();
  useDocumentTitle();

  // Set document title manually for this page
  useEffect(() => {
    document.title = `${t("customers.title")} - ${t("app.title")}`;
  }, [t]);

  const [filters, setFilters] = useState<CustomerFilters>({});
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null
  );
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const {
    customers,
    loading,
    error,
    hasMore,
    loadMore,
    refreshCustomers,
    total,
    page,
    pageSize,
    changePage,
    isMobile,
    loadingMore,
  } = useCustomers(filters, 7);

  useCustomerActions();
  const { createColumn, createStatusColumn } =
    useEnhancedTableColumns<Customer>();

  const handleSearch = (value: string) => {
    setFilters((prev) => ({ ...prev, search: value || undefined }));
  };

  // Define table columns
  const columns: ResponsiveTableColumn<Customer>[] = [
    createColumn({
      key: "customer",
      title: t("customers.customerInfo"),
      render: (_, record: Customer) => (
        <div className="space-y-1">
          <div className="font-semibold text-foreground">{record.name}</div>
          {record.email && (
            <div className="text-sm text-muted-foreground">{record.email}</div>
          )}
          <div className="flex items-center gap-2 text-xs text-muted-foreground sm:hidden">
            <span>{record.phone}</span>
            <span>•</span>
            <span>{record.city}</span>
          </div>
          {record.contactPerson && (
            <div className="text-xs text-muted-foreground">
              {t("customers.contactPerson")}: {record.contactPerson}
            </div>
          )}
        </div>
      ),
    }),
    createColumn({
      key: "email",
      title: t("customers.email"),
      responsive: false,
      render: (_, record: Customer) => (
        <span className="text-sm">{record.email || "-"}</span>
      ),
    }),
    createColumn({
      key: "phone",
      title: t("customers.phone"),
      dataIndex: "phone",
      responsive: false,
      render: (value: unknown) => (
        <span className="text-sm">{(value as string) || "-"}</span>
      ),
    }),
    createColumn({
      key: "city",
      title: t("customers.city"),
      dataIndex: "city",
      responsive: false,
    }),
    createStatusColumn("isActive", t("customers.status")),
  ];

  // Define table actions
  const tableActions: TableAction<Customer>[] = [
    {
      key: "view",
      label: t("common.view"),
      icon: Eye,
      onClick: (record) => {
        setSelectedCustomer(record);
        setShowDetailDialog(true);
      },
    },
    {
      key: "edit",
      label: t("common.edit"),
      icon: Pencil,
      onClick: (record) => {
        setSelectedCustomer(record);
        setShowEditDialog(true);
      },
    },
    {
      key: "delete",
      label: t("common.delete"),
      icon: Trash2,
      variant: "destructive",
      onClick: (record) => {
        setSelectedCustomer(record);
        setShowDeleteDialog(true);
      },
    },
  ];

  // Mobile card renderer
  const mobileCardRender = (record: Customer) => (
    <div className="space-y-3">
      <div className="flex items-start justify-between">
        <div className="space-y-1 flex-1">
          <h3 className="font-semibold text-base">{record.name}</h3>
          {record.email && (
            <p className="text-sm text-muted-foreground">{record.email}</p>
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

      {record.contactPerson && (
        <div className="text-sm">
          <span className="text-muted-foreground">
            {t("customers.contactPerson")}:
          </span>
          <p className="font-medium">{record.contactPerson}</p>
        </div>
      )}
    </div>
  );

  const handleCustomerCreated = () => {
    setShowCreateDialog(false);
    refreshCustomers();
  };

  const handleCustomerUpdated = () => {
    setShowEditDialog(false);
    setSelectedCustomer(null);
    refreshCustomers();
  };

  const handleCustomerDeleted = () => {
    setShowDeleteDialog(false);
    setSelectedCustomer(null);
    refreshCustomers();
  };

  const handleFiltersChange = (newFilters: CustomerFilters) => {
    setFilters(newFilters);
  };

  const handleClearFilters = () => {
    setFilters({});
  };

  if (error) {
    return (
      <div className="p-6">
        <div className="text-center text-red-600">
          <p>{error}</p>
          <Button onClick={refreshCustomers} className="mt-2">
            {t("common.retry")}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <EnhancedTable<Customer>
        title={t("customers.title")}
        description={t("customers.description")}
        columns={columns}
        dataSource={customers}
        rowKey="id"
        loading={loading}
        emptyText={t("customers.noCustomersFound")}
        actions={tableActions}
        hasMore={hasMore}
        onLoadMore={loadMore}
        isMobile={isMobile}
        loadingMore={loadingMore}
        pagination={
          !isMobile
            ? {
                current: page,
                pageSize: pageSize,
                total: total,
                onChange: (newPage: number) => changePage(newPage),
              }
            : undefined
        }
        searchable
        searchPlaceholder={t("customers.searchPlaceholder")}
        onSearchChange={handleSearch}
        mobileCardRender={mobileCardRender}
        headerActions={
          <div className="flex items-center gap-2">
            <CustomerFilterSheet
              filters={filters}
              onFiltersChange={handleFiltersChange}
              onClearFilters={handleClearFilters}
            />
            <Button onClick={() => setShowCreateDialog(true)}>
              <Plus className="mr-2 h-4 w-4" />
              {t("customers.addCustomer")}
            </Button>
          </div>
        }
      />

      <CustomerFormDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onSuccess={handleCustomerCreated}
      />

      <CustomerFormDialog
        open={showEditDialog}
        onOpenChange={(open: boolean) => {
          setShowEditDialog(open);
          if (!open) setSelectedCustomer(null);
        }}
        customer={selectedCustomer}
        onSuccess={handleCustomerUpdated}
      />

      <CustomerDetailDialog
        open={showDetailDialog}
        onOpenChange={(open: boolean) => {
          setShowDetailDialog(open);
          if (!open) setSelectedCustomer(null);
        }}
        customer={selectedCustomer}
      />

      <DeleteCustomerDialog
        open={showDeleteDialog}
        onOpenChange={(open: boolean) => {
          setShowDeleteDialog(open);
          if (!open) setSelectedCustomer(null);
        }}
        customer={selectedCustomer}
        onSuccess={handleCustomerDeleted}
      />
    </div>
  );
}
