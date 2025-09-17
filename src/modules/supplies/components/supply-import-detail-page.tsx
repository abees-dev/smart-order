import { useParams, useNavigate } from "react-router-dom";
import { Alert, AlertDescription } from "@/components/ui/alert";

import { useIsMobile } from "@/hooks/use-mobile";
import { useDocumentTitle } from "@/hooks/use-document-title";

import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { useSupplyImportDetail } from "../hooks/use-supply-import";

import { HeaderSection } from "./supply-import-header";
import { MobileDetailView } from "./supply-import-mobile-view";
import { DesktopDetailView } from "./supply-import-desktop-view";
import {
  SupplyImportDetailSkeleton,
  SupplyImportDetailSkeletonMobile,
} from "./supply-import-skeleton";

export function SupplyImportDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  useDocumentTitle();

  const {
    supplyImport,
    loading: detailLoading,
    error: detailError,
  } = useSupplyImportDetail(id);

  const handleBack = () => {
    navigate("/dashboard/supplies/imports");
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const formatDate = (timestamp: Date | string | number) => {
    if (!timestamp) return "N/A";
    const date = new Date(timestamp);
    return format(date, "dd/MM/yyyy HH:mm", { locale: vi });
  };

  if (detailLoading) {
    return isMobile ? (
      <SupplyImportDetailSkeletonMobile />
    ) : (
      <SupplyImportDetailSkeleton />
    );
  }

  if (detailError || !supplyImport) {
    return (
      <div className="container mx-auto p-4 space-y-6">
        <Alert variant="destructive">
          <AlertDescription>
            {detailError || "Không tìm thấy phiếu nhập hàng"}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const totalQuantity = supplyImport.items.reduce(
    (sum, item) => sum + item.quantity,
    0
  );
  const totalItems = supplyImport.items.length;

  const commonProps = {
    importRecord: supplyImport,
    supplierName: supplyImport.supplier?.name || supplyImport.supplierId,
    formatCurrency,
    formatDate,
    totalQuantity,
    totalItems,
  };

  return (
    <div className="container mx-auto p-4 space-y-6 max-w-7xl">
      {/* Header */}
      <HeaderSection
        supplyImport={supplyImport}
        isMobile={isMobile}
        onBack={handleBack}
      />

      {/* Content */}
      {isMobile ? (
        <MobileDetailView {...commonProps} />
      ) : (
        <DesktopDetailView {...commonProps} />
      )}
    </div>
  );
}

export default SupplyImportDetailPage;
