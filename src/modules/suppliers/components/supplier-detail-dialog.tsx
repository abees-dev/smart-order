import { useTranslation } from "react-i18next";

import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Phone, MapPin, Building2, CreditCard, FileText } from "lucide-react";
import type { Supplier } from "../types";
import type { Timestamp } from "firebase/firestore";
import DialogResponsive from "@/components/ui/dialog-responsive";

interface SupplierDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  supplier: Supplier | null;
  onEdit?: (supplier: Supplier) => void;
}

export function SupplierDetailDialog({
  open,
  onOpenChange,
  supplier,
}: SupplierDetailDialogProps) {
  const { t } = useTranslation();

  if (!supplier) return null;

  const formatDate = (timestamp: Timestamp) => {
    if (!timestamp?.toDate) return "-";
    return timestamp.toDate().toLocaleDateString("vi-VN");
  };

  const detailContent = (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <h3 className="text-lg font-semibold">{supplier.name}</h3>
          <Badge variant={supplier.isActive ? "default" : "secondary"}>
            {supplier.isActive ? t("common.active") : t("common.inactive")}
          </Badge>
        </div>
      </div>

      <Separator />

      {/* Contact Information */}
      <div className="space-y-4">
        <h4 className="font-medium flex items-center">
          <Phone className="mr-2 h-4 w-4" />
          {t("suppliers.contactInfo")}
        </h4>
        <div className="grid grid-cols-1 gap-4 text-sm">
          {supplier.contactPerson && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">
                {t("suppliers.contactPerson")}:
              </span>
              <span className="font-medium">{supplier.contactPerson}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-muted-foreground">
              {t("suppliers.phone")}:
            </span>
            <span className="font-medium">{supplier.phone}</span>
          </div>
          {supplier.email && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">
                {t("suppliers.email")}:
              </span>
              <span className="font-medium">{supplier.email}</span>
            </div>
          )}
        </div>
      </div>

      <Separator />

      {/* Address Information */}
      <div className="space-y-4">
        <h4 className="font-medium flex items-center">
          <MapPin className="mr-2 h-4 w-4" />
          {t("suppliers.addressInfo")}
        </h4>
        <div className="grid grid-cols-1 gap-4 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground flex-1">
              {t("suppliers.address")}:
            </span>
            <span className="font-medium text-right text-wrap w-[340px]">
              {supplier.address}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">
              {t("suppliers.city")}:
            </span>
            <span className="font-medium">{supplier.city}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">
              {t("suppliers.country")}:
            </span>
            <span className="font-medium">{supplier.country}</span>
          </div>
        </div>
      </div>

      {/* Business Information */}
      {(supplier.taxNumber || supplier.paymentTerms) && (
        <>
          <Separator />
          <div className="space-y-4">
            <h4 className="font-medium flex items-center">
              <Building2 className="mr-2 h-4 w-4" />
              {t("suppliers.businessInfo")}
            </h4>
            <div className="grid grid-cols-1 gap-4 text-sm">
              {supplier.taxNumber && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    {t("suppliers.taxNumber")}:
                  </span>
                  <span className="font-medium">{supplier.taxNumber}</span>
                </div>
              )}
              {supplier.paymentTerms && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    {t("suppliers.paymentTerms")}:
                  </span>
                  <span className="font-medium">{supplier.paymentTerms}</span>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* Banking Information */}
      {(supplier.bankName || supplier.bankAccount) && (
        <>
          <Separator />
          <div className="space-y-4">
            <h4 className="font-medium flex items-center">
              <CreditCard className="mr-2 h-4 w-4" />
              {t("suppliers.bankingInfo")}
            </h4>
            <div className="grid grid-cols-1 gap-4 text-sm">
              {supplier.bankName && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    {t("suppliers.bankName")}:
                  </span>
                  <span className="font-medium">{supplier.bankName}</span>
                </div>
              )}
              {supplier.bankAccount && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    {t("suppliers.bankAccount")}:
                  </span>
                  <span className="font-medium">{supplier.bankAccount}</span>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* Notes */}
      {supplier.notes && (
        <>
          <Separator />
          <div className="space-y-4">
            <h4 className="font-medium flex items-center">
              <FileText className="mr-2 h-4 w-4" />
              {t("suppliers.notes")}
            </h4>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
              {supplier.notes}
            </p>
          </div>
        </>
      )}

      <Separator />

      {/* Metadata */}
      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-4 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">
              {t("common.createdAt")}:
            </span>
            <span className="font-medium">
              {formatDate(supplier.createdAt)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">
              {t("common.updatedAt")}:
            </span>
            <span className="font-medium">
              {formatDate(supplier.updatedAt)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <DialogResponsive
      open={open}
      onOpenChange={onOpenChange}
      title={t("suppliers.supplierDetails")}
      description={t("suppliers.supplierDetailsDescription")}
      actions={{
        cancel: {
          label: t("common.close"),
          onClick: () => onOpenChange(false),
        },
      }}
    >
      {detailContent}
    </DialogResponsive>
  );
}
