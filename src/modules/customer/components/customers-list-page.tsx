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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ResponsiveTable,
  useResponsiveTableColumns,
  type ResponsiveTableColumn,
} from "@/components/tables";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
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

  const { customers, loading, error, hasMore, loadMore, refreshCustomers } =
    useCustomers(filters, 20);

  const { toggleCustomerStatus } = useCustomerActions();
  const { createColumn, createMobileHiddenColumn } =
    useResponsiveTableColumns<Customer>();

  const handleSearch = (value: string) => {
    setFilters((prev) => ({ ...prev, search: value || undefined }));
  };

  const handleStatusToggle = async (customer: Customer) => {
    try {
      await toggleCustomerStatus(customer.id);
      refreshCustomers();
    } catch (error) {
      console.error("Error toggling customer status:", error);
    }
  };

  // Define table columns
  const columns: ResponsiveTableColumn<Customer>[] = [
    createColumn({
      key: "customer",
      title: t("customers.customerInfo"),
      render: (_, record) => (
        <div className="space-y-1">
          <div className="font-medium">{record.name}</div>
          {record.email && (
            <>
              <div className="text-sm text-muted-foreground hidden sm:block">
                {record.email}
              </div>
              <div className="text-xs text-muted-foreground sm:hidden">
                {record.email}
              </div>
            </>
          )}
          <div className="text-xs text-muted-foreground sm:hidden">
            {record.phone} • {record.city}
          </div>
          {record.contactPerson && (
            <div className="text-xs text-muted-foreground">
              {t("customers.contactPerson")}: {record.contactPerson}
            </div>
          )}
        </div>
      ),
    }),
    createMobileHiddenColumn({
      key: "email",
      title: t("customers.email"),
      render: (_, record) => record.email || "-",
    }),
    createMobileHiddenColumn({
      key: "phone",
      title: t("customers.phone"),
      dataIndex: "phone",
    }),
    createMobileHiddenColumn({
      key: "city",
      title: t("customers.city"),
      dataIndex: "city",
    }),
    createColumn({
      key: "status",
      title: t("customers.status"),
      dataIndex: "isActive",
      render: (value) => (
        <Badge variant={value ? "default" : "secondary"} className="text-xs">
          {value ? t("common.active") : t("common.inactive")}
        </Badge>
      ),
    }),
    createColumn({
      key: "actions",
      title: t("common.actions"),
      width: 60,
      align: "center",
      render: (_, record) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>{t("common.actions")}</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => {
                setSelectedCustomer(record);
                setShowDetailDialog(true);
              }}
            >
              <Eye className="mr-2 h-4 w-4" />
              {t("common.view")}
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                setSelectedCustomer(record);
                setShowEditDialog(true);
              }}
            >
              <Pencil className="mr-2 h-4 w-4" />
              {t("common.edit")}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => handleStatusToggle(record)}>
              {record.isActive ? (
                <UserX className="mr-2 h-4 w-4" />
              ) : (
                <UserCheck className="mr-2 h-4 w-4" />
              )}
              {record.isActive
                ? t("customers.deactivate")
                : t("customers.activate")}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-red-600"
              onClick={() => {
                setSelectedCustomer(record);
                setShowDeleteDialog(true);
              }}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              {t("common.delete")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    }),
  ];

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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {t("customers.title")}
          </h1>
          <p className="text-muted-foreground">{t("customers.description")}</p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="mr-2 h-4 w-4" />
          {t("customers.addCustomer")}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("customers.customerList")}</CardTitle>
          <div className="flex items-center space-x-2">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t("customers.searchPlaceholder")}
                className="pl-9"
                onChange={(e) => handleSearch(e.target.value)}
              />
            </div>
            <CustomerFilterSheet
              filters={filters}
              onFiltersChange={handleFiltersChange}
              onClearFilters={handleClearFilters}
            />
          </div>
        </CardHeader>
        <CardContent className="p-3 sm:p-6">
          {loading && customers.length === 0 ? (
            <div className="space-y-4">
              <div className="text-center text-muted-foreground">
                {t("common.loading")}
              </div>
              <div className="space-y-2">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            </div>
          ) : (
            <>
              <ResponsiveTable<Customer>
                columns={columns}
                dataSource={customers}
                rowKey="id"
                loading={loading}
                emptyText={t("customers.noCustomersFound")}
              />

              {hasMore && (
                <div className="flex justify-center pt-4">
                  <Button
                    variant="outline"
                    onClick={loadMore}
                    disabled={loading}
                  >
                    {loading ? t("common.loading") : t("common.loadMore")}
                  </Button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

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
