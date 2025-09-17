import type { SupplyImport } from "../types";
import {
  SummaryCards,
  BasicInfoCard,
  NotesCard,
  TimestampsCardMobile,
} from "./supply-import-info-cards";
import { ItemsListMobile } from "./supply-import-items";

interface MobileDetailViewProps {
  importRecord: SupplyImport;
  supplierName: string | null;
  formatCurrency: (amount: number) => string;
  formatDate: (timestamp: Date | string | number) => string;
  totalQuantity: number;
  totalItems: number;
}

export function MobileDetailView({
  importRecord,
  supplierName,
  formatCurrency,
  formatDate,
  totalQuantity,
  totalItems,
}: MobileDetailViewProps) {
  return (
    <div className="space-y-4">
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

      {/* Items */}
      <ItemsListMobile
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
