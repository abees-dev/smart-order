import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  Plus,
  Search,
  Filter,
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
            <Button variant="outline" size="sm">
              <Filter className="mr-2 h-4 w-4" />
              {t("common.filter")}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
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
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("customers.customerName")}</TableHead>
                    <TableHead>{t("customers.email")}</TableHead>
                    <TableHead>{t("customers.phone")}</TableHead>
                    <TableHead>{t("customers.city")}</TableHead>
                    <TableHead>{t("customers.status")}</TableHead>
                    <TableHead className="w-[100px]">
                      {t("common.actions")}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {customers.map((customer) => (
                    <TableRow key={customer.id}>
                      <TableCell className="font-medium">
                        {customer.name}
                      </TableCell>
                      <TableCell>{customer.email}</TableCell>
                      <TableCell>{customer.phone}</TableCell>
                      <TableCell>{customer.city}</TableCell>
                      <TableCell>
                        <Badge
                          variant={customer.isActive ? "default" : "secondary"}
                        >
                          {customer.isActive
                            ? t("common.active")
                            : t("common.inactive")}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Open menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>
                              {t("common.actions")}
                            </DropdownMenuLabel>
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedCustomer(customer);
                                setShowDetailDialog(true);
                              }}
                            >
                              <Eye className="mr-2 h-4 w-4" />
                              {t("common.view")}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedCustomer(customer);
                                setShowEditDialog(true);
                              }}
                            >
                              <Pencil className="mr-2 h-4 w-4" />
                              {t("common.edit")}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleStatusToggle(customer)}
                            >
                              {customer.isActive ? (
                                <UserX className="mr-2 h-4 w-4" />
                              ) : (
                                <UserCheck className="mr-2 h-4 w-4" />
                              )}
                              {customer.isActive
                                ? t("customers.deactivate")
                                : t("customers.activate")}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-red-600"
                              onClick={() => {
                                setSelectedCustomer(customer);
                                setShowDeleteDialog(true);
                              }}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              {t("common.delete")}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {customers.length === 0 && !loading && (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">
                    {t("customers.noCustomersFound")}
                  </p>
                </div>
              )}

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
