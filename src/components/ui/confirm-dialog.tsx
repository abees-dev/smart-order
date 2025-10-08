import React from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle, CheckCircle, Info, XCircle } from "lucide-react";

export type ConfirmDialogVariant =
  | "default"
  | "destructive"
  | "warning"
  | "success"
  | "info";

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  variant?: ConfirmDialogVariant;
  onConfirm: () => void | Promise<void>;
  loading?: boolean;
}

const variantConfig = {
  default: {
    icon: null,
    iconColor: "",
    confirmButtonVariant: "default" as const,
  },
  destructive: {
    icon: XCircle,
    iconColor: "text-red-500",
    confirmButtonVariant: "destructive" as const,
  },
  warning: {
    icon: AlertTriangle,
    iconColor: "text-yellow-500",
    confirmButtonVariant: "default" as const,
  },
  success: {
    icon: CheckCircle,
    iconColor: "text-green-500",
    confirmButtonVariant: "default" as const,
  },
  info: {
    icon: Info,
    iconColor: "text-blue-500",
    confirmButtonVariant: "default" as const,
  },
};

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmText = "Xác nhận",
  cancelText = "Hủy",
  variant = "default",
  onConfirm,
  loading = false,
}: ConfirmDialogProps) {
  const config = variantConfig[variant];
  const Icon = config.icon;

  const handleConfirm = async () => {
    try {
      await onConfirm();
      onOpenChange(false);
    } catch (error) {
      // Error handling can be done by the parent component
      console.error("Confirm action failed:", error);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            {Icon && <Icon className={`h-5 w-5 ${config.iconColor}`} />}
            {title}
          </AlertDialogTitle>
          {description && (
            <AlertDialogDescription className="whitespace-pre-line">
              {description}
            </AlertDialogDescription>
          )}
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>{cancelText}</AlertDialogCancel>
          <AlertDialogAction asChild>
            <Button
              variant={config.confirmButtonVariant}
              onClick={handleConfirm}
              disabled={loading}
            >
              {loading ? "Đang xử lý..." : confirmText}
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

// Hook để sử dụng ConfirmDialog một cách dễ dàng
export function useConfirmDialog() {
  const [dialogState, setDialogState] = React.useState<{
    open: boolean;
    title: string;
    description?: React.ReactNode;
    confirmText?: string;
    cancelText?: string;
    variant?: ConfirmDialogVariant;
    onConfirm: () => void | Promise<void>;
    loading?: boolean;
  }>({
    open: false,
    title: "",
    onConfirm: () => {},
  });

  const showConfirm = React.useCallback(
    (config: {
      title: string;
      description?: React.ReactNode;
      confirmText?: string;
      cancelText?: string;
      variant?: ConfirmDialogVariant;
      onConfirm: () => void | Promise<void>;
    }) => {
      setDialogState({
        ...config,
        open: true,
        loading: false,
      });
    },
    []
  );

  const hideConfirm = React.useCallback(() => {
    setDialogState((prev) => ({ ...prev, open: false }));
  }, []);

  const setLoading = React.useCallback((loading: boolean) => {
    setDialogState((prev) => ({ ...prev, loading }));
  }, []);

  return {
    showConfirm,
    hideConfirm,
    setLoading,
    ConfirmDialog: (
      <ConfirmDialog {...dialogState} onOpenChange={hideConfirm} />
    ),
  };
}
