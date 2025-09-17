import {
  Package,
  Calendar,
  FileText,
  Building,
  DollarSign,
  Hash,
  MessageSquare,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

import type { SupplyImport } from "../types";

interface InfoCardsProps {
  importRecord: SupplyImport;
  supplierName: string | null;
  formatCurrency: (amount: number) => string;
  formatDate: (timestamp: Date | string | number) => string;
  totalQuantity: number;
  totalItems: number;
}

export function SummaryCards({
  importRecord,
  totalItems,
  formatCurrency,
}: Pick<InfoCardsProps, "importRecord" | "totalItems" | "formatCurrency">) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200/60">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-1">
            <DollarSign className="h-4 w-4 text-green-600" />
            <div className="text-xs text-green-700 font-medium">
              Tổng giá trị
            </div>
          </div>
          <div className="text-lg font-bold text-green-600">
            {formatCurrency(importRecord.totalAmount)}
          </div>
        </CardContent>
      </Card>
      <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200/60">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-1">
            <Package className="h-4 w-4 text-blue-600" />
            <div className="text-xs text-blue-700 font-medium">Số mặt hàng</div>
          </div>
          <div className="text-lg font-bold text-blue-600">{totalItems}</div>
        </CardContent>
      </Card>
    </div>
  );
}

export function BasicInfoCard({
  importRecord,
  supplierName,
  formatDate,
  totalQuantity,
}: Pick<
  InfoCardsProps,
  "importRecord" | "supplierName" | "formatDate" | "totalQuantity"
>) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <FileText className="h-4 w-4" />
          Thông tin cơ bản
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex justify-between">
          <span className="text-sm text-muted-foreground">Nhà cung cấp:</span>
          <span className="text-sm font-medium break-words max-w-[60%] text-right">
            {supplierName || "Chưa xác định"}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-sm text-muted-foreground">Ngày nhập:</span>
          <span className="text-sm font-medium">
            {formatDate(importRecord.importDate)}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-sm text-muted-foreground">Tổng SL:</span>
          <span className="text-sm font-medium">
            {totalQuantity.toLocaleString("vi-VN")}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

export function NotesCard({ notes }: { notes: string | undefined }) {
  if (!notes) return null;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <MessageSquare className="h-4 w-4" />
          Ghi chú
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-sm p-3 bg-muted rounded-lg">{notes}</div>
      </CardContent>
    </Card>
  );
}

export function DetailedInfoCard({
  importRecord,
  supplierName,
  formatDate,
}: Pick<InfoCardsProps, "importRecord" | "supplierName" | "formatDate">) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Thông tin phiếu nhập
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Hash className="h-3 w-3" />
              Số hóa đơn
            </div>
            <div className="font-semibold text-lg">
              {importRecord.invoiceNumber}
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Building className="h-3 w-3" />
              Nhà cung cấp
            </div>
            <div className="font-semibold">
              {supplierName || "Chưa xác định"}
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Calendar className="h-3 w-3" />
              Ngày nhập
            </div>
            <div className="font-semibold">
              {formatDate(importRecord.importDate)}
            </div>
          </div>
        </div>

        {importRecord.notes && (
          <>
            <Separator className="my-6" />
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <MessageSquare className="h-3 w-3" />
                Ghi chú
              </div>
              <div className="p-3 bg-muted rounded-lg text-sm">
                {importRecord.notes}
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

export function SummaryStatsCard({
  importRecord,
  totalQuantity,
  totalItems,
  formatCurrency,
}: Pick<
  InfoCardsProps,
  "importRecord" | "totalQuantity" | "totalItems" | "formatCurrency"
>) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Tổng quan</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <DollarSign className="h-3 w-3" />
            Tổng giá trị
          </div>
          <div className="font-semibold text-2xl text-green-600">
            {formatCurrency(importRecord.totalAmount)}
          </div>
        </div>

        <Separator />

        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <Package className="h-3 w-3" />
            Tổng số lượng
          </div>
          <div className="font-semibold text-xl">
            {totalQuantity.toLocaleString("vi-VN")}
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <FileText className="h-3 w-3" />
            Số mặt hàng
          </div>
          <div className="font-semibold text-xl">{totalItems}</div>
        </div>
      </CardContent>
    </Card>
  );
}

export function TimestampsCard({
  importRecord,
  formatDate,
}: Pick<InfoCardsProps, "importRecord" | "formatDate">) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Thông tin thời gian</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-1">
          <div className="font-medium text-muted-foreground text-sm">
            Ngày tạo
          </div>
          <div className="text-sm">{formatDate(importRecord.createdAt)}</div>
        </div>
        <div className="space-y-1">
          <div className="font-medium text-muted-foreground text-sm">
            Cập nhật lần cuối
          </div>
          <div className="text-sm">{formatDate(importRecord.updatedAt)}</div>
        </div>
      </CardContent>
    </Card>
  );
}

export function TimestampsCardMobile({
  importRecord,
  formatDate,
}: Pick<InfoCardsProps, "importRecord" | "formatDate">) {
  return (
    <Card>
      <CardContent className="pt-4">
        <div className="grid grid-cols-1 gap-3 text-xs">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Ngày tạo:</span>
            <span className="font-medium">
              {formatDate(importRecord.createdAt)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Cập nhật:</span>
            <span className="font-medium">
              {formatDate(importRecord.updatedAt)}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
