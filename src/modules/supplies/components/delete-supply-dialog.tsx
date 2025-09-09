import { Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useSupplyActions } from "../hooks/use-supply";
import type { Supply } from "../types";

interface DeleteSupplyDialogProps {
  supply: Supply | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function DeleteSupplyDialog({
  supply,
  open,
  onOpenChange,
  onSuccess,
}: DeleteSupplyDialogProps) {
  const { deleteSupply, loading, error } = useSupplyActions();

  const handleDelete = async () => {
    if (!supply) return;

    try {
      await deleteSupply(supply.id);
      onSuccess();
    } catch (error) {
      console.error("Error deleting supply:", error);
    }
  };

  if (!supply) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Trash2 className="h-5 w-5 text-destructive" />
            Xóa vật tư
          </DialogTitle>
          <DialogDescription>
            Bạn có chắc chắn muốn xóa vật tư này không? Hành động này không thể
            hoàn tác.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="p-4 border rounded-lg bg-muted/50">
            <div className="font-medium">{supply.name}</div>
            <div className="text-sm text-muted-foreground">
              SKU: {supply.sku}
            </div>
            <div className="text-sm text-muted-foreground">
              Tồn kho: {supply.currentStock} {supply.unit}
            </div>
          </div>

          {supply.currentStock > 0 && (
            <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
              <p className="text-sm text-orange-800">
                <strong>Lưu ý:</strong> Vật tư này còn tồn kho (
                {supply.currentStock} {supply.unit}). Việc xóa có thể ảnh hưởng
                đến báo cáo và thống kê.
              </p>
            </div>
          )}

          {error && (
            <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
              {error}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Hủy
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={loading}
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Xóa vật tư
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
