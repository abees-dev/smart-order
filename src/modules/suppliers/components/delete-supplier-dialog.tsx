import { useTranslation } from "react-i18next";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useIsMobile } from "@/hooks/use-mobile";
import { Trash2, AlertTriangle } from "lucide-react";
import type { Supplier } from "../types";
import { useDeleteSupplier } from "../hooks/use-supplier-action";
import { toast } from "sonner";

interface DeleteSupplierDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  supplier: Supplier | null;
  onSuccess: () => void;
}

export function DeleteSupplierDialog({
  open,
  onOpenChange,
  supplier,
  onSuccess,
}: DeleteSupplierDialogProps) {
  const { t } = useTranslation();
  const { deleteSupplier, loading, error } = useDeleteSupplier({
    onSuccess,
    onError: (error) => {
      toast.error(error.message || t("suppliers.deleteError"));
    },
  });
  const isMobile = useIsMobile();

  if (!supplier) return null;

  const handleDelete = async () => {
    deleteSupplier(supplier.id);
  };

  const handleClose = () => {
    onOpenChange(false);
  };

  const dialogContent = (
    <div className="space-y-4">
      <div className="flex items-center justify-center w-12 h-12 mx-auto bg-destructive/10 rounded-full">
        <AlertTriangle className="w-6 h-6 text-destructive" />
      </div>

      <div className="text-center space-y-2">
        <p className="font-medium">{t("suppliers.deleteConfirmation")}</p>
        <p className="text-sm text-muted-foreground">
          {t("suppliers.deleteWarning")}
        </p>
      </div>

      <div className="bg-muted/50 rounded-lg p-4 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">{t("suppliers.name")}:</span>
          <span className="text-sm">{supplier.name}</span>
        </div>
        {supplier.contactPerson && (
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">
              {t("suppliers.contactPerson")}:
            </span>
            <span className="text-sm">{supplier.contactPerson}</span>
          </div>
        )}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">{t("suppliers.phone")}:</span>
          <span className="text-sm">{supplier.phone}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">{t("common.status")}:</span>
          <Badge variant={supplier.isActive ? "default" : "secondary"}>
            {supplier.isActive ? t("common.active") : t("common.inactive")}
          </Badge>
        </div>
      </div>

      {error && (
        <div className="text-sm text-destructive text-center bg-destructive/10 p-3 rounded-md">
          {error}
        </div>
      )}
    </div>
  );

  const footerContent = (
    <div className="flex justify-end space-x-2">
      <Button variant="outline" onClick={handleClose} disabled={loading}>
        {t("common.cancel")}
      </Button>
      <Button variant="destructive" onClick={handleDelete} disabled={loading}>
        <Trash2 className="mr-2 h-4 w-4" />
        {loading ? t("common.deleting") : t("common.delete")}
      </Button>
    </div>
  );

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>{t("suppliers.deleteSupplier")}</DrawerTitle>
            <DrawerDescription>
              {t("suppliers.deleteSupplierDescription")}
            </DrawerDescription>
          </DrawerHeader>
          <div className="px-4">{dialogContent}</div>
          <DrawerFooter>{footerContent}</DrawerFooter>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{t("suppliers.deleteSupplier")}</DialogTitle>
          <DialogDescription>
            {t("suppliers.deleteSupplierDescription")}
          </DialogDescription>
        </DialogHeader>
        {dialogContent}
        <DialogFooter>{footerContent}</DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
