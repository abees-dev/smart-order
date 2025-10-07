import {
  COST_TYPE_LABELS,
  type CostIncurred,
  type CostType,
  type Order,
} from "../types";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  useConfirmDialog,
} from "@/components/ui";
import { formatCurrency } from "@/utils";
import {
  EnhancedTable,
  useEnhancedTableColumns,
  type ResponsiveTableColumn,
  type TableAction,
} from "@/components/tables";
import { Pencil, PlusCircle, Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { CreateCostIncurredDialog } from "./create-cost-incurred-dialog";
import { useState } from "react";
import { useParams } from "react-router-dom";
import { useDeleteCostIncurred } from "../hooks/use-cost-incurred";
import { PermissionGuard, usePermissions } from "@/components/guards";
import { Actions, Resources } from "@/constants";
import { useQueryClient } from "@tanstack/react-query";

export function CostsIncurredSection({
  costs,
  summary,
}: {
  costs: CostIncurred[];
  summary?: Order["costSummary"];
}) {
  const { createColumn, createCurrencyColumn, createDateColumn } =
    useEnhancedTableColumns<CostIncurred>();

  const isMobile = useIsMobile();
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedCost, setSelectedCost] = useState<CostIncurred | null>(null);
  const deleteCostMutation = useDeleteCostIncurred();
  const queryClient = useQueryClient();

  const { showConfirm, ConfirmDialog } = useConfirmDialog();
  const { hasPermission } = usePermissions();

  const columns: ResponsiveTableColumn<CostIncurred>[] = [
    createColumn({
      key: "description",
      title: "Mô tả",
      dataIndex: "description",
      responsive: false,
    }),
    createColumn({
      key: "quantity",
      title: "Số lượng",
      dataIndex: "quantity",
      align: "right",
      responsive: false,
      render: (value: unknown) => (
        <span>{value !== undefined ? (value as number) : "-"}</span>
      ),
    }),
    createColumn({
      key: "unitPrice",
      title: "Đơn giá",
      responsive: false,
      dataIndex: "unitPrice",
      render: (value) => {
        return value ? formatCurrency(value as number) : "-";
      },
    }),

    createCurrencyColumn("amount", "Tổng tiền"),
    createDateColumn("incurredDate", "Ngày phát sinh"),
  ];

  const tableActions: TableAction<CostIncurred>[] = [
    {
      key: "edit",
      label: t("common.edit"),
      icon: Pencil,
      show: () => hasPermission(Resources.COST_INCURRED, Actions.UPDATE),
      onClick: (record) => {
        // setSelectedCustomer(record);
        // setShowEditDialog(true);
        setSelectedCost(record);
        setIsDialogOpen(true);
      },
    },
    {
      key: "delete",
      label: t("common.delete"),
      icon: Trash2,
      variant: "destructive",
      show: () => hasPermission(Resources.COST_INCURRED, Actions.DELETE),
      onClick: (record) => {
        // setSelectedCost(record);
        // setIsDialogOpen(true);
        showConfirm({
          title: "Xóa chi phí phát sinh",
          description:
            "Bạn có chắc chắn muốn xóa chi phí phát sinh này? Hành động này không thể hoàn tác.",
          onConfirm: async () => {
            await deleteCostMutation.mutateAsync(record.id as string);
            setSelectedCost(null);
            queryClient.invalidateQueries({
              queryKey: ["order", id],
            });
          },
          confirmText: "Xác nhận",
          cancelText: "Hủy",
          variant: "destructive",
        });
      },
    },
  ];

  return (
    <div className="space-y-4">
      {/* Summary Card */}
      {summary && (
        <Card>
          <CardHeader>
            <CardTitle>Tổng quan chi phí</CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className={`grid gap-4 ${
                isMobile ? "grid-cols-1" : "grid-cols-2 lg:grid-cols-3"
              }`}
            >
              <div className="space-y-2">
                <p className="text-sm text-gray-600">Tổng chi phí phát sinh</p>
                <p className="font-semibold text-lg text-red-600">
                  {formatCurrency(summary.totalCostsIncurred)}
                </p>
              </div>

              {summary.costsByType &&
                Object.entries(summary.costsByType).map(([type, amount]) => (
                  <div key={type} className="space-y-2">
                    <p className="text-sm text-gray-600">
                      {COST_TYPE_LABELS[type as CostType] || type}
                    </p>
                    <p className="font-medium">
                      {formatCurrency(amount as number)}
                    </p>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Costs List */}
      <div className="flex items-center justify-between">
        <CardTitle>Chi phí phát sinh ({costs?.length || 0})</CardTitle>
        <PermissionGuard
          resource={Resources.COST_INCURRED}
          action={Actions.CREATE}
        >
          <Button onClick={() => setIsDialogOpen(true)} className="gap-2">
            <PlusCircle />
            Thêm chi phí
          </Button>
        </PermissionGuard>
      </div>
      <EnhancedTable<CostIncurred>
        columns={columns}
        dataSource={costs}
        actions={tableActions}
      />
      {isDialogOpen && (
        <CreateCostIncurredDialog
          open={isDialogOpen}
          onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) {
              setSelectedCost(null);
            }
          }}
          orderId={id as string}
          costIncurred={selectedCost || undefined}
        />
      )}
      {ConfirmDialog}
    </div>
  );
}

export default CostsIncurredSection;
