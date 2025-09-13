import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  PlusIcon,
  SearchIcon,
  MoreHorizontalIcon,
  EditIcon,
  TrashIcon,
  RefreshCwIcon,
  FilterIcon,
  DollarSignIcon,
} from "lucide-react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { EditCostDialog } from "./edit-cost-dialog";
import {
  costTypeOptions,
  type UpdateAdditionalCostFormData,
} from "../validation";
import type { AdditionalCost } from "../types";

interface AdditionalCostsListProps {
  costs: AdditionalCost[];
  loading?: boolean;
  onUpdate: (data: UpdateAdditionalCostFormData) => Promise<boolean>;
  onDelete: (id: string) => Promise<boolean>;
  onRefresh: () => void;
}

export function AdditionalCostsList({
  costs,
  loading,
  onUpdate,
  onDelete,
  onRefresh,
}: AdditionalCostsListProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCostType, setSelectedCostType] = useState<string>("all");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingCost, setEditingCost] = useState<AdditionalCost | null>(null);
  const [deletingCostId, setDeletingCostId] = useState<string | null>(null);

  // Filter costs based on search and cost type
  const filteredCosts = costs.filter((cost) => {
    const matchesSearch =
      !searchTerm ||
      cost.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cost.orderNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cost.notes?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCostType =
      selectedCostType === "all" || cost.costType === selectedCostType;

    return matchesSearch && matchesCostType;
  });

  // Calculate totals
  const totalAmount = filteredCosts.reduce((sum, cost) => sum + cost.amount, 0);
  const totalCount = filteredCosts.length;

  const handleDelete = async (id: string) => {
    setDeletingCostId(id);
    try {
      await onDelete(id);
    } finally {
      setDeletingCostId(null);
    }
  };

  const handleEdit = (cost: AdditionalCost) => {
    setEditingCost(cost);
  };

  const handleUpdate = async (data: UpdateAdditionalCostFormData) => {
    const success = await onUpdate(data);
    if (success) {
      setEditingCost(null);
    }
    return success;
  };

  const getCostTypeLabel = (costType: string) => {
    const option = costTypeOptions.find((opt) => opt.value === costType);
    return option?.label || costType;
  };

  const getCostTypeBadgeVariant = (costType: string) => {
    const variants: Record<
      string,
      "default" | "secondary" | "destructive" | "outline"
    > = {
      shipping: "default",
      packaging: "secondary",
      labor: "outline",
      marketing: "destructive",
      utilities: "secondary",
      maintenance: "outline",
      insurance: "default",
      tax: "destructive",
      other: "secondary",
    };
    return variants[costType] || "secondary";
  };

  return (
    <div className="space-y-4">
      {/* Header with stats */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <DollarSignIcon className="h-5 w-5" />
                Chi phí phát sinh
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Quản lý các chi phí phát sinh ngoài hóa đơn
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold">
                {totalAmount.toLocaleString("vi-VN")}₫
              </div>
              <p className="text-sm text-muted-foreground">
                {totalCount} chi phí
              </p>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Filters and Actions */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="flex-1 flex items-center gap-2">
              <div className="relative flex-1">
                <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Tìm kiếm chi phí..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <FilterIcon className="h-4 w-4 mr-2" />
                    {selectedCostType === "all"
                      ? "Tất cả loại"
                      : getCostTypeLabel(selectedCostType)}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => setSelectedCostType("all")}>
                    Tất cả loại
                  </DropdownMenuItem>
                  {costTypeOptions.map((option) => (
                    <DropdownMenuItem
                      key={option.value}
                      onClick={() => setSelectedCostType(option.value)}
                    >
                      {option.label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={onRefresh}
                disabled={loading}
              >
                <RefreshCwIcon
                  className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`}
                />
                Làm mới
              </Button>

              <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <PlusIcon className="h-4 w-4 mr-2" />
                    Thêm chi phí
                  </Button>
                </DialogTrigger>
              </Dialog>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Costs Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : filteredCosts.length === 0 ? (
            <div className="text-center py-12">
              <DollarSignIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                {searchTerm || selectedCostType !== "all"
                  ? "Không tìm thấy chi phí phù hợp"
                  : "Chưa có chi phí phát sinh nào"}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ngày</TableHead>
                  <TableHead>Loại chi phí</TableHead>
                  <TableHead>Mô tả</TableHead>
                  <TableHead>Đơn hàng</TableHead>
                  <TableHead className="text-right">Số tiền</TableHead>
                  <TableHead className="w-[70px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCosts.map((cost) => (
                  <TableRow key={cost.id}>
                    <TableCell>
                      <div className="text-sm">
                        {format(cost.date.toDate(), "dd/MM/yyyy", {
                          locale: vi,
                        })}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {format(cost.date.toDate(), "HH:mm", { locale: vi })}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getCostTypeBadgeVariant(cost.costType)}>
                        {getCostTypeLabel(cost.costType)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-xs">
                        <p className="text-sm font-medium truncate">
                          {cost.description}
                        </p>
                        {cost.notes && (
                          <p className="text-xs text-muted-foreground truncate">
                            {cost.notes}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {cost.orderNumber ? (
                        <Badge variant="outline">{cost.orderNumber}</Badge>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right font-semibold">
                      {cost.amount.toLocaleString("vi-VN")}₫
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontalIcon className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEdit(cost)}>
                            <EditIcon className="h-4 w-4 mr-2" />
                            Chỉnh sửa
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDelete(cost.id)}
                            disabled={deletingCostId === cost.id}
                            className="text-red-600"
                          >
                            <TrashIcon className="h-4 w-4 mr-2" />
                            {deletingCostId === cost.id ? "Đang xóa..." : "Xóa"}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      {editingCost && (
        <EditCostDialog
          cost={editingCost}
          open={!!editingCost}
          onOpenChange={(open: boolean) => !open && setEditingCost(null)}
          onSubmit={handleUpdate}
          loading={loading}
        />
      )}
    </div>
  );
}
