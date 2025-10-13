import { useIsMobile } from "@/hooks/use-mobile";
import { type ReactNode } from "react";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "./drawer";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./dialog";
import { cn } from "@/lib/utils";
import { Button } from "./button";
export interface DialogFormProps {
  title?: string | ReactNode;
  open: boolean;
  description?: string;
  children: ReactNode;
  onOpenChange: (open: boolean) => void;
  className?: string;
  actions?: {
    submit?: {
      label: string;
      onClick?: () => void;
      loading?: boolean;
      disabled?: boolean;
    };
    cancel: {
      label: string;
      onClick?: () => void;
      loading?: boolean;
      disabled?: boolean;
    };
  };
  formId?: string; // ID of the form inside the dialog for submit button association
}

const DialogResponsive = ({
  title,
  description,
  children,
  open,
  onOpenChange,
  className,
  actions,
  formId,
}: DialogFormProps) => {
  const isMobile = useIsMobile();
  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent
          className="max-h-[85vh]"
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          <DrawerHeader className="text-left">
            <DrawerTitle>{title}</DrawerTitle>
            {description && (
              <DrawerDescription>{description}</DrawerDescription>
            )}
          </DrawerHeader>
          <div className="px-4 pb-6 overflow-y-auto">{children}</div>
          <DrawerFooter>
            {actions && (
              <DialogFooter>
                {actions.cancel && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={actions.cancel.onClick}
                    disabled={actions.cancel.disabled}
                    className="w-full sm:w-auto"
                  >
                    {actions.cancel.label}
                  </Button>
                )}
                {actions.submit && (
                  <Button
                    type="submit"
                    form={formId}
                    onClick={actions.submit.onClick}
                    disabled={actions.submit.disabled}
                    className="w-full sm:w-auto"
                  >
                    {actions.submit.label}
                  </Button>
                )}
              </DialogFooter>
            )}
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn("p-0 min-w-3xl", className)}
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <DialogHeader className="px-4 pt-4 text-left">
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        <div className="max-h-[75vh] overflow-y-auto px-4 py-2 scroll-bar">
          {children}
        </div>

        {actions && (
          <DialogFooter className="px-4 pb-4">
            {actions.cancel && (
              <Button
                type="button"
                variant="outline"
                onClick={actions.cancel.onClick}
                disabled={actions.cancel.disabled}
                className="w-full sm:w-auto"
              >
                {actions.cancel.label}
              </Button>
            )}
            {actions.submit && (
              <Button
                type="submit"
                form={formId}
                onClick={actions.submit.onClick}
                disabled={actions.submit.disabled}
                className="w-full sm:w-auto"
              >
                {actions.submit.label}
              </Button>
            )}
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default DialogResponsive;
