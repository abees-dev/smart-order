import { AlertTriangle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import type { Product } from "../types";
import { useDeleteProduct } from "../hooks/use-product-actions";
import { toast } from "sonner";

interface DeleteProductDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: Product | null;
  onSuccess?: () => void;
}

export function DeleteProductDialog({
  open,
  onOpenChange,
  product,
  onSuccess,
}: DeleteProductDialogProps) {
  const { deleteProduct, loading } = useDeleteProduct({
    onSuccess: () => {
      onSuccess?.();
      onOpenChange(false);
    },
    onError: (error) => {
      console.error("Error deleting product:", error);
      toast.error("Xóa sản phẩm thất bại. Vui lòng thử lại.");
    },
  });

  const handleDelete = async () => {
    if (!product?.id) return;
    deleteProduct(product.id);
  };

  if (!product) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="h-5 w-5" />
            Xác nhận xóa sản phẩm
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Hành động này không thể hoàn tác. Sản phẩm sẽ bị xóa vĩnh viễn
              khỏi hệ thống.
            </AlertDescription>
          </Alert>

          <div className="p-4 border rounded-md bg-muted/50">
            <p className="font-medium">{product.name}</p>
            <p className="text-sm text-muted-foreground">{product.category}</p>
            <p className="text-sm font-medium text-green-600 mt-1">
              {product.price.toLocaleString("vi-VN")} ₫
            </p>
          </div>

          <p className="text-sm text-muted-foreground">
            Bạn có chắc chắn muốn xóa sản phẩm <strong>"{product.name}"</strong>{" "}
            không?
          </p>

          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Hủy
            </Button>
            <Button
              variant="destructive"
              className="flex-1"
              onClick={handleDelete}
              disabled={loading}
            >
              {loading ? "Đang xóa..." : "Xóa sản phẩm"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
