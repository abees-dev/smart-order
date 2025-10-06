import { useParams, useNavigate } from "react-router-dom";
import { CheckCircle, XCircle, Trash2, MoreHorizontal } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

import { useIsMobile } from "@/hooks/use-mobile";
import { useDocumentTitle } from "@/hooks/use-document-title";

import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { useSupplyImportDetail } from "../hooks/use-supply-import";
import {
  useAddToWarehouseSupply,
  useCancelSupplyImport,
  useCompleteSupplyImport,
  useDeleteSupplyImport,
} from "../hooks/use-supply-import-actions";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { type TableAction } from "@/components/tables";
import type { SupplyImport } from "../types";

import { HeaderSection } from "./supply-import-header";
import { MobileDetailView } from "./supply-import-mobile-view";
import { DesktopDetailView } from "./supply-import-desktop-view";
import {
  SupplyImportDetailSkeleton,
  SupplyImportDetailSkeletonMobile,
} from "./supply-import-skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { usePermissions } from "@/components/guards";
import { Actions, Resources } from "@/constants";

export function SupplyImportDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const queryClient = useQueryClient();
  const { hasPermission } = usePermissions();

  useDocumentTitle();

  const {
    supplyImport,
    loading: detailLoading,
    error: detailError,
    refetchSupplyImport,
  } = useSupplyImportDetail(id);

  const { addToWarehouseSupply } = useAddToWarehouseSupply({
    onSuccess: () => {
      refetchSupplyImport();
      queryClient.invalidateQueries({
        predicate(query) {
          return query.queryKey[0] === "supplies";
        },
      });
      toast.success("Nhập kho thành công");
    },
    onError: (error) => {
      console.error("Failed to add to warehouse:", error);
      toast.error("Nhập kho thất bại, vui lòng thử lại");
    },
  });

  const { completeSupplyImport } = useCompleteSupplyImport({
    onSuccess: () => {
      refetchSupplyImport();
      toast.success("Hoàn thành phiếu nhập thành công");
    },
    onError: (error) => {
      console.error("Failed to complete import:", error);
      toast.error("Hoàn thành phiếu nhập thất bại, vui lòng thử lại");
    },
  });

  const { cancelSupplyImport } = useCancelSupplyImport({
    onSuccess: () => {
      refetchSupplyImport();
      toast.success("Hủy phiếu nhập thành công");
    },
    onError: (error) => {
      console.error("Failed to cancel import:", error);
      toast.error("Hủy phiếu nhập thất bại, vui lòng thử lại");
    },
  });

  const { deleteSupplyImport } = useDeleteSupplyImport({
    onSuccess: () => {
      navigate("/dashboard/supplies/imports");
      queryClient.invalidateQueries({
        predicate(query) {
          return query.queryKey[0] === "supplies";
        },
      });
      toast.success("Xóa phiếu nhập thành công");
    },
    onError: (error) => {
      console.error("Failed to delete import:", error);
      toast.error("Xóa phiếu nhập thất bại, vui lòng thử lại");
    },
  });

  const handleBack = () => {
    navigate("/dashboard/supplies/imports");
  };

  const handleAddToWarehouse = async (importRecord: SupplyImport) => {
    addToWarehouseSupply(importRecord.id);
  };

  const handleCompleteImport = async (importRecord: SupplyImport) => {
    completeSupplyImport(importRecord.id);
  };

  const handleCancelImport = async (importRecord: SupplyImport) => {
    cancelSupplyImport(importRecord.id);
  };

  const handleDeleteImport = (importRecord: SupplyImport) => {
    deleteSupplyImport(importRecord.id);
  };

  const tableActions: TableAction<SupplyImport>[] = [
    {
      key: "warehouse",
      label: "Nhập kho",
      icon: CheckCircle,
      variant: "default",
      onClick: (record) => handleAddToWarehouse(record),
      show: (record) =>
        record.status === "pending" &&
        hasPermission(Resources.SUPPLIES_IMPORT, Actions.UPDATE),
    },
    {
      key: "complete",
      label: "Hoàn thành",
      icon: CheckCircle,
      variant: "default",
      onClick: (record) => handleCompleteImport(record),
      show: (record) =>
        record.status === "warehouse" &&
        hasPermission(Resources.SUPPLIES_IMPORT, Actions.UPDATE),
    },
    {
      key: "cancel",
      label: "Hủy phiếu nhập",
      icon: XCircle,
      variant: "destructive",
      onClick: (record) => handleCancelImport(record),
      show: (record) =>
        record.status === "pending" &&
        hasPermission(Resources.SUPPLIES_IMPORT, Actions.UPDATE),
    },
    {
      key: "delete",
      label: "Xóa",
      icon: Trash2,
      variant: "destructive",
      onClick: (record) => handleDeleteImport(record),
      show: (record) =>
        record.status !== "completed" &&
        hasPermission(Resources.SUPPLIES_IMPORT, Actions.DELETE),
    },
  ];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const formatDate = (timestamp: Date | string | number) => {
    if (!timestamp) return "N/A";
    const date = new Date(timestamp);
    return format(date, "dd/MM/yyyy HH:mm", { locale: vi });
  };

  if (detailLoading) {
    return isMobile ? (
      <SupplyImportDetailSkeletonMobile />
    ) : (
      <SupplyImportDetailSkeleton />
    );
  }

  if (detailError || !supplyImport) {
    return (
      <div className="container mx-auto p-4 space-y-6">
        <Alert variant="destructive">
          <AlertDescription>
            {detailError || "Không tìm thấy phiếu nhập hàng"}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const totalQuantity = supplyImport.items.reduce(
    (sum, item) => sum + item.quantity,
    0
  );
  const totalItems = supplyImport.items.length;

  const commonProps = {
    importRecord: supplyImport,
    supplierName: supplyImport.supplier?.name || supplyImport.supplierId,
    formatCurrency,
    formatDate,
    totalQuantity,
    totalItems,
  };

  const renderActions = (
    actions: TableAction<SupplyImport>[],
    record: SupplyImport
  ) => {
    const visibleActions = actions.filter(
      (action) => !action.show || action.show(record)
    );

    if (visibleActions.length === 0) return null;

    if (visibleActions.length === 1) {
      const action = visibleActions[0];
      const Icon = action.icon;

      return (
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={(e) => {
            e.stopPropagation();
            action.onClick(record);
          }}
        >
          {Icon && <Icon className="h-4 w-4" />}
        </Button>
      );
    }

    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={(e) => e.stopPropagation()}
          >
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="min-w-[160px]">
          {visibleActions
            .filter((action) => (action.show ? action.show(record) : true))
            .map((action) => {
              const Icon = action.icon;
              return (
                <DropdownMenuItem
                  key={action.key}
                  onClick={() => action.onClick(record)}
                  className={cn(
                    "flex items-center gap-2 cursor-pointer",
                    action.variant === "destructive" &&
                      "text-destructive focus:text-destructive"
                  )}
                >
                  {Icon && <Icon className="h-4 w-4" />}
                  {action.label}
                </DropdownMenuItem>
              );
            })}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  };

  // const actionsDropdown = (
  //   <DropdownMenu>
  //     <DropdownMenuTrigger asChild>
  //       <Button variant="ghost" size="sm">
  //         <MoreHorizontal className="h-4 w-4" />
  //       </Button>
  //     </DropdownMenuTrigger>
  //     <DropdownMenuContent align="end">
  //       {tableActions.map((action) => (
  //         <DropdownMenuItem key={action.key}>{action.label}</DropdownMenuItem>
  //       ))}
  //     </DropdownMenuContent>
  //   </DropdownMenu>
  // );

  return (
    <div className="container mx-auto p-4 space-y-6 max-w-7xl">
      {/* Header */}
      <HeaderSection
        supplyImport={supplyImport}
        isMobile={isMobile}
        onBack={handleBack}
        actions={renderActions(tableActions, supplyImport)}
      />

      {/* Content */}
      {isMobile ? (
        <MobileDetailView {...commonProps} />
      ) : (
        <DesktopDetailView {...commonProps} />
      )}
    </div>
  );
}

export default SupplyImportDetailPage;
