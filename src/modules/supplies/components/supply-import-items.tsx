import { Package } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EnhancedTable } from "@/components/tables/enhanced-table";
import type { ResponsiveTableColumn } from "@/components/tables/responsive-table";

import type { SupplyImport } from "../types";
import { calculateCurrencyWithVat } from "@/utils/currency";

interface ItemsTableProps {
  importRecord: SupplyImport;
  formatCurrency: (amount: number) => string;
  totalQuantity: number;
  totalItems: number;
}

export function ItemsListMobile({
  importRecord,
  formatCurrency,
  totalQuantity,
  totalItems,
}: ItemsTableProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Package className="h-4 w-4" />
          Hàng hóa ({totalItems})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {importRecord.items.map((item, index) => (
          <ItemCardMobile
            key={`${item.supplyId}-${index}`}
            item={item}
            index={index}
            formatCurrency={formatCurrency}
          />
        ))}

        {/* Mobile Total */}
        <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200/60 shadow-sm">
          <CardContent className="p-4">
            <div className="flex justify-between items-center">
              <span className="font-bold text-sm text-green-800">
                Tổng cộng:
              </span>
              <div className="text-right">
                <div className="font-bold text-sm text-green-700">
                  {totalQuantity.toLocaleString("vi-VN")} sản phẩm
                </div>
                <div className="font-bold text-base text-green-600">
                  {formatCurrency(importRecord.totalAmount)}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </CardContent>
    </Card>
  );
}

function ItemCardMobile({
  item,
  index,
  formatCurrency,
}: {
  item: SupplyImport["items"][0];
  index: number;
  formatCurrency: (amount: number) => string;
}) {
  return (
    <Card className="border-l-4 border-l-primary transition-colors hover:bg-muted/50">
      <CardContent className="p-4 space-y-3">
        <div className="flex justify-between items-start">
          <div className="flex-1 min-w-0">
            <div className="font-medium text-sm leading-snug mb-1">
              {item.supplyName}
            </div>
            <div className="text-xs text-muted-foreground">{item.sku}</div>
          </div>
          <Badge variant="outline" className="ml-3 text-xs shrink-0">
            #{index + 1}
          </Badge>
        </div>
        <div className="grid grid-cols-2 gap-4 text-xs">
          <div className="space-y-1">
            <span className="text-muted-foreground block">Số lượng</span>
            <span className="font-semibold text-sm">
              {item.quantity.toLocaleString("vi-VN")}
            </span>
          </div>
          <div className="space-y-1">
            <span className="text-muted-foreground block">VAT</span>
            <span className="font-semibold text-sm">{item.vatRate}%</span>
          </div>
          <div className="space-y-1">
            <span className="text-muted-foreground block">Đơn giá</span>
            <span className="font-semibold text-sm">
              {formatCurrency(item.unitPrice)}
            </span>
          </div>
          <div className="space-y-1">
            <span className="text-muted-foreground block">Thành tiền</span>
            <span className="font-semibold text-sm text-green-600">
              {formatCurrency(item.totalPrice)}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function ItemsTableDesktop({
  importRecord,
  formatCurrency,
  totalQuantity,
  totalItems,
}: ItemsTableProps) {
  type SupplyImportItem = SupplyImport["items"][0];

  const columns: ResponsiveTableColumn<SupplyImportItem>[] = [
    {
      key: "index",
      title: "STT",
      width: 80,
      render: (_, __, index) => (
        <span className="text-sm text-muted-foreground">{index + 1}</span>
      ),
    },
    {
      key: "supplyName",
      title: "Tên hàng hóa",
      dataIndex: "supplyName",
      render: (value) => <div className="font-medium">{value as string}</div>,
    },
    {
      key: "sku",
      title: "SKU",
      dataIndex: "sku",
      width: 120,
      render: (value) => (
        <span className="text-sm text-muted-foreground">{value as string}</span>
      ),
    },
    {
      key: "quantity",
      title: "Số lượng",
      dataIndex: "quantity",
      width: 100,
      align: "right",
      render: (value) => (
        <span className="font-medium">
          {(value as number).toLocaleString("vi-VN")}
        </span>
      ),
    },
    {
      key: "unitPrice",
      title: "Đơn giá",
      dataIndex: "unitPrice",
      width: 120,
      align: "right",
      render: (value) => formatCurrency(value as number),
    },
    {
      key: "vatRate",
      title: "VAT (%)",
      dataIndex: "vatRate",
      width: 80,
      align: "right",
      render: (value) => `${value as number}%`,
    },
    {
      key: "totalPrice",
      title: "Thành tiền",
      width: 140,
      align: "right",
      render: (_, record) => (
        <span className="font-semibold text-green-600">
          {formatCurrency(
            calculateCurrencyWithVat({
              amount: record.unitPrice,
              vatRate: record.vatRate,
              quantity: record.quantity,
            })
          )}
        </span>
      ),
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5" />
          Danh sách hàng hóa ({totalItems} mặt hàng)
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <EnhancedTable<SupplyImportItem>
          dataSource={importRecord.items}
          columns={columns}
          searchable={false}
          loading={false}
          containerClassName="rounded-t-none border-l-0 !border-r-0 border-b-0"
        />
        {/* Summary Row */}
        <div className="flex justify-between items-center p-4 border-t-1 font-semibold">
          <span>Tổng cộng</span>
          <div className="flex gap-8">
            <span>
              Số lượng:{" "}
              <span className="font-bold">
                {totalQuantity.toLocaleString("vi-VN")}
              </span>
            </span>
            <span className="text-lg text-green-600 font-bold">
              {formatCurrency(importRecord.totalAmount)}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
