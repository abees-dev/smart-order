import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

import type { SupplyImport } from "../types";
import SupplyStatusBadge from "./supply-status-badge";

interface HeaderSectionProps {
  supplyImport: SupplyImport;
  isMobile: boolean;
  onBack: () => void;
  actions?: React.ReactNode;
}

export function HeaderSection({
  supplyImport,
  isMobile,
  onBack,
  actions,
}: HeaderSectionProps) {
  return (
    <div className="flex flex-col space-y-4">
      {/* Back Button */}
      <div className="flex items-center">
        <Button
          variant="ghost"
          size={isMobile ? "sm" : "default"}
          onClick={onBack}
          className="hover:bg-muted/80 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          {isMobile ? "Quay lại" : "Quay lại danh sách"}
        </Button>
      </div>

      {/* Title & Status */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground">
            Chi tiết phiếu nhập hàng
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base mt-1 break-all">
            {supplyImport.invoiceNumber}
          </p>
        </div>
        <div className="shrink-0 flex items-center gap-2">
          <SupplyStatusBadge status={supplyImport.status} />
          {actions}
        </div>
      </div>
    </div>
  );
}
