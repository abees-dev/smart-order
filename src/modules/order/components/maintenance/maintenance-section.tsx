import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  useConfirmDialog,
} from '@/components/ui';
import {
  EnhancedTable,
  useEnhancedTableColumns,
  type TableAction,
} from '@/components/tables';
import type { ResponsiveTableColumn } from '@/components/tables/responsive-table';
import type { MaintenanceRecord, Order } from '../../types';
import { formatCurrency, formatDate } from '@/utils';
import { Wrench, User, Pencil, Trash2 } from 'lucide-react';
import { useParams } from 'react-router-dom';
import { useState, useMemo } from 'react';
import MaintenanceFormDialog from './maintenance-form-dialog';
import { useTranslation } from 'react-i18next';
import { useChangeStatusMaintenance } from '../../hooks/use-maintenance-action';
import { useMaintenance } from '../../hooks/use-maintenance';
import { useQueryClient } from '@tanstack/react-query';

export function MaintenanceSection({
  summary,
}: {
  summary?: Order['maintenanceSummary'];
}) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { id } = useParams<{ id: string }>();
  const [selectedMaintenance, setSelectedMaintenance] =
    useState<MaintenanceRecord | null>(null);

  const { maintenanceRecords } = useMaintenance(id!);

  const { showConfirm, ConfirmDialog } = useConfirmDialog();

  const queryClient = useQueryClient();
  const { createDateColumn } = useEnhancedTableColumns<MaintenanceRecord>();

  const { mutateAsync: changeMaintenanceStatusMutation } =
    useChangeStatusMaintenance();

  const getMaintenanceStatus = (status: MaintenanceRecord['status']) => {
    const statusMap = {
      scheduled: { label: 'Đã lên lịch', color: 'warning' },
      in_progress: { label: 'Đang tiến hành', color: 'info' },
      completed: { label: 'Hoàn thành', color: 'success' },
      cancelled: { label: 'Đã hủy', color: 'error' },
    } as const;
    // "scheduled" | "in_progress" | "completed" | "cancelled"

    return statusMap[status!] || { label: 'Không xác định', color: 'neutral' };
  };

  const columns = useMemo<ResponsiveTableColumn<MaintenanceRecord>[]>(
    () => [
      {
        key: 'performedBy',
        title: 'Người thực hiện',
        dataIndex: 'performedBy',
        render: (_, record) =>
          record.performedBy ? (
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <span>{record.performedBy}</span>
            </div>
          ) : (
            <span className="text-muted-foreground">-</span>
          ),
      },
      {
        key: 'description',
        title: 'Mô tả',
        dataIndex: 'description',
        render: (_, record) => (
          <div className="min-w-[200px]">
            <div className="font-medium">{record.description}</div>
            {record.notes && (
              <div className="text-sm text-muted-foreground mt-1">
                {record.notes}
              </div>
            )}
          </div>
        ),
        responsive: false,
        width: 300,
      },
      {
        key: 'maintenanceType',
        title: 'Loại',
        dataIndex: 'maintenanceType',
        width: 120,
        render: (_, record) => (
          <Badge
            variant={'outline'}
            color={record.maintenanceType === 'warranty' ? 'info' : 'error'}
          >
            {record.maintenanceType === 'warranty' ? 'Bảo hành' : 'Trả phí'}
          </Badge>
        ),
      },
      {
        key: 'status',
        title: 'Trạng thái',
        dataIndex: 'status',
        width: 120,
        render: (_, record) => {
          const statusInfo = getMaintenanceStatus(record.status);
          return (
            <Badge variant={'outline'} color={statusInfo.color}>
              {statusInfo.label}
            </Badge>
          );
        },
      },
      createDateColumn('performedDate', 'Ngày thực hiện'),
      // createCurrencyColumn("cost", "Chi phí"),
      {
        key: 'cost',
        title: 'Chi phí',
        dataIndex: 'cost',
        width: 120,
        render: (_, record) => {
          if (record.maintenanceType === 'warranty') {
            const totalCostSupplied =
              record.suppliesData?.reduce(
                (total, supply) => total + supply.quantity * supply.unitPrice,
                0,
              ) || 0;
            return (
              <div>
                <div className="font-medium text-red-600">
                  -{formatCurrency(totalCostSupplied + record.cost)}
                </div>
              </div>
            );
          }
          return (
            <div className="font-medium">{formatCurrency(record.cost)}</div>
          );
        },
      },
    ],
    [],
  );
  const { t } = useTranslation();

  const tableActions: TableAction<MaintenanceRecord>[] = [
    {
      key: 'edit',
      label: t('common.edit'),
      icon: Pencil,
      onClick: (record) => {
        setSelectedMaintenance(record);
        setIsDialogOpen(true);
      },
      show: (record) => record.status === 'scheduled',
    },

    {
      key: 'completed',
      label: 'Hoàn thành',
      icon: Wrench,
      onClick: async (record) => {
        showConfirm({
          title: 'Xác nhận!',
          description: (
            <div>
              Vui lòng kiểm tra lại thông tin trước khi hoàn thành bảo trì này.
              <br />
              Nếu hoàn thành bảo trì, bạn sẽ không thể chỉnh sửa hoặc hủy nó
              nữa.!
            </div>
          ),
          onConfirm: async () => {
            await changeMaintenanceStatusMutation({
              id: record.id!,
              status: 'completed',
            });
            queryClient.invalidateQueries({
              queryKey: ['maintenance-records', id],
            });
          },
        });
      },
      show: (record) => record.status === 'scheduled',
    },

    {
      key: 'cancel',
      label: 'Hủy',
      icon: Trash2,
      variant: 'destructive',
      onClick: (record) => {
        showConfirm({
          title: 'Bạn có chắc chắn muốn hủy bảo trì này không?',
          description:
            'Hành động này không thể hoàn tác. Vui lòng xác nhận nếu bạn muốn tiếp tục.',
          onConfirm: async () => {
            await changeMaintenanceStatusMutation({
              id: record.id!,
              status: 'cancelled',
            });
            queryClient.invalidateQueries({
              queryKey: ['maintenance-records', id],
            });
          },
        });
      },
      show: (record) =>
        record.status !== 'completed' && record.status !== 'cancelled',
    },
  ];

  const handleRowClick = (record: MaintenanceRecord) => {
    // Future: Open maintenance detail modal
    console.log('Clicked maintenance record:', record);
  };

  return (
    <div className="space-y-4">
      {/* Summary Card */}
      {summary && (
        <Card>
          <CardHeader>
            <CardTitle>Tổng quan bảo trì</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <div className="space-y-2">
                <p className="text-sm text-gray-600">Tổng chi phí bảo trì</p>
                <p className="font-semibold text-lg">
                  {formatCurrency(summary.totalMaintenanceCost)}
                </p>
              </div>

              {summary.lastMaintenanceDate && (
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">Bảo trì cuối</p>
                  <p className="font-medium">
                    {formatDate(summary.lastMaintenanceDate)}
                  </p>
                </div>
              )}

              {summary.upcomingMaintenance && (
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">Bảo trì tiếp theo</p>
                  <p className="font-medium">
                    {formatDate(summary.upcomingMaintenance)}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Maintenance List */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle>
            Lịch sử bảo trì ({maintenanceRecords?.length || 0})
          </CardTitle>
          <Button onClick={() => setIsDialogOpen(true)}>
            <Wrench className="w-4 h-4 mr-2" />
            Tạo bảo trì mới
          </Button>
        </CardHeader>
        <CardContent>
          <EnhancedTable
            dataSource={maintenanceRecords || []}
            columns={columns}
            actions={tableActions}
            onRowClick={handleRowClick}
            emptyText={
              <div className="py-8 text-center">
                <Wrench className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600 font-medium">
                  Chưa có lịch sử bảo trì
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Nhấn 'Tạo bảo trì mới' để thêm bản ghi bảo trì đầu tiên
                </p>
              </div>
            }
          />
        </CardContent>
      </Card>

      {isDialogOpen && (
        <MaintenanceFormDialog
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          orderId={id!}
          onSuccess={() => {
            queryClient.invalidateQueries({
              queryKey: ['maintenance-records', id!],
            });
          }}
          maintenanceRecord={selectedMaintenance || undefined}
        />
      )}

      {ConfirmDialog}
    </div>
  );
}
