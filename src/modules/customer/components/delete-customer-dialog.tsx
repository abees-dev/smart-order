import { useTranslation } from "react-i18next";
import { Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useCustomerActions } from "../hooks/use-customer";
import type { Customer } from "../types";

interface DeleteCustomerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customer: Customer | null;
  onSuccess: () => void;
}

export function DeleteCustomerDialog({
  open,
  onOpenChange,
  customer,
  onSuccess,
}: DeleteCustomerDialogProps) {
  const { t } = useTranslation();
  const { deleteCustomer, loading, error } = useCustomerActions();

  if (!customer) return null;

  const handleDelete = async () => {
    try {
      await deleteCustomer(customer.id);
      onSuccess();
    } catch (error) {
      // Error is handled by the hook
      console.error("Delete customer error:", error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <Trash2 className="h-5 w-5" />
            {t("customers.deleteCustomer")}
          </DialogTitle>
          <DialogDescription>
            {t("customers.deleteCustomerDescription")}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <p className="text-sm text-muted-foreground">
            {t("customers.deleteCustomerConfirm", { name: customer.name })}
          </p>
          <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-800 font-medium">{customer.name}</p>
            <p className="text-xs text-red-600">
              {customer.email} • {customer.phone}
            </p>
          </div>
        </div>

        {error && (
          <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
            {error}
          </div>
        )}

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            {t("common.cancel")}
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={loading}
          >
            {loading ? t("common.deleting") : t("common.delete")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
