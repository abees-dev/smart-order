import { useTranslation } from "react-i18next";
import {
  Calendar,
  Mail,
  Phone,
  MapPin,
  Globe,
  FileText,
  User,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import type { Customer } from "../types";
import DialogResponsive from "@/components/ui/dialog-responsive";
import { PermissionGuard } from "@/components/guards";
import { Actions, Resources } from "@/constants";
import { NoPermissionFallback } from "@/components/layout";

interface CustomerDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customer: Customer | null;
}

export function CustomerDetailDialog({
  open,
  onOpenChange,
  customer,
}: CustomerDetailDialogProps) {
  const { t } = useTranslation();

  if (!customer) return null;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const formatDate = (timestamp: any) => {
    if (!timestamp) return "";
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return new Intl.DateTimeFormat("vi-VN", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }).format(date);
    } catch {
      return "";
    }
  };

  const detailsContent = (
    <div className="space-y-4">
      {/* Status Badge */}
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-semibold">{customer.name}</h3>
          <p className="text-sm text-muted-foreground">ID: {customer.id}</p>
        </div>
        <Badge variant={customer.isActive ? "default" : "secondary"}>
          {customer.isActive ? t("common.active") : t("common.inactive")}
        </Badge>
      </div>

      <Separator />

      {/* Contact Information */}
      <div className="space-y-3">
        <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
          {t("customers.contactInformation")}
        </h4>

        <div className="space-y-2">
          {customer.email && (
            <div className="flex items-center gap-3">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{customer.email}</span>
            </div>
          )}

          <div className="flex items-center gap-3">
            <Phone className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">{customer.phone}</span>
          </div>

          {customer.contactPerson && (
            <div className="flex items-center gap-3">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{customer.contactPerson}</span>
            </div>
          )}
        </div>
      </div>

      <Separator />

      {/* Address Information */}
      <div className="space-y-3">
        <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
          {t("customers.addressInformation")}
        </h4>

        <div className="space-y-2">
          <div className="flex items-start gap-3">
            <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
            <div className="text-sm">
              <div>{customer.address}</div>
              <div className="text-muted-foreground">{customer.city}</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Globe className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">{customer.country}</span>
          </div>
        </div>
      </div>

      {/* Notes */}
      {customer.notes && (
        <>
          <Separator />
          <div className="space-y-3">
            <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
              {t("customers.notes")}
            </h4>
            <div className="flex items-start gap-3">
              <FileText className="h-4 w-4 text-muted-foreground mt-0.5" />
              <p className="text-sm text-muted-foreground">{customer.notes}</p>
            </div>
          </div>
        </>
      )}

      <Separator />

      {/* Timestamps */}
      <div className="space-y-3">
        <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
          {t("customers.timestamps")}
        </h4>

        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <div className="text-sm">
              <span className="text-muted-foreground">
                {t("customers.createdAt")}:
              </span>
              <span className="ml-2">{formatDate(customer.createdAt)}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <div className="text-sm">
              <span className="text-muted-foreground">
                {t("customers.updatedAt")}:
              </span>
              <span className="ml-2">{formatDate(customer.updatedAt)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <DialogResponsive
      title={t("customers.customerDetails")}
      description={t("customers.customerDetailsDescription")}
      open={open}
      onOpenChange={onOpenChange}
    >
      <PermissionGuard
        resource={Resources.CUSTOMERS}
        action={Actions.DELETE}
        fallback={<NoPermissionFallback />}
      >
        {detailsContent}
      </PermissionGuard>
    </DialogResponsive>
  );
}
