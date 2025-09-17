import type { SupplyImport } from "../types";
import {
  SummaryCards,
  BasicInfoCard,
  NotesCard,
  TimestampsCardMobile,
} from "./supply-import-info-cards";
import { ItemsTableDesktop } from "./supply-import-items";

interface DesktopDetailViewProps {
  importRecord: SupplyImport;
  supplierName: string | null;
  formatCurrency: (amount: number) => string;
  formatDate: (timestamp: Date | string | number) => string;
  totalQuantity: number;
  totalItems: number;
}

export function DesktopDetailView({
  importRecord,
  supplierName,
  formatCurrency,
  formatDate,
  totalQuantity,
  totalItems,
}: DesktopDetailViewProps) {
  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <SummaryCards
        importRecord={importRecord}
        totalItems={totalItems}
        formatCurrency={formatCurrency}
      />

      {/* Basic Info */}
      <BasicInfoCard
        importRecord={importRecord}
        supplierName={supplierName}
        formatDate={formatDate}
        totalQuantity={totalQuantity}
      />

      {/* Notes */}
      <NotesCard notes={importRecord.notes} />

      {/* Items Table with EnhancedTable */}
      <ItemsTableDesktop
        importRecord={importRecord}
        formatCurrency={formatCurrency}
        totalQuantity={totalQuantity}
        totalItems={totalItems}
      />

      {/* Timestamps */}
      <TimestampsCardMobile
        importRecord={importRecord}
        formatDate={formatDate}
      />
    </div>
  );
}
